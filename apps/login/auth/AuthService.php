<?php
use Firebase\JWT\JWT;

class AuthService
{
    private $secretKey;

    public function __construct()
    {
        $this->secretKey = getenv('JWT_SECRET') ?: 'CLAVE_SUPER_SECRETA_PARA_SITEG_LARGA_2026_MUY_SEGURA';
    }

    //FUNCION PARA CREAR EL TOKEN
    public function generarToken($user_info, $session_id)
    {
        $payload = [
            'iat' => time(),
            'exp' => time() + 3600,
            'session_id' => $session_id,
            'data' => $user_info
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }
}