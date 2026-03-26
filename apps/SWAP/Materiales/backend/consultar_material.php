<?php
require_once __DIR__ . '/material.repository.php';

header('Content-Type: application/json');

$materiales = consultarMateriales();

if ($materiales !== false) {
    echo json_encode([
        "ok" => true,
        "materiales" => $materiales
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "materiales" => []
    ]);
}