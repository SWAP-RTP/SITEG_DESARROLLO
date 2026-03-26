// importamos alerta de notificacion
import { ToastBootstrap } from "/includes/js/toast.js";

export function consulta_usuarios() {
    $.ajax({
        url: "/admin/query_sql/getUsuarios.php",
        type: "GET",
        dataType: "json",
        success: function(data) {
            DataTable(data);
        },
        error: function(xhr) {
            console.error("Error en la petición:", xhr.statusText);
        }
    });
}

function DataTable(data) {
    // Si la tabla ya existe, la destruimos para reinicializarla con datos nuevos
    if ($.fn.DataTable.isDataTable('#tabla_usuarios')) {
        $('#tabla_usuarios').DataTable().destroy();
    }

    $('#tabla_usuarios').DataTable({
        data: data,
        responsive: true,
        scrollX: true,
        autoWidth: false,

        columns: [
            { data: "id_usuario", title: "Credencial", class: "text-center", width: "8%" },
            { data: "nombre", title: "Nombre", class: "text-center", width: "20%" },
            { data: "correo", title: "Correo", class: "text-center", width: "20%" },
            { data: "contrasena", title: "Contraseña", class: "text-center", width: "5%" },
            {
                data: null,
                title: "Acción",
                class: "text-center",
                orderable: false,
                render: function (data, type, row) {
                    return `
                        <div class="d-flex justify-content-center">
                            <button type="button" class="btn btn-primary me-2 btn-editar-user" data-bs-toggle="modal" data-bs-target="#modal_editar_usuario">
                                <i class="fa fa-pencil"></i> Editar
                            </button>
                            <button class="btn btn-danger btn-sm btn-eliminar-user">
                                <i class="fa fa-trash"></i> Eliminar
                            </button>
                        </div>
                    `;
                }
            }
        ],
        language: {
            url: "/lib/datatables.net-1.13.6/es-ES.json", // Para tener la tabla en español
        }
    });
}

// cada que cambie la credencial haga la consulta del nombre 
$(document).on("change", "#cred_user", function (e) {
    e.preventDefault();

    const cred_user = document.getElementById('cred_user').value.trim();
    const cred_num = parseInt(cred_user);

    // si está vacío, o si es menor o igual a 0
    if (cred_user === "" || cred_num <= 0) {
        $("#nom_user").val("");
        // limpia el input de la credencial si es 0 o negativo
        if (cred_num <= 0) {
            $(this).val(""); 
        }
        return;
    }

    const formData = new FormData();
    formData.append('cred_user', cred_user);

    fetch('/admin/query_sql/getTrabajador.php', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (!data || data.length === 0) {
            ToastBootstrap.error("El usuario no existe o está inactivo");
        } else {
            $("#nom_user").val(data[0].nombre_completo);
        }
    });
});

// busqueda de usuario por nombre
document.getElementById("nom_user").addEventListener("input", function(){
    const datalist = document.getElementById("lista");
    const nombre_user = document.getElementById('nom_user').value

    // si está vacío
    if (nombre_user === "") {
        $("#cred_user").val("");
        // limpia el input de la credencial si es 0 o negativo
        if (cred_user === "") {
            $(this).val(""); 
        }
        return;
    }

    const formData = new FormData();
    formData.append('nom_user', $("#nom_user").val());

    fetch('query_sql/getTrabajador.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Limpiar las opciones anteriores del datalist
        datalist.innerHTML = "";

        if (data.error) {
            ToastBootstrap.error("El usuario no existe o está inactivo");
        } else {
            $("#cred_user").val(data[0].trab_credencial);

            // Llenar el datalist con las nuevas opciones
            data.forEach(function(dato) {
                // console.log(dato.credencial)
                var option = document.createElement("option");
                // option.value = dato.credencial + ' ' + dato.nombre;
                option.value = dato.trab_credencial + "-" + dato.nombre_completo;
                option.setAttribute("data-credencial", dato.trab_credencial); // Guardar la credencial asociada
                datalist.appendChild(option);
            });
        } 
    });
});


$(document).on("click", "#guardar_nuevo_usuario", function (e) {
    e.preventDefault();

    const formUsuario =  document.getElementById('nuevo_usuario')
    const formData = new FormData(formUsuario);

    if (!formUsuario.checkValidity()) {
        e.stopPropagation();
        formUsuario.classList.add('was-validated');
        ToastBootstrap.warning('Todos los campos son obligatorios');
        return;
    }

    fetch('/admin/query_sql/insertar_usuario.php',{
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.respuesta === 1) {
        ToastBootstrap.warning(data.mensaje);

        } else if (data.respuesta === false) {
            ToastBootstrap.error(data.mensaje);

        } else if (data.respuesta === true) {
            formUsuario.reset(); 
            $("#nom_user").val(""); 
            ToastBootstrap.success(data.mensaje);
            consulta_usuarios(); 
        }
    })
});

$(document).on("click", ".btn-editar-user", function () {
    const row = $(this).closest('tr');
    const id_usr = row.find('td').eq(0).text(); //busqueda por id, primera columna de la data
    const nombre = row.find('td').eq(1).text(); 
    const correo = row.find('td').eq(2).text(); 

    $("#edit_id_user").html(id_usr);    
    $("#edit_nomb_user").html(nombre);        
    $("#edit_correo_user").val(correo);    
});

// actualizar cambios de correo usuario o contraseña
$(document).on("click", "#guardar_usuario_editado", function (e) {
    const id_usr = $("#edit_id_user").text();       
    const nuevo_correo = $("#edit_correo_user").val();    
    const nuevo_contra = $("#edit_contra_user").val(); 
    
    // Obtenemos los elementos nativos del DOM
    const inputCorreo = $("#edit_correo_user")[0];
    const inputContra = $("#edit_contra_user")[0];
    
    if (!inputCorreo.checkValidity() || !inputContra.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();

        inputCorreo.classList.add('is-invalid');
        inputContra.classList.add('is-invalid');

        ToastBootstrap.warning('Todos los campos son obligatorios');
        return;
    }

    // Si pasa la validación, quitamos las clases de error y seguimos
    inputCorreo.classList.remove('is-invalid');
    inputContra.classList.remove('is-invalid');

    const formData = new FormData();
    formData.append('id_usr', id_usr);
    formData.append('nuevo_correo', nuevo_correo);
    formData.append('nuevo_contra', nuevo_contra);

    fetch('/admin/query_sql/editar_usuario.php',{
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.respuesta === false) {
            ToastBootstrap.error(data.mensaje);

        } else if (data.respuesta === true) {
            ToastBootstrap.success(data.mensaje);
            consulta_usuarios(); 
            $("#modal_editar_usuario").modal('hide');
            $("#edit_correo_user").val("");    
            $("#edit_contra_user").val(""); 
        }
    })
});

// eliminar usuario 
$(document).on("click", ".btn-eliminar-user", function () {
    const row = $(this).closest('tr');
    const id_usr = row.find('td').eq(0).text(); //busqueda por id, primera columna de la data

    const formData = new FormData();
    formData.append('id_usr', id_usr);

    fetch('/admin/query_sql/eliminar_usuario.php',{
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.respuesta === false) {
            ToastBootstrap.error(data.mensaje);

        } else if (data.respuesta === true) {
            ToastBootstrap.success(data.mensaje);
            consulta_usuarios(); 
        }
    })
});