<?php
require(__DIR__ . '/../../public/conexion2.php');
header('Content-Type: application/json');

$pdo_central = conexionCentral();

try {

    $sql = "SELECT 
    a.mod_cve AS modulo, 
    COUNT(t.*) AS totaltrab,
    
    -- TOTALES POR ESTATUS
    SUM(CASE WHEN t.trab_status = '1' THEN 1 ELSE 0 END) AS totaltrabact,
    SUM(CASE WHEN t.trab_status = '2' THEN 1 ELSE 0 END) AS totaltrabinact,

    -- DESGLOSE ACTIVOS
    SUM(CASE WHEN t.tipo_trab_clave = 1 AND t.trab_status = '1' THEN 1 ELSE 0 END) AS totaloperadoresact,
    SUM(CASE WHEN t.tipo_trab_clave = 2 AND t.trab_status = '1' THEN 1 ELSE 0 END) AS totalmantenimientoact,
    SUM(CASE WHEN t.tipo_trab_clave = 3 AND t.trab_status = '1' THEN 1 ELSE 0 END) AS totalconfianzaoficinaact,
    SUM(CASE WHEN t.tipo_trab_clave = 4 AND t.trab_status = '1' THEN 1 ELSE 0 END) AS totalfuncionariosoficinasact,
    SUM(CASE WHEN t.tipo_trab_clave = 5 AND t.trab_status = '1' THEN 1 ELSE 0 END) AS totalconfianzamodulosact,
    SUM(CASE WHEN t.tipo_trab_clave = 6 AND t.trab_status = '1' THEN 1 ELSE 0 END) AS totalfuncionariosmodulosact,

    -- DESGLOSE INACTIVOS
    SUM(CASE WHEN t.tipo_trab_clave = 1 AND t.trab_status = '2' THEN 1 ELSE 0 END) AS totaloperadoresinact,
    SUM(CASE WHEN t.tipo_trab_clave = 2 AND t.trab_status = '2' THEN 1 ELSE 0 END) AS totalmantenimientoinact,
    SUM(CASE WHEN t.tipo_trab_clave = 3 AND t.trab_status = '2' THEN 1 ELSE 0 END) AS totalconfianzaoficinainact,
    SUM(CASE WHEN t.tipo_trab_clave = 4 AND TRIM(t.trab_status) = '2' THEN 1 ELSE 0 END) AS totalfuncionariosoficinasinact,
    SUM(CASE WHEN t.tipo_trab_clave = 5 AND t.trab_status = '2' THEN 1 ELSE 0 END) AS totalconfianzamodulosinact,
    SUM(CASE WHEN t.tipo_trab_clave = 6 AND t.trab_status = '2' THEN 1 ELSE 0 END) AS totalfuncionariosmodulosinact

    FROM trabajador t
    LEFT JOIN adscripcion a ON t.adsc_cve = a.adsc_cve 
    WHERE a.mod_cve IN (0,1,2,3,4,5,6,7)
    GROUP BY a.mod_cve
    ORDER BY a.mod_cve ASC;";

    $stmt = $pdo_central->prepare($sql);
    $stmt->execute();


    $resultados = [];
    $totalGeneral = [
        'totaltrab' => 0,
        'totaltrabact' => 0,
        'totaltrabinact' => 0,
        'totaloperadoresact' => 0,
        'totalmantenimientoact' => 0,
        'totalconfianzaoficinaact' => 0,
        'totalfuncionariosoficinasact' => 0,
        'totalconfianzamodulosact' => 0,
        'totalfuncionariosmodulosact' => 0,
        'totaloperadoresinact' => 0,
        'totalmantenimientoinact' => 0,
        'totalconfianzaoficinainact' => 0,
        'totalfuncionariosoficinasinact' => 0,
        'totalconfianzamodulosinact' => 0,
        'totalfuncionariosmodulosinact' => 0
    ];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $fila = array_map('intval', $row);
        $resultados['modulos'][$fila['modulo']] = $fila;
        // Calculamos el Total General acumulando los valores
        $totalGeneral['totaltrab'] += $fila['totaltrab'];
        $totalGeneral['totaltrabact'] += $fila['totaltrabact'];
        $totalGeneral['totaltrabinact'] += $fila['totaltrabinact'];
        $totalGeneral['totaloperadoresact'] = ($totalGeneral['totaloperadoresact'] ?? 0) + $fila['totaloperadoresact'];
        $totalGeneral['totalmantenimientoact'] = ($totalGeneral['totalmantenimientoact'] ?? 0) + $fila['totalmantenimientoact'];
        $totalGeneral['totalconfianzaoficinaact'] = ($totalGeneral['totalconfianzaoficinaact'] ?? 0) + $fila['totalconfianzaoficinaact'];
        $totalGeneral['totalfuncionariosoficinasact'] = ($totalGeneral['totalfuncionariosoficinasact'] ?? 0) + $fila['totalfuncionariosoficinasact'];
        $totalGeneral['totalconfianzamodulosact'] = ($totalGeneral['totalconfianzamodulosact'] ?? 0) + $fila['totalconfianzamodulosact'];
        $totalGeneral['totalfuncionariosmodulosact'] = ($totalGeneral['totalfuncionariosmodulosact'] ?? 0) + $fila['totalfuncionariosmodulosact'];
        $totalGeneral['totaloperadoresinact'] = ($totalGeneral['totaloperadoresinact'] ?? 0) + $fila['totaloperadoresinact'];
        $totalGeneral['totalmantenimientoinact'] = ($totalGeneral['totalmantenimientoinact'] ?? 0) + $fila['totalmantenimientoinact'];
        $totalGeneral['totalconfianzaoficinainact'] = ($totalGeneral['totalconfianzaoficinainact'] ?? 0) + $fila['totalconfianzaoficinainact'];
        $totalGeneral['totalfuncionariosoficinasinact'] = ($totalGeneral['totalfuncionariosoficinasinact'] ?? 0) + $fila['totalfuncionariosoficinasinact'];
        $totalGeneral['totalconfianzamodulosinact'] = ($totalGeneral['totalconfianzamodulosinact'] ?? 0) + $fila['totalconfianzamodulosinact'];
        $totalGeneral['totalfuncionariosmodulosinact'] = ($totalGeneral['totalfuncionariosmodulosinact'] ?? 0) + $fila['totalfuncionariosmodulosinact'];
    }
    // Estructura final: Totales generales + Desglose por módulo
    echo json_encode([
        // 'TOTAL' => $TOTAL,
        'general' => $totalGeneral,
        'detalle' => $resultados['modulos']
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "detalle" => $e->getMessage()]);
}
?>