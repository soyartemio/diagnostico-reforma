-- Cloudflare D1 Schema para Diagnóstico Operativo
-- Grupo La Reforma / Forestal La Reforma

CREATE TABLE IF NOT EXISTS diagnosticos (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_session TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  seccion TEXT NOT NULL,
  pregunta_id TEXT NOT NULL,
  pregunta_texto TEXT,
  respuesta TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_session, pregunta_id)
);

-- Índice para consultas por sesión
CREATE INDEX IF NOT EXISTS idx_user_session ON diagnosticos (user_session);

-- Índice para consultas por sección
CREATE INDEX IF NOT EXISTS idx_seccion ON diagnosticos (seccion);

-- Tabla de sesiones para metadata del diagnóstico
CREATE TABLE IF NOT EXISTS sesiones (
  user_session TEXT PRIMARY KEY,
  nombre_participante TEXT,
  rol TEXT,
  area TEXT,
  timestamp_inicio TEXT NOT NULL DEFAULT (datetime('now')),
  timestamp_ultimo_guardado TEXT NOT NULL DEFAULT (datetime('now')),
  completado INTEGER DEFAULT 0
);
