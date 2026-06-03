<?php
    require(__DIR__ . '/../../conf/conexion.php');
    header('Content-Type: application/json');

    $conexion_central = Database_central::conectar();

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
        $resultado = @pg_query($conexion_central, $sql);

        $resultados = ['modulos' => []];
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

        while ($row = pg_fetch_assoc($resultado)) {
            // Convertimos todos los valores de la fila a enteros para el JSON
            $fila = array_map('intval', $row);
            
            $idModulo = $fila['modulo'];
            $resultados['modulos'][$idModulo] = $fila;

            // Acumulamos en el Total General dinámicamente usando las llaves predefinidas
            foreach ($totalGeneral as $key => $valor) {
                if (isset($fila[$key])) {
                    $totalGeneral[$key] += $fila[$key];
                }
            }
        }

        header('Content-Type: application/json');
        echo json_encode([
            'general' => $totalGeneral,
            'detalle' => $resultados['modulos']
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "mensaje" => "Error interno en el servidor",
            "detalle" => $e->getMessage()
        ]);
    }
?>