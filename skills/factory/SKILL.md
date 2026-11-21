---
name: factory
description: Software factory autónoma sobre brainloom-claude. Usala cuando el usuario (el Negocio) entrega un requerimiento para construirlo end-to-end — PO, Tech Lead, Dev y QA como subagents — con una sola pausa, la review gate. Sin argumentos muestra el estado del proyecto actual.
argument-hint: "[requerimiento]"
---

# Software Factory

Requerimiento del Negocio (literal): $ARGUMENTS

El usuario es el **Negocio**. Vos orquestás la fábrica: encadenás roles, no hacés su trabajo. Todo vive en `.claude/` de este proyecto; nada global.

## Reglas
1. El Negocio interviene solo en la **review gate** (Fase 5).
2. Nada está hecho sin un comando corrido y su resultado observado (`implemented` ≠ `verified`).
3. Nadie se frena: anti-bloqueo (Fase 3).
4. **Presupuesto de contexto**: los roles escriben archivos y te devuelven ≤8 líneas. No releas lo que produjeron, no lo reescribas, no narres. Armá la gate con lo que te devolvieron.
5. Handoff a cada rol, y nada más (su carta ya está en su agent):
   `Proyecto: <ruta absoluta>. Entrada: <archivos>. Salida: <archivo>.` + `División: factory/division.md` si existe.
6. Al cerrar cada fase, una línea en `factory/log.md`: `AAAA-MM-DD HH:MM · <rol> · <qué entregó>` (append con shell, sin releer el archivo).

## Entrada
- **Sin requerimiento y existe `factory/`** → estado: `node .claude/skills/factory/board.mjs .`, reportá su salida y pará.
- **Sin requerimiento y sin `factory/`** → pedilo en una línea.
- **Con requerimiento y ya existe `factory/`** → es un delta. Ruteá según el `CLAUDE.md` del proyecto: refinado o S → hacelo directo, sin fábrica; M → un slice (Fase 3 → 4 → 5); L → desde Fase 2.
- **Con requerimiento, proyecto nuevo** → Fase 0.

## Fase 0 — Intake (vos, sin subagent)
1. Sin `brain/`: `node .claude/brainloom-claude/init.mjs . --lang es` (script, cero tokens). Código existente desconocido de más de 3 archivos: un `scout`, y su resumen va al intake.
2. `factory/intake.md`, ≤15 líneas: objetivo, usuarios, éxito observable, stack (impuesto o sugerido), constraints, ¿tiene UI?, dominio.
3. **Tamaño de corrida**:
   - **Lite** — una historia clara, sin contratos compartidos ni UI nueva: saltá Fases 1 y 2. Creá el nodo con sus criterios y construilo vos con la skill `brainloom`; después Fase 4 y 5.
   - **Full** — todo lo demás: Fases 1 a 5.
4. **División**: solo si el dominio exige estándares propios (dinero, salud, datos personales, ventas, juegos…) → seguí `references/divisions.md`. Sin dominio claro, no fuerces nada.

## Fase 1 — PO (`factory-po`)
Entrada: `factory/intake.md`. Salida: `factory/product.md` (spec + backlog con corte MVP ≤4 historias + roadmap) y nodos `planned` en el brain.

## Fase 2 — Tech Lead (`factory-tech-lead`)
Entrada: intake + product. Salida: `factory/plan.md` (stack, arquitectura, NFRs, slices S01…), decisiones en `brain/decisions/`, comandos en `brain/config.yaml`.
Si hay UI: `factory-design` UNA vez, antes del primer slice con interfaz → `factory/design.md`. Sin UI no se lanza.

## Fase 3 — Build (`factory-dev`, un slice por vez, secuencial)
Entrada: `factory/plan.md` + los nodos del slice. El dev sigue el flujo de la skill `brainloom`.
**Anti-bloqueo**: el dev devuelve `BLOCKED` tras 3 intentos con enfoques distintos → `factory-tech-lead` en modo desbloqueo, una vez → dev retoma. Si tampoco sale: el slice se degrada a lo verificable y el gap va a la gate como deuda explícita. Nunca se esconde.

## Fase 4 — QA (`factory-qa`, una vez sobre todo el MVP)
Salida: `factory/qa-report.md` con veredicto SHIP / NO-SHIP. Hallazgo crítico → `factory-dev` lo arregla → QA re-verifica SOLO lo que falló. Máximo 2 rondas; lo que persista va a la gate como riesgo.

## Fase 5 — Review gate — STOP
`node .claude/skills/factory/board.mjs .` (genera `factory/board.html`, cero tokens). Presentale al Negocio, compacto:
1. **MVP**: qué hace + comandos exactos para probarlo.
2. **Verificación**: veredicto de QA, tests, riesgos y deuda explícita.
3. **Roadmap** V1/V2.
4. **Decisiones** numeradas, cada una con tu recomendación (incluí promover la división si fue sintetizada y rindió).
5. Ruta de `factory/board.html`.

**No continúes sin aprobación explícita.** Aprobado → siguiente slice o entrega (Fase 3). Rechazado → ajustá lo pedido, repetí Fase 4 y volvé acá.
