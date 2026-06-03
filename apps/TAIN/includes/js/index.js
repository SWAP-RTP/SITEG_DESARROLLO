import { grafica_rosquilla} from './charts.js';

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

function obtenerTemaActual() {
    return localStorage.getItem('theme') || 'dark';
}

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
    return $.ajax({
        url: 'parque_vehicular/query_sql/get_valores.php',
        method: 'GET',
        dataType: 'json'
    }).then(resp => {
  
        if (resp && resp.total !== undefined) {
            const total = Number(resp.total);
            return isNaN(total) ? 0 : total;
        }
        return 0;
    }).catch(err => {
        console.error("Error al obtener el total del parque vehicular", err);
        return 0; 
    });
}

// Funcion para obtener el total de rutas
function cargarTotalRutas() {
    return $.ajax({
        url: 'Rutas/query_sql/get_rutas.php',
        method: 'GET',
        dataType: 'json'
    }).then(resp => {
        if (resp && resp.total !== undefined) {
            const total = Number(resp.total);
            return isNaN(total) ? 0 : total;
        }
        return 0;
    }).catch(err => {
        console.error("Error al obtener el total de las rutas", err);
        return 0;
    });
}

// Funcion para cargar el total de trabajadores, inactivos y activos
async function cargarTotalTrabajadores() {
    try {
        const response = await fetch('trabajadores/query_sql/total_trabajadores.php');
        const data = await response.json();
        return Number(data.general.totaltrab) || 0;
    } catch (e) { return 0; }
}

function cargarTotalAccidentes() {
    return fetch("http://accidentes-pv.rtp.gob.mx/accidentes/query_sql/accidentes_tablero.php")
        .then(response => {
            if (!response.ok) throw new Error("Error en red");
            return response.json();
        })
        .then(data => {
            // RETORNAMOS el valor, no lo pintamos
            return data.total_accidentes ?? 0;
        })
        .catch(error => {
            console.error("Error al cargar accidentes:", error);
            return 0;
        });
}

// pintar los card de los totales para que sean dinamicos
async function pintarCards() {
    const container = $('#card-totales');
    container.empty();

    try {
        const [totalParque, totalRutas, totalTrab, totalAcci] = await Promise.all([
            cargarTotalParque(),
            cargarTotalRutas(),
            cargarTotalTrabajadores(),
            cargarTotalAccidentes()
        ]);

        const configCards = [
            { id: 'total-trabajadores-card', titulo: 'Trabajadores', valor: totalTrab, icono: 'fa-users' },
            { id: 'total_parque_card', titulo: 'Parque Vehicular', valor: totalParque, icono: 'fa-bus' },
            { id: 'total_rutas_card', titulo: 'Rutas', valor: totalRutas, icono: 'fa-route' },
            { id: 'total_sefies', titulo: 'Sefis', valor: 4, icono: 'fa-van-shuttle' },
            { id: 'total_accidentes', titulo: 'Accidentes', valor: totalAcci, icono: 'fa-car-burst' },
            { id: 'total_mantenimientos', titulo: 'Mantenimiento', valor: 80, icono: 'fa-screwdriver-wrench' },
            { id: 'total_recaudación', titulo: 'Recaudación', valor: 500600, icono: 'fa-money-bill-1' }
        ];

        // Creamos las cards pero SOLO con el loader adentro
        configCards.forEach((item) => {
            let cardBase = `
                <div class="card3 card-t p-3 ${item.id}" id="parent-${item.id}">
                    <div class="loader-wrapper d-flex justify-content-center">
                        <div class="loader2"></div>
                    </div>
                </div>
            `;
            container.append(cardBase);
        });

        // Iniciamos la secuencia
        configCards.forEach((item, index) => {
            const cardElement = document.getElementById(`parent-${item.id}`);

            setTimeout(() => {
                // Aparece la card con el loader
                cardElement.style.transition = "all 0.5s ease";
                cardElement.style.opacity = "1";
                cardElement.style.transform = "translateY(0)";

                // despues de un segundo, quitamos el loader2 y pintamos la info
                setTimeout(() => {
                    cardElement.innerHTML = `
                        <div class="card-body-custom" style="opacity: 0; transition: opacity 0.4s ease; width: 100%;">
                            <div class="card-info">
                                <h5 class="card-title">${item.titulo}</h5>
                                <div class="card-value total" id="val-${item.id}">0</div>
                            </div>
                            <div class="card-icon-container">
                                <i class="fa-solid ${item.icono} icont"></i>
                            </div>
                        </div>
                    `;

                    // aqui hacemos el cambio de loader2 por la infor
                    const content = cardElement.querySelector('.card-body-custom');
                    setTimeout(() => {
                        content.style.opacity = "1";
                        const numElement = document.getElementById(`val-${item.id}`);
                        if (numElement && item.valor > 0) {
                            animarContador(numElement, item.valor);
                        }
                    }, 50);
                }, 1200); // El loader vive 1.2 segundos
            }, index * 200); // Cascada de entrada
        });
    } catch (error) {
        console.error("Error crítico:", error);
    }
}

// Grafica de recaudación 
let chartInstance = null;

function graficaRecaudacion() {
    const canvas = document.getElementById('movementChart');
    if (!canvas) return; 

    const ctx = canvas.getContext('2d');
    const main = document.querySelector('main');
    
    // Detectar tema por clase en el main
    const isLight = main ? main.classList.contains('light') : false;

    // Colores dinámicos
    const colors = isLight ? {
        line: 'rgb(0, 102, 255)',
        fill: 'rgba(0, 102, 255, 0.3)',
        grid: 'rgba(0, 0, 0, 0.08)',
        text: '#333'
    } : {
        line: 'rgb(118, 183, 41)',
        fill: 'rgba(118, 183, 41, 0.3)',
        grid: 'rgba(255, 255, 255, 0.1)',
        text: '#ffffff'
    };

    // Destruir instancia previa para evitar errores de renderizado
    if (chartInstance) {
        chartInstance.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colors.fill);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
            datasets: [{
                data: [2100,1600,1650,1950,1650,2000,2600,2500,2800,3500,3000,3400],
                borderColor: colors.line,
                borderWidth: 3,
                fill: true,
                backgroundColor: gradient,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: colors.text }
                }
            }
        }
    });

    // REGISTRO GLOBAL
    window.graficasRegistradas = window.graficasRegistradas || [];

    window.graficasRegistradas = window.graficasRegistradas.filter(g => g.id !== 'grafRecaudacion');

    window.graficasRegistradas.push({
        id: 'grafRecaudacion',
        render: () => graficaRecaudacion()
    });
}

// Grafica de general
async function datosGenerales() {
    try {
        // Cargamos cada dato uno por uno
        const totalParque = await cargarTotalParque();
        const totalRutas  = await cargarTotalRutas();
        const totalTrab   = await cargarTotalTrabajadores();
        const totalAcci   = await cargarTotalAccidentes();

        // Una vez que tenemos todos, armamos el objeto
        const data = {
            labels: ['Parque Vehicular', 'Rutas', 'Trabajadores', 'Accidentes'],
            datasets: [{
                data: [totalParque, totalRutas, totalTrab, totalAcci], 
                backgroundColor: [
                    'rgb(118, 183, 41)', 
                    'rgb(211, 46, 46)',
                    'rgb(54, 162, 235)', 
                    'rgb(255, 210, 9)' 
                ],
                borderWidth: 0,  
                hoverOffset: 6
            }]
        };
        grafica_rosquilla(data);

    } catch (error) {
        console.error("Hubo un error al obtener los totales:", error);
    }
}

// async function graficaGeneral() {
//     const canvas = document.getElementById('myChart');
//     if (!canvas) return;

//     try {
//         const main = document.querySelector('main');
//         const isLight = main ? main.classList.contains('light') : false;
//         const textColor = isLight ? '#333333' : '#ffffff';

//         // Obtenemos los datos de las funciones de los totales
//         const [totalParque, totalRutas, totalTrab, totalAcci] = await Promise.all([
//             cargarTotalParque(),
//             cargarTotalRutas(),
//             cargarTotalTrabajadores(),
//             cargarTotalAccidentes()
//         ]);

//         const data = {
//             labels: ['Parque Vehicular', 'Rutas', 'Trabajadores', 'Accidentes'],
//             datasets: [{
//                 data: [totalParque, totalRutas, totalTrab, totalAcci], 
//                 backgroundColor: [
//                     'rgb(118, 183, 41)', 
//                     'rgb(211, 46, 46)',
//                     'rgb(54, 162, 235)', 
//                     'rgb(255, 210, 9)' 
//                 ],
//                 hoverOffset: 10,
//                 borderColor: isLight ? '#fff' : '#2b2b2b',
//                 borderWidth: 2
//             }]
//         };

//         // Limpieza de instancia previa usando el método oficial de Chart.js
//         let chartStatus = Chart.getChart("myChart");
//         if (chartStatus) {
//             chartStatus.destroy();
//         }

//         new Chart(canvas, {
//             type: 'doughnut',
//             data: data,
//             options: {
//                 cutout: '70%', 
//                 plugins: {
//                     legend: {
//                         display: true,
//                         position: 'bottom', 
//                         labels: {
//                             color: textColor,
//                             boxWidth: 20,
//                             padding: 20,
//                             font: { size: 12 }
//                         }
//                     }
//                 },
//                 maintainAspectRatio: false 
//             }
//         });

//     } catch (error) {
//         console.error("Error al generar la gráfica general:", error);
//     }

//     // REGISTRO GLOBAL
//     window.graficasRegistradas = window.graficasRegistradas || [];

//     window.graficasRegistradas = window.graficasRegistradas.filter(g => g.id !== 'grafGeneral');

//     window.graficasRegistradas.push({
//         id: 'grafGeneral',
//         render: () => graficaGeneral()
//     });
// }

document.addEventListener("DOMContentLoaded", function () {
    if (typeof pintarCards === 'function') pintarCards();
    graficaRecaudacion();
    // graficaGeneral();
    datosGenerales();
});