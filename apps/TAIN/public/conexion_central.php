<?php
$localhost = '10.10.30.27';
$port = '5432';
$dbname = 'almacen';
$user = 'almacen';
$password = 'Almacen';

function conecta(&$conexion)
{
    global $localhost, $port, $dbname, $user, $password;

    $conexion = @pg_connect("host=$localhost port=$port dbname=$dbname user=$user password=$password");

    if ($conexion)
        return 1;
    else
        return 0;
}
?>