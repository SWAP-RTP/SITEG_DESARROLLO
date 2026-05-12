// prueba
async function datosTabla(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los datos: " + response.statusText);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log("Error en la función datosTabla:", error);
    return [];
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
//! ***************** Consumir dataTable ******************* */
(async () => {
  const datos = await datosTabla(
    "/app-swap/incidencias/query_sql/modulo_detalle.php",
  );
  dataTable(datos, "#tabla_incidencias", [
    { data: "id", title: "id" },
    { data: "folio", title: "Folio" },
    { data: "nombre", title: "Nombre" },
    { data: "credencial", title: "Credencial" },
    { data: "hora_reporte", title: "Hora de Reporte" },
    { data: "estatus_id", title: "Estatus" },
  ]);
})();
