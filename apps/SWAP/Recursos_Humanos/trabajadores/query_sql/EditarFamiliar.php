<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$finado = !empty($_POST['finado_familiar']) ? 't' : 'f'; 


try {
    @pg_query($conexion, "BEGIN");

    $familiar_dato_anterior = "SELECT * FROM trab_familia WHERE trab_familia_cve = $_POST[id_familiar]";
    $query_familiar_anterior = @pg_query($conexion, $familiar_dato_anterior);
    $resultado_anterior = @pg_fetch_Array($query_familiar_anterior);
    $fecha_convertida = implode('-', array_reverse(explode('/', $resultado_anterior['pariente_fecha_nacimiento'])));

    // Valida que realmentea haya un cambio para realizar la actualizacion
    $condiciones = array();

    if ($resultado_anterior['pariente_nombre'] != $_POST['nombre_familiar']) {
        $condiciones[] = "pariente_nombre = '$_POST[nombre_familiar]'";
    } 
    if ($resultado_anterior['pariente_ap_paterno'] != $_POST['ap_paterno_familiar']) {
        $condiciones[] = "pariente_ap_paterno = '$_POST[ap_paterno_familiar]'";
    } 
    if ($resultado_anterior['pariente_ap_materno'] != $_POST['ap_materno_familiar']) {
        $condiciones[] = "pariente_ap_materno = '$_POST[ap_materno_familiar]'";
    } 
    if ($fecha_convertida != $_POST['fecha_nacimiento_familiar']) {
        $condiciones[] = "pariente_fecha_nacimiento = '$_POST[fecha_nacimiento_familiar]'";
    } 
    if ($resultado_anterior['pariente_sexo'] != $_POST['sexo_familiar']) {
        $condiciones[] = "pariente_sexo = '$_POST[sexo_familiar]'";
    } 
    if ($resultado_anterior['pariente_tel'] != $_POST['telefono_familiar']) {
        $condiciones[] = "pariente_tel = '$_POST[telefono_familiar]'";
    } 
    if ($resultado_anterior['pariente_cve'] != $_POST['parentesco_familiar']) {
        $condiciones[] = "pariente_cve = '$_POST[parentesco_familiar]'";
    } 
    if ($resultado_anterior['trab_familia_finado'] != $finado) {
        $condiciones[] = "trab_familia_finado = '$finado'";
    } 
    if ($resultado_anterior['trab_familia_porcentaje'] != $_POST['porcentaje_familiar']) {
        $condiciones[] = "trab_familia_porcentaje = '$_POST[porcentaje_familiar]'";
    } 

    if (empty($condiciones)) {
        throw new Exception("Al parecer no hubo ningún cambio realizado.");
    }
    $condicion = implode(", ", $condiciones);

    // actualiza los datos del cuso
    $familiar_actualizacion = "UPDATE trab_familia 
                           SET $condicion
                         WHERE trab_familia_cve = $_POST[id_familiar]";
    $query_familiar = @pg_query($conexion, $familiar_actualizacion);
 
    if (!$query_familiar) { 
        throw new Exception('Hubo un error al editar los datos del trabajador');  
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