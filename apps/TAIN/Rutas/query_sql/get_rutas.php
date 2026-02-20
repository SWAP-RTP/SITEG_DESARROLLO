<?php
require(__DIR__ . '/../../public/conexion2.php');
header('Content-Type: application/json');

//llamamos a la funcion de conexion CENTRAL
$pdo_central = conexionCentral();
    /*
    con esta linea de codigo que decimos a postgres que todo lo que me regrese, me lo mande en UTF-8
    por la cuestion de los caracteres especiales
    */
try {
    $pdo_central->exec("SET client_encoding TO 'UTF8'");

    //RUTAS REGISTRADAS EN EL SWAP
    $sql_rutas = "SELECT id, ruta, modulo, origen, destino, estatus 
                  FROM rutas 
                  WHERE estatus = 1;";
    $stmt = $pdo_central->prepare($sql_rutas);
    $stmt->execute();
    // $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $rutas = [];
    while($res = $stmt->fetch(PDO::FETCH_ASSOC)){
        $rutas[] = [
            "id" => $res['id'],
            "ruta" => $res['ruta'],
            "modulo" => $res['modulo'],
            "origen" => $res['origen'],
            "destino" => $res['destino']
        ];
    }
    // print_r($rutas);
    // AGRUPAMOS LAS RUTAS POR MODULO PARA QUE SEA MAS FACIL FILTRAR POR EL JS
    $rutas_m1 = array();
    $rutas_m2 = array();
    $rutas_m3 = array();
    $rutas_m4 = array();
    $rutas_m5 = array();
    $rutas_m6 = array();
    $rutas_m7 = array();
    $total = 0;
    
    foreach ($rutas as $item){
        $total++;
        if($item['modulo'] == 1) $rutas_m1[] = $item;
        if($item['modulo'] == 2) $rutas_m2[] = $item;
        if($item['modulo'] == 3) $rutas_m3[] = $item;
        if($item['modulo'] == 4) $rutas_m4[] = $item;
        if($item['modulo'] == 5) $rutas_m5[] = $item;
        if($item['modulo'] == 6) $rutas_m6[] = $item;
        if($item['modulo'] == 7) $rutas_m7[] = $item;
    }
        
    $data = [
        "total" => $total,
        "m1" => $rutas_m1,
        "m2" => $rutas_m2,
        "m3" => $rutas_m3,
        "m4" => $rutas_m4,
        "m5" => $rutas_m5,
        "m6" => $rutas_m6,
        "m7" => $rutas_m7
    ];
        // print_r($data);
    echo json_encode($data);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "detalle" => $e->getMessage()]);
}

?>