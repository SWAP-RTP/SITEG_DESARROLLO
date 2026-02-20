<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../public/conexion.php';

$conexion = null;

if (!conecta($conexion, $localhost)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

$sql = "SELECT 
        ruta_id,
        SUM(monto) AS total_recaudado
    FROM tabla_recaudacion
    GROUP BY ruta_id
    ORDER BY total_recaudado ASC
    LIMIT 10
";

$result = pg_query($conexion, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => pg_last_error($conexion)]);
    exit;
}

$labels = [];
$data   = [];

while ($row = pg_fetch_assoc($result)) {
    $labels[] = $row['ruta_id'];
    $data[]   = (float)$row['total_recaudado'];
}

echo json_encode([
    'labels' => $labels,
    'data'   => $data
]);
