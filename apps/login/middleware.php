<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

// 1. Detectamos dinámicamente dónde está vendor
// Si existe en la ruta local (__DIR__) o en la ruta compartida de Docker
$autoloadPath = file_exists(__DIR__ . '/vendor/autoload.php')
    ? __DIR__ . '/vendor/autoload.php' : '/var/www/login_shared/vendor/autoload.php';


if (!file_exists($autoloadPath)) {
    die("Error: No se encontró la carpeta vendor en " . $autoloadPath);
}
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once $autoloadPath;
$repoPath = __DIR__ . '/auth/UsuarioRepository.php';

if (file_exists($repoPath)) {
    require_once $repoPath;
} else {
    require_once '/var/www/login_shared/auth/UsuarioRepository.php';
}

function validarAcceso()
{
    $confPath = file_exists(__DIR__ . '/conf/conexion.php') ? __DIR__ . '/conf/conexion.php' : '/var/www/login_shared/conf/conexion.php';
    if (!file_exists($confPath)) {
        die("Error: No se encontró el archivo de configuración en " . $confPath);
    }
    require_once $confPath;

    //requerimos la conexion a la base de datos para validar el session_id del token con el que esta registrado en la bd
    //Verificamos que la clave secreta exista
    $key = getenv('JWT_SECRET') ?: "CLAVE_SUPER_SECRETA_PARA_SITEG_LARGA_2026_MUY_SEGURA";
    $jwt = $_COOKIE['access_token'] ?? null; // Puedes usar una clave de respaldo si no se encuentra la variable de entorno
    if (!$jwt) {
        header("Location: /login.html?error=sesion_invalida");
        exit;
    }

    try {
        //Decodificación con la clase Key requerida por las versiones nuevas de la librería
        $decoded = JWT::decode($jwt, new Key($key, 'HS256'));
        //VALIDACION DE SESION UNICA 
        //1. Conectamos a la DB 
        $db = Database::conectar();
        $repo = new UsuarioRepository($db);

        //USAMOS EL METODO DE REPOSITORIO
        $id_usuario = $decoded->data->id;
        $session_en_db = $repo->obtenerSessionId($id_usuario);
        //Comparamos el ID del token contra el de la base de datos
        //Si no coinciden, significa que el usuario inició sesión en otro dispositivo o navegador, invalidando la sesión actual
        if ($decoded->session_id !== $session_en_db) {
            //Borramos la cookie para que el usuario no entre en un bucle 
            setcookie("access_token", "", time() - 3600, "/");
            header("Location: /login.html?error=sesion_duplicada");
            exit;
        }
        // FIN DE LA VALIDACION DE SESION UNICA
        // Retornamos los datos para poder usarlos en el HTML (ej: echo $user->name)
        // $decoded->data->id = $id_usuario;
        return $decoded->data;

    } catch (Exception $e) {
        // Si el token expiró o la firma es falsa
        setcookie("access_token", "", time() - 3600, "/");
        header("Location: /login.html?error=sesion_invalida");
        exit;
    } finally {
        if (isset($db))
            Database::desconectar();
    }
}
