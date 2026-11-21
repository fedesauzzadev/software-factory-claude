# Calidad — checklist de Tech Lead y QA

Aplicá SOLO los ítems que el producto tiene (sin auth, no se revisa auth). Cada ítem: **OK / FALLA / N/A + evidencia** (comando y resultado). Sin evidencia no es OK.

## Seguridad
- Toda entrada externa (HTTP, args, env, archivos) validada; rechazo explícito, no crash.
- Cero secrets en código, tests, logs y commits; config por variables de entorno.
- Sin queries, comandos ni shell armados por concatenación.
- Errores sin internals hacia afuera (stack traces, rutas).
- Dependencias: audit sin vulnerabilidades críticas o altas; lockfile commiteado.
- Con auth: passwords hasheados (argon2/bcrypt), tokens con expiración, rate limit en endpoints sensibles.

## Resiliencia
- IO externa con timeout explícito; retry solo si la operación es idempotente.
- Input malformado no tumba el proceso ni deja estado a medias (probarlo, no leerlo).

## Performance
- Solo si `factory/plan.md` fija un objetivo: medí el flujo principal contra ese número. Sin objetivo → N/A.

## DoD vendible (sin esto no hay SHIP)
- README: qué es, instalar y probar en ≤5 minutos con comandos exactos.
- LICENSE, versión y CHANGELOG.
- Tests verdes desde instalación limpia.
- Cada criterio del MVP con evidencia.
- Con UI: contraste AA, foco visible, labels en inputs, navegable por teclado.
