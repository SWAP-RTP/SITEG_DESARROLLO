<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

$json = array();

// Consulta el detalle del trabajador
$detalle_trabajador = "SELECT * FROM trabajador t WHERE trab_credencial = $_POST[credencial]";

$query_trabajador = @pg_query($conexion, $detalle_trabajador);
while ($resultado_trabajador = @pg_fetch_Array($query_trabajador)) {

    $foto_path = '/Recursos_Humanos_New/fotos/' . $resultado_trabajador['trab_foto'];
    $foto_completa = $_SERVER['DOCUMENT_ROOT'] . $foto_path;
    
    $json = array(
        'credencial' => $resultado_trabajador['trab_credencial'],
        'nombre' => $resultado_trabajador['trab_nombre'],
        'apellido_paterno' => $resultado_trabajador['trab_apaterno'],
        'apellido_materno' => $resultado_trabajador['trab_amaterno'],
        'tipo_contrato' => $resultado_trabajador['tipo_contrato_cve'],
        'tipo_trabajador_cve' => $resultado_trabajador['tipo_trab_clave'],
        'puesto_cve' => $resultado_trabajador['puesto_clave'],
        'adscripcion_cve' => $resultado_trabajador['adsc_cve'],
        'estatus' => $resultado_trabajador['trab_status'],
        'RFC' => $resultado_trabajador['trab_rfc'],
        'CURP' => $resultado_trabajador['trab_curp'],
        'estado_nacimiento' => $resultado_trabajador['ent_fed_nac_cve'],
        'naciolidad_cve' => $resultado_trabajador['trab_nacionalidad_cve'],
        'calle' => $resultado_trabajador['trab_dir_calle'],
        'colonia_cve' => $resultado_trabajador['cp_cve'],
        'codigo_postal' => $resultado_trabajador['trab_dir_cp'],
        'poblacion' => $resultado_trabajador['trab_dir_poblacion'],
        'edo' => $resultado_trabajador['trab_dir_entidad'],
        'telefono' => $resultado_trabajador['trab_telefono'],
        'email' => $resultado_trabajador['trab_mail'],
        'no_nomina' => $resultado_trabajador['trab_cta_bancaria'],
        'telefono_movil' => $resultado_trabajador['trab_tel_cel'],
        'estado_civil' => $resultado_trabajador['trab_edo_civil_cve'],
        'escolaridad' => $resultado_trabajador['trab_estudios_cve'],
        'estado_escolaridad' => $resultado_trabajador['traba_escolaridad_estado_cve'],
        'adscripcion_cve' => $resultado_trabajador['adsc_cve'],
        'sexo' => $resultado_trabajador['trab_sex_cve'],
        'fecha_nacimiento' => !empty($resultado_trabajador['trab_fec_naci']) ? date('Y-m-d', strtotime(implode('-', array_reverse(explode('/', $resultado_trabajador['trab_fec_naci']))))) : '',
        'fecha_ingreso' => !empty($resultado_trabajador['trab_fec_ingreso']) ? date('Y-m-d', strtotime(implode('-', array_reverse(explode('/', $resultado_trabajador['trab_fec_ingreso']))))) : '',
        'fecha_contrato' => !empty($resultado_trabajador['fecha_contrato']) ? date('Y-m-d', strtotime(implode('-', array_reverse(explode('/', $resultado_trabajador['fecha_contrato']))))) : '',
        'no_afiliacion' => $resultado_trabajador['trab_no_afiliacion'],
        'familiar_1' => $resultado_trabajador['trab_nom_padre'],
        'familiar_2' => $resultado_trabajador['trab_nom_madre'],
        'foto' => (!empty($resultado_trabajador['trab_foto']) && file_exists($foto_completa)) ? $foto_path : '/Recursos_Humanos_New/fotos/sin-foto.png',
    );
}






$jsonstring = json_encode($json);
echo $jsonstring; 
?>