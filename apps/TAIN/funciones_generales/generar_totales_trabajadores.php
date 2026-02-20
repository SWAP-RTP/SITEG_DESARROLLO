<?php

function genera_totales_trabajadores($conexion)
{
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
            SUM(CASE WHEN t.tipo_trab_clave = 4 AND t.trab_status = '2' THEN 1 ELSE 0 END) AS totalfuncionariosoficinasinact,
            SUM(CASE WHEN t.tipo_trab_clave = 5 AND t.trab_status = '2' THEN 1 ELSE 0 END) AS totalconfianzamodulosinact,
            SUM(CASE WHEN t.tipo_trab_clave = 6 AND t.trab_status = '2' THEN 1 ELSE 0 END) AS totalfuncionariosmodulosinact

        FROM trabajador t
        LEFT JOIN adscripcion a ON t.adsc_cve = a.adsc_cve 
        WHERE a.mod_cve BETWEEN 1 AND 7
        GROUP BY a.mod_cve
        ORDER BY a.mod_cve
    ";

    $res = pg_query($conexion, $sql);
    if (!$res) {
        return false;
    }

    // Inicialización
    $total = 0;
    $m1 = $m2 = $m3 = $m4 = $m5 = $m6 = $m7 = [];

    while ($row = pg_fetch_assoc($res)) {
        $fila = array_map('intval', $row);
        $total += $fila['totaltrab'];

        switch ($fila['modulo']) {
            case 1: $m1[] = $fila; break;
            case 2: $m2[] = $fila; break;
            case 3: $m3[] = $fila; break;
            case 4: $m4[] = $fila; break;
            case 5: $m5[] = $fila; break;
            case 6: $m6[] = $fila; break;
            case 7: $m7[] = $fila; break;
        }
    }

    return [
        "total" => $total,
        "m1" => $m1,
        "m2" => $m2,
        "m3" => $m3,
        "m4" => $m4,
        "m5" => $m5,
        "m6" => $m6,
        "m7" => $m7
    ];
}
