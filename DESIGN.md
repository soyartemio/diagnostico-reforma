---
version: alpha
name: GLR Executive Industrial
description: Premium industrial ERP interface for Grupo La Reforma demos.
colors:
  primary: "#102F24"
  primary-container: "#184632"
  accent: "#B98A46"
  accent-container: "#FFF4DD"
  success: "#247047"
  warning: "#A86918"
  danger: "#A82118"
  surface: "#FCFAF5"
  surface-elevated: "#FFFFFF"
  line: "#E3DDD0"
  text: "#202622"
  muted: "#65736B"
typography:
  display:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: 850
    lineHeight: 1
    letterSpacing: 0
  title:
    fontFamily: Inter
    fontSize: 1.35rem
    fontWeight: 820
    lineHeight: 1.15
    letterSpacing: 0
  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 450
    lineHeight: 1.45
    letterSpacing: 0
  label:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 850
    lineHeight: 1
    letterSpacing: 0.06em
rounded:
  sm: 8px
  md: 12px
  lg: 16px
spacing:
  xs: 6px
  sm: 10px
  md: 16px
  lg: 24px
components:
  button-primary:
    backgroundColor: "{colors.success}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
  panel:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
---

## Overview

GLR Executive Industrial debe sentirse como una cabina ejecutiva de planta: sobria, precisa, cara, sin ruido decorativo. La experiencia debe comunicar control y confianza; cada pantalla debe responder que pasa, por que importa y cual es la siguiente accion.

## Colors

El verde forestal representa permanencia, industria y madera tratada. El dorado madera es acento de accion o evidencia, no color dominante. El fondo calido evita una apariencia generica SaaS.

## Typography

Titulares fuertes, cero letter spacing negativo. Las etiquetas son compactas y tecnicas; el cuerpo debe leerse rapido en escritorio y iPhone.

## Layout

La interfaz prioriza decision sobre exploracion. Dashboard muestra brief, anomalias y KPIs. Compras muestra lista, expediente y acciones. Inventario muestra motivo, impacto y recomendacion.

## Components

Los botones de decision siempre tienen estado hover, active, focus, disabled y feedback posterior. Una decision tomada bloquea la accion y ofrece reabrir.

## Do's and Don'ts

- Do: mostrar evidencia, motivos y acciones.
- Do: hacer que cada alerta sea accionable.
- Do: usar bitacora y toast para que el sistema se sienta vivo.
- Don't: mostrar tecnologia interna al cliente.
- Don't: usar secciones de IA separadas del flujo operativo.
- Don't: depender de Excel como salida principal de informacion.
