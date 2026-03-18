<?php
require_once __DIR__ . '/../../config/conexion.php';

try{

    // conexión a la base de datos
    $conexion = conexion();
    //si la conexión falla se lanza un error
    if (!$conexion) {
        throw new Exception("Error al conectar con la DB");
    }
    //obtener modulo del usuario
    $modulo_usuario = obtenerModuloUsuario();
    //filtro por modulo
    $filtroModulo = generarFiltroModulo($modulo_usuario);
    //consulta principal para obtener los registros de uniformes
    $trabajadores = obtenerTrabajadores($conexion,$filtroModulo);
    echo json_encode($trabajadores);

    }catch(Exception $e){
    //devuelve el mensaje de error en formato json
    echo json_encode([
        "status"=>"error",
        "mensaje"=>$e->getMessage()
    ]);

}

//obtener modulo del usuario
function obtenerModuloUsuario(){
    return intval($_SESSION['modulo_o']);
}

//generar filtro por modulo
function generarfiltroModulo($modulo_usuario){
    
if($modulo_usuario === 0){
    return "AND tv.mod_clave = $modulo_usuario";
    }
    return "";
}

//consulta principal para obtener los registros de uniformes
function obtenerTrabajadores($conexion,$filtroModulo){

    $sql = "
    SELECT 
        tu.id,
        tu.credencial,
        tv.nombre_completo AS nombre,
        tv.trab_sex_desc AS genero,
        ttc.tipo_contrato_desc AS contrato,
        tv.puesto_descripcion AS puesto,
        tu.modulo,
        tu.observaciones,
        tu.total_prendas_adquiridas,
        CASE 
            WHEN au.estatus = 2 THEN 1 
            ELSE 0 
        END AS habilitado
    FROM trabajador_uniforme tu
    JOIN trab_view tv ON tv.trab_credencial = tu.credencial
    JOIN trab_tipo_contrato ttc ON ttc.tipo_contrato_cve = tu.tipo_contrato
    LEFT JOIN (
        SELECT DISTINCT ON (id_trabajdor_uniforme) 
            id_trabajdor_uniforme, 
            estatus
        FROM actualizar_uniforme
        WHERE estatus = 2
        ORDER BY id_trabajdor_uniforme, fecha_habilitacion DESC
    ) au ON au.id_trabajdor_uniforme = tu.id
    WHERE tu.estatus = 1
    $filtroModulo
    ORDER BY tu.id DESC
    ";

    $res = pg_query($conexion,$sql);

    $registros = [];

    while($fila = pg_fetch_array($res)){

        $id = $fila['id'];

        $detalle = obtenerDetalleUniformes($conexion,$id);

        $registros[] = [
            "id"=>$fila['id'],
            "credencial"=>$fila['credencial'],
            "nombre_completo"=>utf8_encode($fila['nombre']),
            "genero"=>$fila['genero'],
            "tipo_contrato"=>$fila['contrato'],
            "total_prenda"=>$fila['total_prendas_adquiridas'],
            "obs"=>$fila['observaciones'],
            "detalles_registro"=>$detalle,
            "habilitado"=>$fila['habilitado']
        ];

    }

    return $registros;

}

//obtener detalle de prendas por cada registro
function obtenerDetalleUniformes($conexion,$id_trabajador){

    $sql_detalle = "
    SELECT 
        dtu.id,
        dtu.id_trabajador_uniforme,
        dtu.id_catalogo_uniforme,
        dtu.talla,
        cu.nombre_uniforme,
        cu.num_prenda
    FROM detalle_trabajador_uniforme dtu
    JOIN catalogo_uniformes cu 
        ON cu.id = dtu.id_catalogo_uniforme
    WHERE dtu.id_trabajador_uniforme = $id_trabajador
    ";

    $query = pg_query($conexion,$sql_detalle);

    $detalle = [];

    while($fila = pg_fetch_array($query)){

        $detalle[] = [
            "id"=>$fila['id'],
            "nombre_prenda"=>$fila['nombre_uniforme'],
            "cantidad"=>$fila['num_prenda'],
            "talla"=>$fila['talla']
        ];

    }

    return $detalle;

}

