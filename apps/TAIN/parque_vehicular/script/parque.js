import { cargarDistrubucionPV_con_filtro, cargarDistrubucionPV} from './indi_generales.js';
import { cargarDistrubucionPV_modulo_con_filtro, cargarDistrubucionPV_modulo} from './indi_por_modulo.js' ;

// ===== VARIABLES GLOBALES =====
let hayFiltro = false;
let intervalo = null;

// función para decidir qué cargar
function ejecutarCargaSegunEstado() {
    if (hayFiltro) {
        // Si hay filtro, usamos la función con filtro (pasando el parámetro 1)
        cargarDistrubucionPV_con_filtro();
        cargarDistrubucionPV_modulo_con_filtro();
    } else {
        // Si no hay filtro, carga normal
        cargarDistrubucionPV();
        cargarDistrubucionPV_modulo();
    }
}

function cargarTotalParque() {
    $.ajax({
        url: 'query_sql/get_valores.php',
        method: 'GET',
        dataType: 'json',
        success: function (resp) {
            if (resp && resp.total !== undefined) {
                const total = Number(resp.total).toLocaleString('es-MX');
                // Indicadores generales
                $("#total_parque").text(total);
            }
            // === NUEVA LÓGICA PARA LOS MÓDULOS ===
            if (resp && resp.modulos) {
                $("#val_modulo1").text(resp.modulos.m1);
                $("#val_modulo2").text(resp.modulos.m2);
                $("#val_modulo3").text(resp.modulos.m3);
                $("#val_modulo4").text(resp.modulos.m4);
                $("#val_modulo5").text(resp.modulos.m5);
                $("#val_modulo6").text(resp.modulos.m6);
                $("#val_modulo7").text(resp.modulos.m7);
            }
        },
        error: function () {
            console.error("Error al obtener el total del parque vehicular");
        }
    });
}

$(document).on("click", "#btn_filtrar", function () {
    const filtro_por = Number($("#filtro_por").val());

    const fech_inicio = $("#fech_inicio").val();
    const fech_final  = $("#fech_final").val();

    // Estado global del filtro por fecha
    hayFiltro = !!(fech_inicio || fech_final);

    $("#indicadores_generales").attr('hidden', true);
    $("#indicadores_por_modulo").attr('hidden', true);

    switch (filtro_por) {

        case 1: // TODOS
            $("#indicadores_generales").removeAttr('hidden');
            ejecutarCargaSegunEstado();
            break;

        case 2: // POR MODULO
            $("#indicadores_por_modulo").removeAttr('hidden');
            ejecutarCargaSegunEstado();
            break;

        default:
            // Nada seleccionado
            break;
    }
});

// recargamos la pagina completa para quitar filtros y que use la funcion 
$(document).on("click", "#btn_limpiar", function () {
    // Limpiar inputs de fecha
    $("#fech_inicio").val("");
    $("#fech_final").val("");

    // Forzar estado sin filtro
    hayFiltro = false;

    // Ocultar contenedores
    $("#indicadores_generales").attr("hidden", true);
    $("#indicadores_por_modulo").attr("hidden", true);

    // Re-ejecutar segun lo que este seleccionado
    const filtro_por = Number($("#filtro_por").val());

    switch (filtro_por) {
        case 1:
            $("#indicadores_generales").removeAttr("hidden");
            ejecutarCargaSegunEstado();
            break;

        case 2:
            $("#indicadores_por_modulo").removeAttr("hidden");
            ejecutarCargaSegunEstado();
            break;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    cargarTotalParque();
    ejecutarCargaSegunEstado();

    if (intervalo) clearInterval(intervalo);

    intervalo = setInterval(function () {
        console.log("Actualización automática...");
        ejecutarCargaSegunEstado();
    }, 120000);
});