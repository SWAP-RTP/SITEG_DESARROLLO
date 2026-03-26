<?php
require_once "../../conf/conexion.php";

function getSistemas_sinteg()
{
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(["error" => "Error de conexión a la base de datos"]);
        exit;
    }
    $credencial = $_POST['cred_user'] ?? '';
    $nombre = $_POST['nom_user'] ?? '';

    $where = ["trab_status = 1"];
    $params = [];
    $index = 1;

    if (!empty($credencial)) {
        $where[] = "trab_credencial = $" . $index;
        $params[] = $credencial;
        $index++;
    }
    // Buscar por nombre (en 3 columnas)
    if (!empty($nombre)) {
        $where[] = "(
            trab_nombre ILIKE $" . $index . " OR 
            trab_apaterno ILIKE $" . $index . " OR 
            trab_amaterno ILIKE $" . $index . "
        )";
        $params[] = "%$nombre%";
        $index++;
    }

    // Si no hay filtros
    $where_sql = "";
    
    if (!empty($where)) {
        $where_sql = "WHERE " . implode(" AND ", $where);
    }

    // EL PERSONAL DEBE ESTAR ACTIVO
    $sql = "SELECT trab_credencial, trab_nombre || ' ' || trab_apaterno || ' ' || trab_amaterno AS nombre_completo
            FROM trabajador
            $where_sql";
    $resultado = pg_query_params($conexion, $sql, $params);

    if (!$resultado) {
        echo json_encode(["error" => pg_last_error($conexion)]);
        exit;
    }

    $data = pg_fetch_all($resultado);
    return $data ?: [];

}
echo json_encode(getSistemas_sinteg());
Database::desconectar();