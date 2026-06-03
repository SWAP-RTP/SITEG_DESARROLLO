export const obtenerModulo = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error en la solicitud: " + response.status);
    }
    const data = await response.json();
    console.log("Módulos obtenidos:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener los módulos:", error);
    return [];
  }
};
function mostrarModulos(obtenerModulos) {
  const select = document.getElementById("select_modulo");
  if (!select) {
    console.error("No se encontró el elemento select con id 'select_modulo'");
    return;
  }

  obtenerModulos.forEach((modulo) => {
    const option = document.createElement("option");
    option.value = modulo.mod_clave;
    option.textContent = modulo.mod_desc;
    select.appendChild(option);
  });
}

obtenerModulo("/app-swap/includes/query_sql/obtenerModulos.php").then(
  (modulos) => {
    mostrarModulos(modulos);
  },
);
