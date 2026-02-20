<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 390319036638cb11f96d0426c37d77bbec365fef
$(document).ready(function() {
    // console.log('dasdasd')
    permiso_usuario();

    $('#datos-trabajdor').hide();
    $('#detalle-nivel-academico').hide();
    $('#detalle-cursos-curriculares').hide();
    $('#detalle-datos-familiares').hide();
    $('#detalle-tallas').hide();

    // Obtiene todos los elementos de entrada dentro del formulario
    const inputs = document.querySelectorAll("#formulario input, #formulario textarea, #formulario select");
    
    // Establece readOnly en cada uno de los elementos
    inputs.forEach(input => {
        input.disabled = true;
    });
});


// Ejecuta los selects para despues ejecutar los detalles del trabajador
async function init() {
    const credencial = new URLSearchParams(location.search).get('credencial');

    await Promise.all([
        DibujaSelect('query_sql/division_proceso.php', 'div_proc', 'tipo_trabajdor_cve', 'tipo_trabajdor'),
        DibujaSelect('query_sql/adscripcion.php', 'adscripcion', 'adscripcion_cve', 'adscripcion_detalle'),
        DibujaSelect('query_sql/puesto.php', 'puesto', 'puesto_clave', 'detalle_puesto'),
        DibujaSelect('query_sql/tipo_contrato.php', 'tipo_contrato', 'tipo_contrato_cve', 'tipo_contrato'),
        DibujaSelect('query_sql/estado_civil.php', 'estado_civil', 'estado_civil_cve', 'estado_civil'),
        DibujaSelect('query_sql/entidad_federativa.php', 'ent_fed_nacimiento', 'estado_cve', 'estado'),
        DibujaSelect('query_sql/nacionalidad.php', 'nacionalidad', 'nacionalidad_cve', 'nacionalidad'),
        DibujaSelect('query_sql/nivel_academico.php', 'nivel_academico', 'clave_escolaridad', 'escolaridad'),
        DibujaSelect('query_sql/estado_nivel_academico.php', 'estado_academico', 'clave_estado_escolaridad', 'estado_escolaridad'),
    ]);

    await detalle_trabajador(credencial);
    await cargarTallaTrabajador(credencial);
    await cargarCursosCurriculares(credencial);
    await cargarFamiliares(credencial);
}


// Consulta el permiso del usuario
async function permiso_usuario() {
    fetch('query_sql/permiso_usuario.php',{
        method: 'POST',
        body: ''
    })
    .then(response => response.json())
    .then(data => {
        $('#contenedor-principal').show();
        init();

        // console.log(data)
        let permisosConcatenados = '';

        data.permisos.forEach(element =>{
            // console.log(element.tipo_permiso)
            permisosConcatenados += element.tipo_permiso + ' ';

            // Permisos de actualizacion (3)
            if (element.tipo_permiso == 3) {
                $('#contenedor_botones').show();
            }   
            
            // Permisos de cambios (4)
            if (element.tipo_permiso == 4) {
                $('#detalle-datos-institucion').show();            
                $('#detalle-datos-trabajador').show();            
                $('#contenedor-datos-familiares').show();           
                $('#contenedor-tallas').show();
                $('#contenedor-boton-guardar').show();
                $('#contenedor-editar-foto').show();
                $('#contenedor-reasignar-credencial').show();

                // Obtiene todos los elementos de entrada dentro del formulario
                const inputs = document.querySelectorAll("#formulario input, #formulario textarea, #formulario select");
                
                // Establece readOnly en cada uno de los elementos
                inputs.forEach(input => {
                    input.disabled = false;
                });
                document.getElementById('credencial').disabled = true;
            }   
        });
        // console.log(permisosConcatenados.trim())
        $('#permiso_usr').val(permisosConcatenados.trim());

    })
}

// Pinta los detalles del trabajador
async function detalle_trabajador(credencial) {
    const formData = new FormData();
    formData.append('credencial', credencial);

    try {
        const response = await fetch('query_sql/trabajador_detalle.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        console.log(data);
        
        // Asignar los valores a los inputs
        $('#foto').attr('src', data.foto);
        $('#credencial').val(credencial);
        $('#adscripcion').val(data.adscripcion_cve);
        $('#puesto').val(data.puesto_cve);
        $('#div_proc').val(data.tipo_trabajador_cve);
        $('#tipo_contrato').val(data.tipo_contrato);
        $('#estatus').val(data.estatus);
        $('#fecha_ingreso').val(data.fecha_ingreso);
        $('#fecha_contrato').val(data.fecha_contrato);
        $('#no_afiliacion').val(data.no_afiliacion);
        $('#nombre').val(data.nombre);
        $('#ap_paterno').val(data.apellido_paterno);
        $('#ap_materno').val(data.apellido_materno);
        $('#fecha_nacimiento').val(data.fecha_nacimiento);
        $('#sexo').val(data.sexo);
        $('#estado_civil').val(data.estado_civil);
        $('#curp').val(data.CURP);
        $('#rfc').val(data.RFC);
        $('#ent_fed_nacimiento').val(data.estado_nacimiento);
        $('#nacionalidad').val(data.naciolidad_cve);
        $('#codigo_postal').val(data.codigo_postal);
        $('#calle_numero').val(data.calle);
        $('#delegacion_municipio').val(data.poblacion);
        $('#estado').val(data.edo);
        $('#telefono').val(data.telefono);
        $('#tel_movil').val(data.telefono_movil);
        $('#email').val(data.email);
        $('#no_nomina').val(data.no_nomina);
        $('#nivel_academico').val(data.escolaridad);
        $('#estado_academico').val(data.estado_escolaridad);
        await DibujaSelect('query_sql/colonia.php', 'colonia', 'colonia_cve', 'colonia', function() {
            $('#colonia').val(data.colonia_cve); // Asigna el valor de colonia después de pintar el select
        });
        
    } catch (error) {
        console.error('Error al obtener el detalle del trabajador:', error);
    }
}

// Función genérica para llenar selectores con callback opcional
async function DibujaSelect(url, id, valueKey, textKey, callback) {
    try {
        const formData = new FormData();
        formData.append('codigo_postal', $('#codigo_postal').val());

        const response = await fetch(url, { method: 'POST', body: formData });
        const data = await response.json();

        const select = document.getElementById(id);
        // select.innerHTML = '';

        data.forEach(element => {
            const option = document.createElement('option');
            option.value = element[valueKey];
            option.textContent = element[textKey];
            select.appendChild(option);
        });

        if (typeof callback === 'function') callback();
    } catch (error) {
        console.error('Error al cargar el selector:', error);
    }
}

// Función genérica para inicializar DataTable
async function cargarTabla(url, formData, tablaId, columnas, botonesExtras = []) {
    try {
        const response = await fetch(url, { method: 'POST', body: formData });
        const data = await response.json();

        // Crear un array para los botones
        const buttons = [
            {
                extend: 'excelHtml5',
                text: '<i class="fas fa-file-excel"></i>',
                titleAttr: 'Exportar a xlsx',
                className: 'btn btn-success me-1',
                title: 'Exportar a Excel'
            },
            {
                extend: 'copyHtml5',
                text: '<i class="far fa-copy"></i>',
                titleAttr: 'Copiar datos',
                className: 'btn btn-info me-1'
            }
        ];

        // Si el usr tiene permiso de editor
        if ($('#permiso_usr').val().split(' ').includes('4')) {
            buttons.unshift(...botonesExtras);  // Unshift agrega los botones extras al inicio
        }

        $(tablaId).DataTable({
            data,
            columns: columnas,
            dom: '<"d-flex justify-content-between mb-3 mt-3 gap-1"lfB>rt<"d-flex justify-content-between mt-3"ip>',
            buttons: buttons, // Asignar el array de botones
            ordering: false,
            bDestroy: true,
            language: {
                sProcessing: "Procesando...",
                sLengthMenu: "Mostrar _MENU_ registros",
                sZeroRecords: "No se encontraron resultados",
                sEmptyTable: "Ningún dato disponible en esta tabla",
                sInfo: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
                sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
                sSearch: "Buscar:",
                oPaginate: {
                    sFirst: "Primero",
                    sLast: "Último",
                    sNext: "Siguiente",
                    sPrevious: "Anterior"
                }
            }
        });
    } catch (error) {
        console.error("Error al cargar la tabla:", error);
    }
}


// Funciones específicas para cada tabla
function cargarTallaTrabajador(credencial) {
    const formData = new FormData();
    formData.append("credencial", credencial);

    const columnas = [
        { "data": "num", className: "text-center", "title": "#" },
        { "data": "tipo_nombre", className: "text-center", "title": "Prenda" },
        { "data": "no_talla", className: "text-center", "title": "Talla" },
        // Si tiene permiso de editor el usuario
        $('#permiso_usr').val().split(' ').includes('4') ? 
            {"data": 'clave_tipo_talla', className: "text-center", "title": "Accion",
            "render": (data, type, row) => `
                <button type=button class='btn btn-warning BtnModificarTalla' data-id="${row.clave_tipo_talla}">
                    <i class="fas fa-pencil-ruler"></i> Modificar Talla
                </button>`
        } 
        : null
    ].filter(Boolean);
    
    cargarTabla("query_sql/talla_trabajador.php", formData, '#tabla-tallas', columnas);
}

function cargarFamiliares(credencial) {
    const formData = new FormData();
    formData.append("credencial", credencial);

    const columnas = [
        { "data": "nombre_familiar", className: "text-center", "title": "Nombre Familiar" },
        { "data": "fecha_nacimiento_familiar", className: "text-center", "title": "Fecha de Nacimiento" },
        { "data": "edad_familiar", className: "text-center", "title": "Edad" },
        { "data": "sexo_familiar", className: "text-center", "title": "Sexo" },
        { "data": "telefono_familiar", className: "text-center", "title": "Telefono" },
        { "data": "parentesco_familiar", className: "text-center", "title": "Parentesco" },
        { "data": "porcentaje_familiar", className: "text-center", "title": "Porcentaje" },
        { "data": "finado_familiar", className: "text-center", "title": "Finado" },
        // Si tiene permiso de editor el usuario
        $('#permiso_usr').val().split(' ').includes('4') ? 
            { "data": "clave_familiar", className: "text-center", "title": "Accion",
                "render": (data, type, row) => `
                    <div class='d-flex gap-2 justify-content-center'>
                        <button type=button class='btn d-flex gap-2 align-items-center btn-warning BtnEditarFamiliar' data-id="${row.clave_familiar}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button type=button class='btn d-flex gap-2 align-items-center btn-danger BtnEliminarFamiliar' data-id="${row.clave_familiar}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>`
            } 
        : null
    ].filter(Boolean);

    const botonesExtras = [
        {
            text: '<i class="fas fa-users"></i> Agregar Nuevo Familiar ',
            titleAttr: 'Agregar Nuevo Familiar',
            className: 'btn btn-primary me-1',
            action: function () {
                // Muestra el modal para agregar un nuevo familiar
                $('#ModalFamiliar').modal('show');
                $('#BtnEditarFamiliar').hide();
                $('#BtnGuardaFamiliar').show();
                document.getElementById('formulario-familiar').reset();
                document.getElementById("title-familiar").innerHTML = "Nuevo Familiar";
                DibujaSelect('query_sql/parentesco.php', 'parentesco_familiar', 'clave_parentesco', 'parentesco');
            }
        }
    ];
    cargarTabla("query_sql/familiares.php", formData, '#tabla-familiares', columnas, botonesExtras);
}


// Valida que el porcentaje del nuevo familiar no rebase al 100%
document.getElementById("porcentaje_familiar").addEventListener("change", function() {
    const tabla = $('#tabla-familiares').DataTable();
    const data = tabla.rows().data(); 
    const porcentajes = [];

    data.each(function(row) {
        const { porcentaje_familiar } = row; // Desestructuración
        const porcentajeNum = Number(porcentaje_familiar); // Convertir a número
        if (isFinite(porcentajeNum)) { // Verificar si es un número finito
            porcentajes.push(porcentajeNum);
        }
    });

    // Sumar los porcentajes
    const totalPorcentaje = porcentajes.reduce((acc, curr) => acc + curr, 0) + Number(this.value);
    if (totalPorcentaje > 100) {
        swal.fire('Precaucion!', 'Al parecer se excedio el porcentaje del 100%. Verifica tus porcentajes!', 'warning');
        this.value = '';
    }
    
    console.log('cantidades: ' + porcentajes.join(', ') + ', Total: ' + totalPorcentaje);
});


// Tabla de los cursos curriculares
function cargarCursosCurriculares(credencial) {
    const formData = new FormData();
    formData.append("credencial", credencial);

    const columnas = [
        { "data": "curso_fecha", className: "text-center", "title": "Fecha " },
        { "data": "curso_nombre", className: "text-center", "title": "Nombre Curso" },
        { "data": "curso_institucion", className: "text-center", "title": "Institucion" },
        
        // Si tiene permiso de editor el usuario
        $('#permiso_usr').val().split(' ').includes('4') ? 
            { "data": "clave_curso", className: "text-center", "title": "Accion",
                "render": (data, type, row) => `
                    <button type=button class='btn btn-warning BtnEditarCurso' data-id="${row.clave_curso}"><i class="fas fa-edit"></i> Editar </button>`
            } 
        : null
    ].filter(Boolean);
    
    const botonesExtras = [
        {
            text: '<i class="fas fa-graduation-cap"></i> Agregar Nuevo Curso ',
            titleAttr: 'Agregar Nuevo Curso',
            className: 'btn btn-primary me-1',
            action: function () {
                $('#ModalCursos').modal('show');
                document.getElementById('title').innerHTML = 'Nuevo Curso Curricular';
                document.getElementById("formulario-cursos").reset();
            }
        }
    ];

    cargarTabla("query_sql/cursos_curriculares.php", formData, '#tabla-cursos', columnas, botonesExtras);
}

// Abre el modal de tallas
$('#tabla-tallas tbody').on('click', '.BtnModificarTalla', function() {
    $('#ModalTallas').modal('show');
    fila = $(this).closest("tr");
    prenda = fila.find('td:eq(1)').text();
    talla = fila.find('td:eq(2)').text();
    $('#prenda').val(prenda)
    $('#talla').val(talla)
    $('#id_talla').val($(this).attr('data-id'))
});

// Modifica la talla del trabajador
document.getElementById("BtnEditarTalla").addEventListener("click",function(){
    Swal.fire({
        title: "Se realizaran cambios",
        text: "Estas seguro de modificar la talla del trabajador?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, quiero hacerlo!"
      }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("formulario-tallas");
            const formData = new FormData(formulario);
            formData.append('credencial', $('#credencial').val())
            fetch('query_sql/EditarTalla.php',{
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    swal.fire('Exito', 'Se actualizo correctamente la talla del trabajador', 'success')
                }
                if (data.error) {
                    swal.fire('Error', data.mensaje, 'error')   
                }
                $('#ModalTallas').modal('hide');
                cargarTallaTrabajador($('#credencial').val())
            })
        }
    });
});

// muestra el modal con la info del curso a editar
$('#tabla-cursos tbody').on('click', '.BtnEditarCurso', function() {
    document.getElementById('title').innerHTML = 'Editar Curso Curricular';
    $('#ModalCursos').modal('show');
    $('#BtnGuardarCursos').hide();
    $('#BtnEditarCursos').show();
    const id = $(this).attr('data-id');
    fila = $(this).closest("tr");
    fecha = fila.find('td:eq(0)').text();
    let partesFecha = fecha.split('/'); // Divide la fecha en partes: ["05", "01", "2004"]
    let fechaInvertida = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
    curso = fila.find('td:eq(1)').text();
    institucion = fila.find('td:eq(2)').text();
    $('#fecha_curso').val(fechaInvertida);
    $('#nombre_curso').val(curso);
    $('#institucion_curso').val(institucion);''
    $('#clave_curso').val(id);
});

// Actualiza el curso
document.getElementById('BtnEditarCursos').addEventListener('click', function(){
    const formulario = document.getElementById('formulario-cursos');
    const formData = new FormData(formulario);
    fetch('query_sql/EditarCurso.php',{
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            swal.fire('Exito!', 'Se actualizo correctamente el curso', 'success');
        }
        if (data.error) {
            swal.fire('Error', data.mensaje, 'error');
        }
        $('#ModalCursos').modal('hide');
        cargarCursosCurriculares($('#credencial').val());
    })
});

// Elimina el familiar
$('#tabla-familiares tbody').on('click', '.BtnEliminarFamiliar', function() {
    Swal.fire({
        title: "Estas seguro?",
        text: "Esto eliminara de forma permanente al familiar del trabajador",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, quiero hacerlo!"
      }).then((result) => {
        if (result.isConfirmed) {
            const id = $(this).attr('data-id'); 
            const formData = new FormData();
            formData.append('id', id);

            fetch('query_sql/EliminarFamiliar.php',{
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    swal.fire('Exito', 'Se borro correctamente el familiar', 'success');
                }
                if (data.error) {
                    swal.fire('Error', data.mensaje, 'error');
                }
                cargarFamiliares($('#credencial').val())
            });
        }
    });
});


// Edita los datos del familiar
$('#tabla-familiares tbody').on('click', '.BtnEditarFamiliar', function() {
    $('#id_familiar').val($(this).attr('data-id'));
    $('#BtnEditarFamiliar').show();
    $('#BtnGuardaFamiliar').hide();
    document.getElementById("title-familiar").innerHTML = "Editar Familiar";
    DibujaSelect('query_sql/parentesco.php', 'parentesco_familiar', 'clave_parentesco', 'parentesco');
    $('#ModalFamiliar').modal('show');
    const id = $(this).attr('data-id');
    const formData = new FormData();
    formData.append('id', id);
    fetch('query_sql/familiares.php',{
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        $('#ap_paterno_familiar').val(data[0].ap_paterno_familiar);
        $('#ap_materno_familiar').val(data[0].ap_materno_familiar);
        $('#nombre_familiar').val(data[0].nombre);
        $('#fecha_nacimiento_familiar').val(data[0].fecha_nacimiento_familiar_invertido);
        $('#sexo_familiar').val(data[0].sexo_familiar_cve);
        $('#telefono_familiar').val(data[0].telefono_familiar);
        $('#parentesco_familiar').val(data[0].parentesco_cve);
        $('#finado_familiar').val(data[0].finado);
        $('#finado_familiar').prop('checked', data[0].finado === 't');
        $('#porcentaje_familiar').val(data[0].porcentaje_familiar);
    });
});

// Edita los datos del familiar
document.getElementById("BtnEditarFamiliar").addEventListener("click", function(){
    Swal.fire({
        title: "Se realizaran cambios!",
        text: "Estas seguro de modificar los datos del familiar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, quiero hacerlo!"
      }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("formulario-familiar");
            const formData = new FormData(formulario);
        
            fetch("query_sql/EditarFamiliar.php",{
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data =>{
                if (data.success) {
                    swal.fire('Exito', 'Se actualizaron correctamente los datos del familiar', 'success');
                }
                if (data.error) {
                    swal.fire('Precaucion!', data.mensaje, 'error');
                }
                cargarFamiliares($('#credencial').val());
                $('#ModalFamiliar').modal('hide');
            })
        }
    });
})



// Guarda Nuevo familiar
document.getElementById("BtnGuardaFamiliar").addEventListener("click", function(){
    if ($('#ap_paterno_familiar').val() == '') {
        swal.fire('Precaucion!', 'Por favor, Ingresa el apellido paterno del familiar','warning')
    } else if ($('#ap_materno_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Ingresa el apellido materno del familiar','warning');
    } else if ($('#nombre_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Ingresa el nombre del familiar','warning');
    } else if ($('#fecha_nacimiento_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Ingresa la fecha de nacimiento del familiar','warning');
    } else if ($('#sexo').val() == '') {
        swal.fire('Precaucion!','Por favor, Elige el sexo del familiar','warning');
    } else if ($('#telefono_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Ingresa el telefono del familiar','warning');
    } else if ($('#parentesco_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Elige el parentesco del familiar','warning');
    } else if ($('#porcentaje_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Ingresa el porcentaje del familiar','warning');
    } else {
        const formulario = document.getElementById('formulario-familiar');
        const formData = new FormData(formulario);
        formData.append('credencial', $('#credencial').val());

        fetch('query_sql/GuardarFamiliar.php',{
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.success) {
                swal.fire('Exito', 'Se registro correctamente el nuevo familiar', 'success');
            }
            if (data.error) {
                swal.fire('Error', data.mensaje, 'error');
            }
            $('#ModalFamiliar').modal('hide');
            cargarFamiliares($('#credencial').val())
        })
    }
})

document.getElementById("editar_img").addEventListener("click", function() {
    $('#foto_nueva').val(''); // Limpiar la selección anterior.
    $('#ModalFoto').modal('show'); // Mostrar el modal.
    $('#foto_trabajador').attr('src', `/Recursos_Humanos_New/fotos/${$('#credencial').val()}.jpg`);
});



// Obtener el input para cargar la nueva foto y manejar el evento de cambio.
document.getElementById('foto_nueva').addEventListener('change', function(event) {
    const archivo = event.target.files[0];

    // Validar si el archivo es una imagen.
    if (!archivo.type.startsWith('image/jpeg') || !archivo.name.toLowerCase().endsWith('.jpg')) {
        swal.fire('Precaucion!', 'El archivo seleccionado no es una imagen JPG. Por favor, seleccione un archivo con la extension .jpg.', 'warning');
        $('#foto_nueva').val('');
        return;
    }
    const lector = new FileReader();

    lector.onload = function() { // Leer el archivo como una URL de datos y mostrar la previsualización.
        document.getElementById('foto_trabajador').src = lector.result;
        $('#foto_new').hide();
        $('#BtnEditarFoto').show();
    };

    lector.readAsDataURL(archivo);
});


// Guarda la foto en el servidor.
document.getElementById("BtnEditarFoto").addEventListener("click", function() {
    const inputArchivo = document.getElementById('foto_nueva');
    if (!inputArchivo.files[0]) {
        Swal.fire('Precaucion', 'No has seleccionado una nueva foto.', 'warning');
        return;
    }
    Swal.fire({
        title: "Estas seguro?",
        text: "Esta accion cambiara la foto del trabajador",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, quiero hacerlo!"
      }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("formulario-foto");
            const formData = new FormData(formulario);
            formData.append('credencial', $('#credencial').val())
            fetch('query_sql/GuardarFoto.php',{
                method:'POST',
                body:formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    swal.fire('Exito', data.mensaje, 'success');
                    window.location.href = 'editar_trabajador.html?credencial=' + $('#credencial').val();
                }
                if (data.error) {
                    swal.fire('Error', data.mensaje, 'error');
                }
            })
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            $('#ModalFoto').modal('hide');
            $('#foto_nueva').val('');
        }
    });
});


// Guarda el nuevo curso del trabajador
document.getElementById('BtnGuardarCursos').addEventListener('click', function(){
    if ($('#fecha_curso').val() == '') {
        swal.fire('Precaucion!', 'Por favor, Digita la fecha del curso.', 'warning');
    } else if ($('#nombre_curso').val() == '') {
        swal.fire('Precaucion!', 'Por favor, Digita el nombre del curso.', 'warning');
    } else if ($('#institucion_curso').val() == '') {
        swal.fire('Precaucion!', 'Por favor, Digita la institucion del curso.', 'warning');
    } else {
        const formulario = document.getElementById('formulario-cursos');
        const formData = new FormData(formulario);
        formData.append('credencial', $('#credencial').val());
    
        fetch('query_sql/GuardarCursos.php',{
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                swal.fire('Exito!', 'Se guardo correctamente el curso', 'success');
            }
            if (data.error) {
                swal.fire('Precaucion!', data.mensaje, 'error');
            }
            cargarCursosCurriculares($('#credencial').val());
            $('#ModalCursos').modal('hide');
        })
    }
});



// Muestra el detalle de los datos del trabajador
document.getElementById("BtnDetalleTrabajador").addEventListener("click", function() {
    $('#datos-trabajdor').toggle();
});

// Muestra el detalle academico
document.getElementById("BtnDetalleAcademico").addEventListener("click", function() {
    $('#detalle-nivel-academico').toggle();
});

// Muestra el detalle de los cursos
document.getElementById("BtnDetalleCursos").addEventListener("click", function() {
    $('#detalle-cursos-curriculares').toggle();
});

// Muestra el detalle de los datos familiares
document.getElementById("BtnDetalleFamiliares").addEventListener("click", function() {
    $('#detalle-datos-familiares').toggle();
});

// Muestra el detalle de los datos familiares
document.getElementById("BtnDetalleTallas").addEventListener("click", function() {
    $('#detalle-tallas').toggle();
});

// Regresa al index
document.getElementById("BtnRegresar").addEventListener("click", function(){
    window.location.href = 'index.html';
});


// Busca al nuevo trabajador
document.getElementById("BtnBuscar").addEventListener("click", function(){
    const credencial_busqueda = $('#credencial_busqueda').val();
    if (credencial_busqueda == '') {
        swal.fire('Error', 'Por favor, Ingresa la nueva credencial!', 'info')
    }else{
        window.location.href = 'editar_trabajador.html?credencial=' + credencial_busqueda;
    }
<<<<<<< HEAD
=======
=======
$(document).ready(function() {
    // console.log('dasdasd')
    permiso_usuario();

    $('#datos-trabajdor').hide();
    $('#detalle-nivel-academico').hide();
    $('#detalle-cursos-curriculares').hide();
    $('#detalle-datos-familiares').hide();
    $('#detalle-tallas').hide();

    // Obtiene todos los elementos de entrada dentro del formulario
    const inputs = document.querySelectorAll("#formulario input, #formulario textarea, #formulario select");
    
    // Establece readOnly en cada uno de los elementos
    inputs.forEach(input => {
        input.disabled = true;
    });
});


// Ejecuta los selects para despues ejecutar los detalles del trabajador
async function init() {
    const credencial = new URLSearchParams(location.search).get('credencial');

    await Promise.all([
        DibujaSelect('query_sql/division_proceso.php', 'div_proc', 'tipo_trabajdor_cve', 'tipo_trabajdor'),
        DibujaSelect('query_sql/adscripcion.php', 'adscripcion', 'adscripcion_cve', 'adscripcion_detalle'),
        DibujaSelect('query_sql/puesto.php', 'puesto', 'puesto_clave', 'detalle_puesto'),
        DibujaSelect('query_sql/tipo_contrato.php', 'tipo_contrato', 'tipo_contrato_cve', 'tipo_contrato'),
        DibujaSelect('query_sql/estado_civil.php', 'estado_civil', 'estado_civil_cve', 'estado_civil'),
        DibujaSelect('query_sql/entidad_federativa.php', 'ent_fed_nacimiento', 'estado_cve', 'estado'),
        DibujaSelect('query_sql/nacionalidad.php', 'nacionalidad', 'nacionalidad_cve', 'nacionalidad'),
        DibujaSelect('query_sql/nivel_academico.php', 'nivel_academico', 'clave_escolaridad', 'escolaridad'),
        DibujaSelect('query_sql/estado_nivel_academico.php', 'estado_academico', 'clave_estado_escolaridad', 'estado_escolaridad'),
    ]);

    await detalle_trabajador(credencial);
    await cargarTallaTrabajador(credencial);
    await cargarCursosCurriculares(credencial);
    await cargarFamiliares(credencial);
}


// Consulta el permiso del usuario
async function permiso_usuario() {
    fetch('query_sql/permiso_usuario.php',{
        method: 'POST',
        body: ''
    })
    .then(response => response.json())
    .then(data => {
        $('#contenedor-principal').show();
        init();

        // console.log(data)
        let permisosConcatenados = '';

        data.permisos.forEach(element =>{
            // console.log(element.tipo_permiso)
            permisosConcatenados += element.tipo_permiso + ' ';

            // Permisos de actualizacion (3)
            if (element.tipo_permiso == 3) {
                $('#contenedor_botones').show();
            }   
            
            // Permisos de cambios (4)
            if (element.tipo_permiso == 4) {
                $('#detalle-datos-institucion').show();            
                $('#detalle-datos-trabajador').show();            
                $('#contenedor-datos-familiares').show();           
                $('#contenedor-tallas').show();
                $('#contenedor-boton-guardar').show();
                $('#contenedor-editar-foto').show();
                $('#contenedor-reasignar-credencial').show();

                // Obtiene todos los elementos de entrada dentro del formulario
                const inputs = document.querySelectorAll("#formulario input, #formulario textarea, #formulario select");
                
                // Establece readOnly en cada uno de los elementos
                inputs.forEach(input => {
                    input.disabled = false;
                });
                document.getElementById('credencial').disabled = true;
            }   
        });
        // console.log(permisosConcatenados.trim())
        $('#permiso_usr').val(permisosConcatenados.trim());

    })
}

// Pinta los detalles del trabajador
async function detalle_trabajador(credencial) {
    const formData = new FormData();
    formData.append('credencial', credencial);

    try {
        const response = await fetch('query_sql/trabajador_detalle.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        console.log(data);
        
        // Asignar los valores a los inputs
        $('#foto').attr('src', data.foto);
        $('#credencial').val(credencial);
        $('#adscripcion').val(data.adscripcion_cve);
        $('#puesto').val(data.puesto_cve);
        $('#div_proc').val(data.tipo_trabajador_cve);
        $('#tipo_contrato').val(data.tipo_contrato);
        $('#estatus').val(data.estatus);
        $('#fecha_ingreso').val(data.fecha_ingreso);
        $('#fecha_contrato').val(data.fecha_contrato);
        $('#no_afiliacion').val(data.no_afiliacion);
        $('#nombre').val(data.nombre);
        $('#ap_paterno').val(data.apellido_paterno);
        $('#ap_materno').val(data.apellido_materno);
        $('#fecha_nacimiento').val(data.fecha_nacimiento);
        $('#sexo').val(data.sexo);
        $('#estado_civil').val(data.estado_civil);
        $('#curp').val(data.CURP);
        $('#rfc').val(data.RFC);
        $('#ent_fed_nacimiento').val(data.estado_nacimiento);
        $('#nacionalidad').val(data.naciolidad_cve);
        $('#codigo_postal').val(data.codigo_postal);
        $('#calle_numero').val(data.calle);
        $('#delegacion_municipio').val(data.poblacion);
        $('#estado').val(data.edo);
        $('#telefono').val(data.telefono);
        $('#tel_movil').val(data.telefono_movil);
        $('#email').val(data.email);
        $('#no_nomina').val(data.no_nomina);
        $('#nivel_academico').val(data.escolaridad);
        $('#estado_academico').val(data.estado_escolaridad);
        await DibujaSelect('query_sql/colonia.php', 'colonia', 'colonia_cve', 'colonia', function() {
            $('#colonia').val(data.colonia_cve); // Asigna el valor de colonia después de pintar el select
        });
        
    } catch (error) {
        console.error('Error al obtener el detalle del trabajador:', error);
    }
}

// Función genérica para llenar selectores con callback opcional
async function DibujaSelect(url, id, valueKey, textKey, callback) {
    try {
        const formData = new FormData();
        formData.append('codigo_postal', $('#codigo_postal').val());

        const response = await fetch(url, { method: 'POST', body: formData });
        const data = await response.json();

        const select = document.getElementById(id);
        // select.innerHTML = '';

        data.forEach(element => {
            const option = document.createElement('option');
            option.value = element[valueKey];
            option.textContent = element[textKey];
            select.appendChild(option);
        });

        if (typeof callback === 'function') callback();
    } catch (error) {
        console.error('Error al cargar el selector:', error);
    }
}

// Función genérica para inicializar DataTable
async function cargarTabla(url, formData, tablaId, columnas, botonesExtras = []) {
    try {
        const response = await fetch(url, { method: 'POST', body: formData });
        const data = await response.json();

        // Crear un array para los botones
        const buttons = [
            {
                extend: 'excelHtml5',
                text: '<i class="fas fa-file-excel"></i>',
                titleAttr: 'Exportar a xlsx',
                className: 'btn btn-success me-1',
                title: 'Exportar a Excel'
            },
            {
                extend: 'copyHtml5',
                text: '<i class="far fa-copy"></i>',
                titleAttr: 'Copiar datos',
                className: 'btn btn-info me-1'
            }
        ];

        // Si el usr tiene permiso de editor
        if ($('#permiso_usr').val().split(' ').includes('4')) {
            buttons.unshift(...botonesExtras);  // Unshift agrega los botones extras al inicio
        }

        $(tablaId).DataTable({
            data,
            columns: columnas,
            dom: '<"d-flex justify-content-between mb-3 mt-3 gap-1"lfB>rt<"d-flex justify-content-between mt-3"ip>',
            buttons: buttons, // Asignar el array de botones
            ordering: false,
            bDestroy: true,
            language: {
                sProcessing: "Procesando...",
                sLengthMenu: "Mostrar _MENU_ registros",
                sZeroRecords: "No se encontraron resultados",
                sEmptyTable: "Ningún dato disponible en esta tabla",
                sInfo: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
                sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
                sSearch: "Buscar:",
                oPaginate: {
                    sFirst: "Primero",
                    sLast: "Último",
                    sNext: "Siguiente",
                    sPrevious: "Anterior"
                }
            }
        });
    } catch (error) {
        console.error("Error al cargar la tabla:", error);
    }
}


// Funciones específicas para cada tabla
function cargarTallaTrabajador(credencial) {
    const formData = new FormData();
    formData.append("credencial", credencial);

    const columnas = [
        { "data": "num", className: "text-center", "title": "#" },
        { "data": "tipo_nombre", className: "text-center", "title": "Prenda" },
        { "data": "no_talla", className: "text-center", "title": "Talla" },
        // Si tiene permiso de editor el usuario
        $('#permiso_usr').val().split(' ').includes('4') ? 
            {"data": 'clave_tipo_talla', className: "text-center", "title": "Accion",
            "render": (data, type, row) => `
                <button type=button class='btn btn-warning BtnModificarTalla' data-id="${row.clave_tipo_talla}">
                    <i class="fas fa-pencil-ruler"></i> Modificar Talla
                </button>`
        } 
        : null
    ].filter(Boolean);
    
    cargarTabla("query_sql/talla_trabajador.php", formData, '#tabla-tallas', columnas);
}

function cargarFamiliares(credencial) {
    const formData = new FormData();
    formData.append("credencial", credencial);

    const columnas = [
        { "data": "nombre_familiar", className: "text-center", "title": "Nombre Familiar" },
        { "data": "fecha_nacimiento_familiar", className: "text-center", "title": "Fecha de Nacimiento" },
        { "data": "edad_familiar", className: "text-center", "title": "Edad" },
        { "data": "sexo_familiar", className: "text-center", "title": "Sexo" },
        { "data": "telefono_familiar", className: "text-center", "title": "Telefono" },
        { "data": "parentesco_familiar", className: "text-center", "title": "Parentesco" },
        { "data": "porcentaje_familiar", className: "text-center", "title": "Porcentaje" },
        { "data": "finado_familiar", className: "text-center", "title": "Finado" },
        // Si tiene permiso de editor el usuario
        $('#permiso_usr').val().split(' ').includes('4') ? 
            { "data": "clave_familiar", className: "text-center", "title": "Accion",
                "render": (data, type, row) => `
                    <div class='d-flex gap-2 justify-content-center'>
                        <button type=button class='btn d-flex gap-2 align-items-center btn-warning BtnEditarFamiliar' data-id="${row.clave_familiar}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button type=button class='btn d-flex gap-2 align-items-center btn-danger BtnEliminarFamiliar' data-id="${row.clave_familiar}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>`
            } 
        : null
    ].filter(Boolean);

    const botonesExtras = [
        {
            text: '<i class="fas fa-users"></i> Agregar Nuevo Familiar ',
            titleAttr: 'Agregar Nuevo Familiar',
            className: 'btn btn-primary me-1',
            action: function () {
                // Muestra el modal para agregar un nuevo familiar
                $('#ModalFamiliar').modal('show');
                $('#BtnEditarFamiliar').hide();
                $('#BtnGuardaFamiliar').show();
                document.getElementById('formulario-familiar').reset();
                document.getElementById("title-familiar").innerHTML = "Nuevo Familiar";
                DibujaSelect('query_sql/parentesco.php', 'parentesco_familiar', 'clave_parentesco', 'parentesco');
            }
        }
    ];
    cargarTabla("query_sql/familiares.php", formData, '#tabla-familiares', columnas, botonesExtras);
}


// Valida que el porcentaje del nuevo familiar no rebase al 100%
document.getElementById("porcentaje_familiar").addEventListener("change", function() {
    const tabla = $('#tabla-familiares').DataTable();
    const data = tabla.rows().data(); 
    const porcentajes = [];

    data.each(function(row) {
        const { porcentaje_familiar } = row; // Desestructuración
        const porcentajeNum = Number(porcentaje_familiar); // Convertir a número
        if (isFinite(porcentajeNum)) { // Verificar si es un número finito
            porcentajes.push(porcentajeNum);
        }
    });

    // Sumar los porcentajes
    const totalPorcentaje = porcentajes.reduce((acc, curr) => acc + curr, 0) + Number(this.value);
    if (totalPorcentaje > 100) {
        swal.fire('Precaucion!', 'Al parecer se excedio el porcentaje del 100%. Verifica tus porcentajes!', 'warning');
        this.value = '';
    }
    
    console.log('cantidades: ' + porcentajes.join(', ') + ', Total: ' + totalPorcentaje);
});


// Tabla de los cursos curriculares
function cargarCursosCurriculares(credencial) {
    const formData = new FormData();
    formData.append("credencial", credencial);

    const columnas = [
        { "data": "curso_fecha", className: "text-center", "title": "Fecha " },
        { "data": "curso_nombre", className: "text-center", "title": "Nombre Curso" },
        { "data": "curso_institucion", className: "text-center", "title": "Institucion" },
        
        // Si tiene permiso de editor el usuario
        $('#permiso_usr').val().split(' ').includes('4') ? 
            { "data": "clave_curso", className: "text-center", "title": "Accion",
                "render": (data, type, row) => `
                    <button type=button class='btn btn-warning BtnEditarCurso' data-id="${row.clave_curso}"><i class="fas fa-edit"></i> Editar </button>`
            } 
        : null
    ].filter(Boolean);
    
    const botonesExtras = [
        {
            text: '<i class="fas fa-graduation-cap"></i> Agregar Nuevo Curso ',
            titleAttr: 'Agregar Nuevo Curso',
            className: 'btn btn-primary me-1',
            action: function () {
                $('#ModalCursos').modal('show');
                document.getElementById('title').innerHTML = 'Nuevo Curso Curricular';
                document.getElementById("formulario-cursos").reset();
            }
        }
    ];

    cargarTabla("query_sql/cursos_curriculares.php", formData, '#tabla-cursos', columnas, botonesExtras);
}

// Abre el modal de tallas
$('#tabla-tallas tbody').on('click', '.BtnModificarTalla', function() {
    $('#ModalTallas').modal('show');
    fila = $(this).closest("tr");
    prenda = fila.find('td:eq(1)').text();
    talla = fila.find('td:eq(2)').text();
    $('#prenda').val(prenda)
    $('#talla').val(talla)
    $('#id_talla').val($(this).attr('data-id'))
});

// Modifica la talla del trabajador
document.getElementById("BtnEditarTalla").addEventListener("click",function(){
    Swal.fire({
        title: "Se realizaran cambios",
        text: "Estas seguro de modificar la talla del trabajador?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, quiero hacerlo!"
      }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("formulario-tallas");
            const formData = new FormData(formulario);
            formData.append('credencial', $('#credencial').val())
            fetch('query_sql/EditarTalla.php',{
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    swal.fire('Exito', 'Se actualizo correctamente la talla del trabajador', 'success')
                }
                if (data.error) {
                    swal.fire('Error', data.mensaje, 'error')   
                }
                $('#ModalTallas').modal('hide');
                cargarTallaTrabajador($('#credencial').val())
            })
        }
    });
});

// muestra el modal con la info del curso a editar
$('#tabla-cursos tbody').on('click', '.BtnEditarCurso', function() {
    document.getElementById('title').innerHTML = 'Editar Curso Curricular';
    $('#ModalCursos').modal('show');
    $('#BtnGuardarCursos').hide();
    $('#BtnEditarCursos').show();
    const id = $(this).attr('data-id');
    fila = $(this).closest("tr");
    fecha = fila.find('td:eq(0)').text();
    let partesFecha = fecha.split('/'); // Divide la fecha en partes: ["05", "01", "2004"]
    let fechaInvertida = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
    curso = fila.find('td:eq(1)').text();
    institucion = fila.find('td:eq(2)').text();
    $('#fecha_curso').val(fechaInvertida);
    $('#nombre_curso').val(curso);
    $('#institucion_curso').val(institucion);''
    $('#clave_curso').val(id);
});

// Actualiza el curso
document.getElementById('BtnEditarCursos').addEventListener('click', function(){
    const formulario = document.getElementById('formulario-cursos');
    const formData = new FormData(formulario);
    fetch('query_sql/EditarCurso.php',{
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            swal.fire('Exito!', 'Se actualizo correctamente el curso', 'success');
        }
        if (data.error) {
            swal.fire('Error', data.mensaje, 'error');
        }
        $('#ModalCursos').modal('hide');
        cargarCursosCurriculares($('#credencial').val());
    })
});

// Elimina el familiar
$('#tabla-familiares tbody').on('click', '.BtnEliminarFamiliar', function() {
    Swal.fire({
        title: "Estas seguro?",
        text: "Esto eliminara de forma permanente al familiar del trabajador",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, quiero hacerlo!"
      }).then((result) => {
        if (result.isConfirmed) {
            const id = $(this).attr('data-id'); 
            const formData = new FormData();
            formData.append('id', id);

            fetch('query_sql/EliminarFamiliar.php',{
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    swal.fire('Exito', 'Se borro correctamente el familiar', 'success');
                }
                if (data.error) {
                    swal.fire('Error', data.mensaje, 'error');
                }
                cargarFamiliares($('#credencial').val())
            });
        }
    });
});


// Edita los datos del familiar
$('#tabla-familiares tbody').on('click', '.BtnEditarFamiliar', function() {
    $('#id_familiar').val($(this).attr('data-id'));
    $('#BtnEditarFamiliar').show();
    $('#BtnGuardaFamiliar').hide();
    document.getElementById("title-familiar").innerHTML = "Editar Familiar";
    DibujaSelect('query_sql/parentesco.php', 'parentesco_familiar', 'clave_parentesco', 'parentesco');
    $('#ModalFamiliar').modal('show');
    const id = $(this).attr('data-id');
    const formData = new FormData();
    formData.append('id', id);
    fetch('query_sql/familiares.php',{
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        $('#ap_paterno_familiar').val(data[0].ap_paterno_familiar);
        $('#ap_materno_familiar').val(data[0].ap_materno_familiar);
        $('#nombre_familiar').val(data[0].nombre);
        $('#fecha_nacimiento_familiar').val(data[0].fecha_nacimiento_familiar_invertido);
        $('#sexo_familiar').val(data[0].sexo_familiar_cve);
        $('#telefono_familiar').val(data[0].telefono_familiar);
        $('#parentesco_familiar').val(data[0].parentesco_cve);
        $('#finado_familiar').val(data[0].finado);
        $('#finado_familiar').prop('checked', data[0].finado === 't');
        $('#porcentaje_familiar').val(data[0].porcentaje_familiar);
    });
});

// Edita los datos del familiar
document.getElementById("BtnEditarFamiliar").addEventListener("click", function(){
    Swal.fire({
        title: "Se realizaran cambios!",
        text: "Estas seguro de modificar los datos del familiar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, quiero hacerlo!"
      }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("formulario-familiar");
            const formData = new FormData(formulario);
        
            fetch("query_sql/EditarFamiliar.php",{
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data =>{
                if (data.success) {
                    swal.fire('Exito', 'Se actualizaron correctamente los datos del familiar', 'success');
                }
                if (data.error) {
                    swal.fire('Precaucion!', data.mensaje, 'error');
                }
                cargarFamiliares($('#credencial').val());
                $('#ModalFamiliar').modal('hide');
            })
        }
    });
})



// Guarda Nuevo familiar
document.getElementById("BtnGuardaFamiliar").addEventListener("click", function(){
    if ($('#ap_paterno_familiar').val() == '') {
        swal.fire('Precaucion!', 'Por favor, Ingresa el apellido paterno del familiar','warning')
    } else if ($('#ap_materno_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Ingresa el apellido materno del familiar','warning');
    } else if ($('#nombre_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Ingresa el nombre del familiar','warning');
    } else if ($('#fecha_nacimiento_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Ingresa la fecha de nacimiento del familiar','warning');
    } else if ($('#sexo').val() == '') {
        swal.fire('Precaucion!','Por favor, Elige el sexo del familiar','warning');
    } else if ($('#telefono_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Ingresa el telefono del familiar','warning');
    } else if ($('#parentesco_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Elige el parentesco del familiar','warning');
    } else if ($('#porcentaje_familiar').val() == '') {
        swal.fire('Precaucion!','Por favor, Ingresa el porcentaje del familiar','warning');
    } else {
        const formulario = document.getElementById('formulario-familiar');
        const formData = new FormData(formulario);
        formData.append('credencial', $('#credencial').val());

        fetch('query_sql/GuardarFamiliar.php',{
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.success) {
                swal.fire('Exito', 'Se registro correctamente el nuevo familiar', 'success');
            }
            if (data.error) {
                swal.fire('Error', data.mensaje, 'error');
            }
            $('#ModalFamiliar').modal('hide');
            cargarFamiliares($('#credencial').val())
        })
    }
})

document.getElementById("editar_img").addEventListener("click", function() {
    $('#foto_nueva').val(''); // Limpiar la selección anterior.
    $('#ModalFoto').modal('show'); // Mostrar el modal.
    $('#foto_trabajador').attr('src', `/Recursos_Humanos_New/fotos/${$('#credencial').val()}.jpg`);
});



// Obtener el input para cargar la nueva foto y manejar el evento de cambio.
document.getElementById('foto_nueva').addEventListener('change', function(event) {
    const archivo = event.target.files[0];

    // Validar si el archivo es una imagen.
    if (!archivo.type.startsWith('image/jpeg') || !archivo.name.toLowerCase().endsWith('.jpg')) {
        swal.fire('Precaucion!', 'El archivo seleccionado no es una imagen JPG. Por favor, seleccione un archivo con la extension .jpg.', 'warning');
        $('#foto_nueva').val('');
        return;
    }
    const lector = new FileReader();

    lector.onload = function() { // Leer el archivo como una URL de datos y mostrar la previsualización.
        document.getElementById('foto_trabajador').src = lector.result;
        $('#foto_new').hide();
        $('#BtnEditarFoto').show();
    };

    lector.readAsDataURL(archivo);
});


// Guarda la foto en el servidor.
document.getElementById("BtnEditarFoto").addEventListener("click", function() {
    const inputArchivo = document.getElementById('foto_nueva');
    if (!inputArchivo.files[0]) {
        Swal.fire('Precaucion', 'No has seleccionado una nueva foto.', 'warning');
        return;
    }
    Swal.fire({
        title: "Estas seguro?",
        text: "Esta accion cambiara la foto del trabajador",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, quiero hacerlo!"
      }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("formulario-foto");
            const formData = new FormData(formulario);
            formData.append('credencial', $('#credencial').val())
            fetch('query_sql/GuardarFoto.php',{
                method:'POST',
                body:formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    swal.fire('Exito', data.mensaje, 'success');
                    window.location.href = 'editar_trabajador.html?credencial=' + $('#credencial').val();
                }
                if (data.error) {
                    swal.fire('Error', data.mensaje, 'error');
                }
            })
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            $('#ModalFoto').modal('hide');
            $('#foto_nueva').val('');
        }
    });
});


// Guarda el nuevo curso del trabajador
document.getElementById('BtnGuardarCursos').addEventListener('click', function(){
    if ($('#fecha_curso').val() == '') {
        swal.fire('Precaucion!', 'Por favor, Digita la fecha del curso.', 'warning');
    } else if ($('#nombre_curso').val() == '') {
        swal.fire('Precaucion!', 'Por favor, Digita el nombre del curso.', 'warning');
    } else if ($('#institucion_curso').val() == '') {
        swal.fire('Precaucion!', 'Por favor, Digita la institucion del curso.', 'warning');
    } else {
        const formulario = document.getElementById('formulario-cursos');
        const formData = new FormData(formulario);
        formData.append('credencial', $('#credencial').val());
    
        fetch('query_sql/GuardarCursos.php',{
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                swal.fire('Exito!', 'Se guardo correctamente el curso', 'success');
            }
            if (data.error) {
                swal.fire('Precaucion!', data.mensaje, 'error');
            }
            cargarCursosCurriculares($('#credencial').val());
            $('#ModalCursos').modal('hide');
        })
    }
});



// Muestra el detalle de los datos del trabajador
document.getElementById("BtnDetalleTrabajador").addEventListener("click", function() {
    $('#datos-trabajdor').toggle();
});

// Muestra el detalle academico
document.getElementById("BtnDetalleAcademico").addEventListener("click", function() {
    $('#detalle-nivel-academico').toggle();
});

// Muestra el detalle de los cursos
document.getElementById("BtnDetalleCursos").addEventListener("click", function() {
    $('#detalle-cursos-curriculares').toggle();
});

// Muestra el detalle de los datos familiares
document.getElementById("BtnDetalleFamiliares").addEventListener("click", function() {
    $('#detalle-datos-familiares').toggle();
});

// Muestra el detalle de los datos familiares
document.getElementById("BtnDetalleTallas").addEventListener("click", function() {
    $('#detalle-tallas').toggle();
});

// Regresa al index
document.getElementById("BtnRegresar").addEventListener("click", function(){
    window.location.href = 'index.html';
});


// Busca al nuevo trabajador
document.getElementById("BtnBuscar").addEventListener("click", function(){
    const credencial_busqueda = $('#credencial_busqueda').val();
    if (credencial_busqueda == '') {
        swal.fire('Error', 'Por favor, Ingresa la nueva credencial!', 'info')
    }else{
        window.location.href = 'editar_trabajador.html?credencial=' + credencial_busqueda;
    }
>>>>>>> e40c811f0792c47020ea16882dd53dc56fd1a088
>>>>>>> 390319036638cb11f96d0426c37d77bbec365fef
});