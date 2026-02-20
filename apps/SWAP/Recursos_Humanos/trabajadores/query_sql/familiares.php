<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json = array();

if (empty($_POST[credencial])) { //Busca por el id del registro
  $condicion = "tf.trab_familia_cve = $_POST[id]";
} elseif(empty($_POST[id])) { // Busca por la credencial del trabajador 
  $condicion = "tf.trab_credencial = $_POST[credencial]";
}


$familiares_sql = "SELECT 
                            tf.trab_familia_cve, tf.pariente_nombre, tf.pariente_ap_paterno, tf.pariente_ap_materno,
                            coalesce(tf.pariente_nombre, ' ') || coalesce(' ' || tf.pariente_ap_paterno, '') || coalesce(' ' || tf.pariente_ap_materno, '') AS nombre_familiar, 
                            tf.pariente_fecha_nacimiento, tf.pariente_sexo, tf.trab_familia_finado, 
                            date_part('year', age(tf.pariente_fecha_nacimiento)) AS edad, 
                            ts.trab_sex_desc, tf.pariente_tel, tp.parentesco_desc, tf.pariente_cve,
                          CASE tf.trab_familia_finado 
                              WHEN 't' THEN 'SI' 
                              WHEN 'f' THEN 'NO' 
                          END AS finado,
                            tf.trab_familia_porcentaje
                     FROM trab_familia tf
               INNER JOIN trab_parentesco tp ON (tf.pariente_cve  = tp.parentesco_cve)
                LEFT JOIN trab_sex ts ON (tf.pariente_sexo = ts.trab_sex_cve)
                    WHERE $condicion
                 ORDER BY tf.pariente_fecha_nacimiento DESC;";

$query_familiares = @pg_query($conexion, $familiares_sql);
while($resultado_familiares = @pg_Fetch_array($query_familiares)){
  $json[] = array(
    'clave_familiar' => $resultado_familiares['trab_familia_cve'],
    'ap_paterno_familiar' => $resultado_familiares['pariente_ap_paterno'],
    'ap_materno_familiar' => $resultado_familiares['pariente_ap_materno'],
    'nombre' => $resultado_familiares['pariente_nombre'],
    'nombre_familiar' => $resultado_familiares['nombre_familiar'],
    'fecha_nacimiento_familiar' => $resultado_familiares['pariente_fecha_nacimiento'],
    'fecha_nacimiento_familiar_invertido' => date('Y-m-d', strtotime(implode('-', array_reverse(explode('/', $resultado_familiares['pariente_fecha_nacimiento']))))),
    'edad_familiar' => $resultado_familiares['edad'],
    'sexo_familiar_cve' => $resultado_familiares['pariente_sexo'],
    'sexo_familiar' => $resultado_familiares['trab_sex_desc'],
    'telefono_familiar' => $resultado_familiares['pariente_tel'],
    'parentesco_cve' => $resultado_familiares['pariente_cve'],
    'parentesco_familiar' => $resultado_familiares['parentesco_desc'],
    'porcentaje_familiar' => $resultado_familiares['trab_familia_porcentaje'],
    'finado' => $resultado_familiares['trab_familia_finado'],
    'finado_familiar' => $resultado_familiares['finado'],
  );
}



$jsonstring = json_encode($json);
echo $jsonstring; 
?>