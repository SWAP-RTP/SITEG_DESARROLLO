<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 390319036638cb11f96d0426c37d77bbec365fef
// Función principal que se ejecuta al cargar el documento
$(document).ready(function() {
    permiso_usuario() ;
    // Oculta el formulario y un contenedor sin permiso, y establece un título principal en la página
    $('#contenedor-principal').hide();
    $('#contenedor_sin_permiso').hide();
    // $('#BtnGuardarpuesto').hide();
    // $('#BtnNuevopuesto').hide();  
    // $('#BtnModificar').hide();   
    document.getElementById('titulo').innerHTML = 'Puestos';

    // Inicialización de DataTable con configuración de AJAX y columnas
    const miTabla = $('#tabla').DataTable({
        ajax: {
            url: "query_sql/getConsultas.php", // URL de la consulta
            method: "POST",
            data: function (json) { json.opcion = 1; }, // Envía el parámetro 'opcion' con valor 1
            dataSrc: "" // Fuente de datos, en este caso, respuesta JSON sin nombre de raíz
        },
        columns: [
            {"data": "clave_puesto", className: "text-center"},
            {"data": "puesto_grupo", className: "text-center"},
            {"data": "puesto_rama", className: "text-center"},
            {"data": "puesto_puesto", className: "text-center"},
            {"data": "puesto_nivel", className: "text-center"},
            {"data": "puesto_categoria", className: "text-center"},
            {"data": "puesto_descripcion", className: "text-center"},
            {"data": "puesto_sdo_diario", className: "text-center"},
            {"data": "puesto_sdo_mensual", className: "text-center"},
            {"data": "puesto_sario_integrado", className: "text-center"},
            {"data": "puesto_status", className: "text-center"},
            { // Columna del botón "Detalles"
                data: null,
                className: "text-center",
                orderable: false, // No permite ordenar por esta columna
                render: function (data, type, row) {
                    return `<button class="btn btn-primary btn-detalles" data-id="${row.clave_puesto}">Detalles</button>`;
                }
            }
        ],
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todo"]],
        dom: '<"d-flex justify-content-between mb-3 mt-3"lfB>rtip>', // Elementos de interfaz de usuario de DataTable
        buttons: [
            { extend: 'csvHtml5', text: '<i class="fas fa-file-csv"></i>', titleAttr: 'Exportar a CSV', className: 'btn btn-success', title: 'Diagnosticos' },
            { extend: 'copyHtml5', text: '<i class="far fa-copy"></i>', titleAttr: 'Copiar datos', className: 'btn btn-info' },
            { text: '<i class="fa-solid fa-file-arrow-up upcarga"></i> Actualizacion Masiva', titleAttr: 'Carga masiva de puestos', className: 'btn btn-warning me-1',
                attr: {
                    'data-bs-target': '#modal_carga_masiva',
                    'data-bs-toggle': 'modal'
                }
            }
            
        ],
        bDestroy: true, // Permite que la tabla sea destruida y recreada sin error
        language: { // Configuración de idioma de la tabla
            sProcessing: "Procesando...",
            sLengthMenu: "Mostrar _MENU_ registros",
            sZeroRecords: "No se encontraron resultados",
            sEmptyTable: "Ningún dato disponible en esta tabla",
            sInfo: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
            sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
            sSearch: "Buscar:",
            oPaginate: { sFirst: "Primero", sLast: "&Uacuteltimo", sNext: "Siguiente", sPrevious: "Anterior" },
            oAria: { sSortAscending: ": Activar para ordenar de forma ascendente", sSortDescending: ": Activar para ordenar de forma descendente" }
        }
    });

    $(document).ready(function () {
        permiso_usuario();
    
        $('#contenedor-principal').hide();
        $('#contenedor_sin_permiso').hide();
        document.getElementById('titulo').innerHTML = 'Puestos';
    
        const miTabla = $('#tabla').DataTable({
            ajax: {
                url: "query_sql/getConsultas.php",
                method: "POST",
                data: function (json) { json.opcion = 1; },
                dataSrc: ""
            },
            columns: [
                { "data": "clave_puesto", className: "text-center" },
                { "data": "puesto_grupo", className: "text-center" },
                { "data": "puesto_rama", className: "text-center" },
                { "data": "puesto_puesto", className: "text-center" },
                { "data": "puesto_nivel", className: "text-center" },
                { "data": "puesto_categoria", className: "text-center" },
                { "data": "puesto_descripcion", className: "text-center" },
                { "data": "puesto_sdo_diario", className: "text-center" },
                { "data": "puesto_sdo_mensual", className: "text-center" },
                { "data": "puesto_sario_integrado", className: "text-center" },
                { "data": "puesto_status", className: "text-center" },
                {
                    data: null,
                    className: "text-center",
                    orderable: false,
                    render: function (data, type, row) {
                        return `<button class="btn btn-primary btn-detalles" data-id="${row.clave_puesto}">Detalles</button>`;
                    }
                }
            ],
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todo"]],
            dom: '<"d-flex justify-content-between mb-3 mt-3"lfB>rtip>',
            buttons: [
                { extend: 'csvHtml5', text: '<i class="fas fa-file-csv"></i>', titleAttr: 'Exportar a CSV', className: 'btn btn-success', title: 'Diagnosticos' },
                { extend: 'copyHtml5', text: '<i class="far fa-copy"></i>', titleAttr: 'Copiar datos', className: 'btn btn-info' },
                {
                    text: '<i class="fa-solid fa-file-arrow-up upcarga"></i> Actualizacion Masiva', titleAttr: 'Carga masiva de puestos', className: 'btn btn-warning me-1',
                    attr: {
                        'data-bs-target': '#modal_carga_masiva',
                        'data-bs-toggle': 'modal'
                    }
                }
            ],
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
                oPaginate: { sFirst: "Primero", sLast: "&Uacuteltimo", sNext: "Siguiente", sPrevious: "Anterior" },
                oAria: { sSortAscending: ": Activar para ordenar de forma ascendente", sSortDescending: ": Activar para ordenar de forma descendente" }
            }
        });
    
        // Delegación del evento para los botones "Detalles"
        $('#tabla').on('click', '.btn-detalles', function () {
            const rowData = miTabla.row($(this).parents('tr')).data(); // Obtiene datos de la fila
            $('#clave_puesto').val(rowData.clave_puesto);
            $('#grupo').val(rowData.puesto_grupo);
            $('#rama').val(rowData.puesto_rama);
            $('#puesto').val(rowData.puesto_puesto);
            $('#nivel').val(rowData.puesto_nivel);
            $('#categoria').val(rowData.puesto_categoria);
            $('#descripcion').val(rowData.puesto_descripcion);
            $('#sueldo_diario').val(rowData.puesto_sdo_diario);
            $('#sueldo_mensual').val(rowData.puesto_sdo_mensual);
            $('#sueldo_integrado').val(rowData.puesto_sario_integrado);
            $('#estatus').val(rowData.puesto_status);
    
            // Cambiar vista
            $('#contenedor-principal').show();
            $('#cont_tabla').hide();
            document.getElementById('titulo').innerHTML = 'Detalles del Puesto';
        });
    
        // Evento para el botón regresar
        $('#BtnRegresar').on('click', function () {
            $('#contenedor-principal').hide();
            $('#cont_tabla').show();
            document.getElementById('titulo').innerHTML = 'Puestos';
            miTabla.ajax.reload();
        });
    });
    
    // Evento para el botón regresar
    document.getElementById('BtnRegresar').addEventListener('click', function() {
        $('#contenedor-principal').hide(); // Oculta el formulario
        $('#contenedor_sin_permiso').hide();
        $('#cont_tabla').show(); // Muestra la tabla
        $('#BtnNuevopuesto').show(); // Muestra el boton
        miTabla.ajax.reload(); // Recarga la tabla
    });
});

// Función para actualizar la información
function actualizar() {
    Swal.fire({
        title: "Se realizar&aacute;n cambios",
        text: "\u00bfEst\u00e1s seguro de modificar la informaci\u00f3n del puesto?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "S&iacute;, quiero hacerlo!"
    }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("formulario");
            const formData = new FormData(formulario); // Crea un FormData con los datos del formulario
            fetch('query_sql/EditarPuesto.php', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('&Eacute;xito', 'Se actualiz&oacute; correctamente los datos del puesto', 'success');
                } else if (data.error) {
                    Swal.fire('Error', data.mensaje, 'error');
                }
            })
            .catch(error => {
                Swal.fire('Error', 'Hubo un problema con la actualizaci&oacute;n', 'error');
            });
        }
    });
}


function permiso_usuario() {
    $('#BtnGuardarpuesto').hide();
    $('#BtnNuevopuesto').hide();  
    $('#BtnModificar').hide(); 
    $('.upcarga').hide();

    fetch('query_sql/permisos_usuario.php', {
        method: 'POST',
        body: ''
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        data.forEach(valor => {
            console.log(valor);
            if (valor.tipo_permiso == 1) {  // Si el permiso es 1
                $('#BtnNuevopuesto').show();
                $('.upcarga').show();
            }
            if (valor.tipo_permiso == 4) {  // Si el permiso es 4
                $('#BtnModificar').show();    
            }
        });
    });
}


// Función para agregar 
function agregar() {
    Swal.fire({
        title: "Se realizar&aacute;n cambios",
        text: "\u00bfEst\u00e1s seguro de crear este puesto?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "S&iacute;, quiero hacerlo!"
    }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("formulario");
            const formData = new FormData(formulario); // Crea un FormData con los datos del formulario
            fetch('query_sql/EditarPuesto.php', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('&Eacute;xito', 'Se ha creado correctamente el nuevo puesto', 'success');
                } else if (data.error) {
                    Swal.fire('Error', data.mensaje, 'error');
                }
            })
            .catch(error => {
                Swal.fire('Error', 'Hubo un problema al crear el nuevo puesto', 'error');
            });
        }
    });
}

function obtensigid() {
    // Realizar una solicitud GET al archivo PHP para obtener el puesto_clave
    fetch('query_sql/Ultimoid.php')
    .then(response => {
    // Verificar que la respuesta sea exitosa
    if (!response.ok) {
        throw new Error('Error en la solicitud');
    }
    return response.json(); // Suponiendo que el PHP devuelve un JSON
})
    .then(data => {
        
        console.log(data)
        document.getElementById("clave_puesto").value = data.puesto_clave;
})
    .catch(error => {
    console.error('Hubo un problema con la petición Fetch:', error);
});

}

    // Evento para el botón Nuevo puesto
    document.getElementById('BtnNuevopuesto').addEventListener('click', function() {
    document.getElementById("formulario").reset();// Limpiar el formulario
    $('#BtnGuardarpuesto').show(); // Muestra el boton guardar
    $('#BtnModificar').hide();  // Oculta el boton modificar
    $('#BtnNuevopuesto').hide();  // Oculta el boton nuevo puesto
    document.getElementById('titulo').innerHTML = 'Nuevo Puesto';
    obtensigid();
    });

    // Evento para el botón Guardar
    document.getElementById("BtnGuardarpuesto").addEventListener("click",function () {
        //Aqui es donde se almacena la informacion del formulario
        const formulario = document.getElementById("formulario");
        const formData = new FormData(formulario);
        //Esto lo que hace es recojer por POST todo lo del formulario, por lo que la variable formulario es la que se va a encargar de recojer todo eso
        fetch('query_sql/NuevoPuesto.php', {
            method: "POST",
            body: formData,
        })
    });

    $("#ajaxform").on("submit", function(e){  
        e.preventDefault();  
        /*Se agrego nueva funcionalidad para que detecte si se cargo un archivo o no */
        $archivoCargado = $('#archivo').val();
        if($archivoCargado == ''){
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se cargo ningun archivo'}) 
            return
        } 
        var formData = new FormData(document.getElementById("ajaxform"));
        // formData.append("dato", "valor");
        fetch('query_sql/CargaMasiva.php',{
            method:'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data =>{
            console.log(data)
            console.log(data.success)
            if (data.success) {
                Swal.fire('Exito', data.mensaje, 'success');
                document.getElementById("ajaxform").reset();
                $('#modal_carga_masiva').modal('hide')
                $('#tabla').DataTable().ajax.reload(null, false) 
            }
            if (data.error) {
                Swal.fire('Error', data.mensaje, 'error');
                document.getElementById("ajaxform").reset();
                $('#modal_carga_masiva').modal('hide')
            }
        })
<<<<<<< HEAD
=======
=======
// Función principal que se ejecuta al cargar el documento
$(document).ready(function() {
    permiso_usuario() ;
    // Oculta el formulario y un contenedor sin permiso, y establece un título principal en la página
    $('#contenedor-principal').hide();
    $('#contenedor_sin_permiso').hide();
    // $('#BtnGuardarpuesto').hide();
    // $('#BtnNuevopuesto').hide();  
    // $('#BtnModificar').hide();   
    document.getElementById('titulo').innerHTML = 'Puestos';

    // Inicialización de DataTable con configuración de AJAX y columnas
    const miTabla = $('#tabla').DataTable({
        ajax: {
            url: "query_sql/getConsultas.php", // URL de la consulta
            method: "POST",
            data: function (json) { json.opcion = 1; }, // Envía el parámetro 'opcion' con valor 1
            dataSrc: "" // Fuente de datos, en este caso, respuesta JSON sin nombre de raíz
        },
        columns: [
            {"data": "clave_puesto", className: "text-center"},
            {"data": "puesto_grupo", className: "text-center"},
            {"data": "puesto_rama", className: "text-center"},
            {"data": "puesto_puesto", className: "text-center"},
            {"data": "puesto_nivel", className: "text-center"},
            {"data": "puesto_categoria", className: "text-center"},
            {"data": "puesto_descripcion", className: "text-center"},
            {"data": "puesto_sdo_diario", className: "text-center"},
            {"data": "puesto_sdo_mensual", className: "text-center"},
            {"data": "puesto_sario_integrado", className: "text-center"},
            {"data": "puesto_status", className: "text-center"},
            { // Columna del botón "Detalles"
                data: null,
                className: "text-center",
                orderable: false, // No permite ordenar por esta columna
                render: function (data, type, row) {
                    return `<button class="btn btn-primary btn-detalles" data-id="${row.clave_puesto}">Detalles</button>`;
                }
            }
        ],
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todo"]],
        dom: '<"d-flex justify-content-between mb-3 mt-3"lfB>rtip>', // Elementos de interfaz de usuario de DataTable
        buttons: [
            { extend: 'csvHtml5', text: '<i class="fas fa-file-csv"></i>', titleAttr: 'Exportar a CSV', className: 'btn btn-success', title: 'Diagnosticos' },
            { extend: 'copyHtml5', text: '<i class="far fa-copy"></i>', titleAttr: 'Copiar datos', className: 'btn btn-info' },
            { text: '<i class="fa-solid fa-file-arrow-up upcarga"></i> Actualizacion Masiva', titleAttr: 'Carga masiva de puestos', className: 'btn btn-warning me-1',
                attr: {
                    'data-bs-target': '#modal_carga_masiva',
                    'data-bs-toggle': 'modal'
                }
            }
            
        ],
        bDestroy: true, // Permite que la tabla sea destruida y recreada sin error
        language: { // Configuración de idioma de la tabla
            sProcessing: "Procesando...",
            sLengthMenu: "Mostrar _MENU_ registros",
            sZeroRecords: "No se encontraron resultados",
            sEmptyTable: "Ningún dato disponible en esta tabla",
            sInfo: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
            sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
            sSearch: "Buscar:",
            oPaginate: { sFirst: "Primero", sLast: "&Uacuteltimo", sNext: "Siguiente", sPrevious: "Anterior" },
            oAria: { sSortAscending: ": Activar para ordenar de forma ascendente", sSortDescending: ": Activar para ordenar de forma descendente" }
        }
    });

    $(document).ready(function () {
        permiso_usuario();
    
        $('#contenedor-principal').hide();
        $('#contenedor_sin_permiso').hide();
        document.getElementById('titulo').innerHTML = 'Puestos';
    
        const miTabla = $('#tabla').DataTable({
            ajax: {
                url: "query_sql/getConsultas.php",
                method: "POST",
                data: function (json) { json.opcion = 1; },
                dataSrc: ""
            },
            columns: [
                { "data": "clave_puesto", className: "text-center" },
                { "data": "puesto_grupo", className: "text-center" },
                { "data": "puesto_rama", className: "text-center" },
                { "data": "puesto_puesto", className: "text-center" },
                { "data": "puesto_nivel", className: "text-center" },
                { "data": "puesto_categoria", className: "text-center" },
                { "data": "puesto_descripcion", className: "text-center" },
                { "data": "puesto_sdo_diario", className: "text-center" },
                { "data": "puesto_sdo_mensual", className: "text-center" },
                { "data": "puesto_sario_integrado", className: "text-center" },
                { "data": "puesto_status", className: "text-center" },
                {
                    data: null,
                    className: "text-center",
                    orderable: false,
                    render: function (data, type, row) {
                        return `<button class="btn btn-primary btn-detalles" data-id="${row.clave_puesto}">Detalles</button>`;
                    }
                }
            ],
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todo"]],
            dom: '<"d-flex justify-content-between mb-3 mt-3"lfB>rtip>',
            buttons: [
                { extend: 'csvHtml5', text: '<i class="fas fa-file-csv"></i>', titleAttr: 'Exportar a CSV', className: 'btn btn-success', title: 'Diagnosticos' },
                { extend: 'copyHtml5', text: '<i class="far fa-copy"></i>', titleAttr: 'Copiar datos', className: 'btn btn-info' },
                {
                    text: '<i class="fa-solid fa-file-arrow-up upcarga"></i> Actualizacion Masiva', titleAttr: 'Carga masiva de puestos', className: 'btn btn-warning me-1',
                    attr: {
                        'data-bs-target': '#modal_carga_masiva',
                        'data-bs-toggle': 'modal'
                    }
                }
            ],
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
                oPaginate: { sFirst: "Primero", sLast: "&Uacuteltimo", sNext: "Siguiente", sPrevious: "Anterior" },
                oAria: { sSortAscending: ": Activar para ordenar de forma ascendente", sSortDescending: ": Activar para ordenar de forma descendente" }
            }
        });
    
        // Delegación del evento para los botones "Detalles"
        $('#tabla').on('click', '.btn-detalles', function () {
            const rowData = miTabla.row($(this).parents('tr')).data(); // Obtiene datos de la fila
            $('#clave_puesto').val(rowData.clave_puesto);
            $('#grupo').val(rowData.puesto_grupo);
            $('#rama').val(rowData.puesto_rama);
            $('#puesto').val(rowData.puesto_puesto);
            $('#nivel').val(rowData.puesto_nivel);
            $('#categoria').val(rowData.puesto_categoria);
            $('#descripcion').val(rowData.puesto_descripcion);
            $('#sueldo_diario').val(rowData.puesto_sdo_diario);
            $('#sueldo_mensual').val(rowData.puesto_sdo_mensual);
            $('#sueldo_integrado').val(rowData.puesto_sario_integrado);
            $('#estatus').val(rowData.puesto_status);
    
            // Cambiar vista
            $('#contenedor-principal').show();
            $('#cont_tabla').hide();
            document.getElementById('titulo').innerHTML = 'Detalles del Puesto';
        });
    
        // Evento para el botón regresar
        $('#BtnRegresar').on('click', function () {
            $('#contenedor-principal').hide();
            $('#cont_tabla').show();
            document.getElementById('titulo').innerHTML = 'Puestos';
            miTabla.ajax.reload();
        });
    });
    
    // Evento para el botón regresar
    document.getElementById('BtnRegresar').addEventListener('click', function() {
        $('#contenedor-principal').hide(); // Oculta el formulario
        $('#contenedor_sin_permiso').hide();
        $('#cont_tabla').show(); // Muestra la tabla
        $('#BtnNuevopuesto').show(); // Muestra el boton
        miTabla.ajax.reload(); // Recarga la tabla
    });
});

// Función para actualizar la información
function actualizar() {
    Swal.fire({
        title: "Se realizar&aacute;n cambios",
        text: "\u00bfEst\u00e1s seguro de modificar la informaci\u00f3n del puesto?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "S&iacute;, quiero hacerlo!"
    }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("formulario");
            const formData = new FormData(formulario); // Crea un FormData con los datos del formulario
            fetch('query_sql/EditarPuesto.php', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('&Eacute;xito', 'Se actualiz&oacute; correctamente los datos del puesto', 'success');
                } else if (data.error) {
                    Swal.fire('Error', data.mensaje, 'error');
                }
            })
            .catch(error => {
                Swal.fire('Error', 'Hubo un problema con la actualizaci&oacute;n', 'error');
            });
        }
    });
}


function permiso_usuario() {
    $('#BtnGuardarpuesto').hide();
    $('#BtnNuevopuesto').hide();  
    $('#BtnModificar').hide(); 
    $('.upcarga').hide();

    fetch('query_sql/permisos_usuario.php', {
        method: 'POST',
        body: ''
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        data.forEach(valor => {
            console.log(valor);
            if (valor.tipo_permiso == 1) {  // Si el permiso es 1
                $('#BtnNuevopuesto').show();
                $('.upcarga').show();
            }
            if (valor.tipo_permiso == 4) {  // Si el permiso es 4
                $('#BtnModificar').show();    
            }
        });
    });
}


// Función para agregar 
function agregar() {
    Swal.fire({
        title: "Se realizar&aacute;n cambios",
        text: "\u00bfEst\u00e1s seguro de crear este puesto?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "S&iacute;, quiero hacerlo!"
    }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("formulario");
            const formData = new FormData(formulario); // Crea un FormData con los datos del formulario
            fetch('query_sql/EditarPuesto.php', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('&Eacute;xito', 'Se ha creado correctamente el nuevo puesto', 'success');
                } else if (data.error) {
                    Swal.fire('Error', data.mensaje, 'error');
                }
            })
            .catch(error => {
                Swal.fire('Error', 'Hubo un problema al crear el nuevo puesto', 'error');
            });
        }
    });
}

function obtensigid() {
    // Realizar una solicitud GET al archivo PHP para obtener el puesto_clave
    fetch('query_sql/Ultimoid.php')
    .then(response => {
    // Verificar que la respuesta sea exitosa
    if (!response.ok) {
        throw new Error('Error en la solicitud');
    }
    return response.json(); // Suponiendo que el PHP devuelve un JSON
})
    .then(data => {
        
        console.log(data)
        document.getElementById("clave_puesto").value = data.puesto_clave;
})
    .catch(error => {
    console.error('Hubo un problema con la petición Fetch:', error);
});

}

    // Evento para el botón Nuevo puesto
    document.getElementById('BtnNuevopuesto').addEventListener('click', function() {
    document.getElementById("formulario").reset();// Limpiar el formulario
    $('#BtnGuardarpuesto').show(); // Muestra el boton guardar
    $('#BtnModificar').hide();  // Oculta el boton modificar
    $('#BtnNuevopuesto').hide();  // Oculta el boton nuevo puesto
    document.getElementById('titulo').innerHTML = 'Nuevo Puesto';
    obtensigid();
    });

    // Evento para el botón Guardar
    document.getElementById("BtnGuardarpuesto").addEventListener("click",function () {
        //Aqui es donde se almacena la informacion del formulario
        const formulario = document.getElementById("formulario");
        const formData = new FormData(formulario);
        //Esto lo que hace es recojer por POST todo lo del formulario, por lo que la variable formulario es la que se va a encargar de recojer todo eso
        fetch('query_sql/NuevoPuesto.php', {
            method: "POST",
            body: formData,
        })
    });

    $("#ajaxform").on("submit", function(e){  
        e.preventDefault();  
        /*Se agrego nueva funcionalidad para que detecte si se cargo un archivo o no */
        $archivoCargado = $('#archivo').val();
        if($archivoCargado == ''){
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se cargo ningun archivo'}) 
            return
        } 
        var formData = new FormData(document.getElementById("ajaxform"));
        // formData.append("dato", "valor");
        fetch('query_sql/CargaMasiva.php',{
            method:'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data =>{
            console.log(data)
            console.log(data.success)
            if (data.success) {
                Swal.fire('Exito', data.mensaje, 'success');
                document.getElementById("ajaxform").reset();
                $('#modal_carga_masiva').modal('hide')
                $('#tabla').DataTable().ajax.reload(null, false) 
            }
            if (data.error) {
                Swal.fire('Error', data.mensaje, 'error');
                document.getElementById("ajaxform").reset();
                $('#modal_carga_masiva').modal('hide')
            }
        })
>>>>>>> e40c811f0792c47020ea16882dd53dc56fd1a088
>>>>>>> 390319036638cb11f96d0426c37d77bbec365fef
    });