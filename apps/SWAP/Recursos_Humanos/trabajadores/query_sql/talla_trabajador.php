<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json = array();


$talla_trabajador_sql = "SELECT * FROM trab_talla tt 
                             LEFT JOIN trab_talla_tipo ttt ON(tt.trab_talla_tipo_cve = ttt.trab_talla_cve)
                                 WHERE tt.trab_credencial = $_POST[credencial]";
$query_tallas = @pg_query($conexion, $talla_trabajador_sql);
$num = 0;
while($resultado_tallas = @pg_fetch_Array($query_tallas)){
    $num++;
    $json[] = array(
        'num' => $num,
        'clave_tipo_talla' => $resultado_tallas['trab_talla_cve'],
        'tipo_nombre' => $resultado_tallas['trab_talla_nombre'],
        'no_talla' => $resultado_tallas['trab_talla_num'],
    );
}

$jsonstring = json_encode($json);
echo $jsonstring; 
?>