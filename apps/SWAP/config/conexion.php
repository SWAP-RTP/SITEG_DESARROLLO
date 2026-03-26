<?php
$host = "10.10.31.177";
$port = 5432;
$dbname = "almacen";
$user = "almacen";
$password = "Almacen";
function conexion()
{
    global $host, $port, $dbname, $user, $password;
    $conexion = @pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
    if (!$conexion) {
        return false;
    }
    return $conexion;
}