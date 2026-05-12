<?php
require_once "../../conf/conexion.php";
$guardar_imagen = "../../includes/img/";

$conexion = Database::conectar();
if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

$credencial_user = $_POST['credencial_user'];
$acronimo = $_POST['acronimo'];
$nombre_sistema = $_POST['nombre_sistema'];
// I = INTERNO, E = EXTERNO
if($_POST['tip_sistem'] == 1){
    $tip_sistem = 'I';
}else{
    $tip_sistem = 'E';
}
$ip = isset($_POST['ip']) && $_POST['ip'] != '' ? $_POST['ip']: NULL;
$puerto = isset($_POST['puerto']) && $_POST['puerto'] != '' ? $_POST['puerto']: NULL;

$nombre_temp = $_FILES['imagen']['tmp_name'];
$nombre_original = $_FILES['imagen']['name'];

//Obtenemos la extensión (jpg, png, etc.)
$extension = pathinfo($nombre_original, PATHINFO_EXTENSION);

$acronimo_limpio = preg_replace('/[^A-Za-z0-9_\-]/', '', $acronimo);
$nuevo_nombre_img = $acronimo_limpio . "." . $extension;

$ruta_final = $guardar_imagen . $nuevo_nombre_img;

// Iniciaamos la transacción
$sqlbegin = "BEGIN;";
$result_begin = @pg_query($conexion, $sqlbegin);

// buscamos si existe un registro en la db
$sql_select = "SELECT acronimo FROM sistemas_sinteg WHERE acronimo = '$acronimo' AND estatus = TRUE;";
$qry_select = @pg_query($conexion, $sql_select);
$res = @pg_num_rows($qry_select);

if ($res > 0) {
    echo json_encode([
        "respuesta" => false,
        "mensaje" => "El sistema '$acronimo' ya existe y está activo."
    ]);
    exit;
}

$sql = "INSERT INTO sistemas_sinteg (id, acronimo, nombre_completo, sistema_imagen, direccion_ip, puerto, tipo_sistema, estatus, usr_alta, fecha_alta) 
        VALUES ((SELECT COALESCE(MAX(id) + 1, 1) AS id FROM sistemas_sinteg), '$acronimo', '$nombre_sistema', '$nuevo_nombre_img', '$ip', '$puerto', '$tip_sistem', TRUE, $credencial_user, now());";
$qry = @pg_query($conexion, $sql);

if (!$qry) {
    @pg_query($conexion, "ROLLBACK;");
    echo json_encode([
        "respuesta" => false,
        "mensaje" => "Error al insertar en la base de datos: " . pg_last_error($conexion)
    ]);
    exit;

} else {
    if (move_uploaded_file($nombre_temp, $ruta_final)) {
        @pg_query($conexion, "COMMIT;");
        echo json_encode([
            "respuesta" => true,
            "mensaje" => "Sistema registrado e imagen guardada correctamente."
        ]);
    }
}