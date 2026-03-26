<?php
header('Content-Type: application/json');
require_once "../../conf/conexion.php";

// Recibir datos JSON
$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;
$estatus = $input['estado'] ?? null; // Debe coincidir con el nombre enviado desde JS

if ($id === null || $estatus === null) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan parámetros"]);
    exit;
}
function updateModulos_sistema($id, $estatus)
{
    try {
        $conexion = Database::conectar();
        if (!$conexion) {
            throw new Exception("Error de conexion a la DB");
        }

        pg_query($conexion, "BEGIN");

        $sqlUpdateModulos = "UPDATE modulo_sistem SET estatus = $1 WHERE cve_modulo = $2";
        $resultUpdateModulos = pg_query_params($conexion, $sqlUpdateModulos, [$estatus, $id]);

        if ($resultUpdateModulos) {
            if (pg_affected_rows($resultUpdateModulos) > 0) {
                pg_query($conexion, "COMMIT");
                return ["success" => true, "message" => "Estado actualizado correctamente"];
            } else {
                pg_query($conexion, "ROLLBACK");
                return ["success" => false, "error" => "No se realizaron cambios (ID no existe o mismo estado)"];
            }
        } else {
            throw new Exception("Error en la ejecucion del query");
        }

    } catch (Exception $e) {
        //Si algo falla pero hay conexion se hace un rollback
        $db = Database::conectar();
        if ($db)
            pg_query($db, "ROLLBACK");
        error_log("Error updateModulos_sistema: " . $e->getMessage());
        http_response_code(500);
        return ["error" => "Error interno al actualizar" . $e->getMessage()];
    }
}

echo json_encode(updateModulos_sistema($id, $estatus));