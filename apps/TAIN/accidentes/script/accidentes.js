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

// FUNCIÓN: CARGAR TOTAL POR DÍA
function cargarTotalPorDia(fecha) {
    const fechaInput = document.getElementById("fechaAccidentes");
    const totalDiaElemento = document.getElementById("totalDia");
    const fechaSeleccionadaElemento = document.getElementById("fechaSeleccionada");

    const cards = document.querySelectorAll(".card3");

    fetch(`query_sql/accidentes_por_fecha.php?fecha=${fecha}`)
        .then(response => response.json())
        .then(resp => {
            // console.log("Respuesta total día:", resp);
            const total_dias = Number(resp.total_dia);
            const div = document.getElementById("totalDia");

            // Mostrar cards
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add("show");
                }, index * 300);
            });

            setTimeout(() => {
                div.innerHTML = `
                    <div class="d-flex justify-content-center">
                        <div class="loader2"></div>
                    </div>
                `;
            }, cards.length * 300);

            // Mostrar valor con conteo 
            setTimeout(() => {
                animarNumero(div, total_dias);
            }, (cards.length * 300) + 1000);

            $("#fechaSeleccionada").text(fecha);
        })
        .catch(error => {
            console.error("Error total por día:", error);
        });
}

// ALCALDÍA MÁS ACCIDENTADA
function cargarAlcaldiaMasAccidentada() {
    const cards = document.querySelectorAll(".card3");
    const div = document.getElementById("bloque1");

    // Mostrar cards
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("show");
        }, index * 300);
    });

    setTimeout(() => {
        div.innerHTML = `
            <div class="d-flex justify-content-center">
                <div class="loader2"></div>
            </div>
        `;
    }, cards.length * 300);

    fetch("query_sql/alcaldia_accidentes.php")
        .then(response => response.json())
        .then(resp => {
            // console.log("Respuesta alcaldía:", resp);
            const data = resp.data;

            setTimeout(() => {
                if (div && data) {
                    div.innerText = `${data.descripcion} (${data.total})`;
                }
            }, 1500);
        })
        .catch(error => {
            console.error("Error alcaldía:", error);
        });
}

// ACCIDENTES PROCESO
function cargarAccidentesAbiertos() {
    const cards = document.querySelectorAll(".card3");

    fetch("query_sql/accidentes_abiertos.php")
        .then(response => response.json())
        .then(resp => {
            // console.log("Respuesta abiertos:", resp);
            const total_accidAbiertos = Number(resp.total_abiertos);
            const div = document.getElementById("bloque2");

            // Mostrar cards
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add("show");
                }, index * 300);
            });

            setTimeout(() => {
                div.innerHTML = `
                    <div class="d-flex justify-content-center">
                        <div class="loader2"></div>
                    </div>
                `;
            }, cards.length * 300);

            // Mostrar valor con conteo 
            setTimeout(() => {
                animarNumero(div, total_accidAbiertos);
            }, (cards.length * 300) + 1000);
        })
        .catch(error => {
            console.error("Error abiertos:", error);
        });
}

// OPERADOR CON MÁS ACCIDENTES
function cargarOperadorMasAccidentes() {
    const cards = document.querySelectorAll(".card3");
    const div = document.getElementById("bloque3");

    // Mostrar cards
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("show");
        }, index * 300);
    });

    setTimeout(() => {
        div.innerHTML = `
            <div class="d-flex justify-content-center">
                <div class="loader2"></div>
            </div>
        `;
    }, cards.length * 300);

    fetch("query_sql/accidentes_operador.php")
        .then(response => response.json())
        .then(resp => {
            // console.log("Respuesta operador:", resp);
            const data = resp.data;
            setTimeout(() => {
                if (div && data) {
                    div.innerText = `${data.operador_credencial} - ${data.nombre_completo} (${data.total_accidentes})`;
                }
            }, 1500);
        })
        .catch(error => {
            console.error("Error operador:", error);
        });
}

// ACCIDENTE MÁS FRECUENTE
function cargarAccidenteFrecuente() {
    const cards = document.querySelectorAll(".card3");
    const div = document.getElementById("bloque4");

    // Mostrar cards
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("show");
        }, index * 300);
    });

    setTimeout(() => {
        div.innerHTML = `
            <div class="d-flex justify-content-center">
                <div class="loader2"></div>
            </div>
        `;
    }, cards.length * 300);

    fetch("query_sql/accidente_frecuente.php")
        .then(response => response.json())
        .then(resp => {
            // console.log("Respuesta operador:", resp);
            const data = resp.data;
            setTimeout(() => {
                if (div && data) {
                    div.innerText = `${data.descripcion} (${data.total})`;
                }
            }, 2000);
        })
        .catch(error => {
            console.error("Error operador:", error);
        });
}

// GRÁFICA: ACCIDENTES POR MÓDULO
function grafica_accidentes_x_modulo() {
    const main = document.querySelector('main');
    const isLight = main ? main.classList.contains('light') : false;
    const textColor = isLight ? '#333333' : '#ffffff';

    fetch("query_sql/accidentes_por_modulo.php")
        .then(response => {
            if (!response.ok) throw new Error("Error en la red");
            return response.json();
        })
        .then(resp => {
            // console.log("Datos recibidos:", resp);

            const labels = resp.data.map(item => item.modulo);
            const totalesM = resp.data.map(item => Number(item.total));

            const colores = [
                "#22c55e", 
                "#06b6d4", 
                "#3b82f6", 
                "#f97316", 
                "#eab308", 
                "#a855f7", 
                "#ef4444"
            ];

            const data = {
                labels: labels,
                datasets: [{
                    data: totalesM,
                    backgroundColor: colores,
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            };

            const config = {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    cutout: '50%',
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

            const ctx = document.getElementById('pastelChart').getContext('2d');

            /*
                - TODAS LAS FUNCIONES CON GRAFICAS TIENEN QUE EMPEZAR CON LA PALABRA "grafica_"
                - PARA RECARGAR LAS GRAFICAS CUANDO SE APLICA EL CAMBIO DE COLOR (MODO DARCK A LINGHT)
            */

            //Evita que se duplique al refrescar
            if (window.pastelChartInstance) {
                window.pastelChartInstance.destroy();
            }

            window.pastelChartInstance = new Chart(ctx, config);

            // REGISTRO GLOBAL
            window.graficasRegistradas = window.graficasRegistradas || [];

            window.graficasRegistradas = window.graficasRegistradas.filter(g => g.id !== 'grafPastel');

            window.graficasRegistradas.push({
                id: 'grafPastel',
                render: grafica_accidentes_x_modulo
            });

        })
        .catch(error => {
            console.error("Error:", error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const fechaInput = document.getElementById("fechaAccidentes");
    // CARGAR AL INICIAR
    cargarTotalPorDia(fechaInput.value);
    // CUANDO CAMBIA LA FECHA
    fechaInput.addEventListener("change", function () {
        cargarTotalPorDia(this.value);
    });
    cargarAccidentesAbiertos();
    cargarOperadorMasAccidentes();
    cargarAccidenteFrecuente(); 
    cargarAlcaldiaMasAccidentada();
    grafica_accidentes_x_modulo();
});