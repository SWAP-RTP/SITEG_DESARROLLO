<?php
session_start();
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');

function filtarModulo($conexion)
{
    $filtros = array(); // Inicializa el array


    // Filtro por módulo según el usuario
    $modulo = isset($_SESSION['modulo_o']) ? $_SESSION['modulo_o'] : null;
    if ($modulo !== null && $modulo != 0) { // 0 = oficinas centrales, ve todos
        $filtros[] = "modulo = '" . pg_escape_string($conexion, $modulo) . "'";
    }
    // Filtro por fecha (solo registros del día actual)
    // $filtros[] = "fecha_alta_correctivo::date = current_date";    // Construir la cláusula WHERE
    $where = "";
    if (count($filtros) > 0) {
        $where = "WHERE " . implode(" AND ", $filtros);
    }

    $mtto = "SELECT
     id, 
     orden_correctivo, 
     economico, 
     kilometraje, 
     modulo, 
     ruta, 
     falla_descripcion_operador, 
     operador, 
     fecha_alta_correctivo, 
     created_by, 
     update_at, 
     estatus, 
     estado,
     jud,
     jefe_oficina
    FROM mantenimiento_correctivo_orden
    $where";


    $resultado = @pg_query($conexion, $mtto);
    $json = array();
    if ($resultado) {
        while ($data = @pg_fetch_assoc($resultado)) {
            $json[] = array(
                'id' => $data['id'],
                'orden_correctivo' => $data['orden_correctivo'],
                'economico' => $data['economico'],
                'kilometraje' => $data['kilometraje'],
                'modulo' => $data['modulo'],
                'ruta' => $data['ruta'],
                'falla_descripcion_operador' => $data['falla_descripcion_operador'],
                'operador' => $data['operador'],
                'fecha_alta_correctivo' => $data['fecha_alta_correctivo'],
                'created_by' => $data['created_by'],
                'update_at' => $data['update_at'],
                'estatus' => $data['estatus'],
                'estado' => $data['estado'],
                "jud" => $data["jud"],
                "jefe_oficina" => $data["jefe_oficina"],
            );
        }
    }
    return $json;
}

header('Content-Type: application/json');
echo json_encode(filtarModulo($conexion));