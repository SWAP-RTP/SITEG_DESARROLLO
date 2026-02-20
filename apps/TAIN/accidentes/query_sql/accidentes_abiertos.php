<?php
require(__DIR__ . '/../../public/conexion2.php');
header('Content-Type: application/json');

$pdo_accidentes = conexionAccidentes();

try {

    $sql = "SELECT COUNT(id) AS total_abiertos
            FROM accidentes_estatus
            WHERE estatus_accidente = 1";

    $stmt = $pdo_accidentes->prepare($sql);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

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
