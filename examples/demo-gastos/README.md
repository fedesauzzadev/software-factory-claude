# gastos

CLI que lee un CSV de gastos y muestra el total por categoría y el total general, exacto al centavo. Si el CSV es inválido da un error claro y ningún total. Offline, Node 20, cero dependencias.

## Probarlo en 5 minutos

```
node src/cli.js examples/gastos.csv
```

Salida esperada (ver `examples/gastos.expected`):

```
Comida 20.00
Software 49.00
Transporte 3.30
Total 72.30
```

Tests: `npm test` (o `node --test test/`).

## Formato del CSV

- Primera línea exactamente `fecha,categoria,monto`.
- `fecha`: `AAAA-MM-DD` (fecha real).
- `categoria`: no vacía. Se ignoran mayúsculas y espacios de borde; se muestra la primera escritura.
- `monto`: número positivo con punto decimal y hasta dos decimales (`5`, `5.5`, `5.50`).
- Se aceptan BOM UTF-8, finales CRLF, espacios alrededor de los campos y líneas vacías al final. Una línea vacía en el medio es error.
- Salida: una línea `Categoría monto` por categoría en orden alfabético, y `Total monto`.

## Errores

Cualquier problema (encabezado, fecha, categoría, monto, archivo inexistente) imprime `error: ...` en stderr con la línea y el valor, sale con código distinto de 0 y no imprime ningún total.

## Glosario

- **Categoría**: etiqueta de agrupación del gasto.
- **Monto (dos decimales)**: importe positivo con hasta dos decimales; más decimales se rechazan, nunca se redondean.
- **Total**: suma exacta de los montos, por categoría o de todo el archivo.

## Límites

Una categoría llamada `Total` se confunde visualmente con la línea de total. Orden alfabético por código de carácter, no por idioma.

Licencia MIT.
