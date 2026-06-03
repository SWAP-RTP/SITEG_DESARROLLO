import { obtenerModulos } from "/includes/scripts/obtenerModulos _ofCentrales.js";
import { TablaGenerica } from "/includes/scripts/dataTable.js";
import { convertirFechaADateInput } from "/includes/scripts/fechas.js";
// import { subirArchivo } from "/includes/scripts/uploadFiles.js";
import { toggleHelp } from "/includes/scripts/boton_ayuda.js";
import { cargarArchivosModulo } from "/Incidencias/scripts/verArchivo.js";
import { subirArchivo } from "/Incidencias/scripts/subirArchivo.js";
import { obtenerMes } from "/includes/scripts/obtenerMes.js";

obtenerModulos("/Incidencias/query_sql/listarModulos.php", "select_modulo");
obtenerMes("/Incidencias/query_sql/listarMes.php", "select_mes");

// ******************** DataTable **************************************/

const tablaHtml = document.getElementById("tablaAlmacen");
const selectorTabla = "#tablaAlmacen";

const url = "/Incidencias/query_sql/modulo_detalle.php";
const columnas = [
  { data: "id", title: "ID" },
  { data: "folio", title: "Folio" },
  { data: "modulo", title: "Modulo" },
  { data: "nombre", title: "Nombre Completo" },
  { data: "credencial", title: "Credencial" },
  { data: "hora_reporte", title: "Fecha de Reporte" },
  {
    data: "estatus_id",
    title: "Estatus",

    render: (data, type, row) => {
      // Basado en el módulo de cada registro
      if (row.estatus_id === "1") {
        return '<span class="badge bg-success">Abierto</span>';
      } else if (row.estatus_id === "2") {
        return '<span class="badge bg-warning">En proceso</span>';
      } else if (row.estatus_id === "3") {
        return '<span class="badge bg-danger">Concluido</span>';
      } else if (row.estatus_id === "4") {
        return '<span class="badge bg-danger">No contesto</span>';
      } else {
        return '<span class="badge bg-secondary">Sin definir</span>';
      }
    },
  },
  {
    data: null,
    title: "Acciones",
    orderable: false,
    render: (data, type, row) => {
      let botones = "";
      const credencialUsuario = window.credencialUsuario || "";

      // Mostrar botón Editar para todos menos la credencial 9127
      if (credencialUsuario !== "9721") {
        botones += `
    <button type="button" class="btn-editar btn btn-outline-warning btn-sm ms-1"
      data-bs-toggle="modal" data-bs-target="#formModal"
      onclick="cargarDatos(${row.id})">
      <i class="bi bi-eye"></i> Editar
    </button>
  `;
      }
      // Botón Imprimir: cambia el PDF según el número de palabras en la descripción
      const descripcion = row.desc_anomalia || row.descripcion || "";
      const numPalabras = descripcion.trim()
        ? descripcion.trim().split(/\s+/).length
        : 0;
      const pdfUrl =
        numPalabras >= 300
          ? `/Incidencias/query_sql/pdf_v2.php?id=${row.id}`
          : `/Incidencias/query_sql/pdf.php?id=${row.id}`;
      botones += `
        <button type="button" class="btn btn-outline-danger btn-sm ms-1" onclick="window.open('${pdfUrl}', '_blank')">
          <i class="bi bi-printer"></i> Imprimir
        </button>
       
        `;
      return botones;
    },
  },
];

const formulario = document.getElementById("form_filtros");
document.getElementById("btn-filtrar").addEventListener("click", async () => {
  try {
    // Verificar que se haya seleccionado un módulo
    const selectModulo = document.getElementById("select_modulo");
    if (!selectModulo || !selectModulo.value) {
      alert("Por favor selecciona un módulo");
      return;
    }

    // Destruir DataTable existente si existe
    if ($.fn.DataTable.isDataTable(selectorTabla)) {
      $(selectorTabla).DataTable().destroy();
    }

    // Limpiar contenido previo
    $(selectorTabla + " tbody").empty();

    // Crear nueva tabla
    const dataTable = await TablaGenerica(
      selectorTabla,
      formulario,
      url,
      columnas,
      { order: [[0, "desc"]] },
    );

    // Mostrar tabla correctamente
    $(selectorTabla).show(); // Usar jQuery para mostrar

    // Forzar el recalculo del ancho después de mostrar
    setTimeout(() => {
      dataTable.columns.adjust().draw();
    }, 100);
  } catch (error) {
    console.error("Error al procesar la tabla:", error);

    // Limpiar tabla en caso de error
    if ($.fn.DataTable.isDataTable(selectorTabla)) {
      $(selectorTabla).DataTable().destroy();
    }

    // Mostrar mensaje de error
    const tbody = tablaHtml.querySelector("tbody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${columnas.length}" class="text-center text-danger py-4">
            Sin datos disponibles para mostrar
          </td>
        </tr>
      `;
    }

    $(selectorTabla).show(); // Usar jQuery para mostrar
  }
});

// ******************** funcion para cargar datos en el modal **************************************/

// Hacer la función global para que funcione el onclick
window.cargarDatos = function (id) {
  document.getElementById("modal-id").textContent = id;
  const inputId = document.getElementById("id");
  if (inputId) inputId.value = id;
  console.log("ID seleccionado:", id);

  // Limpiar el input de archivo al cambiar de ID (reemplazando el input para asegurar limpieza)
  const archivoInput = document.getElementById("archivo_editar");
  if (archivoInput) {
    const parent = archivoInput.parentNode;
    const nuevoInput = archivoInput.cloneNode(true);
    nuevoInput.value = "";
    parent.replaceChild(nuevoInput, archivoInput);
  }

  // Limpiar el mensaje de subida de archivo
  const mensaje = document.getElementById("mensaje");
  if (mensaje) mensaje.innerHTML = "";

  cargarDatosEditar(id);
};

async function cargarDatosEditar(id_referencia) {
  const id = id_referencia || window.id;
  if (!id) {
    swal.fire("Error", "ID no proporcionado", "error");
  }

  const response = await fetch("/Incidencias/query_sql/modulo_detalle.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `id=${encodeURIComponent(id)}`,
  });

  const result = await response.json();
  const datos = result.data || [];

  if (datos.length > 0) {
    const entrada = datos[0];
    // Guardar el módulo del registro como entero (no string)
    window.moduloRegistroActual = parseInt(entrada.modulo, 10) || "";

    // Mapeo solo con los campos que sí necesitas
    const map = [
      ["credencial_modal", entrada.credencial],
      ["nombre", entrada.nombre],
      ["modulo", entrada.modulo],
      ["puesto", entrada.puesto],
      ["economico", entrada.economico],
      ["fecha", entrada.hora_reporte ? entrada.hora_reporte.split(" ")[0] : ""],
      ["hora", entrada.hora_reporte ? entrada.hora_reporte.split(" ")[1] : ""],
      ["planta", entrada.planta],
      ["postura", entrada.postura],
      ["ruta", entrada.ruta],
      ["anomalia", entrada.anomalia_detectada],
      ["descripcion", entrada.desc_anomalia],
      ["articulo", entrada.articulo],
      ["art_inciso", entrada.art_inciso],
      ["mb_articulo", entrada.mb_articulo], // <-- AGREGA ESTA LÍNEA
      ["mb_inciso", entrada.mb_inciso], // <-- Y ES
      ["registro_id", entrada.usuario_registra],
      ["registro_nombre", entrada.nombre_registro_consecutivo],
      ["supervisor_id", entrada.usuario_supervisor],
      ["supervisor_nombre", entrada.nombre_supervisor],
      ["jefatura_id", entrada.usuario_jefatura],
      ["jefatura_nombre", entrada.nombre_jefatura],
      ["gerente_id", entrada.usuario_adscrito],
      ["gerente_nombre", entrada.nombre_tipo_jefe],
    ];

    map.forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    });

    // Seleccionar automáticamente la anomalía en el select
    const selectAnomalia = document.getElementById("anomalia_clave");
    if (selectAnomalia && entrada.anomalia_id) {
      selectAnomalia.value = entrada.anomalia_id;
    }
    // Cargar rutas del módulo
    await ruta(window.moduloRegistroActual, entrada.ruta);

    // Seleccionar automáticamente la ruta cuando se hayan cargado las opciones
    document.addEventListener("rutasCargadas", function seleccionarRuta() {
      const rutaSelect = document.getElementById("ruta");
      if (rutaSelect && entrada.ruta) {
        rutaSelect.value = entrada.ruta;
      }
      document.removeEventListener("rutasCargadas", seleccionarRuta);
    });

    //  seleccionar el económico cuando se hayan cargado las opciones
    const selectEconomico = document.getElementById("economico");

    // Cargar económicos y luego seleccionar el valor
    await economico(window.moduloRegistroActual, String(entrada.economico))
      .then(() => {
        if (selectEconomico && entrada.economico) {
          // Si el valor existe en las opciones, se selecciona
          const existe = Array.from(selectEconomico.options).some(
            (opt) => opt.value === entrada.economico,
          );
          if (existe) {
            selectEconomico.value = entrada.economico;
            console.log("Económico seleccionado:", entrada.economico);
          } else {
            console.warn(
              "El económico",
              entrada.economico,
              "no existe en las opciones",
            );
          }
        }
      })
      .catch((err) => console.error("Error al cargar económicos:", err));

    // Deshabilitar campos si el estatus es 4, habilitar si no
    const camposDeshabilitar = [
      "credencial_modal",
      "nombre",
      "modulo",
      "puesto",
      "fecha",
      "hora",
      "economico",
      "planta",
      "postura",
      "ruta",
      "anomalia",
      "anomalia_clave",
      "descripcion",
      "nuevo_anomalia_clave",
      "nueva_descripcion_anomalia",
    ];
    if (entrada.estatus_id === "4") {
      camposDeshabilitar.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
      });
    } else {
      camposDeshabilitar.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
      });
    }
  }
}
// ******************** fin funcion para cargar datos en el modal **************************************/

//******************** select anomalias **************************************/

const OPTION_OTRO_VALUE = "__OTRO__";
function selectAnomalia() {
  $.ajax({
    url: "query_sql/catalogo_anomalia.php",
    method: "GET",
    dataType: "json",
    success: function (datos) {
      let options = '<option value="">--Seleccione una opción--</option>';

      (datos || []).forEach(function (con) {
        // Sanitiza y arma opciones
        const id = con.id;
        const clave = (con.anomalia_clave || "").toString();
        options += `<option value="${id}">${clave}</option>`;
      });

      // Agrega OTRO al final
      options += `<option value="${OPTION_OTRO_VALUE}">OTRO…</option>`;
      $("#anomalia_clave").html(options);
    },
    error: function () {
      $("#anomalia_clave").html('<option value="">Error al cargar</option>');
    },
  });
}

$(document).ready(function () {
  selectAnomalia();

  // Al cambiar el select de anomalías:
  $("#anomalia_clave").on("change", function () {
    const val = $(this).val();
    if (val === OPTION_OTRO_VALUE) {
      // Limpia campos del modal
      $("#nuevo_anomalia_clave").val("");
      $("#nueva_descripcion_anomalia").val("");
      // Abre modal
      const modal = new bootstrap.Modal(
        document.getElementById("modalNuevaAnomalia"),
      );
      modal.show();
    }
  });

  // Guardar desde el modal
  $("#btnGuardarNuevaAnomalia").on("click", function () {
    const anomalia_clave = $("#nuevo_anomalia_clave").val().trim();
    const descripcion = $("#nueva_descripcion_anomalia").val().trim();

    if (!anomalia_clave || !descripcion) {
      Swal.fire("Faltan datos", "Completa clave y descripción.", "warning");
      return;
    }

    // Inserta en la BD
    $.ajax({
      url: "query_sql/crear_anomalia.php",
      method: "POST",
      dataType: "json",
      data: { anomalia_clave, descripcion },
      success: function (res) {
        if (!res || res.success !== true) {
          const msg =
            res && res.message ? res.message : "No se pudo registrar.";
          Swal.fire("Error", msg, "error");
          return;
        }

        // Cierra modal
        const modalEl = document.getElementById("modalNuevaAnomalia");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance && modalInstance.hide();

        // Agrega la nueva opción al select y la selecciona
        const nuevoId = res.id; // devuelto por PHP
        const nuevaClave = res.anomalia_clave;
        const $select = $("#anomalia_clave");

        // Inserta antes de OTRO…
        const $optOtro = $select.find(`option[value='${OPTION_OTRO_VALUE}']`);
        $optOtro.before(`<option value="${nuevoId}">${nuevaClave}</option>`);
        $select.val(nuevoId);

        Swal.fire({
          title: "Registrado",
          text: "La anomalía fue agregada al catálogo.",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      },
      error: function () {
        Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
      },
    });
  });
});

// ******************** EDITAR **************************************/
export async function editarIncidencia() {
  try {
    const formulario = document.getElementById("formIncidencias_modal");
    if (!formulario) return;
    const formData = new FormData(formulario);
    const datosEnviar = new URLSearchParams([...formData.entries()]);
    const response = await fetch("/Incidencias/query_sql/update.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: datosEnviar,
    });

    if (!response.ok) {
      throw new Error("Error al obtener los modulos: " + response.statusText);
    }

    const data = await response.json();
    const ok = !!(data && data.success === true);
    const msg = ok
      ? "Se guardó en la base de datos"
      : (data && (data.message || data.error)) || "No se pudo guardar";
    Swal.fire(ok ? "Éxito" : "Error", msg, ok ? "success" : "error");
    // Si fue exitoso, cerrar el modal de edición
    if (data && data.success) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("formModal"),
      );
      if (modal) modal.hide();
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudo guardar", "error");
  }
}
document
  .getElementById("btn_formulario")
  .addEventListener("click", async (event) => {
    event.preventDefault(); // Evita el envío por defecto
    await editarIncidencia();
  });

// *********************** BOTON AYUDA *************************************************

const ayuda_editar = [
  "Al abrir esta sección podrás modificar la información del reporte y guardarla usando el botón <span class='badge bg-primary text-white'>Guardar Edición</span>.<br>",
  "Los campos que no tienen permitido cambiar son: <b>CREDENCIAL, NOMBRE, MODULO, Y PUESTO</b>.<br>",
  // "Si todo está correcto, deberás subir el documento que será enviado al área de Módulos para su validación utilizando el botón <span class='badge bg-warning text-white'>Enviar a Módulo</span>.<br>",
  // "Todo nuevo registro inicia en estado <span class='badge bg-success text-white'>Abierto</span>. Al enviarlo a Módulos, cambiará automáticamente a <span class='badge bg-warning text-white'>En proceso</span>.<br>",
  "Si tienes alguna duda, ayudanos a levantar un ticket.<br>",
];
toggleHelp(ayuda_editar, "¿Tienes dudas?", "btnAyuda");

const ayuda_consulta = [
  "En esta seccion podras visualizar los reportes que ya han sido registrados con el boton <span class='badge bg-primary text-white'>Filtrar</span>.<br>",
  "En la tabla, se mostrara la informacion con sus botones de acciones, <span class='badge bg-warning text-white'>Editar</span>, <span class='badge bg-danger text-white'>Imprimir</span>, <span class='badge bg-primary text-white'>Responder</span>, <span class='badge bg-success text-white'>Ver oficio</span> oficio <br>",
  "Si tienes alguna duda, puedes levantar un ticket.<br>",
];
toggleHelp(ayuda_consulta, "¿Tienes,dudas?", "btn_consulta");

//****************************** leer archivo con el boton **************************************/

// // Función para cargar archivos del módulo específico

// cargarArchivosModulo(
//   "lista-archivos",
//   "/Incidencias/query_sql/listar_archivos_upload.php"
// );

// Función para ver archivo en el modal
window.verArchivo = function (nombreArchivo) {
  const moduloAUsar = window.moduloRegistroActual || "1";
  const archivoURL = `/Incidencias/uploads/modulo_${moduloAUsar}/${nombreArchivo}`;

  const contenedor = document.getElementById("contenedor-archivo");
  contenedor.innerHTML = `<embed src="${archivoURL}" width="100%" height="100%" type="application/pdf">`;
};

// Nueva función para cargar datos primero y después abrir modal
window.cargarDatosYAbrirModal = async function (id) {
  // Primero cargar los datos del registro y espera a que termine
  await cargarDatosEditar(id);
  // Abrir el modal de archivos
  const modal = new bootstrap.Modal(document.getElementById("modalArchivo"));
  modal.show();
  // Cargar los archivos del módulo correspondiente
  const modulo = window.moduloRegistroActual || "1";
  cargarArchivosModulo(
    "lista-archivos",
    "/Incidencias/query_sql/listar_archivos_upload.php",
    modulo,
  );
};

// // Actualizar la función cargarLista para usar la nueva función
// window.cargarLista = function () {
//   const modulo = window.moduloRegistroActual || "1";
//   cargarArchivosModulo(
//     "lista-archivos",
//     "/Incidencias/query_sql/listar_archivos_upload.php",
//     modulo
//   );
// };

// // Cargar archivos cuando se abre el modal
// document
//   .getElementById("modalArchivo")
//   .addEventListener("show.bs.modal", function () {
//     const modulo = window.moduloRegistroActual || "1";
//     cargarArchivosModulo(
//       "lista-archivos",
//       "/Incidencias/query_sql/listar_archivos_upload.php",
//       modulo
//     );
//   });

// Limpiar contenido al cerrar el modal
// document
//   .getElementById("modalArchivo")
//   .addEventListener("hidden.bs.modal", function () {
//     document.getElementById("contenedor-archivo").innerHTML = "";
//   });

//****  rutas segun el modulo
function ruta(modulo, rutaSeleccionada = "") {
  const numRutaSelect = document.getElementById("ruta");
  if (!numRutaSelect) return;

  const formData = new URLSearchParams();
  formData.append("modulo", modulo);

  return fetch("query_sql/getRutas.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  })
    .then((response) => response.json())
    .then((data) => {
      numRutaSelect.innerHTML =
        '<option value="">-- Selecciona una ruta --</option>';
      let existe = false;

      if (data && data.success && Array.isArray(data.data)) {
        data.data.forEach((item) => {
          const valor = String(item.ruta);
          const option = document.createElement("option");
          option.value = valor;
          option.text = item.texto;
          numRutaSelect.appendChild(option);
          if (valor === String(rutaSeleccionada)) existe = true;
        });
        // Si la ruta no existe, la agregamos como opción especial
        if (rutaSeleccionada && !existe) {
          const option = document.createElement("option");
          option.value = String(rutaSeleccionada);
          option.text = String(rutaSeleccionada) + " (no listado)";
          numRutaSelect.appendChild(option);
        }
        // Selecciona la ruta automáticamente
        if (rutaSeleccionada) numRutaSelect.value = String(rutaSeleccionada);
      }
    });
}
// ************************************ subir archivo por carpeta y cambio de estatus ************************************

// document
//   .getElementById("enviar_modulo")
//   .addEventListener("click", async function (e) {
//     e.preventDefault();

//     const id = document.getElementById("id").value;
//     const fecha = document.getElementById("date").value;
//     const hora = document.getElementById("time").value;
//     const modulo = window.moduloRegistroActual || "1";
//     const archivoInput = document.getElementById("archivo_editar");

//     if (!fecha || !hora) {
//       swal.fire("Selecciona fecha y hora.");
//       return;
//     }

//     // Guarda fecha y hora en localStorage si lo necesitas
//     localStorage.setItem(`fecha_${id}`, fecha);
//     localStorage.setItem(`hora_${id}`, hora);

//     // Envía estatus 2 y la fecha/hora al backend
//     const datosEnviar = new URLSearchParams({ id, estatus_id: 2 });
//     const response = await fetch("/Incidencias/query_sql/update.php", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: datosEnviar,
//     });

//     const data = await response.json();

//     swal.fire({
//       title: data && data.success ? "Éxito" : "Error",
//       text:
//         data && data.success
//           ? "Reporte enviado a Modulos"
//           : "No se pudo actualizar",
//       icon: data && data.success ? "success" : "error",
//       timer: 1500,
//       showConfirmButton: false,
//     });

//     // Limpiar los inputs de fecha y hora
//     document.getElementById("date").value = "";
//     document.getElementById("time").value = "";

//     // Refresca la tabla si fue exitoso
//     if (data && data.success) {
//       document.getElementById("btn-filtrar").click();
//     }

//     // Si el input de archivo NO está vacío, sube el archivo
//     if (archivoInput && archivoInput.files && archivoInput.files.length > 0) {
//       subirArchivo(
//         "archivo_editar",
//         "mensaje",
//         "enviar_modulo",
//         "/includes/helpers/uploadFiles.php",
//         modulo
//       );
//       // Limpiar el input y el mensaje después de subir
//       setTimeout(() => {
//         const inputActual = document.getElementById("archivo_editar");
//         if (inputActual) {
//           const parent = inputActual.parentNode;
//           const nuevoInput = inputActual.cloneNode(true);
//           nuevoInput.value = "";
//           parent.replaceChild(nuevoInput, inputActual);
//         }
//         const mensaje = document.getElementById("mensaje");
//         if (mensaje) mensaje.innerHTML = "";
//       }, 500);
//     }

//     // Calcula el tiempo restante hasta la fecha/hora seleccionada
//     const fechaHoraSeleccionada = new Date(`${fecha}T${hora}`);
//     const ahora = new Date();
//     let msRestantes = fechaHoraSeleccionada - ahora;
//     if (msRestantes < 0) msRestantes = 0; // Si ya pasó, ejecuta de inmediato

//     // Al caducar el tiempo, cambia estatus a 4 (No contesto)
//     setTimeout(async () => {
//       const datosAutomaticos = new URLSearchParams({
//         id,
//         estatus_id: 4,
//       });

//       const responseAuto = await fetch("/Incidencias/query_sql/update.php", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: datosAutomaticos,
//       });

//       const dataAuto = await responseAuto.json();

//       if (dataAuto && dataAuto.success) {
//         document.getElementById("btn-filtrar").click();
//         swal.fire({
//           title: "Estatus actualizado",
//           text: "El registro fue marcado como 'No contesto'.",
//           icon: "info",
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       }
//     }, msRestantes);
//   });

/********************* Economico******************************** */

// Obtiene los económicos dependiendo del módulo
function economico(modulo, economicoSeleccionado = "") {
  const numEcoSelect = document.getElementById("economico");
  if (!numEcoSelect) return;

  const formData = new URLSearchParams();
  formData.append("modulo", modulo);

  return fetch("query_sql/getEconomicos.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  })
    .then((response) => response.json())
    .then((data) => {
      numEcoSelect.innerHTML =
        '<option value="">-- Selecciona un económico --</option>';
      let existe = false;

      if (data && data.success && Array.isArray(data.data)) {
        data.data.forEach((item) => {
          const valor = String(item.pv_eco);
          const option = document.createElement("option");
          option.value = valor;
          option.text = valor;
          numEcoSelect.appendChild(option);
          if (valor === String(economicoSeleccionado)) existe = true;
        });
        // Si el valor no existe, lo agregamos como opción especial
        if (economicoSeleccionado && !existe) {
          const option = document.createElement("option");
          option.value = String(economicoSeleccionado);
          option.text = String(economicoSeleccionado) + " (no listado)";
          numEcoSelect.appendChild(option);
        }
        // Selecciona el económico automáticamente
        if (economicoSeleccionado)
          numEcoSelect.value = String(economicoSeleccionado);
      }
    });
}

