<?php
require_once __DIR__ . '/../../../config/conexion.php';

try{

    // conexión a la base de datos
    $conexion = conexion();
    //si la conexión falla se lanza un error
    if (!$conexion) {
        throw new Exception("Error al conectar con la DB");
    }
    //se obtiene todos los datos enviados desde el formulario
    $datos = obtenerDatosFormulario();
    //se clasifica el puesto del trabajador (Operador, mantenimiento o auxiliar)
    $clasificacion = clasificarPuesto($datos['puesto_clave']);
    //genero 1 es masculino, 2 es femenino 
    $genero = ((int)$datos['genero'] === 1) ? 1 : 2;
     //tipo de contrato 1 es indeterminado y 2 es determinado
    $tipo_contrato = ($datos['tipo_contrato'] == "1") ? 1 : 2;
    //consulta catalogo para obtener el total de prendas que le corresponden al trabajador segun su clasificacion, genero y tipo de contrato
    $total_prendas_catalogo = obtenerCatalogoUniformes(
        $conexion,
        $clasificacion,
        $genero,
        $tipo_contrato
    );
    //se verifica si el trabajador ya fue registrado anteriormente
    if (verificarTrabajadorExistente($conexion,$datos['credencial'])) {
        //si ya existe envia una respuesta
        echo json_encode([
            "status" => "existe",
            "mensaje" => "El trabajador ya fue registrado"
        ]);

        exit;
    }
    //calcula el numero total de prendas seleccionadas en el formulario
    $total_prendas_real = calcularPrendasSeleccionadas($conexion);

    //inserta eñl registro principal del trabajador
    insertarEncabezado($conexion,$datos,$total_prendas_real);
    
    //inserta el detalle de cada prenda seleccionada
    $errores = insertarDetallePrendas($conexion,$datos['credencial']);

    //envia la respuesta final al front
    responderResultado($errores);

}catch (Exception $e) {

    //devuelve el mensaje de error 
    echo json_encode([
        "status" => "error",
        "mensaje" => $e->getMessage()
    ]);
}


// obtener los datos del formulario
function obtenerDatosFormulario(){
    //devuelve un arreglo con los datos del formulario
    return [
        "credencial" => $_POST['credencial'], //cred del trabajador
        "modulo" => $_POST['modulo_clave'], //modulo al que pertenece el trabajador
        "observaciones" => $_POST['observ'], //observaciones
        "talla" => $_POST['talla'], //talla general del trabajador
        "genero" => $_POST['genero'], //genero del trabajador
        "tipo_contrato" => $_POST['tipo_contrato'], //tipo de contrato del trabajador
        "puesto_clave" => $_POST['puesto'], //clave del puesto del trabajador
        "asistencia" => $_POST['estatus'], //presencual o capturado
        "usuario" => $_SESSION['usr_id'] //usuario que captura el registro
    ];
}


//clasificacion del puesto del trabajador
function clasificarPuesto($puesto){
    //arreglos con las claves de los puestos para cada clasificación
    $puestos_operadores = [42,214,215,221];
    $puestos_mantenimiento = [1,2,3,5,6,7,9,10,11,13,14,15,40,222,223,224,225];
    $puestos_auxiliar = [17,216,34,35,36,230,231];
    //verifica a que clasificación pertenece el puesto
    if(in_array($puesto,$puestos_operadores)){
        return 1;
    }

    if(in_array($puesto,$puestos_mantenimiento)){
        return 2;
    }

    if(in_array($puesto,$puestos_auxiliar)){
        return 3;
    }
    //si no pertenece a ninguna clasificación devuelve 0
    return 0;
}

//consulta catalogo uniformes 
function obtenerCatalogoUniformes($conexion,$clasificacion,$genero,$tipo_contrato){


    if($clasificacion === 2){

        // mantenimiento → unisex
        $sql = "
        SELECT id
        FROM catalogo_uniformes
        WHERE puesto_trabajador = $clasificacion
        AND tipo_contrato = $tipo_contrato
        ";

    }else{

        $sql = "
        SELECT id
        FROM catalogo_uniformes
        WHERE puesto_trabajador = $clasificacion
        AND genero = $genero
        AND tipo_contrato = $tipo_contrato
        ";

    }

    $res = pg_query($conexion,$sql);

    return pg_num_rows($res);
}

//verificar si el trabjador ya fue registrado anteriormente
function verificarTrabajadorExistente($conexion,$credencial){
    //consulta que busca si ya existe un registro activo para esa credencial
    $sql = "SELECT id 
            FROM trabajador_uniforme 
            WHERE credencial = $credencial 
            AND estatus = 1";
    //ejecuta la consulta
    $res = pg_query($conexion,$sql);
    //devuelve true si encuentra un registro, false si no
    return pg_num_rows($res) > 0;
}


//calcula el numero total de prendas seleccionadas en el formulario
function calcularPrendasSeleccionadas($conexion){
    //variable para acumular el total de prendas
    $total = 0;
    //recorre todos los datos enviados por POST
    foreach ($_POST as $key=>$value){
        //busca los campos que corresponden a prendas (id_prenda)
        if(strpos($key,'id_prenda') !== false && !empty($value)){
            //obtiene el id del catalago
            $id = intval(str_replace('id_prenda','',$key));
            //consulta cuantas prendas corresponden a ese registro
            $sql = "SELECT num_prenda 
                    FROM catalogo_uniformes 
                    WHERE id = $id";

            $res = pg_query($conexion,$sql);
            //si la consulta es exitosa y encuentra el registro, suma el numero de prendas al total
            if($res && pg_num_rows($res)>0){

                $row = pg_fetch_assoc($res);

                $total += (int)$row['num_prenda'];
            }
        }
    }
    //devuelve el total de prendas seleccionadas
    return $total;
}


//inserta el registro principal del trabajador en la tabla trabajador_uniforme
function insertarEncabezado($conexion,$datos,$total){
    //inserta el registro principal del trabjador 
    $sql = "INSERT INTO trabajador_uniforme
            (id,credencial,total_prendas_adquiridas,modulo,estatus,
             fecha_registro,fecha_ultimo_movimiento,observaciones,
             tipo_contrato,asistencia,usuario_captura)
            VALUES
            (
            (SELECT COALESCE(MAX(id)+1,1) FROM trabajador_uniforme),
            {$datos['credencial']},
            $total,
            {$datos['modulo']},
            1,
            now(),
            NULL,
            '{$datos['observaciones']}',
            {$datos['tipo_contrato']},
            '{$datos['asistencia']}',
            {$datos['usuario']}
            )";

    pg_query($conexion,$sql);
}


//insertar detalle prendas
function insertarDetallePrendas($conexion,$credencial){
    //arreglo para guardar errores
    $errores = [];
    //recorre los datos enviados
    foreach($_POST as $key=>$value){
        //busca coampos que contengan id_prenda
        if(strpos($key,'id_prenda') !== false && !empty($value)){
            //obtiene el id del catálogo
            $id_catalogo = intval(str_replace('id_prenda','',$key));
            //limpia la talla ingresada    
            $value = strtoupper(trim($value));
            //inserta cada prenda seleccionada en el detalle del trabajador
            $sql = "INSERT INTO detalle_trabajador_uniforme
                    (id,id_trabajador_uniforme,id_catalogo_uniforme,talla)
                    VALUES
                    (
                    (SELECT COALESCE(MAX(id)+1,1) FROM detalle_trabajador_uniforme),
                    (SELECT id FROM trabajador_uniforme WHERE credencial=$credencial AND estatus=1),
                    $id_catalogo,
                    '$value'
                    )";
            //ejecuta la inserción
            $qry = pg_query($conexion,$sql);
            //si falla guarda el error
            if(!$qry){
                $errores[] = "Error al insertar prenda ID $id_catalogo";
            }
        }
    }
    //devuelve el arreglo de errores
    return $errores;
}


//respuesta final al front dependiendo si hubo errores o no en la inserción de las prendas
function responderResultado($errores){
    //si no hubo errores devuelve un mensaje de éxito
    if(empty($errores)){

        $respuesta = [
            "status"=>"success",
            "mensaje"=>"Datos insertados correctamente"
        ];

    }else{
        //si hubo errores parciales devuelve un mensaje indicando que algunos datos no se pudieron insertar junto con los errores
        $respuesta = [
            "status"=>"partial_success",
            "mensaje"=>"Algunos datos no se pudieron insertar",
            "errores"=>$errores
        ];
    }
    //devuelve la respuesta final al front
    echo json_encode($respuesta);
}
?>
