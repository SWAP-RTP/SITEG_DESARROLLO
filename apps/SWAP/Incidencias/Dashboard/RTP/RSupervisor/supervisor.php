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
$modulo_get = strtoupper($modulo_get); 

$mes_get = isset($_GET['mes']) ? trim($_GET['mes']) : 'ALL';
if ($mes_get === '') $mes_get = 'ALL';
$mes_get = strtoupper($mes_get);

if ($modulo_sesion != 0) {
  $modulo_aplicado = (string)$modulo_sesion;
} else {
  $modulo_aplicado = $modulo_get; 
}

$filtroMes = "";
$paramsMes = array();
$useMes = false;

if ($mes_get !== 'ALL') {
  $filtroMes = " AND to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') = $1 ";
  $paramsMes[] = $mes_get;
  $useMes = true;
}

$rows = array();

if ($modulo_aplicado === 'ALL') {

  $sql = "
    SELECT
      t.id_supervisor,
      t.supervisor,
      t.total_reportes,
      m.modulo
    FROM
    (
      SELECT
        r.user_supervisorep AS id_supervisor,
        r.nombre_supervisor AS supervisor,
        COUNT(*) AS total_reportes
      FROM public.sgio_reportes r
      WHERE r.user_supervisorep IS NOT NULL
        AND r.nombre_supervisor IS NOT NULL
        AND TRIM(r.nombre_supervisor) <> ''
        $filtroMes
      GROUP BY r.user_supervisorep, r.nombre_supervisor
      ORDER BY COUNT(*) DESC
      LIMIT 5
    ) t
    JOIN
    (
      /* módulo más frecuente por supervisor (mismo filtro de mes si aplica) */
      SELECT
        x.id_supervisor,
        x.modulo
      FROM
      (
        SELECT
          r.user_supervisorep AS id_supervisor,
          TRIM(r.modulo) AS modulo,
          COUNT(*) AS cnt
        FROM public.sgio_reportes r
        WHERE r.user_supervisorep IS NOT NULL
          AND r.modulo IS NOT NULL
          AND TRIM(r.modulo) <> ''
          $filtroMes
        GROUP BY r.user_supervisorep, TRIM(r.modulo)
      ) x
      JOIN
      (
        SELECT
          s.id_supervisor,
          MAX(s.cnt) AS max_cnt
        FROM
        (
          SELECT
            r.user_supervisorep AS id_supervisor,
            TRIM(r.modulo) AS modulo,
            COUNT(*) AS cnt
          FROM public.sgio_reportes r
          WHERE r.user_supervisorep IS NOT NULL
            AND r.modulo IS NOT NULL
            AND TRIM(r.modulo) <> ''
            $filtroMes
          GROUP BY r.user_supervisorep, TRIM(r.modulo)
        ) s
        GROUP BY s.id_supervisor
      ) y
        ON y.id_supervisor = x.id_supervisor
       AND y.max_cnt = x.cnt
    ) m
      ON m.id_supervisor = t.id_supervisor
    ORDER BY t.total_reportes DESC;
  ";

  if ($useMes) {
    $sql = "
      SELECT
        t.id_supervisor,
        t.supervisor,
        t.total_reportes,
        m.modulo
      FROM
      (
        SELECT
          r.user_supervisorep AS id_supervisor,
          r.nombre_supervisor AS supervisor,
          COUNT(*) AS total_reportes
        FROM public.sgio_reportes r
        WHERE r.user_supervisorep IS NOT NULL
          AND r.nombre_supervisor IS NOT NULL
          AND TRIM(r.nombre_supervisor) <> ''
          AND to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') = $1
        GROUP BY r.user_supervisorep, r.nombre_supervisor
        ORDER BY COUNT(*) DESC
        LIMIT 5
      ) t
      JOIN
      (
        SELECT
          x.id_supervisor,
          x.modulo
        FROM
        (
          SELECT
            r.user_supervisorep AS id_supervisor,
            TRIM(r.modulo) AS modulo,
            COUNT(*) AS cnt
          FROM public.sgio_reportes r
          WHERE r.user_supervisorep IS NOT NULL
            AND r.modulo IS NOT NULL
            AND TRIM(r.modulo) <> ''
            AND to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') = $2
          GROUP BY r.user_supervisorep, TRIM(r.modulo)
        ) x
        JOIN
        (
          SELECT
            s.id_supervisor,
            MAX(s.cnt) AS max_cnt
          FROM
          (
            SELECT
              r.user_supervisorep AS id_supervisor,
              TRIM(r.modulo) AS modulo,
              COUNT(*) AS cnt
            FROM public.sgio_reportes r
            WHERE r.user_supervisorep IS NOT NULL
              AND r.modulo IS NOT NULL
              AND TRIM(r.modulo) <> ''
              AND to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') = $3
            GROUP BY r.user_supervisorep, TRIM(r.modulo)
          ) s
          GROUP BY s.id_supervisor
        ) y
          ON y.id_supervisor = x.id_supervisor
         AND y.max_cnt = x.cnt
      ) m
        ON m.id_supervisor = t.id_supervisor
      ORDER BY t.total_reportes DESC;
    ";

    $params = array($mes_get, $mes_get, $mes_get);
    $resultado = pg_query_params($conexion, $sql, $params);
  } else {
    $resultado = pg_query($conexion, $sql);
  }

} else {

  // Módulo específico => todos los supervisores de ese módulo (según mes o todos)
  if ($mes_get === 'ALL') {
    $sql = "
      SELECT
        to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') AS mes,
        TRIM(r.modulo) AS modulo,
        r.user_supervisorep AS id_supervisor,
        r.nombre_supervisor AS supervisor,
        COUNT(*) AS total_reportes
      FROM public.sgio_reportes r
      WHERE r.user_supervisorep IS NOT NULL
        AND r.nombre_supervisor IS NOT NULL
        AND TRIM(r.nombre_supervisor) <> ''
        AND r.modulo IS NOT NULL
        AND TRIM(r.modulo) = $1::text
      GROUP BY mes, TRIM(r.modulo), r.user_supervisorep, r.nombre_supervisor
      ORDER BY total_reportes DESC;
    ";
    $params = array((string)$modulo_aplicado);
    $resultado = pg_query_params($conexion, $sql, $params);
  } else {
    $sql = "
      SELECT
        to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') AS mes,
        TRIM(r.modulo) AS modulo,
        r.user_supervisorep AS id_supervisor,
        r.nombre_supervisor AS supervisor,
        COUNT(*) AS total_reportes
      FROM public.sgio_reportes r
      WHERE r.user_supervisorep IS NOT NULL
        AND r.nombre_supervisor IS NOT NULL
        AND TRIM(r.nombre_supervisor) <> ''
        AND r.modulo IS NOT NULL
        AND TRIM(r.modulo) = $1::text
        AND to_char(date_trunc('month', r.hora_reporte), 'YYYY-MM') = $2
      GROUP BY mes, TRIM(r.modulo), r.user_supervisorep, r.nombre_supervisor
      ORDER BY total_reportes DESC;
    ";
    $params = array((string)$modulo_aplicado, $mes_get);
    $resultado = pg_query_params($conexion, $sql, $params);
  }
}

if ($resultado === false) {
  echo json_encode(array('success'=>false, 'message'=>pg_last_error($conexion), 'data'=>array()));
  exit;
}

while ($r = pg_fetch_assoc($resultado)) {
  $rows[] = array(
    'mes' => isset($r['mes']) ? $r['mes'] : '',
    'modulo' => isset($r['modulo']) ? $r['modulo'] : '',
    'id_supervisor' => $r['id_supervisor'],
    'supervisor' => $r['supervisor'],
    'total' => intval($r['total_reportes'])
  );
}

$lista_modulos = array();
$lista_meses = array();

if ($modulo_sesion == 0) {
  // módulos
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

  // meses
  $qMes = "
    SELECT DISTINCT to_char(date_trunc('month', hora_reporte), 'YYYY-MM') AS mes
    FROM public.sgio_reportes
    WHERE hora_reporte IS NOT NULL
    ORDER BY mes;
  ";
  $rx = pg_query($conexion, $qMes);
  if ($rx) {
    while ($mm = pg_fetch_assoc($rx)) {
      $lista_meses[] = $mm['mes'];
    }
  }
}

echo json_encode(array(
  'success' => true,
  'data' => $rows,
  'modulo_usuario' => $modulo_sesion,
  'modulo_aplicado' => $modulo_aplicado,
  'mes_aplicado' => $mes_get,
  'modulos' => $lista_modulos,
  'meses' => $lista_meses
));
exit;
?>
