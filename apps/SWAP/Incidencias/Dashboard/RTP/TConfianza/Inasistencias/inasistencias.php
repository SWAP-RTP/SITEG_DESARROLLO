<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

$path_url = isset($_SESSION['rootApp']) ? $_SESSION['rootApp'] : '';
require($path_url . 'conexion.html');

if (!conecta($conexion, $_SESSION['servidor'])) {
  echo json_encode(array('success'=>false, 'message'=>'No se pudo conectar', 'data'=>array()));
  exit;
}

pg_set_client_encoding($conexion, 'UTF8');

$modulo_sesion = isset($_SESSION['modulo_o']) ? intval($_SESSION['modulo_o']) : 0;

$modulo_get = isset($_GET['modulo']) ? trim($_GET['modulo']) : 'ALL';
if ($modulo_get === '') $modulo_get = 'ALL';

if ($modulo_sesion != 0) {
  $modulo_aplicado = (string)$modulo_sesion;
} else {
  $modulo_aplicado = $modulo_get; 
}

$filtroModulo = "";
$params = array();
$useParams = false;


if ($modulo_aplicado !== 'ALL') {
  $filtroModulo = " AND TRIM(r.modulo) = $1::text ";
  $params[] = (string)$modulo_aplicado;
  $useParams = true;
}

$sql = "
SELECT
  TRIM(r.modulo) AS modulo,
  to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') AS mes,
  SUM(CASE WHEN r.anomalia_id = 14 THEN 1 ELSE 0 END) AS inasistencias,
  SUM(CASE WHEN r.anomalia_id <> 14 THEN 1 ELSE 0 END) AS anomalias
FROM public.sgio_reportes r
JOIN public.trabajador t ON t.trab_credencial = r.credencial
JOIN public.trab_puesto p ON TRIM(p.puesto_descripcion) = TRIM(r.puesto)
WHERE t.tipo_trab_clave IN (3,4,5,6)
  AND p.puesto_clave NOT IN (214,215,221)
  AND r.hora_reporte IS NOT NULL
  AND r.modulo IS NOT NULL
  AND TRIM(r.modulo) <> ''
  $filtroModulo
GROUP BY TRIM(r.modulo), date_trunc('month', r.hora_reporte)
ORDER BY TRIM(r.modulo), date_trunc('month', r.hora_reporte);
";


$resultado = $useParams ? pg_query_params($conexion, $sql, $params) : pg_query($conexion, $sql);

if ($resultado === false) {
  echo json_encode(array('success'=>false, 'message'=>pg_last_error($conexion), 'data'=>array()));
  exit;
}

$rows = array();
while ($r = pg_fetch_assoc($resultado)) {
  $rows[] = array(
    'modulo' => $r['modulo'],
    'mes' => $r['mes'],
    'inasistencias' => intval($r['inasistencias']),
    'anomalias' => intval($r['anomalias'])
  );
}

$lista_modulos = array();
if ($modulo_sesion == 0) {
  $qMod = "
    SELECT DISTINCT TRIM(modulo) AS modulo
    FROM public.sgio_reportes
    WHERE modulo IS NOT NULL AND TRIM(modulo) <> ''
    ORDER BY TRIM(modulo);
  ";
  $rm = pg_query($conexion, $qMod);
  if ($rm) {
    while ($m = pg_fetch_assoc($rm)) {
      $lista_modulos[] = $m['modulo'];
    }
  }
}

echo json_encode(array(
  'success' => true,
  'data' => $rows,
  'modulo_usuario' => $modulo_sesion,
  'modulo_aplicado' => $modulo_aplicado,
  'modulos' => $lista_modulos
));
exit;
?>
