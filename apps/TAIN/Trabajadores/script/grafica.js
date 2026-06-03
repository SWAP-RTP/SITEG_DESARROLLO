export function graficaTrabajadores(datos) {

    const main = document.querySelector('main');
    const isLight = main ? main.classList.contains('light') : false;

    const textColor = isLight ? '#333' : '#fff';
    const gridColor = isLight ? '#ccc' : '#444';
    const bgColor = isLight ? '#fff' : '#1b1b1b';

    const canvas = document.getElementById('grafModulos');

    // FONDO DINÁMICO
    canvas.style.backgroundColor = bgColor;

    // FORZAR REDIMENSIÓN (evita bug blanco)
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');

    if (window.pastelChartInstance) {
        window.pastelChartInstance.destroy();
    }

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

    window.pastelChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
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
        },
        options: {
            responsive: true,           // Hace que la gráfica se adapte al tamaño del contenedor
            maintainAspectRatio: false,  // Permite que la gráfica tome el alto que definas en el CSS/HTML
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                y: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });

    // REGISTRO GLOBAL
    window.graficasRegistradas = window.graficasRegistradas || [];

    window.graficasRegistradas = window.graficasRegistradas.filter(g => g.id !== 'grafModulos');

    window.graficasRegistradas.push({
        id: 'grafModulos',
        render: () => graficaTrabajadores(datos)
    });
}