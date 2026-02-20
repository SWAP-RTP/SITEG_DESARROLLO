<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json =  array();


$tipo_trabajador= "SELECT * FROM tipo_trabajador";
$query_trabajdor= @pg_query($conexion, $tipo_trabajador);

while($resultado_trabajador = @pg_Fetch_array($query_trabajdor)){
    $json[] = array(
        'tipo_trabajdor_cve' => $resultado_trabajador['tipo_trab_clave'],
        'tipo_trabajdor' => $resultado_trabajador['tipo_trab_div'] . ' - ' . $resultado_trabajador['tipo_trab_proc'] . ' - ' . $resultado_trabajador['tipo_trab_descripcion']
    );
}




$jsonstring = json_encode($json);
echo $jsonstring; 
?>