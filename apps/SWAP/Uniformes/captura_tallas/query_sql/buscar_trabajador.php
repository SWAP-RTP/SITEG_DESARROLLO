<?php
require_once __DIR__ . '/../../../config/conexion.php';

try{

    // conexión a la base de datos
    $conexion = conexion();
    //si la conexión falla se lanza un error
    if (!$conexion) {
        throw new Exception("Error al conectar con la DB");
    }
    $credencial = obtenerCredencial();

    validarCredencial($credencial);
    // $modulo_usuario = obtenerModuloUsuario();

    $trabajador = obtenerTrabajador($conexion, $credencial);

    validarExistencia($trabajador);

    validarActivo($trabajador);
    validarBase($trabajador);
    // validarModulo($trabajador, $modulo_usuario);

    // respuesta final
    responderTrabajador($trabajador);

} catch (Exception $e) {

    echo json_encode([
        "status" => "error",
        "mensaje" => $e->getMessage()
    ]);
}


//Obtener datos de la credencial enviada desde el front

function obtenerCredencial() {
    return $_GET['credencial'] ?? '';
}

// function obtenerModuloUsuario() {
//     return $_SESSION['modulo_o'] ?? 0;
// }


//Validar que se haya proporcionado una credencial
function validarCredencial($credencial) {
    if (empty($credencial)) {
        throw new Exception("No se proporcionó la credencial");
    }
}

function validarExistencia($data) {
    if (!$data) {
        throw new Exception("No se encontraron datos para la credencial");
    }
}

//Obtener información del trabajador desde la base de datos
function obtenerTrabajador($conexion, $credencial) {

    $sql = "SELECT 
                t.trab_credencial,
                t.trab_nombre || ' ' || t.trab_apaterno || ' ' || t.trab_amaterno AS nombre_completo,
                t.puesto_clave,
                p.puesto_descripcion as puesto,
                t.tipo_contrato_cve,
                tc.tipo_contrato_desc,
                t.trab_sex_cve,
                ts.trab_sex_desc as genero,
                t.trab_foto as foto,
                t.trab_status,
                t.tipo_trab_clave
            FROM trabajador t
            INNER JOIN trab_puesto p 
                ON t.puesto_clave = p.puesto_clave
            INNER JOIN trab_tipo_contrato tc 
                ON t.tipo_contrato_cve = tc.tipo_contrato_cve
            INNER JOIN trab_sex ts
                ON t.trab_sex_cve = ts.trab_sex_cve
            WHERE t.trab_credencial = '$credencial'
            LIMIT 1";

    $res = pg_query($conexion, $sql);

    if ($res && pg_num_rows($res) > 0) {
        return pg_fetch_assoc($res);
    }

    return null;
}

//Clasificar al trabajador según su puesto
function validarActivo($data) {
    if ($data['trab_status'] != '1') {
        responderMensaje("Trabajador INACTIVO");
    }
}

function validarBase($data) {
    if ($data['tipo_trab_clave'] != '1') {
        responderMensaje("Trabajador no pertenece a base");
    }
}

// function validarModulo($data, $modulo_usuario) {
//     if ($modulo_usuario != 0 && $data['mod_clave'] != $modulo_usuario) {
//         responderMensaje("Trabajador pertenece a otro módulo");
//     }
// }


//Respuesta
function responderMensaje($mensaje) {
    echo json_encode([
        "status" => "ok",
        "nombre" => $mensaje
    ]);
    exit;
}

function responderTrabajador($data) {

    echo json_encode([
        "status" => "ok",
        "nombre_completo" => $data['nombre_completo'],
        // "modulo" => $data['mod_desc'],
        // "mod_clave" => $data['mod_clave'],
        "puesto_clave" => $data['puesto_clave'],
        "puesto" => $data['puesto'],
        "genero" => $data['genero'],
        "foto" => $data['foto'],
        "tipo_contrato" => $data['tipo_contrato_cve'],
        "tipo_contrato_desc" => $data['tipo_contrato_desc'],
        // "tipo_trab_proc" => $data['tipo_trab_proc']
        "tipo_trab_clave" => $data['tipo_trab_clave']
    ]);
}