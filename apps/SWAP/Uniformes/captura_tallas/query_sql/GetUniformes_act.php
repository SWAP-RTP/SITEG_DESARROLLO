<?php
session_start();
require_once __DIR__ . '/funciones.solicitud.php';

header('Content-Type: application/json; charset=utf-8');

$conexion = Database::conectar();

    if (!$conexion) {
        return false;
    }

$id = $_POST['id'] ?? null;

if(!$id){

    echo json_encode([
        "ok" => false,
        "mensaje" => "ID requerido"
    ]);

    exit;
}

$data = obtenerUniformesActualizar($conexion, (int)$id);

echo json_encode([
    "ok" => true,
    "detalles" => $data
]);