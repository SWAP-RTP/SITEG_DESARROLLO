<?php
session_start();

$path_url = isset($_SESSION['rootApp']) ? $_SESSION['rootApp'] : '';
require($path_url . 'conexion.html');

header('Content-Type: application/json; charset=UTF-8');

if (!conecta($conexion, $_SESSION['servidor'])) {
  echo json_encode(array('success' => false, 'message' => 'No se pudo conectar a la base de datos', 'data' => array()));
  exit;
}

pg_set_client_encoding($conexion, 'UTF8');

$modulo = 0;
if (isset($_POST['modulo_cve'])) {
  $modulo = (int)$_POST['modulo_cve'];
} elseif (isset($_POST['modulo'])) {
  $modulo = (int)$_POST['modulo'];
}

if ($modulo <= 0) {
  echo json_encode(array('success' => false, 'message' => 'Parámetro "modulo" inválido o faltante.', 'data' => array()));
  exit;
}

$sql = "
  SELECT ruta, origen, destino
  FROM rutas
  WHERE modulo = $1
  ORDER BY ruta DESC, origen DESC, destino DESC
  ";

$params = array($modulo);
$result = pg_query_params($conexion, $sql, $params);

if ($result === false) {
  echo json_encode(array('success' => false, 'message' => 'Error en la consulta: ' . pg_last_error($conexion), 'data' => array()));
  exit;
}

$data = array();
while ($row = pg_fetch_assoc($result)) {
  $ruta    = isset($row['ruta'])    ? trim($row['ruta'])    : '';
  $origen  = isset($row['origen'])  ? trim($row['origen'])  : '';
  $destino = isset($row['destino']) ? trim($row['destino']) : '';
  $texto   = trim($ruta . ' ' . $origen . ' - ' . $destino);

  $data[] = array(
    'ruta'  => $ruta,
    'texto' => $texto
  );
}

echo json_encode(array('success' => true, 'message' => 'OK', 'data' => $data));
