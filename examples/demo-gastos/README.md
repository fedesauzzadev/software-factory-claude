# demo-gastos

CLI sin dependencias (Node 20+) que suma tus gastos por categoría desde un CSV, al centavo exacto (centavos enteros, nunca float).

## Uso (menos de 5 minutos)

```
node bin/gastos.js examples/gastos.csv
```

Tests: `npm test` (o `node --test`).

## Formato del CSV

Encabezado exacto: `fecha,categoria,monto`. Separador `,`, UTF-8 (BOM, CRLF y LF ok), comillas dobles estilo RFC 4180.

- `fecha`: `YYYY-MM-DD`, fecha real de calendario.
- `categoria`: no vacía; se agrupa tal cual (distingue mayúsculas).
- `monto`: número con hasta 2 decimales, punto o coma (`12.50`, `"12,50"`), negativo con `-` (resta), `0` válido. Sin separador de miles ni símbolo de moneda. Con coma decimal, el monto va entre comillas.

Cualquier fila inválida aborta con `Error: línea <n>: <motivo>` en stderr, exit 1 y sin totales en stdout. Uso incorrecto: exit 2.

## Ejemplo

`examples/gastos.csv`:

```
fecha,categoria,monto
2026-01-03,comida,10.50
2026-01-04,transporte,3.20
2026-01-05,comida,0.10
2026-01-06,comida,0.20
2026-01-07,ocio,-5
```

Salida esperada (idéntica a `examples/gastos.expected.txt`, verificada por test):

```
comida: 10.80
transporte: 3.20
ocio: -5.00
TOTAL: 9.00
```

Las categorías salen en orden de primera aparición.

## Licencia

MIT, ver `LICENSE`.
