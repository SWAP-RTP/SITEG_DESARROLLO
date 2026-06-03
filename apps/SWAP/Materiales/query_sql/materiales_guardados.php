<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'No se recibieron datos']);
    exit;
}

/**
 * DETERMINACIÓN DE LA OPERACIÓN
 * Se recomienda enviar un campo 'tipo' desde JS, pero mantenemos tu lógica
 * con una validación más estricta para evitar confusiones.
 */
$cantidad = isset($data['cantidad']) ? (int)$data['cantidad'] : 0;
$esEntrada = isset($data['estado']) && !empty($data['folio']) && $cantidad > 0;
$esSalida = !isset($data['estado']) && !empty($data['folio']) && $cantidad > 0;

if ($esEntrada) {
    guardarEntradaMaterial($data);
} elseif ($esSalida) {
    guardarSalidaMaterial($data);
} else {
    echo json_encode(['status' => 'warning', 'message' => 'Datos insuficientes o inválidos']);
}
exit;

function guardarEntradaMaterial($data) {
    $conexion = Database::conectar();
    if (!$conexion) {
        echo json_encode(['status' => 'error', 'message' => 'Error de conexión']);
        exit;
    }

    $folio = trim($data['folio']);
    $cantidad = (int)$data['cantidad'];
    $descripcion = mb_strtoupper(trim($data['descripcion']), 'UTF-8');
    $adscripcion = mb_strtoupper(trim($data['adscripcion'] ?? 'CENTRAL'), 'UTF-8');

    pg_query($conexion, "BEGIN");

    // 1. Verificar existencia con bloqueo de fila si ya existe
    $check = pg_query_params($conexion, "SELECT 1 FROM control_materiales WHERE folio_material = $1 FOR UPDATE", [$folio]);
    
    if (pg_num_rows($check) === 0) {
        // Crear material si no existe
        $insertMat = pg_query_params($conexion, 
            "INSERT INTO control_materiales (folio_material, descripcion_material, id_unidad_material, id_categoria_material, adscripcion_modulo, stock_actual) 
             VALUES ($1, $2, $3, $4, $5, 0)",
            [$folio, $descripcion, $data['unidad'], $data['id_categoria'], $adscripcion]
        );

        if (!$insertMat) {
            pg_query($conexion, "ROLLBACK");
            echo json_encode(['status' => 'error', 'message' => 'Error al crear base del material']);
            exit;
        }
    }

    // 2. Registrar el movimiento de entrada
    $insertMov = pg_query_params($conexion, 
        "INSERT INTO entradas_materiales (folio_material, descripcion_material_entrada, id_estado_material_entrada, cantidad_material_entrada, adscripcion_modulo) 
         VALUES ($1, $2, $3, $4, $5)",
        [$folio, $descripcion, $data['estado'], $cantidad, $adscripcion]
    );

    if (!$insertMov) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode(['status' => 'error', 'message' => 'Error al registrar movimiento']);
        exit;
    }

    // 3. Actualizar Stock (Atómico)
    pg_query_params($conexion, 
        "UPDATE control_materiales SET stock_actual = COALESCE(stock_actual, 0) + $1 WHERE folio_material = $2",
        [$cantidad, $folio]
    );

    pg_query($conexion, "COMMIT");
    echo json_encode(['status' => 'ok', 'message' => 'Entrada registrada correctamente', 'folio' => $folio]);
}

function guardarSalidaMaterial($data) {
    $conexion = Database::conectar();
    if (!$conexion) {
        echo json_encode(['status' => 'error', 'message' => 'Error de conexión']);
        exit;
    }

    $folio = trim($data['folio']);
    $cantidad = (int)$data['cantidad'];
    $descripcion = mb_strtoupper(trim($data['descripcion']), 'UTF-8');
    $adscripcion = mb_strtoupper(trim($data['adscripcion'] ?? 'CENTRAL'), 'UTF-8');

    pg_query($conexion, "BEGIN");

    // 1. Obtener stock y BLOQUEAR la fila para evitar que otra persona saque material al mismo tiempo
    $res = pg_query_params($conexion, "SELECT stock_actual FROM control_materiales WHERE folio_material = $1 FOR UPDATE", [$folio]);
    $row = pg_fetch_assoc($res);

    if (!$row) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode(['status' => 'error', 'message' => 'El material no existe en el catálogo']);
        exit;
    }

    $stockActual = (int)$row['stock_actual'];

    // 2. Validar stock suficiente
    if ($cantidad > $stockActual) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode(['status' => 'error', 'message' => "Stock insuficiente. Disponible: $stockActual"]);
        exit;
    }

    // 3. Registrar movimiento de salida
    $insertMov = pg_query_params($conexion, 
        "INSERT INTO salidas_materiales (folio_material, descripcion_material_salida, id_estado_material_salida, cantidad_material_salida, adscripcion_modulo) 
         VALUES ($1, $2, $3, $4, $5)",
        [$folio, $descripcion, $data['id_estado'] ?? 1, $cantidad, $adscripcion]
    );

    if (!$insertMov) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode(['status' => 'error', 'message' => 'Error al registrar salida']);
        exit;
    }

    // 4. Restar Stock con validación extra en el WHERE (doble seguridad)
    $update = pg_query_params($conexion, 
        "UPDATE control_materiales SET stock_actual = stock_actual - $1 WHERE folio_material = $2 AND stock_actual >= $1",
        [$cantidad, $folio]
    );

    if (pg_affected_rows($update) === 0) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode(['status' => 'error', 'message' => 'Error crítico: El stock cambió durante la operación']);
        exit;
    }

    pg_query($conexion, "COMMIT");
    echo json_encode(['status' => 'ok', 'message' => 'Salida registrada correctamente']);
}