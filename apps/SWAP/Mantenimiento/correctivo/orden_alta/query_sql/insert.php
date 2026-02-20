<?php
session_start();
include($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');
$usr = $_SESSION['usr_id'];


header('Content-Type: application/json');

function insertarDatos($conexion, $usr)
{
    $json = array();
    pg_query($conexion, 'BEGIN');
    try {

        // Obtener los datos enviados por POST
        $modulo = isset($_SESSION['modulo_o']) ? $_SESSION['modulo_o'] : null;
        $economico = isset($_POST['economico']) ? $_POST['economico'] : null;
        $ruta = isset($_POST['ruta']) ? $_POST['ruta'] : null;
        $operador = isset($_POST['operador']) ? $_POST['operador'] : null;
        $fecha_hora = isset($_POST['fecha_hora']) ? $_POST['fecha_hora'] : null;
        $falla = isset($_POST['falla']) ? $_POST['falla'] : null;
        $falla_descripcion_operador = isset($_POST['falla_descripcion_operador']) ? $_POST['falla_descripcion_operador'] : null;
        $jud = isset($_POST['jud']) ? $_POST['jud'] : null;
        $jefe_oficina = isset($_POST['jefe_oficina']) ? $_POST['jefe_oficina'] : null;
        $created_by = $usr;


        // Validar los datos
        if ($economico === null) {
            throw new Exception("El campo 'economico' no fue enviado por POST.");
        }
        if ($ruta === null) {
            throw new Exception("El campo 'ruta' no fue enviado por POST.");
        }
        if ($fecha_hora === null) {
            throw new Exception("El campo 'fecha_hora' no fue enviado por POST.");
        }
        if ($modulo === null) {
            throw new Exception("El campo 'modulo' no está definido en la sesión.");
        }
        if ($operador === null) {
            throw new Exception("El campo 'operador' no fue enviado por POST.");
        }

        $insert_mtto = "INSERT INTO mantenimiento_correctivo_orden
            (economico, modulo, ruta,operador, falla,falla_descripcion_operador, fecha_alta_correctivo, created_by,jud, jefe_oficina)
            VALUES ($1, $2, $3, $4,$5, $6, $7, $8,$9,$10)";

        // Asegúrate de que $params es un array
        $params = array($economico, $modulo, $ruta, $operador, $falla, $falla_descripcion_operador, $fecha_hora, $created_by, $jud, $jefe_oficina);


        $resultado = pg_query_params($conexion, $insert_mtto, $params);
        if (!$resultado) {
            throw new Exception("Error en la consulta: " . pg_last_error($conexion));
        }

        pg_query($conexion, "COMMIT");
        $json['success'] = true;
    } catch (Exception $e) {
        $json['success'] = false;
        $json['error'] = $e->getMessage();
        pg_query($conexion, "ROLLBACK");
    }
    return $json;
}

echo json_encode(insertarDatos($conexion, $usr));