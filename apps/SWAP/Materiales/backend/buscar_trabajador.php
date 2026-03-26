<?php
require_once __DIR__ . '/material.repository.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id_credencial'])) {
    echo json_encode(['ok' => false, 'nombre' => '']);
    exit;
}

$nombre = buscarTrabajador($data['id_credencial']);

if ($nombre) {
    echo json_encode(['ok' => true, 'nombre' => $nombre]);
} else {
    echo json_encode(['ok' => false, 'nombre' => '']);
}