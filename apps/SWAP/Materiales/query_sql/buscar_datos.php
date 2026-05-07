<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

function respuesta($code, $data) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

try {
    $conexion = Database::conectar();

    if (!$conexion) {
        respuesta(500, ['error' => 'Error de conexión']);
    }

    $folio = strtoupper(trim($_GET['folio_material'] ?? ''));

    if (!$folio) {
        respuesta(400, ['error' => 'Folio vacío']);
    }

    $sql = "SELECT 
        c.folio_material,
        c.descripcion_material,
        c.id_unidad_material,
        c.id_categoria_material,
        c.adscripcion_modulo,
        c.stock_actual,

        COALESCE(ult_salida.estado, ult_entrada.estado) AS id_estado_material

    FROM control_materiales c

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

    WHERE c.folio_material = $1";

    $res = pg_query_params($conexion, $sql, [$folio]);

    if (!$res) {
        respuesta(500, ['error' => pg_last_error($conexion)]);
    }

    $data = pg_fetch_assoc($res);

    if (!$data) {
        respuesta(404, ['error' => 'Material no encontrado']);
    }

    respuesta(200, $data);

} catch (Exception $e) {
    respuesta(500, ['error' => $e->getMessage()]);
}