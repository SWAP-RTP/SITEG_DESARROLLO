<?php
session_start();
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');

function editar_incicencia($conexion)
{

    $id = isset($_POST['id']) ? trim($_POST['id']) : '';
    $fecha = isset($_POST['fecha']) ? $_POST['fecha'] : ''; // formato YYYY-MM-DD
    $hora = isset($_POST['hora']) ? $_POST['hora'] : '';   // formato HH:MM
    $json = array();

    if ($id === '' || !is_numeric($id)) {
        $json['error'] = 'ID vacío o inválido';
        return $json;
    }

    // Si solo viene la actualización de fecha/hora
    if ($id && $fecha && $hora && count($_POST) == 3) {
        $hora_reporte = $fecha . ' ' . $hora;
        $sql = "UPDATE sgio_reportes SET hora_reporte = $1 WHERE id = $2";
        $params = array($hora_reporte, $id);
        $result = pg_query_params($conexion, $sql, $params);

        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false, 'error' => pg_last_error($conexion)));
        }
        exit;
    }

    pg_query($conexion, "BEGIN");

    try {
        // Si solo viene estatus_id, solo actualizar el estatus
        if (isset($_POST['estatus_id']) && count($_POST) == 2) { // solo id y estatus_id
            $estatus_id = $_POST['estatus_id'];
            $sql_estatus = "UPDATE sgio_reportes SET estatus_id = '$estatus_id' WHERE id = '$id'";
            $res_estatus = @pg_query($conexion, $sql_estatus);
            if (!$res_estatus) {
                throw new Exception("Error al actualizar estatus: " . pg_last_error($conexion));
            }
        } else {
            // Si vienen otros campos, actualizar la incidencia completa
            // Valores del formulario
            $fecha = isset($_POST['fecha']) ? $_POST['fecha'] : '';
            $hora = isset($_POST['hora']) ? $_POST['hora'] : '';
            $hora_reporte = '';
            if ($fecha !== '' && $hora !== '') {
                $hora_reporte = trim($fecha . ' ' . $hora);
            }

            // Escapar valores para seguridad básica
            $economico = pg_escape_string($conexion, isset($_POST['economico']) ? $_POST['economico'] : '');
            $planta = pg_escape_string($conexion, isset($_POST['planta']) ? $_POST['planta'] : '');
            $postura = pg_escape_string($conexion, isset($_POST['postura']) ? $_POST['postura'] : '');
            $ruta = pg_escape_string($conexion, isset($_POST['ruta']) ? $_POST['ruta'] : '');
            $anomalia = isset($_POST['anomalia_clave']) ? $_POST['anomalia_clave'] : '';
            $anomalia_id_sql = ($anomalia !== '' ? "'" . pg_escape_string($conexion, $anomalia) . "'" : "NULL");
            $anomalia_detectada = pg_escape_string($conexion, isset($_POST['anomalia']) ? $_POST['anomalia'] : '');
            $desc_anomalia = pg_escape_string($conexion, isset($_POST['descripcion']) ? $_POST['descripcion'] : '');
            $articulo = pg_escape_string($conexion, isset($_POST['articulo']) ? $_POST['articulo'] : '');
            $art_inciso = pg_escape_string($conexion, isset($_POST['art_inciso']) ? $_POST['art_inciso'] : '');
            $mb_articulo = pg_escape_string($conexion, isset($_POST['mb_articulo']) ? $_POST['mb_articulo'] : '');
            $mb_inciso = pg_escape_string($conexion, isset($_POST['mb_inciso']) ? $_POST['mb_inciso'] : '');



            // Construir UPDATE
            $incicencias_editar = "UPDATE sgio_reportes SET ";
            $incicencias_editar .= "economico = '$economico', ";
            $incicencias_editar .= "planta = '$planta', ";
            $incicencias_editar .= "postura = '$postura', ";
            $incicencias_editar .= "ruta = '$ruta', ";
            $incicencias_editar .= "anomalia_detectada = '$anomalia_detectada', ";
            $incicencias_editar .= "anomalia_id = $anomalia_id_sql, ";
            $incicencias_editar .= "desc_anomalia = '$desc_anomalia', ";
            $incicencias_editar .= "articulo = '$articulo',";
            $incicencias_editar .= "art_inciso = '$art_inciso',";
            $incicencias_editar .= "mb_articulo = '$mb_articulo',";
            $incicencias_editar .= "mb_inciso = '$mb_inciso'";
            if ($hora_reporte !== '') {
                $incicencias_editar .= ", hora_reporte = '" . pg_escape_string($conexion, $hora_reporte) . "'";
            }
            $incicencias_editar .= " WHERE id = '$id'";

            $resultado = @pg_query($conexion, $incicencias_editar);
            if (!$resultado) {
                throw new Exception("Error en la consulta: " . pg_last_error($conexion));
            }

            // Si también viene estatus_id, actualizarlo
            if (isset($_POST['estatus_id'])) {
                $estatus_id = $_POST['estatus_id'];
                $sql_estatus = "UPDATE sgio_reportes SET estatus_id = '$estatus_id' WHERE id = '$id'";
                $res_estatus = @pg_query($conexion, $sql_estatus);
                if (!$res_estatus) {
                    throw new Exception("Error al actualizar estatus: " . pg_last_error($conexion));
                }
            }
        }

        pg_query($conexion, "COMMIT");
        $json['success'] = true;

    } catch (Exception $e) {

        pg_query($conexion, "ROLLBACK");
        $json['error'] = $e->getMessage();
    }
    return $json;
}

header('Content-Type: application/json');
echo json_encode(editar_incicencia($conexion));