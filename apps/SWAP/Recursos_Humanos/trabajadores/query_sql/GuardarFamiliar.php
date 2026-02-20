<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');



$finado = !empty($_POST['finado_familiar']) ? 'true' : 'false'; 

try {
    @pg_query($conexion, "BEGIN");
    
    $NuevoFamiliar = "INSERT INTO trab_familia 
                          VALUES ((SELECT coalesce (max(trab_familia_cve), 0) + 1 FROM trab_familia), 
                                  $_POST[credencial], '$_POST[nombre_familiar]', '$_POST[ap_paterno_familiar]',
                                  '$_POST[ap_materno_familiar]', '$_POST[fecha_nacimiento_familiar]',
                                  $_POST[sexo_familiar], $_POST[telefono_familiar], $_POST[parentesco_familiar],
                                  $finado, $_POST[porcentaje_familiar])";
    $query_NuevoFamiliar = @pg_query($conexion, $NuevoFamiliar);

    if (!$query_NuevoFamiliar) { 
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