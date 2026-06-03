import { grafica_barras} from '../../includes/js/charts.js';

// variable global
let datosPVPorModulo = null;
let triggerModalDetalle = null;

export function cargarDistrubucionPV_modulo_con_filtro(opcion){
    const Token = "#!!TOKEN_SUGO_123_POR_FILTRO$%";
    const filtro_por = $("#filtro_por").val();
    const filtro = document.getElementById("filtro_pv");
    const form = new FormData(filtro);
          form.append('opcion', 2);

    $.ajax({
        url: 'query_sql/get_pv_estados_por_filtro.php',
        method: 'POST',
        data: form,
        processData: false,
        contentType: false,
        headers: {
            // Se agrega el encabezado de autorización
            'Authorization': 'Bearer ' + Token
        },
        success: function (resp) {
            // guardamos el resp en la variable global
            datosPVPorModulo = resp.data;
            // ---------LE PASAMOS LA DATA A NUESTRA GRAFICA GENERICA--------------------
            const data = {
                labels: ['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4', 'Módulo 5', 'Módulo 6', 'Módulo 7'],
                datasets: [{
                    label: 'Total de camiones',
                    data: [
                        resp.data.m1.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m2.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m3.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m4.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m5.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m6.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m7.reduce((a, b) => a + Number(b.total_camiones || 0), 0)
                    ],
                    backgroundColor: [
                        '#439DF7',
                        '#F75243',
                        '#F79143',
                        '#d3b239',
                        '#2ba1a1',
                        '#914DFA',
                        '#A1A1A1'
                    ],
                    borderRadius: 0
                }]
            };
            grafica_barras(data);
            // ---------LE PASAMOS LA DATA A NUESTRA GRAFICA GENERICA--------------------

            let template = "";

            Object.entries(resp.data).forEach(([moduloKey, registros]) => {

                // Sumar todos los total_camiones del modulo
                const total_camiones = registros.reduce((suma, item) => {
                    return suma + Number(item.total_camiones);
                }, 0);

                template += `
                        <div class="card-number mb-1" id="modulo${moduloKey.replace('m', '')}" data-modulo="${moduloKey}">
                            <div class="seccion">
                                <h4 class="text-white">MODULO ${moduloKey.replace('m', '')}</h4>
                                <div class="value">${total_camiones}</div>
                            </div>
                        </div>
                `;
            });

            if(resp.fecha_inicio){
                $("#titulo_fecha2").html(`Total de registros por Módulo del día ${resp.fecha_inicio}`);
            }
            if(resp.fecha_final){
                $("#titulo_fecha2").html(`Total de registros por Módulo del día ${resp.fecha_final}`);
            }
            if(resp.fecha_inicio && resp.fecha_final){
                $("#titulo_fecha2").html(`Total de registros por Módulo del día ${resp.fecha_inicio} al ${resp.fecha_final}`);
            }

            $("#total_por_modulo").html(template);
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                console.error("Error: No estás autorizado (Token inválido)");
            } else {
                console.error("Error al obtener la distribucion del pv por modulo:", error);
            }
        }
    });
}

export function cargarDistrubucionPV_modulo(){
    // contrasela token
    const Token = "#!!TOKEN_SUGO_123$%";
    $.ajax({
        url: 'query_sql/get_pv_estados.php',
        method: 'GET',
        dataType: 'json',
        headers: {
            // Se agrega el encabezado de autorización
            'Authorization': 'Bearer ' + Token
        },
        data: {opcion: 2},
        success: function (resp) {
            // guardamos el resp en la variable global
            datosPVPorModulo = resp.data;
            // ---------LE PASAMOS LA DATA A NUESTRA GRAFICA GENERICA--------------------
            const data = {
                labels: ['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4', 'Módulo 5', 'Módulo 6', 'Módulo 7'],
                datasets: [{
                    label: 'Total de camiones',
                    data: [
                        resp.data.m1.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m2.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m3.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m4.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m5.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m6.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
                        resp.data.m7.reduce((a, b) => a + Number(b.total_camiones || 0), 0)
                    ],
                    backgroundColor: [
                        '#439DF7',
                        '#F75243',
                        '#F79143',
                        '#d3b239',
                        '#2ba1a1',
                        '#914DFA',
                        '#A1A1A1'
                    ],
                    borderRadius: 0
                }]
            };
            grafica_barras(data);
            // ---------LE PASAMOS LA DATA A NUESTRA GRAFICA GENERICA--------------------

            let template = "";

            Object.entries(resp.data).forEach(([moduloKey, registros]) => {

                // Sumar todos los total_camiones del modulo
                const total_camiones = registros.reduce((suma, item) => {
                    return suma + Number(item.total_camiones);
                }, 0);

                template += `
                        <div class="card-info card-number mb-1 modulo${moduloKey.replace('m', '')}" data-modulo="${moduloKey}">
                            <div class="seccion">
                                <h4 class="text-white">MODULO ${moduloKey.replace('m', '')}</h4>
                                <div class="value">${total_camiones}</div>
                            </div>
                        </div>
                `;
            });

            $("#titulo_fecha2").html(`Total de registros por Módulo ${resp.fecha_hoy}`);

            $("#total_por_modulo").html(template);
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                console.error("Error: No estás autorizado (Token inválido)");
            } else {
                console.error("Error al obtener la distribucion del pv por modulo:", error);
            }
        }
    });
}

// MODAL DEL DETALLE DE LOS REGISTROS DE LOS MODULOS
$(document).on("click", ".card-info", function() {
    const moduloKey = $(this).data("modulo"); 
    const registros = datosPVPorModulo[moduloKey];

    $("#tituloModalModuloPV").text(`Detalle Módulo ${moduloKey.replace('m', '')}`);
    if (!registros) return;

    const categorias = {};

    registros.forEach(item => {
        let cat = "Otros";
        const id = Number(item.motivo_id);

        if (id === 1) cat = "En Servicio";
        else if (id === 25 || id === 26) cat = "En Servicio MB";
        else if (id === 15) cat = "Disponibles (Patio)";
        else if (id === 12 || id === 23) cat = "Mantenimiento Correctivo";
        else if (id === 24) cat = "Mantenimiento Preventivo";
        else if (id === 9) cat = "Término de Jornada";

        if (!categorias[cat]) categorias[cat] = [];
        categorias[cat].push(item);
    });

    let templateDetalle = `<div class="row g-2">`; // g-2 para menos espacio entre cards

    Object.entries(categorias).forEach(([nombreCategoria, items]) => {
        const total = items.reduce((s, i) => s + Number(i.total_camiones), 0);

        templateDetalle += `
            <div class="col-12 col-md-6">
                <div class="card-segmento p-2 h-100">
                    <div class="d-flex justify-content-between align-items-center border-bottom border-secondary mb-2 pb-1">
                        <span>${nombreCategoria}</span>
                        <small>${total}</small>
                    </div>
                    <ul class="list-unstyled mb-0">`;

        items.forEach(item => {
            // VALIDACIÓN: Si ruta_modalidad es null, undefined o "", pone "Sin modalidad"
            const nombreRuta = (item.ruta_modalidad && item.ruta_modalidad.trim() !== "") 
                                ? item.ruta_modalidad 
                                : "Sin modalidad";

            templateDetalle += `
                <li class="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-25">
                    <span class="me-2" title="${nombreRuta}">${nombreRuta}</span>
                    <span class="fw-bold">${item.total_camiones}</span>
                </li>`;
        });

        templateDetalle += `
                    </ul>
                </div>
            </div>`;
    });

    templateDetalle += `</div>`;
    $("#contenedorDetallesModuloPV").html(templateDetalle);
    $("#modalDetalleModuloPV").modal("show");
});

//Mover foco al cerrar el modal
$('#modalDetalleModuloPV').on('hidden.bs.modal', function () {
    if (triggerModalDetalle) {
        triggerModalDetalle.focus();
    }
});