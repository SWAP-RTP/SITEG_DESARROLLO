<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 390319036638cb11f96d0426c37d77bbec365fef
<?php
session_start();  // Inicia la sesión para gestionar información del usuario
include ('/usr/local/apache/htdocs/conf/conexion.php');  // Incluye el archivo de conexión a la base de datos

// Inicia una transacción para garantizar la consistencia de las operaciones
try {
    @pg_query($conexion, "BEGIN");  // Comienza una transacción en la base de datos

    // Obtiene la información actual del puesto desde la base de datos
    $puesto_dato_anterior = "SELECT * FROM trab_puesto WHERE puesto_clave = $_POST[clave_puesto]";
    $query_puesto_anterior = @pg_query($conexion, $puesto_dato_anterior);
    $resultado_anterior = @pg_fetch_array($query_puesto_anterior);  // Extrae los resultados de la consulta

    // Convierte los valores del status ('A' = Activo, 'I' = Inactivo) a valores numéricos (1 y 2 respectivamente)
    $estatus = ($_POST['status'] == 'A') ? 1 : 2;

    // Define los arrays para los campos a actualizar y las condiciones
    $campos_actualizar = array();
    $condiciones = array();

    $campo['puesto_clave'] = $_POST['puesto_clave'];  // Asigna la clave del puesto

    // Compara los valores anteriores con los nuevos y construye las condiciones para actualizar
    if ($resultado_anterior['puesto_grupo'] != $_POST['grupo']) {
        $condiciones[] = "puesto_grupo = '$_POST[grupo]'";
        $campos_actualizar['puesto_grupo'] = "$_POST[grupo]";
    } 
    if ($resultado_anterior['puesto_rama'] != $_POST['rama']) {
        $condiciones[] = "puesto_rama = '$_POST[rama]'";
        $campos_actualizar['puesto_rama'] = "$_POST[rama]";
    } 
    if ($resultado_anterior['puesto_puesto'] != $_POST['puesto']) {
        $condiciones[] = "puesto_puesto = '$_POST[puesto]'";
        $campos_actualizar['puesto_puesto'] = "$_POST[puesto]";
    } 
    if ($resultado_anterior['puesto_nivel'] != $_POST['nivel']) {
        $condiciones[] = "puesto_nivel = '$_POST[nivel]'";
        $campos_actualizar['puesto_nivel'] = "$_POST[nivel]";
    } 
    if ($resultado_anterior['puesto_categoria'] != $_POST['categoria']) {
        $condiciones[] = "puesto_categoria = '$_POST[categoria]'";
        $campos_actualizar['puesto_categoria'] = "$_POST[categoria]";
    } 
    if ($resultado_anterior['puesto_descripcion'] != $_POST['descripcion']) {
        $condiciones[] = "puesto_descripcion = '$_POST[descripcion]'";
        $campos_actualizar['puesto_descripcion'] = "$_POST[descripcion]";
    } 
    if ($resultado_anterior['puesto_sdo_diario'] != $_POST['sueldo_diario']) {
        $condiciones[] = "puesto_sdo_diario = '$_POST[sueldo_diario]'";
        $campos_actualizar['puesto_sdo_diario'] = "$_POST[sueldo_diario]";
    } 
    if ($resultado_anterior['puesto_sdo_mensual'] != $_POST['sueldo_mensual']) {
        $condiciones[] = "puesto_sdo_mensual = '$_POST[sueldo_mensual]'";
        $campos_actualizar['puesto_sdo_mensual'] = "$_POST[sueldo_mensual]";
    }
    // Si el sueldo integrado está vacío, asigna NULL
    $sueldo_integrado_form = empty($_POST['sueldo_integrado']) ? 'NULL' : $_POST['sueldo_integrado']; 
    if ($resultado_anterior['puesto_sario_integrado'] != $_POST['sueldo_integrado']) {
        $condiciones[] = "puesto_sario_integrado = $sueldo_integrado_form";
        $campos_actualizar['puesto_sario_integrado'] = "$sueldo_integrado_form";
    }
    if ($resultado_anterior['puesto_status'] != $estatus) {
        $condiciones[] = "puesto_status = $estatus";
        $campos_actualizar['puesto_status'] = "$_POST[estatus]"; 
    } 

    // Si no hubo cambios, lanza una excepción
    if (empty($condiciones)) {
        throw new Exception("Al parecer no hubo ningún cambio realizado.");
    }

    // Combina las condiciones para la sentencia SQL
    $condicion = implode(", ", $condiciones);

    // Realiza la actualización de los datos en la tabla de puestos
    $puesto_actualizacion = "UPDATE trab_puesto
                           SET $condicion
                         WHERE puesto_clave = $_POST[clave_puesto]";
    $query_puesto = @pg_query($conexion, $puesto_actualizacion);

    // Inserta los cambios en la tabla de bitácora para rastrear las modificaciones
    foreach ($campos_actualizar as $clave => $valor){
        // Consulta para obtener el código de la bitácora asociado con el campo
        $select_id_campo  = "SELECT puesto_bitacora_cv, puesto_bitacora_campo FROM trab_puesto_bitacora_campos WHERE puesto_bitacora_campo = '$clave'";
        $select_id_campo_r = @pg_query($conexion,$select_id_campo);
        $select_id_campo_d = @pg_fetch_array($select_id_campo_r);

        // Obtiene el valor anterior del campo
        $valor_anterior = empty($resultado_anterior[$clave]) ? 'null' : "'$resultado_anterior[$clave]'";

        // Inserta el cambio en la tabla de bitácora
        $insert_bitacora = "INSERT INTO trab_puesto_bitacora 
                            VALUES (
                                default,
                                '{$_POST['clave_puesto']}',
                                '$select_id_campo_d[puesto_bitacora_cv]',
                                $valor_anterior,
                                '$valor',
                                now(),
                                '{$_SERVER['REMOTE_ADDR']}',
                                '{$_SESSION['usr_id']}'
                            )";
        
        $query_insert_bitacora = @pg_query($conexion, $insert_bitacora);
    }

    // Verifica si las consultas fueron exitosas y confirma la transacción
    if (!$query_puesto) { 
        throw new Exception('Hubo un error al editar los datos del puesto');  
    } else if (!$query_insert_bitacora) { 
        throw new Exception('Hubo un error al guardar en bitacora');  
    } else {
        @pg_query($conexion, "COMMIT");  // Si todo es exitoso, realiza el commit de la transacción
        $response = array("success" => true);  // Respuesta exitosa
    }

} catch (Exception $e) {
    // Si ocurre un error, realiza un rollback de la transacción y maneja el error
    @pg_query($conexion, "ROLLBACK");
    $response = array("error" => true, "mensaje" => $e->getMessage());  // Respuesta con el error
}

// Convierte la respuesta a formato JSON y la imprime
$jsonstring = json_encode($response);
echo $jsonstring;
?>
<<<<<<< HEAD
=======
=======
<?php
session_start();  // Inicia la sesión para gestionar información del usuario
include ('/usr/local/apache/htdocs/conf/conexion.php');  // Incluye el archivo de conexión a la base de datos

// Inicia una transacción para garantizar la consistencia de las operaciones
try {
    @pg_query($conexion, "BEGIN");  // Comienza una transacción en la base de datos

    // Obtiene la información actual del puesto desde la base de datos
    $puesto_dato_anterior = "SELECT * FROM trab_puesto WHERE puesto_clave = $_POST[clave_puesto]";
    $query_puesto_anterior = @pg_query($conexion, $puesto_dato_anterior);
    $resultado_anterior = @pg_fetch_array($query_puesto_anterior);  // Extrae los resultados de la consulta

    // Convierte los valores del status ('A' = Activo, 'I' = Inactivo) a valores numéricos (1 y 2 respectivamente)
    $estatus = ($_POST['status'] == 'A') ? 1 : 2;

    // Define los arrays para los campos a actualizar y las condiciones
    $campos_actualizar = array();
    $condiciones = array();

    $campo['puesto_clave'] = $_POST['puesto_clave'];  // Asigna la clave del puesto

    // Compara los valores anteriores con los nuevos y construye las condiciones para actualizar
    if ($resultado_anterior['puesto_grupo'] != $_POST['grupo']) {
        $condiciones[] = "puesto_grupo = '$_POST[grupo]'";
        $campos_actualizar['puesto_grupo'] = "$_POST[grupo]";
    } 
    if ($resultado_anterior['puesto_rama'] != $_POST['rama']) {
        $condiciones[] = "puesto_rama = '$_POST[rama]'";
        $campos_actualizar['puesto_rama'] = "$_POST[rama]";
    } 
    if ($resultado_anterior['puesto_puesto'] != $_POST['puesto']) {
        $condiciones[] = "puesto_puesto = '$_POST[puesto]'";
        $campos_actualizar['puesto_puesto'] = "$_POST[puesto]";
    } 
    if ($resultado_anterior['puesto_nivel'] != $_POST['nivel']) {
        $condiciones[] = "puesto_nivel = '$_POST[nivel]'";
        $campos_actualizar['puesto_nivel'] = "$_POST[nivel]";
    } 
    if ($resultado_anterior['puesto_categoria'] != $_POST['categoria']) {
        $condiciones[] = "puesto_categoria = '$_POST[categoria]'";
        $campos_actualizar['puesto_categoria'] = "$_POST[categoria]";
    } 
    if ($resultado_anterior['puesto_descripcion'] != $_POST['descripcion']) {
        $condiciones[] = "puesto_descripcion = '$_POST[descripcion]'";
        $campos_actualizar['puesto_descripcion'] = "$_POST[descripcion]";
    } 
    if ($resultado_anterior['puesto_sdo_diario'] != $_POST['sueldo_diario']) {
        $condiciones[] = "puesto_sdo_diario = '$_POST[sueldo_diario]'";
        $campos_actualizar['puesto_sdo_diario'] = "$_POST[sueldo_diario]";
    } 
    if ($resultado_anterior['puesto_sdo_mensual'] != $_POST['sueldo_mensual']) {
        $condiciones[] = "puesto_sdo_mensual = '$_POST[sueldo_mensual]'";
        $campos_actualizar['puesto_sdo_mensual'] = "$_POST[sueldo_mensual]";
    }
    // Si el sueldo integrado está vacío, asigna NULL
    $sueldo_integrado_form = empty($_POST['sueldo_integrado']) ? 'NULL' : $_POST['sueldo_integrado']; 
    if ($resultado_anterior['puesto_sario_integrado'] != $_POST['sueldo_integrado']) {
        $condiciones[] = "puesto_sario_integrado = $sueldo_integrado_form";
        $campos_actualizar['puesto_sario_integrado'] = "$sueldo_integrado_form";
    }
    if ($resultado_anterior['puesto_status'] != $estatus) {
        $condiciones[] = "puesto_status = $estatus";
        $campos_actualizar['puesto_status'] = "$_POST[estatus]"; 
    } 

    // Si no hubo cambios, lanza una excepción
    if (empty($condiciones)) {
        throw new Exception("Al parecer no hubo ningún cambio realizado.");
    }

    // Combina las condiciones para la sentencia SQL
    $condicion = implode(", ", $condiciones);

    // Realiza la actualización de los datos en la tabla de puestos
    $puesto_actualizacion = "UPDATE trab_puesto
                           SET $condicion
                         WHERE puesto_clave = $_POST[clave_puesto]";
    $query_puesto = @pg_query($conexion, $puesto_actualizacion);

    // Inserta los cambios en la tabla de bitácora para rastrear las modificaciones
    foreach ($campos_actualizar as $clave => $valor){
        // Consulta para obtener el código de la bitácora asociado con el campo
        $select_id_campo  = "SELECT puesto_bitacora_cv, puesto_bitacora_campo FROM trab_puesto_bitacora_campos WHERE puesto_bitacora_campo = '$clave'";
        $select_id_campo_r = @pg_query($conexion,$select_id_campo);
        $select_id_campo_d = @pg_fetch_array($select_id_campo_r);

        // Obtiene el valor anterior del campo
        $valor_anterior = empty($resultado_anterior[$clave]) ? 'null' : "'$resultado_anterior[$clave]'";

        // Inserta el cambio en la tabla de bitácora
        $insert_bitacora = "INSERT INTO trab_puesto_bitacora 
                            VALUES (
                                default,
                                '{$_POST['clave_puesto']}',
                                '$select_id_campo_d[puesto_bitacora_cv]',
                                $valor_anterior,
                                '$valor',
                                now(),
                                '{$_SERVER['REMOTE_ADDR']}',
                                '{$_SESSION['usr_id']}'
                            )";
        
        $query_insert_bitacora = @pg_query($conexion, $insert_bitacora);
    }

    // Verifica si las consultas fueron exitosas y confirma la transacción
    if (!$query_puesto) { 
        throw new Exception('Hubo un error al editar los datos del puesto');  
    } else if (!$query_insert_bitacora) { 
        throw new Exception('Hubo un error al guardar en bitacora');  
    } else {
        @pg_query($conexion, "COMMIT");  // Si todo es exitoso, realiza el commit de la transacción
        $response = array("success" => true);  // Respuesta exitosa
    }

} catch (Exception $e) {
    // Si ocurre un error, realiza un rollback de la transacción y maneja el error
    @pg_query($conexion, "ROLLBACK");
    $response = array("error" => true, "mensaje" => $e->getMessage());  // Respuesta con el error
}

// Convierte la respuesta a formato JSON y la imprime
$jsonstring = json_encode($response);
echo $jsonstring;
?>
>>>>>>> e40c811f0792c47020ea16882dd53dc56fd1a088
>>>>>>> 390319036638cb11f96d0426c37d77bbec365fef
