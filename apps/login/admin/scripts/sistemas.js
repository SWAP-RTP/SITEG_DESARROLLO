// importamos alerta de notificacion
import { ToastBootstrap } from "/includes/js/toast.js";

export function consulta_sistemas() {
    $.ajax({
        url: "/admin/query_sql/getSistemas.php",
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
    if ($.fn.DataTable.isDataTable('#tabla_sistemas')) {
        $('#tabla_sistemas').DataTable().destroy();
    }

    $('#tabla_sistemas').DataTable({
        data: data,
        responsive: true,
        scrollX: true,
        autoWidth: false,

        columns: [
            { data: "id", title: "Id", class: "text-center", width: "5%" },
            { data: "acronimo", title: "Acrónimo", class: "text-center", width: "8%" },
            { data: "nombre_completo", title: "Nombre", class: "text-center", width: "25%" },
            { data: "direccion_ip", title: "IP", class: "text-center", width: "8%" },
            { data: "puerto", title: "Puerto", class: "text-center", width: "5%" },
            {
                data: "tipo_sistema",
                title: "Tipo de sistema",
                class: "text-center",
                width: "8%",
                render: function(data, type, row) {
                    if (data === 'I') {
                        return 'Interno';
                    } else if (data === 'E') {
                        return 'Externo';
                    } else {
                        return '';
                    }
                }
            },
            { data: "usr_alta", title: "Usuario alta", class: "text-center", width: "10%" },
            { data: "fecha_alta", title: "Fecha alta", class: "text-center", width: "15%" },
            {
                data: null,
                title: "Acción",
                class: "text-center",
                orderable: false,
                render: function (data, type, row) {
                    return `
                        <div class="d-flex justify-content-center">
                            <button type="button" class="btn btn-primary me-2 btn-editar" data-bs-toggle="modal" data-bs-target="#modal_editar_sistema">
                                <i class="fa fa-pencil"></i> Editar
                            </button>
                            <button class="btn btn-danger btn-sm btn-eliminar">
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

export function mayusculas(){
    const inputsAMayusculas = ['acronimo', 'nombre_completo_sistema'];

    inputsAMayusculas.forEach(id => {
        const elemento = document.getElementById(id);
        
        if (elemento) {
            elemento.addEventListener('input', function() {
                // Capturamos la posición del cursor para que no salte al final
                const start = this.selectionStart;
                const end = this.selectionEnd;
                
                // Convertimos a mayúsculas
                this.value = this.value.toUpperCase();
                
                // Restauramos la posición del cursor
                this.setSelectionRange(start, end);
            });
        }
    });
}

// DE VISTA PREVIA DE LA IMAGEN EN EL MODAL PARA EL REGISTRO DEL NUEVO SISTEMA
document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'input-imagen') {
        const file = e.target.files[0];
        const preview = document.getElementById('img-preview');
        const placeholder = document.getElementById('placeholder-text');

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.classList.remove('d-none'); // Muestra la imagen
                placeholder.classList.add('d-none'); // Oculta el texto "No se ha seleccionado..."
            };
            reader.readAsDataURL(file);
        }
    }
});

// LIMPIA EL MODAL AL CERRARSE
const miModal = document.getElementById('modal_nueva_sistema');

miModal.addEventListener('hidden.bs.modal', function () {
    // Resetea el formulario (inputs de texto, select, etc.)
    const formulario = miModal.querySelector('form');
    if (formulario) formulario.reset();

    // Resetea el input de archivo (importante)
    document.getElementById('input-imagen').value = "";

    // Resetea la visualización de la imagen
    const preview = document.getElementById('img-preview');
    const placeholder = document.getElementById('placeholder-text');

    preview.src = "";
    preview.classList.add('d-none');       // Esconde la imagen
    placeholder.classList.remove('d-none'); // Muestra el texto informativo
    
    document.querySelector('.ip').hidden = true;
    document.querySelector('.puert').hidden = true;
});

// SELECT PARA EL TIPO DE SISTEMA
$(document).on("change", ".tip_sistem", function () {
    const $contenedor = $(this).closest('.modal-body'); 
    const valor = $(this).val();

    if (valor == "2") {
        $contenedor.find(".ip").removeAttr('hidden');
        $contenedor.find(".puert").removeAttr('hidden');
    } else {
        $contenedor.find(".ip").attr('hidden', true);
        $contenedor.find(".puert").attr('hidden', true);
    }
});

$(document).on("click", "#guardar_nuevo_sistema", function () {
    const form = document.querySelector("#modal_nueva_sistema form");

    // 1. Extraemos el string del session storage para obtener la credencial del usuario que inicio la sesion
    const sessionData = sessionStorage.getItem('datos_usuario');
    // 2. Lo convertimos a objeto (si existe)
    const Obj = sessionData ? JSON.parse(sessionData) : null;
    // 3. Obtenemos el id 
    const credencial_user = Obj.id;

    const imagen = document.getElementById('input-imagen');
    const acronimo = document.getElementById('acronimo');
    const nombre = document.getElementById('nombre_completo_sistema');
    const tip_sistem = document.getElementById('tip_sistem');
    const ip = document.getElementById('direcc_ip');
    const puerto = document.getElementById('puerto');

    // limpiar errores previos
    $(ip).removeClass("is-invalid");
    $(puerto).removeClass("is-invalid");

    let extraValid = true;
    let imagenValid = true;

    if (imagen.files.length === 0) {
        imagenValid = false;
    }

    // Validación extra (solo si es externo)
    if (tip_sistem.value == "2") {
        if (!ip.value.trim()) {
            $(ip).addClass("is-invalid");
            extraValid = false;
        }
        if (!puerto.value.trim()) {
            $(puerto).addClass("is-invalid");
            extraValid = false;
        }
    }

    // Si no pasa validación → detener
    if (!form.checkValidity() || !extraValid || !imagenValid) {
        form.classList.add("was-validated");
        ToastBootstrap.warning('Todos los campos son obligatorios');
        return;
    }

    const formData = new FormData();

    if (imagen.files.length > 0) {
        formData.append('imagen', imagen.files[0]);
    }

    formData.append('acronimo', acronimo.value);
    formData.append('nombre_sistema', nombre.value);
    formData.append('tip_sistem', tip_sistem.value);
    formData.append('ip', ip.value);
    formData.append('puerto', puerto.value);
    formData.append('credencial_user', credencial_user);

    $.ajax({
        url: "/admin/query_sql/insertar_sistema.php",
        type: "POST",
        data: formData, 
        processData: false,
        contentType: false, 
        success: function(data) {
            const res = JSON.parse(data);

            if (res.respuesta === true) {
                ToastBootstrap.success(res.mensaje);
                consulta_sistemas();
                $("#modal_nueva_sistema").modal('hide');
                form.reset();
                form.classList.remove("was-validated");
            }
            if (res.respuesta === false) {
                ToastBootstrap.error(res.mensaje);
            }
        },
        error: function(xhr) {
            console.log("Error:", xhr.responseText);
        }
    });
});

$(document).on("click", ".btn-eliminar", function () {
    const row = $(this).closest('tr');
    const id = row.find('td').eq(0).text(); //busqueda por id, primera columna de la data
    const acronimo = row.find('td').eq(1).text();

    $.ajax({
        url: "/admin/query_sql/eliminar_sistema.php",
        type: "POST",
        data: { id: id, acronimo: acronimo }, 
        success: function(data) {
            const res = JSON.parse(data);

            if (res.respuesta === true) {
                ToastBootstrap.success(res.mensaje);
                consulta_sistemas();
            }
            if (res.respuesta === false) {
                ToastBootstrap.error(res.mensaje);
            }
        },
        error: function(xhr) {
            console.log("Error:", xhr.responseText);
        }
    });
});

$(document).on("click", ".btn-editar", function () {
    const row = $(this).closest('tr');
    const id = row.find('td').eq(0).text(); //busqueda por id, primera columna de la data
    const acronimo = row.find('td').eq(1).text();
    const nombre = row.find('td').eq(2).text();
    const ip = row.find('td').eq(3).text();
    const puerto = row.find('td').eq(4).text();
    const tip_sistema = row.find('td').eq(5).text();

    $('#id_sistem').val(id);
    $('#anter_acronimo2').val(acronimo);
    $('#anter_acronimo').val(acronimo);
    $('#anter_nombre_completo_sistema2').val(nombre);
    $('#anter_nombre_completo_sistema').val(nombre);

    if (tip_sistema.trim() === 'Externo') {
        $('#anter_tip_sistem').val('2');
        $('#anter_tip_sistem2').val('2');

        $('.ip').removeAttr('hidden');
        $('.puert').removeAttr('hidden');

        $('#anter_direcc_ip2').val(ip);
        $('#anter_direcc_ip').val(ip);
        $('#anter_puerto2').val(puerto);
        $('#anter_puerto').val(puerto);

    } else {
        $('#anter_tip_sistem').val('1');
        $('#anter_tip_sistem2').val('1');

        $('.ip').attr('hidden', true);
        $('.puert').attr('hidden', true);

        $('#anter_direcc_ip2').val('');
        $('#anter_direcc_ip').val('');
        $('#anter_puerto2').val('');
        $('#anter_puerto').val('');
    }
});

$(document).on("click", "#guardar_sistema_editado", function () {
    const id_sistem = document.getElementById('id_sistem');
    const tip_sistem2 = document.getElementById('anter_tip_sistem2');
    const tip_sistem = document.getElementById('anter_tip_sistem');

    const ip2 = document.getElementById('anter_direcc_ip2');
    const ip = document.getElementById('anter_direcc_ip');
    const puerto2 = document.getElementById('anter_puerto2');
    const puerto = document.getElementById('anter_puerto');

    const acronimo2 = document.getElementById('anter_acronimo2');
    const acronimo = document.getElementById('anter_acronimo');
    const nombre2 = document.getElementById('anter_nombre_completo_sistema2');
    const nombre = document.getElementById('anter_nombre_completo_sistema');

    const formData = new FormData();
    
    formData.append('id_sistem', id_sistem.value);
    formData.append('tip_sistem2', tip_sistem2.value);
    formData.append('tip_sistem', tip_sistem.value);
    formData.append('ip2', ip2.value);
    formData.append('ip', ip.value);
    formData.append('puerto2', puerto2.value);
    formData.append('puerto', puerto.value);

    formData.append('acronimo2', acronimo2.value);
    formData.append('acronimo', acronimo.value);
    formData.append('nombre2', nombre2.value);
    formData.append('nombre', nombre.value);

    $.ajax({
        url: "/admin/query_sql/editar_sistema.php",
        type: "POST",
        data: formData, 
        processData: false,
        contentType: false, 
        success: function(data) {
            const res = JSON.parse(data);

            if(res.indicador ==  1){
                ToastBootstrap.info(res.mensaje);
            }
            if(res.indicador ==  2){
                ToastBootstrap.error(res.mensaje);
            }
            if(res.respuesta == true){
                ToastBootstrap.success(res.mensaje);
                consulta_sistemas();
                $("#modal_editar_sistema").modal('hide');
            }

        },
        error: function(xhr) {
            console.log("Error:", xhr.responseText);
        }
    });
});