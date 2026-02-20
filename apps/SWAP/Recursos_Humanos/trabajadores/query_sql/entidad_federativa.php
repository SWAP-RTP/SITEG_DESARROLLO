<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json = array();



$entidad_federativa_sql = "SELECT * FROM cat_estados ORDER BY 1";
$query_entidad_federativa = @pg_query($conexion, $entidad_federativa_sql);
while($data = @pg_Fetch_array($query_entidad_federativa)){
    $json[] = array(
        'estado_cve' => $data['estado_cve'],
        'estado' => $data['estado_nombre'],
    );
}



$jsonstring = json_encode($json);
echo $jsonstring; 
?>