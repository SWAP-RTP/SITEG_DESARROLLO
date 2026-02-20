<?php
require(__DIR__ . '/../../public/conexion2.php');
header('Content-Type: application/json');

$pdo_accidentes = conexionAccidentes();

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

    $stmt = $pdo_accidentes->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //JSON
    echo json_encode([
        'ok'   => true,
        'data' => $rows
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'ok'    => false,
        'error' => $e->getMessage()
    ]);
}
