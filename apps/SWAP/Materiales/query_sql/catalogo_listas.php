<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

try {
    $conexion = Database::conectar();
    if (!$conexion) {
        throw new Exception('No se pudo establecer conexion con la base de datos.');
    }

    $catalogos = [];

    // 1. Obtener Categorías
    $sqlCategoria = "SELECT id_categoria_material, descripcion_categoria_material FROM categorias_materiales ORDER BY id_categoria_material ASC";
    $resCategoria = pg_query($conexion, $sqlCategoria);
    if ($resCategoria === false) {
        throw new Exception('Error al obtener categorias: ' . pg_last_error($conexion));
    }
    $catalogos['categorias'] = pg_fetch_all($resCategoria) ?: [];

    // 2. Obtener Estados
    $sqlEstados = "SELECT id_estado_material, descripcion_estado_material FROM estados_materiales ORDER BY descripcion_estado_material";
    $resEstados = pg_query($conexion, $sqlEstados);
    if ($resEstados === false) {
        throw new Exception('Error al obtener estados: ' . pg_last_error($conexion));
    }
    $catalogos['estados'] = pg_fetch_all($resEstados) ?: [];

    // 3. Obtener Unidades
    $sqlUnidades = "SELECT id_unidad_material, descripcion_unidad_material FROM unidades_materiales ORDER BY descripcion_unidad_material ASC";
    $resUnidades = pg_query($conexion, $sqlUnidades);
    if ($resUnidades === false) {
        throw new Exception('Error al obtener unidades: ' . pg_last_error($conexion));
    }
    $catalogos['unidades'] = pg_fetch_all($resUnidades) ?: [];

    pg_close($conexion);
    echo json_encode($catalogos);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}