<?php
session_start();
require_once __DIR__ . '/funciones.registro.php';

header('Content-Type: application/json');

$data = [
    "credencial" => $_POST['credencial'] ?? null,
    "modulo" => isset($_POST['modulo_clave']) && $_POST['modulo_clave'] !== '' ? (int)$_POST['modulo_clave'] : null,
    "observaciones" => $_POST['observ'] ?? '',
    "genero" => $_POST['genero'] ?? null,
    "tipo_contrato"  => isset($_POST['tipo_contrato']) ? (int)$_POST['tipo_contrato'] : null,
    "puesto_clave" => $_POST['puesto'] ?? null,
    "asistencia" => $_POST['estatus'] ?? null,
    "usuario" => $_SESSION['usr_id'] ?? null,
    "prendas" => obtenerPrendas($_POST)
];

$resultado = registroUniformes($data);

if ($resultado === false) {
    http_response_code(500);
    echo json_encode(["ok" => false]);
    exit;
}

if ($resultado === "existe") {
    echo json_encode([
        "ok" => false,
        "mensaje" => "El trabajador ya fue registrado"
    ]);
    exit;
}

if ($resultado === true) {
    echo json_encode([
        "ok" => true,
        "mensaje" => "Datos insertados correctamente"
    ]);
    exit;
}

// errores parciales
echo json_encode([
    "ok" => true,
    "mensaje" => "Error",
    "errores" => $resultado
]);


function obtenerPrendas($post){
    $prendas = [];

    foreach ($post as $key => $value){
        if(strpos($key,'id_prenda') !== false && !empty($value)){
            $id = intval(str_replace('id_prenda','',$key));
            $prendas[$id] = $value;
        }
    }

    return $prendas;
}