<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');


try {
    @pg_query($conexion, "BEGIN");
    
    $EliminarFamiliar = "DELETE FROM trab_familia WHERE trab_familia_cve = $_POST[id]";
    $QueryEliminar = @pg_query($conexion, $EliminarFamiliar);

    if (!$QueryEliminar) { 
        throw new Exception('Hubo un error al registrar el nuevo familiar');  
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