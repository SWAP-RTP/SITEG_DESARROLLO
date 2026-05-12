<?php
require_once "/var/www/login_shared/conf/conexion.php";

function obtenerModulos()
{
    $conexion = Database::conectar();

    if (!$conexion) {
        http_response_code(500);
        echo json_encode(["error" => "Error de conexión a la base de datos"]);
        exit;
    }

    $modulos = "SELECT * 
                FROM modulo
                WHERE mod_clave BETWEEN 0 AND 7";
    $resultado = @pg_query($conexion, $modulos);

    if (!$resultado) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la consulta SQL"]);
        exit;
    }

    $modulos_array = pg_fetch_all($resultado);
    return $modulos_array ?: [];


}

echo json_encode(obtenerModulos());