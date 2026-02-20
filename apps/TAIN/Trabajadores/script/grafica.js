export function grafica_trabajadores(datos) {
    const labels = [
        'Modulo 1', 'Modulo 2', 'Modulo 3', 'Modulo 4', 'Modulo 5', 'Modulo 6', 'Modulo 7', 'O.Centrales'
    ];

    const activos = [
        datos.detalle["1"].totaltrabact || 0,
        datos.detalle["2"].totaltrabact || 0,
        datos.detalle["3"].totaltrabact || 0,
        datos.detalle["4"].totaltrabact || 0,
        datos.detalle["5"].totaltrabact || 0,
        datos.detalle["6"].totaltrabact || 0,
        datos.detalle["7"].totaltrabact || 0,
        datos.detalle["0"].totaltrabact || 0
    ];

    const inactivos = [
        datos.detalle["1"].totaltrabinact || 0,
        datos.detalle["2"].totaltrabinact || 0,
        datos.detalle["3"].totaltrabinact || 0,
        datos.detalle["4"].totaltrabinact || 0,
        datos.detalle["5"].totaltrabinact || 0,
        datos.detalle["6"].totaltrabinact || 0,
        datos.detalle["7"].totaltrabinact || 0,
        datos.detalle["0"].totaltrabinact || 0
    ];

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Activos',
                data: activos,
                backgroundColor: '#77b824'
            },
            {
                label: 'Inactivos',
                data: inactivos,
                backgroundColor: '#800020'
            }
        ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#FFFFFF',
                        boxWidth: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#FFFFFF'
                    }
                },
                y: {
                    ticks: {
                        color: '#FFFFFF'
                    }
                }
            }
        }
    };

    const canvas = document.getElementById('grafModulos');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const ctx = document.getElementById('grafModulos').getContext('2d');

    if (window.pastelChartInstance) {
        window.pastelChartInstance.destroy();
    }

    window.pastelChartInstance = new Chart(ctx, config);
}