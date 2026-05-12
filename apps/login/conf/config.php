<?php
//EVITAMOS QUE ALGUIEN ACCEDA DIRECTAMENTE A ESTE ARCHIVO
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    exit('Acceso denegado');
}

//VARIABLES DE LA BASE DE DATOS 
define('DB_HOST', '10.10.30.28');
define('DB_PORT', '5437');
define('DB_NAME', 'swap_2025');
define('DB_USER', 'desarrollo');
define('DB_PASS', 'desarrollo');
