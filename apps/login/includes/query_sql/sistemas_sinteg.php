<?php
require_once "../../conf/conexion.php";

function getSistemas_sinteg()
{
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(["error" => "Error de conexión a la base de datos"]);
        exit;
    }
    $sql = "SELECT id, acronimo, sistema_imagen FROM sistemas_sinteg WHERE estatus = TRUE";
    $resultado = @pg_query($conexion, $sql);


    if (!$resultado) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la consulta SQL"]);
        exit;
    }

    $sistemas = pg_fetch_all($resultado);
    return $sistemas ?: [];

}
echo json_encode(getSistemas_sinteg());