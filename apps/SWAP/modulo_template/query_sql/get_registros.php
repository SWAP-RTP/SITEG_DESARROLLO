<?php
session_start();

require(__DIR__ . '../../../conexion.php');

if (conecta($conexion, 'db_swap')) { 


    $sql = "SELECT id, trab_credencial, trab_nombre, trab_monto FROM trabajador_deudor;";
    $qry = pg_query($conexion, $sql);

    if (!$qry) {
        error_log("Error en la consulta: " . pg_last_error($conexion));
        echo json_encode(["error" => "Error en la consulta a la base de datos"]);
        pg_close($conexion);
        exit;
    }

    $data = [];
    while ($res = pg_fetch_assoc($qry)) {
        $data[] = [
            "id" => $res['id'],
            "credencial" => $res['trab_credencial'],
            "nombre" => $res['trab_nombre'],
            "monto" => $res['trab_monto']
        ];
    }

    pg_free_result($qry);
    pg_close($conexion);

    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}
	
?>