<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json = array();

// Consulta los permisos del modulo de recursos humanos unicamente.
$tipo_permiso = "SELECT * FROM modulo_perm WHERE trab_credencial = $_SESSION[usr_id] AND cve_modulo = 5";
$tipo_permiso_query = @pg_query($conexion, $tipo_permiso);
// $row_permiso = @pg_num_rows($tipo_permiso_query);

$img_sin_permiso = '/Recursos_Humanos_New/fotos/sin_permiso.png';

while($resultado_permiso = @pg_fetch_Array($tipo_permiso_query)){
    
    $permisos[] = array(
        'credencial' => $resultado_permiso['trab_credencial'],
        'tipo_permiso' => $resultado_permiso['cve_permiso'],
    );
}
    
$json = array(
    'img_sin_permiso' => $img_sin_permiso,
    'permisos' => $permisos
);

$jsonstring = json_encode($json);
echo $jsonstring; 
?>
