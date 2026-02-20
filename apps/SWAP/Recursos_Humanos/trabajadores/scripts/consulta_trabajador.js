<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 390319036638cb11f96d0426c37d77bbec365fef
$(document).ready(function () {
    $('#tabla_contenedor').hide();
    $('#animacion').hide(); //oculta la animacion

    // pinta sobre un select la adscripcion
    fetch('query_sql/adscripcion.php', {
        method: 'POST',
        body: ''
    })
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("adscripcion");

            data.forEach(element => {
                let prefix = '';

                if (element.direccion === '000') {
                    prefix = '';
                } else {
                    if (element.gerencias === '00') {
                        prefix = '&nbsp;&nbsp;&nbsp;';
                    } else {
                        if (element.departamentos === '0') {
                            prefix = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                        }
                    }
                }

                // Crear la opción con el texto adecuadamente indentado
                const option = document.createElement('option');
                option.value = element.adscripcion_cve;
                option.innerHTML = prefix + element.adscripcion;
                select.appendChild(option);
            });
        });


    // Pinta la division y proceso sobre un select
    fetch('query_sql/division_proceso.php', {
        method: 'POST',
        body: ''
    })
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("div_proc");

            data.forEach(element => {
                const option = document.createElement('option');
                option.value = element.tipo_trabajdor_cve;
                option.innerHTML = element.tipo_trabajdor;
                select.appendChild(option);
            })
        })

    // Evento para obtener el cambio de un switch para inhabilitar/habilitar 
    document.querySelectorAll('.form-check-input').forEach(function (elementoSwitch) {
        elementoSwitch.addEventListener('change', function () {
            // Si el 'todos_switch' cambia
            if (this.id === 'todos_switch') {
                const estado = this.checked; // Guardar el estado del 'todos_switch'

                // Activar/desactivar todos los switches (excepto los excluidos)
                document.querySelectorAll('.form-check-input').forEach(function (switchItem) {
                    if (switchItem.id !== 'trab_credencial' && switchItem.id !== 'estado_nombre' && switchItem.id !== 'dependecias') {
                        switchItem.checked = estado;
                    }
                });
            } else {
                // Si cualquier otro switch cambia y se desactiva, desactivar el 'todos_switch'
                if (!this.checked && this.id !== 'trab_credencial' && this.id !== 'estado_nombre' && this.id !== 'dependecias') {
                    document.getElementById('todos_switch').checked = false;
                }

                // Verificar si todos los switches relevantes están activados
                const todosActivados = Array.from(document.querySelectorAll('.form-check-input')).every(function (switchItem) {

                    // Solo consideramos los switches que no están excluidos
                    if (switchItem.id !== 'trab_credencial' && switchItem.id !== 'estado_nombre' && switchItem.id !== 'dependecias' && switchItem.id !== 'todos_switch') {
                        return switchItem.checked;
                    }
                    return true; // Si es uno de los excluidos, lo omitimos y lo consideramos activado
                });

                // console.log(todosActivados)

                // Si todos los switches relevantes están activados, activar el 'todos_switch'
                document.getElementById('todos_switch').checked = todosActivados;
            }
        });
    });


    // Busca el filtro de la busqueda del formulario
    document.getElementById("BtnFiltrar").addEventListener("click", function () {
        $('#contenedor-boton').hide(); //oculta el contenedor del boton
        $('#animacion').show(); //muestra la animacion
        const formulario_principal = document.getElementById("formulario");
        const formData = new FormData(formulario_principal);

        // Obtiene los valores de los switches a traves de la clase
        document.querySelectorAll('.form-check-input').forEach(function (elementoSwitch) {
            const isChecked = elementoSwitch.checked ? true : false;
            formData.append(elementoSwitch.id, isChecked); // Agregar booleano en lugar de 'on'
        });

        fetch('query_sql/trabajador.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // console.log(data)
                $('#tabla_contenedor').hide();
                dbtable(data)
                $('#tabla_contenedor').show('slow');
                $('#animacion').hide();
            })
    })

    //Reedirige a otro html con la data
    $('#tabla tbody').on('click', 'tr', function () {
        var table = $('#tabla').DataTable();
        var data = table.row(this).data();  // Obtén los datos de la fila seleccionada

        if (data) {
            window.location.href = 'editar_trabajador.html?credencial=' + data.credencial;
        }
    });



    const dbtable = (data) => {

        $('#contenedor-form').hide(); //oculta el formulario de consulta

        // Limpia los formularios
        document.getElementById("formulario").reset();
        document.getElementById("formulario_switch").reset();

        // Definir las columnas
        const columns = [
            { "data": "credencial", "className": "text-center", "title": "Credencial" },
            { "data": "nombre", "className": "text-center", "title": "Nombre(s)" },
            { "data": "apellido_paterno", "className": "text-center", "title": "Apellido Paterno" },
            { "data": "apellido_materno", "className": "text-center", "title": "Apellido Materno" },
            { "data": "indicativo", "className": "text-center", "title": "Indicativo" },
            { "data": "division", "className": "text-center", "title": "Division" },
            { "data": "proceso", "className": "text-center", "title": "Proceso" },
            { "data": "tipo_trabajador", "className": "text-center", "title": "Tipo Trab" },
            { "data": "puesto_cve", "className": "text-center", "title": "Puesto clave" },
            { "data": "puesto", "className": "text-center", "title": "Puesto" },
            { "data": "SDI", "className": "text-center", "title": "S.D.I" },
            { "data": "sueldo_mensual", "className": "text-center", "title": "Sueldo Mensual" },
            { "data": "estatus", "className": "text-center", "title": "Estado" },
            { "data": "RFC", "className": "text-center", "title": "R.F.C" },
            { "data": "CURP", "className": "text-center", "title": "CURP" },
            { "data": "lugar_nacimiento", "className": "text-center", "title": "Lugar Nacimiento" },
            { "data": "calle", "className": "text-center", "title": "Calle" },
            { "data": "colonia", "className": "text-center", "title": "Colonia" },
            { "data": "codigo_postal", "className": "text-center", "title": "C.P." },
            { "data": "poblacion", "className": "text-center", "title": "Poblacion" },
            { "data": "edo", "className": "text-center", "title": "Edo" },
            { "data": "telefono", "className": "text-center", "title": "Telefono" },
            { "data": "telefono_movil", "className": "text-center", "title": "Telefono Movil" },
            { "data": "estado_civil", "className": "text-center", "title": "Estado Civil" },
            { "data": "estudios", "className": "text-center", "title": "Estudios" },
            { "data": "estado_escolaridad", "className": "text-center", "title": "Estado Escolaridad" },
            { "data": "adscripcion_numero", "className": "text-center", "title": "Num. Adscripcion" },
            { "data": "adscripcion_desc", "className": "text-center", "title": "Adscripcion" },
            { "data": "sexo", "className": "text-center", "title": "Sexo" },
            { "data": "fecha_nacimiento", "className": "text-center", "title": "Fecha de Nacimiento" },
            { "data": "edad", "className": "text-center", "title": "Edad" },
            { "data": "fecha_ingreso", "className": "text-center", "title": "Fecha Ingreso" },
            { "data": "fecha_contrato", "className": "text-center", "title": "Fecha Contrato" },
            { "data": "modulo", "className": "text-center", "title": "Modulo" },
            { "data": "no_afiliacion_imms", "className": "text-center", "title": "No.Afiliacion IMSS" },
            { "data": "familiar_1", "className": "text-center", "title": "Familiar #1" },
            { "data": "familiar_2", "className": "text-center", "title": "Familiar #2" },
            {
                "data": "foto", "className": "text-center", "title": "Foto",
                "render": function (data, type, row) {
                    // console.log(data)
                    if (data !== '') {
                        return '<img src="' + data + '" alt="Foto" style="width:50px; height:50px;"/>';
                    } else {
                        return '<p>sin foto</p>';
                    }
                    return data;
                }
            },
        ];

        // Lógica para ocultar columnas sin datos
        columns.forEach((column, index) => {

            // Verificar si hay datos en la columna
            const hasData = data.some(row => row[column.data] !== undefined && row[column.data] !== null && row[column.data] !== "");
            if (!hasData) {
                column.visible = false; // Ocultar columna si no hay datos
            }
        });

        miTabla = $('#tabla').DataTable({
            responsive: true,
            ordering: false, // Desactiva el ordenamiento en toda la tabla
            data: data,
            "columns": columns,
            dom: '<"d-flex justify-content-between mb-3 mt-3 gap-1"lfB>rt<"d-flex justify-content-between mt-3"ip>', // para darle espacio entre los botones mostrar registro, buscar, imprimir, excel y copy
            buttons: [
                {
                    text: '<i class="fas fa-backward"></i> Regresar ',
                    titleAttr: 'Regresar al buscador',
                    className: 'btn btn-warning me-1',
                    action: function (e, dt, node, config) {
                        $('#contenedor-form').show(); //muestra el formulario de consulta
                        $('#tabla_contenedor').hide(); //oculta la tabla 
                        $('#contenedor-boton').show();
                    }
                },
                {
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i> ',
                    titleAttr: 'Exportar a xlsx',
                    className: 'btn btn-success me-1',
                    title: 'Exportar a Excel'
                },
                {
                    extend: 'copyHtml5',
                    text: '<i class="far fa-copy"></i> ',
                    titleAttr: 'Copiar datos',
                    className: 'btn btn-info me-1'
                },
            ],
            "bDestroy": true,
            "language": {
                "sProcessing": "Procesando...",
                "sLengthMenu": "Mostrar _MENU_ registros",
                "sZeroRecords": "No se encontraron resultados",
                "sEmptyTable": "Ningún dato disponible en esta tabla",
                "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sSearch": "Buscar:",
                "oPaginate": {
                    "sFirst": "Primero",
                    "sLast": "Último",
                    "sNext": "Siguiente",
                    "sPrevious": "Anterior"
                }
            },
        });
    }






<<<<<<< HEAD
=======
=======
$(document).ready(function () {
    $('#tabla_contenedor').hide();
    $('#animacion').hide(); //oculta la animacion

    // pinta sobre un select la adscripcion
    fetch('query_sql/adscripcion.php', {
        method: 'POST',
        body: ''
    })
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("adscripcion");

            data.forEach(element => {
                let prefix = '';

                if (element.direccion === '000') {
                    prefix = '';
                } else {
                    if (element.gerencias === '00') {
                        prefix = '&nbsp;&nbsp;&nbsp;';
                    } else {
                        if (element.departamentos === '0') {
                            prefix = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                        }
                    }
                }

                // Crear la opción con el texto adecuadamente indentado
                const option = document.createElement('option');
                option.value = element.adscripcion_cve;
                option.innerHTML = prefix + element.adscripcion;
                select.appendChild(option);
            });
        });


    // Pinta la division y proceso sobre un select
    fetch('query_sql/division_proceso.php', {
        method: 'POST',
        body: ''
    })
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("div_proc");

            data.forEach(element => {
                const option = document.createElement('option');
                option.value = element.tipo_trabajdor_cve;
                option.innerHTML = element.tipo_trabajdor;
                select.appendChild(option);
            })
        })

    // Evento para obtener el cambio de un switch para inhabilitar/habilitar 
    document.querySelectorAll('.form-check-input').forEach(function (elementoSwitch) {
        elementoSwitch.addEventListener('change', function () {
            // Si el 'todos_switch' cambia
            if (this.id === 'todos_switch') {
                const estado = this.checked; // Guardar el estado del 'todos_switch'

                // Activar/desactivar todos los switches (excepto los excluidos)
                document.querySelectorAll('.form-check-input').forEach(function (switchItem) {
                    if (switchItem.id !== 'trab_credencial' && switchItem.id !== 'estado_nombre' && switchItem.id !== 'dependecias') {
                        switchItem.checked = estado;
                    }
                });
            } else {
                // Si cualquier otro switch cambia y se desactiva, desactivar el 'todos_switch'
                if (!this.checked && this.id !== 'trab_credencial' && this.id !== 'estado_nombre' && this.id !== 'dependecias') {
                    document.getElementById('todos_switch').checked = false;
                }

                // Verificar si todos los switches relevantes están activados
                const todosActivados = Array.from(document.querySelectorAll('.form-check-input')).every(function (switchItem) {

                    // Solo consideramos los switches que no están excluidos
                    if (switchItem.id !== 'trab_credencial' && switchItem.id !== 'estado_nombre' && switchItem.id !== 'dependecias' && switchItem.id !== 'todos_switch') {
                        return switchItem.checked;
                    }
                    return true; // Si es uno de los excluidos, lo omitimos y lo consideramos activado
                });

                // console.log(todosActivados)

                // Si todos los switches relevantes están activados, activar el 'todos_switch'
                document.getElementById('todos_switch').checked = todosActivados;
            }
        });
    });


    // Busca el filtro de la busqueda del formulario
    document.getElementById("BtnFiltrar").addEventListener("click", function () {
        $('#contenedor-boton').hide(); //oculta el contenedor del boton
        $('#animacion').show(); //muestra la animacion
        const formulario_principal = document.getElementById("formulario");
        const formData = new FormData(formulario_principal);

        // Obtiene los valores de los switches a traves de la clase
        document.querySelectorAll('.form-check-input').forEach(function (elementoSwitch) {
            const isChecked = elementoSwitch.checked ? true : false;
            formData.append(elementoSwitch.id, isChecked); // Agregar booleano en lugar de 'on'
        });

        fetch('query_sql/trabajador.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // console.log(data)
                $('#tabla_contenedor').hide();
                dbtable(data)
                $('#tabla_contenedor').show('slow');
                $('#animacion').hide();
            })
    })

    //Reedirige a otro html con la data
    $('#tabla tbody').on('click', 'tr', function () {
        var table = $('#tabla').DataTable();
        var data = table.row(this).data();  // Obtén los datos de la fila seleccionada

        if (data) {
            window.location.href = 'editar_trabajador.html?credencial=' + data.credencial;
        }
    });



    const dbtable = (data) => {

        $('#contenedor-form').hide(); //oculta el formulario de consulta

        // Limpia los formularios
        document.getElementById("formulario").reset();
        document.getElementById("formulario_switch").reset();

        // Definir las columnas
        const columns = [
            { "data": "credencial", "className": "text-center", "title": "Credencial" },
            { "data": "nombre", "className": "text-center", "title": "Nombre(s)" },
            { "data": "apellido_paterno", "className": "text-center", "title": "Apellido Paterno" },
            { "data": "apellido_materno", "className": "text-center", "title": "Apellido Materno" },
            { "data": "indicativo", "className": "text-center", "title": "Indicativo" },
            { "data": "division", "className": "text-center", "title": "Division" },
            { "data": "proceso", "className": "text-center", "title": "Proceso" },
            { "data": "tipo_trabajador", "className": "text-center", "title": "Tipo Trab" },
            { "data": "puesto_cve", "className": "text-center", "title": "Puesto clave" },
            { "data": "puesto", "className": "text-center", "title": "Puesto" },
            { "data": "SDI", "className": "text-center", "title": "S.D.I" },
            { "data": "sueldo_mensual", "className": "text-center", "title": "Sueldo Mensual" },
            { "data": "estatus", "className": "text-center", "title": "Estado" },
            { "data": "RFC", "className": "text-center", "title": "R.F.C" },
            { "data": "CURP", "className": "text-center", "title": "CURP" },
            { "data": "lugar_nacimiento", "className": "text-center", "title": "Lugar Nacimiento" },
            { "data": "calle", "className": "text-center", "title": "Calle" },
            { "data": "colonia", "className": "text-center", "title": "Colonia" },
            { "data": "codigo_postal", "className": "text-center", "title": "C.P." },
            { "data": "poblacion", "className": "text-center", "title": "Poblacion" },
            { "data": "edo", "className": "text-center", "title": "Edo" },
            { "data": "telefono", "className": "text-center", "title": "Telefono" },
            { "data": "telefono_movil", "className": "text-center", "title": "Telefono Movil" },
            { "data": "estado_civil", "className": "text-center", "title": "Estado Civil" },
            { "data": "estudios", "className": "text-center", "title": "Estudios" },
            { "data": "estado_escolaridad", "className": "text-center", "title": "Estado Escolaridad" },
            { "data": "adscripcion_numero", "className": "text-center", "title": "Num. Adscripcion" },
            { "data": "adscripcion_desc", "className": "text-center", "title": "Adscripcion" },
            { "data": "sexo", "className": "text-center", "title": "Sexo" },
            { "data": "fecha_nacimiento", "className": "text-center", "title": "Fecha de Nacimiento" },
            { "data": "edad", "className": "text-center", "title": "Edad" },
            { "data": "fecha_ingreso", "className": "text-center", "title": "Fecha Ingreso" },
            { "data": "fecha_contrato", "className": "text-center", "title": "Fecha Contrato" },
            { "data": "modulo", "className": "text-center", "title": "Modulo" },
            { "data": "no_afiliacion_imms", "className": "text-center", "title": "No.Afiliacion IMSS" },
            { "data": "familiar_1", "className": "text-center", "title": "Familiar #1" },
            { "data": "familiar_2", "className": "text-center", "title": "Familiar #2" },
            {
                "data": "foto", "className": "text-center", "title": "Foto",
                "render": function (data, type, row) {
                    // console.log(data)
                    if (data !== '') {
                        return '<img src="' + data + '" alt="Foto" style="width:50px; height:50px;"/>';
                    } else {
                        return '<p>sin foto</p>';
                    }
                    return data;
                }
            },
        ];

        // Lógica para ocultar columnas sin datos
        columns.forEach((column, index) => {

            // Verificar si hay datos en la columna
            const hasData = data.some(row => row[column.data] !== undefined && row[column.data] !== null && row[column.data] !== "");
            if (!hasData) {
                column.visible = false; // Ocultar columna si no hay datos
            }
        });

        miTabla = $('#tabla').DataTable({
            responsive: true,
            ordering: false, // Desactiva el ordenamiento en toda la tabla
            data: data,
            "columns": columns,
            dom: '<"d-flex justify-content-between mb-3 mt-3 gap-1"lfB>rt<"d-flex justify-content-between mt-3"ip>', // para darle espacio entre los botones mostrar registro, buscar, imprimir, excel y copy
            buttons: [
                {
                    text: '<i class="fas fa-backward"></i> Regresar ',
                    titleAttr: 'Regresar al buscador',
                    className: 'btn btn-warning me-1',
                    action: function (e, dt, node, config) {
                        $('#contenedor-form').show(); //muestra el formulario de consulta
                        $('#tabla_contenedor').hide(); //oculta la tabla 
                        $('#contenedor-boton').show();
                    }
                },
                {
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i> ',
                    titleAttr: 'Exportar a xlsx',
                    className: 'btn btn-success me-1',
                    title: 'Exportar a Excel'
                },
                {
                    extend: 'copyHtml5',
                    text: '<i class="far fa-copy"></i> ',
                    titleAttr: 'Copiar datos',
                    className: 'btn btn-info me-1'
                },
            ],
            "bDestroy": true,
            "language": {
                "sProcessing": "Procesando...",
                "sLengthMenu": "Mostrar _MENU_ registros",
                "sZeroRecords": "No se encontraron resultados",
                "sEmptyTable": "Ningún dato disponible en esta tabla",
                "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sSearch": "Buscar:",
                "oPaginate": {
                    "sFirst": "Primero",
                    "sLast": "Último",
                    "sNext": "Siguiente",
                    "sPrevious": "Anterior"
                }
            },
        });
    }






>>>>>>> e40c811f0792c47020ea16882dd53dc56fd1a088
>>>>>>> 390319036638cb11f96d0426c37d77bbec365fef
}); //Fin evento inicializador