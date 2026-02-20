<?php
require_once __DIR__ . '/../../config/conexion.php';

// Obtener el término de búsqueda (puede venir por GET o POST)
$q = $_GET['q'] ?? $_POST['q'] ?? '';

// Consultar con JOIN para obtener credencial y nombre del responsable
$sql = "SELECT 
            u.trab_credencial AS id_credencial, 
            u.nombre AS nombre_persona
        FROM 
            public.usuarios u
        WHERE 
            u.trab_credencial ILIKE '%$q%' OR u.nombre ILIKE '%$q%'
        LIMIT 10";

$result = pg_query($conexion, $sql);

$credenciales = [];
if ($result) {
    while ($row = pg_fetch_assoc($result)) {
        $credenciales[] = $row;
    }
}

header('Content-Type: application/json');
echo json_encode($credenciales);