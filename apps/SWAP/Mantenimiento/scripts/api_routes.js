// ! En este archivo se definen las rutas de la API utilizadas en la aplicación.
// ! Debes importar este objeto donde necesites hacer llamadas a la API.
// ****** RUTAS PARA ORDEN ALTA DE CORRECTIVO ******
export const API_ROUTES = {
  obtenerModulo: "/Mantenimiento/includes/helpers/listarModulos.php",
  dataTable:
    "/Mantenimiento/correctivo/orden_alta/query_sql/listarDatosTable.php",
  obtenerRutas: "/includes/helpers/listarRutas.php",
  buscarCredencial:
    "/Mantenimiento/correctivo/orden_alta/query_sql/buscarCredencial.php",
  obtenerCatalogo_fallas: "/includes/helpers/obtenerCatalogo_fallas.php",
};

export const API_ROUTES_DIAGNOSTICO = {
  dataTable: "/Mantenimiento/correctivo/diagnostico/query_sql/listarDatos.php",
};

export const API_ROUTES_REALIZADAS = {
  dataTable:
    "/Mantenimiento/correctivo/reparaciones/query_sql/listar_datos.php",
};
