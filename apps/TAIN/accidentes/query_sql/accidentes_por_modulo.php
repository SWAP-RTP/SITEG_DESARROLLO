<?php
require(__DIR__ . '/../../public/conexion2.php');
header('Content-Type: application/json');

$pdo_accidentes = conexionAccidentes();

try {
    $sql = "SELECT 
                modulo,
                COUNT(id) AS total
            FROM accidentes
            GROUP BY modulo
            ORDER BY modulo;";

    $stmt = $pdo_accidentes->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sqlTotal = "SELECT COUNT(id) AS total_general FROM accidentes;";
    $stmtTotal = $pdo_accidentes->prepare($sqlTotal);
    $stmtTotal->execute();
    $totalGeneral = $stmtTotal->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'ok' => true,
        'total_general' => (int)$totalGeneral['total_general'],
        'data' => $rows
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}
