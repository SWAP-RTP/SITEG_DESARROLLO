import { notyf } from "./notyf.js";
// AUTENTICACION
function auth() {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(loginForm);
    if (!formData.get('ingresaUsuario') || !formData.get('ingresaPassword')) {
      notyf.error("Usuario y Contraseña son requeridos")
      return
    }

    $.ajax({
      url: "auth/auth.php",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function (res) {

        if (res.status === "success") {
          notyf.success("Bienvenido(a) " + (res.usuario.name || ""));

          $(".contenedor_carga").removeAttr('hidden');
          $("#card_login").attr('hidden');

          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);
        } else {
          notyf.error(res.message);
        }
      },
      error: function (xhr) {
        console.log(xhr.responseText); // para ver qué respondió el servidor
        notyf.error(xhr.message,);
      }
    });
  });
}

// 1. Función global para el ojo de la contraseña
window.mostrarPassword = function () {
  const passInput = document.getElementById("ingresaPassword");
  const eyeIcon = document.getElementById("eyeIcon");
  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passInput.type = "password";
    eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
  }
};

// EVITA QUE AL ESTAR LOGUEADO  MUESTRE EL LOGIN Y SE BLOQUEE SOLO EN LA PANTALLA DEL MENU
window.addEventListener("pageshow", function (event) {
  if (document.cookie.includes("access_token")) {
    const paginaActual = window.location.pathname.split("/").pop();
    if (
      paginaActual === "index" ||
      paginaActual === "" ||
      paginaActual === "/"
    ) {
      window.location.replace("menu.html");
    }
  }
});

//Alertas para indicarle al usuario que su sesion caduco o que alguien ingreso con su usuario en otro lado
const urlParams = new URLSearchParams(window.location.search);
const errorType = urlParams.get("error");
const sesionCerrada = urlParams.get("message")
if (errorType || sesionCerrada) {
  if (errorType === "sesion_duplicada") {
    notyf.error("Acceso detectado en un nuevo equipo, hemos cerrado tu sesion.");
  } else if (errorType === "sesion_invalida") {
    notyf.error("La sesión ha expirado. Por favor, ingresa de nuevo.");
  } else if (sesionCerrada === "sesion_cerrada") {
    notyf.error("Sesion cerrada correctamente");
  }
  // Limpia la URL para que no se repita el mensaje al recargar
  window.history.replaceState({}, document.title, window.location.pathname);
}

document.addEventListener("DOMContentLoaded", () => {
  auth();
});

