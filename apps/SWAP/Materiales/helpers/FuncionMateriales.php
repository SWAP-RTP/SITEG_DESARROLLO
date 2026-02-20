<?php
require_once __DIR__ . '/../../config/conexion.php';


/**
 * Insertar un nuevo material en el catálogo.
 */
function insertarMaterial($host, $port, $dbname, $user, $password, $data)
{
    $conexion = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
    if (!$conexion) {
        return array("success" => false, "error" => "Error de conexión a la base de datos");
    }

    $sql = "INSERT INTO Catalogo_Materiales (
        codigo_material, descripcion_material, grupo_pertenece, unidad_entrada, cantidad_material,
        ubicacion_almacen, estado_material, nombre_persona, id_credencial, area_adscripcion, fecha_registro
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    )";

    $params = [
        $data['codigo_material'],
        $data['descripcion_material'],
        $data['grupo_pertenece'],
        $data['unidad_entrada'],
        $data['cantidad_material'],
        $data['ubicacion_almacen'],
        $data['estado_material'],
        $data['nombre_persona'],
        $data['id_credencial'],
        $data['area_adscripcion'],
        $data['fecha_registro']
    ];

    $resultado = pg_query_params($conexion, $sql, $params);

    if (!$resultado) {
        $error = pg_last_error($conexion);
        pg_close($conexion);
        return array("success" => false, "error" => "Error al insertar: $error");
    }

    pg_close($conexion);
    return array("success" => true, "message" => "Material registrado correctamente");
}
