
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

export function cargarDistrubucionPV(){
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
        data: {opcion: 1},
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

             $("#titulo_fecha").html(`Total de registros del día ${resp.fecha_hoy}`);
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                console.error("Error: No estás autorizado (Token inválido)");
            } else {
                console.error("Error al obtener la distribucion del pv:", error);
            }
        }
    });
}

export function grafica_pastel(resp) {
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

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            cutout: '50%', // Tamaño del aro
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#fff',
                        boxWidth: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    };

    const ctx = document.getElementById('pastelChart').getContext('2d');

    //Evita que se duplique al refrescar
    if (window.pastelChartInstance) {
        window.pastelChartInstance.destroy();
    }

    window.pastelChartInstance = new Chart(ctx, config);
}