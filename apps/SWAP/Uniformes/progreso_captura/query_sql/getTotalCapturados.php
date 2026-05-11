<?php

session_start();

require_once 'funciones.progreso.php';

header('Content-Type: application/json; charset=utf-8');

$conexion = Database::conectar();

if(!$conexion){

    echo json_encode([
        "success" => false,
        "error" => "Error conexión BD"
    ]);

    exit;
}

$modulo_usuario = (int) ($_SESSION['modulo_o'] ?? 0);

$resumen = obtenerResumenCaptura(
    $conexion,
    $modulo_usuario
);

echo json_encode([
    "success" => true,
    "resumen" => $resumen
]);