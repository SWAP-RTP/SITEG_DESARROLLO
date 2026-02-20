<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json = array();
$columnas = array();
$condicion = array();


// Itera sobre la data de POST, especialmente sobre los switches del HTML.
foreach ($_POST as $key => $value) {
    // echo 'columna: '.$key. ' valor: '.$value."\n";

    // Modifica la columna de la credencial
    if ($key == 'trab_credencial') {
        $key = 't.trab_credencial'; 
    }

    // accede unicamente a los que tenga un valor true, almacenando la llave a un array
    if ($value == 'true' && $key != 'todos_switch') { 
        $columnas[] = $key;  
    }
}
//separa mediante comas las columnas 
$columnas = implode(',', $columnas);





// Funciones que comprueban si el valor no esta vacio para dejar una condicion por defecto
function Condiciones($column, $value) {
    global $condicion;
   if (!empty($value)) {
        $condicion[] = "$column = '$value'";
    }
}

function CondicioneRangos($column, $valor1, $valor2) {
    global $condicion;
    if (!empty($valor1) && !empty($valor2)) {
        $condicion[] = "$column BETWEEN '$valor1' AND '$valor2' ";
    }
}

// Se llama a las funciones con su respectivos elementos que requiere la funcion

// Credencial
if (!empty($_POST['credencial_inicio']) && !empty($_POST['credencial_fin'])) {
    CondicioneRangos('t.trab_credencial', $_POST['credencial_inicio'], $_POST['credencial_fin']);
} else {
    Condiciones('t.trab_credencial', !empty($_POST['credencial_inicio']) ? $_POST['credencial_inicio'] : $_POST['credencial_fin']);
}

// Fechas
if (!empty($_POST['fecha_inicio']) && !empty($_POST['fecha_fin'])) {
    CondicioneRangos('t.trab_fec_ingreso', $_POST['fecha_inicio'], $_POST['fecha_fin']);
} else {
    Condiciones('t.trab_fec_ingreso', !empty($_POST['fecha_inicio']) ? $_POST['fecha_inicio'] : $_POST['fecha_inicio']);
}

Condiciones('t.trab_nombre', $_POST['nombre']); 
Condiciones('t.trab_apaterno', $_POST['apellido_paterno']); 
Condiciones('t.trab_amaterno', $_POST['apellido_materno']); 
Condiciones('t.trab_periodo', $_POST['indicativo']); 
Condiciones('t.trab_sex_cve', $_POST['sexo']); 
Condiciones('t.adsc_cve', $_POST['adscripcion']); 
Condiciones('t.trab_status', $_POST['estatus']); 
Condiciones('tt.tipo_trab_clave', $_POST['div_proc']); 


// Si la condicion ya contiene un valor este agreda el AND 
if (!empty($condicion)) {
    $Condicion = "WHERE " . implode(" AND ", $condicion);
} else {
    $Condicion = '';
}

// Validación de POST para adsc_numero usando condición ternaria
$adscripcion_desc = ($_POST['adsc_numero'] === 'true') ? 
    ",CASE adsc_div_cve
        WHEN '1' THEN (SELECT dir_nombre FROM adsc_direccion WHERE dir_cve = a.dir_cve)
        WHEN '2' THEN (SELECT ger_nombre FROM adsc_gerencia WHERE ger_cve = a.ger_cve)
        WHEN '3' THEN (SELECT depto_nombre FROM adsc_depto WHERE depto_cve = a.depto_cve)
        WHEN '4' THEN (SELECT oficina_nombre FROM adsc_oficina WHERE oficina_cve = a.of_cve)
     END || ' ' || 
     CASE mod_cve WHEN 0 THEN ' ' ELSE m.mod_desc END AS adscripcion, a.adsc_cve" 
    : '';

// Validación de POST para trab_fec_naci usando condición ternaria
$edad = ($_POST['trab_fec_naci'] === 'true') ? ",date_part('year', age(trab_fec_naci)) AS edad" : '';
$orden = (!empty($_POST['ordenar_por']) ? $_POST['ordenar_por'] : 'trab_credencial');

// Consulta el detalle del trabajador
$trabajador = "SELECT $columnas $adscripcion_desc $edad
                 FROM trabajador t
            LEFT JOIN tipo_trabajador tt ON (t.tipo_trab_clave = tt.tipo_trab_clave)
            LEFT JOIN trab_puesto tp ON (t.puesto_clave = tp.puesto_clave)
            LEFT JOIN trab_edo_civil tec ON (t.trab_edo_civil_cve = tec.trab_edo_civil_cve)
            LEFT JOIN trab_status ts ON (t.trab_status = ts.trab_status_cve)
            LEFT JOIN trab_sex ts2 ON (t.trab_sex_cve = ts2.trab_sex_cve)
            LEFT JOIN trab_escolaridad te ON (t.trab_estudios_cve = te.esc_cve)
            LEFT JOIN cat_estados ce ON (t.ent_fed_nac_cve = ce.estado_cve)
            LEFT JOIN adscripcion a ON (t.adsc_cve = a.adsc_cve)
            LEFT JOIN trab_escolaridad_estado tee ON (t.traba_escolaridad_estado_cve = tee.trab_esc_estado_cve)
           INNER JOIN modulo m ON (a.mod_cve = m.mod_clave)
                      $Condicion
             ORDER BY $orden ASC";

$query_trabajador = @pg_query($conexion, $trabajador);
while ($resultado_trabajador = @pg_fetch_Array($query_trabajador)) {
    $puesto_clave = (int)$resultado_trabajador['puesto_grupo'] . 
                (string)$resultado_trabajador['puesto_rama'] . 
                (string)$resultado_trabajador['puesto_puesto'] . 
                (string)$resultado_trabajador['puesto_nivel'] . 
                (string)$resultado_trabajador['puesto_categoria'];

    // Reemplazar 0 por null usando el operador ternario
    $puesto_clave = ($puesto_clave === '0') ? null : $puesto_clave;
    $foto_path = '/Recursos_Humanos_New/fotos/' . $resultado_trabajador['trab_foto'];
    $foto_completa = $_SERVER['DOCUMENT_ROOT'] . $foto_path;
    
    $json[] = array(
        'credencial' => $resultado_trabajador['trab_credencial'],
        'nombre' => $resultado_trabajador['trab_nombre'],
        'apellido_paterno' => $resultado_trabajador['trab_apaterno'],
        'apellido_materno' => $resultado_trabajador['trab_amaterno'],
        'indicativo' => $resultado_trabajador['trab_periodo'],
        'division' => $resultado_trabajador['tipo_trab_div'],
        'proceso' => $resultado_trabajador['tipo_trab_proc'],
        'tipo_trabajador' => $resultado_trabajador['tipo_trab_descripcion'],
        'puesto_cve' => $puesto_clave,
        'puesto' => $resultado_trabajador['puesto_descripcion'],
        'SDI' => $resultado_trabajador['puesto_sdo_diario'],
        'sueldo_mensual' => $resultado_trabajador['puesto_sdo_mensual'],
        'estatus' => $resultado_trabajador['trab_status_desc'],
        'RFC' => $resultado_trabajador['trab_rfc'],
        'CURP' => $resultado_trabajador['trab_curp'],
        'lugar_nacimiento' => $resultado_trabajador['trab_lugar_nac'],
        'calle' => $resultado_trabajador['trab_dir_calle'],
        'colonia' => $resultado_trabajador['trab_dir_colonia'],
        'codigo_postal' => $resultado_trabajador['trab_dir_cp'],
        'poblacion' => $resultado_trabajador['trab_dir_poblacion'],
        'edo' => $resultado_trabajador['trab_dir_entidad'],
        'telefono' => $resultado_trabajador['trab_telefono'],
        'telefono_movil' => $resultado_trabajador['trab_tel_cel'],
        'estado_civil' => $resultado_trabajador['trab_edo_civil_desc'],
        'estudios' => $resultado_trabajador['esc_desc'],
        'estado_escolaridad' => $resultado_trabajador['trab_esc_estado_desc'],
        'adscripcion_numero' => $resultado_trabajador['adsc_numero'],
        'adscripcion_desc' => $resultado_trabajador['adscripcion'],
        'adscripcion_cve' => $resultado_trabajador['adsc_cve'],
        'sexo' => $resultado_trabajador['trab_sex_desc'],
        'fecha_nacimiento' => $resultado_trabajador['trab_fec_naci'],
        'edad' => $resultado_trabajador['edad'],
        'fecha_ingreso' => $resultado_trabajador['trab_fec_ingreso'],
        'fecha_contrato' => $resultado_trabajador['fecha_contrato'],
        'modulo' => $resultado_trabajador['mod_desc'],
        'no_afiliacion_imms' => $resultado_trabajador['trab_no_afiliacion'],
        'familiar_1' => $resultado_trabajador['trab_nom_padre'],
        'familiar_2' => $resultado_trabajador['trab_nom_madre'],
        'foto' => (!empty($resultado_trabajador['trab_foto']) && file_exists($foto_completa)) ? $foto_path : '/Recursos_Humanos_New/fotos/sin-foto.png',
    );
}






$jsonstring = json_encode($json);
echo $jsonstring; 
?>