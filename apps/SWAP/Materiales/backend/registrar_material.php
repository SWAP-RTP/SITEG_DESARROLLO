<?php

require_once __DIR__ . '/material.repository.php';


header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Datos inválidos"
    ]);
    exit;
}

$resultado = insertarMaterial($data);

if ($resultado === true) {
    echo json_encode([
        "ok" => true,
        "mensaje" => "Material registrado correctamente"
    ]);
} elseif ($resultado === "codigo_duplicado") {
    echo json_encode([
        "ok" => false,
        "mensaje" => "¡Pieza ya registrada!"
    ]);
} elseif ($resultado === "credencial_invalida") {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Credencial no válida. No se puede registrar el material."
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error al registrar material"
    ]);
}