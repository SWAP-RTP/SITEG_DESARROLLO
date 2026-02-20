<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

$url = "http://accidentes-pv.rtp.gob.mx/reportes/mapa_de_calor/api/get_heatmap_data.php";

$response = file_get_contents($url);

if ($response === false) {
    echo json_encode([
        "ok" => false,
        "error" => "No se pudo obtener datos de la API remota"
    ]);
    exit;
}

// Devuelve exactamente lo que regresó la API original
echo $response;
?>
