export async function datosTabla(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    // dataTable(data);
    console.log("Datos de la tabla cargados correctamente." + data);
    return data;
  } catch (error) {
    console.error("Error al cargar los datos de la tabla:", error);
  }
}

export function dataTable(datosTabla, id_tabla, columns) {
  if ($.fn.DataTable.isDataTable(id_tabla)) {
    $(id_tabla).DataTable().clear().destroy();
  }

  $(id_tabla).DataTable({
    data: datosTabla,
    columns,
    dom: "Blfrtip",
    buttons: [
      {
        extend: "csvHtml5",
        text: "CSV",
        className: "btn btn-success rounded-pill me-2",
      },
      {
        extend: "pdfHtml5",
        text: "PDF",
        className: "btn btn-success rounded-pill",
      },
    ],
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
