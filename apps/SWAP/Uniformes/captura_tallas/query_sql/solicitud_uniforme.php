<?php
session_start();
require_once __DIR__ . '/funciones.solicitud.php';

header('Content-Type: application/json; charset=utf-8');

// Validar datos
$id_trabajador = $_POST['id_trabajador'] ?? null;
$observaciones = $_POST['observaciones'] ?? '';
// $usuario = $_SESSION['usr_id'] ?? null;
$usuario = 1; // Temporal 

// if (!$id_trabajador || !$usuario)
if (!$id_trabajador || !$usuario) {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Faltan datos"
    ]);
    exit;
}

// Ejecutar lógica
$resultado = crearSolicitud(
    (int)$id_trabajador,
    trim($observaciones),
    $usuario
);

// Respuestas 
if ($resultado === "existe") {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Ya existe una solicitud activa"
    ]);
    exit;
}

if ($resultado === true) {
    echo json_encode([
        "ok" => true,
        "mensaje" => "Solicitud enviada correctamente"
    ]);
    exit;
}

// Error general
echo json_encode([
    "ok" => false,
    "mensaje" => "Error al registrar la solicitud"
]);