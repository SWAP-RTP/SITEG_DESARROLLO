<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');


try {
    @pg_query($conexion, "BEGIN");

    // actualiza los datos del cuso
    $talla_trabajador = "UPDATE trab_talla 
                            SET trab_talla_num = $_POST[talla] 
                          WHERE trab_talla_tipo_cve = $_POST[id_talla]
                            AND trab_credencial = $_POST[credencial]";
    $query_talla = @pg_query($conexion, $talla_trabajador);
 
    if (!$query_talla) { 
        throw new Exception('Hubo un error al editar la talla del trabajador');  
    }else{
        @pg_query($conexion, "COMMIT");
        $response = array("success" => true); 
    }

} catch (Exception $e) {

    @pg_query($conexion, "ROLLBACK");
    $response = array("error" => true, "mensaje" => $e->getMessage());
    
}




$jsonstring = json_encode($response);
echo $jsonstring; 
?>