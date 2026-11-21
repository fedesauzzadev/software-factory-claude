const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { parseCents, formatCents, summarize } = require('../src/gastos');
const { parseCsv } = require('../src/csv');

test('0.10 + 0.20 == 0.30 exacto', () => {
  assert.strictEqual(formatCents(parseCents('0.10') + parseCents('0.20')), '0.30');
});
test('coma decimal, negativos, enteros', () => {
  assert.strictEqual(parseCents('12,5'), 1250);
  assert.strictEqual(parseCents('-0.05'), -5);
  assert.strictEqual(parseCents('7'), 700);
  assert.strictEqual(formatCents(-5), '-0.05');
  assert.throws(() => parseCents('1.234'));
  assert.throws(() => parseCents('abc'));
  assert.throws(() => parseCents('99999999999999999'));
});
test('consistencia: suma de categorías == total', () => {
  for (let s = 1; s <= 50; s++) { // fuzz con semilla fija
    let x = s;
    const rnd = () => (x = (x * 48271) % 2147483647);
    let csv = 'fecha,categoria,monto\n';
    for (let i = 0; i < 20; i++) csv += `2026-01-01,c${rnd() % 4},${(rnd() % 20000 - 10000) / 100}\n`;
    const { byCategory, total } = summarize(parseCsv(csv));
    assert.strictEqual([...byCategory.values()].reduce((a, b) => a + b, 0), total);
  }
});
test('CLI: totales del ejemplo', () => {
  const r = spawnSync(process.execPath, [path.join(__dirname, '../bin/gastos.js'), path.join(__dirname, '../examples/gastos.csv')], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0);
  assert.strictEqual(r.stdout, 'comida: 10.80\ntransporte: 3.20\nocio: -5.00\nTOTAL: 9.00\n');
});
test('CLI: monto inválido -> exit 1, stdout vacío, línea', () => {
  const f = path.join(__dirname, 'bad.csv');
  require('node:fs').writeFileSync(f, 'fecha,categoria,monto\n2026-01-01,a,1\n2026-01-02,a,x\n');
  const r = spawnSync(process.execPath, [path.join(__dirname, '../bin/gastos.js'), f], { encoding: 'utf8' });
  require('node:fs').unlinkSync(f);
  assert.strictEqual(r.status, 1);
  assert.strictEqual(r.stdout, '');
  assert.match(r.stderr, /línea 3/);
});

// --- S02: validación y CSV hostil ---
const fs = require('node:fs');
const os = require('node:os');
const BIN = path.join(__dirname, '../bin/gastos.js');
const H = 'fecha,categoria,monto\n';
function cli(content) {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'g-')), 'x.csv');
  fs.writeFileSync(f, content);
  return spawnSync(process.execPath, [BIN, f], { encoding: 'utf8' });
}
function rejects(content, re) {
  const r = cli(content);
  assert.notStrictEqual(r.status, 0);
  assert.strictEqual(r.stdout, '');
  assert.match(r.stderr, re);
  assert.doesNotMatch(r.stderr, /\bat \w/); // sin stack
}
test('N-0002: monto inválido / vacío / columnas / fecha / encabezado -> línea y stdout vacío', () => {
  rejects(H + '2026-01-01,a,1\n2026-01-02,a,1.234\n', /^Error: línea 3: monto/);
  rejects(H + '2026-01-01,a,\n', /^Error: línea 2/);
  rejects(H + '2026-01-01,a\n', /^Error: línea 2: se esperan 3 columnas/);
  rejects(H + '2026-01-01,a,1,9\n', /^Error: línea 2: se esperan 3/);
  rejects(H + '2026-02-30,a,1\n', /^Error: línea 2: fecha/);
  rejects(H + '2026-01-01,,1\n', /^Error: línea 2: categoría vacía/);
  rejects('fecha,monto\n', /^Error: línea 1: encabezado/);
  rejects('', /^Error: línea 1: encabezado/);
  rejects(H + '2026-01-01,a,99999999999999999\n', /^Error: línea 2/);
});
test('N-0002: archivo inexistente y uso', () => {
  const r = spawnSync(process.execPath, [BIN, path.join(os.tmpdir(), 'no-existe.csv')], { encoding: 'utf8' });
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /^Error: no se pudo leer /);
  assert.doesNotMatch(r.stderr, /\bat /);
  assert.strictEqual(spawnSync(process.execPath, [BIN], { encoding: 'utf8' }).status, 2);
  assert.strictEqual(spawnSync(process.execPath, [BIN, 'a', 'b'], { encoding: 'utf8' }).status, 2);
});
test('N-0003: BOM, CRLF, líneas vacías, acentos', () => {
  const r = cli('﻿' + H.replace('\n', '\r\n') + '\r\n2026-01-01,café,1.10\r\n   \r\n2026-01-02,café,2,20\r\n'.replace('2,20', '"2,20"') + '2026-01-03,ñandú,-0.30\r\n');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(r.stdout, 'café: 3.30\nñandú: -0.30\nTOTAL: 3.00\n');
});
test('N-0003: comillas, comas y saltos dentro de comillas, "" escapada', () => {
  const r = cli(H + '2026-01-01,"comida, afuera",5\n2026-01-02,"a ""b""",1\n2026-01-03,"multi\nlinea",2\n2026-01-04,x,3\n');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(r.stdout, 'comida, afuera: 5.00\na "b": 1.00\nmulti\nlinea: 2.00\nx: 3.00\nTOTAL: 11.00\n');
});
test('N-0003: comillas sin cerrar -> línea donde abre; línea tras multilínea correcta', () => {
  rejects(H + '2026-01-01,a,1\n2026-01-02,"abierta,2\n2026-01-03,b,3\n', /^Error: línea 3: comillas sin cerrar/);
  rejects(H + '2026-01-01,"x\ny",1\n2026-01-02,a,zz\n', /^Error: línea 4: monto/);
  rejects(H + '2026-01-01,a"b,1\n', /^Error: línea 2: comilla inesperada/);
  rejects(H + '2026-01-01,"a"b,1\n', /^Error: línea 2: texto después/);
});
test('N-0003: fuzz hostil sin tumbar el proceso (semilla fija)', () => {
  const alphabet = ['"', ',', '\n', '\r\n', 'a', ' ', 'é', '1', '.', '﻿', '-'];
  let x = 12345;
  const rnd = () => (x = (x * 48271) % 2147483647);
  for (let k = 0; k < 500; k++) {
    let s = '';
    for (let j = rnd() % 30; j > 0; j--) s += alphabet[rnd() % alphabet.length];
    try { summarize(parseCsv(s)); } catch (e) { assert.match(e.message, /^línea \d+: /); }
  }
});

test('README: salida real del ejemplo == gastos.expected.txt y está en el README', () => {
  const root = path.join(__dirname, '..');
  const r = spawnSync(process.execPath, [path.join(root, 'bin', 'gastos.js'), path.join(root, 'examples', 'gastos.csv')], { encoding: 'utf8' });
  const fs = require('node:fs');
  const expected = fs.readFileSync(path.join(root, 'examples', 'gastos.expected.txt'), 'utf8');
  assert.strictEqual(r.status, 0);
  assert.strictEqual(r.stdout, expected);
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.ok(readme.includes(expected.trimEnd()), 'README contiene la salida esperada exacta');
  assert.match(readme, /monto/i);
});
