<?php
require_once '/var/www/login_shared/conf/conexion.php';

class TrabajadorRepository
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = Database::conectar();
        if (!$this->conexion) {
            http_response_code(500);
            echo json_encode(["error" => "Error en la conexion a la base de datos"]);
            exit;
        }

    }

    public function getTrabajadores(array $campos = ['*'], array $filtros = [], $limite = null, $offset = null)
    {
        // 1. Aqui preparamos la consulta para recibir solo los parametros solicitados
        $selectCols = implode(', ', $campos);
        $sql = "SELECT {$selectCols} FROM trabajador";
        $params = [];
        $condiciones = [];
        $paramIndex = 1;

        // 2. Aqui armamos el where dinamicamente y de forma segura
        if (!empty($filtros)) {
            foreach ($filtros as $columna => $valor) {
                //S ua $1, $2, etc, para pg_query_params
                $condiciones[] = "{$columna} = \${$paramIndex}";
                $params[] = $valor;
                $paramIndex++;
            }
            $sql .= " WHERE " . implode(' AND ', $condiciones);
        }

        // 3. Paginamos los resultados, no se traen muchos a la vez
        if ($limite !== null) {
            $sql .= " LIMIT " . (int) $limite;
        }
        if ($offset !== null) {
            $sql .= " OFFSET " . (int) $offset;
        }

        // 4. Ejecucion 
        $resTrabajador = pg_query_params($this->conexion, $sql, $params);

        if (!$resTrabajador) {
            http_response_code(500);
            echo json_encode(["error" => "Error en la consulta SQL"]);
            exit;
        }
        return pg_fetch_all($resTrabajador) ?: [];
    }
}


