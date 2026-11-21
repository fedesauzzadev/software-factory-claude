#!/usr/bin/env node
// Creates one brain node per MVP story from the backlog table in factory/product.md.
// Zero LLM tokens: the PO writes the table once and runs this instead of writing each node.
// Usage: node nodes.mjs [project-dir]
// Backlog row: | H-01 | historia | criterio 1<br>criterio 2 | valor | S/M/L |
// Rows below the "CORTE MVP" row are ignored. Stories already in brain/index.md are skipped.
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const p = resolve(process.argv[2] ?? ".");
const read = (...f) => readFileSync(join(p, ...f), "utf8");
const template = read("brain", "node.md");
let index = read("brain", "index.md");

// shortcut: a literal "|" inside a cell breaks the row; escape support if a backlog ever needs it.
const stories = [];
for (const line of read("factory", "product.md").split(/\r?\n/)) {
  if (/CORTE MVP/i.test(line)) break;
  const c = line.split("|").map((x) => x.trim());
  if (!/^H-\d+$/.test(c[1] ?? "")) continue;
  const criteria = (c[3] ?? "").split(/<br\s*\/?>/i).map((x) => x.replace(/^[-*\s]+/, "").trim()).filter(Boolean);
  if (!criteria.length) { console.error(`${c[1]}: sin criterios de aceptación, no entra`); process.exit(1); }
  stories.push({ h: c[1], story: c[2], criteria, size: /^[SML]$/.test(c[5] ?? "") ? c[5] : "M" });
}
if (!stories.length) { console.error("No hay historias H-XX sobre el corte MVP en factory/product.md"); process.exit(1); }

const dir = join(p, "brain", "nodes");
mkdirSync(dir, { recursive: true });
let next = Math.max(0, ...readdirSync(dir).map((f) => Number(/^N-(\d+)/.exec(f)?.[1] ?? 0))) + 1;
const today = new Date().toISOString().slice(0, 10);

for (const s of stories) {
  if (index.includes(`(${s.h})`)) { console.log(`${s.h} ya tiene nodo, se saltea`); continue; }
  const id = `N-${String(next++).padStart(4, "0")}`;
  const title = `${s.story.replace(/\s+/g, " ").slice(0, 70)} (${s.h})`;
  const node = template
    .replace(/^id: .*$/m, `id: ${id}`)
    .replace(/^title: .*$/m, `title: ${JSON.stringify(title)}`)
    .replace(/^size: .*$/m, `size: ${s.size}`)
    .replace(/^acceptance_criteria: .*$/m, "acceptance_criteria:\n" + s.criteria.map((x) => `  - ${JSON.stringify(x)}`).join("\n"))
    .replace(/^date: .*$/m, `date: ${today}`)
    .replace(/^\(Why this exists.*$/m, `Historia ${s.h}: ${s.story}`);
  writeFileSync(join(dir, `${id}.md`), node);
  const row = `| ${id} | ${title.replace(/\|/g, "/")} | feature | ${s.size} | planned |\n`;
  appendFileSync(join(p, "brain", "index.md"), (index.endsWith("\n") ? "" : "\n") + row);
  index += row;
  console.log(`${id} · ${s.h} · ${s.size} · ${s.criteria.length} criterios`);
}
