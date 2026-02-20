<?php
session_start();
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');

function listarDatos($conexion)
{


    $filtros = array("mc.estado IN (2,7,8)"); // Primer condición obligatoria

    $modulo = isset($_SESSION['modulo_o']) ? $_SESSION['modulo_o'] : null;
    if ($modulo !== null && $modulo != 0) { // 0 = oficinas centrales, ve todos
        $filtros[] = "mc.modulo = '" . pg_escape_string($conexion, $modulo) . "'";
    }

    $where = "";
    if (count($filtros) > 0) {
        $where = "WHERE " . implode(" AND ", $filtros);
    }

    $mmto_rep_realizadas = " SELECT * FROM mantenimiento_correctivo_orden mc  $where";

    $resultado = @pg_query($conexion, $mmto_rep_realizadas);
    $datos = array();

    if ($resultado) {
        while ($data = pg_fetch_assoc($resultado)) {
            //! esta linea de codigo agrega cada fila obtenida a un array, osea trae todos los datos
            $datos[] = array(
                "id" => $data["id"],
                "orden_correctivo" => $data["orden_correctivo"],
                "economico" => $data["economico"],
                "kilometraje" => $data["kilometraje"],
                "modulo" => $data["modulo"],
                "ruta" => $data["ruta"],
                "falla" => $data["falla"],
                "falla_descripcion_operador" => $data["falla_descripcion_operador"],
                "operador" => $data["operador"],
                "falladescripcion_operador" => $data["falladescripcion_operador"],
            );

        }
    }
    return $datos;
}
header('Content-Type: application/json');
echo json_encode(listarDatos($conexion));