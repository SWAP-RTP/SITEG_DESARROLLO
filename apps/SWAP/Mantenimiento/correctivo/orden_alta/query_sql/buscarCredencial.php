<?php
session_start();
include($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');
$usr = $_SESSION['usr_id'];
header('Content-Type: application/json');

$busqueda = isset($_GET['q']) ? $_GET['q'] : '';
function buscarCredencial($conexion, $busqueda)
{
    $json = array();

    // 1. Buscar coincidencia exacta si es numero
    if (is_numeric($busqueda) && strlen($busqueda) >= 4) {
        $buscarExacto = "SELECT t.trab_credencial, t.trab_apaterno, t.trab_amaterno, t.trab_nombre, a.adsc_cve, a.mod_cve
            FROM trabajador t
            INNER JOIN adscripcion a ON (t.adsc_cve = a.adsc_cve)
            WHERE t.trab_credencial = '$busqueda'
            LIMIT 1";
        $resultado = @pg_query($conexion, $buscarExacto);

        if ($resultado) {
            while ($data = pg_fetch_assoc($resultado)) {
                $json[] = array(
                    'trab_credencial' => $data['trab_credencial'],
                    'trab_apaterno' => $data['trab_apaterno'],
                    'trab_amaterno' => $data['trab_amaterno'],
                    'trab_nombre' => $data['trab_nombre'],
                    'adsc_cve' => $data['adsc_cve'],
                    'mod_cve' => $data['mod_cve'],
                    'tipo_trab_clave' => $data['tipo_trab_clave'],
                    'trab_status' => $data['trab_status']
                );
            }
        }
        // Si encontró exacto, regresa solo ese resultado y termina
        if (count($json) > 0) {
            echo json_encode($json);
            exit;
        }
    }

    // 2. Si no encontró exacto, busca por coincidencia parcial
    $buscarParcial = "SELECT t.trab_credencial, t.trab_apaterno, t.trab_amaterno, t.trab_nombre, a.adsc_cve, a.mod_cve
        FROM trabajador t
        INNER JOIN adscripcion a ON (t.adsc_cve = a.adsc_cve)
        WHERE t.trab_credencial ILIKE '%$busqueda%' OR t.trab_nombre ILIKE '%$busqueda%'
        ORDER BY t.trab_credencial
        LIMIT 20";
    $resultado = @pg_query($conexion, $buscarParcial);

    $json = array();
    if ($resultado) {
        while ($data = pg_fetch_assoc($resultado)) {
            $json[] = array(
                'trab_credencial' => $data['trab_credencial'],
                'trab_apaterno' => $data['trab_apaterno'],
                'trab_amaterno' => $data['trab_amaterno'],
                'trab_nombre' => $data['trab_nombre'],
                'adsc_cve' => $data['adsc_cve'],
                'mod_cve' => $data['mod_cve']
            );
        }
    }
    echo json_encode($json);
    exit;
}

buscarCredencial($conexion, $busqueda);