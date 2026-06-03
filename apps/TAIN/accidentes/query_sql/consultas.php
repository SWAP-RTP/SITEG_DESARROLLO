<?php
require(__DIR__ . '/../../conf/conexion.php');
header('Content-Type: application/json');

$conexion = Database_accidentes::conectar();

try {

    // CONSULTA TOTAL DE ACCIDENTES
    $sql = "SELECT 
                economico,
                operador_credencial,
                modulo,
                COUNT(id) AS total_accidentes
            FROM accidentes
            GROUP BY economico, operador_credencial, modulo
            ORDER BY modulo, economico;";
    $result = @pg_query($conexion, $sql);
    $row = @pg_fetch_assoc($result);

    //JSON
    echo json_encode([
        'ok'   => true,
        'data' => $row
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'ok'    => false,
        'error' => $e->getMessage()
    ]);
}
