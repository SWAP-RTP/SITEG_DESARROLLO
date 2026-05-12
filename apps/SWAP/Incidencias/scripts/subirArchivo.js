export async function subirArchivo(id_input, id_msg, id_btn, url, modulo) {
  const inputArchivo = document.getElementById(id_input);
  const msg = document.getElementById(id_msg);
  const btn = document.getElementById(id_btn);

  console.log("inputArchivo:", inputArchivo);
  console.log("Archivo seleccionado:", inputArchivo?.files);

  if (!inputArchivo || !inputArchivo.files.length) {
    msg.innerHTML = "⚠ Selecciona un archivo primero";
    return;
  }

  const formData = new FormData();
  formData.append("archivo", inputArchivo.files[0]);
  formData.append("modulo", modulo);

  btn.disabled = true;
  msg.innerHTML = " Subiendo archivo...";

  try {
    console.log("Enviando a:", url);
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.exito) {
      msg.innerHTML = `✅ ${data.mensaje}<br>📁 Guardado en: ${data.ruta}`;
    } else {
      msg.innerHTML = `❌ Error: ${data.error}`;
    }
  } catch (error) {
    msg.innerHTML = "❌ Error de conexión con el servidor";
    console.error(error);
  } finally {
    btn.disabled = false;
  }
}

