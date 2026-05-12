<?php
require_once '/var/www/login_shared/conf/conexion.php';
function getModulos_sistema()
{
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(["error" => "Error de conexión a la base de datos"]);
        exit;
    }
    $sql = "SELECT * FROM modulo";
    $resultado = @pg_query($conexion, $sql);


    if (!$resultado) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la consulta SQL"]);
        exit;
    }


    $modulos = pg_fetch_all($resultado);
    return $modulos ?: [];

}
echo json_encode(getModulos_sistema());