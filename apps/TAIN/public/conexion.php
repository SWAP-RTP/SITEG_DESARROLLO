<?php
$localhost = 'postgres_5438'; // o '127.0.0.1' si estás fuera del contenedor

function conecta(&$conexion, $localhost)
{
    $conexion = @pg_connect("host=$localhost port=5432 dbname=tablero user=desarrollo1 password=desarrollo1");

    if ($conexion)
        return 1;
    else
        return 0;
}
?>