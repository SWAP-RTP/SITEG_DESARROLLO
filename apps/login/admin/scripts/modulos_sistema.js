export function consulta_modulos_swap() {
    $.ajax({
        url: "/admin/query_sql/getModulos.php",
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
    if ($.fn.DataTable.isDataTable('#tabla_modulos_sistemas')) {
        $('#tabla_modulos_sistemas').DataTable().destroy();
    }

    $('#tabla_modulos_sistemas').DataTable({
        data: data,
        columns: [
            { data: "cve_modulo", title: "Id", class: "text-center" },
            { data: "modulo_sistem_descrip", title: "modulo_sistem_descrip", class: "text-center" },
            {
                data: "estatus",
                title: "Estatus",
                class: "text-center",
                render: function (data, type, row) {
                  return data === "t"
                    ? '<span class="badge bg-success">Activo</span>'
                    : '<span class="badge bg-secondary">Inactivo</span>';
                },
            },
            {
                data: "estatus",
                title: "Acción",
                class: "text-center",
                render: function (data, type, row) {
                    if(data === "t"){
                        return `<div class="d-flex justify-content-center">
                                    <button class="btn btn-warning btn-sm me-2">
                                        <i class="fa-solid fa-square-xmark"></i> Inactivar
                                    </button>
                                    <button class="btn btn-danger btn-sm me-2">
                                        <i class="fa-solid fa-trash-can"></i> Eliminar
                                    </button>
                                </div>`;
                    }else{
                        return `<div class="d-flex justify-content-center">
                                    <button class="btn btn-primary btn-sm me-2">
                                        <i class="fa-solid fa-square-check"></i> Activar
                                    </button>
                                    <button class="btn btn-danger btn-sm me-2">
                                        <i class="fa-solid fa-trash-can"></i> Eliminar
                                    </button>
                                </div>`;
                    }
                },
            }
        ],
        language: {
            url: "/lib/datatables.net-1.13.6/es-ES.json", // Para tener la tabla en español
        }
    });
}