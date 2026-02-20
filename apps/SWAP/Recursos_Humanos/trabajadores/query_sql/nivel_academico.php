<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json = array();


$escolaridad_sql = "SELECT * FROM trab_escolaridad ORDER BY esc_desc";
$escolaridad_query = @pg_query($conexion, $escolaridad_sql);

while($escolaridad_resultado = @pg_Fetch_array($escolaridad_query)){
    $json[] = array(
        'clave_escolaridad' => $escolaridad_resultado['esc_cve'],
        'escolaridad' => $escolaridad_resultado['esc_desc'],
    );
}


$jsonstring = json_encode($json);
echo $jsonstring; 
?>