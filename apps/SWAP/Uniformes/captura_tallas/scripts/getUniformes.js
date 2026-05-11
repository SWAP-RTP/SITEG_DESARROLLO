//Función para cargar registros de uniformes y mostrarlos en la tabla
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

// Exponer refresco para otros scripts
window.refrescarTablaRegistrosUniformes = cargarRegistrosUniformes;

// También escuchar evento global
document.addEventListener("uniformes:registrado", () => {
  cargarRegistrosUniformes();
});

let tablaUniformes;

//Tabla de registro de uniformes
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

          const estatus = parseInt(row.estatus_solicitud || 0);

          let disabledSolicitud = '';
          let disabledActualizar = 'disabled';

          switch (estatus) {
          
            case 1:
              disabledSolicitud = 'disabled';
              disabledActualizar = 'disabled';
              break;
          
            case 2:
              disabledSolicitud = 'disabled';
              disabledActualizar = '';
              break;
          
            case 3:
              disabledSolicitud = '';
              disabledActualizar = 'disabled';
              break;
          
            default:
              disabledSolicitud = '';
              disabledActualizar = 'disabled';
          }

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

function formatearDetalle(detalles) {
  if (!detalles || detalles.length === 0) {
    return `<div class="detalle-wrap p-2 text-muted">Sin prendas registradas</div>`;
  }

  let html = `
    <div class="detalle-wrap" style="display:none;">
      <table class="table table-sm table-bordered mb-0">
        <thead class="table-light text-center">
          <tr>
            <th>Prenda</th>
            <th>Cantidad</th>
            <th>Talla</th>
          </tr>
        </thead>
        <tbody>
  `;

  detalles.forEach(d => {
    html += `
      <tr class="text-center">
        <td>${d.nombre_prenda}</td>
        <td>${d.cantidad}</td>
        <td>${d.talla}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  return html;
}

//exportar detalle en formato csv
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

//Inicializar eventos de botones en la tabla de registros
function inicializarEventosTabla() {

 $('#registro_uniformes tbody') .off('click', '.btn_down') .on('click', '.btn_down', function () {
  const tr = $(this).closest('tr');
  const row = tablaUniformes.row(tr);
  const icon = $(this);

  if (row.child.isShown()) {
    const contenido = tr.next('tr').find('.detalle-wrap');

    contenido.fadeOut(150).slideUp(200, function () {
      row.child.hide();
    });

    tr.removeClass('shown');
    icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');

  } else {

    const data = row.data();

    row.child(formatearDetalle(data.detalles_registro)).show();

    const contenido = tr.next('tr').find('.detalle-wrap');

    contenido.hide().fadeIn(200).slideDown(200);

    tr.addClass('shown');
    icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
  }
});

  $('#registro_uniformes tbody').on('click', '.btn_solicitud', function () {

    const tr = $(this).closest('tr');
    const row = tablaUniformes.row(tr).data();

    if (!row) return;

    // llenar modal
    $('#sol_id_trabajador').val(row.id);
    $('#sol_credencial').val(row.credencial || '');
    $('#sol_nombre').val(row.nombre_completo || '');
    $('#sol_contrato').val(row.tipo_contrato || '');
    $('#observaciones').val(row.obs || '');
  
    const modal = new bootstrap.Modal(
      document.getElementById('modalSolicitudUniformes')
    );
    modal.show();
  });

  $('#registro_uniformes tbody').on('click', '.btn_actualizar', async function () {

  const tr = $(this).closest('tr');
  const row = tablaUniformes.row(tr).data();

  if (!row) return;

  $('#update_id_trabajador').val(row.id);
  $('#update_credencial').val(row.credencial || '');
  $('#update_nombre').val(row.nombre_completo || '');
  $('#update_contrato').val(row.tipo_contrato || '');

  $('#tabla_actualizar_uniformes_container').html(`
    <div class="text-center text-muted py-3">
      Cargando prendas...
    </div>
  `);

  const modal = new bootstrap.Modal(
    document.getElementById('modalActualizarUniformes')
  );

  modal.show();

  try {

    const formData = new FormData();
    formData.append('id', row.id);

    const res = await fetch('query_sql/GetUniformes_act.php', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!data.ok) {

      $('#tabla_actualizar_uniformes_container').html(`
        <div class="alert alert-danger">
          No se pudieron cargar las prendas
        </div>
      `);

      return;
    }

    let tablaHTML = `
      <table class="table table-bordered table-sm text-center">
        <thead class="table-light">
          <tr>
            <th>Prenda</th>
            <th>Cantidad</th>
            <th>Talla</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.detalles.forEach(prenda => {

      tablaHTML += `
        <tr>
          <td>${prenda.nombre}</td>
          <td>${prenda.cantidad}</td>
          <td>
            <select 
              class="form-select form-select-sm"
              name="id_prenda${prenda.id_catalogo}"
            >
              ${generarOpcionesTallas(
                prenda.nombre,
                prenda.talla,
                prenda.genero
              )}
            </select>
          </td>
        </tr>
      `;
    });

    tablaHTML += `
        </tbody>
      </table>
    `;

    $('#tabla_actualizar_uniformes_container').html(tablaHTML);

  } catch(error) {

    console.error(error);

    $('#tabla_actualizar_uniformes_container').html(`
      <div class="alert alert-danger">
        Error de conexión
      </div>
    `);
  }
});

  $('#registro_uniformes tbody').on('click', '.btn_imprimir', function () {
    const id = $(this).data('id');
    window.open('./query_sql/imprimir_acuse.php?id='+ id, '_blank');
  });

}

document.addEventListener("DOMContentLoaded", () => {
  cargarRegistrosUniformes();
});

//Solicitud para actualizar tallas
document.addEventListener("DOMContentLoaded", () => {
  const formSolicitud = document.getElementById("form_solicitud_uniformes");

  if (!formSolicitud) return;

  formSolicitud.addEventListener("submit", async function (e) {
    e.preventDefault();

    const observaciones = document.getElementById("observaciones").value.trim();

    if (!observaciones) {
      Swal.fire("Atención", "Agrega una observación", "warning");
      return;
    }

    const formData = new FormData(this);

    try {
      const res = await fetch("query_sql/solicitud_uniforme.php", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.ok) {
        Swal.fire({
          icon: "success",
          title: "Listo",
          text: data.mensaje
        });

        const modalEl = document.getElementById('modalSolicitudUniformes');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        this.reset();

        cargarRegistrosUniformes();

      } else if (data.mensaje === "Ya existe una solicitud activa") {

        Swal.fire({
          icon: "warning",
          title: data.mensaje
        });

      } else {

        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.mensaje
        });
      }

    } catch (error) {
      console.error("Error en fetch:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo conectar con el servidor"
      });
    }
  });
});

//Actualizar tallas
function generarOpcionesTallas(nombre, tallaActual, genero) {
  const n = (nombre || '').toUpperCase();
  let opciones = [];

  // UNITALLA
  if (n.includes('TOALLA') || n.includes('GORRA') || n.includes('CORBATA') || n.includes('MASCADA')) {
    opciones = ['UNITALLA'];
  }
  // Calzado
  else if (n.includes('ZAPATO') || n.includes('BOTAS')) {
    opciones = ['22cm','22.5cm','23cm','23.5cm','24cm','24.5cm','25cm','25.5cm','26cm','26.5cm','27cm','27.5cm','28cm','28.5cm','29cm','29.5cm','30cm','30.5cm','31cm','31.5cm','32cm','32.5cm','33cm','33.5cm','34cm'];
  }
  // Camisola (30–52)
  else if (n.includes('CAMISOLA')) {
    opciones = ['30','32','34','36','38','40','42','44','46','48','50','52'];
  }
  // Playera (28–50)
  else if (n.includes('PLAYERA')) {
    opciones = ['28','30','32','34','36','38','40','42','44','46','48','50'];
  }
  // Sudadera (28–50)
  else if (n.includes('SUDADERA')) {
    opciones = ['28','30','32','34','36','38','40','42','44','46','48','50'];
  }
  // Impermeables (28–48)
  else if (n.includes('IMPERMEABLE')) {
    opciones = ['28','30','32','34','36','38','40','42','44','46','48'];
  }
  // Suéter (28–42)
  else if (n.includes('SUETER')) {
    opciones = ['28','30','32','34','36','38','40','42'];
  }
  // Pantalón (28–52)
  else if (n.includes('PANTALON')) {
    opciones = ['28','30','32','34','36','38','40','42','44','46','48','50','52'];
  }
  // Resto de prendas (default 28–52)
  else {
    opciones = ['28','30','32','34','36','38','40','42','44','46','48','50','52'];
  }

  return opciones.map(op => {
    const selected = (tallaActual && op.toLowerCase() === tallaActual.toLowerCase()) ? 'selected' : '';
    return `<option value="${op}" ${selected}>${op}</option>`;
  }).join('');
}

document.addEventListener("DOMContentLoaded", () => {

  const formActualizar = document.getElementById("form_actualizar_uniformes");

  if (!formActualizar) return;

  formActualizar.addEventListener("submit", async function (e) {

    e.preventDefault();

    const formData = new FormData(this);

    try {

      const res = await fetch("query_sql/actualizar_tallas.php", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.ok) {

        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: data.mensaje
        });

        // cerrar modal
        const modalEl = document.getElementById('modalActualizarUniformes');

        const modal = bootstrap.Modal.getInstance(modalEl);

        modal.hide();

        // recargar tabla
        cargarRegistrosUniformes();

      } else {

        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.mensaje || "No se pudo actualizar"
        });
      }

    } catch(error) {

      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo conectar al servidor"
      });
    }
  });
});