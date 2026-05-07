<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

$conexion = Database::conectar();

$tipo = $_GET['tipo'] ?? '';

switch ($tipo) {

    //  INVENTARIO (USAR EN MODAL)
    case 'material':
        $limite = 10;
        $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 0;
        
        $sqlBase = "
            SELECT 
                c.folio_material,
                c.descripcion_material,
                COALESCE(e.total_entrada, 0) - COALESCE(s.total_salida, 0) AS stock_actual
            FROM control_materiales c
            LEFT JOIN (
                SELECT folio_material, SUM(cantidad_material_entrada) AS total_entrada
                FROM entradas_materiales
                GROUP BY folio_material
            ) e ON c.folio_material = e.folio_material
            LEFT JOIN (
                SELECT folio_material, SUM(cantidad_material_salida) AS total_salida
                FROM salidas_materiales
                GROUP BY folio_material
            ) s ON c.folio_material = s.folio_material
        ";

        if ($pagina > 0) {
            $resCount = pg_query($conexion, "SELECT COUNT(*) FROM control_materiales");
            $totalItems = (int)pg_fetch_result($resCount, 0, 0);
            $totalPaginas = ceil($totalItems / $limite);
            $offset = ($pagina - 1) * $limite;
            $sql = $sqlBase . " ORDER BY c.folio_material LIMIT $limite OFFSET $offset;";
        } else {
            $sql = $sqlBase . " ORDER BY c.folio_material;";
        }
        break;

    //  HISTORIAL (NO PARA MODAL)
    case 'movimientos':
        $sql = "
            SELECT 
                folio_material,
                descripcion_material_entrada
            FROM entradas_materiales
            ORDER BY fecha_registro_entrada DESC
            LIMIT 100
        ";
        break;

    default:
        echo json_encode([
            "status" => "error",
            "message" => "Tipo no válido"
        ]);
        exit;
}
$res = pg_query($conexion, $sql);

if (!$res) {
    echo json_encode([
        "status" => "error",
        "message" => pg_last_error($conexion)
    ]);
    exit;
}

$datos = pg_fetch_all($res) ?: [];

$respuesta = [
    "status" => "ok",
    "datos" => $datos
];

if (isset($totalPaginas)) {
    $respuesta["totalPaginas"] = $totalPaginas;
    $respuesta["paginaActual"] = $pagina;
}

echo json_encode($respuesta);

pg_close($conexion);
