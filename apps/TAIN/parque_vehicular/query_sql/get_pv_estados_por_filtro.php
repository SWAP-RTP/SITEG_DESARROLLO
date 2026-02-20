<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://10.10.31.207:8086");
// header("Access-Control-Allow-Methods: GET");
// Permitir que el encabezado Authorization pase por CORS
header("Access-Control-Allow-Headers: Content-Type, Authorization");

//DEFINIR TOKEN (contraseña que se va a pedir cuando haga la peticion por el ajax)
$mi_token_seguro = "#!!TOKEN_SUGO_123_POR_FILTRO$%";

//OBTENEMOS EL ENCABEZADO DE LA PETICIÓN
$headers = apache_request_headers();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

//VALIDAMOS EL TOKEN (que sea la misma contraseña))
if (!$auth_header || $auth_header !== "Bearer $mi_token_seguro") {
    http_response_code(401); // No autorizado
    echo json_encode([
        "status" => "error",
        "mensaje" => "No autorizado. Token inválido o ausente."
    ]);
    exit;
}

require(__DIR__ . '/../../public/conexion2.php');
//llamamos a la funcion de conexion SUGO
$pdo_sugo = conexionSugo();

$pdo_sugo->exec("SET TIME ZONE 'America/Mexico_City';");
date_default_timezone_set('America/Mexico_City');

try {
    // Configuración de zona horaria
    $pdo_sugo->exec("SET TIME ZONE 'America/Mexico_City';");
    date_default_timezone_set('America/Mexico_City');

    $fech_inicio = !empty($_POST['fech_inicio']) ? $_POST['fech_inicio'] : null;
    $fech_final  = !empty($_POST['fech_final'])  ? $_POST['fech_final']  : null;

    //descomponer fechas para mostrarlas en la parte grafica
    function formatearFecha($fecha) {
        if (empty($fecha)) {
            return null;
        }

        $partes = preg_split('/[\/\.\-]/', $fecha);

        // Deben venir 3 partes: Y M D
        if (count($partes) !== 3) {
            return null;
        }

        list($anio, $mes, $dia) = $partes;
        return "$dia/$mes/$anio";
    }

    header("Access-Control-Allow-Methods: POST, OPTIONS");

    // WHERE dinamico
    $sql_where = '';
    $params = [];

    if ($fech_inicio && $fech_final) {
        $sql_where = "pve.momento >= :fecha_inicio AND pve.momento < :fecha_final";
        $params[':fecha_inicio'] = $fech_inicio . " 00:00:00";
        $params[':fecha_final']  = $fech_final  . " 00:00:00";
    }
    if ($fech_inicio) {
        $sql_where = "pve.momento >= :fecha_inicio AND pve.momento < :fecha_final";
        $params[':fecha_inicio'] = $fech_inicio . " 00:00:00";
        $params[':fecha_final']  = date('Y-m-d 00:00:00', strtotime($fech_inicio . ' +1 day'));
    }
    if ($fech_final) {
        $sql_where = "pve.momento >= :fecha_inicio AND pve.momento < :fecha_final";
        $params[':fecha_inicio'] = date('Y-m-d 00:00:00', strtotime($fech_final . ' -1 day'));
        $params[':fecha_final']  = $fech_final . " 00:00:00";
    }

    switch ($_POST['opcion']) {
        // FILTRO POR RANGO DE FECHAS GENERAL
        case 1:

            $sql = "SELECT COUNT(pve.motivo_id), pve.motivo_id, pvem.\"desc\"
                    FROM pv_estados pve
                    LEFT JOIN pv_estados_motivos pvem ON (pve.motivo_id = pvem.id)
                    WHERE $sql_where
                    GROUP BY pve.motivo_id, pvem.\"desc\";";
            $stmt = $pdo_sugo->prepare($sql);
            $stmt->execute($params);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Inicializar contadores en cero
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
            // print_r($data);
            foreach ($data as $row) {
                $m = $row['motivo_id'];

                if ($m == 1 || $m == 19) $contadores["total_servicio"] += (int)$row['count'];
                elseif ($m == 6) $contadores["total_fallaMeca"]++;
                elseif ($m == 9) $contadores["total_terminoJorn"] = $row['count'];
                elseif ($m == 11) $contadores["total_accidente"]++;
                elseif ($m == 12 || $m == 23) $contadores["total_mantenimientoCorrec"] += (int)$row['count'];
                elseif ($m == 24) $contadores["total_mantenimientoPreven"] = $row['count'];
                elseif ($m == 15) $contadores["total_disponible"] = $row['count'];
                elseif ($m == 25 || $m == 26) $contadores["total_servicioMB"] += (int)$row['count']; // motivo 25 esta en servicio(despacho) y el 26 esta en servicio(recepcion)
                else $contadores["total_otros"] += (int)$row['count'];
            }
            break;
        
        // FILTRO POR RANGO DE FECHAS POR MODULO
        case 2:

            $sql = "SELECT pve.motivo_id, pve.\"createdBy_modulo\" AS modulo, pve.ruta_modalidad, 
                           COUNT(pve.eco) AS total_camiones
                    FROM pv_estados pve
                    WHERE $sql_where
                    GROUP BY pve.motivo_id, pve.\"createdBy_modulo\", pve.ruta_modalidad
                    ORDER BY pve.motivo_id, pve.\"createdBy_modulo\", pve.ruta_modalidad;";
            $stmt = $pdo_sugo->prepare($sql);
            $stmt->execute($params);
            $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

            //dejamos vacio el contador
            $contadores = [];

            $m1 = array();
            $m2 = array();
            $m3 = array();
            $m4 = array();
            $m5 = array();
            $m6 = array();
            $m7 = array();
            
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
            break;

    }
    echo json_encode(array_merge([
        "status" => "success",
        "fecha_inicio" => formatearFecha($_POST['fech_inicio'] ?? null),
        "fecha_final" => formatearFecha($_POST['fech_final'] ?? null),
        "data" => $data
    ], $contadores));

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "detalle" => $e->getMessage()]);
}

?>