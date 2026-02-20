import { insertarDatos } from "/includes/scripts/peticiones/insertar_datos.js";

export function validarInptus(btn_formulario, id_formulario, array_inptus) {
  const boton_formulario = document.getElementById(btn_formulario);
  const formulario = document.getElementById(id_formulario);

  boton_formulario.addEventListener("click", async function (event) {
    let hayVacios = false;
    array_inptus.forEach((id) => {
      const input = document.getElementById(id);

      if (input && !input.value) {
        hayVacios = true;
        input.classList.add("focus_eco");
        input.focus();
        const eventoCambio = input.tagName.toLowerCase() === 'select'? 'change': 'input';
        input.addEventListener(eventoCambio, function handler() {
          if (input.value) {
            input.classList.remove("focus_eco");
            input.removeEventListener("input", handler);
          }
        });
      } else if (input) {
        input.classList.remove("focus_eco");
      }
    });

    if (hayVacios) {
      // No envía el formulario, solo muestra el toast
      const toastEl = document.getElementById("myToast");
      const toast = new bootstrap.Toast(toastEl, { delay: 7000 });
      toast.show();
      event.preventDefault();
      return;
    }

    //! Aqui empieza la parte de enviar e insertar los datos al backend
    //! Si todo está bien, envía los datos solo una vez
    event.preventDefault(); // Evita el submit 

    // Combinar fecha y hora en un solo campo
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const fechaHora = `${fecha} ${hora}`; // Combina fecha y hora en formato "YYYY-MM-DD HH:mm:ss"
    // Crear un FormData para enviar los datos
    const datosFormulario = new FormData(formulario);
    // Agrega el campo combinado al FormData
    datosFormulario.append("fecha_hora", fechaHora);
    // manda la solicitud al backend
    const resultado = await insertarDatos(
      "/Mantenimiento/correctivo/orden_alta/query_sql/insert.php",
      datosFormulario
    );
    console.log("Respuesta del backend:", resultado);
    // Verificar la respuesta del backend
    if (resultado.success) {
      swal.fire({
        title: "Éxito",
        text: "Los datos se han enviado correctamente.",
        icon: "success",
      });
      formulario.reset();
      console.log("Formulario enviado con éxito.", resultado);
    } else {
      swal.fire({
        title: "Error",
        text: resultado.error || "Ocurrió un error al enviar los datos.",
        icon: "error",
      });
      console.error("Error al enviar el formulario:", resultado.error);
    }
    formulario.reset();
    console.log("Formulario enviado con éxito.", resultado);
  });
}
