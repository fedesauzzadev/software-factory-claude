#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const { summarize } = require('./gastos');

const path = process.argv[2];
if (!path || process.argv.length > 3) {
  console.error('uso: gastos <archivo.csv>');
  process.exit(2);
}
let text;
try {
  text = fs.readFileSync(path, 'utf8');
} catch (e) {
  console.error(`error: no se pudo leer "${path}": ${e.code || e.message}`);
  process.exit(1);
}
try {
  process.stdout.write(summarize(text));
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}
