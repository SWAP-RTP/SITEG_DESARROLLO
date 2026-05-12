<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

// Se establece conexión con PostgreSQL
$conexion = Database::conectar();

// Validar si la conexión falló
if (!$conexion) {
    // Devuelve respuesta de error en formato JSON
    echo json_encode([
        'status' => 'error',
        'message' => 'Error conexión'
    ]);
    exit; // Detiene la ejecución del script
}


// ******** OBTENER EL ÚLTIMO FOLIO REGISTRADO ********

// Consulta SQL para traer el folio más alto registrado
// DESC = orden descendente (del mayor al menor)
// LIMIT 1 = solo trae un registro
$sql = "SELECT folio_material 
        FROM control_materiales 
        ORDER BY folio_material DESC 
        LIMIT 1";

// Ejecuta la consulta
$res = pg_query($conexion, $sql);

// Convierte el resultado en un arreglo asociativo
$ultimo = pg_fetch_assoc($res);


// ******** GENERAR NUEVO FOLIO ********

// Si no existe ningún registro en la tabla,
// significa que será el primer folio del sistema
if (!$ultimo) {

    // Se asigna el primer folio inicial
    $nuevo = 'MA-00000001';

} else {

    // Extrae solo la parte numérica del folio
    // Ejemplo:
    // MA-00034742  →  00034742
    // substr(..., 3) corta desde la posición 3
    $numero = (int) substr($ultimo['folio_material'], 3);

    // Incrementa el número en +1
    // Ejemplo:
    // 34742 → 34743
    $numero++;

    // Reconstruye el nuevo folio:
    // str_pad agrega ceros a la izquierda hasta completar 8 dígitos
    // Ejemplo:
    // 34743 → 00034743
    // Luego concatena el prefijo "MA-"
    $nuevo = 'MA-' . str_pad($numero, 8, '0', STR_PAD_LEFT);
}


// ******** DEVOLVER RESPUESTA AL FRONTEND ********

// Envía el nuevo folio generado en formato JSON
echo json_encode([
    'status' => 'ok',
    'folio' => $nuevo
]);

// Cierra la conexión a la base de datos
pg_close($conexion);