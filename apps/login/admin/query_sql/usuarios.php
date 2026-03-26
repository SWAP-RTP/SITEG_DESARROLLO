<?php
require_once __DIR__ . '/../../conf/conexion.php';
function getUsuarios()
{
    try {
        //1. Obtenemos la conexion
        $conexion = Database::conectar();
        //2. Usamos manejo de errores en caso de que la conexion falle
        if (!$conexion) {
            throw new Exception("Error de conexion a la DB");
        }
        //3. Ejecutamos la consulta
        $sqlUsuarios = "SELECT * FROM usuarios";
        $resultadoUsuarios = pg_query($conexion, $sqlUsuarios);
        if (!$resultadoUsuarios) {
            throw new ErrorException("Error al ejecutar la consulta:" . pg_last_error($conexion));
        }
        $usuarios = pg_fetch_all($resultadoUsuarios);
        return $usuarios ?: []; //SI NO HAY DATOS RETORNA UN ARRAY VACIO

    } catch (Exception $e) {
        http_response_code(500);
        return ["error" => $e->getMessage()];
    }
}
// Devuelve solo el array de usuarios
echo json_encode(getUsuarios());