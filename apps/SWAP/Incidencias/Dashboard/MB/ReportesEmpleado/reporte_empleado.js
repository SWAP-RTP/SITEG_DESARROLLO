let chartBase = null;

document.addEventListener("DOMContentLoaded", function () {
  init();
});

async function init() {
  const sel = document.getElementById("selModulo");

  if (sel) sel.value = "ALL";

  const json = await cargarDatos("ALL");
  if (!json) return;

  configurarSelectModulo(json);

  if (sel && (parseInt(json.modulo_usuario, 10) || 0) === 0) sel.value = "ALL";

  pintarTopEmpleados(json.data || []);

  if (sel) {
    sel.onchange = async function () {
      const val = sel.value && sel.value.trim() ? sel.value : "ALL";
      const j = await cargarDatos(val);
      if (!j) return;
      pintarTopEmpleados(j.data || []);
    };
  }
}

async function cargarDatos(modulo) {
  try {
    const url = "./reporte_empleado.php?modulo=" + encodeURIComponent(modulo || "ALL");
    const resp = await fetch(url, { cache: "no-store" });
    const json = await resp.json();

    if (!json.success) {
      console.error(json.message || "Error en PHP");
      return null;
    }
    return json;
  } catch (e) {
    console.error("Fetch error:", e);
    return null;
  }
}

function configurarSelectModulo(json) {
  const sel = document.getElementById("selModulo");
  if (!sel) return;

  const moduloUsuario = parseInt(json.modulo_usuario, 10) || 0;

  if (moduloUsuario !== 0) {
    sel.innerHTML = '<option value="' + moduloUsuario + '">Módulo ' + moduloUsuario + "</option>";
    sel.value = String(moduloUsuario);
    sel.disabled = true;
    return;
  }

  const modulos = json.modulos || [];
  let html = '<option value="ALL">Todos</option>';

  for (let i = 0; i < modulos.length; i++) {
    html += '<option value="' + modulos[i] + '">Módulo ' + modulos[i] + "</option>";
  }

  sel.innerHTML = html;
  sel.value = "ALL";
  sel.disabled = false;
}

function pintarTopEmpleados(rows) {
  const labels = [];
  const dataTotal = [];
  const meta = [];

  for (let i = 0; i < rows.length; i++) {
    const emp = rows[i];

    labels.push(String(emp.credencial));
    dataTotal.push(parseInt(emp.total, 10) || 0);

    meta.push({
      credencial: emp.credencial,
      empleado: emp.empleado,
      modulo: emp.modulo,
      total: emp.total,
      inas: emp.inasistencias,
      anom: emp.anomalias
    });
  }

  pintarChart(labels, dataTotal, meta);
}
function generarArcoirisPastel(n) {
  const colores = [];
  if (!n || n <= 0) return colores;

  const saturation = 45; 
  const lightness = 78;  

  for (let i = 0; i < n; i++) {
    const hue = Math.round((360 * i) / n); 
    colores.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colores;
}

function pintarChart(labels, dataTotal, meta) {
  const canvas = document.getElementById("chartBase");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (chartBase) chartBase.destroy();

  if (window.ChartDataLabels) Chart.register(ChartDataLabels);

  const colores = generarArcoirisPastel(dataTotal.length);

  chartBase = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Total de reportes",
        data: dataTotal,
        backgroundColor: colores,
        borderColor: "#6b7280",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        datalabels: {
          anchor: "end",
          align: "end",
          formatter: function(v){ return v; },
          font: { weight: "bold" }
        },
        tooltip: {
          callbacks: {
            title: function(items) {
              const i = items[0].dataIndex;
              return meta[i].empleado;
            },
            label: function(item) {
              const i = item.dataIndex;
              return "Total: " + meta[i].total + " | Módulo: " + meta[i].modulo;
            },
            afterLabel: function(item) {
              const i = item.dataIndex;
              return [
                "Credencial: " + meta[i].credencial,
                "Inasistencias: " + meta[i].inas,
                "Anomalías: " + meta[i].anom
              ];
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: "Credencial" } },
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}
