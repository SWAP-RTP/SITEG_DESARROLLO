# Responsabilidades: Compartido

Descripción
- Helpers y utilidades usadas por `entrada`, `salida` e `inventario`.

Archivos actuales
- `folio.js` — `formatearFolio(valor)`
- `estado.js` — `obtenerClaseEstado(estado)`
- `paginacion.js` — helpers para paginar y obtener porciones de datos

Cómo usar
- Importar funciones puntuales desde los módulos con rutas relativas:

```js
import { formatearFolio } from './responsabilidades/compartido/folio.js';
import { obtenerClaseEstado } from './responsabilidades/compartido/estado.js';
```

Recomendaciones
- No modificar la API exportada de estos helpers sin actualizar todas las importaciones.
- Añadir tests simples (manuales) al extraer una función: validar en la UI que no cambia comportamiento.
