<?php
session_start();

// Ruta y conexión
$path_url = isset($_SESSION['rootApp']) ? $_SESSION['rootApp'] : '';
require($path_url . 'conexion.html');

header('Content-Type: application/json; charset=UTF-8');

if (!conecta($conexion, $_SESSION['servidor'])) {
    echo json_encode(array('error' => 'No se pudo conectar a la base de datos'));
    exit;
}

$credencial = isset($_GET['credencial']) ? trim($_GET['credencial']) : '';
$usr_login  = isset($_SESSION['modulo_o']) ? (int)$_SESSION['modulo_o'] : 0;

if ($credencial === '') {
    echo json_encode(array('success' => false, 'error' => 'No se proporcionó la credencial'));
    pg_close($conexion);
    exit;
}

$sql = "
    SELECT
        v.nombre_completo,
        v.mod_clave,
        v.mod_desc,
        v.puesto_clave,
        v.puesto_descripcion
    FROM trab_view v
    INNER JOIN trabajador t ON v.trab_credencial = t.trab_credencial
    WHERE v.trab_credencial = $1
    LIMIT 1;
";

$result = function_exists('pg_query_params')
    ? pg_query_params($conexion, $sql, array($credencial))
    : pg_query(
        $conexion,
        "SELECT v.nombre_completo, v.mod_clave, v.mod_desc, v.puesto_clave, v.puesto_descripcion
         FROM trab_view v
         INNER JOIN trabajador t ON v.trab_credencial = t.trab_credencial
         WHERE v.trab_credencial = '" . pg_escape_string($conexion, $credencial) . "'
         LIMIT 1;"
      );

if ($result && pg_num_rows($result) > 0) {
    $row = pg_fetch_assoc($result);

    // Si el usuario está atado a un módulo y el trabajador no pertenece a ese
    if ($usr_login !== 0 && (string)$row['mod_clave'] !== (string)$usr_login) {
        echo json_encode(array(
            'success' => true,
            'nombre'  => 'Trabajador pertenece a otro módulo'
        ));
        pg_close($conexion);
        exit;
    }

    echo json_encode(array(
        'success'      => true,
        'nombre'       => $row['nombre_completo'],
        'modulo'       => $row['mod_desc'],
        'mod_clave'    => $row['mod_clave'],
        'puesto'       => $row['puesto_descripcion'],
        'puesto_clave' => $row['puesto_clave']
    ));
} else {
    echo json_encode(array('success' => false, 'error' => 'No se encontraron datos para la credencial'));
}

pg_close($conexion);
