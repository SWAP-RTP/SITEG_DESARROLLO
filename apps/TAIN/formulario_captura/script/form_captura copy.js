import {
    inicializarSumaTotales,
    inicializarValidacionFormulario
} from './form_pv.js';

// Evento botón guardar
$('#guardar').on('click', function () {
    Swal.fire({
        title: '¿Guardar información?',
        text: '¿Está seguro de guardar los datos capturados?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    });
});

// DOM Ready
$(document).ready(function () {

    // Inicializar sumatoria y validación
    inicializarSumaTotales();
    inicializarValidacionFormulario();

    // AJAX para cargar tipo de unidad
    $.ajax({
        url: 'query_sql/tipo_unidad.php', // ruta correcta desde el HTML
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            let template = '';

            // Encabezado
            template += `
                <div class="d-flex mb-2 titulo_card border-bottom">
                    <div class="col fw-bold text-center">Tipo de Unidad</div>
                    <div class="col fw-bold text-center">Total</div>
                </div>
            `;

            // Filas
            data.forEach(TIP => {
                template += `
                    <div class="d-flex mb-1 border border-dark rounded p-2 align-items-center">
                        <div class="col text-start">${TIP.DESC}</div>
                        <div class="col-3">
                            <input type="number"
                                   class="form-control form-control-sm total-unidad"
                                   value="0"
                                   min="0"
                                   data-id="${TIP.ID}">
                        </div>
                    </div>
                `;
            });

            $('#tabla_tipo_unidad').html(template);
        },
        error: function (xhr, status, error) {
            console.error("Error al cargar tipo_unidad.php:", error);
        }
    });

    // Cargar módulos
    $.ajax({
        url: '/formulario_captura/query_sql/consultas.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const $select = $('#selectModulo');
            $select.empty().append('<option value="">Seleccione módulo</option>');
            data.forEach(item => {
                $select.append(`<option value="${item.mod_clave}">${item.mod_desc}</option>`);
            });
        },
        error: function () {
            Swal.fire('Error', 'No se pudieron cargar los módulos', 'error');
        }
    });

});
