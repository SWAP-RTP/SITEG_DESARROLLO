import { datatable, dataTable } from "/includes/js/datatable.js";

export const consultar_usuarios_permisos = () => {
  (async () => {
    const datos = await datatable("/admin/query_sql/getPermisos.php");
    dataTable(datos, "#tabla_usuarios_permisos", [
      { data: "id_usuario", title: "Credencial" },
      { data: "nombre", title: "Nombre" },
      { data: "id_rol", title: "Rol" },
      { data: "nombre", title: "Nombre del Rol" },
      { data: "descripcion", title: "Descripción" },
    ]);
  })();
};
