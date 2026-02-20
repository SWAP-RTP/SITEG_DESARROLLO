<?php
session_start();

require(__DIR__ . '/../../public/conexion.php');

header('Content-Type: application/json');

if (conecta($conexion, 'postgres_5438')) {

    $sql = "SELECT cve_tipo_unidad, descripcion FROM pv_tipo_unidad;";

    $qry = pg_query($conexion, $sql);
    $data = [];

    while ($row = pg_fetch_assoc($qry)) {
        $data[] = [
            'clave_unidad' => $row['cve_tipo_unidad'],
            'descripcion' => $row['descripcion'],
        ];
    }

    echo json_encode($data);
    exit;
}

?>