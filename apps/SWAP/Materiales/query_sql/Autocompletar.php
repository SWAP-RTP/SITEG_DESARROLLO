<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

$conexion = Database::conectar();

$folio = $_GET['folio'] ?? '';

if (!$folio) {
    echo json_encode(['status' => 'error', 'message' => 'Folio requerido']);
    exit;
}

$sql = "
SELECT 
    c.folio_material,
    c.descripcion_material,
    c.id_unidad_material,
    c.id_categoria_material,
    c.adscripcion_modulo,

    -- STOCK REAL
    COALESCE(e.total_entrada,0) - COALESCE(s.total_salida,0) AS stock_actual,

    -- ESTADO REAL
    COALESCE(ult_salida.estado, ult_entrada.estado) AS id_estado_material

FROM control_materiales c

LEFT JOIN (
    SELECT folio_material, SUM(cantidad_material_entrada) AS total_entrada
    FROM entradas_materiales
    GROUP BY folio_material
) e ON c.folio_material = e.folio_material

LEFT JOIN (
    SELECT folio_material, SUM(cantidad_material_salida) AS total_salida
    FROM salidas_materiales
    GROUP BY folio_material
) s ON c.folio_material = s.folio_material

LEFT JOIN LATERAL (
    SELECT id_estado_material_entrada AS estado
    FROM entradas_materiales
    WHERE folio_material = c.folio_material
    ORDER BY fecha_registro_entrada DESC
    LIMIT 1
) ult_entrada ON true

LEFT JOIN LATERAL (
    SELECT id_estado_material_salida AS estado
    FROM salidas_materiales
    WHERE folio_material = c.folio_material
    ORDER BY fecha_registro_salida DESC
    LIMIT 1
) ult_salida ON true

WHERE c.folio_material = $1
LIMIT 1
";
$res = pg_query_params($conexion, $sql, [$folio]);
$datos = pg_fetch_assoc($res);

echo json_encode([
    'status' => 'ok',
    'datos' => $datos
]);