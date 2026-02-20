<?php
require(__DIR__ . '/../../public/conexion2.php');
header('Content-Type: application/json');

$pdo_accidentes = conexionAccidentes();

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

    $stmt = $pdo_accidentes->prepare($sql);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

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
