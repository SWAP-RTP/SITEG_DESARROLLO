let chartTop5 = null;
let chartResto = null;

document.addEventListener("DOMContentLoaded", function () {
  init();
});

async function init() {
  const selModulo = document.getElementById("selModulo");
  const selMes = document.getElementById("selMes");

  if (selModulo) selModulo.value = "all";
  if (selMes) selMes.value = "all";

  await cargarGraficas(true);

  if (selModulo) {
    selModulo.onchange = async function () {
      await cargarGraficas(false);
    };
  }

  if (selMes) {
    selMes.onchange = async function () {
      await cargarGraficas(false);
    };
  }
}

async function cargarGraficas(llenarSelects) {
  try {
    const selModulo = document.getElementById("selModulo");
    const selMes = document.getElementById("selMes");

    const modulo = selModulo ? (selModulo.value || "all") : "all";
    const mes = selMes ? (selMes.value || "all") : "all";

    const url =
      "./GAnomalias.php?modulo=" +
      encodeURIComponent(modulo) +
      "&mes=" +
      encodeURIComponent(mes);

    const resp = await fetch(url, { cache: "no-store" });
    const json = await resp.json();

    if (!json.success) {
      console.error(json.message || "Error en PHP");
      return;
    }

    if (llenarSelects) {
      configurarSelectModulo(json); 
      configurarSelectMes(json.meses || []);
    }

    const top5 = json.top5 || [];
    const resto = json.resto || [];

    pintarTop5(top5);
    pintarResto(resto);
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

function configurarSelectModulo(json) {
  const sel = document.getElementById("selModulo");
  if (!sel) return;

  const moduloUsuario = parseInt(json.modulo_usuario, 10) || 0;

  if (moduloUsuario !== 0) {
    sel.innerHTML =
      '<option value="' +
      moduloUsuario +
      '">Módulo ' +
      moduloUsuario +
      "</option>";
    sel.value = String(moduloUsuario);
    sel.disabled = true;
    return;
  }
  const modulos = json.modulos || [];
  let html = '<option value="all">Todos</option>';

  for (let i = 0; i < modulos.length; i++) {
    html +=
      '<option value="' +
      modulos[i] +
      '">Módulo ' +
      modulos[i] +
      "</option>";
  }

  sel.innerHTML = html;
  sel.disabled = false;
  const aplicado = (json.modulo_aplicado || "all").toString().toLowerCase();
  sel.value = aplicado;
}

function configurarSelectMes(meses) {
  const sel = document.getElementById("selMes");
  if (!sel) return;

  const actual = sel.value ? String(sel.value) : "all";

  let html = '<option value="all">Todos</option>';
  for (let i = 0; i < meses.length; i++) {
    html += '<option value="' + meses[i] + '">' + meses[i] + "</option>";
  }
  sel.innerHTML = html;
  sel.value = meses.indexOf(actual) !== -1 ? actual : "all";
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

function asegurarDatalabels() {
  if (window.ChartDataLabels) {
    Chart.register(ChartDataLabels);
  }
}

function pintarTop5(rows) {
  const labels = [];
  const data = [];

  for (let i = 0; i < rows.length; i++) {
    labels.push(rows[i].descripcion);
    data.push(parseInt(rows[i].total, 10) || 0);
  }

  crearBar(
    "chartTop5",
    "Top 5 anomalías",
    labels,
    data,
    function (ch) {
      chartTop5 = ch;
    },
    chartTop5
  );
}

function pintarResto(rows) {
  const labels = [];
  const data = [];

  for (let i = 0; i < rows.length; i++) {
    labels.push(rows[i].descripcion);
    data.push(parseInt(rows[i].total, 10) || 0);
  }

  crearBar(
    "chartResto",
    "Resto de anomalías",
    labels,
    data,
    function (ch) {
      chartResto = ch;
    },
    chartResto
  );
}

function crearBar(canvasId, titulo, labels, data, setChart, oldChart) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error("No existe canvas #" + canvasId);
    return;
  }

  const ctx = canvas.getContext("2d");
  if (oldChart) oldChart.destroy();

  asegurarDatalabels();

  const colores = generarArcoirisPastel(data.length);

  const ch = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total",
          data: data,
          backgroundColor: colores,
          borderColor: "#6b7280",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: titulo },
        datalabels: {
          anchor: "end",
          align: "end",
          formatter: function (v) {
            return v;
          },
          font: { weight: "bold" }
        },
        tooltip: {
          callbacks: {
            label: function (item) {
              return "Total: " + item.raw;
            }
          }
        }
      },
      scales: {
        x: { ticks: { display: false }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });

  setChart(ch);
}
