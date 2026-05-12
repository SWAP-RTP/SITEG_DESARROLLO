<?php
header('Content-Type: application/json');

// require_once "../../conf/conexion.php";
require_once "getTrabajadoresGeneral.php";


$repo = new TrabajadorRepository();
$resultados = $repo->getTrabajadores(['trab_credencial', 'trab_nombre', 'trab_amaterno', 'trab_apaterno'], ['trab_status' => 2]);
echo json_encode($resultados);

Database::desconectar();





