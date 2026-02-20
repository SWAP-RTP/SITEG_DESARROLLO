<?php
session_start();

require(__DIR__ . '/../../public/conexion.php');

header('Content-Type: application/json');

if (conecta($conexion, 'postgres_5438')) {

    //des es el nombre de la columna pero es una palabra reserbada por lo que se renombra la columna
    $sql = 'SELECT id, "desc" AS descripcion
        FROM pv_estados_motivos';

    $qry = pg_query($conexion, $sql);
    $data = [];

    while ($row = pg_fetch_assoc($qry)) {
        $data[] = [
            'id' => $row['id'],
            'desc'  => $row['descripcion']
        ];
    }

    echo json_encode($data);
    exit;
}

echo json_encode([]);
?>