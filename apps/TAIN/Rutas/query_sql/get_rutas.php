<?php
require(__DIR__ . '/../../conf/conexion.php');
header('Content-Type: application/json');

//llamamos a la funcion de conexion CENTRAL
$pdo_central = Database_central::conectar();
    /*
    con esta linea de codigo que decimos a postgres que todo lo que me regrese, me lo mande en UTF-8
    por la cuestion de los caracteres especiales
    */
try {
    @pg_query($pdo_central, "SET client_encoding TO 'UTF8'");

    $sql_rutas = "SELECT id, ruta, modulo, origen, destino, estatus 
                  FROM rutas 
                  WHERE estatus = 1;";
    $result = @pg_query($pdo_central, $sql_rutas);
    $rutas_modulos = @pg_fetch_all($result);

    $data = [
        "total" => 0,
        "m1" => [], 
        "m2" => [], 
        "m3" => [], 
        "m4" => [], 
        "m5" => [], 
        "m6" => [], 
        "m7" => []
    ];

    foreach ($rutas_modulos as $item) {
        $data["total"]++;
        $modulo = $item['modulo'];
        
        // Dinámicamente lo asignamos al grupo correspondiente (m1, m2, etc)
        if ($modulo >= 1 && $modulo <= 7) {
            $data["m" . $modulo][] = [
                "id"     => $item['id'],
                "ruta"   => $item['ruta'],
                "modulo" => $item['modulo'],
                "origen" => $item['origen'],
                "destino"=> $item['destino']
            ];
        }
    }

    echo json_encode($data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "detalle" => $e->getMessage()
    ]);
}
?>