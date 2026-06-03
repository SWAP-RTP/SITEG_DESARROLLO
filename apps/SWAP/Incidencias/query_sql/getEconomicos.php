<?php
session_start();

// Ruta y conexión
$path_url = isset($_SESSION['rootApp']) ? $_SESSION['rootApp'] : '';
require($path_url . 'conexion.html');

header('Content-Type: application/json; charset=UTF-8');

if (!conecta($conexion, $_SESSION['servidor'])) {
    echo json_encode(array('error' => 'No se pudo conectar a la base de datos'));
    exit;
}

$modulo = isset($_POST['modulo_cve'])
    ? (int)$_POST['modulo_cve']
    : (isset($_POST['modulo']) ? (int)$_POST['modulo'] : 0);

if ($modulo <= 0) {
    echo json_encode(array('message' => 'Parámetro "modulo" inválido o faltante.'));
    exit;
}

/*
  - Ambas SELECT devuelven la MISMA columna (alias pv_eco).
  - Usamos UNION (no ALL) para evitar duplicados.
  - El ORDER BY va al final (sobre el conjunto unido).
*/
$sql = "
        SELECT pv_eco AS pv_eco
        FROM pv
        WHERE pv_estatus = 1
          AND pv_modulo  = $1
    ORDER BY pv_eco
";

$params = array($modulo);
$result = pg_query_params($conexion, $sql, $params);

if ($result === false) {
    echo json_encode(array('message' => 'Error en la consulta: ' . pg_last_error($conexion)));
    exit;
}

$data = array();
while ($row = pg_fetch_assoc($result)) {
    $data[] = array('pv_eco' => (int)$row['pv_eco']);
}

echo json_encode(array(
    'success' => true,
    'message' => 'OK',
    'data'    => $data
));
