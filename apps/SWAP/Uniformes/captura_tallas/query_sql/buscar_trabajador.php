<?php
require_once '/var/www/login_shared/conf/conexion.php';

function getTrabajador()
{
    $conexion = Database::conectar();

    if (!$conexion) {
        echo json_encode(["error" => "Error de conexión a la base de datos"]);
        exit;
    }

    $credencial = $_GET['credencial'] ?? '';

    if (empty($credencial)) {
        echo json_encode(["error" => "No se proporcionó la credencial"]);
        exit;
    }

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

    $res = @pg_query($conexion, $sql);

    if (!$res) {
        echo json_encode(["error" => "Error en la consulta SQL"]);
        exit;
    }

    if (pg_num_rows($res) === 0) {
        echo json_encode(["error" => "No se encontraron datos para la credencial"]);
        exit;
    }

    $data = pg_fetch_assoc($res);

    if ($data['trab_status'] != '1') {
        echo json_encode(["error" => "Trabajador inactivo"]);
        exit;
    }

    if ($data['tipo_trab_clave'] != '1') {
        echo json_encode(["error" => "Trabajador no pertenece a base"]);
        exit;
    }

    return [
        "status" => "ok",
        "nombre_completo" => $data['nombre_completo'],
        "puesto_clave" => $data['puesto_clave'],
        "puesto" => $data['puesto'],
        "genero" => $data['genero'],
        "foto" => $data['foto'],
        "tipo_contrato" => $data['tipo_contrato_cve'],
        "tipo_contrato_desc" => $data['tipo_contrato_desc'],
        "tipo_trab_clave" => $data['tipo_trab_clave']
    ];
}

echo json_encode(getTrabajador());