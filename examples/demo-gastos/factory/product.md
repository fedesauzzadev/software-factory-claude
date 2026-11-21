# Producto: Gastos CSV (CLI)

## Visión
CLI que lee una planilla de gastos exportada a CSV y responde cuánto se gastó por categoría y en total.
Si el archivo está mal, no muestra ningún total y dice por qué.

## Usuarios
- Freelancers que llevan sus cuentas en planillas y exportan a CSV.

## Fuera de alcance
- Interfaz gráfica o web.
- Base de datos, persistencia o edición de gastos desde la herramienta.
- Varias monedas, conversión o símbolos de moneda.
- Filtros por fecha y totales por mes (V1).
- Separador `;` y coma decimal de Excel en español (V2).
- Reembolsos o montos negativos (ver S3).
- Salida JSON o integración con otras herramientas (V2).
- Presupuestos, alertas, sincronización bancaria, cuentas de usuario.
- Dependencias de terceros (intake: solo Node 20, cero dependencias).

## Supuestos (el Negocio debe confirmar)
- S1. La primera línea del CSV es el encabezado `fecha,categoria,monto`, en ese orden exacto.
- S2. Separador coma; monto con punto decimal, sin separador de miles, hasta 2 decimales.
- S3. Solo gastos positivos: montos menores o iguales a cero se rechazan en el MVP.
- S4. Fecha en formato AAAA-MM-DD: se valida el formato, no se filtra por fecha.
- S5. Categorías sin distinguir mayúsculas ni espacios de borde: "Comida" y "comida " son la misma; se muestra la primera escritura.
- S6. Moneda única; la salida no muestra símbolo.
- S7. Un CSV con solo el encabezado es válido y da total 0.00.
- S8. El comando recibe la ruta del CSV como argumento y escribe en stdout. Corre offline.
- S9. Dominio dinero: los gates D1 a D5 de `factory/division.md` son criterios de N-0001 a N-0004.

## Éxito observable
- Con el CSV de ejemplo, cada total coincide al centavo con el valor esperado del fixture.
- Ningún CSV inválido muestra un total: todos dan error con número de línea y código distinto de 0.
- 0 totales equivocados en la suite de fixtures (válidos e inválidos).

## Backlog
| ID | historia | criterios de aceptación | valor | tamaño |
|---|---|---|---|---|
| H-01 | Ver total por categoría y total general (nodo N-0001) | 1) Dado un CSV válido con tres categorías, cuando ejecuto el comando con su ruta, entonces veo una línea por categoría con la suma de sus montos a dos decimales. 2) Dado ese CSV, cuando ejecuto, entonces veo una línea "Total" igual a la suma de todas las filas. 3) Dado un CSV válido, cuando ejecuto dos veces, entonces la salida es idéntica y las categorías salen en orden alfabético. 4) Dado un CSV solo con encabezado, cuando ejecuto, entonces veo "Total 0.00" y código 0. 5) Dado el CSV de ejemplo, cuando ejecuto, entonces cada total coincide con el valor esperado del fixture (D1). | Ver en segundos en qué se va la plata | S |
| H-02 | Rechazar CSV inválido sin imprimir totales (nodo N-0002) | 1) Dado un archivo cuya primera línea no es exactamente "fecha,categoria,monto", cuando ejecuto, entonces veo un error con el encabezado esperado, código distinto de 0 y ningún total. 2) Dado un archivo con una fecha que no es AAAA-MM-DD o una categoría vacía, cuando ejecuto, entonces el error indica número de línea y motivo, sin total. 3) Dado una ruta inexistente, cuando ejecuto, entonces el error incluye la ruta, código distinto de 0 y sin total. 4) Dado cualquier CSV inválido, cuando ejecuto, entonces stdout no tiene ninguna línea de total (D2). | Nunca un número equivocado por un error de planilla | M |
| H-03 | Montos exactos al centavo (nodo N-0003) | 1) Dado un monto con punto y hasta dos decimales (5, 5.5, 5.50), cuando ejecuto, entonces se suma y se muestra con dos decimales. 2) Dado montos 0.1 y 0.2 en la misma categoría, cuando ejecuto, entonces la categoría muestra 0.30. 3) Dado un monto con más de dos decimales (12.345), con coma decimal (12,50) o no numérico (abc), cuando ejecuto, entonces el error indica línea y valor, sin total, y nunca redondea en silencio (D3). 4) Dado un monto menor o igual a cero, cuando ejecuto, entonces el error indica línea y no hay total. 5) Dado un CSV con 10000 filas de 0.10 en una categoría, cuando ejecuto, entonces muestra 1000.00 (D4). | Totales que se pueden llevar a un cierre o a una declaración | M |
| H-04 | Aceptar exportaciones reales de planilla (nodo N-0004) | 1) Dado un CSV con BOM UTF-8 y finales CRLF, cuando ejecuto, entonces los totales son iguales a los de la misma data sin BOM y con LF. 2) Dado campos con espacios alrededor, cuando ejecuto, entonces los espacios se ignoran y "Comida" y "comida " suman en una sola categoría (S5). 3) Dado un archivo con líneas vacías al final, cuando ejecuto, entonces se ignoran sin error. | Funciona con el archivo tal como sale de la planilla | S |
| === CORTE MVP === | | | | |
| H-05 | Filtrar por rango de fechas | Dado un CSV con fechas dentro y fuera de un rango, cuando indico desde y hasta, entonces solo suma las filas del rango, con ambos extremos incluidos. | Cerrar un mes sin editar la planilla | M |
| H-06 | Leer separador `;` y coma decimal | Dado un CSV con `;` y montos "12,50", cuando ejecuto, entonces los totales son iguales a los del mismo dato con coma y punto. | Usar el export de Excel en español sin convertirlo a mano | M |
| H-07 | Salida JSON | Dado el flag de salida JSON, cuando ejecuto, entonces obtengo un objeto con total por categoría y total general, parseable. | Integrar los totales con otras herramientas | S |

## Roadmap
- **V1**: filtro por rango de fechas (H-05). Valor: cierre mensual sin tocar la planilla.
- **V2**: formatos regionales y salida estructurada (H-06, H-07). Valor: usar cualquier export tal cual y encadenar con otras herramientas.
