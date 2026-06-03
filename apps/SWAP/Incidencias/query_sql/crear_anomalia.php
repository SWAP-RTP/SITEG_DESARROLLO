<?php
session_start();

// Ruta y conexión
$path_url = isset($_SESSION['rootApp']) ? $_SESSION['rootApp'] : '';
require($path_url . 'conexion.html');

header('Content-Type: application/json; charset=UTF-8');

if (!conecta($conexion, $_SESSION['servidor'])) {
    echo json_encode(array('success' => false, 'message' => 'No se pudo conectar a la base de datos'));
    exit;
}

$anomalia_clave = isset($_POST['anomalia_clave']) ? trim($_POST['anomalia_clave']) : '';
$descripcion    = isset($_POST['descripcion']) ? trim($_POST['descripcion']) : '';

if ($anomalia_clave === '' || $descripcion === '') {
    echo json_encode(array('success' => false, 'message' => 'Faltan datos obligatorios'));
    pg_close($conexion);
    exit;
}

try {
    // 1) INSERT 
    $sql_insert = "INSERT INTO sgio_catalogo_anomalias (anomalia_clave, descripcion)
                   VALUES ($1, $2)";
    $res = pg_query_params($conexion, $sql_insert, array($anomalia_clave, $descripcion));

    if (!$res) {
        $error = pg_last_error($conexion);
        if (stripos($error, '23505') !== false) {
            echo json_encode(array('success' => false, 'message' => 'La anomalía ya existe en el catálogo.'));
        } else {
            echo json_encode(array('success' => false, 'message' => 'Error al insertar: ' . $error));
        }
        pg_close($conexion);
        exit;
    }

    // 2) OBTENER ID con currval() de la secuencia del SERIAL
    $sql_seq = "SELECT currval(pg_get_serial_sequence('sgio_catalogo_anomalias','id')) AS id";
    $res_seq = pg_query($conexion, $sql_seq);

    $id_nuevo = null;
    if ($res_seq) {
        $row_seq = pg_fetch_assoc($res_seq);
        if ($row_seq && isset($row_seq['id'])) {
            $id_nuevo = $row_seq['id'];
        }
    }

    if ($id_nuevo === null) {
        $sql_sel = "SELECT id FROM sgio_catalogo_anomalias WHERE anomalia_clave = $1 ORDER BY id DESC LIMIT 1";
        $res_sel = pg_query_params($conexion, $sql_sel, array($anomalia_clave));
        if ($res_sel) {
            $row_sel = pg_fetch_assoc($res_sel);
            if ($row_sel && isset($row_sel['id'])) {
                $id_nuevo = $row_sel['id'];
            }
        }
    }

    echo json_encode(array(
        'success' => true,
        'id' => $id_nuevo,
        'anomalia_clave' => $anomalia_clave
    ));
    pg_close($conexion);

} catch (Exception $e) {
    echo json_encode(array('success' => false, 'message' => 'Excepción: ' . $e->getMessage()));
    pg_close($conexion);
}
