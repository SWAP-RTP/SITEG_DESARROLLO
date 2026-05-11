<?php

session_start();

require_once __DIR__ . '/funciones.solicitud.php';

header('Content-Type: application/json; charset=utf-8');

$conexion = Database::conectar();

$id_trabajador = $_POST['id_trabajador'] ?? null;

// $usuario = $_SESSION['usr_id'] ?? null;
$usuario = 1;

if(!$id_trabajador){

    echo json_encode([
        "ok" => false,
        "mensaje" => "ID inválido"
    ]);

    exit;
}

// validar autorización
$sql = "
    SELECT 1
    FROM actualizar_uniforme
    WHERE id_trabajdor_uniforme = $1
      AND estatus = 2
    LIMIT 1
";

$res = pg_query_params($conexion, $sql, [$id_trabajador]);

if(!pg_fetch_assoc($res)){

    echo json_encode([
        "ok" => false,
        "mensaje" => "Solicitud no autorizada"
    ]);

    exit;
}

$resultado = actualizarTallas(
    $conexion,
    (int)$id_trabajador,
    $_POST,
    $usuario
);

if($resultado === true){

    echo json_encode([
        "ok" => true,
        "mensaje" => "Tallas actualizadas correctamente"
    ]);

}else{

    echo json_encode([
        "ok" => false,
        "mensaje" => "Algunas tallas no se actualizaron",
        "errores" => $resultado
    ]);
}