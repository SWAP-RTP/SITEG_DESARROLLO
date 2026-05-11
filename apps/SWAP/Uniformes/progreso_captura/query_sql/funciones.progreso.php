<?php

require_once '/var/www/login_shared/conf/conexion.php';

function obtenerResumenCaptura($conexion, $modulo_usuario){

    $filtroModulo = ($modulo_usuario !== 0)
        ? " AND mod_clave = $modulo_usuario "
        : "";

    $sql = "
        SELECT 
            mod_clave,
            mod_desc,
            COUNT(*) AS total
        FROM trab_view
        WHERE trab_status = 1
          AND tipo_trab_div = '01'
          $filtroModulo
        GROUP BY mod_clave, mod_desc
        ORDER BY mod_clave
    ";

    $res = pg_query($conexion, $sql);

    $activos = [];

    while($fila = pg_fetch_assoc($res)){

        $mod = $fila['mod_clave'];

        $activos[$mod] = [
            "modulo" => $fila['mod_desc'],
            "mod_clave" => (int)$mod,
            "total" => (int)$fila['total'],
            "capturados" => 0
        ];
    }

    // capturados
    $sqlCapturados = "
        SELECT 
            v.mod_clave,
            COUNT(*) AS capturados
        FROM trabajador_uniforme tu

        INNER JOIN trab_view v
            ON v.trab_credencial = tu.credencial

        WHERE tu.estatus = 1
          AND v.trab_status = 1
          AND v.tipo_trab_div = '01'
          " . ($modulo_usuario !== 0
                ? " AND v.mod_clave = $modulo_usuario "
                : "") . "

        GROUP BY v.mod_clave
    ";

    $resCap = pg_query($conexion, $sqlCapturados);

    while($fila = pg_fetch_assoc($resCap)){

        $mod = $fila['mod_clave'];

        if(isset($activos[$mod])){

            $activos[$mod]['capturados']
                = (int)$fila['capturados'];
        }
    }

    return array_values($activos);
}

function obtenerDetalleCaptura($conexion, $modulo_usuario){

    $filtroModulo = ($modulo_usuario !== 0)
        ? " AND v.mod_clave = $modulo_usuario "
        : "";

    // CAPTURADOS

    $sqlCapturados = "
        SELECT 
            v.mod_clave,
            v.mod_desc,
            v.trab_credencial,
            v.nombre_completo

        FROM trab_view v

        INNER JOIN trabajador_uniforme tu
            ON v.trab_credencial = tu.credencial

        WHERE tu.estatus = 1
          AND v.trab_status = 1
          AND v.tipo_trab_div = '01'
          $filtroModulo

        ORDER BY v.mod_clave, v.nombre_completo
    ";

    $resCapturados = pg_query($conexion, $sqlCapturados);

    $capturados = [];

    while($fila = pg_fetch_assoc($resCapturados)){

        $mod = $fila['mod_clave'];

        if(!isset($capturados[$mod])){

            $capturados[$mod] = [
                "mod_desc" => $fila['mod_desc'],
                "trabajadores" => []
            ];
        }

        $capturados[$mod]['trabajadores'][] = [
            "credencial" => $fila['trab_credencial'],
            "nombre" => $fila['nombre_completo']
        ];
    }

    // FALTANTES

    $sqlFaltantes = "
        SELECT 
            v.mod_clave,
            v.mod_desc,
            v.trab_credencial,
            v.nombre_completo

        FROM trab_view v

        WHERE v.trab_status = 1
          AND v.tipo_trab_div = '01'

          AND NOT EXISTS (

              SELECT 1
              FROM trabajador_uniforme tu
              WHERE tu.credencial = v.trab_credencial
                AND tu.estatus = 1
          )

          $filtroModulo

        ORDER BY v.mod_clave, v.nombre_completo
    ";

    $resFaltantes = pg_query($conexion, $sqlFaltantes);

    $faltantes = [];

    while($fila = pg_fetch_assoc($resFaltantes)){

        $mod = $fila['mod_clave'];

        if(!isset($faltantes[$mod])){

            $faltantes[$mod] = [
                "mod_desc" => $fila['mod_desc'],
                "trabajadores" => []
            ];
        }

        $faltantes[$mod]['trabajadores'][] = [
            "credencial" => $fila['trab_credencial'],
            "nombre" => $fila['nombre_completo']
        ];
    }

    return [
        "capturados" => $capturados,
        "faltantes" => $faltantes
    ];
}