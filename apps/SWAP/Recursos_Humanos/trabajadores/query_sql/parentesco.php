<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json = array();

$parentesco_sql = "SELECT * FROM trab_parentesco ORDER BY parentesco_cve ASC";
$query_parentesco = @pg_query($conexion, $parentesco_sql);
while($resultado_parentesco = @pg_Fetch_array($query_parentesco)){
  $json[] = array(
    'clave_parentesco' => $resultado_parentesco['parentesco_cve'],
    'parentesco' => $resultado_parentesco['parentesco_desc']
  );
}



$jsonstring = json_encode($json);
echo $jsonstring; 
?>