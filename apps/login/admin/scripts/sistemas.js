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
        columns: [
            { data: "id", title: "Id", class: "text-center" },
            { data: "acronimo", title: "Acrónimo", class: "text-center" },
            { data: "nombre_completo", title: "Nombre", class: "text-center" },
            { data: "usr_alta", title: "Usuario alta", class: "text-center" },
            { data: "fecha_alta", title: "Fecha alta", class: "text-center" },
            {
                data: null,
                title: "Acción",
                class: "text-center",
                orderable: false,
                render: function (data, type, row) {
                    return `
                        <div class="d-flex justify-content-center">
                            <button class="btn btn-primary btn-sm me-2" onclick="editarSistema(${row.id})">
                                <i class="fa fa-pencil"></i> Editar
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarSistema(${row.id})">
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

$(document).on("click", "#guardar_nuevo_sistema", function () {
    const imagen = document.getElementById('input-imagen');
    const acronimo = document.getElementById('acronimo');
    const nombre = document.getElementById('nombre_completo_sistema');

    const formData = new FormData();
    
    // Agregamos el ARCHIVO real (no el elemento HTML)
    if (imagen.files.length > 0) {
        formData.append('imagen', imagen.files[0]);
    }
    
    formData.append('acronimo', acronimo.value);
    formData.append('nombre_sistema', nombre.value);

    const notyf = new Notyf({
        duration: 4000,
        position: { x: 'right', y: 'top' },
    });

    $.ajax({
        url: "/admin/query_sql/insertar_sistema.php",
        type: "POST",
        data: formData, 
        processData: false,
        contentType: false, 
        success: function(data) {
            const res = JSON.parse(data);

            if (res.respuesta === true) {
                notyf.success(res.mensaje);
                consulta_sistemas();
                $("#modal_nueva_sistema").modal('hide');
            }
            if (res.respuesta === false) {
                notyf.error(res.mensaje);
            }
        },
        error: function(xhr) {
            console.log("Error:", xhr.responseText);
        }
    });
});

// Usamos delegación de eventos por si el modal se carga dinámicamente
document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'input-imagen') {
        const file = e.target.files[0];
        const preview = document.getElementById('img-preview');
        const placeholder = document.getElementById('placeholder-text');

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.classList.remove('d-none'); // Quitamos la clase que lo oculta
                placeholder.classList.add('d-none'); // Ocultamos el texto
                console.log("Imagen cargada con éxito");
            };
            reader.readAsDataURL(file);
        }
    }
});