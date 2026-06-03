<?php
    require(__DIR__ . '/../../conf/conexion.php');
    header('Content-Type: application/json');

    //llamamos a la clase de conexion SUGO
    $pdo_sugo = Database_sugo::conectar();

    try {
        // $pdo_sugo->exec("SET TIME ZONE 'America/Mexico_City';");
        // date_default_timezone_set('America/Mexico_City');

        $fech_inicio = !empty($_POST['fech_inicio']) ? $_POST['fech_inicio'] : null;
        $fech_final  = !empty($_POST['fech_final'])  ? $_POST['fech_final']  : null;

        //descomponer fechas para mostrarlas en la parte grafica
        function formatearFecha($fecha) {
            if (empty($fecha)) {
                return null;
            }

            $partes = preg_split('/[\/\.\-]/', $fecha);

            // Deben venir 3 partes: Y M D
            if (count($partes) !== 3) {
                return null;
            }

            list($anio, $mes, $dia) = $partes;
            return "$dia/$mes/$anio";
        }











    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "detalle" => $e->getMessage()]);
    }

?>