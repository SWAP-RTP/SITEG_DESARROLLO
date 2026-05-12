<?php
setcookie("access_token", "", [
    'expires' => time() - 3600,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
]);

header("Location: /login.html?message=sesion_cerrada");
exit();
