<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;

require "../conf/conexion.php";

$host = "10.10.30.28";
$port = 5437;
$dbname = "swap_2025";
$user = "desarrollo";
$password = "desarrollo";

try {
    $db = Database::conectar();
    if (!$db) {
        throw new Exception("Error al conectar con la DB");
    }

    $usuario_input = $_POST['ingresaUsuario'] ?? '';
    $pass_input = $_POST['ingresaPassword'] ?? '';

    if (!empty($usuario_input) && !empty($pass_input)) {
        $sql = "SELECT 
                u.trab_credencial, 
                u.nombre, 
                u.correo, 
                u.contrasena, 
                u.modulo, 
                mp.cve_permiso, 
                msd.modulo_sistem_descrip,
                ads.dir_nombre
            FROM usuarios u 
            LEFT JOIN modulo_perm mp ON mp.trab_credencial = u.trab_credencial 
            LEFT JOIN modulo_sistem msd ON msd.cve_modulo = mp.cve_modulo 
               LEFT join adsc_direccion ads on msd.pertenencia = ads.dir_cve
            WHERE u.correo = $1
        ";
        $result = pg_query_params($db, $sql, array($usuario_input));
        $user_rows = pg_fetch_all($result);

        if ($user_rows && password_verify($pass_input, $user_rows[0]['contrasena'])) {
            //Generamos un identificador de sesion único para el usuario
            $session_id = bin2hex(random_bytes(16));
            //Guardamos el identificador de la sesion el la bd para futuras validaciones
            $updateSql = "UPDATE usuarios SET session_id = $1 WHERE correo = $2";
            pg_query_params($db, $updateSql, array($session_id, $user_rows[0]['correo']));

            $user_info = [
                'id' => $user_rows[0]['correo'],
                'name' => $user_rows[0]['nombre'],
                'trab_credencial' => $user_rows[0]['trab_credencial'],
                'modulo' => $user_rows[0]['modulo'],
            ];

            $permisos = [];
            foreach ($user_rows as $row) {
                if ($row['cve_permiso'] && $row['modulo_sistem_descrip']) {
                    $permisos[] = [
                        'permiso' => $row['cve_permiso'],
                        'modulo' => $row['modulo_sistem_descrip'],
                    ];
                }
            }

            $key = getenv('JWT_SECRET') ?: 'CLAVE_SUPER_SECRETA_PARA_SITEG_LARGA_2026_MUY_SEGURA';
            $payload = [
                'iat' => time(),
                'exp' => time() + 3600,
                'session_id' => $session_id,
                'data' => $user_info,
                'permisos' => $permisos
            ];

            $jwt = JWT::encode($payload, $key, 'HS256');
            setcookie("access_token", $jwt, [
                'expires' => time() + 3600,
                'path' => '/',
                'samesite' => 'Lax'
            ]);

            echo json_encode([
                "status" => "success",
                "token" => $jwt,
                "usuario" => $user_info,
                "permisos" => $permisos
            ]);
            exit;
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Usuario o Contraseña incorrectos"
            ]);
            exit;
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Usuario y contraseña requeridos"
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
    exit;
}