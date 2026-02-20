<?php
require(__DIR__ . '/../../public/conexion2.php');
header('Content-Type: application/json');

$pdo_accidentes = conexionAccidentes();

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
