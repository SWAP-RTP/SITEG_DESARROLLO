let chartBase = null;

document.addEventListener("DOMContentLoaded", function () {
  init();
});

async function init() {
  const selModulo = document.getElementById("selModulo");
  const selMes = document.getElementById("selMes");

  // default al refrescar
  if (selModulo) selModulo.value = "ALL";
  if (selMes) selMes.value = "ALL";

  // primera carga
  const json = await cargarDatos("ALL", "ALL");
  if (!json) return;

  configurarSelectModulo(json);
  configurarSelectMes(json);

  pintarSupervisores(json.data || []);

  if (selModulo) {
    selModulo.onchange = async function () {
      const mod = normalizar(selModulo.value);
      const mes = selMes ? normalizar(selMes.value) : "ALL";
      const j = await cargarDatos(mod, mes);
      if (!j) return;
      pintarSupervisores(j.data || []);
    };
  }

  if (selMes) {
    selMes.onchange = async function () {
      const mod = selModulo ? normalizar(selModulo.value) : "ALL";
      const mes = normalizar(selMes.value);
      const j = await cargarDatos(mod, mes);
      if (!j) return;
      pintarSupervisores(j.data || []);
    };
  }
}

function normalizar(v) {
  v = String(v || "").trim();
  if (v === "") return "ALL";
  if (v.toLowerCase() === "all") return "ALL";
  return v;
}

async function cargarDatos(modulo, mes) {
  try {
    modulo = normalizar(modulo);
    mes = normalizar(mes);

    const url = "./supervisor.php?modulo=" + encodeURIComponent(modulo) + "&mes=" + encodeURIComponent(mes);
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
    sel.innerHTML = '<option value="' + moduloUsuario + '">Módulo ' + moduloUsuario + '</option>';
    sel.value = String(moduloUsuario);
    sel.disabled = true;
    return;
  }

  const modulos = json.modulos || [];
  let html = '<option value="ALL">Todos</option>';
  for (let i = 0; i < modulos.length; i++) {
    html += '<option value="' + modulos[i] + '">Módulo ' + modulos[i] + '</option>';
  }
  sel.innerHTML = html;
  sel.value = "ALL";
  sel.disabled = false;
}

function configurarSelectMes(json) {
  const sel = document.getElementById("selMes");
  if (!sel) return;

  const moduloUsuario = parseInt(json.modulo_usuario, 10) || 0;
  const meses = json.meses || [];

  let html = '<option value="ALL">Todos</option>';

  for (let i = 0; i < meses.length; i++) {
    html += '<option value="' + meses[i] + '">' + meses[i] + '</option>';
  }

  sel.innerHTML = html;
  sel.value = "ALL";
  sel.disabled = false;

  if (moduloUsuario !== 0 && meses.length === 0) {
    sel.innerHTML = '<option value="ALL">Todos</option>';
    sel.value = "ALL";
  }
}

function generarArcoirisPastel(n) {
  const colores = [];
  if (!n || n <= 0) return colores;

  const saturation = 45;
  const lightness = 78;

  for (let i = 0; i < n; i++) {
    const hue = Math.round((360 * i) / n);
    colores.push("hsl(" + hue + ", " + saturation + "%, " + lightness + "%)");
  }
  return colores;
}

function pintarSupervisores(rows) {
  const labels = [];
  const dataTotal = [];
  const meta = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    labels.push(String(r.id_supervisor));
    dataTotal.push(parseInt(r.total, 10) || 0);

    meta.push({
      id: r.id_supervisor,
      nombre: r.supervisor,
      modulo: r.modulo || "",
      mes: r.mes || "",
      total: r.total
    });
  }

  pintarChart(labels, dataTotal, meta);
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
          formatter: function (v) { return v; },
          font: { weight: "bold" }
        },
        tooltip: {
          callbacks: {
            title: function (items) {
              const i = items[0].dataIndex;
              return meta[i].nombre;
            },
            label: function (item) {
              const i = item.dataIndex;
              let txt = "Total: " + meta[i].total + " | Credencial: " + meta[i].id;
              if (meta[i].modulo) txt += " | Módulo: " + meta[i].modulo;
              if (meta[i].mes) txt += " | Mes: " + meta[i].mes;
              return txt;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Credencial Supervisor" },
          ticks: { autoSkip: false, maxRotation: 0 }
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}
