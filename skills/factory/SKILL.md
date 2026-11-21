---
name: factory
description: Software factory autónoma sobre brainloom-claude. Usala cuando el usuario (el Negocio) entrega un requerimiento para construirlo end-to-end — PO, Tech Lead, Dev y QA como subagents — con una sola pausa, la review gate. Sin argumentos muestra el estado del proyecto actual.
argument-hint: "[requerimiento]"
---

# Software Factory

Requerimiento del Negocio (literal): $ARGUMENTS

El usuario es el **Negocio**. Vos orquestás: encadenás roles, no hacés su trabajo. Todo vive en `.claude/` de este proyecto.

## Reglas
1. El Negocio interviene solo en la **review gate**.
2. Nada está hecho sin un comando corrido y su resultado observado (`implemented` ≠ `verified`).
3. **Tu contexto es el más caro de la fábrica.** No leas código ni artefactos, no construyas, no verifiques: eso es de los roles. Armá la gate con lo que te devolvieron (≤6 líneas cada uno).
4. **Un mensaje por fase**: la línea de log de la fase que terminó y el lanzamiento del rol siguiente van en el MISMO mensaje, en paralelo.
5. Handoff, y nada más (la carta del rol ya está en su agent):
   `Proyecto: <ruta absoluta>. Corrida: <Lite|Full>. Entrada: <archivos>. Salida: <archivo>.`
6. Log: `factory/log.md`, una línea por fase, append con shell: `AAAA-MM-DD HH:MM · <rol> · <qué entregó>`.
7. Los agents fijan su modelo. Única excepción: lanzá al Tech Lead con `model: opus` si hay algo irreversible (migración de datos, contrato público).

## Entrada
- **Sin requerimiento y existe `factory/`** → `node .claude/skills/factory/board.mjs .`, reportá su salida y pará.
- **Sin requerimiento y sin `factory/`** → pedilo en una línea.
- **Con requerimiento y ya existe `factory/`** → es un delta. Refinado o S (según el `CLAUDE.md` del proyecto) → directo, sin fábrica. Si no → corrida Lite o Full sobre el delta.
- **Con requerimiento, proyecto nuevo** → Fase 0.

## Fase 0 — Intake (vos, un solo mensaje)
1. Sin `brain/`: `node .claude/brainloom-claude/init.mjs . --lang es`. Código existente desconocido de más de 3 archivos: un `scout`, y su resumen va al intake.
2. `factory/intake.md`, ≤12 líneas: objetivo, usuarios, éxito observable, stack (impuesto o sugerido), constraints, UI sí/no, `Dominio:` (dinero, salud, datos personales, ventas, juegos… o `ninguno`), `Corrida:`.
3. **Corrida**:
   - **Lite** (por defecto): entra en un slice — sin UI nueva, sin contratos compartidos con código existente, nada irreversible. `PO → Dev → QA → gate`. Sin Tech Lead.
   - **Full**: cualquiera de esas condiciones. `PO → Tech Lead (→ Design si hay UI) → Dev por slice → QA → gate`.
   - En duda → Lite. Si el Dev devuelve `SPLIT`, pasá a Full: Tech Lead y después Dev por slice.

## Roles
| Fase | Agent | Entrada | Salida |
|---|---|---|---|
| PO | `factory-po` | `factory/intake.md` | `factory/product.md`, nodos `planned`, y `factory/division.md` si el intake nombra un dominio |
| Tech Lead (Full) | `factory-tech-lead` | intake + product | `factory/plan.md`, decisiones, comandos |
| Design (Full, con UI, una vez) | `factory-design` | intake + product + plan | `factory/design.md` |
| Dev | `factory-dev` | nodos del slice (+ `factory/plan.md` en Full) | código, tests, nodos `verified` |
| QA (una vez sobre todo el MVP) | `factory-qa` | nodos del MVP | `factory/qa-report.md`: SHIP / NO-SHIP |

**Anti-bloqueo**: el Dev devuelve `BLOCKED` tras 3 intentos distintos → `factory-tech-lead` en modo desbloqueo, una vez → Dev retoma. Si tampoco sale: se degrada a lo verificable y el gap va a la gate como deuda explícita.
**NO-SHIP**: `factory-dev` arregla los críticos → QA re-verifica SOLO eso. Máximo 2 rondas; lo que persista va a la gate como riesgo.

## Review gate — STOP
`node .claude/skills/factory/board.mjs .` (genera `factory/board.html`, cero tokens). Presentale al Negocio, compacto:
1. **MVP**: qué hace + comandos exactos para probarlo.
2. **Verificación**: veredicto de QA, tests, riesgos y deuda explícita.
3. **Roadmap** V1/V2.
4. **Decisiones** numeradas, cada una con tu recomendación. Si la división fue sintetizada y rindió: proponé guardarla en `divisions/` del kit.
5. Ruta de `factory/board.html`.

**No continúes sin aprobación explícita.** Aprobado → siguiente entrega. Rechazado → ajustá lo pedido, repetí QA y volvé acá.
