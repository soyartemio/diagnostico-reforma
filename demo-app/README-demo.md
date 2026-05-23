# Demo ERP 2026 - Grupo La Reforma

Demo web/PWA para presentar compras, direccion, inventario, facturacion, CxC, CxP, bancos e inteligencia operativa con datos ficticios.

## Que muestra

- Login demo sin backend.
- Dashboard ejecutivo con ventas, compras, CxC, CxP, inventario y cumplimiento.
- Buscador global para encontrar OC, proveedor o SKU y brincar directo al expediente.
- Bandeja "Hoy requiere atencion" con acciones ejecutivas.
- KPIs expandibles con motivos, detalle y accion sugerida.
- Modulo de ventas con pedidos vivos, cotizaciones activas, montos, margen, riesgo y relacion con inventario.
- Motor operativo simulado de 3 meses en `simulation-core.js`: ventas, inventario, facturas, CxC, CxP, bancos, alertas y KPIs salen de la misma base semilla.
- Inbox de compras por aprobar.
- Detalle de orden de compra con monto, proveedor, variacion historica, documentos y timeline.
- Checklist inteligente, score de proveedor y comparativo de cotizaciones dentro de cada OC.
- Cotizaciones, comparativos y fichas tecnicas simuladas en modal.
- Notificaciones operativas para saltar a compras, inventario o CxP.
- Acciones de aprobacion: aprobar, rechazar o pedir aclaracion.
- Al tomar una decision, la OC se cierra, sale de pendientes, entra a "Resuelto hoy" y queda registrada en bitacora.
- Si la decision es aprobacion, el sistema genera una CxP visible con proveedor, monto, vencimiento y origen.
- CxC permite registrar cobros simulados; el saldo se cierra y aparece entrada en Bancos.
- CxP permite registrar pagos simulados; el compromiso baja y aparece salida en Bancos.
- Ventas permite ganar una cotizacion; eso crea pedido, reserva inventario y genera factura pendiente.
- Embarques muestra pedidos con inventario reservado, checklist de evidencia y salida fisica.
- Liberar embarque convierte la reserva en salida real de inventario.
- Facturacion muestra pedido, CFDI simulado, UUID demo, IVA y saldo ligado a CxC.
- Facturacion permite timbrar CFDI simulado; eso habilita la CxC para cobro.
- Bancos muestra saldos y movimientos derivados de cobros/pagos.
- El expediente se abre debajo de la tarjeta seleccionada para evitar saltos y mantener el contexto, tanto en web como en iPhone.
- Inventario critico con motivos, impacto, movimientos recientes y compras ligadas.
- Modulos CxP, CxC, Facturacion y Bancos conectados por la simulacion operativa.
- Arbor Intelligence integrado dentro del sistema: brief ejecutivo, riesgo automatico, mensaje a proveedor, inventario predictivo, documentos faltantes, radar de anomalias y bitacora.

## Criterios UX aplicados

- Estado inicial cerrado: compras no abre ningun expediente hasta que el usuario toca una OC.
- Flujo jugable: ganar cotizacion, generar pedido, reservar inventario, preparar/liberar embarque, timbrar CFDI, cobrar CxC, aprobar/rechazar compras, generar/pagar CxP, ver bancos, reabrir decision, resolver anomalias y abrir documentos.
- Feedback inmediato: toast, banner "Listo", conteos actualizados y bitacora.
- Demo premium: documentos tipo expediente, hover/press en botones, barra de decision sticky en mobile y modulos futuros visibles pero tenues.
- Navegacion iOS con menu hamburguesa y accesos inferiores para que los modulos vivos esten disponibles sin saturar la pantalla.

## QA reciente

- Web: login, Compras, abrir/cerrar OC con segundo click, aprobar OC, mover a "Resuelto hoy", generar `CXP-260517-084`, pagar CxP, ganar `COT-260517-410`, generar `PV-260517-410`, preparar/liberar `EMB-260517-410`, timbrar `FAC-260517-410`, cobrar `CXC-260517-410`, validar Facturacion, Embarques, CxC y Bancos.
- Motor: `node demo-app/simulation-core.test.cjs` valida aprobacion de OC, generacion de CxP, entrada programada a inventario, ganar cotizacion, reserva de venta, liberacion de embarque, salida real de inventario, timbrado CFDI, cobro CxC y movimiento bancario.
- Mobile web: viewport 390x844 con menu hamburguesa, Ventas y Embarques accesibles.
- iOS: build/run en simulador iPhone 17 Pro, Compras cerrada por default, abrir/cerrar OC, aprobar y verificar `CXP-260517-084` en CxP; Ventas permite ganar cotizacion, preparar/liberar embarque y ver inventario fisico/reservado/disponible.
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
- Arbor Intelligence es simulado/local para evitar fallas durante la presentacion.
- CFDI, PAC, nube productiva e integracion real quedan fuera de esta demo.
