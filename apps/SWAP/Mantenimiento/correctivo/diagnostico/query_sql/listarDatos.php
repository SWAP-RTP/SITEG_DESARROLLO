<?php
session_start();
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');

function filtrarModulo($conexion)
{
    $filtros = array(); // Inicializa el array

    // Filtro por módulo según el usuario
    $modulo = isset($_SESSION['modulo_o']) ? $_SESSION['modulo_o'] : null;
    if ($modulo !== null && $modulo != 0) { // 0 = oficinas centrales, ve todos
        $filtros[] = "modulo = '" . pg_escape_string($conexion, $modulo) . "'";
    }
    $where = "";
    if (count($filtros) > 0) {
        $where = "WHERE " . implode(" AND ", $filtros);
    }

    // $mmto_diagnostico = "SELECT num_orden_correctivo, num_economico, mod_clave, falla_operador , falla_operador_desc, fecha_alta, estatus FROM mantenimiento_correctivo $where";
    $mmto_diagnostico = "   SELECT  o.orden_correctivo,o.economico ,o.modulo,o.falla_descripcion_operador ,mcd.observacion, mcd.fecha, e.descripcion
                            FROM mantenimiento_correctivo_diagnostico mcd 
                            INNER JOIN mantenimiento_correctivo_orden o
                            ON o.id = mcd.num_orden
                            LEFT JOIN mantenimiento_correctivo_estatus e 
                            ON o.estado = e.estatus_cve  $where";


    $resultado = @pg_query($conexion, $mmto_diagnostico);
    $json = array();

    if ($resultado) {
        while ($data = pg_fetch_assoc($resultado)) {
            $json[] = array(
                "orden_correctivo" => $data['orden_correctivo'],
                "economico" => $data['economico'],
                "falla_descripcion_operador" => $data['falla_descripcion_operador'],
                "observacion" => $data['observacion'],
                "fecha" => $data['fecha'],
                "falla_operador_desc" => $data['falla_operador_desc'],
                "modulo" => $data['modulo'],
                "descripcion" => $data['descripcion'],
            );
        }
    }
    return $json;

}

header('Content-Type: application/json');
echo json_encode(filtrarModulo($conexion));