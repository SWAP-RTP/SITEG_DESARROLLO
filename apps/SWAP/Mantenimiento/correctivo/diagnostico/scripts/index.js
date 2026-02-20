import { obtenerModulo } from "/Mantenimiento/includes/scripts/obtenerModulos.js";
import {
  API_ROUTES,
  API_ROUTES_DIAGNOSTICO,
} from "/Mantenimiento/includes/scripts/api_routes.js";
import { dataTable, datosTabla } from "/includes/scripts/dataTable_v2.js";

// ! ***************** Obtener modulos ******************* */
obtenerModulo(API_ROUTES.obtenerModulo, "modulo_actual", "span");

//! ***************** Consumir dataTable ******************* */
(async () => {
  const datos = await datosTabla(API_ROUTES_DIAGNOSTICO.dataTable);
  dataTable(datos, "#tabla_diagnostico", [
    {
      data: null,
      title: "Detalles",
      orderable: false,
      render: () =>
        `<button class="btn btn-sm btn-success rounded-circle btn-detalles" style="font-size:.6em;">
            <i class="fas fa-plus"></i>
        </button>`,
    },
    { data: "orden_correctivo", title: "N° Orden" },
    { data: "economico", title: "Economico" },
    { data: "falla_descripcion_operador", title: "Falla Operador" },
    { data: "observacion", title: "Observacion" },
    { data: "fecha", title: "Fecha" },
    { data: "modulo", title: "Modulo" },
    { data: "descripcion", title: "Estado" },
    {
      data: null,
      title: "Acciones",
      orderable: false,
      render: (data, type, row) =>
        ` <button class="btn btn-sm btn-primary" data-bs-toggle="modal"
                data-bs-target="#miModal"><i class="bi bi-tools">Diagnosticar</i></button>`,
    },
  ]);
})();

// Espera a que el DOM esté listo
$(document).ready(function () {
  // Evento para expandir/cerrar detalles
  $("#tabla_diagnostico tbody").on(
    "click",
    " button.btn-detalles",
    function () {
      const tr = $(this).closest("tr");
      const row = $("#tabla_diagnostico").DataTable().row(tr);

      if (row.child.isShown()) {
        // Cierra el detalle
        row.child.hide();
        tr.removeClass("shown");
      } else {
        // Abre el detalle
        row.child(formatoSubtabla(row.data())).show();
        tr.addClass("shown");
      }
    },
  );
});

// Función que retorna el HTML de la subtabla
function formatoSubtabla(data) {
  // Aquí puedes personalizar la subtabla con los datos de la fila principal
  return `
    <table class="table table-bordered mb-0">
     <thead class="thead-detalle">
        <tr>
          <th colspan="8" class="text-center color">DETALLES</th>
        </tr>
        <tr>
          <th>Id</th>
          <th>Accion</th>
          <th>Falla General</th>
          <th>Diagnostico</th>
          <th>Observaciones</th>
          <th>Fecha</th>
          <th>Diagnosticador</th>
          <th>Recibio</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Ejemplo</td>
          <td>Ejemplo</td>
          <td>Ejemplo</td>
          <td>Ejemplo</td>
          <td>Ejemplo</td>
          <td>Ejemplo</td>
          <td>Ejemplo</td>
          <td>Ejemplo</td>
        </tr>
      </tbody>
    </table>
  `;
}
// ! consultar economico para el input
