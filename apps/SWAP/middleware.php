<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
// 1. Ruta dinámica para asegurar que encuentra el autoload
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    die("Error: No se encontró la carpeta vendor. Ejecuta 'composer require firebase/php-jwt' en este contenedor.");
}
require_once $autoloadPath;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function validarAcceso()
{
    // 2. Verificamos que la clave secreta exista
    $key = getenv('JWT_SECRET');
    if (!$key) {
        $key = "CLAVE_SUPER_SECRETA_PARA_SITEG_LARGA_2026_MUY_SEGURA"; // Opcional: Clave de respaldo si falla el env
    }

    $jwt = $_COOKIE['access_token'] ?? null;

    if (!$jwt) {
        // Redirección al puerto 8086 del Login
        header("Location: http://localhost:8086/login.html?error=necesitas_loguearte");
        exit;
    }

    try {
        // 3. Decodificación con la clase Key requerida por las versiones nuevas de la librería
        $decoded = JWT::decode($jwt, new Key($key, 'HS256'));

        // Retornamos los datos para poder usarlos en el HTML (ej: echo $user->name)
        return $decoded->data;
    } catch (Exception $e) {
        // Si el token expiró o la firma es falsa
        header("Location: http://localhost:8086/login.html?error=sesion_invalida");
        exit;
    }
}

// Opcional: Si quieres que este archivo proteja automáticamente cualquier página que lo incluya:
// $usuarioLogueado = validarAcceso();