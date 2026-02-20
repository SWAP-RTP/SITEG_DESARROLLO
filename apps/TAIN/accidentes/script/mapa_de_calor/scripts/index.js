// Evento submit del formulario (por si aún existe el botón)
document.getElementById('formulario').addEventListener('submit', submitGetReporte);

// Flatpickr para la fecha inicial
const fpInicio = flatpickr("#fecha_hora_inicial", {
    dateFormat: "Y-m-d",
    time_24hr: true,
    locale: "es",
    defaultDate: "2025-01-01"
});

// Flatpickr para la fecha final
const fpFinal = flatpickr("#fecha_hora_final", {
    dateFormat: "Y-m-d",
    time_24hr: true,
    locale: "es",
    defaultDate: "2025-12-31"
});

// ---- Ejecutar automáticamente cuando todo esté cargado ----
window.addEventListener('load', () => {
    // Esperar un pequeño tiempo para asegurar que Flatpickr cargó
    setTimeout(() => {
        submitGetReporte(new Event('auto'));
    }, 300);
});

// Función que maneja el evento submit
async function submitGetReporte(event) {
    event.preventDefault();

    let fecha_inicial = document.getElementById('fecha_hora_inicial').value;
    let fecha_final   = document.getElementById('fecha_hora_final').value;

    if (!fecha_inicial || !fecha_final) {
        alert('Por favor selecciona las fechas.');
        return;
    }

    try {
        const response = await fetch(`api/datos.php?fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}`);
        const data = await response.json();

        if (!data.ok || !Array.isArray(data.data)) {
            alert("Error en la respuesta del servidor.");
            return;
        }

        const puntos = data.data.map(item => [item.lat, item.lng, item.count]);

        const totalEventos = data.data.reduce((sum, item) => sum + (item.count || 0), 0);
        document.getElementById('numero_eventos').value = totalEventos;

        mostrarMapaCalor(puntos);

    } catch (error) {
        console.error("Error en fetch:", error);
        alert("Ocurrió un error al obtener los datos.");
    }
}

function mostrarMapaCalor(puntos) {
    if (window.heatLayer) {
        map.removeLayer(window.heatLayer);
    }

    window.heatLayer = L.heatLayer(puntos, {
        radius: 25,
        maxZoom: 13,
        minOpacity: 0.4,
        max: 10
    }).addTo(map);
}
