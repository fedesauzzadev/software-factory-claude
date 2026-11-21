# División dinero — finanzas personales

## Detección
- Intake con `Dominio: dinero`. Palabras: gastos, montos, totales, saldo, presupuesto, planilla, CSV de cuentas.

## Énfasis por rol
- **PO**: el valor es la confianza en el número. Un total equivocado vale menos que no tener total.
- **Tech Lead** (solo Full): el decimal debe ser exacto, sin error de punto flotante. La representación la decide él.
- **QA**: un total incorrecto sin error, o centavos perdidos, son hallazgos críticos. Un CSV malformado que pasa sin error también es crítico.

## Gates de dominio
1. **D1 Exactitud**: los totales del fixture de ejemplo igualan los valores esperados guardados junto a él.
2. **D2 Falla cerrada**: cualquier CSV inválido da código distinto de 0 y stdout sin líneas de total.
3. **D3 Sin redondeo silencioso**: monto con más de dos decimales da error con número de línea.
4. **D4 Cero pérdida**: 10000 filas de 0.10 suman 1000.00 exacto.
5. **D5 Determinismo**: dos corridas sobre el mismo archivo dan salida idéntica.

## DoD de dominio
- Fixture válido con total esperado, y un fixture inválido por cada regla de rechazo.
- Fixture con BOM y CRLF, como sale de una planilla real.
- README con comando de uso, formato del CSV y glosario: categoría, monto (dos decimales), total.

## Artefactos de dominio
- `factory/division.md` como referencia. En Lite no hay artefacto extra.
