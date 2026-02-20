document.addEventListener("DOMContentLoaded", () => {

    // === GRÁFICO FRECUENCIA ===
    const ctx1 = document.getElementById("graficoFrecuencia");
    new Chart(ctx1, {
        type: "line",
        data: {
            labels: ["10:00", "10:30", "11:00", "11:30", "12:00"],
            datasets: [
                {
                    label: "Frecuencia Real (min)",
                    data: [10, 12, 9, 11, 13],
                    borderWidth: 3,
                    borderColor: "#00d4ff",
                    tension: 0.4
                },
                {
                    label: "Frecuencia Objetivo (min)",
                    data: [10, 10, 10, 10, 10],
                    borderWidth: 2,
                    borderColor: "#ffaa00",
                    borderDash: [5, 5],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: "#fff" }}},
            scales: {
                x: { ticks: { color: "#ccc" }},
                y: { ticks: { color: "#ccc" }}
            }
        }
    });

    // === GRÁFICO OCUPACIÓN ===
    const ctx2 = document.getElementById("graficoOcupacion");
    new Chart(ctx2, {
        type: "bar",
        data: {
            labels: ["Eco 7784", "Eco 6621", "Eco 5502", "Eco 8891"],
            datasets: [{
                label: "Ocupación (%)",
                data: [68, 74, 52, 89],
                backgroundColor: "#00ff99"
            }]
        },
        options: {
            plugins: { legend: { labels: { color: "#fff" }}},
            scales: {
                x: { ticks: { color: "#ccc" }},
                y: { ticks: { color: "#ccc" }}
            }
        }
    });

});
