import { modulo, tipo_unidad, motivo, SumaTotales, ValidacionFormulario, BotonGuardar } from './catalogo_pv.js';

$(document).ready(function () {
    motivo();
    modulo();
    tipo_unidad();
    SumaTotales();
    ValidacionFormulario();
    BotonGuardar();
});
