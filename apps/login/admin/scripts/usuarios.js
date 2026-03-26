export function consulta_usuarios(datosTabla, id_tabla, columns) {

  if ($.fn.DataTable.isDataTable(id_tabla)) {
    $(id_tabla).DataTable().clear().destroy();
  }

  $(id_tabla).DataTable({
    data: datosTabla,
    columns,
    responsive: true, // <--- Agrega esta línea
    autoWidth: false, // <--- Evita que DataTables calcule anchos fijos
    dom: "Blfrtip",
    lengthMenu: [
      [10, 20, 50, -1],
      [10, 20, 50, "Todo"],
    ],

    language: {
      url: "/lib/datatables.net-1.13.6/es-ES.json",
    },
    destroy: true,
    columnDefs: [{ className: "text-center", targets: "_all" }],
  });
}

async function datosTabla(url) {
  try {
    const response = await fetch(url); // <-- Aquí debe ser fetch, no datosTabla
    const data = await response.json();
    // console.log("Datos de la tabla cargados correctamente.", data);
    return data;
  } catch (error) {
    console.error("Error al cargar los datos de la tabla:", error);
  }
}

//! ***************** Consumir dataTable de usuarios ******************* */
(async () => {
  const datos = await datosTabla("/admin/query_sql/usuarios.php");
  consulta_usuarios(datos, "#tabla_orden_alta", [
    { data: "id", title: "Id" },
    { data: "trab_credencial", title: "Credencial" },
    { data: "nombre", title: "Nombre"},
    { data: "correo", title: "Correo" },
    { data: "contrasena", title: "Contraseña" },
    {
      data: null,
      title: "Acción",
      orderable: false,
      render: function (data, type, row) {
        return `
        <button class="btn btn-primary btn-sm me-2">
            <i class="fa fa-pencil"></i> Editar
        </button>
        <button class="btn btn-danger btn-sm">
            <i class="fa fa-trash"></i> Eliminar
        </button>
      `;
      },
    },
  ]);
})();