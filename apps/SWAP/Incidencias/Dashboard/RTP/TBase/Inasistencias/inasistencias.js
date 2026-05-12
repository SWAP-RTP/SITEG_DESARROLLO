let chartBase = null;
let cacheRows = [];

document.addEventListener("DOMContentLoaded", function () {
  init();
});

async function init() {
  const selModulo = document.getElementById("selModulo");
  const selMes = document.getElementById("selMes");

  if (selModulo) selModulo.value = "ALL";
  if (selMes) selMes.value = "0"; // Mes = Todos

  // primera carga
  const json = await cargarDatos(selModulo ? selModulo.value : "ALL");
  if (!json) return;

  cacheRows = json.data || [];

  configurarSelectModulo(json);
  configurarSelectMes(cacheRows);

  // pinta inicial
  pintarPorModuloFiltrado(cacheRows);

  // eventos
  if (selModulo) {
    selModulo.onchange = async function () {
      const j = await cargarDatos(selModulo.value);
      if (!j) return;

      cacheRows = j.data || [];
      configurarSelectMes(cacheRows);
      pintarPorModuloFiltrado(cacheRows);
    };
  }

  if (selMes) {
    selMes.onchange = function () {
      pintarPorModuloFiltrado(cacheRows);
    };
  }
}

async function cargarDatos(modulo) {
  try {
    const url = "./inasistencias.php?modulo=" + encodeURIComponent(modulo);
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

function configurarSelectMes(rows) {
  const selMes = document.getElementById("selMes");
  if (!selMes) return;


  const seleccionActual = selMes.value ? String(selMes.value) : "0";


  const set = {};
  for (let i = 0; i < rows.length; i++) {
    const mes = String(rows[i].mes || "").trim();
    if (mes) set[mes] = true;
  }

  const meses = Object.keys(set).sort(); // YYYY-MM

  let html = '<option value="0">Todos</option>';
  for (let j = 0; j < meses.length; j++) {
    html += '<option value="' + meses[j] + '">' + meses[j] + "</option>";
  }

  selMes.innerHTML = html;

 
  if (seleccionActual !== "0" && set[seleccionActual]) {
    selMes.value = seleccionActual;
  } else {
    selMes.value = "0";
  }
}

function pintarPorModuloFiltrado(rows) {
  const selMes = document.getElementById("selMes");
  const mesSel = selMes ? selMes.value : "0"; // 0 = Todos


  let filtrado = rows;
  if (mesSel !== "0") {
    filtrado = [];
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i].mes) === mesSel) filtrado.push(rows[i]);
    }
  }

  const map = {};
  for (let i = 0; i < filtrado.length; i++) {
    const mod = String(filtrado[i].modulo || "").trim();
    if (!mod) continue;

    const inas = parseInt(filtrado[i].inasistencias, 10) || 0;
    const anom = parseInt(filtrado[i].anomalias, 10) || 0;

    if (!map[mod]) map[mod] = { inas: 0, anom: 0 };
    map[mod].inas += inas;
    map[mod].anom += anom;
  }


  const mods = Object.keys(map).sort(function (a, b) {
    return parseInt(a, 10) - parseInt(b, 10);
  });

  const labels = [];
  const inasArr = [];
  const anomArr = [];

  for (let j = 0; j < mods.length; j++) {
    labels.push("Módulo " + mods[j]);
    inasArr.push(map[mods[j]].inas);
    anomArr.push(map[mods[j]].anom);
  }

  pintarChart(labels, inasArr, anomArr);
}

function pintarChart(labels, inas, anom) {
  const canvas = document.getElementById("chartBase");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (chartBase) chartBase.destroy();

  if (window.ChartDataLabels) Chart.register(ChartDataLabels);

  chartBase = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        { label: "Inasistencias", data: inas },
        { label: "Anomalías", data: anom }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        datalabels: {
          anchor: "end",
          align: "end",
          offset: 2,
          formatter: function (v) { return v; },
          font: { weight: "bold" }
        }
      },
      scales: {
        x: { ticks: { autoSkip: false, maxRotation: 0 } },
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}
