<?php
require_once "../../conf/conexion.php";

$conexion = Database::conectar();
if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

$id = $_POST['id'];
$acronimo = $_POST['acronimo'];

// eliminar imagen (jpg, png, etc)
$ruta_base = "../../includes/img/" . $acronimo;
$archivos = glob($ruta_base . ".*");

if ($archivos) {
    foreach ($archivos as $archivo) {
        if (file_exists($archivo)) {
            unlink($archivo);
        }
    }
}

$sql_delete = "DELETE FROM sistemas_sinteg WHERE id = $id;";
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
        "mensaje" => "Sistema eliminado correctamente."
    ]);
}