<?php
require_once '/var/www/login_shared/conf/conexion.php';

function registroUniformes($data) {
    $conexion = Database::conectar();
    if (!$conexion) {
        return false;
    }

    $clasificacion = clasificarPuesto($data['puesto_clave']);
    $genero = ((int)$data['genero'] === 1) ? 1 : 2;
    $tipo_contrato = ($data['tipo_contrato'] == "1") ? 1 : 2;

    // validar si ya existe
    if (verificarTrabajadorExistente($conexion, $data['credencial'])) {
        return "existe";
    }

    $total_prendas = calcularPrendasSeleccionadas($conexion, $data['prendas']);

    $id_trabajador = insertarEncabezado($conexion, $data, $total_prendas);

    if (!$id_trabajador) {
        return false;
    }

    $errores = insertarDetallePrendas($conexion, $id_trabajador, $data['prendas']);

    return empty($errores) ? true : $errores;
}

function clasificarPuesto($puesto){
    $puestos_operadores = [42,214,215,221];
    $puestos_mantenimiento = [1,2,3,5,6,7,9,10,11,13,14,15,40,222,223,224,225];
    $puestos_auxiliar = [17,216,34,35,36,230,231];

    if(in_array($puesto,$puestos_operadores)) return 1;
    if(in_array($puesto,$puestos_mantenimiento)) return 2;
    if(in_array($puesto,$puestos_auxiliar)) return 3;

    return 0;
}

function verificarTrabajadorExistente($conexion,$credencial){
    $sql = "SELECT 1 FROM trabajador_uniforme 
            WHERE credencial = $1 AND estatus = 1 LIMIT 1";

    $res = pg_query_params($conexion,$sql,[$credencial]);

    return pg_fetch_assoc($res) ? true : false;
}

function calcularPrendasSeleccionadas($conexion,$prendas){
    $total = 0;

    foreach ($prendas as $id => $talla){
        $sql = "SELECT num_prenda FROM catalogo_uniformes WHERE id = $1";
        $res = pg_query_params($conexion,$sql,[$id]);

        if($row = pg_fetch_assoc($res)){
            $total += (int)$row['num_prenda'];
        }
    }

    return $total;
}

function insertarEncabezado($conexion,$data,$total){

    $sql = "INSERT INTO trabajador_uniforme
            (id, credencial, total_prendas_adquiridas, modulo, estatus,
             fecha_registro, observaciones, tipo_contrato, asistencia, usuario_captura)
            VALUES (
                (SELECT COALESCE(MAX(id)+1,1) FROM trabajador_uniforme),
                $1, $2, $3, 1,
                now(),
                $4, $5, $6, $7
            )
            RETURNING id";

    $res = pg_query_params($conexion,$sql,[
        $data['credencial'],
        $total,
        $data['modulo'],
        $data['observaciones'],
        $data['tipo_contrato'],
        $data['asistencia'],
        $data['usuario']
    ]);

    if(!$res) return null;

    $row = pg_fetch_assoc($res);
    return $row['id'];
}

function insertarDetallePrendas($conexion,$id_trabajador,$prendas){
    $errores = [];

    foreach($prendas as $id => $talla){

        $sql = "INSERT INTO detalle_trabajador_uniforme
                (id, id_trabajador_uniforme, id_catalogo_uniforme, talla)
                VALUES (
                    (SELECT COALESCE(MAX(id)+1,1) FROM detalle_trabajador_uniforme),
                    $1,
                    $2,
                    $3
                )";

        $res = pg_query_params($conexion,$sql,[
            $id_trabajador,
            $id,
            strtoupper(trim($talla))
        ]);

        if(!$res){
            $errores[] = "Error en prenda $id";
        }
    }

    return $errores;
}

function validarUniforme($conexion, $credencial) {
    $sql = "SELECT id, fecha_registro, observaciones
            FROM trabajador_uniforme
            WHERE credencial = $1
              AND estatus = 1
            LIMIT 1";

    $res = pg_query_params($conexion, $sql, [$credencial]);

    if (!$res) {
        return ["error" => "Error en la consulta"];
    }

    if (pg_num_rows($res) > 0) {
        $row = pg_fetch_assoc($res);

        return [
            "registro" => true,
            "id" => (int)$row['id'],
            "fecha_registro" => $row['fecha_registro'],
            "observaciones" => $row['observaciones']
        ];
    }

    return ["registro" => false];
}

function obtenerUniformes($conexion, $data){

    $puesto = clasificarPuesto($data['puesto_clave']);
    if ($puesto === 0) return [];

    $genero = (
        $data['genero'] === "MASCULINO" ||
        $data['genero'] === "1" ||
        $data['genero'] === 1
    ) ? 1 : 2;

    $tipo_contrato = ($data['tipo_contrato'] == "1") ? 1 : 2;

    if ($puesto == 2) {
        $sql = "SELECT id, nombre_uniforme, num_prenda
                FROM catalogo_uniformes
                WHERE puesto_trabajador = $1
                  AND tipo_contrato = $2
                ORDER BY id ASC";

        $params = [$puesto, $tipo_contrato];

    } else {
        $sql = "SELECT id, nombre_uniforme, num_prenda
                FROM catalogo_uniformes
                WHERE puesto_trabajador = $1
                  AND genero = $2
                  AND tipo_contrato = $3
                ORDER BY id ASC";

        $params = [$puesto, $genero, $tipo_contrato];
    }

    $res = pg_query_params($conexion, $sql, $params);

    if (!$res) return [];

    $data = [];

    while ($fila = pg_fetch_assoc($res)) {
        $data[] = [
            'id' => (int)$fila['id'],
            'nombre_uniforme' => $fila['nombre_uniforme'],
            'num_prenda' => (int)$fila['num_prenda']
        ];
    }

    return $data;
}