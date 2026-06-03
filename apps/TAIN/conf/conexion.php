<?php

    require_once 'config.php';

    class Database_tablero {
        private static $instance = null;

        public static function conectar() {
            if (self::$instance === null) {
                try {
                    $cadena = "host=" . DB_HOST_T . " port=" . DB_PORT_T . " dbname=" . DB_NAME_T . " user=" . DB_USER_T . " password=" . DB_PASS_T;

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

        public static function desconectar() {
            if (self::$instance) {
                pg_close(self::$instance);
                self::$instance = null;
            }
        }
    }

    class Database_central {
        private static $instance = null;

        public static function conectar() {
            if (self::$instance === null) {
                try {
                    $cadena = "host=" . DB_HOST_C . " port=" . DB_PORT_C . " dbname=" . DB_NAME_C . " user=" . DB_USER_C . " password=" . DB_PASS_C;

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

        public static function desconectar() {
            if (self::$instance) {
                pg_close(self::$instance);
                self::$instance = null;
            }
        }
    }

    class Database_sugo {
        private static $instance = null;

        public static function conectar() {
            if (self::$instance === null) {
                try {
                    $cadena = "host=" . DB_HOST_S . " port=" . DB_PORT_S . " dbname=" . DB_NAME_S . " user=" . DB_USER_S . " password=" . DB_PASS_S;

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

        public static function desconectar() {
            if (self::$instance) {
                pg_close(self::$instance);
                self::$instance = null;
            }
        }
    }

    class Database_accidentes {
        private static $instance = null;

        public static function conectar() {
            if (self::$instance === null) {
                try {
                    $cadena = "host=" . DB_HOST_A . " port=" . DB_PORT_A . " dbname=" . DB_NAME_A . " user=" . DB_USER_A . " password=" . DB_PASS_A;

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

        public static function desconectar() {
            if (self::$instance) {
                pg_close(self::$instance);
                self::$instance = null;
            }
        }
    }

    //EJEMPLO DE COMO IMPORTAR LA CONEXION:
    // require_once "../../conf/conexion.php";
    // O fuera de app_login: require_once '/var/www/login_shared/conf/conexion.php';
    // $db = Database_tablero::conectar();
    // $res = pg_query($db, "SELECT * FROM tabla");
?>