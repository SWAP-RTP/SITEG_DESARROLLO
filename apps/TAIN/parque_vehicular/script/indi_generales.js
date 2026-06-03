import { grafica_rosquilla} from '../../includes/js/charts.js';

// Funcion animacion numeros
function animarNumero(elemento, final, porcentaje = false) {
    let inicio = 0;
    let duracion = 1200;
    let intervalo = 20;
    let incremento = final / (duracion / intervalo);

    let anim = setInterval(() => {
        inicio += incremento;

        if (inicio >= final) {
            inicio = final;
            clearInterval(anim);
        }

        elemento.textContent = porcentaje ? Math.round(inicio) + "%" : Math.round(inicio);
    }, intervalo);
}

export function cargarDistrubucionPV_con_filtro(opcion){
    const Token = "#!!TOKEN_SUGO_123_POR_FILTRO$%";
    const filtro_por = $("#filtro_por").val();
    const filtro = document.getElementById("filtro_pv");
    const form = new FormData(filtro);
          form.append('opcion', 1);

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
            grafica_pastel(resp);
            
            $("#total_servicio").text(resp.total_servicio);
             $("#total_servicioMB").text(resp.total_servicioMB);
             $("#total_disponibles").text(resp.total_disponible);
             $("#total_mantenimientoCorrec").text(resp.total_mantenimientoCorrec);
             $("#total_mantenimientoPreven").text(resp.total_mantenimientoPreven);
             $("#total_terminoJornada").text(resp.total_terminoJorn);
             $("#total_verificacion").text(resp.total_verificacion);
             $("#total_tallerEx").text(resp.total_tallerExt);
             $("#total_otros").text(resp.total_otros);

             if(resp.fecha_inicio){
                 $("#titulo_fecha").html(`Total de registros del día ${resp.fecha_inicio}`);
             }
             if(resp.fecha_final){
                 $("#titulo_fecha").html(`Total de registros del día ${resp.fecha_final}`);
             }
             if(resp.fecha_inicio && resp.fecha_final){
                 $("#titulo_fecha").html(`Total de registros del día ${resp.fecha_inicio} al ${resp.fecha_final}`);
             }
        },
        error: function () {
            console.error("Error al obtener el total del parque vehicular por filtros");
        }
    });
}

export function cargarDistrubucionPV() {
    const cards = document.querySelectorAll(".card3");
    const Token = "#!!TOKEN_SUGO_123$%";
    
    const idsIndicadores = [
        "total_servicioMB", 
        "total_servicio", 
        "total_disponibles",
        "total_mantenimientoCorrec", 
        "total_mantenimientoPreven",
        "total_terminoJornada", 
        "total_otros"
    ];

    // Mostrar card con su animación
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("show");
        }, index * 200);
    });

    // Colocar el loader dentro del contenedor de todos los indicadores
    idsIndicadores.forEach((id, index) => {
        const div = document.getElementById(id);
        if (div) {
            setTimeout(() => {
                div.innerHTML = `
                    <div class="d-flex justify-content-center">
                        <div class="loader2"></div>
                    </div>
                `;
            }, index * 100);
        }
    });

    $.ajax({
        url: 'query_sql/get_pv_estados.php',
        method: 'GET',
        dataType: 'json',
        headers: {'Authorization': 'Bearer ' + Token},
        data: { opcion: 1 },
        success: function (resp) {

            // ---------LE PASAMOS LA DATA A NUESTRA GRAFICA GENERICA--------------------
            const data = {
                labels: [
                    'En Servicio', 'Disponibles',
                    'En Mantenimiento Correctivo', 'En Mantenimiento Preventivo',
                    'Termino de Jornada'
                ],
                datasets: [{
                    data: [
                        resp.total_servicio + resp.total_servicioMB || 0,
                        resp.total_disponible || 0,
                        resp.total_mantenimientoCorrec || 0,
                        resp.total_mantenimientoPreven || 0,
                        resp.total_terminoJorn || 0
                    ],
                    backgroundColor: [
                        'rgba(9, 255, 0, 1)',    // En servicio
                        'rgb(0, 225, 255)',      // Disponibles
                        'rgb(161, 161, 161)',    // Mantenimiento correctivo
                        'rgba(255, 0, 0, 1)',    // Mantenimiento preventivo
                        'rgb(218, 214, 15)'      // Termino de jornada
                    ],
                    borderWidth: 0,  
                    hoverOffset: 6
                }]
            };
            grafica_rosquilla(data);
            // ---------LE PASAMOS LA DATA A NUESTRA GRAFICA GENERICA--------------------

            const indicadores = {
                "total_servicioMB": resp.total_servicioMB,
                "total_servicio": resp.total_servicio,
                "total_disponibles": resp.total_disponible,
                "total_mantenimientoCorrec": resp.total_mantenimientoCorrec,
                "total_mantenimientoPreven": resp.total_mantenimientoPreven,
                "total_terminoJornada": resp.total_terminoJorn,
                "total_otros": resp.total_otros
            };

            setTimeout(() => {
                Object.keys(indicadores).forEach((id, index) => {
                    const div = document.getElementById(id);
                    if (div) {
                        setTimeout(() => {
                            // quitamos loader y animamos número
                            div.innerHTML = ""; 
                            animarNumero(div, Number(indicadores[id]));
                        }, index * 100); 
                    }
                });
                $("#titulo_fecha").html(`Total de registros del día ${resp.fecha_hoy}`);
            }, 800); 
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener la distribucion:", error);
        }
    });
}