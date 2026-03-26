<?php
session_start();
require_once __DIR__ . '/funciones.registro.php';

try{

    $modulo = isset($_SESSION['modulo_o']) ? (int)$_SESSION['modulo_o'] : 0;

    $data = obtenerRegistrosUniformes($modulo);

    echo json_encode($data);

}catch(Exception $e){

    echo json_encode([
        "status" => "error",
        "mensaje" => $e->getMessage()
    ]);
}