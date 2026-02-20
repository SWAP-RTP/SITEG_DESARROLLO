import { obtenerModulos } from "../../includes/utils/modulos_select.js";

async function datosTabla(url) {
  try {
    const response = await fetch(url); // <-- Aquí debe ser fetch, no datosTabla
    const data = await response.json();
    console.log("Datos de la tabla cargados correctamente.", data);
    return data;
  } catch (error) {
    console.error("Error al cargar los datos de la tabla:", error);
  }
}

function dataTable(datosTabla, id_tabla, columns) {
  if ($.fn.DataTable.isDataTable(id_tabla)) {
    $(id_tabla).DataTable().clear().destroy();
  }

  $(id_tabla).DataTable({
    data: datosTabla,
    columns,
    dom: "Blfrtip",
    lengthMenu: [
      [10, 20, 50, -1],
      [10, 20, 50, "Todo"],
    ],

    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
    },
    destroy: true,
    columnDefs: [{ className: "text-center", targets: "_all" }],
  });
}

//! ***************** Consumir dataTable de usuarios ******************* */
(async () => {
  const datos = await datosTabla("/admin/query_sql/usuarios.php");
  dataTable(datos, "#tabla_orden_alta", [
    { data: "id", title: "id" },
    { data: "nombre", title: "nombre" },
    { data: "trab_credencial", title: "trab_credencial" },
    { data: "correo", title: "correo" },
    { data: "contrasena", title: "contrasena" },
    {
      data: null,
      title: "Acción",
      orderable: false,
      render: function (data, type, row) {
        return `
        <button class="btn btn-success btn-sm me-2"><i class="fa fa-pencil"></i></button>
        <button class="btn btn-warning btn-sm"><i class="fa fa-trash"></i></button>
      `;
      },
    },
  ]);
})();

// ***************** Consumir obtenerModulos ******************* */
obtenerModulos("/admin/query_sql/catalogos_modulos.php");

// ***************** Consumir modulos_sistema ******************* */

//! ***************** Consumir dataTable de modulos de sistema ******************* */
(async () => {
  const modulos_sistema = await datosTabla(
    "/admin/query_sql/modulos_sistema.php",
  );
  dataTable(modulos_sistema, "#tabla_modulos_sistema", [
    { data: "cve_modulo", title: "cve_modulo" },
    { data: "modulo_sistem_descrip", title: "modulo_sistem_descrip" },
    {
      data: "estatus",
      title: "estatus",
      render: function (data, type, row) {
        return data === "t"
          ? '<span class="badge bg-success">Activo</span>'
          : '<span class="badge bg-secondary">Inactivo</span>';
      },
    },
    {
      data: null,
      title: "Acción",
      orderable: false,
      render: function (data, type, row) {
        const esActivo = row.estatus === "t";
        return `
    <button class="btn btn-${esActivo ? "warning" : "success"} btn-sm me-2 btn-toggle-estado" data-id="${row.cve_modulo}" data-estado="${esActivo ? "f" : "t"}">
      ${esActivo ? "Inactivar" : "Activar"}
    </button>
    <button class="btn btn-danger btn-sm" id="delete-${row.cve_modulo}"><i class="fa fa-trash"></i></button>
  `;
      },
    },
  ]);
})();

// !***************** Agregar nuevo módulo al sistema ******************* */

//! boton de activar o inactivar modulo del sistema
document.addEventListener("click", async function (event) {
  if (event.target.classList.contains("btn-toggle-estado")) {
    const btn = event.target;
    const id = btn.getAttribute("data-id");
    const nuevoEstado = btn.getAttribute("data-estado");

    try {
      const response = await fetch(
        `/admin/query_sql/modulos_sistema_update.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, estado: nuevoEstado }),
        },
      );

      const result = await response.json();

      if (result.success) {
        // Encuentra la fila del botón
        const fila = btn.closest("tr");
        // Actualiza el badge de estatus
        const estatusCell = fila.querySelector("td:nth-child(3)");
        if (estatusCell) {
          estatusCell.innerHTML =
            nuevoEstado === "t"
              ? '<span class="badge bg-success">Activo</span>'
              : '<span class="badge bg-secondary">Inactivo</span>';
        }
        // Actualiza el botón de acción
        btn.classList.toggle("btn-warning");
        btn.classList.toggle("btn-success");
        btn.setAttribute("data-estado", nuevoEstado === "t" ? "f" : "t");
        btn.innerHTML = nuevoEstado === "t" ? "Inactivar" : "Activar";
        alert("Estado actualizado correctamente");
      } else {
        alert("Error al actualizar el estado");
      }
    } catch (error) {
      alert("Error en la petición");
      console.error(error);
    }
  }
});
