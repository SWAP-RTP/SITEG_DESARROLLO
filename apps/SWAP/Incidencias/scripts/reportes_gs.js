/********************* Importaciones *********************/
import { buscar_x_credencial } from "/includes/scripts/buscarCredencial.js";
import { buscar_x_nombre } from "/includes/scripts/buscarNombre.js";

/********************Generar Folio*******************************************/
$(function () {
  fetch("query_sql/getFolio.php")
    .then((res) => res.json())
    .then((data) => {
      if (data.ok && data.folio) $("#folio").val(data.folio);
      else console.warn("No se pudo obtener el folio:", data.message);
      console.log("Folio generado " + data.folio);
    })
    .catch(() => console.warn("Error consultando el folio."));
});

/********************* Helpers mínimos ****************************************/
function limpiarInputsPrincipal() {
  const cred = document.getElementById("credencial");
  const nom = document.getElementById("nombre");
  if (cred) cred.value = "";
  if (nom) nom.value = "";
  if (cred) cred.focus();
}

/********************* Utilidad: cargar Módulo y Puesto *********************/
function cargarModuloYPuesto(
  credencial,
  {
    idModuloTexto = "modulo",
    idPuestoTexto = "puesto",
    idModuloHidden = "modulo_hidden",
    idPuestoHidden = "puesto_hidden",
  } = {}
) {
  const M = document.getElementById(idModuloTexto);
  const P = document.getElementById(idPuestoTexto);
  const MH = document.getElementById(idModuloHidden);
  const PH = document.getElementById(idPuestoHidden);

  const selRuta = document.getElementById("ruta");
  const selEco  = document.getElementById("economico");

  const sync = (modVal, puestoVal) => {
    if (M)  M.value  = modVal || "";
    if (P)  P.value  = puestoVal || "";
    if (MH) MH.value = modVal || "";
    if (PH) PH.value = puestoVal || "";
    if (modVal) {
      economico(modVal);     
        rutas(modVal);
    } else {
      // limpiar selects si no hay módulo
      if (selEco)  selEco.innerHTML  = '<option value="">-- Selecciona un económico --</option>';
    }
  };

  const limpiar = () => sync("", "");

  if (!credencial) { limpiar(); return; }

  $.ajax({
    url: "query_sql/buscar_trabajador.php",
    method: "GET",
    dataType: "json",
    data: { credencial },
    success: function (res) {
      if (!res || res.success !== true) { limpiar(); return; }
      if (res.nombre === "Trabajador pertenece a otro módulo") {
         Swal.fire({
          icon: "warning",
          title: "Atención",
          text: "El trabajador pertenece a otro módulo."
        }).then(() => {
          limpiarInputsPrincipal(); 
        });
        return;
      }

      const modVal    = res.mod_clave || res.modulo || "";
      const puestoVal = res.puesto || "";
      sync(modVal, puestoVal);
    },
    error: function () { limpiar(); },
  });
}

/********************* Economico******************************** */
function economico(modulo) {
  const sel = document.getElementById("economico");
  if (!sel) return;

  const baseOptions =
    '<option value="" selected>-- Selecciona un económico --</option>' +
    '<option value="N/A">N/A</option>' +
    '<option value="S/D">S/D</option>';

  if (!modulo || String(modulo).trim() === "") {
    sel.innerHTML = baseOptions;
    return;
  }

  sel.innerHTML = baseOptions;

  const fd = new FormData();
  fd.append("modulo", modulo);

  fetch("query_sql/getEconomicos.php", { method: "POST", body: fd })
    .then(r => r.json())
    .then(data => {
      
      sel.innerHTML = baseOptions;

      if (data && data.success && Array.isArray(data.data) && data.data.length) {
        for (const item of data.data) {
          const opt = document.createElement("option");
          opt.value = item.pv_eco;
          opt.textContent = item.pv_eco;
          sel.appendChild(opt);
        }
      } else {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Sin económicos disponibles";
        sel.appendChild(opt);
      }
    })
    .catch(err => {
      console.error("Error al obtener los económicos:", err);
      sel.innerHTML = baseOptions;
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Error al cargar económicos";
      sel.appendChild(opt);
    });
}


/********************* Rutas *********************************/
function rutas(modulo) {
  const sel = document.getElementById("ruta");
  if (!sel) return;

  const baseOptions =
    '<option value="" selected>-- Selecciona una ruta --</option>' +
    '<option value="N/A">N/A</option>' +
    '<option value="S/D">S/D</option>';

  if (!modulo || String(modulo).trim() === "") {
    sel.innerHTML = baseOptions;
    return;
  }

  sel.innerHTML = baseOptions;

  const fd = new FormData();
  fd.append("modulo", modulo);

  fetch("query_sql/getRutas.php", { method: "POST", body: fd })
    .then(r => r.json())
    .then(res => {
      
      sel.innerHTML = baseOptions;

      if (res && res.success === true && Array.isArray(res.data) && res.data.length) {
        res.data.forEach(item => {
        
          const value = (item.ruta ?? item.id ?? item.texto ?? "").toString().trim();
          const label = (item.texto ?? item.ruta ?? item.descripcion ?? "").toString().trim();
          if (!value || !label) return;

          const opt = document.createElement("option");
          opt.value = value;
          opt.textContent = label;
          sel.appendChild(opt);
        });
      }
     
    })
    .catch(err => {
      console.error("Error al obtener las rutas:", err);
      
      sel.innerHTML = baseOptions;
      
    });
}


/********************* Buscar por Credencial *********************/
function BuscarCredencial(credencialId, nombreId) {
  const inputCred = document.getElementById(credencialId);
  if (!inputCred) return;

  let spanError = document.getElementById(`error_${credencialId}`);
  if (!spanError) {
    spanError = document.createElement("span");
    spanError.id = `error_${credencialId}`;
    spanError.style.color = "red";
    spanError.style.fontSize = "12px";
    spanError.style.display = "none";
    inputCred.parentNode.appendChild(spanError);
  }

  inputCred.addEventListener("input", function () {
    if (inputCred.value.trim() === "") {
      const inputNombre = document.getElementById(nombreId);
      if (inputNombre) inputNombre.value = "";
      
      spanError.style.display = "none";
      
      if (credencialId === "credencial" && nombreId === "nombre") {
        cargarModuloYPuesto("");
      }
    }
  });

  inputCred.addEventListener("blur", function () {
    const valor = inputCred.value.trim();
    const inputNombre = document.getElementById(nombreId);

    // Si está vacío pero el nombre tiene valor, no mostrar error
    if (valor === "") {
      if (inputNombre && inputNombre.value.trim() !== "") {
        spanError.style.display = "none";
        return;
      }
      spanError.textContent = "La credencial no puede estar vacía.";
      spanError.style.display = "block";
      if (inputNombre) inputNombre.value = "";
      // Solo limpiar módulo/puesto si es el campo principal
      if (credencialId === "credencial" && nombreId === "nombre") {
        cargarModuloYPuesto(""); // limpiar módulo/puesto del encabezado
      }
      return;
    } else {
      spanError.style.display = "none";
    }

    buscar_x_credencial(
      "/includes/helpers/buscar_nombre_clave.php",
      valor,
      (data) => {
        if (Array.isArray(data) && data.length > 0) {
          if (data[0].trab_status == "2") {
            if (inputNombre) inputNombre.value = "";
            // Solo limpiar módulo/puesto si es el campo principal
            if (credencialId === "credencial" && nombreId === "nombre") {
              cargarModuloYPuesto(""); // limpiar
            }
            Swal.fire({
              title: "Error",
              text: "La credencial pertenece a un trabajador inactivo.",
              icon: "error",
            });
            return;
          }

          const ap = (data[0].trab_apaterno ?? data[0].tab_apaterno ?? "")
            .toString()
            .trim();
          const am = (data[0].trab_amaterno ?? "").toString().trim();
          const no = (data[0].trab_nombre ?? "").toString().trim();
          if (inputNombre) inputNombre.value = `${no} ${ap} ${am}`.trim();

          if (inputNombre) {
            inputNombre.classList.add("border-success");
            setTimeout(
              () => inputNombre.classList.remove("border-success"),
              1500
            );
          }

          Swal.fire({
            title: "Usuario agregado",
            icon: "success",
            timer: 800,
            showConfirmButton: false,
          });

          // Solo para la cabecera principal (credencial + nombre principales)
          if (credencialId === "credencial" && nombreId === "nombre") {
            cargarModuloYPuesto(valor, {
              idModuloTexto: "modulo",
              idPuestoTexto: "puesto",
            });
          }
        } else {
          if (inputNombre) inputNombre.value = "";
          // Solo limpiar módulo/puesto si es el campo principal
          if (credencialId === "credencial" && nombreId === "nombre") {
            cargarModuloYPuesto("");
          }
          Swal.fire("No encontrado", "No se encontró la credencial", "warning");
        }
      }
    );
  });
}

// Instancias (principal + otros campos de firmas)
BuscarCredencial("credencial", "nombre");
// BuscarCredencial("registro_id", "registro_nombre");
BuscarCredencial("supervisor_id", "supervisor_nombre");
// BuscarCredencial("jefatura_id", "jefatura_nombre");
BuscarCredencial("gerente_id", "gerente_nombre");

/********************* Buscar por Nombre (auto-complete) *********************/
function configurarBusquedaNombre(inputId, credencialId, contenedorId, url) {
  const input = document.getElementById(inputId);
  let timer = null;
  if (!input) return;

  input.addEventListener("input", function () {
    clearTimeout(timer);
    const valor = input.value.trim();
    const lista = document.getElementById(contenedorId);
    if (!lista) return;

    if (!valor) {
      lista.innerHTML = "";
      return;
    }

    timer = setTimeout(() => {
      buscar_x_nombre({
        url,
        btnBuscar: null,
        nombre: valor,
        onResult: (data) => {
          lista.innerHTML = "";
          if (!Array.isArray(data) || data.length === 0) {
            lista.innerHTML = `
              <div class="no-resultados">
                <i class="bi bi-search text-warning icono"></i>
                <div class="titulo">No se encontraron coincidencias</div>
                <div class="subtitulo">Intenta con otros términos de búsqueda</div>
              </div>`;
            return;
          }

          const tabla = document.createElement("table");
          tabla.className = "table table-borderless tabla-busqueda";
          tabla.innerHTML = `
            <thead>
              <tr>
                <th class="resultado-header" style="width:25%">
                  <i class="bi bi-card-text me-2"></i>Credencial
                </th>
                <th class="resultado-header" style="width:75%">
                  <i class="bi bi-person-fill me-2"></i>Información del Empleado
                </th>
              </tr>
            </thead>
          `;
          const tbody = document.createElement("tbody");

          data.forEach((empleado) => {
            const ap = (empleado.trab_apaterno ?? empleado.tab_apaterno ?? "")
              .toString()
              .trim();
            const am = (empleado.trab_amaterno ?? "").toString().trim();
            const no = (empleado.trab_nombre ?? "").toString().trim();
            const nombreCompleto = `${no} ${ap} ${am}`.trim();

            const row = document.createElement("tr");
            row.className = "resultado-row";
            row.style.cursor = "pointer";
            row.innerHTML = `
              <td style="text-align:center;">
                <span class="credencial-badge">${
                  empleado.trab_credencial ?? ""
                }</span>
              </td>
              <td>
                <div class="nombre-texto">${nombreCompleto}</div>
                <div class="click-hint"><i class="bi bi-hand-index me-1"></i>Haz clic para seleccionar</div>
              </td>
            `;

            row.addEventListener("click", () => {
              const inputNombre = document.getElementById(inputId);
              const inputCred = document.getElementById(credencialId);

              if (inputNombre) inputNombre.value = nombreCompleto;
              if (inputCred) inputCred.value = empleado.trab_credencial ?? "";

              // Ocultar el mensaje de error de credencial vacía
              const spanError = document.getElementById(
                `error_${credencialId}`
              );
              if (spanError) spanError.style.display = "none";

              // Si es el encabezado principal, también llenamos módulo/puesto
              if (inputId === "nombre" && credencialId === "credencial") {
                cargarModuloYPuesto(empleado.trab_credencial ?? "", {
                  idModuloTexto: "modulo",
                  idPuestoTexto: "puesto",
                });
              }

              row.style.background = "linear-gradient(90deg,#d4edda,#c3e6cb)";
              row.style.transform = "scale(0.98)";
              Swal.fire({
                title: "¡Usuario seleccionado!",
                icon: "success",
                timer: 900,
                showConfirmButton: false,
                customClass: {
                  popup: "animate__animated animate__zoomIn animate__faster",
                },
              });
              setTimeout(() => (lista.innerHTML = ""), 50);
            });

            tbody.appendChild(row);
          });

          tabla.appendChild(tbody);
          const contenedorTabla = document.createElement("div");
          contenedorTabla.className = "tabla-busqueda-container";
          contenedorTabla.appendChild(tabla);
          lista.appendChild(contenedorTabla);
        },
      });
    }, 800); // debounce
  });
}

// Instancias de búsqueda por nombre
configurarBusquedaNombre(
  "nombre",
  "credencial",
  "listaNombresMain",
  "/includes/helpers/buscar_nombre_clave.php"
);
// configurarBusquedaNombre("registro_nombre", "registro_id", "listaNombresregistro", "/includes/helpers/buscar_nombre_clave.php");
configurarBusquedaNombre(
  "supervisor_nombre",
  "supervisor_id",
  "listaNombresSupervisor",
  "/includes/helpers/buscar_nombre_clave.php"
);
// configurarBusquedaNombre("jefatura_nombre", "jefatura_id", "listaNombresJefatura", "/includes/helpers/buscar_nombre_clave.php");
configurarBusquedaNombre(
  "gerente_nombre",
  "gerente_id",
  "listaNombresGerente",
  "/includes/helpers/buscar_nombre_clave.php"
);
// configurarBusquedaNombre("Registro_nombre", "registro_id", "listaNombresregistro", "/includes/helpers/buscar_nombre_clave.php");

/****************** Catálogo de Anomalías ***********************/
const OPTION_OTRO_VALUE = "__OTRO__";

function selectAnomalia() {
  $.ajax({
    url: "query_sql/catalogo_anomalia.php",
    method: "GET",
    dataType: "json",
    success: function (datos) {
      let options = '<option value="">--Seleccione una opción--</option>';

      (datos || []).forEach(function (con) {
       
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
        document.getElementById("modalNuevaAnomalia")
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
        const nuevoId = res.id; 
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

/*********************input registro_consecutivo y jefatura GS*********************/
document.addEventListener("DOMContentLoaded", () => {
  // Si quieres que NO se puedan editar pero sí viajen:
  ["registro_id", "registro_nombre", "jefatura_id", "jefatura_nombre"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.readOnly = true;
        el.classList.add("bg-light");
        el.setAttribute("tabindex", "-1");
      }
    }
  );
});

/********************* Formulario de registro *********************/
$(document).ready(function () {
  $("#formIncidencias").on("submit", function (e) {
    e.preventDefault();

    // sincroniza hidden
    const moduloVal = document.getElementById("modulo")?.value || "";
    const puestoVal = document.getElementById("puesto")?.value || "";
    const MH = document.getElementById("modulo_hidden");
    const PH = document.getElementById("puesto_hidden");
    if (MH) MH.value = moduloVal;
    if (PH) PH.value = puestoVal;

    const $form = $(this);
    const $btnSubmit = $form.find('button[type="submit"]');
    $btnSubmit.prop("disabled", true);

    $.ajax({
      url: "query_sql/reporte_incidencia.php",
      type: "POST",
      data: $form.serialize(),
      dataType: "json",
      success: function (response) {
        if (response && response.success) {
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: response.folio
              ? `Registro guardado correctamente.\nFolio: ${response.folio}`
              : response.message || "Registro guardado.",
            confirmButtonText: "Aceptar",
          }).then(() => {
            // pedir el próximo folio sin recargar la página
            fetch("query_sql/getFolio.php")
              .then((r) => r.json())
              .then((d) => {
                if (d.ok && d.folio) $("#folio").val(d.folio);
              });

            // limpia el formulario 
            $form[0].reset();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              (response && response.message) ||
              "No se pudo guardar el registro.",
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al enviar el formulario.",
        });
      },
      complete: function () {
        $btnSubmit.prop("disabled", false);
      },
    });
  });
});
