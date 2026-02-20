// ? En este JS se usara en su mayoria funciones globales para mantener un codigo limpio y ordenado
import { validarInptus } from "/Mantenimiento/includes/scripts/validacion_inptus.js";
import { datosTabla } from "/Mantenimiento/includes/scripts/dataTable_v2.js";
import { dataTable } from "/Mantenimiento/includes/scripts/dataTable_v2.js";
import { insertarDatos } from "/Mantenimiento/includes/scripts/peticiones/insertar_datos.js";
import { obtenerModulo } from "/Mantenimiento/includes/scripts/obtenerModulos.js";
import { obtenerRutas } from "/Mantenimiento/includes/scripts/obtenerRutas.js";
import { API_ROUTES } from "/Mantenimiento/includes/scripts/api_routes.js";
import { buscarCredencial } from "/Mantenimiento/includes/scripts/buscarCredencial.js";
import { obtenerCatalogoFallas } from "/Mantenimiento/includes/scripts/obtenerCatalogo_fallas.js";
// ! Importaciones de funciones globales

// *************************** Validar inputs con alerta TOAST y SweetAlert ************************//
validarInptus("btn_alta", "form-alta", [
  "rutas",
  "economico",
  "fecha",
  "hora",
  // "credencial_operador",
  // "credencial_jefe",
  // "credencial_jud",
  // "fallas_operador",
]);

//! ***************** Consumir dataTable ******************* */
(async () => {
  const datos = await datosTabla(API_ROUTES.dataTable);
  dataTable(datos, "#tabla_orden_alta", [
    { data: "orden_correctivo", title: "Numero de orden" },
    { data: "economico", title: "Economico" },
    { data: "kilometraje", title: "Kilometraje" },
    { data: "modulo", title: "Modulo" },
    { data: "ruta", title: "Ruta" },
    { data: "falla_descripcion_operador", title: "Descripcion de la falla" },
    { data: "operador", title: "Credencial del Operador" },
    { data: "fecha_alta_correctivo", title: "Fecha de alta" },
  ]);
})();

//! ***************** Obtener modulos ******************* */
obtenerModulo(API_ROUTES.obtenerModulo, "modulo_actual", "span");

// ! ***************** Obtener rutas ******************* */
obtenerRutas(API_ROUTES.obtenerRutas);

//! ***************** Buscar credenciales ******************* */
buscarCredencial(
  API_ROUTES.buscarCredencial, // URL del endpoint PHP
  "operador", // ID del input de credencial
  "nombre_operador", // ID del input de nombre
  "lista-sugerencias", // ID del <ul> para sugerencias
);
buscarCredencial(
  API_ROUTES.buscarCredencial, // URL del endpoint PHP
  "jefe_oficina", // ID del input de credencial
  "nombre_jefe_oficina", // ID del input de nombre
  "lista-sugerencias-jefe", // ID del <ul> para sugerencias
);
buscarCredencial(
  API_ROUTES.buscarCredencial, // URL del endpoint PHP
  "jud", // ID del input de credencial
  "nombre_jud", // ID del input de nombre
  "lista-sugerencias-jud", // ID del <ul> para sugerencias
);

//! ***************** Obtener catalogo fallas ******************* */
obtenerCatalogoFallas(API_ROUTES.obtenerCatalogo_fallas);

// ! ***************** Pestañas Correctivo y Preventivo ******************* */|
document.addEventListener("DOMContentLoaded", () => {
  const ids = ["correctivo2", "preventivo3"];

  // Botones de las pestañas
  const btnCorrectivo = document.getElementById("correctivo");
  const btnPreventivo = document.getElementById("preventivo");
  const tabla = document.getElementById("tabla_correctivo");

  // Función para mostrar solo el contenido correspondiente
  function mostrarContenido(idMostrar) {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = id === idMostrar ? "block" : "none";
      }
    });
    // Mostrar la tabla solo en correctivo
    if (tabla)
      tabla.style.display = idMostrar === "correctivo2" ? "block" : "none";
  }

  // Mostrar Correctivo por defecto
  mostrarContenido("correctivo2");

  // Evento para Correctivo
  btnCorrectivo.addEventListener("click", () => {
    mostrarContenido("correctivo2");
  });

  // Evento para Preventivo
  btnPreventivo.addEventListener("click", () => {
    mostrarContenido("preventivo3");
  });
});
