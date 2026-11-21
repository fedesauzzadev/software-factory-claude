#!/usr/bin/env node
// Onboards a project with zero LLM tokens: creates brain/ and a CLAUDE.md section.
// Usage: node init.mjs [project-dir] [--lang es]
// Detects test/run commands from package.json. Never overwrites brain/.
import { appendFileSync, cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const li = args.indexOf("--lang");
const lang = li >= 0 ? args[li + 1] : "en";
const project = resolve(args.find((a, i) => !a.startsWith("--") && (li < 0 || i !== li + 1)) ?? ".");
const tpl = join(fileURLToPath(new URL(".", import.meta.url)), "templates");

if (existsSync(join(project, "brain"))) { console.error("brain/ already exists, nothing done."); process.exit(1); }
cpSync(join(tpl, "brain"), join(project, "brain"), { recursive: true });

// Fill config.yaml from package.json when present.
let test = [], run = [];
try {
  const s = JSON.parse(readFileSync(join(project, "package.json"), "utf8")).scripts ?? {};
  if (s.test && !/no test specified/.test(s.test)) test = ["npm test"];
  if (s.start) run = ["npm start"];
} catch { /* no package.json: fill by hand */ }
const cfgPath = join(project, "brain", "config.yaml");
let cfg = readFileSync(cfgPath, "utf8").replace(/^language: .*$/m, `language: ${lang}`);
cfg = cfg.replace(/^  test: \[\].*$/m, `  test: ${JSON.stringify(test)}`).replace(/^  run: \[\].*$/m, `  run: ${JSON.stringify(run)}`);
writeFileSync(cfgPath, cfg);

// CLAUDE.md: create, or append once (marker keeps it idempotent).
const rules = readFileSync(join(tpl, "CLAUDE.md"), "utf8");
const claudeMd = join(project, "CLAUDE.md");
if (!existsSync(claudeMd)) writeFileSync(claudeMd, rules);
else if (!readFileSync(claudeMd, "utf8").includes("brainloom-claude")) appendFileSync(claudeMd, "\n\n" + rules);

console.log(`brain/ created in ${project} (test: ${JSON.stringify(test)}, run: ${JSON.stringify(run)}).`);
console.log("Review brain/config.yaml commands, then work normally.");
