<?php
require(__DIR__ . '/../../conf/conexion.php');
header('Content-Type: application/json');

$conexion = Database_accidentes::conectar();

try {

    $sql = "SELECT COUNT(id) AS total_abiertos
            FROM accidentes_estatus
            WHERE estatus_accidente = 1";
    $result = @pg_query($conexion, $sql);
    $row = @pg_fetch_assoc($result);

    echo json_encode([
        'ok' => true,
        'total_abiertos' => $row['total_abiertos']
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}
