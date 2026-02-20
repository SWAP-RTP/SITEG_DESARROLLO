<?php
require(__DIR__ . '/../../public/conexion2.php');
header('Content-Type: application/json');

$pdo_accidentes = conexionAccidentes();

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