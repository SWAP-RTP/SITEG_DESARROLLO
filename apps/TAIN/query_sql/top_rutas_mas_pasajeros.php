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
        COUNT(*) AS total_pasajeros,
        SUM(CASE WHEN es_gratuidad = true THEN 1 ELSE 0 END) AS total_gratuidades
    FROM tabla_recaudacion
    GROUP BY ruta_id
    ORDER BY total_pasajeros DESC
    LIMIT 10
";

$result = pg_query($conexion, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => pg_last_error($conexion)]);
    exit;
}

$labels        = [];
$pasajeros     = [];
$gratuidades   = [];

while ($row = pg_fetch_assoc($result)) {
    $labels[]      = $row['ruta_id'];
    $pasajeros[]   = (int)$row['total_pasajeros'];
    $gratuidades[] = (int)$row['total_gratuidades'];
}

echo json_encode([
    'labels'       => $labels,
    'pasajeros'    => $pasajeros,
    'gratuidades'  => $gratuidades
]);
