'use strict';
const HEADER = 'fecha,categoria,monto';

function fail(line, msg) { throw new Error(line ? `línea ${line}: ${msg}` : msg); }

function validDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

// Montos como centavos enteros: nunca se usa punto flotante para sumar.
function parseCents(s, n) {
  if (!/^\d+(\.\d{1,2})?$/.test(s)) fail(n, `monto inválido "${s}" (se esperan hasta dos decimales con punto)`);
  const [i, f = ''] = s.split('.');
  const c = Number(i) * 100 + Number(f.padEnd(2, '0'));
  if (!Number.isSafeInteger(c)) fail(n, `monto demasiado grande "${s}"`);
  if (c <= 0) fail(n, `monto debe ser mayor a cero "${s}"`);
  return c;
}

const fmt = (c) => `${Math.floor(c / 100)}.${String(c % 100).padStart(2, '0')}`;

// Devuelve el texto de salida o lanza Error (falla cerrada: nunca un total parcial).
function summarize(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  if (lines[0] !== HEADER) fail(0, `encabezado inválido, se esperaba exactamente "${HEADER}"`);
  const cats = new Map();
  let total = 0;
  for (let k = 1; k < lines.length; k++) {
    const n = k + 1;
    const f = lines[k].split(',').map((x) => x.trim());
    if (f.length !== 3) fail(n, `se esperaban 3 campos, hay ${f.length}`);
    if (!validDate(f[0])) fail(n, `fecha inválida "${f[0]}" (se espera AAAA-MM-DD)`);
    if (!f[1]) fail(n, 'categoría vacía');
    const c = parseCents(f[2], n);
    const key = f[1].toLowerCase();
    const e = cats.get(key) || { name: f[1], sum: 0 };
    e.sum += c;
    cats.set(key, e);
    total += c;
    if (!Number.isSafeInteger(total)) fail(n, 'total demasiado grande');
  }
  // shortcut: orden por code unit, no por locale; suficiente para determinismo.
  const out = [...cats.keys()].sort().map((key) => `${cats.get(key).name} ${fmt(cats.get(key).sum)}`);
  out.push(`Total ${fmt(total)}`);
  return out.join('\n') + '\n';
}

module.exports = { summarize, HEADER };
