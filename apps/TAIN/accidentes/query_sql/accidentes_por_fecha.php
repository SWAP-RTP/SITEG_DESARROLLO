<?php
require(__DIR__ . '/../../public/conexion2.php');
header('Content-Type: application/json');

$pdo_accidentes = conexionAccidentes();

try {

    $fecha = isset($_GET['fecha']) ? $_GET['fecha'] : date('Y-m-d');

$sql = "SELECT COUNT(id) AS total_dia
        FROM accidentes
        WHERE DATE(fecha_accidente) = :fecha;";

    $stmt = $pdo_accidentes->prepare($sql);
    $stmt->bindParam(':fecha', $fecha);
    $stmt->execute();

    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'ok' => true,
        'fecha' => $fecha,
        'total_dia' => (int)$resultado['total_dia']
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}
