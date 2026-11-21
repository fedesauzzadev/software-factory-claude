#!/usr/bin/env node
// Installs (or removes) the software factory inside ONE project: <project>/.claude.
// Usage: node install.mjs [project-dir] [--uninstall]     (project-dir defaults to the cwd)
// Nothing is written to ~/.claude. Owned paths are wiped before copying, so
// reinstalling never nests folders or leaves files from an older version.
// Owned: skills/factory, skills/brainloom, brainloom-claude/, agents/factory-*.md
// and the brainloom agents (planner, scout, verifier).
import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const project = resolve(args.find((a) => !a.startsWith("--")) ?? ".");
if (!existsSync(project)) { console.error(`No existe el proyecto: ${project}`); process.exit(2); }
const root = fileURLToPath(new URL(".", import.meta.url));
const bl = join(root, "vendor", "brainloom-claude");
const claude = join(project, ".claude");
const agents = join(claude, "agents");
const blAgents = readdirSync(join(bl, "agents"));

for (const d of ["skills/factory", "skills/brainloom", "brainloom-claude"])
  rmSync(join(claude, d), { recursive: true, force: true });
if (existsSync(agents))
  for (const f of readdirSync(agents))
    if (/^factory-.*\.md$/.test(f) || blAgents.includes(f)) rmSync(join(agents, f));

if (args.includes("--uninstall")) {
  console.log(`Software factory desinstalada de ${claude}. brain/ y factory/ del proyecto no se tocan.`);
  process.exit(0);
}

cpSync(join(root, "skills", "factory"), join(claude, "skills", "factory"), { recursive: true });
cpSync(join(bl, "skills", "brainloom"), join(claude, "skills", "brainloom"), { recursive: true });
cpSync(join(root, "agents"), agents, { recursive: true });
cpSync(join(bl, "agents"), agents, { recursive: true });
for (const f of ["init.mjs", "templates", "scripts", "LICENSE"])
  cpSync(join(bl, f), join(claude, "brainloom-claude", f), { recursive: true });

console.log(`Instalado en ${claude}: skill /factory, agents factory-*, y brainloom-claude (skill, agents, init).`);
console.log("Abrí una sesión nueva de Claude Code en el proyecto y usá: /factory <requerimiento>");
