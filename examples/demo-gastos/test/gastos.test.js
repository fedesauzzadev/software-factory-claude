'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { summarize } = require('../src/gastos');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const H = 'fecha,categoria,monto\n';
const run = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', timeout: 10000 });
const tmp = (content) => {
  const p = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'gastos-')), 'x.csv');
  fs.writeFileSync(p, content);
  return p;
};
const rejects = (csv, re) => assert.throws(() => summarize(csv), re);

test('N-0001 fixture de ejemplo (D1) y determinismo (D5)', () => {
  const exp = fs.readFileSync(path.join(__dirname, '..', 'examples', 'gastos.expected'), 'utf8');
  const p = path.join(__dirname, '..', 'examples', 'gastos.csv');
  const a = run(p), b = run(p);
  assert.strictEqual(a.status, 0);
  assert.strictEqual(a.stdout, exp);
  assert.strictEqual(a.stdout, b.stdout);
});

test('N-0001 solo encabezado da Total 0.00 y exit 0', () => {
  const r = run(tmp(H));
  assert.strictEqual(r.status, 0);
  assert.strictEqual(r.stdout, 'Total 0.00\n');
});

test('N-0001 categorías en orden alfabético', () => {
  assert.strictEqual(summarize(H + '2026-01-01,b,1\n2026-01-01,a,2\n'), 'a 2.00\nb 1.00\nTotal 3.00\n');
});

test('N-0002 CSV inválido: exit != 0, sin total en stdout (D2)', () => {
  const bad = ['fecha,monto,categoria\n', H + '2026-13-01,a,1\n', H + '26-01-01,a,1\n', H + '2026-01-01,,1\n',
    H + '2026-01-01,a\n', H + '2026-01-01,a,1\n\n2026-01-01,a,1\n', ''];
  for (const c of bad) {
    const r = run(tmp(c));
    assert.notStrictEqual(r.status, 0, JSON.stringify(c));
    assert.doesNotMatch(r.stdout, /Total/);
    assert.match(r.stderr, /error/);
  }
  rejects('x\n', /fecha,categoria,monto/);
  rejects(H + 'ok\n', /línea 2/);
  rejects(H + '2026-01-01,a,1\n2026-02-30,a,1\n', /línea 3.*fecha/);
  rejects(H + '2026-01-01,,1\n', /línea 2.*categoría/);
});

test('N-0002 ruta inexistente', () => {
  const r = run('no-existe.csv');
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /no-existe\.csv/);
  assert.strictEqual(r.stdout, '');
  assert.notStrictEqual(run().status, 0);
});

test('N-0003 montos válidos', () => {
  assert.strictEqual(summarize(H + '2026-01-01,a,5\n2026-01-01,b,5.5\n2026-01-01,c,5.50\n'), 'a 5.00\nb 5.50\nc 5.50\nTotal 16.00\n');
  assert.strictEqual(summarize(H + '2026-01-01,a,0.1\n2026-01-01,a,0.2\n'), 'a 0.30\nTotal 0.30\n');
});

test('N-0003 montos rechazados con línea y valor (D3)', () => {
  for (const v of ['12.345', 'abc', '0', '0.00', '-5', '', '1e3', '.5', '5.', '99999999999999999']) {
    rejects(H + '2026-01-01,a,1\n' + `2026-01-01,a,${v}\n`, new RegExp('línea 3.*"' + v.replace('.', '\\.') + '"'));
  }
  rejects(H + '2026-01-01,a,12,50\n', /línea 2/); // coma decimal sin comillas: campo de más
  rejects(H + '2026-01-01,a,"12,50"\n', /línea 2/);
});

test('N-0003 10000 filas de 0.10 suman 1000.00 (D4)', () => {
  const r = run(tmp(H + '2026-01-01,a,0.10\n'.repeat(10000)));
  assert.strictEqual(r.stdout, 'a 1000.00\nTotal 1000.00\n');
});

test('N-0004 BOM, CRLF, espacios, líneas vacías finales', () => {
  const lf = H + '2026-01-01,Comida,10\n2026-01-02,comida ,2.5\n';
  const base = summarize(lf);
  assert.strictEqual(base, 'Comida 12.50\nTotal 12.50\n');
  assert.strictEqual(summarize('﻿' + lf.replace(/\n/g, '\r\n')), base);
  assert.strictEqual(summarize(lf + '\n\n  \n'), base);
  assert.strictEqual(summarize(H + ' 2026-01-01 , Comida , 10 \n2026-01-02,COMIDA,2.5\n'), base);
  const r = run(tmp('﻿' + lf.replace(/\n/g, '\r\n')));
  assert.strictEqual(r.stdout, base);
});

test('fuzz con seed fija: o error o total igual a la referencia', () => {
  let s = 12345;
  const rnd = (n) => ((s = (s * 1103515245 + 12345) & 0x7fffffff) % n);
  const pick = (a) => a[rnd(a.length)];
  const amounts = ['1', '2.5', '0.10', '3.33', '12.345', 'abc', '-1', '', '1,5', '9'.repeat(30)];
  const dates = ['2026-01-01', '2026-02-29', 'x', ''];
  const cats = ['a', 'A ', 'b', ''];
  for (let i = 0; i < 300; i++) {
    const rows = Array.from({ length: rnd(6) }, () => [pick(dates), pick(cats), pick(amounts)].join(pick([',', ',', ',,'])));
    let out;
    try { out = summarize(H + rows.join(pick(['\n', '\r\n'])) + pick(['', '\n', '\n\n'])); } catch (e) { assert.ok(e instanceof Error); continue; }
    const exp = rows.reduce((t, r) => t + Math.round(parseFloat(r.split(',')[2]) * 100), 0);
    assert.match(out, new RegExp(`Total ${Math.floor(exp / 100)}\\.${String(exp % 100).padStart(2, '0')}\\n$`));
  }
  for (const huge of ['', '\0'.repeat(10), H + 'x'.repeat(1e6)]) rejects(huge, /./);
});
