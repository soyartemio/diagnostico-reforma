# Demo ERP 2026 - Grupo La Reforma

Demo web/PWA para presentar compras, direccion, inventario e inteligencia operativa con datos ficticios.

## Que muestra

- Login demo sin backend.
- Dashboard ejecutivo con ventas, compras, CxC, CxP, inventario y cumplimiento.
- Buscador global para encontrar OC, proveedor o SKU y brincar directo al expediente.
- Bandeja "Hoy requiere atencion" con acciones ejecutivas.
- KPIs expandibles con motivos, detalle y accion sugerida.
- Modulo de ventas con pedidos vivos, cotizaciones activas, montos, margen, riesgo y relacion con inventario.
- Inbox de compras por aprobar.
- Detalle de orden de compra con monto, proveedor, variacion historica, documentos y timeline.
- Checklist inteligente, score de proveedor y comparativo de cotizaciones dentro de cada OC.
- Cotizaciones, comparativos y fichas tecnicas simuladas en modal.
- Notificaciones operativas para saltar a compras, inventario o CxP.
- Acciones de aprobacion: aprobar, rechazar o pedir aclaracion.
- Al tomar una decision, la OC se cierra, sale de pendientes, entra a "Resuelto hoy" y queda registrada en bitacora.
- Si la decision es aprobacion, el sistema genera una CxP visible con proveedor, monto, vencimiento y origen.
- El expediente se abre debajo de la tarjeta seleccionada para evitar saltos y mantener el contexto, tanto en web como en iPhone.
- Inventario critico con motivos, impacto, movimientos recientes y compras ligadas.
- Modulo CxP con compromisos por programar y flujo de 7 dias.
- GLR Intelligence integrado dentro del sistema: brief ejecutivo, riesgo automatico, mensaje a proveedor, inventario predictivo, documentos faltantes, radar de anomalias y bitacora.

## Criterios UX aplicados

- Estado inicial cerrado: compras no abre ningun expediente hasta que el usuario toca una OC.
- Flujo jugable: aprobar, rechazar, pedir aclaracion, generar CxP, reabrir decision, resolver anomalias y abrir documentos.
- Feedback inmediato: toast, banner "Listo", conteos actualizados y bitacora.
- Demo premium: documentos tipo expediente, hover/press en botones, barra de decision sticky en mobile y modulos futuros visibles pero tenues.
- Navegacion iOS en grid compacto para que Dashboard, Ventas, Compras, Inventario y CxP esten siempre al alcance.

## QA reciente

- Web: login, Compras, abrir/cerrar OC con segundo click, aprobar OC, mover a "Resuelto hoy", generar `CXP-260517-084`, revisar Ventas e Inventario.
- iOS: build/run en simulador iPhone 17 Pro, Compras cerrada por default, abrir/cerrar OC, aprobar y verificar `CXP-260517-084` en CxP.
- Capturas: `outputs/glr-web-cxp-approved.png` y `outputs/glr-ios-cxp-approved.jpg`.

## Como correr local

Desde este folder:

```bash
python3 -m http.server 5173
```

Abrir:

```text
http://localhost:5173
```

## Cloudflare Pages

Opcion manual rapida:

1. Entrar a Cloudflare Dashboard.
2. Pages > Create project.
3. Subir carpeta `demo-app` como deploy directo o conectar repo GitHub.
4. Build command: dejar vacio.
5. Build output directory: `/` si se sube la carpeta directamente, o `demo-app` si se conecta el repo completo.

Opcion por GitHub:

1. Subir este repo a GitHub.
2. Crear Cloudflare Pages conectado al repo.
3. Framework preset: None.
4. Build command: vacio.
5. Output directory: `demo-app`.

Opcion Wrangler si hay token:

```bash
CLOUDFLARE_API_TOKEN=... npx wrangler pages deploy demo-app --project-name reforma-erp-2026-demo
```

En este equipo el intento automatico quedo bloqueado porque Wrangler requiere `CLOUDFLARE_API_TOKEN` en entornos no interactivos.

## Notas de seguridad

- No usa datos reales.
- No usa credenciales reales.
- No se conecta a ningun sistema real.
- GLR Intelligence es simulado/local para evitar fallas durante la presentacion.
- CFDI, PAC, nube productiva e integracion real quedan fuera de esta demo.
