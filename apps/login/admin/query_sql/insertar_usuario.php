<?php
require_once "../../conf/conexion.php";
$guardar_imagen = "../../includes/img/";

$conexion = Database::conectar();
if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}
// print_r($_POST);

$credencial = $_POST['creden_user'];
$nombre = $_POST['nombre_user'];
$correo = $_POST['correo_user'];
$contraseña = $_POST['contra_user'];

$sql_select = "SELECT id_usuario FROM usuarios_final WHERE id_usuario = $credencial;";
$qry_select = @pg_query($conexion, $sql_select);
$res_select = @pg_num_rows($qry_select);

if($res_select >= 1){
    echo json_encode([
        "respuesta" => 1,
        "mensaje" => "El usuario con credencial ".$credencial." ya esta registrado."
    ]);
    exit;
}else{
    // Generas el hash usando el algoritmo BCRYPT (el más recomendado)
    $contraseña_encriptada = password_hash($contraseña, PASSWORD_BCRYPT);
    
    $sql_insert = "INSERT INTO usuarios_final (id_usuario, nombre, correo, contrasena)
                   VALUES ($credencial, '$nombre', '$correo', '$contraseña_encriptada');";
    $qry_insert = @pg_query($conexion, $sql_insert);
    
    if (!$qry_insert) {
        echo json_encode([
            "respuesta" => false,
            "mensaje" => "Error al insertar en la base de datos: " . pg_last_error($conexion)
        ]);
        exit;
    
    } else {
        echo json_encode([
            "respuesta" => true,
            "mensaje" => "Usuario registrado correctamente."
        ]);
    }
}