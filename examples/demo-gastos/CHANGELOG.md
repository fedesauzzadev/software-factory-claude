# Changelog

## 0.1.0 - 2026-11-21
- Total por categoría y total general desde un CSV (`fecha,categoria,monto`).
- Montos exactos al centavo (enteros, sin punto flotante); sin redondeo silencioso.
- Falla cerrada: CSV inválido da error con número de línea y ningún total.
- Acepta BOM UTF-8, CRLF, espacios alrededor de campos y líneas vacías finales.
