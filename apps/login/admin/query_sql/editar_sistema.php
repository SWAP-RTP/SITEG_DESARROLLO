<?php
require_once "../../conf/conexion.php";

$conexion = Database::conectar();
if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

$id_sistem = $_POST['id_sistem'];
$tip_sistem = $_POST['tip_sistem'];
$ip = $_POST['ip'];
$puerto = $_POST['puerto'];
$acronimo = $_POST['acronimo'];
$nombre = $_POST['nombre'];

$campos_a_actualizar = [];

if ($_POST['tip_sistem'] != $_POST['tip_sistem2']) {
    $campos_a_actualizar[] = "tipo_sistema = $tip_sistem";
}
if ($_POST['ip'] != $_POST['ip2']) {
    $campos_a_actualizar[] = "direccion_ip = '$ip'";
}
if ($_POST['puerto'] != $_POST['puerto2']) {
    $campos_a_actualizar[] = "puerto = '$puerto'";
}
if ($_POST['acronimo'] != $_POST['acronimo2']) {
    $directorio = "../../includes/img/";

    // 1. Buscamos el archivo físico actual (sea .jpg, .png, etc.)
    $archivos_viejos = glob($directorio . $_POST['acronimo2'] . ".*");

    // 2. actualizamos el nombre de la imagen con el nuevo acronimo
    if (!empty($archivos_viejos)) {
        $ruta_vieja = $archivos_viejos[0]; 
        $extension = pathinfo($ruta_vieja, PATHINFO_EXTENSION);
        $ruta_nueva = $directorio . $_POST['acronimo'] . "." . $extension;

        // 3. ejecutamos el cambio en el servidor
        if (rename($ruta_vieja, $ruta_nueva)) {
            $campos_a_actualizar[] = "acronimo = '{$_POST['acronimo']}'";
        }
    }
}
if ($_POST['nombre'] != $_POST['nombre2']) {
    $campos_a_actualizar[] = "nombre_completo = '$nombre'";
}

// si no se detectaron cambios, se detiene el proceso
if (empty($campos_a_actualizar)) {
    echo json_encode([
        "respuesta" => false,
        "indicador" => 1,
        "mensaje" => "No se detectaron cambios para actualizar."
    ]);
    exit;
}

// Unimos los cambios con comas
$sql_set = implode(", ", $campos_a_actualizar);

$sql_update = "UPDATE sistemas_sinteg SET $sql_set WHERE id = $id_sistem;";
$qry_update = @pg_query($conexion, $sql_update);

if (!$qry_update) {
    echo json_encode([
        "respuesta" => false,
        "indicador" => 2,
        "mensaje" => "Error al actualizar en la base de datos: " . pg_last_error($conexion)
    ]);
    exit;

} else {
    echo json_encode([
        "respuesta" => true,
        "mensaje" => "Sistema actualizado correctamente."
    ]);
}