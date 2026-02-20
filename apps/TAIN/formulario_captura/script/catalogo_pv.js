// Función: ValidacionFormulario
export function ValidacionFormulario() {
    function validarFormulario() {
        const modulo = $('select[name="modulo"]').val();
        const fecha  = $('input[name="fecha"]').val();
        const motivo = $('select[name="motivo"]').val();

        let hayUnidades = false;
        $('.total-unidad').each(function () {
            const valor = parseInt($(this).val(), 10);
            if (valor > 0) hayUnidades = true;
        });

        const valido = modulo && fecha && motivo && hayUnidades;

        $('#guardar')
            .prop('disabled', !valido)
            .toggleClass('btn-success', valido)
            .toggleClass('btn-secondary', !valido);
    }

    $(document).on(
        'input change',
        'select[name="modulo"], input[name="fecha"], select[name="motivo"], .total-unidad',
        validarFormulario
    );
}

// Inicializa el evento del botón Guardar
export function BotonGuardar() {
    $(document).on('click', '#guardar', function () {
        Swal.fire({
            title: '¿Guardar información?',
            text: '¿Está seguro de guardar los datos capturados?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        });
    });
}

// Función: SumaTotales
export function SumaTotales() {
    $(document).on('input', '.total-unidad', function () {
        let suma = 0;

        $('.total-unidad').each(function () {
            const valor = parseInt($(this).val(), 10);
            if (!isNaN(valor)) suma += valor;
        });

        $('#totalUnidades').val(suma);
    });
}

// Función: ObtenerModulos
export function modulo() {
    $.ajax({
        url: '/app-tain/formulario_captura/query_sql/modulo.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const $select = $('#selectModulo');
            $select.empty().append('<option value="">Seleccione módulo</option>');

            data.forEach(item => {
                $select.append(
                    `<option value="${item.mod_clave}">${item.mod_desc}</option>`
                );
            });
        },
        error: function () {
            Swal.fire('Error', 'No se pudieron cargar los módulos', 'error');
        }
    });
}

// Función: ObtenerMotivos
export function motivo() {
    $.ajax({
        url: '/app-tain/formulario_captura/query_sql/motivo.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const $select = $('#selectMotivo');
            $select.empty().append('<option value="">Seleccione un motivo</option>');

            data.forEach(item => {
                $select.append(
                    `<option value="${item.id}">${item.desc}</option>`
                );
            });
        },
        error: function () {
            Swal.fire('Error', 'No se pudieron cargar los motivos', 'error');
        }
    });
}

export function tipo_unidad() {
    $.ajax({
        url: '/app-tain/formulario_captura/query_sql/tipo_unidad.php',
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function (data) {
            let template = '';

            data.forEach(item => {
                template += `
                    <tr class="text-center">
                        <td class="text-start">${item.descripcion}</td>
                        <td>
                            <input 
                                type="number" 
                                class="form-control text-center total-unidad"
                                value="0" 
                                min="0">
                        </td>
                    </tr>
                `;
            });

            $('#tabla_tipo_unidad tbody').html(template);
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar tipo_unidad.php:', error);
        }
    });
}
