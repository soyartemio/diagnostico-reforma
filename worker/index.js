/**
 * Cloudflare Worker - Diagnóstico Operativo
 * Grupo La Reforma / Forestal La Reforma
 *
 * Rutas:
 *  POST /save   - Guarda/actualiza respuestas del diagnóstico
 *  GET  /export - Exporta datos en Markdown (requiere password)
 *  POST /session - Crea / actualiza metadata de sesión
 */

const ADMIN_PASSWORD = "Soberania2026";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password, X-Session-ID",
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/save" && request.method === "POST") {
        return await handleSave(request, env);
      } else if (path === "/session" && request.method === "POST") {
        return await handleSession(request, env);
      } else if (path === "/export" && request.method === "GET") {
        return await handleExport(request, env);
      } else if (path === "/health" && request.method === "GET") {
        return jsonResponse({ status: "ok", timestamp: new Date().toISOString() });
      } else {
        return jsonResponse({ error: "Not found" }, 404);
      }
    } catch (err) {
      console.error("Worker error:", err);
      return jsonResponse({ error: "Internal server error", details: err.message }, 500);
    }
  },
};

/**
 * POST /save
 * Body: { user_session, respuestas: [{ pregunta_id, seccion, pregunta_texto, respuesta }] }
 */
async function handleSave(request, env) {
  const body = await request.json();
  const { user_session, respuestas } = body;

  if (!user_session || !Array.isArray(respuestas)) {
    return jsonResponse({ error: "Datos inválidos. Se requiere user_session y respuestas[]." }, 400);
  }

  const now = new Date().toISOString();
  const statements = respuestas.map((r) => {
    return env.DB.prepare(`
      INSERT INTO diagnosticos (user_session, timestamp, seccion, pregunta_id, pregunta_texto, respuesta, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_session, pregunta_id)
      DO UPDATE SET
        respuesta = excluded.respuesta,
        pregunta_texto = excluded.pregunta_texto,
        updated_at = excluded.updated_at
    `).bind(
      user_session,
      now,
      r.seccion || "General",
      r.pregunta_id,
      r.pregunta_texto || "",
      r.respuesta || "",
      now
    );
  });

  await env.DB.batch(statements);

  return jsonResponse({
    success: true,
    message: `${respuestas.length} respuestas guardadas.`,
    user_session,
    timestamp: now,
  });
}

/**
 * POST /session
 * Body: { user_session, nombre_participante, rol, area }
 */
async function handleSession(request, env) {
  const body = await request.json();
  const { user_session, nombre_participante, rol, area } = body;

  if (!user_session) {
    return jsonResponse({ error: "user_session es requerido." }, 400);
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO sesiones (user_session, nombre_participante, rol, area, timestamp_inicio, timestamp_ultimo_guardado)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_session)
    DO UPDATE SET
      nombre_participante = excluded.nombre_participante,
      rol = excluded.rol,
      area = excluded.area,
      timestamp_ultimo_guardado = excluded.timestamp_ultimo_guardado
  `).bind(user_session, nombre_participante || "", rol || "", area || "", now, now).run();

  return jsonResponse({ success: true, user_session });
}

/**
 * GET /export?password=Soberania2026
 * Devuelve todos los diagnósticos en formato Markdown
 */
async function handleExport(request, env) {
  const url = new URL(request.url);
  const password = url.searchParams.get("password") || request.headers.get("X-Admin-Password");

  if (password !== ADMIN_PASSWORD) {
    return jsonResponse({ error: "No autorizado. Password incorrecto." }, 401);
  }

  // Obtener todas las sesiones
  const sesionesResult = await env.DB.prepare(`
    SELECT * FROM sesiones ORDER BY timestamp_inicio DESC
  `).all();

  // Obtener todas las respuestas
  const respuestasResult = await env.DB.prepare(`
    SELECT d.*, s.nombre_participante, s.rol, s.area
    FROM diagnosticos d
    LEFT JOIN sesiones s ON d.user_session = s.user_session
    ORDER BY d.user_session, d.seccion, d.pregunta_id
  `).all();

  const markdown = buildMarkdownReport(sesionesResult.results, respuestasResult.results);

  return new Response(markdown, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="diagnostico-reforma-${Date.now()}.md"`,
    },
  });
}

/**
 * Construye el reporte en Markdown para que Artemio lo procese
 */
function buildMarkdownReport(sesiones, respuestas) {
  const now = new Date().toLocaleString("es-MX", { timeZone: "America/Monterrey" });

  let md = `# 📊 Reporte Master: Diagnóstico Operativo\n`;
  md += `**Empresa:** Grupo La Reforma / Forestal La Reforma\n`;
  md += `**Generado:** ${now} (Hora Monterrey)\n`;
  md += `**Total Sesiones:** ${sesiones.length}\n`;
  md += `**Total Respuestas:** ${respuestas.length}\n\n`;
  md += `---\n\n`;

  // Agrupar respuestas por sesión
  const bySession = {};
  for (const r of respuestas) {
    if (!bySession[r.user_session]) bySession[r.user_session] = [];
    bySession[r.user_session].push(r);
  }

  for (const sesion of sesiones) {
    const sId = sesion.user_session;
    const sRespuestas = bySession[sId] || [];

    md += `## 👤 Participante: ${sesion.nombre_participante || "Anónimo"}\n`;
    md += `- **Rol:** ${sesion.rol || "No especificado"}\n`;
    md += `- **Área:** ${sesion.area || "No especificada"}\n`;
    md += `- **Sesión ID:** \`${sId}\`\n`;
    md += `- **Inicio:** ${sesion.timestamp_inicio}\n`;
    md += `- **Último guardado:** ${sesion.timestamp_ultimo_guardado}\n\n`;

    // Agrupar por sección
    const bySec = {};
    for (const r of sRespuestas) {
      if (!bySec[r.seccion]) bySec[r.seccion] = [];
      bySec[r.seccion].push(r);
    }

    for (const [sec, items] of Object.entries(bySec)) {
      md += `### 📁 Sección: ${sec}\n\n`;
      for (const item of items) {
        md += `**${item.pregunta_texto || item.pregunta_id}**\n`;
        md += `> ${item.respuesta || "_Sin respuesta_"}\n\n`;
      }
    }

    md += `---\n\n`;
  }

  // Resumen agregado por pregunta
  md += `## 🔍 Análisis Agregado por Pregunta\n\n`;
  const byPregunta = {};
  for (const r of respuestas) {
    if (!byPregunta[r.pregunta_id]) {
      byPregunta[r.pregunta_id] = { texto: r.pregunta_texto, respuestas: [] };
    }
    byPregunta[r.pregunta_id].respuestas.push({
      participante: r.nombre_participante,
      respuesta: r.respuesta,
    });
  }

  for (const [pid, data] of Object.entries(byPregunta)) {
    md += `### ${data.texto || pid}\n\n`;
    for (const resp of data.respuestas) {
      md += `- **${resp.participante || "Anónimo"}:** ${resp.respuesta || "_Sin respuesta_"}\n`;
    }
    md += `\n`;
  }

  md += `\n---\n*Reporte generado automáticamente por el sistema de diagnóstico operativo.*\n`;
  md += `*Procesado por Artemio | Antigravity AI System*\n`;

  return md;
}

// Utilidades
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
