// Elementos del DOM
const inputCredencial = document.getElementById("input_credencial");
const inputNombre = document.getElementById("input_nombre");
const inputGenero = document.getElementById("input_genero");
const inputModulo = document.getElementById("input_modulo");
const inputTipoContrato = document.getElementById("input_tipo_contrato_desc");
const inputPuesto = document.getElementById("input_puesto");
const imgFoto = document.getElementById("trabajador_foto");
const divTablaUniforme = document.getElementById("tabla_catalogo_uniforme");
const btnRegistrar = document.getElementById("guardar_registro");
const registro = document.getElementById("form_alta");

//claves de puestos de puesto_clave de la tabla trab_puestos
const PUESTOS_OPERADORES    = [42, 214, 215, 221];
const PUESTOS_MANTENIMIENTO = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 40, 222, 223, 224, 225];
const PUESTOS_AUXILIAR      = [17, 216, 34, 35, 36, 230, 231];

//guia tallas 
const GUIAS = {
  operador_masculino: {
    "Camisa":   "OperadorCa.png",
    "Pantalon": "OperadorPan.png",
    "Chaleco":  "OperadorChal.png",
    "Chamarra": "OperadorCha.png",
    "Sueter":   "OperadorSue.png",
    // "Zapatos":   "Zapato.png"

  },

  operador_femenino: {
    "Blusa":    "AteneaCam.png",
    "Pantalon": "AteneaPan.png",
    "Chaleco":  "AteneaChal.png",
    "Chamarra": "AteneaCha.png",
    "Sueter":   "AteneaSu.png",
    // "Zapatos":   "Zapato.png"
  },

  mantenimiento: {
    "Camisola":              "ManteCamisola.png",
    "Playera":               "MantePlayera.png",
    "Pantalon":              "MantePantalon.png",
    "Sudadera":              "ManteSudadera.png",
    "Chamarra":              "ManteChamarra.png" 
    // "Botas dielectricas":    "ManteBotaDielectrica.png" 
  },

  auxiliar: { 
    "Camisola":              "ManteCamisola.png",
    "Playera":               "MantePlayera.png",
    "Pantalon":              "MantePantalon.png",
    "Impermeable Pantalon":  "ManteImperPan.png",
    "Impermeable Chamarra":  "ManteImperCha.png",
    "Sudadera":              "ManteSudadera.png",
    "Botas de hule":         "ManteBotaHule.png",   
    "Chamarra":              "ManteChamarra.png"      
    // "Botas dielectricas":    "ManteBotaDielectrica.png"
  }
};

//reglas de tallas
  const TALLAS = {
    operador_femenino: {
      "PANTALON":  ['28','30','32','34','36','38','40','42','44','46','48','50','52'],
      "BLUSA":     ['28','30','32','34','36','38','40','42','44','46','48','50','52'],
      "CHAMARRA":  ['28','30','32','34','36','38','40','42','44','46','48','50','52'],
      "CHALECO":   ['28','30','32','34','36','38','40','42','44','46','48','50','52'],
      "SUETER":    ['28','30','32','34','36','38','40','42']
    },
    operador_masculino: {
      "PANTALON":  ['28','30','32','34','36','38','40','42','44','46','48','50','52'],
      "CAMISA":     ['28','30','32','34','36','38','40','42','44','46','48','50','52'],
      "CHAMARRA":  ['28','30','32','34','36','38','40','42','44','46','48','50','52'],
      "CHALECO":   ['28','30','32','34','36','38','40','42','44','46','48','50','52'],
      "SUETER":    ['28','30','32','34','36','38','40','42']
    },
    mantenimiento: {
      "CAMISOLA":  ['30','32','34','36','38','40','42','44','46','48','50','52'],
      "PANTALON":  ['28','30','32','34','36','38','40','42','44','46','48','50','52'],
      "PLAYERA":   ['28','30','32','34','36','38','40','42','44','46','48','50'],
      "CHAMARRA VERANO":  ['28','30','32','34','36','38','40','42','44','46','48','50'],
      "CHAMARRA INVIERNO":['28','30','32','34','36','38','40','42','44','46','48','50'],
      "SUDADERA":  ['28','30','32','34','36','38','40','42','44','46','48','50']
    },
    auxiliar: {
      "CAMISOLA":  ['30','32','34','36','38','40','42','44','46','48','50','52'],
      "PANTALON":  ['28','30','32','34','36','38','40','42','44','46','48','50','52'],
      "PLAYERA":   ['28','30','32','34','36','38','40','42','44','46','48','50'],
      "CHAMARRA VERANO":   ['28','30','32','34','36','38','40','42','44','46','48','50'],
      "CHAMARRA INVIERNO": ['28','30','32','34','36','38','40','42','44','46','48','50'],
      "SUDADERA":          ['28','30','32','34','36','38','40','42','44','46','48','50'],
      "IMPERMEABLE PANTALON": ['28','30','32','34','36','38','40','42','44','46','48'],
      "IMPERMEABLE CHAMARRA": ['28','30','32','34','36','38','40','42','44','46','48']
    }
  };

// Limpiar el formulario
function limpiarFormulario() {
  inputNombre.value = '';
  inputGenero.value = '';
  inputModulo.value = '';
  inputTipoContrato.value = '';
  inputPuesto.value = '';
  imgFoto.src = "../img/usuario.png";

  ocultarTabla(); 

}

// Obtener trabajador
async function obtenerTrabajador(credencial) {
  const res = await fetch(`query_sql/buscar_trabajador.php?credencial=${credencial}`);
  return await res.json();
}

// Llena los campos del formulario 
function llenarFormulario(data) {
  // Asigna nombre; si no existe, deja cadena vacía.
  inputNombre.value = data.nombre_completo || '';
  inputNombre.style.color = "black"; 
  inputGenero.value = data.genero || '';
  inputModulo.value = data.modulo || '';
  inputTipoContrato.value = data.tipo_contrato_desc || '';
  inputPuesto.value = data.puesto || '';
  imgFoto.src = data.foto  
    ? `../../Recursos_Humanos/fotos/${data.foto}`
    : "../img/usuario.png";
}

//obtener uniformes 
async function obtenerUniformes({ puesto_clave, genero, tipo_contrato }) {
  const res = await fetch("./query_sql/getUniformes.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ puesto_clave, genero, tipo_contrato })
  });

  const text = await res.text();
  return JSON.parse(text);
}

//determinar puestos
function obtenerGrupo(puesto_clave, genero) {
  const p = parseInt(puesto_clave);

  if (PUESTOS_OPERADORES.includes(p)) {
    return genero.toUpperCase() === "FEMENINO"
      ? "operador_femenino"
      : "operador_masculino";
  }

  if (PUESTOS_MANTENIMIENTO.includes(p)) return "mantenimiento";
  if (PUESTOS_AUXILIAR.includes(p)) return "auxiliar";

  return null;
}

//obtener tallas por prenda
function obtenerTallasPorPrenda(nombre, grupo) {
  const n = nombre.toUpperCase();

  if (grupo && TALLAS[grupo]) {
    for (let key in TALLAS[grupo]) {
      if (n.includes(key)) return TALLAS[grupo][key];
    }
  }

  // fallback
  if (n.includes('TOALLA') || n.includes('GORRA')) return ['UNITALLA'];

  if (n.includes('ZAPATO') || n.includes('BOTAS')) {
    return ['22','23','24','25','26','27','28','29','30'];
  }

  return ['28','30','32','34','36','38','40','42','44','46','48','50','52'];
}

//Select tallas 
function crearSelectTallas(id, opciones) {
  if (opciones.length === 1) {
    return `<select class="form-select form-select-sm" name="id_prenda${id}">
      <option selected>${opciones[0]}</option>
    </select>`;
  }

  return `<select class="form-select form-select-sm" name="id_prenda${id}">
    <option value="">Selecciona</option>
    ${opciones.map(t => `<option value="${t}">${t}</option>`).join('')}
  </select>`;
}

//mostrar guia de tallas
function mostrarGuiaTallas(puesto_clave, genero) {
  const guiaWrap = document.getElementById("guia_tallas");
  const tabs = document.getElementById("guia_tabs");
  const img = document.getElementById("guia_img");
  const header = document.getElementById("guia_header"); 

  tabs.innerHTML = "";

  const grupo = obtenerGrupo(puesto_clave, genero);

  if (!grupo || !GUIAS[grupo]) {
    guiaWrap.style.display = "none";
    return;
  }

  header.textContent = `Guía de tallas - ${grupo.replace("_", " ")}`;

  const items = Object.entries(GUIAS[grupo]);

  items.forEach(([nombre, archivo], index) => {
    const tab = document.createElement("div");
    tab.className = "guia-tab";
    tab.textContent = nombre;

    tab.addEventListener("click", () => {
      document.querySelectorAll(".guia-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      img.style.opacity = 0;

      setTimeout(() => {
        img.src = `../img/${archivo}`;
        img.style.opacity = 1;
      }, 200);
    });

    tabs.appendChild(tab);

    if (index === 0) {
      tab.classList.add("active");
      img.src = `../img/${archivo}`;
    }
  });

  guiaWrap.style.display = "block";
}

//Tabla de uniformes
function TablaUniformes(data, puesto_clave, genero) {
  const tbody = document.querySelector("#tabla_uniformes tbody");
  tbody.innerHTML = "";

  const grupo = obtenerGrupo(puesto_clave, genero);

  data.forEach(item => {
    const tallas = obtenerTallasPorPrenda(item.nombre_uniforme, grupo);
    const select = crearSelectTallas(item.id, tallas);

    const fila = `
      <tr>
        <td hidden>${item.id}</td>
        <td class="text-center">${item.nombre_uniforme}</td>
        <td class="text-center">${item.num_prenda}</td>
        <td class="text-center">${select}</td>
      </tr>
    `;

    tbody.insertAdjacentHTML("beforeend", fila);
  });
  
  mostrarTabla();
  activarEventosTallas();
  evaluarEstadoRegistrar();
}

// Oculta y desactiva el botón de Registrar
function ocultarRegistrar() {
  if (!btnRegistrar) return;
  btnRegistrar.disabled = true;
  btnRegistrar.classList.add("d-none");
}

// Muestra y habilita el botón de Registrar
function mostrarRegistrar() {
  if (!btnRegistrar) return;
  btnRegistrar.disabled = false;
  btnRegistrar.classList.remove("d-none");
}
//
function evaluarEstadoRegistrar() {
  const selects = document.querySelectorAll("#tabla_uniformes select");

  // Si no hay filas → ocultar
  if (selects.length === 0) {
    ocultarRegistrar();
    return;
  }

  // Validar si alguna talla está vacía
  const faltaTalla = Array.from(selects).some(s => !s.value);

  if (faltaTalla) {
    ocultarRegistrar();
  } else {
    mostrarRegistrar();
  }
}
//
function activarEventosTallas() {
  const tbody = document.querySelector("#tabla_uniformes tbody");

  tbody.addEventListener("change", (e) => {
    if (e.target.tagName === "SELECT") {
      const row = e.target.closest("tr");

      if (e.target.value) {
        row.classList.add("table-success"); 
      } else {
        row.classList.remove("table-success");
      }

      evaluarEstadoRegistrar();
    }
  });
}

registro.addEventListener("submit", async function (e) {
  e.preventDefault(); 

  const selects = document.querySelectorAll("#tabla_uniformes select");

  // Validar tallas
  const faltantes = Array.from(selects)
    .filter(s => !s.value)
    .map(s => s.closest('tr').children[1].textContent);

  if (faltantes.length > 0) {
    Swal.fire({
      icon: "warning",
      title: "Tallas faltantes",
      html: `<ul>${faltantes.map(f => `<li>${f}</li>`).join("")}</ul>`
    });
    return;
  }

  const formData = new FormData(registro);

  try {
    const res = await fetch("./query_sql/registrar_uniforme.php", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.ok) {
      Swal.fire("Éxito", data.mensaje, "success");
      registro.reset();
      ocultarRegistrar();
      divTablaUniforme.style.display = "none";
    } else {
      Swal.fire("Error", data.mensaje || "No se pudo registrar", "error");
    }

  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Fallo en la conexión", "error");
  }
});
//Tabla carga de uniformes
async function cargarTablaUniformes(dataTrabajador) {
  try {
    const puesto_clave = dataTrabajador.puesto_clave;
    const genero = dataTrabajador.genero;
    const tipo_contrato = dataTrabajador.tipo_contrato;

    const data = await obtenerUniformes({
      puesto_clave,
      genero,
      tipo_contrato
    });

    TablaUniformes(data, puesto_clave, genero);

  } catch (error) {
    console.error("Error cargando uniformes:", error);
  }
}

//mostar y ocultar tabla de uniformes
function mostrarTabla() {
  divTablaUniforme.classList.remove("d-none");
}

function ocultarTabla() {
  divTablaUniforme.classList.add("d-none");
}

// Se ejecuta cuando cambia el valor de la credencial.
async function manejarCambioCredencial(e) {
  const credencial = e.target.value.trim();

  if (!credencial) {
    limpiarFormulario();
    return;
  }

  const data = await obtenerTrabajador(credencial);

  if (data.error) {
    limpiarFormulario();
    inputNombre.value = data.error;
    inputNombre.style.color = "red";
    return;
  }

  // llenar datos
  llenarFormulario(data);
  mostrarGuiaTallas(data.puesto_clave, data.genero);
  // cargar tabla automáticamente
  await cargarTablaUniformes(data);
}

// Inicializa
function init() {
  ocultarTabla(); 
  inputCredencial.addEventListener("change", manejarCambioCredencial);
}

init();
