async function cargarRegistrosUniformes() {
  try {
    const res = await fetch("./query_sql/obtener_registros_uniformes.php");
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Respuesta inválida:", data);
      return;
    }

    if ($.fn.DataTable.isDataTable('#registro_uniformes')) {
      $('#registro_uniformes').DataTable().clear().destroy();
      $('#registro_uniformes tbody').empty();
    }

    inicializarTablaRegistros(data);
    inicializarEventosTabla();

  } catch (error) {
    console.error("Error al cargar registros:", error);
  }
}

let tablaUniformes;

function inicializarTablaRegistros(data) {

  tablaUniformes = $('#registro_uniformes').DataTable({
    responsive: true,
    data: data,
    ordering: false,
    deferRender: true,
    autoWidth: false,
    pageLength: 25,
    processing: true,

    columns: [
      {
        data: "id",
        className: "text-center",
        render: () => `<i class="fas fa-chevron-down btn_down"></i>`
      },
      { data: "credencial", className: "text-center" },
      { data: "nombre_completo", className: "text-center" },
      { data: "genero", className: "text-center" },
      { data: "tipo_contrato", className: "text-center" },
      { data: "total_prenda", className: "text-center" },
      { data: "obs", className: "text-center" },

      {
        data: null,
        className: "text-center",
        render: (row) => {

          const disabledSolicitud = row.habilitado == 1 ? 'disabled' : '';
          const disabledActualizar = row.habilitado == 1 ? '' : 'disabled';

          return `
            <div class="d-flex justify-content-center gap-1 flex-wrap">
              <button class="btn btn-outline-info btn_solicitud btn-sm" data-id="${row.id}" ${disabledSolicitud}>
                <i class="fa-regular fa-pen-to-square"></i> Solicitud
              </button>

              <button class="btn btn-outline-success btn_actualizar btn-sm" data-id="${row.id}" ${disabledActualizar}>
                <i class="fa-regular fa-pen-to-square"></i> Actualizar
              </button>

              <button class="btn btn-outline-primary btn_imprimir btn-sm" data-id="${row.id}">
                <i class="fa-solid fa-print"></i> Imprimir
              </button>
            </div>
          `;
        }
      }
    ],

    dom: '<"d-flex justify-content-between mb-3 mt-3 gap-1"<"align-self-start"l><"d-flex justify-content-center flex-grow-1"f><"align-self-end"B>>rt<"d-flex justify-content-between mt-3"ip>',

    buttons: [
      {
        extend: 'excelHtml5',
        text: '<i class="fas fa-file-excel"></i>',
        className: 'btn btn-success me-1',
        title: 'Reporte_Uniformes',
        exportOptions: { columns: [1,2,3,4,5,6] }
      },
      {
        extend: 'copyHtml5',
        text: '<i class="far fa-copy"></i>',
        className: 'btn btn-info'
      },
      {
        text: '<i class="fas fa-file-csv"></i> Detalle',
        className: 'btn btn-success',
        action: exportarDetalleCSV
      }
    ],

    language: {
      sProcessing: "Procesando...",
      sLengthMenu: "Mostrar _MENU_ registros",
      sZeroRecords: "No se encontraron resultados",
      sEmptyTable: "Ningún dato disponible",
      sInfo: "Mostrando _START_ a _END_ de _TOTAL_",
      sSearch: "Buscar:",
      oPaginate: {
        sNext: "Siguiente",
        sPrevious: "Anterior"
      }
    }
  });
}

function exportarDetalleCSV() {

  const rowsData = tablaUniformes.rows({ search: 'applied' }).data().toArray();

  const out = [
    ['Credencial','Nombre','Genero','Tipo Contrato','Nombre Prenda','Cantidad','Talla']
  ];

  rowsData.forEach(r => {
    (r.detalles_registro || []).forEach(d => {
      out.push([
        r.credencial ?? '',
        r.nombre_completo ?? '',
        r.genero ?? '',
        r.tipo_contrato ?? '',
        d.nombre_prenda ?? '',
        d.cantidad ?? '',
        d.talla ?? ''
      ]);
    });
  });

  const csv = out
    .map(row => row.map(val => `"${String(val).replace(/"/g,'""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'Reporte_Uniformes_Detalle.csv';
  a.click();

  URL.revokeObjectURL(url);
}

function inicializarEventosTabla() {

  $('#registro_uniformes tbody').on('click', '.btn_solicitud', function () {
    const id = $(this).data('id');
    console.log("Solicitud:", id);
  });

  $('#registro_uniformes tbody').on('click', '.btn_actualizar', function () {
    const id = $(this).data('id');
    console.log("Actualizar:", id);
  });

  $('#registro_uniformes tbody').on('click', '.btn_imprimir', function () {
    const id = $(this).data('id');
    console.log("Imprimir:", id);
  });

}

document.addEventListener("DOMContentLoaded", () => {
  cargarRegistrosUniformes();
});