<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

$path_url = $_SESSION['rootApp'];
require($path_url . 'conexion.html');

if (!conecta($conexion, $_SESSION['servidor'])) {
  echo json_encode(array('ok' => false, 'message' => 'Sin conexión'));
  exit;
}

$anio = date('Y');
$prefijo = 'SS';

/* Opción A: buscar el último por patrón y sumar 1 */
$like = $prefijo . '/%/' . $anio;
$sql = "
  SELECT folio
  FROM sgio_reportes
  WHERE folio LIKE $1
  ORDER BY id DESC
  LIMIT 1
";
$res = pg_query_params($conexion, $sql, array($like));

// Número inicial debe ser 2550
$numero = 2947;
if ($res && pg_num_rows($res) > 0) {
  $row = pg_fetch_assoc($res);
  $pat = '/^' . preg_quote($prefijo, '/') . '\/(\d+)\/' . $anio . '$/';
  if (preg_match($pat, $row['folio'], $m)) {
    $numero = ((int) $m[1]) + 1;
  }
}

if ($numero === 2941) {
  $sql2 = "
    SELECT COALESCE(MAX(CAST(split_part(folio,'/',2) AS int)),2947) + 1 AS siguiente
    FROM sgio_reportes
    WHERE folio LIKE $1
  ";
  $res2 = pg_query_params($conexion, $sql2, array($like));
  if ($res2) {
    $numero = (int) pg_fetch_result($res2, 0, 'siguiente');
    if ($numero < 2947)
      $numero = 2948;
  }
}

// /* Borrar al pasar a produccion*/
// if ($numero == 3082) {
//   $numero = 0001;
// }

$folio = sprintf('%s/%04d/%s', $prefijo, $numero, $anio);

echo json_encode(array('ok' => true, 'folio' => $folio));
