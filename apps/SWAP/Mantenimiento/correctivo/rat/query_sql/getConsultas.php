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
if (isset($_POST['modulo'])) {
  $modulo = (int)$_POST['modulo'];   // 0 = todos
}

$fechaInicio = isset($_POST['fecha_inicio']) ? trim($_POST['fecha_inicio']) : '';
$fechaFinal  = isset($_POST['fecha_final']) ? trim($_POST['fecha_final']) : '';

$anio = null;
if (isset($_POST['year']) && trim($_POST['year']) !== '') {
  $anio = (int)trim($_POST['year']);
}

$where = array();
$params = array();
$i = 1;

// Año
if (!empty($anio)) {
  $where[] = "mc.aho_correctivo = $" . $i;
  $params[] = $anio;
  $i++;
}

// Módulo (solo si > 0; si es 0 = todos)
if ($modulo > 0) {
  $where[] = "mc.mod_clave = $" . $i;
  $params[] = $modulo;
  $i++;
}

// Fechas 
if ($fechaInicio !== '' && $fechaFinal !== '') {
  $where[] = "mc.fecha_mantto_correctivo::date BETWEEN $" . $i . " AND $" . ($i + 1);
  $params[] = $fechaInicio;
  $params[] = $fechaFinal;
  $i += 2;
} elseif ($fechaInicio !== '') {
  $where[] = "mc.fecha_mantto_correctivo::date >= $" . $i;
  $params[] = $fechaInicio;
  $i++;
} elseif ($fechaFinal !== '') {
  $where[] = "mc.fecha_mantto_correctivo::date <= $" . $i;
  $params[] = $fechaFinal;
  $i++;
}

$sql = "
  SELECT
    mc.num_orden_correctivo,
    mc.aho_correctivo,
    mc.mod_clave,
    mc.num_economico,
    mc.ruta_trayecto,
    COALESCE(cc.desc_modelo_carroceria, '') AS tipo,
    mc.falla_operador_desc,
    mc.fecha_mantto_correctivo,
    mc.fecha_salida_taller,
    mc.tiempo_total_taller
  FROM mantenimiento_correctivo mc
  LEFT JOIN pv p
    ON p.pv_eco = mc.num_economico
  LEFT JOIN pv_cve_chasis_carroceria pccc
    ON pccc.cve_marca_chasis_carroceria = p.pv_cve_marca_chasis_carroceria
  LEFT JOIN cve_carroceria cc
    ON cc.cve_carroceria = pccc.cve_modelo_carroceria
";

if (count($where) > 0) {
  $sql .= " WHERE " . implode(" AND ", $where);
}

$sql .= " ORDER BY mc.aho_correctivo DESC, mc.num_orden_correctivo DESC";


$result = pg_query_params($conexion, $sql, $params);

if ($result === false) {
  echo json_encode(array(
    'success' => false,
    'message' => 'Error en la consulta: ' . pg_last_error($conexion),
    'data' => array()
  ));
  exit;
}

$data = array();
while ($row = pg_fetch_assoc($result)) {
  $data[] = array(
    'num_orden_correctivo'     => isset($row['num_orden_correctivo']) ? $row['num_orden_correctivo'] : '',
    'aho_correctivo'           => isset($row['aho_correctivo']) ? $row['aho_correctivo'] : '',
    'mod_clave'                => isset($row['mod_clave']) ? $row['mod_clave'] : '',
    'num_economico'            => isset($row['num_economico']) ? $row['num_economico'] : '',
    'ruta_trayecto'            => isset($row['ruta_trayecto']) ? $row['ruta_trayecto'] : '',
    'tipo'                     => isset($row['tipo']) ? $row['tipo'] : '',
    'falla_operador_desc'      => isset($row['falla_operador_desc']) ? $row['falla_operador_desc'] : '',
    'fecha_mantto_correctivo'  => isset($row['fecha_mantto_correctivo']) ? $row['fecha_mantto_correctivo'] : '',
    'fecha_salida_taller'      => isset($row['fecha_salida_taller']) ? $row['fecha_salida_taller'] : '',
    'tiempo_total_taller'      => isset($row['tiempo_total_taller']) ? $row['tiempo_total_taller'] : ''
  );
}

echo json_encode(array('success' => true, 'message' => 'OK', 'data' => $data));
exit;

