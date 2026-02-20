<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json = array();


$estado_civil = "SELECT * FROM trab_edo_civil ORDER BY 1";
$query_estado_civl = @pg_query($conexion, $estado_civil);

while($resultado_estado_civil = @pg_Fetch_array($query_estado_civl)){
   $json[] = array(
        'estado_civil_cve' => $resultado_estado_civil['trab_edo_civil_cve'],
        'estado_civil' => $resultado_estado_civil['trab_edo_civil_desc']
   );
}


$jsonstring = json_encode($json);
echo $jsonstring; 
?>