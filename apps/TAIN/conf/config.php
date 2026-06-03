<?php
//EVITAMOS QUE ALGUIEN ACCEDA DIRECTAMENTE A ESTE ARCHIVO
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    exit('Acceso denegado');
}

//VARIABLES DE LAS BASES DE DATOS 

//credenciales tablero
/*
        usamos el puerto 5438 que es el externo en vez del interno 5432
        tambien cambiamos el localhost por la ip 172.0.0.1, ya que postgres_5438 es un alias interno que solo funciona dentro de una red de docker 
        */
        
        // $localhost = 'postgres_5438';
        // $port = '5432';
define('DB_HOST_T', '10.10.30.28');
define('DB_PORT_T', '5437');
define('DB_NAME_T', 'swap_2025');
define('DB_USER_T', 'desarrollo');
define('DB_PASS_T', 'desarrollo');

//credenciales SWAP central
define('DB_HOST_C', '10.10.30.27');
define('DB_PORT_C', '5432');
define('DB_NAME_C', 'almacen');
define('DB_USER_C', 'almacen');
define('DB_PASS_C', 'Almacen');

//credenciales SUGO 
define('DB_HOST_S', '10.10.31.178');
define('DB_PORT_S', '5468');
define('DB_NAME_S', 'db_sugo');
define('DB_USER_S', 'postgres');
define('DB_PASS_S', 'postgres');

//credenciales ACCIDENTES
define('DB_HOST_A', '10.10.30.5');
define('DB_PORT_A', '5432');
define('DB_NAME_A', 'accidentes_pv_db');
define('DB_USER_A', 'postgres');
define('DB_PASS_A', 'accidentes10');