// funcion para obtener los modulos desde el backend con un select
export async function obtenerModulos(url, id_campo) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los modulos: " + response.statusText);
    }
    const data = await response.json();

    // Si existe el select, lo llena, pero siempre retorna el array
    const select = document.getElementById(id_campo);
    if (select) {
      select.innerHTML = '<option value="0">Selecciona una opcion</option>';
      data.forEach((modulo) => {
        const option = document.createElement("option");
        option.value = modulo.adsc_numero;
        option.textContent = `${modulo.adsc_numero} - ${modulo.adsc_desc}`;
        select.appendChild(option);
      });
    }
    return data;
  } catch (error) {
    console.error("Error al obtener los módulos:", error);
    return [];
  }
}

//! ** Obtener modulos para insertarlo en cualquier selector **
export async function obtenerModulo(url, id_contenedor, id_tipo_selector) {
  try {
    // Realiza la petición al backend para obtener los módulos del usuario
    const response = await fetch(url);
    // Si la respuesta no es exitosa, lanza un error
    if (!response.ok) {
      throw new Error("Error en la solicitud: " + response.status);
    }
    // Convierte la respuesta a JSON
    const data = await response.json();
    // Extrae el array de módulos de la respuesta
    const modulos = data.data;
    // Obtiene el div donde se mostrará el módulo actual
    const modulo_actual = document.getElementById(id_contenedor);
    // Si existe el div y hay al menos un módulo en la respuesta
    if (modulo_actual && modulos.length > 0) {
      // Busca el selector dentro del div
      const tipo_selector = modulo_actual.querySelector(id_tipo_selector);
      // Si existe , actualiza su texto con la descripción del módulo
      if (tipo_selector) {
        tipo_selector.textContent = modulos[0].mod_desc;
      }
    }
    // Muestra en consola la respuesta completa para depuración
    console.log(data);
    // Retorna los datos obtenidos
    return data;
  } catch (error) {
    // Muestra en consola cualquier error que ocurra durante la petición
    console.error("Error al obtener los modulos:", error);
  }
}
