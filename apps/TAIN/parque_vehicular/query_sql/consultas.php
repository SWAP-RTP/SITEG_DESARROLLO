<?php
require(__DIR__ . '/../../public/conexion2.php');
header('Content-Type: application/json');

$pdo_sugo = conexionSugo();

try {

    // =====================================================
    // 1. CONSULTA BASE
    //    - Último estado por económico
    //    - Segmentación por motivo
    // =====================================================
    $sql = "SELECT t.modulo, t.segmento, t.ruta_modalidad, COUNT(*) AS total
        FROM (SELECT DISTINCT ON (pve.eco) pve.eco, pve.modulo, pve.ruta_modalidad, pve.motivo_id,
                CASE
                    WHEN pve.motivo_id IN (1,19) THEN 'SERVICIO'
                    WHEN pve.motivo_id = 9 THEN 'TERMINO JORNADA'
                    WHEN pve.motivo_id IN (12,23) THEN 'MANTENIMIENTO CORRECTIVO'
                    WHEN pve.motivo_id = 24 THEN 'MANTENIMIENTO PREVENTIVO'
                    WHEN pve.motivo_id = 15 THEN 'DISPONIBLES'
                    WHEN pve.motivo_id IN (25,26) THEN 'METROBUS'
                    ELSE 'OTRO'
                END AS segmento
            FROM pv_estados pve
            WHERE pve.momento >= '2026-01-16 00:00:00'
              AND pve.momento <  '2026-01-17 00:00:00'
              AND pve.modulo BETWEEN 1 AND 7
              AND pve.ruta_modalidad IN ('EXPRESO', 'ORDINARIO', 'METROBÚS ARTICULADO', 'ATENEA', 'NOCHEBÚS', 'METROBÚS')
            ORDER BY pve.eco, pve.momento DESC) t
        GROUP BY t.modulo, t.segmento, t.ruta_modalidad
        ORDER BY t.modulo, t.segmento;";

    $stmt = $pdo_sugo->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // =====================================================
    // 2. ESTRUCTURA BASE (7 módulos x 7 segmentos)
    // =====================================================
    $segmentos = [
        'SERVICIO',
        'TERMINO JORNADA',
        'MANTENIMIENTO CORRECTIVO',
        'MANTENIMIENTO PREVENTIVO',
        'DISPONIBLES',
        'METROBUS',
        'OTRO'
    ];

    $modalidades = [
        'EXPRESO',
        'ORDINARIO',
        'METROBÚS ARTICULADO',
        'ATENEA',
        'NOCHEBÚS',
        'METROBÚS'
    ];

    $data = [];

    for ($m = 1; $m <= 7; $m++) {
        foreach ($segmentos as $seg) {
            $fila = [
                'mod_clave' => $m,
                'segmento'  => $seg
            ];

            foreach ($modalidades as $mod) {
                $fila[$mod] = 0;
            }

            $data[$m][$seg] = $fila;
        }
    }

    // =====================================================
    // 3. Llenar con datos reales
    // =====================================================
    foreach ($rows as $r) {
        $mod  = (int)$r['modulo'];
        $seg  = $r['segmento'];
        $ruta = $r['ruta_modalidad'];

        $data[$mod][$seg][$ruta] = (int)$r['total'];
    }

    // =====================================================
    // 4. Convertir a arreglo plano
    // =====================================================
    $final = [];
    foreach ($data as $modulos) {
        foreach ($modulos as $fila) {
            $final[] = $fila;
        }
    }

    echo json_encode([
        'ok'   => true,
        'data' => $final
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}
