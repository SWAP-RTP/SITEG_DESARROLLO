<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

$conexion = Database::conectar();

// TOTAL MATERIALES
$total = pg_fetch_result(
    pg_query($conexion, "SELECT COUNT(*) FROM control_materiales"),
    0, 0
);

// STOCK TOTAL
$stockTotal = pg_fetch_result(
    pg_query($conexion, "SELECT COALESCE(SUM(stock_actual),0) FROM control_materiales"),
    0, 0
);

// STOCK BAJO (Conteo)
$resBajo = pg_query($conexion, "
    SELECT COUNT(*) 
    FROM control_materiales 
    WHERE stock_actual <= 5
");
$stockBajo = pg_fetch_result($resBajo, 0, 0);

// MATERIALES CON STOCK BAJO (Lista para la tabla)
$resLista = pg_query($conexion, "
    SELECT folio_material, descripcion_material, stock_actual
    FROM control_materiales
    WHERE stock_actual <= 5
    ORDER BY stock_actual ASC
");

$materiales = [];
while ($row = pg_fetch_assoc($resLista)) {
    $materiales[] = $row;
}

// MOVIMIENTOS HOY
// Se utiliza ::date para asegurar la comparación con la fecha actual del servidor (CURRENT_DATE)
// Esto garantiza que a las 00:00:00 el contador regrese a 0 automáticamente.
$resMov = pg_query($conexion, "
    SELECT (
        SELECT COUNT(*) FROM entradas_materiales 
        WHERE fecha_registro_entrada::date = CURRENT_DATE
    ) + (
        SELECT COUNT(*) FROM salidas_materiales 
        WHERE fecha_registro_salida::date = CURRENT_DATE
    ) AS total_hoy
");

$movimientos = pg_fetch_result($resMov, 0, 0);

// RESPUESTA JSON
echo json_encode([
    'total_materiales' => (int)$total,
    'stock_total'      => (int)$stockTotal,
    'stock_bajo'       => (int)$stockBajo,
    'movimientos_hoy'  => (int)$movimientos,
    'materiales_bajo'  => $materiales
]);

pg_close($conexion);