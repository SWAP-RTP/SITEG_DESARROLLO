<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

try {
    @pg_query($conexion, "BEGIN");

    // actualiza los datos del curso
    $actualiza_curso = "UPDATE trab_cursos 
                           SET trab_curso_nombre = '$_POST[nombre_curso]', 
                               trab_curso_fecha = '$_POST[fecha_curso]', 
                               trab_curso_institucion = '$_POST[institucion_curso]'
                         WHERE trab_curso_cve = $_POST[clave_curso]";
    $query_curso = @pg_query($conexion, $actualiza_curso);
 
    if (!$query_curso) { 
        throw new Exception('Hubo un error al editar el curso');  
    }else{
        @pg_query($conexion, "COMMIT");
        $response = array("success" => true); 
    }

} catch (Exception $e) {

    @pg_query($conexion, "ROLLBACK");
    $response = array("error" => true, "mensaje" => $e->getMessage());
    
}




$jsonstring = json_encode($response);
echo $jsonstring; 
?>