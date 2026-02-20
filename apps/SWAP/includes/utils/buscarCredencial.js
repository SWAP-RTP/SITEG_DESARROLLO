export const buscar_x_credencial = async (url, credencial, onResult) => {
  if (!credencial) {
    Swal.fire({
      title: "Error",
      text: "Debes ingresar al menos un dato para buscar",
      icon: "warning",
    });
    return;
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `credencial=${encodeURIComponent(credencial)}`,
    });
    if (!response.ok) throw new Error("Error en la solicitud");
    const data = await response.json();
    if (onResult) onResult(data);
  } catch (error) {
    console.log("Error en la solicitud:", error);
  }
};

//! ******** Version 2 ********
export async function buscarCredencial(
  url,
  id_input_credencial,
  id_input_nombre,
  id_ul
) {
  try {
    // obtenemos los id de los elementos
    const input = document.getElementById(id_input_credencial);
    const nombreInput = document.getElementById(id_input_nombre);
    const listaCredenciales = document.getElementById(id_ul);

    // tomamos el valor del input
    input.addEventListener("input", async () => {
      // trim es una funcion que elimina los espacios en blanco al inicio y al final de un string
      const valor = input.value.trim();
      // si el es mayor a 0 caracteres, hacemos la busqueda
      if (valor.length === 0) {
        // limpiamos la lista y el input de nombre
        listaCredenciales.innerHTML = "";
        // nombreInput.value = "";
        nombreInput.value = "";
        // salimos de la funcion
        return;
      }

      // llamamos al back con lo que el usuario escribe
      const response = await fetch(`${url}?q=${encodeURIComponent(valor)}`);
      const resultado = await response.json();
      // limpiamos la lista antes de llenarla
      listaCredenciales.innerHTML = "";

      if (resultado.length > 0) {
        resultado.forEach((credencial) => {
          const li = document.createElement("li");
          li.innerHTML = `
      <span class="sugerencia-credencial">${credencial.trab_credencial}</span>
      <span class="sugerencia-nombre">${credencial.trab_nombre} ${credencial.trab_apaterno} ${credencial.trab_amaterno}</span>
    `;
          li.onclick = () => {
            input.value = credencial.trab_credencial;
            nombreInput.value = `${credencial.trab_nombre} ${credencial.trab_apaterno} ${credencial.trab_amaterno}`;
            listaCredenciales.innerHTML = "";
          };
          listaCredenciales.appendChild(li);
        });
        listaCredenciales.style.display = "block";
      } else {
        listaCredenciales.style.display = "none";
      }
    });
    // Opcional: Oculta la lista si se hace clic fuera
    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !listaCredenciales.contains(e.target)) {
        listaCredenciales.style.display = "none";
      }
    });
  } catch (error) {
    console.log("Error en la solicitud:", error);
  }
}
