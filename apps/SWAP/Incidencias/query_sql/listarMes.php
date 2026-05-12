<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');

function listarMeses($conexion)
{

    $modulo_usr = isset($_SESSION['modulo_o']) ? (int) $_SESSION['modulo_o'] : 0;
    $modulo_post = isset($_POST['modulo']) ? (int) $_POST['modulo'] : 0;

    $modulo_final = ($modulo_usr === 0) ? $modulo_post : $modulo_usr;

    if ($modulo_final === 0) {
        $sql = "
      SELECT DISTINCT to_char(hora_reporte, 'YYYY-MM') AS mes
      FROM public.sgio_reportes
      WHERE hora_reporte IS NOT NULL
      ORDER BY mes;
    ";
        $res = pg_query($conexion, $sql);
    } else {
        $sql = "
      SELECT DISTINCT to_char(hora_reporte, 'YYYY-MM') AS mes
      FROM public.sgio_reportes
      WHERE hora_reporte IS NOT NULL
        AND modulo = $1
      ORDER BY mes;
    ";
        $res = pg_query_params($conexion, $sql, array((string) $modulo_final));
    }

    $json = array();
    if ($res) {
        while ($row = pg_fetch_assoc($res)) {
            $json[] = array('mes' => $row['mes']);
        }
    }

    return $json;
}

echo json_encode(array(
    'data' => listarMeses($conexion)
));
