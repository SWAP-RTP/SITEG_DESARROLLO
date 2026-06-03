// FUNCION GRAFICA GENERICA ROSQUILLA----------------------------------------------------------------------------------
export function grafica_rosquilla(data) {
    const main = document.querySelector('main');
    const isLight = main ? main.classList.contains('light') : false;
    const textColor = isLight ? '#333333' : '#ffffff';

    /* EJEMPLO DE COMO PASARLE LA DATA A LA GRAFICA GENERICA

        const data = {
            labels: [
                'En Servicio', 'Disponibles',
            ],
            datasets: [{
                data: [
                    resp.total_servicio + resp.total_servicioMB || 0,
                    resp.total_disponible || 0,
                ],
                backgroundColor: [
                    'rgba(9, 255, 0, 1)',    // En servicio
                    'rgb(0, 225, 255)',      // Disponibles
                ],
                borderWidth: 0,  
                hoverOffset: 6
            }]
        };
    */

    // ESTE ES EL HTML QUE DEBE USAR: <canvas class="DoughnutChart"></canvas>
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            cutout: '50%',
            // --- AGREGA ESTO ---
            animation: {
                animateRotate: true,  // La dona gira al aparecer
                animateScale: true,   // La dona crece desde el centro
                duration: 1000,       // Duración en milisegundos
                easing: 'easeOutQuart' // Tipo de movimiento
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
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

    const ctx = document.querySelector('.DoughnutChart').getContext('2d');

    //Evita que se duplique al refrescar
    if (window.pastelChartInstance) {
        window.pastelChartInstance.destroy();
    }

    window.pastelChartInstance = new Chart(ctx, config);

    // REGISTRO GLOBAL
    window.graficasRegistradas = window.graficasRegistradas || [];

    window.graficasRegistradas = window.graficasRegistradas.filter(g => g.id !== 'grafRosquilla');

    window.graficasRegistradas.push({
        id: 'grafRosquilla',
        render: () => grafica_rosquilla(data)
    });
}

// FUNCION GRAFICA GENERICA BARRAS----------------------------------------------------------------------------------
export function grafica_barras(data) {
    /* EJEMPLO DE COMO PASARLE LA DATA A LA GRAFICA GENERICA

        const data = {
            labels: [
                'En Servicio', 'Disponibles',
            ],
            datasets: [{
                data: [
                    resp.total_servicio + resp.total_servicioMB || 0,
                    resp.total_disponible || 0,
                ],
                backgroundColor: [
                    'rgba(9, 255, 0, 1)',    // En servicio
                    'rgb(0, 225, 255)',      // Disponibles
                ],
                borderWidth: 0,  
                hoverOffset: 6
            }]
        };
    */

        
    // Calcula total por modulo
    // const totales = [
    //     resp.data.m1.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
    //     resp.data.m2.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
    //     resp.data.m3.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
    //     resp.data.m4.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
    //     resp.data.m5.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
    //     resp.data.m6.reduce((a, b) => a + Number(b.total_camiones || 0), 0),
    //     resp.data.m7.reduce((a, b) => a + Number(b.total_camiones || 0), 0)
    // ];

    // const data = {
    //     labels: ['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4', 'Módulo 5', 'Módulo 6', 'Módulo 7'],
    //     datasets: [{
    //         label: 'Total de camiones',
    //         data: totales,
    //         backgroundColor: [
    //             '#439DF7',
    //             '#F75243',
    //             '#F79143',
    //             '#d3b239',
    //             '#2ba1a1',
    //             '#914DFA',
    //             '#A1A1A1'
    //         ],
    //         borderRadius: 0
    //     }]
    // };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.raw} camiones`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#fff' },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,.1)' }
                }
            }
        }
    };

    const ctx = document.getElementById('barrasChart').getContext('2d');

    // Evita duplicado
    if (window.barrasChartInstance) {
        window.barrasChartInstance.destroy();
    }

    window.barrasChartInstance = new Chart(ctx, config);
}