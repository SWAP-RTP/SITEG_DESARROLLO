<?php
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Origin: http://10.10.31.207:8086");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");

    // TOKEN
    $mi_token_seguro = "#!!TOKEN_SUGO_123$%";

    // HEADERS
    $headers = apache_request_headers();
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    // VALIDAR TOKEN
    if (!$auth_header || $auth_header !== "Bearer $mi_token_seguro") {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "mensaje" => "No autorizado. Token inválido o ausente."
        ]);
        exit;
    }

    // CONEXIÓN
    require(__DIR__ . '/../../conf/conexion.php');
    $conexion_sugo = Database_sugo::conectar();

    try {
        date_default_timezone_set('America/Mexico_City');

        $fecha = date('Y-m-d 00:00:00'); 
        $fecha2 = date('Y-m-d 00:00:00', strtotime('+1 day')); 

        switch ($_GET['opcion']) {
            // CONTEO GENERAL
            case 1:
                $sql = 'SELECT COUNT(pve.motivo_id) as total, pve.motivo_id, pvem."desc"
                        FROM pv_estados pve 
                        LEFT JOIN pv_estados_motivos pvem ON (pve.motivo_id = pvem.id)
                        WHERE pve.momento >= $1 AND pve.momento < $2
                        GROUP BY pve.motivo_id, pvem."desc";';
                $resultado = pg_query_params($conexion_sugo, $sql, [$fecha, $fecha2]);

                $data = [];
                while ($row = pg_fetch_assoc($resultado)) {
                    $data[] = $row;
                }

                // Inicializar contadores
                $contadores = [
                    "total_servicio" => 0, 
                    "total_fallaMeca" => 0, 
                    "total_terminoJorn" => 0,
                    "total_accidente" => 0, 
                    "total_mantenimientoCorrec" => 0, 
                    "total_mantenimientoPreven" => 0, 
                    "total_disponible" => 0, 
                    "total_servicioMB" => 0,
                    "total_otros" => 0 
                ];

                foreach ($data as $row) {
                    $m = $row['motivo_id'];
                    $count = (int)$row['total'];

                    if ($m == 1 || $m == 19) $contadores["total_servicio"] += $count;
                    elseif ($m == 6) $contadores["total_fallaMeca"] += $count;
                    elseif ($m == 9) $contadores["total_terminoJorn"] += $count;
                    elseif ($m == 11) $contadores["total_accidente"] += $count;
                    elseif ($m == 12 || $m == 23) $contadores["total_mantenimientoCorrec"] += $count;
                    elseif ($m == 24) $contadores["total_mantenimientoPreven"] += $count;
                    elseif ($m == 15) $contadores["total_disponible"] += $count;
                    elseif ($m == 25 || $m == 26) $contadores["total_servicioMB"] += $count;
                    else $contadores["total_otros"] += $count;
                }

                break;

            // CONTEO POR MODULO
            case 2:
                $sql = 'SELECT pve.motivo_id, pve."createdBy_modulo" AS modulo, pve.ruta_modalidad, 
                            COUNT(pve.eco) AS total_camiones
                        FROM pv_estados pve
                        WHERE pve.momento >= $1
                        AND pve.momento < $2
                        GROUP BY pve.motivo_id, pve."createdBy_modulo", pve.ruta_modalidad
                        ORDER BY pve.motivo_id, pve."createdBy_modulo", pve.ruta_modalidad;';

                $resultado = pg_query_params($conexion_sugo, $sql, [$fecha, $fecha2]);

                // Obtener todas las filas
                $res = [];
                while ($row = pg_fetch_assoc($resultado)) {
                    $res[] = $row;
                }

                // Inicializar módulos
                $m1 = []; 
                $m2 = []; 
                $m3 = []; 
                $m4 = [];
                $m5 = []; 
                $m6 = []; 
                $m7 = [];

                foreach ($res as $item){
                    if($item['modulo'] == 1) $m1[] = $item;
                    if($item['modulo'] == 2) $m2[] = $item;
                    if($item['modulo'] == 3) $m3[] = $item;
                    if($item['modulo'] == 4) $m4[] = $item;
                    if($item['modulo'] == 5) $m5[] = $item;
                    if($item['modulo'] == 6) $m6[] = $item;
                    if($item['modulo'] == 7) $m7[] = $item;
                }

                $data = [
                    "m1" => $m1,
                    "m2" => $m2,
                    "m3" => $m3,
                    "m4" => $m4,
                    "m5" => $m5,
                    "m6" => $m6,
                    "m7" => $m7
                ];

                $contadores = [];

                break;
        }

        echo json_encode(array_merge([
            "status" => "success",
            "opcion" => $_GET['opcion'],
            "fecha_hoy" => date('d/m/Y'),
            "data" => $data
        ], $contadores));

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "detalle" => $e->getMessage()
        ]);
    }
?>