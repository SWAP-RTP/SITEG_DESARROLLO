<?php


// Si no hay usuario logeado
if (!isset($_SESSION[usuario])){
    session_destroy();
    header("Location: /");
}

// Ubicación del usuario
$moduloActual = explode('/',substr(dirname($_SERVER[REQUEST_URI]),1));  // Obtener nombre de carpetas
$Modulo = $moduloActual[0];                                             //Obtener la Carpeta del proyecto

// Permisos del Usuario
$modulos=$_SESSION[modulos];
for ($i=0; $i < count ($modulos[$Modulo]); $i++)
    $permiso[]=$modulos[$Modulo][$i];

if(empty($permiso)){
    header("Location: /menu.html");
}

header('Content-Type: text/html; charset=UTF-8'); // Para acentos y tildes

?>