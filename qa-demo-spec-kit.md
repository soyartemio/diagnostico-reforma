# QA Spec Kit - Demo ERP 2026

Este checklist es obligatorio antes de decir "listo" en la demo web/PWA o iOS.

## Principio

La demo no se valida solo porque compile. Se valida porque una persona puede jugarla sin explicaciones, sin estados raros y sin que la interfaz haga algo inesperado.

## Pruebas funcionales minimas

- Login demo abre el workspace.
- Dashboard carga KPIs, GLR Intelligence, radar de anomalias, alertas e inbox.
- El buscador global encuentra OC/proveedor/SKU y abre el destino correcto.
- Las notificaciones simuladas abren y cierran sin bloquear el flujo.
- Ventas muestra pedidos y cotizaciones con montos, estado y siguiente accion.
- Compras inicia sin expediente abierto.
- Tocar una OC abre su expediente debajo de la tarjeta.
- Tocar la misma OC otra vez cierra el expediente.
- Tocar otra OC cambia el expediente al nuevo contexto.
- Abrir documento muestra modal/sheet con informacion del expediente.
- Cerrar documento regresa al mismo contexto.
- Cada OC muestra checklist inteligente, score de proveedor y comparativo antes o cerca de las acciones.
- Aprobar, rechazar o pedir aclaracion cierra la OC.
- La OC decidida sale de Pendientes y aparece en Resuelto hoy.
- Aprobar una OC genera una CxP con monto, proveedor, vencimiento y origen.
- CxP refleja compromisos base mas compromisos generados durante la sesion.
- Inventario muestra SKU criticos, movimientos recientes y compras ligadas.
- La bitacora registra la accion tomada.
- El dashboard actualiza conteos despues de una decision.
- Reabrir decision regresa la OC al flujo pendiente.
- Resolver anomalia cambia su estado y actualiza el contador de abiertas.
- Reiniciar demo deja estado limpio.

## Pruebas UI/UX

- No debe haber paneles abiertos por default en Compras.
- Las acciones importantes deben tener hover/press/disabled perceptible.
- El usuario debe saber que paso despues de una accion: toast, banner, bitacora o conteo.
- En mobile, las acciones de decision deben estar al alcance sin hacer scroll excesivo.
- Los documentos deben sentirse como evidencia real, no como links genericos.
- Los modulos futuros deben verse disponibles como roadmap, pero no competir con lo playable.
- Los modulos vivos deben ser tocables sin scroll escondido en iPhone.
- Ningun texto debe cortarse, montarse o competir con botones.
- La pantalla debe poder presentarse sin explicar tecnologia interna.

## Pruebas tecnicas

- `node --check demo-app/app.js`
- QA en navegador: abrir/cerrar OC, aprobacion, resuelto hoy, CxP generada, ventas, inventario, bitacora, anomalia.
- Build iOS en simulador con XcodeBuildMCP.
- Revisar captura final web y mobile/iOS.

## Definition of Done

Una entrega esta lista solo si cumple estas cuatro condiciones:

1. Compila.
2. El flujo principal se probo como usuario final.
3. La UI comunica estados sin explicacion verbal.
4. Cualquier cambio queda documentado con que se probo y que riesgo queda.

## Registro de ultima pasada

- Web: se valido login, apertura/cierre de OC, aprobacion, movimiento a "Resuelto hoy", generacion de `CXP-260517-084`, Ventas con 3 pedidos/3 cotizaciones e Inventario con 4 SKU/3 movimientos/3 compras ligadas.
- iOS: se valido build/run en iPhone 17 Pro, compras cerradas por default, apertura/cierre de OC, aprobacion y CxP generada visible.
- Evidencia visual: `outputs/glr-web-cxp-approved.png` y `outputs/glr-ios-cxp-approved.jpg`.
