export async function obtenerRutas(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    // buscamos el select de rutas
    const select = document.getElementById("ruta");
    // hacemos un if al select
    if (select) {
      // insertamos desde js el campo de selecciona una opcion
      select.innerHTML = '<option value="">Selecciona una ruta</option>';
      //   usamos la data para recorrer las rutas
      data.forEach((rutas) => {
        // creamos una opcion por cada ruta
        const option = document.createElement("option");
        // asignamos el valor y el texto de la opcion
        option.value = rutas.ruta_nombre;
        // asignamos el texto de la opcion
        option.textContent = `${rutas.ruta_nombre} - ${rutas.ruta_trayecto} - ${rutas.ruta_trayecto_descrip}`;
        // agregamos la opcion al select
        select.appendChild(option);
      });
    }
    return data;
  } catch (error) {
    console.error("Error al obtener las rutas:", error);
  }
}
