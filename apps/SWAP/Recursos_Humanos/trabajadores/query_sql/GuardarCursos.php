<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');


try {
    @pg_query($conexion, "BEGIN");
    
    // Registra el curso nuevo del trabajador
    $nuevo_curso = "INSERT INTO trab_cursos VALUES((SELECT coalesce (max(trab_curso_cve), 0) + 1 FROM trab_cursos), $_POST[credencial], '$_POST[nombre_curso]', '$_POST[fecha_curso]', '$_POST[institucion_curso]', $_SESSION[usr_id], '$_SESSION[ip_cliente]')";
    $query_curso = @pg_query($conexion, $nuevo_curso);

    if (!$query_curso) { 
        throw new Exception('Hubo un error al guardar el nuevo curso');  
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