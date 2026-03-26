<?php
require_once 'config.php';
class Database
{
    private static $instance = null;

    public static function conectar()
    {
        if (self::$instance === null) {
            try {
                $cadena = "host=" . DB_HOST . " port=" . DB_PORT . " dbname=" . DB_NAME . " user=" . DB_USER . " password=" . DB_PASS;

                self::$instance = @pg_connect($cadena);

                if (!self::$instance) {
                    throw new Exception("No se puede conectar a LA BD: " . pg_last_error());
                }
            } catch (Exception $e) {
                //Logueamos el error internamente
                error_log($e->getMessage());
                return false;
            }
        }
        return self::$instance;
    }

    public static function desconectar()
    {
        if (self::$instance) {
            pg_close(self::$instance);
            self::$instance = null;
        }
    }
}
//EJEMPLO DE COMO IMPORTAR LA CONEXION:
// require_once "../../conf/conexion.php";
// O fuera de app_login: require_once '/var/www/login_shared/conf/conexion.php';
// $db = Database::conectar();
// $res = pg_query($db, "SELECT * FROM tabla");
