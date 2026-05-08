<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

function guardarSalidaMaterial() {

    $conexion = Database::conectar();

    if (!$conexion) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'No se pudo conectar a la base de datos.'
        ]);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    # Validar campos
    $folio = trim($data['folio_material'] ?? '');
    $cantidad = $data['cantidad_material_salida'] ?? null;

    if ($folio === '' || $cantidad === null || $cantidad === '') {
        echo json_encode([
            'status' => 'error',
            'message' => 'Folio y cantidad son obligatorios.'
        ]);
        exit;
    }

    $cantidad = (int)$cantidad;

    if ($cantidad <= 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Cantidad inválida.'
        ]);
        exit;
    }

    // Consultamos el stock para validar si hay suficiente antes de intentar la salida
    $sql_stock = "SELECT stock_actual FROM control_materiales WHERE folio_material = $1";
    $res_stock = pg_query_params($conexion, $sql_stock, [$folio]);

    if (!$res_stock || pg_num_rows($res_stock) === 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Material no encontrado.'
        ]);
        exit;
    }

    $row = pg_fetch_assoc($res_stock);
    $stock_actual = (int)$row['stock_actual'];

    if ($cantidad > $stock_actual) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Stock insuficiente.'
        ]);
        exit;
    }

    $descripcion = trim($data['descripcion_material_salida'] ?? '');
    $estado = $data['id_estado_material_salida'] ?? null;
    $adscripcion = trim($data['adscripcion_modulo'] ?? '');

    pg_query($conexion, "BEGIN");

    # Insertar salida
    $sql = "INSERT INTO salidas_materiales 
        (folio_material, descripcion_material_salida, id_estado_material_salida, cantidad_material_salida, adscripcion_modulo)
        VALUES ($1, $2, $3, $4, $5)";

    $params = [
        $folio,
        $descripcion,
        $estado,
        $cantidad,
        $adscripcion
    ];

    $result = pg_query_params($conexion, $sql, $params);

    if (!$result) {
        $pg_error = pg_last_error($conexion);
        pg_query($conexion, "ROLLBACK");
        echo json_encode([
            'status'  => 'error',
            'message' => 'Error al registrar salida: ' . $pg_error
        ]);
        exit;
    }

    /* BLOQUE COMENTADO PARA EVITAR DUPLICIDAD:
       Al insertar en 'salidas_materiales', el Trigger 'tr_salida_material_stock' 
       de la base de datos restará automáticamente el stock.

    $sql_update = "UPDATE control_materiales 
                   SET stock_actual = stock_actual - $1 
                   WHERE folio_material = $2";

    $update = pg_query_params($conexion, $sql_update, [$cantidad, $folio]);

    if (!$update) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al actualizar stock'
        ]);
        exit;
    }
    */

    pg_query($conexion, "COMMIT");

    echo json_encode([
        'status' => 'ok',
        'message' => 'Salida registrada correctamente',
        'folio' => $folio,
        // Calculamos la diferencia visualmente para el mensaje
        'stock_restante' => $stock_actual - $cantidad 
    ]);

    pg_close($conexion);
}

guardarSalidaMaterial();