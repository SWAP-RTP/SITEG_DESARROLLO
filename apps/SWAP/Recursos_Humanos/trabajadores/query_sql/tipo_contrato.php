<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json =  array();

$tipo_contrato = "SELECT * FROM trab_tipo_contrato ORDER BY 2";
$query_contrato = @pg_query($conexion, $tipo_contrato);

while($resultado_contrato = @pg_Fetch_array($query_contrato)){
       $json[] = array(
        'tipo_contrato_cve' => $resultado_contrato['tipo_contrato_cve'],
        'tipo_contrato' => $resultado_contrato['tipo_contrato_desc'],
       ); 
}



$jsonstring = json_encode($json);
echo $jsonstring; 
?>