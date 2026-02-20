document.addEventListener('DOMContentLoaded', function () {
    const fechaInput = document.getElementById("fechaAccidentes");
    const totalDiaElemento = document.getElementById("totalDia");
    const fechaSeleccionadaElemento = document.getElementById("fechaSeleccionada");
    // FUNCIÓN: CARGAR TOTAL POR DÍA
    function cargarTotalPorDia(fecha) {
        fetch(`query_sql/accidentes_por_fecha.php?fecha=${fecha}`)
            .then(response => response.json())
            .then(resp => {
                console.log("Respuesta total día:", resp);
                if (!resp.ok) return;
                fechaSeleccionadaElemento.innerText = fecha;
                totalDiaElemento.innerText = resp.total_dia;})
            .catch(error => {
                console.error("Error total por día:", error);
            });
    }

    // CARGAR AL INICIAR
    cargarTotalPorDia(fechaInput.value);


    // CUANDO CAMBIA LA FECHA
    fechaInput.addEventListener("change", function () {
        cargarTotalPorDia(this.value);
    });


    // GRÁFICA: ACCIDENTES POR MÓDULO
    const lienzoModulo = document.getElementById("grafTiempoLineal");

    if (lienzoModulo) {

        fetch("query_sql/accidentes_por_modulo.php")
            .then(response => response.json())
            .then(resp => {

                console.log("Respuesta API módulos:", resp);

                if (!resp.ok) return;

                document.getElementById("totalAccidentes").innerText = resp.total_general;

                const labels = [];
                const valores = [];

                resp.data.forEach(item => {
                    labels.push(item.modulo);
                    valores.push(parseInt(item.total));
                });

                // MÓDULO CON MÁS ACCIDENTES
                // const moduloMayor = resp.data.reduce((max, item) =>
                //     parseInt(item.total) > parseInt(max.total) ? item : max
                // );

                // document.getElementById("bloque1").innerText =
                //     `${moduloMayor.modulo} (${moduloMayor.total})`;

                new Chart(lienzoModulo, {
                    type: "doughnut",
                    data: {
                        labels: labels,
                        datasets: [{
                            data: valores,
                            backgroundColor: [
                                "#22c55e",
                                "#06b6d4",
                                "#3b82f6",
                                "#f97316",
                                "#eab308",
                                "#a855f7",
                                "#ef4444"
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

            })
            .catch(error => {
                console.error("Error módulos:", error);
            });
    }

        // ACCIDENTES PROCESO
            function cargarAccidentesAbiertos() {
                fetch("query_sql/accidentes_abiertos.php")
                    .then(response => response.json())
                    .then(resp => {
                        console.log("Respuesta abiertos:", resp);
                        if (!resp.ok) return;

                        document.getElementById("bloque2").innerText = resp.total_abiertos;
                    })
                    .catch(error => {
                        console.error("Error abiertos:", error);
                    });
            }

            cargarAccidentesAbiertos();

            // OPERADOR CON MÁS ACCIDENTES
            function cargarOperadorMasAccidentes() {
                fetch("query_sql/accidentes_operador.php")
                    .then(response => response.json())
                    .then(resp => {
                        console.log("Respuesta operador:", resp);
                        if (!resp.ok) return;

                        const data = resp.data;

                        if (!data) return;

                        document.getElementById("bloque3").innerText =
                            `${data.operador_credencial} - ${data.nombre_completo} (${data.total_accidentes})`;
                    })
                    .catch(error => {
                        console.error("Error operador:", error);
                    });
            }

            cargarOperadorMasAccidentes();

            // ACCIDENTE MÁS FRECUENTE
            function cargarAccidenteFrecuente() {
                fetch("query_sql/accidente_frecuente.php")
                    .then(response => response.json())
                    .then(resp => {
                        console.log("Respuesta accidente frecuente:", resp);
                        if (!resp.ok) return;

                        const data = resp.data;
                        if (!data) return;

                        document.getElementById("bloque4").innerText =
                            `${data.descripcion} (${data.total})`;
                    })
                    .catch(error => {
                        console.error("Error accidente frecuente:", error);
                    });
            }

            cargarAccidenteFrecuente(); 

            // ALCALDÍA MÁS ACCIDENTADA
            function cargarAlcaldiaMasAccidentada() {
                fetch("query_sql/alcaldia_accidentes.php")
                    .then(response => response.json())
                    .then(resp => {
                        console.log("Respuesta alcaldía:", resp);
                        if (!resp.ok) return;

                        const data = resp.data;
                        if (!data) return;

                        document.getElementById("bloque1").innerText =
                            `${data.descripcion} (${data.total})`;
                    })
                    .catch(error => {
                        console.error("Error alcaldía:", error);
                    });
            }

            cargarAlcaldiaMasAccidentada();

});
