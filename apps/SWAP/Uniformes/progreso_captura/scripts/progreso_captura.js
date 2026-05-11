document.addEventListener("DOMContentLoaded", function () {
  cargarResumenPorModulo(); 
});

function cargarResumenPorModulo() {
  fetch('query_sql/getTotalCapturados.php')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
            pintarResumenPorModulo('#contenedor_progreso', data.resumen);
            pintarBarraTotalGeneral(
                '#contenedor_progreso',
                data.total_general,
                data.capturados_general
            );
        } else {
            console.error('Error al obtener el resumen:', data.error);
        }
    })   
}

function pintarResumenPorModulo(contenedorId, datos) {
  const contenedor = document.querySelector(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = '';  // Limpia el contenido previo

  const coloresPersonalizados = [
      '#55a7ff', // Azul modulo 1
      '#92df66', // Verde modulo 2
      '#ffc107', // Amarillo modulo 3
      '#dc3545', // Rojo modulo 4
      '#17a2b8', // Cyan modulo 5
      '#6c757d', // Gris modulo 6
      '#fd7e14', // Naranja modulo 7
      '#db7aff', // Morado modulo 55
  ];

  datos.forEach((registro, index) => {
      const { modulo, total, capturados } = registro;

      const progressGroup = document.createElement('div');
      progressGroup.classList.add('mb-4');

      const color = coloresPersonalizados[index];

      let porcentaje = 0;

      if (total > 0) {
          porcentaje = Math.round((capturados / total) * 100);
      }

      // Limitar máximo al 100%
      if (porcentaje > 100) porcentaje = 100;

      // --- Definir estilo de ancho ---
      let anchoEstilo = `width: ${porcentaje}%;`;

      // Si hay capturados y el porcentaje es muy pequeño, forzar mínimo de 30px
      if (capturados > 0 && porcentaje < 3) {
          anchoEstilo = `min-width: 30px; width: ${porcentaje}%;`;
      }

      progressGroup.innerHTML = `
          <h5 class="fw-bold" style="font-size: 0.95rem;">${modulo}</h5>
          <div class="progress" style="height: 30px; position: relative;">
              <div class="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style="${anchoEstilo} background-color: ${color};">
              </div>
              <span style="
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  transform: translate(-50%, -50%);
                  color: black;
                  font-weight: bold;
                  z-index: 2;
              ">${capturados} de ${total}</span>
          </div>
      `;
      contenedor.appendChild(progressGroup);
  });
}

function pintarBarraTotalGeneral(contenedorId, total_general, capturados_general) {
    const contenedor = document.querySelector(contenedorId);
    if (!contenedor) return;

    // Validar que existan los datos 
    if (total_general === undefined || capturados_general === undefined) {
        // No pintamos nada si no existen los datos (usuario que no es oficinas centrales)
        return;
    }

    let porcentaje = 0;
    if (total_general > 0) {
        porcentaje = Math.round((capturados_general / total_general) * 100);
    }
    if (porcentaje > 100) porcentaje = 100;

    let anchoEstilo = `width: ${porcentaje}%;`;

    if (capturados_general > 0 && porcentaje < 3) {
        anchoEstilo = `min-width: 30px; width: ${porcentaje}%;`;
    }

    const progressGroup = document.createElement('div');
    progressGroup.classList.add('mb-4');

    progressGroup.innerHTML = `
        <h5 class="fw-bold text-dark" style="font-size: 0.95rem;">Total General</h5>
        <div class="progress" style="height: 35px; position: relative;">
            <div class="progress-bar bg-success progress-bar-striped progress-bar-animated"
                role="progressbar"
                style="${anchoEstilo}">
            </div>
            <span style="
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                color: black;
                font-weight: bold;
                z-index: 2;
            ">${capturados_general} de ${total_general}</span>
        </div>
    `;

    contenedor.appendChild(progressGroup);
}

document.addEventListener("DOMContentLoaded", function () {
    cargarResumenPorModulo(); 

    // Evento del botón
    document.getElementById('btn_ver_detalle').addEventListener('click', function() {
        cargarDetallePorModulo();
    });
});

function cargarDetallePorModulo() {
  fetch('query_sql/getDetalleCaptura.php')
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        console.error('Respuesta con error');
        return;
      }

      // 1) Aplanamos la estructura {capturados: {mod: {...}}, faltantes: {mod: {...}}}
      //    a un arreglo de filas para DataTables
      const filas = [];

      // Capturados
      for (const mod in data.capturados) {
        const grupo = data.capturados[mod];
        const modDesc = grupo.mod_desc;
        for (let i = 0; i < grupo.trabajadores.length; i++) {
          const t = grupo.trabajadores[i];
          filas.push({
            credencial: t.credencial,
            nombre: t.nombre,
            modulo: modDesc,
            estatus: 'Capturado'
          });
        }
      }

      // Faltantes
      for (const mod in data.faltantes) {
        const grupo = data.faltantes[mod];
        const modDesc = grupo.mod_desc;
        for (let i = 0; i < grupo.trabajadores.length; i++) {
          const t = grupo.trabajadores[i];
          filas.push({
            credencial: t.credencial,
            nombre: t.nombre,
            modulo: modDesc,
            estatus: 'Faltante'
          });
        }
      }

      // 2) Pintar/repintar DataTable
      const $tabla = $('#tabla_detalle');

      // Si ya estaba creada, destruir para re-crear
      if ($.fn.DataTable.isDataTable($tabla)) {
        $tabla.DataTable().clear().destroy();
        $tabla.empty(); // limpiar <thead>/<tbody> previos
      }

      // Construimos encabezados (opcional si prefieres definirlos en HTML)
      $tabla.append(`
        <thead>
          <tr>
            <th>Credencial</th>
            <th>Nombre</th>
            <th>Modulo</th>
            <th>Estatus</th>
          </tr>
        </thead>
      `);

      // Inicializamos
$tabla.DataTable({
  data: filas,
  columns: [
    { data: 'credencial', className: 'text-center' },
    { data: 'nombre' },
    { data: 'modulo', className: 'text-center' },
    { 
      data: 'estatus',
      className: 'text-center',
      render: function (data) {
        const cls = (data === 'Capturado') ? 'badge bg-success' : 'badge bg-warning text-dark';
        return `<span class="${cls}">${data}</span>`;
      }
    }
  ],
  ordering: false,                  
  order: [[0, 'desc']],          
  responsive: true,
  pageLength: 25,
  lengthMenu: [[10, 25, 50, 100, -1],[10, 25, 50, 100, "Todos"]],
  dom: 'Bfrtip',
  buttons: [
    {
      extend: 'excelHtml5',
      text: '<i class="fas fa-file-excel"></i>',
      titleAttr: 'Exportar a Excel',
      className: 'btn btn-success me-1',
      title: 'Reporte_Trabajadores',
      exportOptions: { columns: ':visible' }
    },
    {
      extend: 'copyHtml5',
      text: '<i class="far fa-copy"></i>',
      titleAttr: 'Copiar datos',
      className: 'btn btn-info me-1',
      exportOptions: { columns: ':visible' }
    },
    {
      text: 'Solo Capturados',
      className: 'btn btn-outline-secondary me-1',
      action: function (e, dt) {
        dt.column(3).search('Capturado', true, false).draw();
      }
    },
    {
      text: 'Solo Faltantes',
      className: 'btn btn-outline-secondary me-1',
      action: function (e, dt) {
        dt.column(3).search('Faltante', true, false).draw();
      }
    },
    {
      text: 'Todos',
      className: 'btn btn-outline-secondary',
      action: function (e, dt) {
        dt.column(3).search('').draw();
      }
    }
  ],
  language: {
    decimal: ",",
    thousands: ".",
    processing: "Procesando...",
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros por página",
    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "Mostrando 0 a 0 de 0 registros",
    infoFiltered: "(filtrado de _MAX_ registros totales)",
    loadingRecords: "Cargando...",
    zeroRecords: "No se encontraron resultados",
    emptyTable: "No hay datos disponibles en la tabla",
    paginate: {
      first: "Primero",
      previous: "Anterior",
      next: "Siguiente",
      last: "Ultimo"
    },
    aria: {
      sortAscending: ": activar para ordenar columna ascendente",
      sortDescending: ": activar para ordenar columna descendente"
    },
    buttons: {
      colvis: "Columnas",
      excel: "Exportar a Excel",
      csv: "Exportar a CSV"
    }
  }
});

    })
    .catch(err => console.error('Error al cargar detalle:', err));
}
