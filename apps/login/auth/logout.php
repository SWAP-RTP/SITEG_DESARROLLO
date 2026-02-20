<?php
setcookie("access_token", "", [
    'expires' => time() - 3600,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
]);

header("Location: http://localhost:8086/login.html?message=sesion_cerrada");
exit();
