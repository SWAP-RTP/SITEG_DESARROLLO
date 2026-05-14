# Responsabilidades (Materiales)

Carpeta para separar responsabilidades de las funcionalidades de entradas, salidas e inventario.

Objetivo
- Extraer funciones y módulos por responsabilidad (tabla, formularios, paginación, utilidades) sin romper los puntos de entrada existentes.

Estructura propuesta
- `entrada/` — lógica específica del flujo de entrada (formulario, tabla, eventos).
- `salida/` — lógica específica del flujo de salida (formulario, tabla, eventos).
- `compartido/` — utilidades y helpers reutilizables (paginación, formateo de folio, estado visual).

Pautas importantes
- No modificar los IDs del DOM en los HTML (`entrada_materiales.html`, `salida_materiales.html`) — los módulos deben adaptarse a ellos.
- Mantener `scripts/entradas.js`, `scripts/salidas.js` e `inventario.js` como puntos de entrada/bootstrappers; migraciones parciales deben probarse antes de eliminar código original.
- Usar importaciones relativas desde los puntos de entrada. Ejemplo mínimo:

```js
import { formatearFolio } from './responsabilidades/compartido/folio.js';
```

Pruebas
- Extraer y reemplazar una sola función compartida (por ejemplo `formatearFolio`) y validar en el navegador antes de mover más código.

Contacto
- Si necesitas que haga la primera extracción y validación, dime y la implemento con cuidado.
