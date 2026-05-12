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

// Listado de catálogo de anomalías
$qry_anomalias = pg_query(
    $conexion,
    "SELECT id, anomalia_clave FROM sgio_catalogo_anomalias ORDER BY anomalia_clave ASC"
);

if (!$qry_anomalias) {
    echo json_encode(array('error' => 'Error en la consulta'));
    pg_close($conexion);
    exit;
}

$json = array();
while ($anomalias = pg_fetch_assoc($qry_anomalias)) {
    $json[] = array(
        'id' => $anomalias['id'],
        'anomalia_clave' => utf8_encode($anomalias['anomalia_clave'])
    );
}

echo json_encode($json);
pg_close($conexion);
