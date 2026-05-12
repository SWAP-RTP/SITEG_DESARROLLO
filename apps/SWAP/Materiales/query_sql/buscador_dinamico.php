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
        respuesta(500, ['error' => 'Error de conexión a la base de datos']);
    }

    // Recibimos el término de búsqueda (puede ser parte del folio o de la descripción)
    $termino = trim($_GET['termino'] ?? '');

    if ($termino === '') {
        // Si no hay término, obtenemos todos los materiales
        $sql = "SELECT 
                    folio_material, 
                    UPPER(descripcion_material) as descripcion_material, 
                    id_unidad_material, 
                    id_categoria_material, 
                    UPPER(adscripcion_modulo) as adscripcion_modulo,
                    stock_actual
                FROM control_materiales 
                ORDER BY descripcion_material ASC";
        $res = pg_query($conexion, $sql);
    } else {
        // Si hay término, filtramos
        $sql = "SELECT 
                    folio_material, 
                    UPPER(descripcion_material) as descripcion_material, 
                    id_unidad_material, 
                    id_categoria_material, 
                    UPPER(adscripcion_modulo) as adscripcion_modulo,
                    stock_actual
                FROM control_materiales 
                WHERE (folio_material ILIKE $1 OR descripcion_material ILIKE $1)
                ORDER BY descripcion_material ASC
                LIMIT 10";
        $res = pg_query_params($conexion, $sql, ["%$termino%"]);
    }

    if (!$res) {
        respuesta(500, ['error' => pg_last_error($conexion)]);
    }

    // Obtenemos todos los resultados encontrados
    $resultados = pg_fetch_all($res);
    
    // Si no hay resultados, pg_fetch_all devuelve false, lo convertimos a un array vacío
    respuesta(200, $resultados ?: []);

} catch (Exception $e) {
    respuesta(500, ['error' => $e->getMessage()]);
}