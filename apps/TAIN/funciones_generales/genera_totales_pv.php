<?php

function genera_totales_pv ($pdo_sugo){

    // Configuración de zona horaria
    $pdo_sugo->exec("SET TIME ZONE 'America/Mexico_City';");
    date_default_timezone_set('America/Mexico_City');

    // $fecha = date('Y-m-d 00:00:00', strtotime('-1 day')); buscas registros del dia anterior
    $fecha = date('Y-m-d 00:00:00');
    $fecha2 = date('Y-m-d 00:00:00', strtotime('+1 day')); 

    //TOTAL DE REGISTROS QUE SE HICIERON EN EL DIA
    $sql = 'SELECT pve.motivo_id, pve."createdBy_modulo" AS modulo, pve.ruta_modalidad, 
                   COUNT(pve.eco) AS total_camiones
            FROM pv_estados pve
            WHERE pve.momento >= :fecha
            AND pve.momento < :fecha2
            GROUP BY pve.motivo_id, pve."createdBy_modulo", pve.ruta_modalidad
            ORDER BY pve.motivo_id, pve."createdBy_modulo", pve.ruta_modalidad;';
    $stmt = $pdo_sugo->prepare($sql);
    $stmt->execute([':fecha' => $fecha, ':fecha2' => $fecha2]);
    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $m1 = array();
    $m2 = array();
    $m3 = array();
    $m4 = array();
    $m5 = array();
    $m6 = array();
    $m7 = array();
    $total = 0;
    
    foreach ($res as $item){
        $total += (int)$item['total_camiones'];

        if($item['modulo'] == 1) $m1[] = $item;
        if($item['modulo'] == 2) $m2[] = $item;
        if($item['modulo'] == 3) $m3[] = $item;
        if($item['modulo'] == 4) $m4[] = $item;
        if($item['modulo'] == 5) $m5[] = $item;
        if($item['modulo'] == 6) $m6[] = $item;
        if($item['modulo'] == 7) $m7[] = $item;
    }
        
    $data = [
        "total" => $total,
        "m1" => $m1,
        "m2" => $m2,
        "m3" => $m3,
        "m4" => $m4,
        "m5" => $m5,
        "m6" => $m6,
        "m7" => $m7
    ];
    
    return [
        "total" => $total,
        "m1" => $m1,
        "m2" => $m2,
        "m3" => $m3,
        "m4" => $m4,
        "m5" => $m5,
        "m6" => $m6,
        "m7" => $m7
    ];
}


?>