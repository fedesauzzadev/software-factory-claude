# División CRM — gestión, ventas y marketing

## Detección
- "CRM", contactos/leads, pipeline/embudo, oportunidades, seguimiento comercial, reportes de ventas, importación de contactos.

## Énfasis por rol
- **PO**: valor en términos del vendedor (tiempo ahorrado, conversión, cero duplicados), no en features.
- **Tech Lead**: el modelo de entidades es la decisión más cara → decisión dedicada. Punto de partida: Contact, Company, Deal (stages explícitas), Activity, User/Role. Todo Deal tiene owner; montos con moneda; soft delete por defecto.
- **QA**: permisos y pérdida de datos son hallazgos críticos.

## Gates de dominio
1. **RBAC real**: un usuario común no ve datos de otro; probado con dos usuarios semilla.
2. **Integridad**: suma de deals por stage = total del pipeline; monto negativo rechazado; stage inválido imposible.
3. **Round-trip CSV**: contactos y deals entran y salen sin pérdida (comillas, comas, acentos, BOM).
4. **Audit log**: cambio de stage o de monto deja quién, cuándo, antes y después; no editable desde la app.
5. **Sin fuga cruzada**: la búsqueda global respeta los permisos del usuario.

## DoD de dominio
- Seed realista (admin, vendedor, pipeline poblado): demo en minutos.
- Export completo de los datos del cliente, formato documentado.
- Glosario comercial en el README (lead, stage, deal ganado).

## Artefactos de dominio
- `factory/domain-model.md` (Tech Lead): entidades, transiciones del pipeline, permisos por rol, invariantes.
