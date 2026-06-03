<?php
// Asegúrate de que la ruta a tu clase sea correcta
require(__DIR__ . '/../../conf/conexion.php'); 
header('Content-Type: application/json');

try {
    $db = Database_accidentes::conectar();

    // 1. Consulta para los módulos
    $sql = "SELECT 
                modulo,
                COUNT(id) AS total
            FROM accidentes
            GROUP BY modulo
            ORDER BY modulo;";
    $res = pg_query($db, $sql);
    $rows = pg_fetch_all($res) ?: []; // Si está vacío, devolvemos un array limpio


    $sqlTotal = "SELECT COUNT(id) AS total_general FROM accidentes;";
    $resTotal = pg_query($db, $sqlTotal);
    $totalGeneral = pg_fetch_assoc($resTotal);

    echo json_encode([
        'ok' => true,
        'total_general' => (int)($totalGeneral['total_general'] ?? 0),
        'data' => array_map(function($item) {
            return [
                'modulo' => $item['modulo'],
                'total' => (int)$item['total']
            ];
        }, $rows)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}

?>