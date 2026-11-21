# División Finanzas personales (síntesis)
## Detección
- Gastos, montos, totales, categorías, extractos o planillas de cuentas.
## Énfasis por rol
- **PO**: el valor es "saber en qué se va la plata"; un total equivocado es peor que ningún total.
- **Tech Lead**: la representación del dinero es la decisión más cara → decisión dedicada.
- **QA**: un centavo perdido es un hallazgo Crítico.
## Gates de dominio
1. **Aritmética exacta**: montos en centavos enteros, nunca float. Sumar 0.10 + 0.20 da exactamente 0.30.
2. **Nunca silenciosamente mal**: una fila con monto inválido, columna faltante o formato ambiguo se rechaza con número de línea y código de salida distinto de 0; no se saltea ni se suma como 0.
3. **CSV hostil**: comillas, comas dentro de comillas, BOM, CRLF, líneas vacías y acentos se parsean bien o se rechazan con mensaje.
4. **Consistencia**: la suma de los totales por categoría es igual al total general.
## DoD de dominio
- CSV de ejemplo incluido, con su salida esperada en el README.
- El README dice qué formato de monto se acepta.
## Artefactos de dominio
- Ninguno extra: la regla de dinero va como decisión en `brain/decisions/`.
