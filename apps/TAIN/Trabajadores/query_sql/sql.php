<?php
require(__DIR__ . '/../../public/conexion_central.php');

header('Content-Type: application/json');

if (conecta($conexion)) {

    $sql = "SELECT 
    a.mod_cve AS modulo, 
    COUNT(*) AS totaltrab,
    
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
INNER JOIN adscripcion a ON t.adsc_cve = a.adsc_cve
WHERE a.mod_cve IN (0,1,2,3,4,5,6,7)
GROUP BY a.mod_cve
ORDER BY a.mod_cve ASC;";

    $res = pg_query($conexion, $sql);

    if ($res) {
        $resultados = [];
        $totalGeneral = [
            'totaltrab' => 0,
            'totaltrabact' => 0,
            'totaltrabinact' => 0
            // Puedes inicializar todos los campos en 0 si deseas el total de cada subcategoría
        ];

        while ($row = pg_fetch_assoc($res)) {
            $fila = array_map('intval', $row);
            $resultados['modulos'][$fila['modulo']] = $fila;

            // Calculamos el Total General acumulando los valores
            $totalGeneral['totaltrab'] += $fila['totaltrab'];
            $totalGeneral['totaltrabact'] += $fila['totaltrabact'];
            $totalGeneral['totaltrabinact'] += $fila['totaltrabinact'];
        }

        // Estructura final: Totales generales + Desglose por módulo
        echo json_encode([
            'general' => $totalGeneral,
            'detalle' => $resultados['modulos']
        ]);

    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al ejecutar la consulta SQL"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión"]);
}
?>