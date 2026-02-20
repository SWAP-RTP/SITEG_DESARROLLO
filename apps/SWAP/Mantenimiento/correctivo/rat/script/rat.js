import { obtenerModulos } from "/includes/scripts/obtenerModulos _ofCentrales.js";
// 1) Cargar módulos en el select al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  obtenerModulos("/Incidencias/query_sql/listarModulos.php", "modulo");

   // 2) Click en CONSULTAR DETALLES
  const btn = document.getElementById("btn_alta");
  btn?.addEventListener("click", () => {
    cargarTablaRAT();
  });
});

function cargarTablaRAT() {

  // Validación opcional de año
  const year = $("#year").val().trim();
  if (year && !/^\d{4}$/.test(year)) {
    Swal.fire("Año inválido", "Debe ser un año de 4 dígitos (ej. 2026)", "warning");
    return;
  }

  $("#tabla_rat").DataTable({
    destroy: true,
    processing: true,
    ajax: {
      url: "/Mantenimiento/correctivo/rat/query_sql/getConsultas.php", 
      type: "POST",
      data: {
        modulo: $("#modulo").val(),
        fecha_inicio: $("#fecha_inicio").val(),
        fecha_final: $("#fecha_final").val(),
        year: $("#year").val(),
      },
      dataSrc: "data",
    },
    columns: [
      { data: "num_orden_correctivo", title: "N° orden de trabajo" },
      { data: "aho_correctivo",       title: "Año" },
      { data: "mod_clave",            title: "Módulo" },
      { data: "num_economico",        title: "Económico" },
      { data: "ruta_trayecto",        title: "Ruta" },
      { data: "tipo",                 title: "Tipo" }, 
      { data: "falla_operador_desc",  title: "Falla reportada" },
      { data: "fecha_mantto_correctivo", title: "Fecha inicio" },
      { data: "fecha_salida_taller",     title: "Fecha final" },
      { data: "tiempo_total_taller",     title: "Tiempo en el taller" },
    ],
    language: {
      url: "//cdn.datatables.net/plug-ins/1.13.4/i18n/es-MX.json"
    }
  });
}

