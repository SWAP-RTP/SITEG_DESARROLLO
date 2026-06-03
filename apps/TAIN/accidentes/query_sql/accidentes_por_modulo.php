<?php
// Asegúrate de que la ruta a tu clase sea correcta
require(__DIR__ . '/../../conf/conexion.php'); 
header('Content-Type: application/json');

try {

$conexion = Database_accidentes::conectar();

// 1. Consulta para los módulos
$sql = "SELECT modulo, COUNT(id) AS total
        FROM accidentes
        GROUP BY modulo
        ORDER BY modulo;";
$res = @pg_query($conexion, $sql);

$data = array();
while($rows = @pg_fetch_assoc($res)){
    $data[] = array(
        "modulo" => $rows['modulo'],
        "total" => (int)$rows['total']
    );
}

echo json_encode([
    'ok' => true,
    'data' => $data
]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}

?>