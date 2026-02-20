document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);

  // Chart.js oscuro
  Chart.defaults.color = '#ffffff';
  Chart.defaults.font.family = 'Arial';
  Chart.defaults.plugins.legend.labels.color = '#ffffff';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.10)';

  const charts = {}; 

  function destroyChart(key){
    if (charts[key]) {
      charts[key].destroy();
      charts[key] = null;
    }
  }

  // ======= Datos =======
  const MOVIMIENTOS = [
    { ruta:"34-A", fecha:"2025-11-22", hora:"06:10", validaciones:520, gratuidades:18, debitacion: 8100 },
    { ruta:"34-A", fecha:"2025-11-22", hora:"08:40", validaciones:610, gratuidades:22, debitacion: 9200 },
    { ruta:"57-A", fecha:"2025-11-22", hora:"07:30", validaciones:450, gratuidades:15, debitacion: 7050 },
    { ruta:"57-A", fecha:"2025-11-22", hora:"18:10", validaciones:380, gratuidades:19, debitacion: 6600 },
    { ruta:"162-B", fecha:"2025-11-22", hora:"09:20", validaciones:90,  gratuidades:8,  debitacion: 1200 },
    { ruta:"162-B", fecha:"2025-11-22", hora:"16:30", validaciones:110, gratuidades:10, debitacion: 1500 },
    { ruta:"200",  fecha:"2025-11-22", hora:"06:45", validaciones:300, gratuidades:25, debitacion: 4200 },
    { ruta:"200",  fecha:"2025-11-22", hora:"12:10", validaciones:280, gratuidades:20, debitacion: 3980 },
    { ruta:"47-A", fecha:"2025-11-22", hora:"10:05", validaciones:240, gratuidades:12, debitacion: 3600 },
    { ruta:"34-B", fecha:"2025-11-22", hora:"13:40", validaciones:210, gratuidades:9,  debitacion: 3250 },
    { ruta:"110",  fecha:"2025-11-22", hora:"08:15", validaciones:70,  gratuidades:5,  debitacion: 900 },
    { ruta:"118",  fecha:"2025-11-22", hora:"17:05", validaciones:55,  gratuidades:4,  debitacion: 820 },
    { ruta:"119",  fecha:"2025-11-22", hora:"19:20", validaciones:40,  gratuidades:2,  debitacion: 600 },
    { ruta:"59",   fecha:"2025-11-22", hora:"06:05", validaciones:22,  gratuidades:1,  debitacion: 350 },
    { ruta:"12",   fecha:"2025-11-22", hora:"11:05", validaciones:18,  gratuidades:1,  debitacion: 280 },
    { ruta:"9-C",  fecha:"2025-11-22", hora:"14:00", validaciones:14,  gratuidades:0,  debitacion: 220 },
    { ruta:"52-C", fecha:"2025-11-22", hora:"15:50", validaciones:11,  gratuidades:0,  debitacion: 180 },
    { ruta:"17",   fecha:"2025-11-22", hora:"20:40", validaciones:9,   gratuidades:0,  debitacion: 140 }
  ];

  // Rangos horar
  const RANGOS = [
    { key:'05-09', label:'05:00 - 09:00', start: 5*60,  end: 9*60 },
    { key:'09-13', label:'09:00 - 13:00', start: 9*60,  end: 13*60 },
    { key:'13-17', label:'13:00 - 17:00', start: 13*60, end: 17*60 },
    { key:'17-21', label:'17:00 - 21:00', start: 17*60, end: 21*60 },
  ];

  function parseHourToMinutes(hhmm){
    const [hh, mm] = hhmm.split(':').map(n => parseInt(n,10));
    return (hh*60) + (mm||0);
  }

  function rangoPorHora(hhmm){
    const mins = parseHourToMinutes(hhmm);
    const found = RANGOS.find(r => mins >= r.start && mins < r.end);
    return found ? found.key : 'otros';
  }

  
  // Base 
  function renderChartsBase(){
    // Tipo operación
    destroyChart('tipoOperacion');
    charts.tipoOperacion = new Chart($("grafTipoOperacion"), {
      type: 'pie',
      data: {
        labels: ["Tarifa completa", "DIF", "COPACO", "Contraloría"],
        datasets: [{
          data: [92, 3, 4, 1],
          backgroundColor: ["#60a5fa", "#22c55e", "#f59e0b", "#fb7185"],
          borderColor: "rgba(0,0,0,0.2)",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });

    // Tarifa
    destroyChart('tarifa');
    charts.tarifa = new Chart($("grafTarifa"), {
      data: {
        labels: ["$0", "$2", "$4", "$5", "$7", "$20"],
        datasets: [
          {
            type: 'bar',
            label: "Recaudación ($)",
            data: [0, 35000, 110000, 73000, 2000, 6500],
            backgroundColor: "#60a5fa",
            borderRadius: 8
          },
          {
            type: 'line',
            label: "Pasajeros",
            data: [4200, 16000, 29000, 18000, 900, 700],
            borderColor: "#e5e7eb",
            backgroundColor: "rgba(229,231,235,.12)",
            tension: 0.35,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.08)" } },
          y: { grid: { color: "rgba(255,255,255,0.08)" } }
        }
      }
    });

// mayor recaudación
fetch('./query_sql/top_rutas_mayor_recaudacion.php')
  .then(response => response.json())
  .then(res => {

    destroyChart('top');

    charts.top = new Chart($("grafTopRutas"), {
      type: 'bar',
      data: {
        labels: res.labels,
        datasets: [{
          label: "Recaudación ($)",
          data: res.data,
          backgroundColor: "#22c55e",
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.08)" }
          },
          y: {
            grid: { color: "rgba(255,255,255,0.08)" },
            ticks: {
              callback: value => '$' + value.toLocaleString()
            }
          }
        }
      }
    });

  })
  .catch(err => {
    console.error('Error cargando Top Rutas:', err);
  });

  // BOTTOM - rutas con menos pasajeros
fetch('./query_sql/top_rutas_menos_pasajeros.php')
  .then(response => response.json())
  .then(res => {

    destroyChart('bottomPasajeros');

    charts.bottomPasajeros = new Chart($("grafBottomPasajeros"), {
      type: 'bar',
      data: {
        labels: res.labels,
        datasets: [
          {
            label: "Validaciones",
            data: res.pasajeros,
            backgroundColor: "#60a5fa",
            borderRadius: 8
          },
          {
            label: "Gratuidades",
            data: res.gratuidades,
            backgroundColor: "#22c55e",
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#cbd5f5" }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.08)" }
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.08)" }
          }
        }
      }
    });

  })
  .catch(err => {
    console.error('Error cargando Bottom Pasajeros:', err);
  });

    fetch('./query_sql/top_rutas_mas_pasajeros.php')
      .then(response => response.json())
      .then(res => {

        destroyChart('topPasajeros');

        charts.topPasajeros = new Chart($("grafTopPasajeros"), {
          type: 'bar',
          data: {
            labels: res.labels,
            datasets: [
              {
                label: "Validaciones",
                data: res.pasajeros,
                backgroundColor: "#60a5fa",
                borderRadius: 8
              },
              {
                label: "Gratuidades",
                data: res.gratuidades,
                backgroundColor: "#22c55e",
                borderRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: { color: "#cbd5f5" }
              }
            },
            scales: {
              x: {
                grid: { color: "rgba(255,255,255,0.08)" }
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(255,255,255,0.08)" }
              }
            }
          }
        });

      })
      .catch(err => {
        console.error('Error cargando Top Pasajeros:', err);
      });


      // BOTTOM menor recaudación 
      fetch('./query_sql/top_rutas_menor_recaudacion.php')
        .then(response => response.json())
        .then(res => {

          destroyChart('bottom');

          charts.bottom = new Chart($("grafBottomRutas"), {
            type: 'bar',
            data: {
              labels: res.labels,
              datasets: [{
                label: "Recaudación ($)",
                data: res.data,
                backgroundColor: "#fb7185",
                borderRadius: 8
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                x: {
                  grid: { color: "rgba(255,255,255,0.08)" }
                },
                y: {
                  grid: { color: "rgba(255,255,255,0.08)" },
                  ticks: {
                    callback: value => '$' + value.toLocaleString()
                  }
                }
              }
            }
          });

        })
        .catch(err => {
          console.error('Error cargando Bottom Rutas:', err);
        });

        }


  //  Bottom pasajeros
  function calcTopRutasPasajeros(data, tipo='top'){
    const map = new Map();

    data.forEach(row => {
      const key = row.ruta;
      if (!map.has(key)) map.set(key, { ruta:key, valid:0, grat:0, total:0 });

      const acc = map.get(key);
      acc.valid += Number(row.validaciones || 0);
      acc.grat  += Number(row.gratuidades || 0);
      acc.total += Number(row.validaciones || 0) + Number(row.gratuidades || 0);
    });

    const arr = Array.from(map.values());
    arr.sort((a,b) => tipo === 'top' ? (b.total - a.total) : (a.total - b.total));

    return arr.slice(0, 10);
  }

  function renderTopPasajerosChart(canvasId, rows, key){
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = rows.map(x => x.ruta);
  const valid  = rows.map(x => x.valid);
  const grat   = rows.map(x => x.grat);

  destroyChart(key);
  charts[key] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label:'Validaciones', data: valid, backgroundColor:'#60a5fa', borderRadius:8 },
        { label:'Gratuidades',  data: grat,  backgroundColor:'#22c55e', borderRadius:8 }
      ]
    },
    options: {
      responsive:true,
      maintainAspectRatio:false,
      plugins: { legend: { position:'bottom' } },
      scales: {
        x: {
          ticks: { color:'#fff', maxRotation: 0, minRotation: 0 },
          grid: { display:false }
        },
        y: {
          beginAtZero: true,
          ticks: { color:'#fff' },
          grid: { color:'rgba(255,255,255,0.08)' }
        }
      }
    }
  });
}


  //  Rango horario

  function calcRecaudacionPorRango(data){
    const sums = {};
    const pax  = {};
    RANGOS.forEach(r => { sums[r.key]=0; pax[r.key]=0; });

    data.forEach(row => {
      const rk = rangoPorHora(row.hora);
      if (!sums[rk]) return;
      sums[rk] += Number(row.debitacion || 0);
      pax[rk]  += Number(row.validaciones || 0) + Number(row.gratuidades || 0);
    });

    return RANGOS.map(r => ({
      rango: r.label,
      recaudacion: sums[r.key],
      pasajeros: pax[r.key]
    }));
  }

  function renderRecaHoraChart(canvasId, rows){
    if (!$(canvasId)) return;

    const labels = rows.map(x => x.rango);
    const recaud = rows.map(x => x.recaudacion);
    const pasajeros = rows.map(x => x.pasajeros);

    destroyChart('recaHora');
    charts.recaHora = new Chart($(canvasId), {
      data: {
        labels,
        datasets: [
          { type:'bar', label:'Recaudación ($)', data: recaud, backgroundColor:'#f59e0b', borderRadius:10 },
          { type:'line', label:'Pasajeros', data: pasajeros, borderColor:'#e5e7eb', backgroundColor:'rgba(229,231,235,.12)', tension:0.35, pointRadius:3, yAxisID:'y2' }
        ]
      },
      options: {
        responsive:true,
        maintainAspectRatio:false,
        plugins: { legend: { position:'bottom' } },
        scales: {
          x: { grid: { color:'rgba(255,255,255,0.08)' } },
          y: { title:{display:true,text:'Recaudación ($)'}, grid: { color:'rgba(255,255,255,0.08)' } },
          y2:{ position:'right', title:{display:true,text:'Pasajeros'}, grid:{ drawOnChartArea:false } }
        }
      }
    });
  }


  function getFilteredData(){
    const fecha = $('filtroFecha')?.value || null;
    const horario = $('filtroHorario')?.value || 'all';
    const ruta = $('filtroRuta')?.value || 'all';

    return MOVIMIENTOS.filter(row => {
      if (fecha && row.fecha !== fecha) return false;
      if (ruta !== 'all' && row.ruta !== ruta) return false;

      if (horario !== 'all') {
        const rk = rangoPorHora(row.hora);
        if (rk !== horario) return false;
      }
      return true;
    });
  }

  //  Render principal
  function renderAll(){
    const data = getFilteredData();

    // 4 charts base
    renderChartsBase();

    // TOP/BOTTOM pasajeros
    renderTopPasajerosChart('grafTopPasajeros', calcTopRutasPasajeros(data,'top'), 'topPasajeros');
    renderTopPasajerosChart('grafBottomPasajeros', calcTopRutasPasajeros(data,'bottom'), 'bottomPasajeros');
    renderRecaHoraChart('grafRecaHora', calcRecaudacionPorRango(data));
  }

  $('btnCargar')?.addEventListener('click', renderAll);

  renderAll();
});
