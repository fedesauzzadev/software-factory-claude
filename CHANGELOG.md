# Changelog

## [0.5.0] — 2026-11-21

### Cambió
- **Nodos por script**: el PO escribe solo `factory/product.md` (y la división) y corre `nodes.mjs`, que crea un nodo por historia MVP y sus filas en `brain/index.md`. Antes escribía cada nodo a mano.

## [0.4.0] — 2026-11-21

Optimización de consumo a partir de las cifras de la primera corrida (274 mil tokens de subagents, 78 % en el Dev).

### Cambió
- **Dev con herramientas acotadas**: sin lista heredaba todas las de la sesión y arrancaba con un contexto enorme. El test ahora exige `tools:` en todo agent.
- **Corrida Lite por defecto**: `PO → Dev → QA → gate`, sin Tech Lead, para todo lo que entra en un slice. El Dev devuelve `SPLIT` si no entra y ahí se pasa a Full.
- **Menos lanzamientos de Dev**: en Full el Tech Lead parte en slices solo si el MVP no entra en `limits`.
- **Modelos**: Tech Lead en sonnet (opus solo ante algo irreversible). El PO se probó en haiku y se descartó: 41.341 tokens y 119 s contra 16.274 y 75 s en sonnet para la misma tarea.
- **Medido** con el mismo pedido de la demo: 96.618 tokens en 3 lanzamientos (con el PO todavía en haiku) contra 273.622 en 6 de la versión 0.3.
- **Menos turnos**: cada rol lee todo en un mensaje y escribe en otro; el orquestador hace un mensaje por fase y no lee artefactos.
- El PO escribe la división de dominio; se quitó `references/divisions.md`. El Dev ya no lee la skill de brainloom: sus pasos están en su carta.

## [0.3.0] — 2026-11-21

### Agregado
- **Primera corrida real** de `/factory`, completa hasta la review gate: `examples/demo-gastos/` (intake, división sintetizada, producto, plan, 3 slices, QA con veredicto SHIP). Confirma que `$ARGUMENTS` llega a la skill y que los roles encadenan.
- README con diagrama del flujo, la demo y la captura del tablero (`docs/board.png`).

## [0.2.0] — 2026-11-21

### Cambió
- **Instalación por proyecto**: `node install.mjs <proyecto>` escribe solo en `<proyecto>/.claude/`; ya no toca `~/.claude`. Todas las rutas de la skill y los agents son locales.
- **brainloom-claude encapsulado**: copia en `vendor/brainloom-claude/` (snapshot local del 2026-11-21, sin versión publicada). Se instala su skill, sus agents y `init.mjs` + templates en `.claude/brainloom-claude/`.

### Agregado
- `action.yml`: GitHub Action composite que corre el instalador.
- `examples/install-factory.yml`: workflow manual que instala o actualiza y commitea `.claude/`.

## [0.1.0] — 2026-11-21

Reescritura de `software-factory` 0.5.0 (OpenCode) para Claude Code sobre brainloom-claude.

### Cambió
- **Plataforma**: skill `/factory` + subagents `factory-*` en `~/.claude`, con modelo fijado por rol.
- **brainloom-claude como dependencia**, no vendido: `init.mjs` crea el `brain/` sin tokens.
- **Roles 8 → 5**: PO, Tech Lead, Dev, QA y Design (UX + diseñadora, solo con UI, define y no implementa).
- **Tablero por script** (`board.mjs`): reemplaza dashboard y oficina generados por el modelo; escapa el contenido de forma determinista.
- **Corrida Lite** y ruteo de deltas por tamaño.
- **Un instalador** (`install.mjs`) que limpia antes de copiar: corrige el anidado y los archivos viejos al reinstalar.
- **Un test** (`scripts/test.mjs`) que ejercita install x2, board y uninstall, en lugar de chequear solo presencia de archivos.

### Se quitó
- Scrum Master (`sprints.md` era derivable del brain), oficina visual, scorecard.
- División GameDev y el rol Artist: dependían de skills de juego de OpenCode. La síntesis de divisiones cubre el dominio.
- Mapa de skills por rol en las divisiones, refuter, bootstrap `curl | bash`, instaladores `.sh` / `.ps1`.
