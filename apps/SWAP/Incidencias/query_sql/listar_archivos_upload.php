<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');

// Obtener el módulo del registro específico (no del usuario)
$modulo_registro = isset($_POST['modulo']) ? $_POST['modulo'] : null;

// Verificamos que se haya enviado el módulo
if ($modulo_registro === null) {
    echo json_encode(array("exito" => false, "error" => "No se ha especificado el módulo del registro"));
    exit;
}

// Construir la ruta de la carpeta específica del módulo del registro
$carpeta = $_SERVER['DOCUMENT_ROOT'] . '/Incidencias/uploads/modulo_' . $modulo_registro . '/';
$archivos = array();

if (is_dir($carpeta)) {
    $files = scandir($carpeta);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            $archivos[] = $file;
        }
    }
    echo json_encode($archivos);
} else {
    echo json_encode(array("exito" => false, "error" => "La carpeta del módulo $modulo_registro no existe"));
}
?>