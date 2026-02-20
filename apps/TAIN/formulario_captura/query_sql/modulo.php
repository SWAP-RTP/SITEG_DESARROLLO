<?php
session_start();

require(__DIR__ . '/../../public/conexion.php');

header('Content-Type: application/json');

if (conecta($conexion, 'postgres_5438')) {

    $sql = "SELECT mod_clave, mod_desc
        FROM modulo
        WHERE mod_clave BETWEEN 1 AND 7
        ORDER BY mod_clave
    ";

    $qry = pg_query($conexion, $sql);
    $data = [];

    while ($row = pg_fetch_assoc($qry)) {
        $data[] = [
            'mod_clave' => $row['mod_clave'],
            'mod_desc'  => $row['mod_desc']
        ];
    }

    echo json_encode($data);
    exit;
}

echo json_encode([]);
?>