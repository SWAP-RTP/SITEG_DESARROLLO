// Función: inicializarSumaTotales
export function inicializarSumaTotales() {
    $(document).on('input', '.total-unidad', function () {
        let suma = 0;
        $('.total-unidad').each(function () {
            const valor = parseInt($(this).val(), 10);
            if (!isNaN(valor)) suma += valor;
        });
        $('#totalUnidades').val(suma);
    });
}

// Función: inicializarValidacionFormulario
export function inicializarValidacionFormulario() {
    function validarFormulario() {
        const modulo = $('select[name="modulo"]').val();
        const fecha  = $('input[name="fecha"]').val();
        const motivo = $('select[name="motivo"]').val();

        let hayUnidades = false;
        $('.total-unidad').each(function () {
            const valor = parseInt($(this).val(), 10);
            if (valor > 0) hayUnidades = true;
        });

        $('#guardar')
            .prop('disabled', !(modulo && fecha && motivo && hayUnidades))
            .toggleClass('btn-success', modulo && fecha && motivo && hayUnidades)
            .toggleClass('btn-secondary', !(modulo && fecha && motivo && hayUnidades));
    }

    $(document).on(
        'input change',
        'select[name="modulo"], input[name="fecha"], select[name="motivo"], .total-unidad',
        validarFormulario
    );
}
