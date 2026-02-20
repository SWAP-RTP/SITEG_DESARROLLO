<?php
session_start();
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');
// Obtener el módulo del usuario
$usr = $_SESSION['usr_id'];
$modulo_usr = isset($_SESSION['modulo_o']) ? $_SESSION['modulo_o'] : 'No definido';

function listarModulos($conexion)
{
    $modulo_usr = $_SESSION['modulo_o'];
    $modulo = $_POST['modulo'];

    // Si es Oficinas Centrales (0) mostrar todos, sino solo su módulo
    if ($modulo_usr == 0) {
        $query_modulo = " SELECT mod_desc, mod_clave
                          FROM modulo
                          WHERE mod_clave >= 0 AND mod_clave <= 7
                          ORDER BY mod_clave;";
    } else {
        $query_modulo = "SELECT mod_desc, mod_clave
                            FROM modulo
                            WHERE mod_clave >= 0
                            AND mod_clave <= 7
                            AND mod_clave = '$modulo_usr'
                            ORDER BY mod_clave";
    }
    $resultado_modulo = @pg_query($conexion, $query_modulo);
    $json = array();

    while ($data = @pg_fetch_assoc($resultado_modulo)) {
        $json[] = array(
            'mod_clave' => $data['mod_clave'],
            'mod_desc' => $data['mod_desc']
        );
    }
    return $json;
}
echo json_encode(array('data' => listarModulos($conexion)));