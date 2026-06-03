<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

$path_url = isset($_SESSION['rootApp']) ? $_SESSION['rootApp'] : '';
require($path_url . 'conexion.html');

if (!conecta($conexion, $_SESSION['servidor'])) {
  echo json_encode(array(
    'success' => false,
    'message' => 'No se pudo conectar',
    'data' => array(),
    'modulos' => array(),
    'meses' => array(),
    'modulo_usuario' => 0,
    'modulo_aplicado' => 'ALL',
    'mes_aplicado' => 'ALL'
  ));
  exit;
}

pg_set_client_encoding($conexion, 'UTF8');

$modulo_sesion = isset($_SESSION['modulo_o']) ? intval($_SESSION['modulo_o']) : 0;

// GET modulo: 'ALL' o '1','2',...
$modulo_get = isset($_GET['modulo']) ? trim($_GET['modulo']) : 'ALL';
if ($modulo_get === '') $modulo_get = 'ALL';
$modulo_get = strtoupper($modulo_get);

// GET mes: 'ALL' o 'YYYY-MM'
$mes_get = isset($_GET['mes']) ? trim($_GET['mes']) : 'ALL';
if ($mes_get === '') $mes_get = 'ALL';
$mes_get = strtoupper($mes_get);

// si NO es OC, se respeta su módulo de sesión
if ($modulo_sesion != 0) {
  $modulo_aplicado = (string)$modulo_sesion;
} else {
  $modulo_aplicado = $modulo_get;
}

$mes_aplicado = $mes_get;

// ================== FILTROS DINÁMICOS ==================
$filtros = "";
$params  = array();
$p = 1;

if ($modulo_aplicado !== 'ALL') {
  $filtros .= " AND TRIM(r.modulo) = $" . $p . "::text ";
  $params[] = (string)$modulo_aplicado;
  $p++;
}

if ($mes_aplicado !== 'ALL') {
  $filtros .= " AND to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') = $" . $p . "::text ";
  $params[] = (string)$mes_aplicado;
  $p++;
}

// ================== QUERY PRINCIPAL (SUPERVISORES MB) ==================
// Operador = trabajador con puesto_clave 214, 215, 221 (MB)
$sql = "
SELECT
  r.user_supervisorep AS id_supervisor,
  TRIM(sup.trab_nombre) || ' ' ||
  TRIM(sup.trab_apaterno) || ' ' ||
  TRIM(sup.trab_amaterno) AS supervisor,
  -- modulo y mes de referencia (cuando filtras por uno, siempre será ese)
  MIN(TRIM(r.modulo)) AS modulo,
  MIN(to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM')) AS mes,
  COUNT(*) AS total
FROM public.sgio_reportes r
JOIN public.trabajador op
  ON op.trab_credencial = r.credencial         
JOIN public.trab_puesto p_op
  ON TRIM(p_op.puesto_descripcion) = TRIM(r.puesto)
JOIN public.trabajador sup
  ON sup.trab_credencial = r.user_supervisorep  -- supervisor
WHERE r.anomalia_id IS NOT NULL
  AND r.hora_reporte IS NOT NULL
  AND r.modulo IS NOT NULL
  AND TRIM(r.modulo) <> ''
  AND p_op.puesto_clave IN (214,215,221)        
  $filtros
GROUP BY
  r.user_supervisorep,
  supervisor
ORDER BY
  total DESC,
  supervisor ASC;
";

$rs = (count($params) > 0)
  ? pg_query_params($conexion, $sql, $params)
  : pg_query($conexion, $sql);

if ($rs === false) {
  echo json_encode(array(
    'success' => false,
    'message' => pg_last_error($conexion),
    'data' => array(),
    'modulos' => array(),
    'meses' => array(),
    'modulo_usuario' => $modulo_sesion,
    'modulo_aplicado' => $modulo_aplicado,
    'mes_aplicado' => $mes_aplicado
  ));
  exit;
}

$data = array();
while ($r = pg_fetch_assoc($rs)) {
  $data[] = array(
    'id_supervisor' => $r['id_supervisor'],
    'supervisor'    => $r['supervisor'],
    'modulo'        => $r['modulo'],
    'mes'           => $r['mes'],
    'total'         => intval($r['total'])
  );
}

// ================== COMBO DE MÓDULOS (SOLO MB) ==================
$lista_modulos = array();
if ($modulo_sesion == 0) {
  $qMod = "
    SELECT TRIM(r.modulo) AS modulo
    FROM public.sgio_reportes r
    JOIN public.trabajador op
      ON op.trab_credencial = r.credencial
    JOIN public.trab_puesto p_op
      ON TRIM(p_op.puesto_descripcion) = TRIM(r.puesto)
    WHERE p_op.puesto_clave IN (214,215,221)
      AND r.modulo IS NOT NULL
      AND TRIM(r.modulo) <> ''
      AND TRIM(r.modulo) <> '0'
      AND TRIM(r.modulo) ~ '^[0-9]+$'
    GROUP BY TRIM(r.modulo)
    ORDER BY TRIM(r.modulo)::int;
  ";
  $rm = pg_query($conexion, $qMod);
  if ($rm) {
    while ($m = pg_fetch_assoc($rm)) {
      $lista_modulos[] = $m['modulo'];
    }
  }
}

// ================== COMBO DE MESES (SOLO MB) ==================
$lista_meses = array();
$qMes = "
  SELECT to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') AS mes
  FROM public.sgio_reportes r
  JOIN public.trabajador op
    ON op.trab_credencial = r.credencial
  JOIN public.trab_puesto p_op
    ON TRIM(p_op.puesto_descripcion) = TRIM(r.puesto)
  WHERE r.hora_reporte IS NOT NULL
    AND p_op.puesto_clave IN (214,215,221)
  GROUP BY to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM')
  ORDER BY mes;
";
$rx = pg_query($conexion, $qMes);
if ($rx) {
  while ($mm = pg_fetch_assoc($rx)) {
    $lista_meses[] = $mm['mes'];
  }
}

echo json_encode(array(
  'success'         => true,
  'data'            => $data,
  'modulo_usuario'  => $modulo_sesion,
  'modulo_aplicado' => $modulo_aplicado,
  'mes_aplicado'    => $mes_aplicado,
  'modulos'         => $lista_modulos,
  'meses'           => $lista_meses
));
exit;
?>