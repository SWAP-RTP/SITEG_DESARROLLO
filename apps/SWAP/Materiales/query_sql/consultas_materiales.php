<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

$conexion = Database::conectar();

if (!$conexion) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'No se pudo conectar a la base de datos.'
    ]);
    exit;
}

$tipo = $_GET['tipo'] ?? '';

// =================== ENTRADAS ===================
if ($tipo === 'entradas') {

    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = max(1, intval($_GET['limit'] ?? 20));
    $offset = ($page - 1) * $limit;

    #hace la busqueda 
    $busqueda = $_GET['busqueda'] ?? '';
    $where = '';
    if ($busqueda !== '') {
        $busqueda = pg_escape_string($conexion, $busqueda);
        $where = "WHERE em.folio_material ILIKE '%$busqueda%' OR em.descripcion_material_entrada ILIKE '%$busqueda%'";
    }



    $sqlTotal = "SELECT COUNT(*) AS total FROM entradas_materiales em $where";
    $resTotal = pg_query($conexion, $sqlTotal);
    $rowTotal = pg_fetch_assoc($resTotal);
    $total = intval($rowTotal['total'] ?? 0);

    $sql = "
        SELECT 
            em.folio_material,
            em.descripcion_material_entrada,
            um.descripcion_unidad_material AS unidad,
            est.descripcion_estado_material AS estado,
            em.cantidad_material_entrada AS cantidad,
            TO_CHAR(em.fecha_registro_entrada, 'DD/MM/YYYY HH24:MI') AS fecha_registro
        FROM entradas_materiales em
        INNER JOIN control_materiales cm 
            ON em.folio_material = cm.folio_material
        INNER JOIN unidades_materiales um 
            ON cm.id_unidad_material = um.id_unidad_material
        INNER JOIN estados_materiales est 
            ON em.id_estado_material_entrada = est.id_estado_material
            $where
        ORDER BY em.fecha_registro_entrada DESC
        LIMIT $limit OFFSET $offset
    ";

    $res = pg_query($conexion, $sql);

    $datos = [];

    if ($res) {
        while ($row = pg_fetch_assoc($res)) {
            $datos[] = $row;
        }
    }

    echo json_encode([
        'status' => 'ok',
        'datos' => $datos,
        'total' => $total,
        #meto la paginación para  el frontend
        'actualPagina' => $page,
        'totalPaginas' => $limit > 0 ? ceil($total / $limit) : 1
    ]);

    pg_close($conexion);
    exit;
}


// =================== SALIDAS ===================
if ($tipo === 'salidas') {

    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = max(1, intval($_GET['limit'] ?? 20));
    $offset = ($page - 1) * $limit;

    #hace la busqueda
    $busqueda = $_GET['busqueda'] ?? '';
    $where = '';
    if ($busqueda !== '') {
        $busqueda = pg_escape_string($conexion, $busqueda);
        $where = "WHERE sm.folio_material ILIKE '%$busqueda%' OR sm.descripcion_material_salida ILIKE '%$busqueda%'";
    }


    $sqlTotal = "SELECT COUNT(*) AS total FROM salidas_materiales sm $where";
    $resTotal = pg_query($conexion, $sqlTotal);
    $rowTotal = pg_fetch_assoc($resTotal);
    $total = intval($rowTotal['total'] ?? 0);

    $sql = "
        SELECT 
            sm.folio_material,
            sm.descripcion_material_salida,
            um.descripcion_unidad_material AS unidad,
            est.descripcion_estado_material AS estado,
            sm.cantidad_material_salida AS cantidad,
            TO_CHAR(sm.fecha_registro_salida, 'DD/MM/YYYY HH24:MI') AS fecha_registro
        FROM salidas_materiales sm
        INNER JOIN control_materiales cm 
            ON sm.folio_material = cm.folio_material
        INNER JOIN unidades_materiales um 
            ON cm.id_unidad_material = um.id_unidad_material
        INNER JOIN estados_materiales est 
            ON sm.id_estado_material_salida = est.id_estado_material
        $where
        ORDER BY sm.fecha_registro_salida DESC
        LIMIT $limit OFFSET $offset
    ";

    $res = pg_query($conexion, $sql);

    $datos = [];

    if ($res) {
        while ($row = pg_fetch_assoc($res)) {
            $datos[] = $row;
        }
    }

    echo json_encode([
        'status' => 'ok',
        'datos' => $datos,
        'total' => $total,
        'actualPagina' => $page,
        'totalPaginas' => $limit > 0 ? ceil($total / $limit) : 1
    ]);

    pg_close($conexion);
    exit;
}


// =================== ÚLTIMO FOLIO ===================
if ($tipo === 'folio') {

    $sql = "SELECT folio_material 
            FROM control_materiales 
            ORDER BY folio_material DESC 
            LIMIT 1";

    $res = pg_query($conexion, $sql);
    $row = pg_fetch_assoc($res);

    echo json_encode([
        'status' => 'ok',
        'folio_material' => $row['folio_material'] ?? null
    ]);

    pg_close($conexion);
    exit;
}


// =================== FALLBACK ===================
echo json_encode([
    'status' => 'error',
    'message' => 'Tipo de consulta no válido'
]);

pg_close($conexion);
