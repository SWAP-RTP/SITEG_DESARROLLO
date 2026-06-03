<?php
    require(__DIR__ . '/../../conf/conexion.php');
    header('Content-Type: application/json');

    //llamamos a la clase de conexion CENTRAL
    $pdo_central = Database_central::conectar();

    try {
        // === CONSULTA ORIGINAL (NO SE MODIFICA) ===
        $sql = "SELECT COUNT(*) AS total 
                FROM pv p
                WHERE p.pv_modulo IN (1,2,3,4,5,6,7)
                AND p.pv_cve_estado_fisico IN (1,5,6,7)
                AND p.pv_cve_tipo_unidad NOT IN (1404, 1405, 1301, 2202, 2201, 1103, 1104, 1102, 
                                                1101, 1105, 1106, 1201, 1401, 1402, 1403);";
        $result = @pg_query($pdo_central, $sql);
        $res = @pg_fetch_all($result);

        $totalpv = $res[0]['total'];

        // === NUEVA CONSULTA POR MÓDULO ===
        $sql_modulos = "SELECT 
                            COUNT(CASE WHEN pv_modulo = 1 THEN 1 END) AS total_m1,
                            COUNT(CASE WHEN pv_modulo = 2 THEN 1 END) AS total_m2,
                            COUNT(CASE WHEN pv_modulo = 3 THEN 1 END) AS total_m3,
                            COUNT(CASE WHEN pv_modulo = 4 THEN 1 END) AS total_m4,
                            COUNT(CASE WHEN pv_modulo = 5 THEN 1 END) AS total_m5,
                            COUNT(CASE WHEN pv_modulo = 6 THEN 1 END) AS total_m6,
                            COUNT(CASE WHEN pv_modulo = 7 THEN 1 END) AS total_m7
                        FROM pv p
                        WHERE p.pv_modulo IN (1,2,3,4,5,6,7)
                        AND p.pv_cve_estado_fisico IN (1,5,6,7)
                        AND p.pv_cve_tipo_unidad NOT IN (1404, 1405, 1301, 2202, 2201, 1103, 1104, 1102,
                                                        1101, 1105, 1106, 1201, 1401, 1402, 1403);";
        $result2 = @pg_query($pdo_central, $sql_modulos);
        $res_mod = @pg_fetch_all($result2);
        $res_mod = $res_mod[0]; // nos quedamos con la primera fila del resultado

        $data = [
            'total' => $totalpv,
            'modulos' => [
                'm1' => (int)$res_mod['total_m1'],
                'm2' => (int)$res_mod['total_m2'],
                'm3' => (int)$res_mod['total_m3'],
                'm4' => (int)$res_mod['total_m4'],
                'm5' => (int)$res_mod['total_m5'],
                'm6' => (int)$res_mod['total_m6'],
                'm7' => (int)$res_mod['total_m7'],
            ]
        ];

        echo json_encode($data);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "detalle" => $e->getMessage()]);
    }

?>