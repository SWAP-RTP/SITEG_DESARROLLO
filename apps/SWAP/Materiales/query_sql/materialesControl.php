<?php
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../helpers/FuncionMateriales.php';


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recibe los datos del formulario
    $data = [
        'codigo_material'     => $_POST['codigo_material'] ?? '',
        'descripcion_material'=> $_POST['material'] ?? '',
        'grupo_pertenece'     => $_POST['grupo_pertenece'] ?? '',
        'unidad_entrada'      => $_POST['unidad_entrada'] ?? '',
        'cantidad_material'   => $_POST['cantidad_material'] ?? '',
        'ubicacion_almacen'   => $_POST['ubicacion_almacen'] ?? '',
        'estado_material'     => $_POST['estado_material'] ?? '',
        'nombre_persona'      => $_POST['nombre_registra'] ?? '',
        'id_credencial'       => $_POST['id_credencial'] ?? '',
        'area_adscripcion'    => $_POST['area'] ?? '',
        'fecha_registro'      => $_POST['fecha_registro'] ?? date('Y-m-d H:i:s')
    ];

    // Llama a la función para insertar el material
    $resultado = insertarMaterial($host, $port, $dbname, $user, $password, $data);

    header('Content-Type: application/json');
    echo json_encode($resultado);
    exit;
}

// Si no es POST, puedes devolver un error o dejar vacío
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Método no permitido']);
exit;
?>