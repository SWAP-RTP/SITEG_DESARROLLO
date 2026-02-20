<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

if (isset($_FILES['foto_nueva'])) {
    $foto = $_FILES['foto_nueva'];
    $credencial = $_POST['credencial'];

    // Verificar si no hay errores en la carga del archivo.
    if ($foto['error'] === UPLOAD_ERR_OK) {
        $tmpName = $foto['tmp_name'];

        // Elimina la foto antigua si existe.
        $rutaFotoAnterior = $_SERVER['DOCUMENT_ROOT'] . '/Recursos_Humanos_New/fotos/' . $credencial . '.jpg';
        if (file_exists($rutaFotoAnterior)) {
            $eliminar_foto_anterior = unlink($rutaFotoAnterior);
        } else {
            $eliminar_foto_anterior = true; // Si no existe, lo consideramos un éxito.
        }

        // Definir el nombre de la nueva foto como el valor de la credencial.
        $nombreArchivo = $credencial . '.jpg';
        $foto_path = '/Recursos_Humanos_New/fotos/' . $nombreArchivo;
        $rutaDestino = $_SERVER['DOCUMENT_ROOT'] . $foto_path;

        // Mover el archivo a la ruta de destino y verificar si la eliminación fue exitosa.
        if ($eliminar_foto_anterior && move_uploaded_file($tmpName, $rutaDestino)) {
            $json = array('success' => true, 'mensaje' => 'Foto subida con éxito');
        } else {
            $json = array('error' => true, 'mensaje' => 'Error al mover el archivo o eliminar la foto anterior');
        }
    } else {
        $json = array('error' => true, 'mensaje' => 'Error en la carga del archivo');
    }
} else {
    $json = array('error' => true, 'mensaje' => 'No se recibió ningún archivo');
}


$jsonstring = json_encode($json);
echo $jsonstring; 
?>