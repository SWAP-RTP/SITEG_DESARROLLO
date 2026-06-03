// CARDS
window.addEventListener("load", function () {
    // animacion de carga con loader2 de todos los card3
    // nota: no se ocupa el loader por que es el principal del sinteg
    const cards = document.querySelectorAll(".card3");

    const valores = {
        cardPrev: 420,
        cardCorr: 185,
        cardEsp: 32,
        cardDisp: 84,

        indEnRuta: (240 / 300 * 100).toFixed(1),
        indOperables: (260 / 300 * 100).toFixed(1),
        indMantoRatio: (150 / 200 * 760).toFixed(2),
    };

    for (const id in valores) {
        const el = document.getElementById(id);
        if (el) {
            if (id === "indMantoRatio") {
                el.textContent = valores[id];
            } else {
                el.textContent = valores[id] + "%";
            }
        }
    }

    // Animación cards 
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("show");
        }, index * 300);
    });

    // Simbolo de carga de numeros
    Object.keys(valores).forEach((id, index) => {
        const div = document.getElementById(id);

        if (!div) {
            console.warn("No se encontró el elemento:", id);
            return;
        }

        div.innerHTML = `
            <div class="d-flex justify-content-center">
                <div class="loader2"></div>
            </div>
        `;

        // Mostrar valor al cargar
        setTimeout(() => {
            animarNumero(div, valores[id], id === "cardDisp");
        }, 1000 + (index * 400));
    });

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
// ==============================
// CUMPLIMIENTO PREVENTIVO
// ==============================
    const ctxPrev = document.getElementById('grafPrevCumplimiento');
    if (ctxPrev) {
        new Chart(ctxPrev, {
            type: 'doughnut',
            data: {
                labels: ['PENDIENTE', 'COMPLETADO'],
                datasets: [{
                    data: [28, 72],
                    backgroundColor: [
                        "#e91616ff",  
                        "#0958ebff"  
                    ],
                    borderColor: [
                        "rgba(233, 22, 22, 1)",
                        "rgba(13, 102, 235, 1)"
                    ]
                }]
            }
        });
    }

// ==============================
//  CORRECTIVOS POR TIPO 
// ==============================
const ctxCorr = document.getElementById('grafCorrectivoTipo');
if (ctxCorr) {
    new Chart(ctxCorr, {
        type: 'line',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'], 
            datasets: [
                {
                    label: 'Motor',
                    data: [120, 100, 90, 130, 140, 150],
                    borderWidth: 3,
                    tension: 0.35,
                },
                {
                    label: 'Frenos',
                    data: [68, 70, 65, 75, 80, 82],
                    borderWidth: 3,
                    tension: 0.35,
                },
                {
                    label: 'Transmisión',
                    data: [25, 30, 22, 28, 35, 40], 
                    borderWidth: 3,
                    tension: 0.35,
                },
                {
                    label: 'Eléctrico',
                    data: [42, 50, 45, 48, 55, 60],
                    borderWidth: 3,
                    tension: 0.35,
                },
                {
                    label: 'Climatización',
                    data: [10, 12, 15, 14, 18, 20],
                    borderWidth: 3,
                    tension: 0.35,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            }
        }
    });
}



    // ==============================
    //  TIEMPOS PROMEDIO (BARRAS)
    // ==============================
    const ctxTime = document.getElementById('grafTiempos');
    if (ctxTime) {
        new Chart(ctxTime, {
            type: 'bar',
            data: {
                labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
                datasets: [
                    {
                        label: 'Objetivo (horas)',
                        data: [24, 24, 24, 24],
                        backgroundColor: 'rgba(75,192,192,0.6)',
                        borderColor: '#4bc0c0',
                        borderWidth: 2
                    },
                    {
                        label: 'Real (horas)',
                        data: [30, 28, 32, 29],
                        backgroundColor: 'rgba(255,99,132,0.6)',
                        borderColor: '#ff6384',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    }
                }
            }
        });
    }


    // ==============================
    //  DISPONIBILIDAD FLOTA
    // ==============================
    const ctxDisp = document.getElementById('grafDisponibilidad');
    if (ctxDisp) {
        new Chart(ctxDisp, {
            type: 'doughnut',
            data: {
                labels: ['Disponibles', 'En taller'],
                datasets: [{
                    data: [1120, 330]
                }]
            }
        });
    }
});














function dataTable_mantenimiento() {
    if ($.fn.DataTable.isDataTable('.dataTable_generica')) {
        $('.dataTable_generica').DataTable().destroy();
    }

    const thead = document.querySelector('.dataTable_generica thead tr');

    // Limpiar por si ya tiene contenido
    thead.innerHTML = '';

    thead.innerHTML = `
        <th>Folio</th>
        <th>Fecha</th>
        <th>Económico</th>
        <th>Tipo Servicio</th>
        <th>Estatus</th>
        <th>Módulo</th>
    `;

    const data = [
        {
            "folio": "1",
            "fecha": "11-14-2025",
            "economico": "90625",
            "tipo_servicio": "correctivo",
            "estatus": "abierto",
            "modulo": "3",
        },  
        {
            "folio": "2",
            "fecha": "11-14-2025",
            "economico": "90626",
            "tipo_servicio": "preventivo",
            "estatus": "en proceso",
            "modulo": "3",
        },  
    ];

    $('.tituloDataTable').html("Órdenes de Mantenimiento");

    $('.dataTable_generica').DataTable({
        data: data, 
        responsive: true,
        scrollX: true,
        autoWidth: false,

        columns: [
            { data: "folio", className: "text-center"},
            { data: "fecha", className: "text-center"},
            { data: "economico", className: "text-center"},
            { data: "tipo_servicio", className: "text-center"},
            { data: "estatus", className: "text-center"},
            { data: "modulo", className: "text-center"},
        ],
        language: {
            url: "/lib/datatables.net-1.13.6/es-ES.json",
        }
    });


}

document.addEventListener('DOMContentLoaded', () => {
    dataTable_mantenimiento();
});