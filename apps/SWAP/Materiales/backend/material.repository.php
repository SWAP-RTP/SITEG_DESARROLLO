<?php
require_once __DIR__ . '../../../config/conexion.php';

function insertarMaterial($data) {
    $conexion = conexion();
    if (!$conexion) {
        return false;
    }

    // Validar si la credencial existe
    $query = "SELECT 1 FROM public.usuarios WHERE CAST(trab_credencial AS VARCHAR) = CAST($1 AS VARCHAR) LIMIT 1";
    $resultado = pg_query_params($conexion, $query, [$data['id_credencial']]);
    if (!pg_fetch_assoc($resultado)) {
        // Credencial no existe
        return "credencial_invalida";
    }

    // Validar si el código de material ya existe
    $query = "SELECT 1 FROM public.Catalogo_Materiales WHERE codigo_material = $1 LIMIT 1";
    $resultado = pg_query_params($conexion, $query, [$data['codigo_material']]);
    if (pg_fetch_assoc($resultado)) {
        return "codigo_duplicado";
    }

    // Si no existe, inserta el material
    $query = "INSERT INTO public.Catalogo_Materiales
    (codigo_material, descripcion_material, grupo_pertenece,
     unidad_entrada, cantidad_material, ubicacion_almacen,
     estado_material, nombre_persona, id_credencial, area_adscripcion)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)";

    $resultado = pg_query_params($conexion, $query, [
        $data['codigo_material'],
        $data['descripcion_material'],
        $data['grupo_pertenece'],
        $data['unidad_entrada'],
        $data['cantidad_material'],
        $data['ubicacion_almacen'],
        $data['estado_material'],
        $data['nombre_persona'],
        $data['id_credencial'],
        $data['area_adscripcion']
    ]);

    return $resultado ? true : false;
}

function consultarMateriales() {
    $conexion = conexion();
    if (!$conexion) {
        return false;
    }

    $query = "SELECT * FROM public.Catalogo_Materiales ORDER BY fecha_registro DESC";
    $resultado = pg_query($conexion, $query);

    if (!$resultado) {
        return false;
    }

    $materiales = [];
    while ($row = pg_fetch_assoc($resultado)) {
        $materiales[] = $row;
    }

    return $materiales;
}


function buscarTrabajador($id_credencial) {
    $conexion = conexion();
    if (!$conexion) {
        return false;
    }
    $query = "SELECT nombre FROM public.usuarios WHERE CAST(trab_credencial AS VARCHAR) = CAST($1 AS VARCHAR) LIMIT 1";
    $resultado = pg_query_params($conexion, $query, [$id_credencial]);
    if ($row = pg_fetch_assoc($resultado)) {
        return $row['nombre'];
    } else {
        return false;
    }
}