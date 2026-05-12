<?php
session_start();
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');

$user_id = $_SESSION['usr_id'];
// echo $user_id;


function insertarRespuesta($conexion){


    $user_id = $_SESSION['usr_id'];
      $reporte_id = isset($_POST['id']) ? trim($_POST['id']) : '';
    $id = isset($_POST['id']) ? trim($_POST['id']) : '';
    $credencial = $_POST['credencial'];
    $oficio = $_POST['oficio'];
    $ruta = $_POST['ruta_archivo'];
    $observaciones = $_POST['observaciones'];
    $ip = $_SERVER['REMOTE_ADDR']; // IP automática
    $json = array();

//     $credencial = '12728';
// $oficio = 'OF-001';
// $ruta_archivo = 'rtp/55/fsdfs/33/';
// $observaciones = 'Se tomaran medidas accionarias';
// $ip = $_SERVER['REMOTE_ADDR'];
// // $user_subida = '123456';
// $user_id = $_SESSION['usr_id'];
// $reporte_id = 15;

if (empty($reporte_id) || !is_numeric($reporte_id)) {
    return array('error' => 'El campo reporte_id es obligatorio y debe ser un número');
}
        pg_query($conexion, "BEGIN");
        try {
           $incidencias_insertar_sql = "INSERT INTO sgio_respuesta_modulo (credencial, oficio, ruta_archivo, observaciones, ip_usuario, user_subida, reporte_id)
                                VALUES 
                                ('$credencial', '$oficio', '$ruta_archivo', '$observaciones','$ip','$user_id', $reporte_id)";

        
        $resultado = @pg_query($conexion, $incidencias_insertar_sql);

        if (!$resultado) {
            throw new Exception("Error en la consulta: " . pg_last_error($conexion));
        }

        pg_query($conexion,"COMMIT");
        $json['success'] = true;


        } catch (Exception $e) {
        pg_query($conexion, "ROLLBACK");
        $json['error'] = $e->getMessage();
    }
    return $json;
  
}
header('Content-Type: application/json');
echo json_encode(insertarRespuesta($conexion));
















