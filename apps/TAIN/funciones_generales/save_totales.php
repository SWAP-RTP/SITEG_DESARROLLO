<?php
require_once(__DIR__ . '/../public/conexion2.php');
header('Content-Type: application/json');
date_default_timezone_set('America/Mexico_City');
//llamamos a la funcion de las conexion
$pdo_sugo = conexionSugo();
$pdo_tablero = conexionTablero();

include(__DIR__ .'/genera_totales_pv.php');

$data = genera_totales_pv($pdo_sugo);

function save_totales_pv($data){
    global $pdo_tablero;

    try {
        $pdo_tablero->beginTransaction();

        // ===== INSERT PRINCIPAL =====
        $sql = "INSERT INTO tabla_indicadores (total_trabajadores, total_pv, total_rutas, total_sefis, total_accidentes, total_mantenimiento, fecha_corte)
                VALUES (0, :total, 0, 0, 0, 0, NOW())";
        $stmt = $pdo_tablero->prepare($sql);
        $stmt->execute([
            ':total' => $data['total']
        ]);

        // ID correcto del registro padre
        $id_indicador = $pdo_tablero->lastInsertId();

        // ===== ACCIDENTES =====
        $fecha_hoy = date('Y-m-d');

        // conexión accidentes
        $pdo_accidentes = conexionAccidentes();

        $sqlAcc = "SELECT modulo, COUNT(id) AS total
                FROM accidentes
                WHERE DATE(fecha_accidente) = :fecha
                GROUP BY modulo";

        $stmtAcc = $pdo_accidentes->prepare($sqlAcc);
        $stmtAcc->execute([':fecha' => $fecha_hoy]);
        $accidentes = $stmtAcc->fetchAll(PDO::FETCH_ASSOC);

        $sqlInsertAcc = "INSERT INTO tabla_indicadores_accidentes
                        (id_indicador, modulo, total_accidentes)
                        VALUES (:id, :modulo, :total)";

        $stmtInsertAcc = $pdo_tablero->prepare($sqlInsertAcc);

        foreach ($accidentes as $row) {

            $stmtInsertAcc->execute([
                ':id'     => $id_indicador,
                ':modulo' => $row['modulo'],
                ':total'  => $row['total']
            ]);
        }


        // ===== INSERT DETALLE =====
        $sql2 = "INSERT INTO tabla_indicadores_pv (id_indicador, modulo, modalidad, motivo, total_camiones)
                 VALUES (:id, :modulo, :modalidad, :motivo, :total_camiones)";
        $stmt2 = $pdo_tablero->prepare($sql2);

        foreach ($data as $key => $lista) {
            //ignora la llave 'total'
            if ($key === 'total' || !is_array($lista)) {
                continue;
            }

            foreach ($lista as $row) {
                if ((int)$row['total_camiones'] > 0) {
                    $stmt2->execute([
                        ':id'             => $id_indicador,
                        ':modulo'         => $row['modulo'],
                        ':modalidad'      => $row['ruta_modalidad'],
                        ':motivo'         => $row['motivo_id'],
                        ':total_camiones' => $row['total_camiones']
                    ]);
                }
            }
        }

        $pdo_tablero->commit();

        return [
            'status'  => true,
            'message' => 'Registro insertado correctamente '. date('d/m/Y H:i:s')
        ];

    } catch (PDOException $e) {
        $pdo_tablero->rollBack();

        return [
            'status'  => false,
            'message' => $e->getMessage()
        ];
    }
}
$result = save_totales_pv($data);

echo json_encode($result);
// echo json_encode($data);

?>