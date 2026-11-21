# Plan: demo-gastos

## Stack
- Node 20, cero dependencias (IMPUESTO). Tests con `node:test` + `node:assert` (built-in). Sin lockfile: no hay deps.

## Arquitectura
`bin/gastos.js` (args, IO, exit code) -> `src/csv.js` (texto -> registros con nro de línea) -> `src/gastos.js` (valida filas, monto -> centavos, suma, formatea) -> stdout | stderr.
```
bin/gastos.js        CLI: lee archivo, llama parse+summarize, imprime, exit
src/csv.js           parseCsv(text) -> [{line, fields}] | throw CsvError(line, msg)
src/gastos.js        parseCents(str), formatCents(n), summarize(records) -> {byCategory: Map, total}
test/*.test.js       unit + CLI (spawnSync de bin/gastos.js contra fixtures)
test/fixtures/*.csv  válidos y hostiles
examples/gastos.csv  ejemplo del README
package.json         name, version, bin, scripts.test; sin dependencies
README.md LICENSE CHANGELOG.md
```
### Contratos
- Invocación: `node bin/gastos.js <archivo.csv>`. Sin argumento o >1 -> uso en stderr, exit 2.
- Entrada: UTF-8; BOM inicial se descarta; CRLF/LF; líneas vacías (solo espacios) se ignoran. Separador `,`; comillas dobles RFC 4180 (`""` escapa, comas y saltos dentro de comillas). Comillas sin cerrar -> error con línea donde abre.
- Encabezado exacto (tras trim): `fecha,categoria,monto`. Cada fila: exactamente 3 campos, trim de espacios.
  - `fecha`: `YYYY-MM-DD` y fecha de calendario real; no se usa para calcular.
  - `categoria`: no vacía; agrupada tal cual (case-sensitive).
  - `monto`: regex `^-?\d+([.,]\d{1,2})?$`. Sin separador de miles, sin símbolo de moneda. Negativo resta; 0 válido.
- Dinero: ver D-0001 (centavos enteros, nunca float).
- Salida OK (stdout, exit 0): una línea por categoría en orden de primera aparición `<categoria>: <monto>`, luego `TOTAL: <monto>`. Monto formateado `-?\d+\.\d{2}`. Solo encabezado -> `TOTAL: 0.00`.
- Salida error (stderr, exit 1): `Error: línea <n>: <motivo>` (o `Error: no se pudo leer <archivo>` sin stack ni ruta absoluta interna). Ante cualquier error stdout queda vacío: se valida TODO antes de imprimir.
- `n` = línea física (1-based) donde empieza el registro.

## NFRs (de quality.md, los que aplican)
- Entrada validada: todo caso de H-02/H-03 con test que verifica exit!=0, stdout vacío y línea correcta.
- Sin shell/concatenación: N/A salvo tests (spawnSync con array de args, sin `shell:true`).
- Errores sin internals: test que fuerza archivo inexistente y verifica stderr sin "at " (stack).
- Input malformado no tumba el proceso: try/catch único en bin; cualquier excepción no prevista -> `Error: interno`, exit 1, sin stack.
- Overflow: `Number.isSafeInteger` en cada monto y en cada suma; si no -> error con línea.
- Timeout IO externa: N/A (solo archivo local, sin red). Secrets: N/A. Audit deps: N/A (cero deps). Performance: sin objetivo -> N/A.
- DoD vendible: README (uso en <=5 min, formato de monto, ejemplo + salida esperada exacta), LICENSE, version en package.json, CHANGELOG.

## Slices
- **S01** N-0001: camino feliz end-to-end. CSV simple (sin comillas) -> totales. Incluye parseCents/formatCents con tests 0.10+0.20=0.30, coma decimal, negativos; test de consistencia suma(categorías)==total; examples/gastos.csv; CLI test.
- **S02** N-0002, N-0003: validación con línea + parser CSV completo (BOM, CRLF, vacías, acentos, comillas con comas, comillas sin cerrar), "validar todo antes de imprimir", archivo inexistente, uso.
- **S03** N-0004: README con salida exacta (test que compara salida real de examples/gastos.csv contra examples/gastos.expected.txt), LICENSE, CHANGELOG.

## Decisiones triviales
- Parser CSV propio (~40 líneas): cero deps es impuesto.
- Orden de salida = primera aparición: determinista, sin depender de locale.
- Gates de dominio verificados por `node --test` (no por lectura).

## Abiertas para el Negocio
1. Formato de fecha: asumo solo `YYYY-MM-DD`. ¿Planillas exportan `DD/MM/YYYY`? (recomendación: aceptar solo ISO en MVP).
2. Separador `;` (Excel en locale es/AR): fuera de MVP; con coma decimal el monto debe ir entre comillas (`"12,50"`). Confirmar.
