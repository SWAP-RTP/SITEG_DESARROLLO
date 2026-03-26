<?php
require_once "../../conf/conexion.php";

$conexion = Database::conectar();
if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

// print_r($_POST);

$id_user = $_POST['id_usr'];
$nuevo_correo = $_POST['nuevo_correo'];
$nueva_contra = $_POST['nuevo_contra'];

// Generas el hash usando el algoritmo BCRYPT (el más recomendado)
$contraseña_encriptada = password_hash($nueva_contra, PASSWORD_BCRYPT);

$sql_update = "UPDATE usuarios_final SET correo = '$nuevo_correo', contrasena = '$contraseña_encriptada' 
               WHERE id_usuario = $id_user;";
$qry_update = @pg_query($conexion, $sql_update);

if (!$qry_update) {
    echo json_encode([
        "respuesta" => false,
        "mensaje" => "Error al actualizar en la base de datos: " . pg_last_error($conexion)
    ]);
    exit;

} else {
    echo json_encode([
        "respuesta" => true,
        "mensaje" => "Usuario actualizado correctamente."
    ]);
}