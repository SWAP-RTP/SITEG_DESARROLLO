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
    $sql = "SELECT id, acronimo, nombre_completo, direccion_ip, puerto, tipo_sistema, usr_alta, fecha_alta 
            FROM sistemas_sinteg 
            WHERE estatus = TRUE";
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
<<<<<<< HEAD

//Database::desconectar();
=======
Database::desconectar();
>>>>>>> 6f120f5044b5af850cc25193832107cecdade61c
