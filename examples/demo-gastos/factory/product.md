# Producto: demo-gastos

## Visión
CLI que lee un CSV de gastos y muestra cuánto se gastó por categoría y en total.
Valor: saber en qué se va la plata; un total equivocado es peor que ningún total.

## Usuarios
Freelancers que llevan sus cuentas en planillas y exportan a CSV.

## Fuera de alcance
UI/web, múltiples monedas, gráficos, filtros por fecha, exportar resultados, ediciones del CSV, guardar historial, otros formatos (XLSX, OFX).

## Supuestos (el Negocio debería confirmar)
- Una sola moneda; monto con punto o coma decimal, hasta 2 decimales; formato exacto aceptado se documenta en el README.
- Montos negativos (reembolsos) se aceptan y restan; monto 0 es válido.
- Encabezado obligatorio `fecha,categoria,monto`; fecha se valida como formato, no se usa para calcular.
- Categorías distintas por mayúsculas/minúsculas se agrupan tal cual (sin normalizar).
- Un CSV con una sola fila inválida se rechaza entero (no hay totales parciales).
- Constraints de negocio: Node 20, cero dependencias, offline (impuesto).

## Éxito observable
Con el CSV de ejemplo, un comando imprime los totales correctos al centavo; un CSV inválido da un error claro con número de línea y no imprime ningún total.

## Backlog
| ID | historia | criterios de aceptación | valor | tamaño |
|---|---|---|---|---|
| H-01 | Ver totales por categoría y general | Dado un CSV válido, cuando lo ejecuto, entonces veo un total por categoría y el total general; dado 0.10 y 0.20 en la misma categoría, entonces el total es exactamente 0.30; dado cualquier CSV válido, entonces la suma de los totales por categoría es igual al total general | Alto | M |
| H-02 | Rechazar CSV inválido sin dar totales | Dado una fila con monto inválido, cuando ejecuto, entonces el error indica el número de línea, el código de salida es distinto de 0 y no se imprime ningún total; dado una columna faltante, entonces ídem; dado un archivo inexistente, entonces mensaje claro y salida distinta de 0 | Alto | S |
| H-03 | Leer CSV exportados de planillas reales | Dado un CSV con BOM, CRLF, líneas vacías, acentos, o comillas con comas dentro, cuando lo ejecuto, entonces los totales son correctos; dado comillas mal cerradas, entonces error con número de línea | Alto | M |
| H-04 | Guía y ejemplo de uso | Dado el repo, cuando sigo el README, entonces un CSV de ejemplo incluido produce exactamente la salida esperada documentada; el README dice qué formato de monto se acepta | Medio | S |
| === CORTE MVP === | | | | |
| H-05 | Filtrar por rango de fechas | Dado un rango, cuando ejecuto, entonces solo se suman gastos dentro del rango | Medio | M |
| H-06 | Totales por mes | Dado un CSV, cuando pido vista mensual, entonces veo totales por categoría y mes | Medio | M |
| H-07 | Exportar resultado a CSV/JSON | Dado un CSV válido, cuando pido exportar, entonces obtengo un archivo con los totales | Bajo | S |

## Roadmap
- V1 (MVP, H-01..H-04): freelancer obtiene totales confiables al centavo desde su planilla.
- V2 (H-05..H-07): analizar en el tiempo (rango, mensual) y reutilizar resultados en otras herramientas.
