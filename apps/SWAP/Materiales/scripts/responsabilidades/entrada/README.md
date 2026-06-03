# Responsabilidades: Entrada

Descripción
- Módulos que contienen la lógica de `entrada` (captura, validación, envío y tabla de historial).

Archivos sugeridos
- `formularioEntrada.js` — funciones para llenar/limpiar el formulario y obtener datos.
- `tablaEntrada.js` — renderizado y paginación de la tabla de entradas.
- `eventosEntrada.js` — listeners y orquestación (no reemplazar todo hasta probar).

Buenas prácticas
- Mantener funciones pequeñas y puras.
- Evitar side-effects globales: devolver datos y dejar que el orquestador (entradas.js) realice la integración con el DOM cuando sea posible.
- Documentar exports para facilitar las importaciones.

Ejemplo de importación desde `entradas.js`:

```js
import { configurarEventosEntrada } from './responsabilidades/entrada/eventosEntrada.js';
```