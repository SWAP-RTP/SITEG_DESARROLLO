<?php
$host     = "10.10.31.166";
$port     = "5468";
$dbname   = "db_sugo";
$user     = "postgres";
$password = "postgres";

$str_conn = "host=$host port=$port dbname=$dbname user=$user password=$password options='--client_encoding=UTF8'";
$conexion = pg_connect($str_conn);

if (!$conexion) {
    die("Error critico: No se pudo conectar a la base de datos. " . pg_last_error());
}
pg_set_client_encoding($conexion, "UTF8");
date_default_timezone_set('America/Mexico_City');

echo "Conexion exitosa a la base de datos.";
?>