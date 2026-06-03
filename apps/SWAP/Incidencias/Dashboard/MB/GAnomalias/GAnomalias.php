<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

$path_url = isset($_SESSION['rootApp']) ? $_SESSION['rootApp'] : '';
require($path_url . 'conexion.html');

if (!conecta($conexion, $_SESSION['servidor'])) {
  echo json_encode(array(
    'success' => false,
    'message' => 'No se pudo conectar',
    'top5' => array(),
    'resto' => array(),
    'modulos' => array(),
    'meses' => array()
  ));
  exit;
}

pg_set_client_encoding($conexion, 'UTF8');
$modulo_sesion = isset($_SESSION['modulo_o']) ? intval($_SESSION['modulo_o']) : 0;

$modulo_get = isset($_GET['modulo']) ? trim($_GET['modulo']) : 'all';
if ($modulo_get === '') $modulo_get = 'all';
$modulo_get = strtolower($modulo_get);

$mes_get = isset($_GET['mes']) ? trim($_GET['mes']) : 'all';
if ($mes_get === '') $mes_get = 'all';
$mes_get = strtolower($mes_get);

if ($modulo_sesion != 0) {
  $modulo_aplicado = (string)$modulo_sesion;
} else {
  $modulo_aplicado = $modulo_get;
}

$mes_aplicado = $mes_get;

$filtros = "";
$params  = array();
$p = 1;

if ($modulo_aplicado !== 'all') {
  $filtros .= " AND TRIM(r.modulo) = $" . $p . "::text ";
  $params[] = (string)$modulo_aplicado;
  $p++;
}

if ($mes_aplicado !== 'all') {
  $filtros .= " AND to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') = $" . $p . "::text ";
  $params[] = (string)$mes_aplicado;
  $p++;
}


//Top 5
$sqlTop = "
SELECT
  c.anomalia_clave AS descripcion,
  COUNT(*) AS total
FROM public.sgio_reportes r
JOIN public.trabajador t
  ON t.trab_credencial = r.credencial
JOIN public.trab_puesto p
  ON TRIM(p.puesto_descripcion) = TRIM(r.puesto)
JOIN public.sgio_catalogo_anomalias c
  ON c.id = r.anomalia_id
WHERE r.anomalia_id IS NOT NULL
  AND r.hora_reporte IS NOT NULL
  AND r.modulo IS NOT NULL
  AND TRIM(r.modulo) <> ''
  AND t.tipo_trab_clave IN (1,2)
  AND p.puesto_clave IN (214,215,221)   -- MB
  $filtros
GROUP BY c.anomalia_clave
ORDER BY total DESC, c.anomalia_clave ASC
LIMIT 5;
";

$rsTop = (count($params) > 0)
  ? pg_query_params($conexion, $sqlTop, $params)
  : pg_query($conexion, $sqlTop);

if ($rsTop === false) {
  echo json_encode(array(
    'success' => false,
    'message' => pg_last_error($conexion),
    'top5' => array(),
    'resto' => array(),
    'modulos' => array(),
    'meses' => array()
  ));
  exit;
}

$top5 = array();
$topKeys = array();
while ($r = pg_fetch_assoc($rsTop)) {
  $desc = $r['descripcion'];
  $tot  = intval($r['total']);
  $top5[] = array('descripcion' => $desc, 'total' => $tot);
  $topKeys[$desc] = true;
}


//todas las anomalias
$sqlAll = "
SELECT
  c.anomalia_clave AS descripcion,
  COUNT(*) AS total
FROM public.sgio_reportes r
JOIN public.trabajador t
  ON t.trab_credencial = r.credencial
JOIN public.trab_puesto p
  ON TRIM(p.puesto_descripcion) = TRIM(r.puesto)
JOIN public.sgio_catalogo_anomalias c
  ON c.id = r.anomalia_id
WHERE r.anomalia_id IS NOT NULL
  AND r.hora_reporte IS NOT NULL
  AND r.modulo IS NOT NULL
  AND TRIM(r.modulo) <> ''
  AND t.tipo_trab_clave IN (1,2)
  AND p.puesto_clave IN (214,215,221)   -- MB
  $filtros
GROUP BY c.anomalia_clave
ORDER BY total DESC, c.anomalia_clave ASC;
";

$rsAll = (count($params) > 0)
  ? pg_query_params($conexion, $sqlAll, $params)
  : pg_query($conexion, $sqlAll);

if ($rsAll === false) {
  echo json_encode(array(
    'success' => false,
    'message' => pg_last_error($conexion),
    'top5' => $top5,
    'resto' => array(),
    'modulos' => array(),
    'meses' => array()
  ));
  exit;
}

$resto = array();
while ($r = pg_fetch_assoc($rsAll)) {
  $desc = $r['descripcion'];
  if (isset($topKeys[$desc])) continue;

  $resto[] = array(
    'descripcion' => $desc,
    'total' => intval($r['total'])
  );
}

//lista de modulos
$lista_modulos = array();
if ($modulo_sesion == 0) {
  $qMod = "
    SELECT TRIM(r.modulo) AS modulo
    FROM public.sgio_reportes r
    JOIN public.trabajador t
      ON t.trab_credencial = r.credencial
    JOIN public.trab_puesto p
      ON TRIM(p.puesto_descripcion) = TRIM(r.puesto)
    WHERE t.tipo_trab_clave IN (1,2)
      AND p.puesto_clave IN (214,215,221)   -- MB
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

//lista de meses
$lista_meses = array();
$qMes = "
  SELECT to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') AS mes
  FROM public.sgio_reportes r
  JOIN public.trabajador t
    ON t.trab_credencial = r.credencial
  JOIN public.trab_puesto p
    ON TRIM(p.puesto_descripcion) = TRIM(r.puesto)
  WHERE r.hora_reporte IS NOT NULL
    AND t.tipo_trab_clave IN (1,2)
    AND p.puesto_clave IN (214,215,221)   
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
  'success' => true,
  'top5' => $top5,
  'resto' => $resto,
  'modulo_usuario' => $modulo_sesion,
  'modulo_aplicado' => $modulo_aplicado,
  'mes_aplicado' => $mes_aplicado,
  'modulos' => $lista_modulos,
  'meses' => $lista_meses
));
exit;
?>