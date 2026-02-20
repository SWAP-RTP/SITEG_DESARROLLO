<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json =  array();


$colonia_sql = " SELECT * FROM cat_cp WHERE cp_numero = '$_POST[codigo_postal]'";
$query_colonia = @pg_query($conexion,$colonia_sql);
while($data = @pg_Fetch_array($query_colonia)){
    $json[] = array(
        'colonia_cve' => $data['cp_cve'],
        'colonia' => $data['cp_colonia']
    );
}

$jsonstring = json_encode($json);
echo $jsonstring; 
?>