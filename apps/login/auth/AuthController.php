<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../vendor/autoload.php';
require "../conf/conexion.php";
require "UsuarioRepository.php";
require "AuthService.php";

class AuthController
{
    public function login()
    {
        try {
            $db = Database::conectar();
            if (!$db) {
                throw new Exception('Error al conectar a la BD');
            }
            $repo = new UsuarioRepository($db);
            $authService = new AuthService();

            $usuario_input = $_POST['ingresaUsuario'] ?? '';
            $pass_input = $_POST['ingresaPassword'] ?? '';

            //VALIDAMOS QUE LOS CAMPOS NO ESTEN VACIOS
            if (empty($usuario_input) || empty($pass_input)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Usuario y contraseña requeridos"]);
                return;
            }

            //BUSCAMOS QUE CREDENCIAL LE PERTENECE A ESE CORREO
            $id_usuario = $repo->obtenerCredencialPorCorreo($usuario_input);
            if (!$id_usuario) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Usuario o Contraseña incorrectos"]);
                return; // ESTE RETURN ES VITAL PARA DETENER LA EJECUCIÓN AQUÍ
            }
            //OBTENEMOS LOS DATOS USANDO LA CREDENCIAL
            $user_rows = $repo->obtenerDatosPorCredencial($id_usuario);

            //VERIFICAMOS LA CONTRASEÑA CONTRA EL REGISTRO DE CREDENCIAL 
            if ($user_rows && password_verify($pass_input, $user_rows[0]['contrasena'])) {
                //si la contraseña es correcta, procedemos con la sesion del usuario
                $session_id = bin2hex(random_bytes(16));
                $repo->actualizarSessionId($id_usuario, $session_id);

                $user_info = [
                    'id' => $id_usuario,
                    'name' => $user_rows[0]['nombre'],
                    'correo' => $user_rows[0]['correo']
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

                $jwt = $authService->generarToken($user_info, $session_id);

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
            } else {
                echo json_encode(["status" => "error", "message" => "Usuario o Contraseña incorrectos"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        } finally {
            if (isset($db) && $db) {
                Database::desconectar();
            }
        }
    }
}