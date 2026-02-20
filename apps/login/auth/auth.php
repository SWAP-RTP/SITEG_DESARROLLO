<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;

require "../conf/conexion.php";

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;";
    $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    $usuario_input = $_POST['ingresaUsuario'] ?? '';
    $pass_input = $_POST['ingresaPassword'] ?? '';

    if (!empty($usuario_input) && !empty($pass_input)) {
        $stmt = $pdo->prepare("
            SELECT 
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
            WHERE u.correo = ?
        ");
        $stmt->execute([$usuario_input]);
        $user_rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($user_rows && password_verify($pass_input, $user_rows[0]['contrasena'])) {
            $direccion = null;
            foreach ($user_rows as $row) {
                if (!empty($row['dir_nombre'])) {
                    $direccion = $row['dir_nombre'];
                    break;
                }
            }
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
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "message" => "Credenciales inválidas"
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

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error de conexión a la base de datos"
    ]);
    exit;
}