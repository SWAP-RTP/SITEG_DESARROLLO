<?php
session_start();  // Inicia la sesión para gestionar información del usuario. Esta función asegura que la sesión esté disponible para el script actual.

include ('/usr/local/apache/htdocs/conf/conexion.php');  // Incluye el archivo de conexión a la base de datos, donde se establece la conexión con el servidor de la base de datos.

//
$clave_puesto = $_POST["clave_puesto"];
$grupo = $_POST["grupo"];
$rama = $_POST["rama"];
$puesto = $_POST["puesto"];
$nivel = $_POST["nivel"];
$categoria = $_POST["categoria"];
$descripcion = $_POST["descripcion"];
$sueldo_diario = $_POST["sueldo_diario"];
$sueldo_mensual = $_POST["sueldo_mensual"];
$sueldo_integrado = $_POST["sueldo_integrado"];
$status = $_POST["status"];

// Se imprime la consulta SQL para ver cómo quedó.
echo $sql_puestos = "INSERT INTO trab_puesto  
VALUES ($clave_puesto, $grupo, $rama , $puesto, $nivel, '$categoria', '$descripcion', $sueldo_diario, $sueldo_mensual, $sueldo_integrado, $status)";

$qry_puesto = @pg_query($conexion, $sql_puestos);  // Ejecuta la consulta en la base de datos utilizando la conexión ($conexion). El operador @ suprime cualquier mensaje de error generado por `pg_query()`.

// Verifica si la ejecución de la consulta fue exitosa.
if (!$qry_puesto) {
    echo "Algo salio mal";  // Muestra el mensaje "Algo salió mal" si ocurre un error.
} else {
    echo "todo cool";  // Muestra el mensaje "todo cool" indicando que la inserción fue exitosa.
}
?>