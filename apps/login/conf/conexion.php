<?php
$host = "10.10.30.28";
$port = 5437;
$dbname = "swap_2025";
$user = "desarrollo";
$password = "desarrollo";

function conexion()
{
    global $host, $port, $dbname, $user, $password;
    $conexion = @pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
    if (!$conexion) {
        return false;
    }
    return $conexion;
}