<?php
require_once __DIR__ . '/../../conf/conexion.php';
function getPermisos($userId = null)
{
    try {
        // Evitar que warnings/notices rompan la salida JSON
        ini_set('display_errors', '0');
        error_reporting(E_ALL);
        //1. Obtenemos la conexion
        $conexion = Database::conectar();
        //2. Usamos manejo de errores en caso de que la conexion falle
        if (!$conexion) {
            throw new Exception("Error de conexion a la DB");
        }
        // Si no se pasó userId, tomar de sesión
        if (session_status() === PHP_SESSION_NONE)
            session_start();
        if (!$userId)
            $userId = $_SESSION['user_id'] ?? null;

        //3. Ejecutamos la consulta: si se proporciona $userId filtramos, si no devolvemos la consulta original
        if ($userId) {
            $sqlUsuarios = "SELECT uf.id_usuario, uf.nombre, ur.id_rol, r.nombre AS rol_nombre, r.descripcion
                            FROM usuario_rol ur
                            LEFT JOIN roles r ON r.id_rol = ur.id_rol
                            LEFT JOIN usuarios_final uf ON ur.id_usuario = uf.id_usuario
                            WHERE ur.id_usuario = $1";
            $resultadoUsuarios = pg_query_params($conexion, $sqlUsuarios, array($userId));
        } else {
            $sqlUsuarios = "SELECT uf.id_usuario, uf.nombre, ur.id_rol, r.nombre AS rol_nombre, r.descripcion
                            FROM usuario_rol ur
                            LEFT JOIN roles r ON r.id_rol = ur.id_rol
                            LEFT JOIN usuarios_final uf ON ur.id_usuario = uf.id_usuario";
            $resultadoUsuarios = pg_query($conexion, $sqlUsuarios);
        }
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

// Si se ejecuta directamente, devolver JSON limpio
if (realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(getPermisos());
    exit;
}