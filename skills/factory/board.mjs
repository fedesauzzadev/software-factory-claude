#!/usr/bin/env node
// Renders factory/board.html from brain/ + factory/ and prints a status summary.
// Zero LLM tokens: the orchestrator runs this instead of writing HTML.
// Usage: node board.mjs [project-dir]
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const p = resolve(process.argv[2] ?? ".");
if (!existsSync(join(p, "factory"))) { console.error(`factory/ no existe en ${p}`); process.exit(1); }
const read = (...f) => { try { return readFileSync(join(p, ...f), "utf8"); } catch { return ""; } };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// shortcut: a "|" inside a node title breaks its row; switch to node frontmatter if that happens.
const nodes = read("brain", "index.md").split("\n").map((l) => l.split("|").map((c) => c.trim()))
  .filter((c) => /^N-\d+$/.test(c[1] ?? "")).map((c) => ({ id: c[1], title: c[2], size: c[4], status: c[5] }));
const cols = ["planned", "in-progress", "implemented", "verified", "shipped"];
const verdict = /^\W*Veredicto\W*(NO-SHIP|SHIP)/mi.exec(read("factory", "qa-report.md"))?.[1].toUpperCase() ?? "pendiente";
const log = read("factory", "log.md").split("\n").filter((l) => l.trim()).slice(-15);
const division = read("factory", "division.md").split("\n")[0].replace(/^#\s*/, "") || "Fábrica genérica";
const decDir = join(p, "brain", "decisions");
const decisions = (existsSync(decDir) ? readdirSync(decDir) : []).filter((f) => /^D-\d+/.test(f)).sort()
  .map((f) => `${f.replace(/\.md$/, "")} — ${/^title:\s*(.*)$/m.exec(read("brain", "decisions", f))?.[1] ?? ""}`);

const li = (xs) => xs.length ? xs.map((x) => `<li>${esc(x)}</li>`).join("") : "<li>—</li>";
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(basename(p))} — factory board</title>
<style>
:root{color-scheme:light dark;--bg:#f6f5f2;--card:#fff;--fg:#1c1b19;--mut:#6b6862;--line:#dcd9d2;--ok:#1f7a4d;--bad:#b3261e}
@media(prefers-color-scheme:dark){:root{--bg:#161614;--card:#211f1c;--fg:#ecebe7;--mut:#a09c94;--line:#38352f;--ok:#5fcf97;--bad:#ff8a80}}
body{margin:0;padding:24px 16px;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
main{max-width:1100px;margin:auto}h1{margin:0;font-size:22px}h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:28px 0 8px}
.meta{color:var(--mut)}.v{font-weight:700}.SHIP{color:var(--ok)}.NO-SHIP{color:var(--bad)}
.board{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
.col{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px}
.col h3{margin:0 0 8px;font-size:13px;color:var(--mut)}ul{margin:0;padding-left:18px}.col ul{list-style:none;padding:0}
.col li{border-top:1px solid var(--line);padding:6px 0}.id{font:12px ui-monospace,monospace;color:var(--mut);display:block}
</style></head><body><main>
<h1>${esc(basename(p))}</h1>
<p class="meta">${esc(division)} · generado ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC · QA: <span class="v ${verdict}">${verdict}</span></p>
<h2>Nodos</h2>
<div class="board">${cols.map((s) => `<section class="col"><h3>${s} (${nodes.filter((n) => n.status === s).length})</h3><ul>${
  nodes.filter((n) => n.status === s).map((n) => `<li><span class="id">${esc(n.id)} · ${esc(n.size)}</span>${esc(n.title)}</li>`).join("") || "<li>—</li>"
}</ul></section>`).join("")}</div>
<h2>Actividad</h2><ul>${li(log)}</ul>
<h2>Decisiones</h2><ul>${li(decisions)}</ul>
</main></body></html>
`;
writeFileSync(join(p, "factory", "board.html"), html);

console.log(`Fase: ${log.at(-1) ?? "sin actividad"}`);
console.log(`Nodos: ${cols.map((s) => `${s} ${nodes.filter((n) => n.status === s).length}`).join(" · ")}`);
console.log(`QA: ${verdict} · División: ${division} · Decisiones: ${decisions.length}`);
console.log(`Board: ${join(p, "factory", "board.html")}`);
