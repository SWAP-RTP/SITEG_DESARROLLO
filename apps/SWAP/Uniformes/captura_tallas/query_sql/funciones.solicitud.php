<?php
require_once '/var/www/login_shared/conf/conexion.php';

//solicitud_uniforme.php

function crearSolicitud($id_trabajador, $observaciones, $usuario){
    $conexion = Database::conectar();

    if (!$conexion) {
        return false;
    }

    $sql = "SELECT 1 
            FROM actualizar_uniforme 
            WHERE id_trabajdor_uniforme = $1 
              AND estatus IN (1,2)
            LIMIT 1";

    $res = pg_query_params($conexion, $sql, [$id_trabajador]);

    if (pg_fetch_assoc($res)) {
        return "existe";
    }

    $sqlInsert = "INSERT INTO actualizar_uniforme (
                    id, id_trabajdor_uniforme, observaciones, estatus, usuario_solicitud, fecha_solicitud
                  ) VALUES (
                    (SELECT COALESCE(MAX(id)+1,1) FROM actualizar_uniforme),
                    $1, $2, 1, $3, now()
                  )";

    $resInsert = pg_query_params($conexion, $sqlInsert, [
        $id_trabajador,
        $observaciones,
        $usuario
    ]);

    return $resInsert ? true : false;
}

function autorizarSolicitud($conexion, $id_trabajador, $usuario){

    $sql = "UPDATE actualizar_uniforme 
            SET estatus = 2,
                usuario_habilitacion = $1,
                fecha_habilitacion = now()
            WHERE id_trabajdor_uniforme = $2 
              AND estatus = 1";

    $res = pg_query_params($conexion, $sql, [
        $usuario,
        $id_trabajador
    ]);

    return $res ? true : false;
}

function finalizarSolicitud($conexion, $id_trabajador, $usuario){

    $sql = "UPDATE actualizar_uniforme 
            SET estatus = 3,
                usuario_actualizacion = $1,
                fecha_actualizacion = CURRENT_DATE
            WHERE id_trabajdor_uniforme = $2 
              AND estatus = 2";

    $res = pg_query_params($conexion, $sql, [
        $usuario,
        $id_trabajador
    ]);

    return $res ? true : false;
}

function obtenerSolicitudes($conexion){

    $sql = "SELECT 
                au.id_trabajdor_uniforme AS id,
                tu.credencial,
                tv.nombre_completo AS nombre,
                au.observaciones,
                au.estatus
            FROM actualizar_uniforme au
            JOIN trabajador_uniforme tu 
                ON tu.id = au.id_trabajdor_uniforme
            JOIN trab_view tv 
                ON tv.trab_credencial = tu.credencial
            ORDER BY au.estatus ASC";

    $res = pg_query($conexion, $sql);

    $data = [];

    while($fila = pg_fetch_assoc($res)){
        $data[] = $fila;
    }

    return $data;
}

function obtenerUniformesActualizar($conexion, $id_trabajador){
    
    $conexion = Database::conectar();

    if (!$conexion) {
        return false;
    }

    $sql = "
        SELECT 
            cu.id AS id_catalogo,
            cu.nombre_uniforme AS nombre,
            cu.num_prenda AS cantidad,
            dtu.talla
        FROM detalle_trabajador_uniforme dtu

        JOIN catalogo_uniformes cu
            ON cu.id = dtu.id_catalogo_uniforme

        WHERE dtu.id_trabajador_uniforme = $1

        ORDER BY cu.id ASC
    ";

    $res = pg_query_params($conexion, $sql, [$id_trabajador]);

    if (!$res) {
        return [];
    }

    $data = [];

    while($fila = pg_fetch_assoc($res)){

        $data[] = [
            "id_catalogo" => (int)$fila['id_catalogo'],
            "nombre" => $fila['nombre'],
            "cantidad" => (int)$fila['cantidad'],
            "talla" => $fila['talla']
        ];
    }

    return $data;
}

function actualizarTallas($conexion, $id_trabajador, $post, $usuario){

    $conexion = Database::conectar();

    if (!$conexion) {
        return false;
    }

    $errores = [];

    foreach($post as $key => $value){

        if(strpos($key, 'id_prenda') === 0 && !empty($value)){

            $id_catalogo = (int) str_replace('id_prenda', '', $key);

            $talla = strtoupper(trim($value));

            $sql = "
                UPDATE detalle_trabajador_uniforme
                SET talla = $1
                WHERE id_trabajador_uniforme = $2
                  AND id_catalogo_uniforme = $3
            ";

            $res = pg_query_params($conexion, $sql, [
                $talla,
                $id_trabajador,
                $id_catalogo
            ]);

            if(!$res){
                $errores[] = "Error prenda $id_catalogo";
            }
        }
    }

    // finalizar solicitud
    finalizarSolicitud($conexion, $id_trabajador, $usuario);

    return empty($errores)
        ? true
        : $errores;
}