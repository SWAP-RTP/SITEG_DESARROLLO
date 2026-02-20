import { obtenerModulo } from "/Mantenimiento/includes/scripts/obtenerModulos.js";
import {
  API_ROUTES,
  API_ROUTES_REALIZADAS,
} from "/Mantenimiento/includes/scripts/api_routes.js";
import {
  dataTable,
  datosTabla,
} from "/Mantenimiento/includes/scripts/dataTable_v2.js";

// ! ***************** Obtener modulos ******************* */
obtenerModulo(API_ROUTES.obtenerModulo, "modulo_actual", "span");

//! ***************** Consumir dataTable ******************* */
(async () => {
  const datos = await datosTabla(API_ROUTES_REALIZADAS.dataTable);
  dataTable(datos, "#tabla_reparaciones", [
    {
      data: null,
      title: "Detalles",
      orderable: false,
      render: () =>
        `<button class="btn btn-sm btn-success rounded-circle btn-detalles" style="font-size:.6em;">
            <i class="fas fa-plus"></i>
        </button>`,
    },
    { data: "orden_correctivo", title: "Numero de orden" },
    { data: "economico", title: "Economico" },
    { data: "modulo", title: "Modulo" },
    
  ]);
})();
