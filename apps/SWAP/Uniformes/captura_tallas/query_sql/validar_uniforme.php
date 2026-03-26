<?php

require_once __DIR__ . '/funciones.registro.php';

header('Content-Type: application/json; charset=utf-8');

$response = ["registro" => false];

$credencial = isset($_GET['credencial']) ? trim($_GET['credencial']) : '';

if ($credencial === '') {
    echo json_encode($response);
    exit;
}

$conexion =  Database::conectar();

if (!$conexion) {
    echo json_encode(["error" => "Error de conexión"]);
    exit;
}

// Llamar función real
$resultado = validarUniforme($conexion, $credencial);

echo json_encode($resultado);