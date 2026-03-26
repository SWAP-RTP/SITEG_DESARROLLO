<?php
session_start();
require_once __DIR__ . '/funciones.registro.php';

header('Content-Type: application/json; charset=utf-8');

// 1. Capturar datos
$input = [
    'puesto_clave'  => $_POST['puesto_clave'] ?? '',
    'genero'        => $_POST['genero'] ?? '',
    'tipo_contrato' => $_POST['tipo_contrato'] ?? ''
];

$conexion = Database::conectar();

if (!$conexion) {
    echo json_encode(["error" => "Error de conexión"]);
    exit;
}
$resultado = obtenerUniformes($conexion, $input);
echo json_encode($resultado);