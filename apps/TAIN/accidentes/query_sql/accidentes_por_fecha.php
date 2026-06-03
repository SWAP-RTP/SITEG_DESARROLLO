<?php
require(__DIR__ . '/../../conf/conexion.php');
header('Content-Type: application/json');

$conexion = Database_accidentes::conectar();

try {

    $fecha = isset($_GET['fecha']) ? $_GET['fecha'] : date('Y-m-d');

    $sql = "SELECT COUNT(id) AS total_dia
            FROM accidentes
            WHERE DATE(fecha_accidente) = '$fecha';";
    $result = @pg_query($conexion, $sql);
    $row = @pg_fetch_assoc($result);

    echo json_encode([
        'ok' => true,
        'fecha' => $fecha,
        'total_dia' => (int)$row['total_dia']
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}
