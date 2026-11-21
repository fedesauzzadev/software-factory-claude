// Dinero en centavos enteros (D-0001): nunca float.
const MONTO = /^(-?)(\d+)(?:[.,](\d{1,2}))?$/;

function parseCents(str) {
  const m = MONTO.exec(str);
  if (!m) throw new Error(`monto inválido "${str}"`);
  const n = Number(m[2]) * 100 + Number((m[3] ?? '').padEnd(2, '0'));
  if (!Number.isSafeInteger(n)) throw new Error(`monto fuera de rango "${str}"`);
  return m[1] ? -n : n;
}

function formatCents(n) {
  const abs = Math.abs(n);
  return `${n < 0 ? '-' : ''}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

function validDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

// records: [{line, fields}] con encabezado primero
function summarize(records) {
  const byCategory = new Map();
  let total = 0;
  if (!records.length || records[0].fields.join(',') !== 'fecha,categoria,monto') throw new Error(`línea ${records[0]?.line ?? 1}: encabezado esperado fecha,categoria,monto`);
  for (const { line, fields } of records.slice(1)) {
    if (fields.length !== 3) throw new Error(`línea ${line}: se esperan 3 columnas`);
    const [fecha, cat, monto] = fields;
    if (!validDate(fecha)) throw new Error(`línea ${line}: fecha inválida "${fecha}"`);
    if (!cat) throw new Error(`línea ${line}: categoría vacía`);
    let c;
    try { c = parseCents(monto); } catch (e) { throw new Error(`línea ${line}: ${e.message}`); }
    const sum = (byCategory.get(cat) ?? 0) + c;
    total += c;
    if (!Number.isSafeInteger(sum) || !Number.isSafeInteger(total)) throw new Error(`línea ${line}: suma fuera de rango`);
    byCategory.set(cat, sum);
  }
  return { byCategory, total };
}

module.exports = { parseCents, formatCents, summarize };
