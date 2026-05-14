# Responsabilidades: Salida

Descripción
- Módulos que contienen la lógica de `salida` (captura, validación, envío y tabla de historial).

Archivos sugeridos
- `formularioSalida.js` — funciones para llenar/limpiar el formulario y obtener datos.
- `tablaSalida.js` — renderizado y paginación de la tabla de salidas.
- `eventosSalida.js` — listeners y orquestación.

Notas de seguridad
- Al migrar funciones, comprobar que `MaterialesService` y `ModalService` sigan disponibles via import.
- Probar cada export con la UI antes de eliminar el código original.

Ejemplo de importación:

```js
import { procesarYMostrarTablaSalida } from './responsabilidades/salida/tablaSalida.js';
```