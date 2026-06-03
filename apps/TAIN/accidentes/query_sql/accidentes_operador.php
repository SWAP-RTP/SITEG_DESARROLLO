<?php
require(__DIR__ . '/../../conf/conexion.php');
header('Content-Type: application/json');

$conexion = Database_accidentes::conectar();

try {

    $sql = "SELECT 
                a.operador_credencial,
                COUNT(a.id) AS total_accidentes,
                tv.nombre_completo
            FROM accidentes a
            LEFT JOIN trab_view tv 
                ON tv.trab_credencial = a.operador_credencial
            GROUP BY a.operador_credencial, tv.nombre_completo
            ORDER BY total_accidentes DESC
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
