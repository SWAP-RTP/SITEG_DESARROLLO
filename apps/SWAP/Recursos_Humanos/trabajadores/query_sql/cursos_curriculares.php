<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json =  array();

$cursos_curriculares_sql = "SELECT  * FROM trab_cursos WHERE trab_credencial = $_POST[credencial] ORDER BY 4 ASC";
$query_cursos = @pg_query($conexion, $cursos_curriculares_sql);
while($resultado_cursos = @pg_Fetch_array($query_cursos)){
  $json[] = array(
    'clave_curso' => $resultado_cursos['trab_curso_cve'],
    'curso_nombre' => $resultado_cursos['trab_curso_nombre'],
    'curso_fecha' => $resultado_cursos['trab_curso_fecha'],
    'curso_institucion' => $resultado_cursos['trab_curso_institucion'],
  );
}



$jsonstring = json_encode($json);
echo $jsonstring; 
?>