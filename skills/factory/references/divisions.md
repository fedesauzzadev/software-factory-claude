# Divisiones — especialización por dominio

Una división suma estándares de dominio al workflow; nunca reemplaza reglas, evidencia ni la gate.

1. **Caché**: si existe `.claude/skills/factory/divisions/<dominio>.md`, copiala a `factory/division.md` y ajustá sus gates al intake.
2. **Síntesis**: dominio claro sin caché → escribí `factory/division.md`, ≤30 líneas, con el formato de abajo.
3. Sin dominio claro → nada.

Los roles reciben `División: factory/division.md` en el handoff: PO y Tech Lead aplican sus énfasis, QA suma sus gates y DoD al veredicto.

## Formato
```markdown
# División <nombre>
## Detección
- Señales del intake que la activan.
## Énfasis por rol
- Qué cambia para PO, Tech Lead y QA.
## Gates de dominio
- Verificaciones obligatorias para SHIP, cada una comprobable con un comando o un dato.
## DoD de dominio
- Agregados al DoD vendible.
## Artefactos de dominio
- Archivos extra y quién los escribe.
```

## Promoción
División sintetizada que llegó a SHIP y aportó → proponé en la gate guardarla como `divisions/<dominio>.md` en el repo del kit (reinstalar la publica). Solo con aprobación del Negocio.
