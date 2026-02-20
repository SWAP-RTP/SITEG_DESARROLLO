<?php

    function conexionTablero() {
        //conexion a la base de datos del TABLERO
        try{
            /*
            usamos el puerto 5438 que es el externo en vez del interno 5432
            tambien cambiamos el localhost por la ip 172.0.0.1, ya que postgres_5438 es un alias interno que solo funciona dentro de una red de docker 
            */
            
            // $localhost = 'postgres_5438';
            // $port = '5432';
            $localhost = '10.10.30.28';
            $port = '5437';
            $dbname = 'swap_2025';
            $user = 'desarrollo';
            $password = 'desarrollo';
 
            $pdo = new PDO("pgsql:host=$localhost;port=$port;dbname=$dbname", $user, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            return $pdo;
            
        } catch (PDOException $e) {
            echo "Error de conexión DB TABLERO: " . $e->getMessage();
            return null;
        }
    }

    function conexionCentral() {
        //conexion a la base de datos de produccion del CENTRAL 
        try {
            $localhost = '10.10.30.27';
            $port = '5432';
            $dbname = 'almacen';
            $user = 'almacen';
            $password = 'Almacen';

            $pdo = new PDO("pgsql:host=$localhost;port=$port;dbname=$dbname", $user, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            return $pdo;

        } catch (PDOException $e) {
            echo "Error de conexión DB CENTRAL: " . $e->getMessage();
            return null;
        }
    }

    function conexionSugo() {
        //conexion a la base de datos de produccion del SUGO
        try {
            $localhost = '10.10.31.178';
            $port = '5468';
            $dbname = 'db_sugo';
            $user = 'postgres';
            $password = 'postgres';

            $pdo = new PDO("pgsql:host=$localhost;port=$port;dbname=$dbname", $user, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            return $pdo;

        } catch (PDOException $e) {
            echo "Error de conexión DB SUGO: " . $e->getMessage();
            return null;
        }
    }

    function conexionAccidentes() {
    // conexion a la base de datos de ACCIDENTES
    try {
        $localhost = '10.10.30.5';
        $port = '5432';
        $dbname = 'accidentes_pv_db';
        $user = 'postgres';
        $password = 'accidentes10';

        $pdo = new PDO("pgsql:host=$localhost;port=$port;dbname=$dbname", $user, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $pdo;

    } catch (PDOException $e) {
        echo "Error de conexión DB ACCIDENTES: " . $e->getMessage();
        return null;
    }
    }
?>