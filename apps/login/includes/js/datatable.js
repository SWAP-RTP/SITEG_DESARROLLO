export const datatable = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);

    return data;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return [];
  }
};

export function dataTable(datatable, id_tabla, columns) {
  if ($.fn.DataTable.isDataTable(id_tabla)) {
    $(id_tabla).DataTable().clear().destroy();
  }

  $(id_tabla).DataTable({
    data: datatable,
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
