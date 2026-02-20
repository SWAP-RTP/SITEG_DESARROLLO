<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json = array();



$escolaridad_estado="SELECT * FROM trab_escolaridad_estado ORDER BY 1";
$escolaridad_estado_query = @pg_query($conexion, $escolaridad_estado);
while($escolaridad_estado_resultado = @pg_Fetch_array($escolaridad_estado_query)){
   $json[] = array(
        'clave_estado_escolaridad' => $escolaridad_estado_resultado['trab_esc_estado_cve'],
        'estado_escolaridad' => $escolaridad_estado_resultado['trab_esc_estado_desc']
   );
}


$jsonstring = json_encode($json);
echo $jsonstring; 
?>