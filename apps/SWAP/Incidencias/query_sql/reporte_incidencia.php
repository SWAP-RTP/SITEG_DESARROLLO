<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

$path_url = $_SESSION['rootApp'];

// Conexión a la base de datos
require($path_url . 'conexion.html');

$response = array('success' => false, 'message' => '');

if (conecta($conexion, $_SESSION['servidor'])) {
    pg_set_client_encoding($conexion, 'UTF8');
    // Recibe los datos del formulario

    $tipo_jefe = isset($_POST['tipo_jefe']) ? intval($_POST['tipo_jefe']) : 1; // 1 por defecto si no se envía
    $folio = $_POST['folio'];
    $credencial = $_POST['credencial'];
    $nombre = $_POST['nombre'];
    $modulo = $_POST['modulo'];
    $puesto = $_POST['puesto'];
    $economico = isset($_POST['economico']) && trim($_POST['economico']) !== '' ? $_POST['economico'] : 'N/A';
    $fecha = $_POST['fecha'];
    $hora = $_POST['hora'];
    $hora_reporte = ($fecha && $hora) ? "$fecha $hora" : date('Y-m-d H:i:s');
    $planta = isset($_POST['planta']) && trim($_POST['planta']) !== '' ? $_POST['planta'] : 'N/A';
    $postura = isset($_POST['postura']) && trim($_POST['postura']) !== '' ? $_POST['postura'] : 'N/A';
    $ruta = $_POST['ruta'];
    $anomalia_detectada = $_POST['anomalia'];
    $anomalia_id = $_POST['anomalia_clave'];
    $desc_anomalia = $_POST['descripcion'];
    $articulo = isset($_POST['articulo']) && trim($_POST['articulo']) !== '' ? $_POST['articulo'] : 'N/A';
    $art_inciso = isset($_POST['art_inciso']) && trim($_POST['art_inciso']) !== '' ? $_POST['art_inciso'] : 'N/A';
    $mb_articulo = isset($_POST['mb_articulo']) && trim($_POST['mb_articulo']) !== '' ? $_POST['mb_articulo'] : 'N/A';
    $mb_inciso = isset($_POST['mb_inciso']) && trim($_POST['mb_inciso']) !== '' ? $_POST['mb_inciso'] : 'N/A';
    $user_regconsecutivo = $_POST['registro_id'];
    $user_supervisorep = $_POST['supervisor_id'];
    $user_jefaturags = $_POST['jefatura_id'];
    $user_adsctrab = $_POST['gerente_id'];
    $user_captura = $_SESSION['usr_id'];
    $nombre_registro_consecutivo = $_POST['registro_nombre'];
    $nombre_supervisor = $_POST['supervisor_nombre'];
    $nombre_jefatura = $_POST['jefatura_nombre'];
    $nombre_tipo_jefe = $_POST['gerente_nombre'];
    $sql = "INSERT INTO sgio_reportes (
    folio,
    credencial,
    nombre,
    modulo,
    puesto,
    economico,
    hora_reporte,
    planta,
    postura,
    ruta,
    anomalia_detectada,
    anomalia_id,
    desc_anomalia,
    articulo,
    art_inciso,
    mb_articulo,
    mb_inciso,
    user_regconsecutivo,
    nombre_registro_consecutivo,
    user_supervisorep,
    nombre_supervisor,
    user_jefaturags,
    nombre_jefatura,
    user_adsctrab,
    nombre_tipo_jefe, 
    user_captura,
    tipo_jefe
) VALUES (
    '$folio',
    $credencial,
    '$nombre',
    '$modulo',
    '$puesto',
    '$economico',
    '$hora_reporte',
    '$planta',
    '$postura',
    '$ruta',
    '$anomalia_detectada',
    '$anomalia_id',
    '$desc_anomalia',
    '$articulo',
    '$art_inciso',
    '$mb_articulo',
    '$mb_inciso',
    $user_regconsecutivo,
    '$nombre_registro_consecutivo',
    $user_supervisorep,
    '$nombre_supervisor',
    $user_jefaturags,
    '$nombre_jefatura',
    $user_adsctrab,
     '$nombre_tipo_jefe',
    $user_captura,
    $tipo_jefe
)";

    if (pg_query($conexion, $sql)) {
        $response['success'] = true;
        $response['message'] = 'Registro guardado correctamente';
    } else {
        $response['message'] = 'Error al guardar: ' . pg_last_error($conexion);
    }
} else {
    $response['message'] = 'No se pudo conectar a la base de datos';
}

echo json_encode($response);