// leeer la coockie de session
// Lee la cookie access_token
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Decodifica el JWT y obtiene el nombre
function mostrarNombreUsuario() {
  const token = getCookie("access_token");
  if (token) {
    const decoded = jwt_decode(token);
    const nombre = decoded.data.name;
    // Actualiza todos los elementos con la clase 'nombre-usuario'
    document.querySelectorAll(".nombre-usuario").forEach((el) => {
      el.textContent = nombre;
    });
  }
}

// Llama a la función después de login
mostrarNombreUsuario();
