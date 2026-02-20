// CARDS
window.addEventListener("load", function () {

    const cards = document.querySelectorAll(".card-resumen");

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

        div.innerHTML = `<div class="loader"></div>`;

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

    // =====================================================
    //  TABLA MANTENIMIENTO
    // =====================================================
    const tabla = document.getElementById('tablaMantenimiento');
    if (!tabla) return;

    const tbody = tabla.querySelector('tbody');
    const filas = Array.from(tbody.querySelectorAll('tr'));
    const inputsFiltro = tabla.querySelectorAll('thead input');
    const pagDiv = document.getElementById('paginacionMant');

    const filasPorPagina = 10;
    let paginaActual = 1;
    let filtros = ['', '', '', '', '', ''];

    function obtenerFilasFiltradas() {
        return filas.filter(fila => {
            const celdas = fila.querySelectorAll('td');
            for (let i = 0; i < filtros.length; i++) {
                const textoFiltro = filtros[i].trim().toLowerCase();
                if (textoFiltro !== '') {
                    const textoCelda = (celdas[i].innerText || '').toLowerCase();
                    if (!textoCelda.includes(textoFiltro)) {
                        return false;
                    }
                }
            }
            return true;
        });
    }

    function renderTabla() {
        const filtradas = obtenerFilasFiltradas();
        const totalFilas = filtradas.length;
        const totalPaginas = Math.ceil(totalFilas / filasPorPagina) || 1;

        if (paginaActual > totalPaginas) paginaActual = totalPaginas;

        filas.forEach(f => f.style.display = 'none');

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginaFilas = filtradas.slice(inicio, fin);
        paginaFilas.forEach(f => f.style.display = '');

        pagDiv.innerHTML = '';

        const btnPrev = document.createElement('button');
        btnPrev.textContent = 'Anterior';
        btnPrev.disabled = paginaActual === 1;
        btnPrev.onclick = () => {
            if (paginaActual > 1) {
                paginaActual--;
                renderTabla();
            }
        };
        pagDiv.appendChild(btnPrev);

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            if (i === paginaActual) btn.classList.add('activo');
            btn.onclick = () => {
                paginaActual = i;
                renderTabla();
            };
            pagDiv.appendChild(btn);
        }

        const btnNext = document.createElement('button');
        btnNext.textContent = 'Siguiente';
        btnNext.disabled = paginaActual === totalPaginas;
        btnNext.onclick = () => {
            if (paginaActual < totalPaginas) {
                paginaActual++;
                renderTabla();
            }
        };
        pagDiv.appendChild(btnNext);
    }

    inputsFiltro.forEach((input, index) => {
        input.addEventListener('input', () => {
            filtros[index] = input.value;
            paginaActual = 1;
            renderTabla();
        });
    });

    renderTabla();
    // 👆 NO CERRAR AQUÍ CON "});"

    // =====================================================
    // BOTÓN COPIAR
    // =====================================================
    document.getElementById("btnCopiar").addEventListener("click", () => {
        const filasFiltradas = obtenerFilasFiltradas();
        let texto = "";

        filasFiltradas.forEach(fila => {
            const celdas = Array.from(fila.querySelectorAll("td"))
                .map(c => c.innerText.trim());
            texto += celdas.join("\t") + "\n";
        });

        navigator.clipboard.writeText(texto).then(() => {
            alert("Contenido copiado al portapapeles");
        });
    });

    // =====================================================
    // BOTÓN CSV
    // =====================================================
    document.getElementById("btnCSV").addEventListener("click", () => {
        const filasFiltradas = obtenerFilasFiltradas();
        let csv = "";

        filasFiltradas.forEach(fila => {
            const celdas = Array.from(fila.querySelectorAll("td"))
                .map(c => `"${c.innerText.replace(/"/g, '""')}"`);
            csv += celdas.join(",") + "\n";
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "mantenimiento.csv";
        a.click();
        URL.revokeObjectURL(url);
    });

    // =====================================================
    // BOTÓN PDF
    // =====================================================
    document.getElementById("btnPDF").addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const filasFiltradas = obtenerFilasFiltradas().map(fila =>
            Array.from(fila.querySelectorAll("td")).map(c => c.innerText)
        );

        doc.autoTable({
            head: [Array.from(tabla.querySelectorAll("thead th")).map(th => th.innerText)],
            body: filasFiltradas
        });

        doc.save("mantenimiento.pdf");
    });

    });