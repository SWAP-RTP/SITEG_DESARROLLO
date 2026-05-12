<?php
class UsuarioRepository
{
    private $db;

    public function __construct($conexionDB)
    {
        $this->db = $conexionDB;
    }

    //FUNCION QUE ASOCIA EL CORREO CON EL ID 
    public function obtenerCredencialPorCorreo($correo)
    {
        $sqlxcorreo = "SELECT id_usuario FROM usuarios_final WHERE correo = $1";
        $res = pg_query_params($this->db, $sqlxcorreo, [$correo]);
        $fila = pg_fetch_assoc($res);
        return $fila['id_usuario'] ?? null;
    }
    //FUNCION QUE FILTRA POR CREDENCIAL AL HACER LA CONSULTA ARRIBA POR CORREO 
    public function obtenerDatosPorCredencial($id_usuario)
    {
        $sqlxcredencial = "SELECT 
                u.id_usuario,  
                u.nombre, 
                u.correo, 
                u.contrasena,
                u.modulo, 
                mp.cve_permiso, 
                msd.modulo_sistem_descrip,
                ads.dir_nombre
            FROM usuarios_final u 
            LEFT JOIN modulo_perm mp ON mp.trab_credencial = u.id_usuario::TEXT
            LEFT JOIN modulo_sistem msd ON msd.cve_modulo = mp.cve_modulo 
            LEFT JOIN adsc_direccion ads ON msd.pertenencia = ads.dir_cve
            WHERE u.id_usuario = $1";

        $result = pg_query_params($this->db, $sqlxcredencial, [$id_usuario]);
        return pg_fetch_all($result);
    }
    //FUNCION QUE ACTUALIZA L ESTADO DE SESESSION PARA EVITAR SESIONES DOBLES
    public function actualizarSessionId($id, $sessionId)
    {
        $updateSql = "UPDATE usuarios_final SET id_session = $1 WHERE id_usuario = $2";
        return pg_query_params($this->db, $updateSql, [$sessionId, $id]);
    }

    public function obtenerSessionId($id)
    {
        $sql = "SELECT id_session FROM usuarios_final WHERE id_usuario = $1";
        $result = pg_query_params($this->db, $sql, [$id]);
        $fila = pg_fetch_assoc($result);
        return $fila['id_session'] ?? null;
    }
}