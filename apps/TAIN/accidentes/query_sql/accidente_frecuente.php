<?php
require(__DIR__ . '/../../conf/conexion.php');
header('Content-Type: application/json');

$conexion = Database_accidentes::conectar();

try {

    $sql = "SELECT 
                ta.descripcion,
                COUNT(ad.id) AS total
            FROM accidentes_detalles ad
            INNER JOIN tipo_accidente ta 
                ON ta.id = ad.tipo_accidente_id
            WHERE ad.estatus = 1
            GROUP BY ta.descripcion
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
