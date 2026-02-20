<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json =  array();

$nacionalidad_sql = "SELECT * FROM trab_nacionalidad ORDER BY 1";
$query_nacionalidad = @pg_query($conexion,$nacionalidad_sql);
while($nacionalidad_respuesta=@pg_Fetch_array($query_nacionalidad)){
    $json[] = array(
      'nacionalidad_cve' => $nacionalidad_respuesta['nac_cve'],
      'nacionalidad' => $nacionalidad_respuesta['nac_desc']
    );
  
}


$jsonstring = json_encode($json);
echo $jsonstring; 
?>