<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json =  array();

$puesto_sql = "SELECT puesto_clave, puesto_sdo_mensual,
                      puesto_grupo || puesto_rama || puesto_puesto ||puesto_nivel || puesto_categoria || ' - ' || puesto_descripcion as puesto_desc
                 FROM trab_puesto
                WHERE puesto_sdo_mensual != 0 
             ORDER BY 2";
$query_puesto = @pg_query($conexion, $puesto_sql);
while($resultado_puesto = @pg_Fetch_array($query_puesto)){
  $json[] = array(
    'puesto_clave' => $resultado_puesto['puesto_clave'],
    'detalle_puesto' => $resultado_puesto['puesto_desc'].' - '.'$'.$resultado_puesto['puesto_sdo_mensual']
  );
}



$jsonstring = json_encode($json);
echo $jsonstring; 
?>