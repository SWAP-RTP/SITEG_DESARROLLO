<?php
require_once "../../conf/conexion.php";

$conexion = Database::conectar();
if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

// print_r($_POST);

$id_usr = $_POST['id_usr'];

$sql_delete = "DELETE FROM usuarios_final WHERE id_usuario = $id_usr;";
$qry_delete = @pg_query($conexion, $sql_delete);

if (!$qry_delete) {
    echo json_encode([
        "respuesta" => false,
        "mensaje" => "Error al eliminar en la base de datos: " . pg_last_error($conexion)
    ]);
    exit;

} else {
    echo json_encode([
        "respuesta" => true,
        "mensaje" => "Usuario eliminado correctamente."
    ]);
}