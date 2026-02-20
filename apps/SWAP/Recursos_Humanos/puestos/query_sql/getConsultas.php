<?php
session_start();
$url=$_SESSION[rootApp];
require_once($url.'/conexion.html');

//Verifica la conexion para poder realizar el proceso
if (conecta($conexion,$_SESSION[servidor])){

// Incluir archivo de conexión
include ('/usr/local/apache/htdocs/conf/conexion.php'); // Incluye un archivo externo que contiene la configuración y conexión a la base de datos

// Inicializar un array
$json = array(); // Declara un arreglo vacío para almacenar los datos que se obtendrán de la base de datos

// Consulta SQL para obtener todos los datos de la tabla "trab_puesto"
$puestos = "SELECT * FROM trab_puesto"; // Define la consulta SQL para seleccionar todos los registros de la tabla "trab_puesto"

// Ejecutar la consulta SQL
$puestos_query = pg_query($conexion, $puestos); // Ejecuta la consulta en la base de datos, utilizando la conexión establecida

// Recuperar y almacenar resultados
while($resultados = pg_fetch_array($puestos_query)){ // Itera a través de cada fila de resultados obtenidos en la consulta
    $json[] = array(
        "clave_puesto" => $resultados['puesto_clave'], // Asigna el valor de la columna "puesto_clave" a "clave_puesto"
        "puesto_grupo" => $resultados['puesto_grupo'], // Asigna el valor de "puesto_grupo"
        "puesto_rama" => $resultados['puesto_rama'], // Asigna el valor de "puesto_rama"
        "puesto_puesto" => $resultados['puesto_puesto'], // Asigna el valor de "puesto_puesto"
        "puesto_nivel" => $resultados['puesto_nivel'], // Asigna el valor de "puesto_nivel"
        "puesto_categoria" => $resultados['puesto_categoria'], // Asigna el valor de "puesto_categoria"
        "puesto_descripcion" => $resultados['puesto_descripcion'], // Asigna el valor de "puesto_descripcion"
        "puesto_sdo_diario" => $resultados['puesto_sdo_diario'], // Asigna el valor de "puesto_sdo_diario"
        "puesto_sdo_mensual" => $resultados['puesto_sdo_mensual'], // Asigna el valor de "puesto_sdo_mensual"
        "puesto_descripcion_ant" => $resultados['puesto_descripcion_ant'], // Asigna el valor de "puesto_descripcion_ant"
        "puesto_sario_integrado" => $resultados['puesto_sario_integrado'], // Asigna el valor de "puesto_sario_integrado"
        "puesto_status" => ($resultados['puesto_status'] == 1 ? 'A' : 'I') // Verifica el estado de "puesto_status" y lo asigna como 'A' (activo) o 'I' (inactivo)
    );
}

// Codificar en JSON
$jsonstring = json_encode($json); // Convierte el arreglo de datos en formato JSON

// Imprimir el resultado JSON
echo $jsonstring; // Muestra el JSON en pantalla, útil para enviar los datos al cliente o frontend
}
?>