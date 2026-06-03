<?php
require_once "/var/www/login_shared/conf/conexion.php";

function listarIncidencias()
{
    $conexion = Database::conectar();

    if (!$conexion) {
        http_response_code(500);
        echo json_encode(["error" => "Error de conexión a la base de datos"]);
        exit;
    }


    $incicencias_listar = "SELECT 
    id,
    credencial,
    nombre,
    modulo,
    puesto,
    economico,
    hora_reporte,
    planta,
    postura,
    ruta,
    anomalia_detectada,
    anomalia_id,
    desc_anomalia,
    articulo,
    art_inciso,
    mb_articulo,
    mb_inciso,
    user_regconsecutivo AS usuario_registra,
    nombre_registro_consecutivo,
    user_supervisorep AS usuario_supervisor,
    nombre_supervisor,
    user_jefaturags AS usuario_jefatura,
    nombre_jefatura,
    user_adsctrab AS usuario_adscrito,
    nombre_tipo_jefe,
    folio,
    user_captura AS usuario_captura,
    estatus_id 
FROM sgio_reportes
ORDER BY id DESC";

    $resultado = @pg_query($conexion, $incicencias_listar);

    if (!$resultado) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la consulta SQL"]);
        exit;
    }

    $incidencias_array = pg_fetch_all($resultado);
    return $incidencias_array ?: [];
}

echo json_encode(listarIncidencias());
