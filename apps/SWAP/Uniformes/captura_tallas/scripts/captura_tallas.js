
// Obtiene la referencia al input donde se captura la credencial y muestra info del trabajador.
const inputCredencial = document.getElementById("input_credencial");
const inputNombre = document.getElementById("input_nombre");
const inputGenero = document.getElementById("input_genero");
const inputModulo = document.getElementById("input_modulo");
const inputTipoContrato = document.getElementById("input_tipo_contrato_desc");
const inputPuesto = document.getElementById("input_puesto");
const imgFoto = document.getElementById("trabajador_foto");

// Limpia (vacía) los campos del formulario que se llenan automáticamente.
function limpiarFormulario() {
  inputNombre.value = '';
  inputGenero.value = '';
  inputModulo.value = '';
  inputTipoContrato.value = '';
  inputPuesto.value = '';
  imgFoto.src = "../img/usuario.png";

}

// Consulta al servidor los datos del trabajador usando la credencial.
async function obtenerTrabajador(credencial) {
  // Hace una petición GET al endpoint PHP pasando la credencial 
  const res = await fetch(`query_sql/buscar_trabajador.php?credencial=${credencial}`);
  // Convierte la respuesta a JSON y la regresa.
  return await res.json();
}

// Llena los campos del formulario con la información recibida.
function llenarFormulario(data) {
  // Asigna nombre; si no existe, deja cadena vacía.
  inputNombre.value = data.nombre_completo || '';
  inputGenero.value = data.genero || '';
  inputModulo.value = data.modulo || '';
  inputTipoContrato.value = data.tipo_contrato_desc || '';
  inputPuesto.value = data.puesto || '';
  imgFoto.src = data.foto  
    ? `../../Recursos_Humanos/fotos/${data.foto}`
    : "../img/usuario.png";
}

// Se ejecuta cuando cambia el valor de la credencial.
async function manejarCambioCredencial(e) {
  // Toma el valor del input y elimina espacios al inicio y al final.
  const credencial = e.target.value.trim();

  // Si no hay credencial capturada
  if (!credencial) {
    //limpia el formulario.
    limpiarFormulario();
    // y termina la función.
    return;
  }

  // Obtiene la información del trabajador desde el backend.
  const data = await obtenerTrabajador(credencial);

  console.log(data);
  console.log(data.foto);

  // Si no hay datos o el backend devolvió un error...
  if (!data || data.error) {
    // limpia el formulario.
    limpiarFormulario();
    // y termina la función.
    return;
  }

  // Si todo sale bien, llena el formulario con los datos recibidos.
  llenarFormulario(data);
}


// Inicializa
function init() {
  inputCredencial.addEventListener("change", manejarCambioCredencial);
}

// Ejecuta 
init();