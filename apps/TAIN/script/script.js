// Funcion para la animacion de los cards totales datos_generales.html
function animarContador(elemento, valorFinal) {
    let duration = 2000;
    let start = 0;
    let increment = valorFinal / (duration / 30);

    let interval = setInterval(() => {
        start += increment;

        if (start >= valorFinal) {
            start = valorFinal;
            clearInterval(interval);
        }

        elemento.innerText = Math.floor(start).toLocaleString('en-US');
    }, 30);
}

// Funcion para cargar el total de parque vehicular 
function cargarTotalParque() {
    $.ajax({
        url: 'parque_vehicular/query_sql/get_valores.php',
        method: 'GET',
        dataType: 'json',
        success: function (resp) {

            // Ahora resp es un objeto { total, modulos }
            if (resp && resp.total !== undefined) {
                const total = Number(resp.total);
                const counter = document.getElementById("total_parque_card");

                // Evitar NaN
                if (!isNaN(total)) {
                    counter.innerText = "0";
                    animarContador(counter, total);
                }
            }
        },
        error: function () {
            console.error("Error al obtener el total del parque vehicular");
        }
    });
}

// Funcion para cargar el total de parque vehicular 
function cargarTotalRutas() {
    $.ajax({
        url: 'Rutas/query_sql/get_rutas.php',
        method: 'GET',
        dataType: 'json',
        success: function (resp) {

            // Ahora resp es un objeto { total, modulos }
            if (resp && resp.total !== undefined) {
                const total = Number(resp.total);
                const counter = document.getElementById("total_rutas_card");

                // Evitar NaN
                if (!isNaN(total)) {
                    counter.innerText = "0";
                    animarContador(counter, total);
                }
            }
        },
        error: function () {
            console.error("Error al obtener el total del las rutas");
        }
    });
}

//FUNCION PARA LOS DATOS GENERALES DE TRABAJADORES 
const urlTrabajadores = 'Trabajadores/query_sql/total_trabajadores.php';
async function fetchTotalTrabajadores() {
    try {
        const response = await fetch(urlTrabajadores);
        const data = await response.json();

        const totalTrabajadores = document.getElementById('total-trabajadores-card');
        if (totalTrabajadores) totalTrabajadores.innerText = data.general.totaltrab || 0;

        animarContador(totalTrabajadores, data.general.totaltrab || 0);
    } catch (error) {
        console.error('Error al obtener el total de trabajadores:', error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // graficas_percepcion();
    cargarTotalParque();
    cargarTotalRutas();
    fetchTotalTrabajadores();

});