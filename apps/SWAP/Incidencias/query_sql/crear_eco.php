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

// ===== Variables =====
$eco         = isset($_POST['eco']) ? (int)trim($_POST['eco']) : 0;
$modulo             = 0;
if (isset($_POST['modulo'])) {
    $modulo = (int)$_POST['modulo'];
} elseif (isset($_SESSION['modulo_o'])) {
    $modulo = (int)$_SESSION['modulo_o'];
}

if ($eco <= 0 || $modulo <= 0) {
    echo json_encode(array('success' => false, 'message' => 'Faltan datos obligatorios (clave, trayecto, descripción o módulo).'));
    pg_close($conexion);
    exit;
}

try {
    // Insertar con módulo
    $sql_insert = "INSERT INTO sgio_economicos (eco, modulo) VALUES ($1, $2)";
    $params_insert = array($eco, $modulo);
    $res = pg_query_params($conexion, $sql_insert, $params_insert);

    if (!$res) {
        $error = pg_last_error($conexion);
        if (stripos($error, '23505') !== false) {
            echo json_encode(array('success' => false, 'message' => 'El economico ya existe en el catálogo.'));
        } else {
            echo json_encode(array('success' => false, 'message' => 'Error al insertar: ' . $error));
        }
        pg_close($conexion);
        exit;
    }

    // Obtener el ID recién insertado
    $sql_seq = "SELECT currval(pg_get_serial_sequence('sgio_economicos','id')) AS id";
    $res_seq = pg_query($conexion, $sql_seq);

    $id_nuevo = null;
    if ($res_seq) {
        $row_seq = pg_fetch_assoc($res_seq);
        if ($row_seq && isset($row_seq['id'])) {
            $id_nuevo = (int)$row_seq['id'];
        }
    }

    if ($id_nuevo === null) {
        $sql_sel = "SELECT id FROM sgio_economicos WHERE eco = $1 AND modulo = $2 ORDER BY id DESC LIMIT 1";
        $params_sel = array($eco, $modulo);
        $res_sel = pg_query_params($conexion, $sql_sel, $params_sel);
        if ($res_sel) {
            $row_sel = pg_fetch_assoc($res_sel);
            if ($row_sel && isset($row_sel['id'])) {
                $id_nuevo = (int)$row_sel['id'];
            }
        }
    }

    echo json_encode(array(
        'success'            => true,
        'id'                 => $id_nuevo,
        'eco'                => $eco,
        'modulo'             => $modulo
    ));
    pg_close($conexion);

} catch (Exception $e) {
    echo json_encode(array('success' => false, 'message' => 'Excepción: ' . $e->getMessage()));
    pg_close($conexion);
}
?>
