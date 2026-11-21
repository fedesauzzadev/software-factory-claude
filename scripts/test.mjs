#!/usr/bin/env node
// Kit self-check: structure, project install/reinstall/uninstall in a temp dir,
// brain init from the installed copy, and the board renderer.
// Usage: node scripts/test.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (...f) => readFileSync(join(root, ...f), "utf8");
const node = (...a) => execFileSync(process.execPath, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const put = (file, text) => { mkdirSync(join(file, ".."), { recursive: true }); writeFileSync(file, text); };

// 1. Structure: what the skill references must exist, and nothing points at the global config.
const skill = read("skills", "factory", "SKILL.md");
assert.match(skill, /^---\r?\nname: factory\r?\n/, "SKILL.md: name must be 'factory' (it is the /factory command)");
assert.ok(skill.includes("$ARGUMENTS"), "SKILL.md must take $ARGUMENTS");
for (const ref of new Set(skill.match(/references\/[\w-]+\.md/g)))
  assert.ok(existsSync(join(root, "skills", "factory", ref)), `SKILL.md references missing ${ref}`);
const agentFiles = readdirSync(join(root, "agents"));
const blAgents = readdirSync(join(root, "vendor", "brainloom-claude", "agents"));
for (const a of new Set(skill.match(/factory-[a-z-]+/g)))
  assert.ok(agentFiles.includes(`${a}.md`), `SKILL.md launches missing agent ${a}`);
for (const f of agentFiles) {
  const text = read("agents", f);
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? "";
  assert.equal(/^name: (.*)$/m.exec(fm)?.[1], f.replace(/\.md$/, ""), `${f}: name must match filename`);
  assert.match(fm, /^description: \S/m, `${f}: description`);
  assert.match(fm, /^model: (haiku|sonnet|opus)$/m, `${f}: model`);
  assert.ok(!text.includes("~/.claude"), `${f}: must not point at the global config`);
}
assert.ok(!skill.includes("~/.claude"), "SKILL.md must not point at the global config");
for (const f of readdirSync(join(root, "skills", "factory", "divisions")))
  for (const sec of ["## Detección", "## Énfasis por rol", "## Gates de dominio", "## DoD de dominio", "## Artefactos de dominio"])
    assert.ok(read("skills", "factory", "divisions", f).includes(sec), `divisions/${f}: falta ${sec}`);
const version = read("VERSION").trim();
assert.match(version, /^\d+\.\d+\.\d+$/, "VERSION semver");
assert.ok(read("CHANGELOG.md").includes(`[${version}]`), "CHANGELOG has the current version");
assert.ok(read("action.yml").includes("install.mjs"), "action.yml runs the installer");

// 2. Install twice over a dirty project, then uninstall.
const tmp = mkdtempSync(join(tmpdir(), "factory-test-"));
try {
  const proj = join(tmp, "proj");
  const cfg = join(proj, ".claude");
  put(join(cfg, "skills", "factory", "STALE.md"), "old version");
  put(join(cfg, "agents", "factory-old.md"), "old role");
  put(join(cfg, "agents", "other.md"), "not ours");
  put(join(cfg, "settings.json"), "{}");
  for (let n = 0; n < 2; n++) node(join(root, "install.mjs"), proj);
  assert.ok(existsSync(join(cfg, "skills", "factory", "divisions", "crm.md")), "factory skill installed");
  assert.ok(existsSync(join(cfg, "skills", "brainloom", "SKILL.md")), "brainloom skill installed");
  assert.ok(!existsSync(join(cfg, "skills", "factory", "factory")), "reinstall must not nest the skill");
  assert.ok(!existsSync(join(cfg, "skills", "factory", "STALE.md")), "stale skill file removed");
  assert.deepEqual(readdirSync(join(cfg, "agents")).sort(), [...agentFiles, ...blAgents, "other.md"].sort(),
    "agents: factory + brainloom + untouched foreign file, stale one gone");

  // 3. Phase 0 works from the installed copy (no global kit needed).
  node(join(cfg, "brainloom-claude", "init.mjs"), proj, "--lang", "es");
  assert.match(readFileSync(join(proj, "brain", "config.yaml"), "utf8"), /^language: es$/m, "brain/ created by installed init.mjs");
  assert.ok(existsSync(join(proj, "CLAUDE.md")), "CLAUDE.md created");

  // 4. Board: renders from brain/ + factory/, escapes content, reports status.
  put(join(proj, "brain", "index.md"), "## Nodes\n| id | title | type | size | status |\n|---|---|---|---|---|\n| N-0001 | <script>alert(1)</script> | feature | M | verified |\n| N-0002 | Export CSV | feature | S | planned |\n");
  put(join(proj, "brain", "decisions", "D-0001.md"), "---\nid: D-0001\ntitle: SQLite & files\n---\n");
  put(join(proj, "factory", "log.md"), "2026-11-21 10:00 · po · product.md\n2026-11-21 10:20 · qa · reporte\n");
  put(join(proj, "factory", "qa-report.md"), "Veredicto: NO-SHIP\n");
  const out = node(join(cfg, "skills", "factory", "board.mjs"), proj);
  assert.match(out, /planned 1 · in-progress 0 · implemented 0 · verified 1 · shipped 0/);
  assert.match(out, /QA: NO-SHIP/);
  assert.match(out, /Fase: 2026-11-21 10:20 · qa · reporte/);
  const html = readFileSync(join(proj, "factory", "board.html"), "utf8");
  assert.ok(!html.includes("<script>"), "board must escape node content");
  assert.ok(html.includes("&lt;script&gt;alert(1)") && html.includes("SQLite &amp; files"), "escaped content present");
  assert.throws(() => node(join(cfg, "skills", "factory", "board.mjs"), tmp), "board fails without factory/");

  node(join(root, "install.mjs"), proj, "--uninstall");
  assert.deepEqual(readdirSync(join(cfg, "agents")), ["other.md"], "only the foreign agent remains");
  assert.ok(!existsSync(join(cfg, "skills", "factory")) && !existsSync(join(cfg, "skills", "brainloom"))
    && !existsSync(join(cfg, "brainloom-claude")), "factory and brainloom removed");
  assert.ok(existsSync(join(cfg, "settings.json")) && existsSync(join(proj, "brain")) && existsSync(join(proj, "factory")),
    "project settings, brain/ and factory/ untouched");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
console.log(`OK: kit ${version} — estructura, install x2, init, board y uninstall verificados`);
