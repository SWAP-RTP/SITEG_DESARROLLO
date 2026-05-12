export async function cargarArchivosModulo(id_lista, url, modulo) {
  try {
    const moduloAUsar = modulo || window.moduloRegistroActual;

    if (!moduloAUsar) {
      const lista = document.getElementById(id_lista);
      lista.innerHTML =
        "<li class='list-group-item text-center text-warning'>Selecciona un registro primero</li>";
      return;
    }

    const formData = new FormData();
    formData.append("modulo", moduloAUsar);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();
    let archivos = JSON.parse(responseText);

    const lista = document.getElementById(id_lista);
    lista.innerHTML = "";

    if (archivos.exito === false) {
      lista.innerHTML = `<li class='list-group-item text-center text-danger'>${archivos.error}</li>`;
      return;
    }

    if (!Array.isArray(archivos) || archivos.length === 0) {
      lista.innerHTML = `<li class='list-group-item text-center'>No hay archivos para el módulo ${moduloAUsar}</li>`;
      return;
    }

    archivos.forEach((nombre) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <span>${nombre}</span>
        <button class="btn btn-primary btn-sm" onclick="verArchivo('${nombre}')">Ver</button>
      `;
      lista.appendChild(li);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
