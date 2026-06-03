<?php
require(__DIR__ . '/../../conf/conexion.php');
header('Content-Type: application/json');

$conexion = Database_accidentes::conectar();

try {

    $sql = "SELECT 
                al.descripcion,
                COUNT(a.id) AS total
            FROM accidentes a
            INNER JOIN alcaldias al 
                ON al.id = a.alcaldia_id
            GROUP BY al.id, al.descripcion
            ORDER BY total DESC
            LIMIT 1";
    $result = @pg_query($conexion, $sql);
    $row = @pg_fetch_assoc($result);

    echo json_encode([
        'ok' => true,
        'data' => $row
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}