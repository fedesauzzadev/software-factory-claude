Veredicto: SHIP

## Ejecución
- `node --test`: 12/12 pass, 0 fail (sin dependencias; no hay instalación que hacer).
- `node bin/gastos.js examples/gastos.csv`: exit 0, `comida: 10.80 / transporte: 3.20 / ocio: -5.00 / TOTAL: 9.00`.

## Hallazgos
| Sev | Evidencia | Fix sugerido |
|---|---|---|
| Menor | Categoría entre comillas con salto de línea (`"x\ny"`) sale como dos líneas de stdout (`x` / `y: 1.00`); rompe "una línea por categoría". Esperado: rechazo o escape. | Rechazar `\n`/`\r` en categoría con `línea n`, o documentarlo. |

Sin hallazgos Críticos ni Mayores.

## Criterios
- N-0001: OK. 0.1+0.2 -> 0.30 (CLI); suma categorías == total en el ejemplo; fuzz del dev en tests.
- N-0002: OK. fecha 2024-02-30 -> `Error: línea 2`, exit 1; 4 columnas -> error; `1e3`, `1.`, `-.5`, dígitos árabes rechazados; archivo inexistente -> exit 1; sin args o 2 args -> exit 2.
- N-0003: OK. BOM+CRLF+vacías+acentos ok; `"1,5"` -> 1.50; comillas sin cerrar -> línea donde abre; basura binaria (3 KB aleatorios) -> `Error` exit 1, sin crash.
- N-0004: OK. README, LICENSE, CHANGELOG presentes; test compara salida con expected.txt.

## Gates de dominio
1. Aritmética exacta: OK (`-0` -> 0.00, sin float; 90071992547409.91 ok).
2. Nunca silenciosamente mal: OK. Overflow de suma (`90071992547409.91` + `0.01`) -> `línea 3: suma fuera de rango`.
3. CSV hostil: OK, salvo el menor de arriba.
4. Consistencia suma==total: OK.

## Checklist
- Entrada validada: OK. Sin shell/concatenación: N/A (la CLI no usa shell). Errores sin internals: OK (sin stack; solo repite la ruta que dio el usuario). Secrets: N/A. Audit deps: N/A (cero deps). Timeout: N/A. Input malformado no tumba el proceso: OK. Performance: N/A.
- DoD vendible: README/LICENSE/versión 0.1.0/CHANGELOG OK; tests verdes OK; evidencia por criterio OK. DoD de dominio (ejemplo y formato de monto en el README): OK por el test del README.

## No probado
- Archivos muy grandes (sin objetivo de performance). Fuzz propio con semillas: solo 1 corrida de input aleatorio binario más los casos manuales; no se corrió un fuzzer sistemático. Instalación limpia: no hay `npm install`.
- Terminadores `\r` solos (Mac antiguo) no probados.
