# Intake

- **Objetivo**: CLI que lee un CSV de gastos (`fecha,categoria,monto`) y muestra el total por categoría y el total general.
- **Usuarios**: freelancers que llevan sus cuentas en planillas y exportan a CSV.
- **Éxito observable**: con un CSV de ejemplo, un comando imprime los totales correctos al centavo; un CSV inválido da un error claro, no un total equivocado.
- **Stack**: IMPUESTO — Node 20, cero dependencias.
- **Constraints**: corre offline; sin instalación más allá de Node.
- **UI**: no (CLI).
- **Dominio**: dinero (finanzas personales).
- **Corrida**: Lite.
