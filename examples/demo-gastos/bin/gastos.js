#!/usr/bin/env node
const fs = require('node:fs');
const { parseCsv } = require('../src/csv');
const { formatCents, summarize } = require('../src/gastos');

const args = process.argv.slice(2);
if (args.length !== 1) { console.error('Uso: node bin/gastos.js <archivo.csv>'); process.exit(2); }
try {
  let text;
  try { text = fs.readFileSync(args[0], 'utf8'); } catch { console.error(`Error: no se pudo leer ${args[0]}`); process.exit(1); }
  const { byCategory, total } = summarize(parseCsv(text));
  const out = [...byCategory].map(([c, n]) => `${c}: ${formatCents(n)}`);
  out.push(`TOTAL: ${formatCents(total)}`);
  console.log(out.join('\n'));
} catch (e) {
  console.error(e.message.startsWith('línea') ? `Error: ${e.message}` : 'Error: interno');
  process.exit(1);
}
