<?php
// Iniciar sesión
session_start(); // Inicia una sesión para el usuario, permitiendo el uso de variables de sesión

// Incluir archivo de conexión
include ('/usr/local/apache/htdocs/conf/conexion.php'); // Incluye un archivo externo que contiene la configuración y conexión a la base de datos

// Consulta para obtener el último valor de puesto_clave
$ultimoid = "SELECT puesto_clave FROM trab_puesto ORDER BY puesto_clave DESC LIMIT 1;";
$ultimoid_query = pg_query($conexion, $ultimoid);

// Verificar si la consulta tuvo éxito
if ($ultimoid_query) {
    $resultado = pg_fetch_array($ultimoid_query); // Extrae el resultado como un arreglo asociativo
    $puesto_clave = (int)$resultado['puesto_clave'] + 1; 
    $json = array(
        'success' => true,
        'puesto_clave' => $puesto_clave
    );
} else {
    $json = array(
        'error' => true
    );
}
// Codificar en JSON
$jsonstring = json_encode($json); // Convierte el arreglo de datos en formato JSON

// Imprimir el resultado JSON
echo $jsonstring; // Muestra el JSON en pantalla, útil para enviar los datos al cliente o frontend

?>