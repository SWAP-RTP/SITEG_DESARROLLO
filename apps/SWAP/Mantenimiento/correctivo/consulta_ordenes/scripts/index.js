// ? En este JS se tratara de usar en su mayoria funciones globales para mantener un codigo limpio y ordenado
import { validarInptus } from "/includes/scripts/validacion_inptus.js";

validarInptus("btn_alta", "form_consulta_ordenes", [
  "num_orden",
  "economico",
  "fecha_inicio",
  "fecha_final",
  "busqueda_estatus",
]);
