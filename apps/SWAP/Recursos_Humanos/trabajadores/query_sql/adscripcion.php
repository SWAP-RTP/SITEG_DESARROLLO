<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json =  array();

$adscripcion="SELECT adsc_cve, adsc_numero,  
                CASE adsc_div_cve
                    WHEN 1 THEN (SELECT dir_nombre FROM adsc_direccion WHERE dir_cve=A.dir_cve AND dir_status=1)
                    WHEN 2 THEN (SELECT ger_nombre FROM adsc_gerencia WHERE ger_cve=A.ger_cve AND ger_status=1)
                    WHEN 3 THEN (SELECT depto_nombre FROM adsc_depto WHERE depto_cve=A.depto_cve AND depto_status=1)
                    WHEN 4 THEN (SELECT oficina_nombre FROM adsc_oficina  WHERE oficina_cve=A.of_cve AND oficina_status=1)
                END  || ' ' ||  
                CASE mod_cve 
                    WHEN 0 THEN  ' ' 
                    ELSE M.mod_desc 
             END AS adscripcion, adsc_numero 
               FROM adscripcion A
         INNER JOIN modulo M ON (A.mod_cve=M.mod_clave) 
              WHERE adsc_status = 1
           ORDER BY adsc_numero";
$query_adscripcion = @pg_query($conexion,$adscripcion);
while($resultado_adscripcion = @pg_Fetch_array($query_adscripcion)) {
    $direccion=substr($resultado_adscripcion[adsc_numero],3,3);
    $gerencias=substr($resultado_adscripcion[adsc_numero],4,2);
    $departamentos=substr($resultado_adscripcion[adsc_numero],5,1);

    $json[] = array(
        'adscripcion_detalle' => $resultado_adscripcion['adsc_numero'].' - '.$resultado_adscripcion['adscripcion'], 
        'adscripcion_cve' => $resultado_adscripcion['adsc_cve'],
        'adscripcion' => $resultado_adscripcion['adscripcion'],
        'direccion' => $direccion,
        'gerencias' => $gerencias,
        'departamentos' => $departamentos,
    );

}




$jsonstring = json_encode($json);
echo $jsonstring; 
?>