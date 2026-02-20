<?php
// Inicia la sesión para poder acceder a variables de sesión
session_start();

// // Incluye el archivo de configuración para establecer la conexión a la base de datos
// include ('/usr/local/apache/htdocs/conf/conexion.php');

// // Inicializa un array vacío para almacenar el resultado en formato JSON
// $json = array();

// // Consulta para verificar los permisos del módulo de recursos humanos 
// $tipo_permiso = "SELECT * FROM modulo_perm WHERE trab_credencial = $_SESSION[usr_id] AND cve_modulo = 5";

// print_r($session_start);
// // Ejecuta la consulta anterior en la base de datos
// $tipo_permiso_query = @pg_query($conexion, $tipo_permiso);

// while ($resultado_permiso = @pg_fetch_array($tipo_permiso_query)) {
//     $json[] = array(
//         'tipo_permiso' => $resultado_permiso['cve_permiso']
//     );
    
// } 
// // Convierte el array $json a formato JSON
// $jsonstring = json_encode($json);

// // Imprime el JSON para que pueda ser recibido en el frontend
// echo $jsonstring; 

$json = array();
foreach($_SESSION["modulos"]["Recursos_Humanos"] as $valor){
    $json[] = array('tipo_permiso' => $valor );
}

// $json = $_SESSION["modulos"]["Recursos_Humanos"];
echo $jsonstring = json_encode($json);



?>