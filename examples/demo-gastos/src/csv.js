// RFC 4180 mínimo: comillas, "" escapa, comas/saltos dentro de comillas, BOM, CRLF/LF.
// Devuelve [{line, fields}] (line = línea física donde empieza el registro); lanza Error('línea n: ...').
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const records = [];
  let fields = [], f = '', quoted = false, inQ = false, closed = false;
  let line = 1, start = 1, qLine = 1, i = 0;
  const endField = () => { fields.push(f.trim()); f = ''; quoted = false; closed = false; };
  const endRecord = () => {
    endField();
    if (fields.length > 1 || fields[0] !== '' || quoted) records.push({ line: start, fields });
    fields = [];
  };
  for (; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else { inQ = false; closed = true; } }
      else { if (c === '\n') line++; f += c; }
    } else if (c === '"') {
      if (f.trim() !== '' || closed) throw new Error(`línea ${line}: comilla inesperada`);
      inQ = quoted = true; f = ''; qLine = line;
    } else if (c === ',') endField();
    else if (c === '\n' || (c === '\r' && text[i + 1] === '\n')) {
      if (c === '\r') i++;
      endRecord(); line++; start = line;
    } else if (closed && c.trim() !== '') throw new Error(`línea ${line}: texto después de comillas`);
    else if (!closed) f += c;
  }
  if (inQ) throw new Error(`línea ${qLine}: comillas sin cerrar`);
  endRecord();
  return records;
}
module.exports = { parseCsv };
