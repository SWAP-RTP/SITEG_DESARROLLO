<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 390319036638cb11f96d0426c37d77bbec365fef
<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

// Variables para respuestas
$json = array();
$arrayErrores = array();
$arrayCorrectos = array();
$sinCoincidencias = array(); // Arreglo para almacenar claves sin coincidencias

try {
    @pg_query($conexion, "BEGIN");

    // Verifica si se ha subido un archivo
    if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Error al cargar el archivo');
    }

    // Abre el archivo CSV
    $archivoCSV = $_FILES['archivo']['tmp_name'];
    if (($archivo = fopen($archivoCSV, "rb")) !== FALSE) {
        $x = 0; // Inicializa el contador de líneas
        $numeroLineas = 0; // Contador para verificar contenido más allá de los encabezados

        while (($datos = fgetcsv($archivo, 1000, ",")) !== FALSE) {
            if (!empty($datos[0])) {
                // Validación de encabezados
                if ($x == 0) { 
                    if (($datos[0] != 'Clave puesto') || ($datos[1] != 'Descripcion') || ($datos[2] != 'Sueldo mensual')) {
                        throw new Exception('Encabezados del archivo no válidos');
                    }
                } else {
                    $numeroLineas++; // Cuenta las líneas de contenido después de los encabezados
                    $clave_puesto = trim($datos[0]);
                    $descripcion = trim($datos[1]);

                    // Validación para "Sueldo mensual"
                    if (!is_numeric($datos[2])) {
                        throw new Exception("El valor de 'Sueldo mensual' no es un número válido.");
                    }

                    $grupo = substr($clave_puesto, 0, 1);       //Primer caracter (Grupo)
                    $rama = substr($clave_puesto, 1, 1);        //Segundo caracter (Rama)
                    $puesto = substr($clave_puesto, 2, 2);      //Tercer y cuarto caracteres (Puesto)
                    $nivel = substr($clave_puesto, 4, 1);       //caracter (Nivel)
                    $categoria = substr($clave_puesto, 5, 1);   //Sexto caracter (Categoría)

                    $puesto_dato_anterior = "SELECT * FROM trab_puesto 
                        WHERE puesto_grupo = '$grupo'
                            AND puesto_rama = '$rama'
                            AND puesto_puesto = '$puesto'
                            AND puesto_nivel = '$nivel'
                            AND puesto_categoria = '$categoria'
                            AND puesto_descripcion = '$descripcion'";

                    $query_puesto_anterior = @pg_query($conexion, $puesto_dato_anterior);
                    $row = @pg_num_rows($query_puesto_anterior);

                    // Si el puesto existe, actualiza los sueldos
                    if ($row > 0) {
                        $sueldo_diario = $datos[2] / 30; // Calcula el nuevo sueldo diario

                        $sql_update = "UPDATE trab_puesto SET puesto_sdo_mensual = $datos[2],
                                        puesto_sdo_diario = $sueldo_diario 
                                    WHERE puesto_descripcion = '$descripcion'";

                        $query_update = @pg_query($conexion, $sql_update);

                        if (!$query_update) {
                            throw new Exception('Error al actualizar los datos');
                        } else {
                            @pg_query($conexion, "COMMIT");
                            $json = array('success' => true, 'mensaje' => 'Se ejecutó correctamente la actualización');
                        }
                    } else {
                        // Si no hay coincidencias, agrega la clave al arreglo
                        $sinCoincidencias[] = $clave_puesto;
                    }
                }
                $x++; // Incrementa el contador de líneas
            }
        }

        fclose($archivo); // Cierra el archivo

        // Validación para archivos que solo contienen encabezados
        if ($numeroLineas === 0) {
            throw new Exception('El archivo no contiene datos más allá de los encabezados.');
        }

    } else {
        throw new Exception('Error al abrir el archivo');
    }

    // Si hay claves sin coincidencias, genera un mensaje
    if (!empty($sinCoincidencias)) {
        throw new Exception('No se encontraron coincidencias para las siguientes claves: ' . implode(", ", $sinCoincidencias));
    }

} catch (Exception $e) {
    @pg_query($conexion, "ROLLBACK");
    $json = array('error' => true, 'mensaje' => 'Ocurrió un error: ' . $e->getMessage());
}

$jsonstring = json_encode($json); 
echo $jsonstring; 
?>
<<<<<<< HEAD
=======
=======
<?php
session_start();
include ('/usr/local/apache/htdocs/conf/conexion.php');

// Variables para respuestas
$json = array();
$arrayErrores = array();
$arrayCorrectos = array();
$sinCoincidencias = array(); // Arreglo para almacenar claves sin coincidencias

try {
    @pg_query($conexion, "BEGIN");

    // Verifica si se ha subido un archivo
    if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Error al cargar el archivo');
    }

    // Abre el archivo CSV
    $archivoCSV = $_FILES['archivo']['tmp_name'];
    if (($archivo = fopen($archivoCSV, "rb")) !== FALSE) {
        $x = 0; // Inicializa el contador de líneas
        $numeroLineas = 0; // Contador para verificar contenido más allá de los encabezados

        while (($datos = fgetcsv($archivo, 1000, ",")) !== FALSE) {
            if (!empty($datos[0])) {
                // Validación de encabezados
                if ($x == 0) { 
                    if (($datos[0] != 'Clave puesto') || ($datos[1] != 'Descripcion') || ($datos[2] != 'Sueldo mensual')) {
                        throw new Exception('Encabezados del archivo no válidos');
                    }
                } else {
                    $numeroLineas++; // Cuenta las líneas de contenido después de los encabezados
                    $clave_puesto = trim($datos[0]);
                    $descripcion = trim($datos[1]);

                    // Validación para "Sueldo mensual"
                    if (!is_numeric($datos[2])) {
                        throw new Exception("El valor de 'Sueldo mensual' no es un número válido.");
                    }

                    $grupo = substr($clave_puesto, 0, 1);       //Primer caracter (Grupo)
                    $rama = substr($clave_puesto, 1, 1);        //Segundo caracter (Rama)
                    $puesto = substr($clave_puesto, 2, 2);      //Tercer y cuarto caracteres (Puesto)
                    $nivel = substr($clave_puesto, 4, 1);       //caracter (Nivel)
                    $categoria = substr($clave_puesto, 5, 1);   //Sexto caracter (Categoría)

                    $puesto_dato_anterior = "SELECT * FROM trab_puesto 
                        WHERE puesto_grupo = '$grupo'
                            AND puesto_rama = '$rama'
                            AND puesto_puesto = '$puesto'
                            AND puesto_nivel = '$nivel'
                            AND puesto_categoria = '$categoria'
                            AND puesto_descripcion = '$descripcion'";

                    $query_puesto_anterior = @pg_query($conexion, $puesto_dato_anterior);
                    $row = @pg_num_rows($query_puesto_anterior);

                    // Si el puesto existe, actualiza los sueldos
                    if ($row > 0) {
                        $sueldo_diario = $datos[2] / 30; // Calcula el nuevo sueldo diario

                        $sql_update = "UPDATE trab_puesto SET puesto_sdo_mensual = $datos[2],
                                        puesto_sdo_diario = $sueldo_diario 
                                    WHERE puesto_descripcion = '$descripcion'";

                        $query_update = @pg_query($conexion, $sql_update);

                        if (!$query_update) {
                            throw new Exception('Error al actualizar los datos');
                        } else {
                            @pg_query($conexion, "COMMIT");
                            $json = array('success' => true, 'mensaje' => 'Se ejecutó correctamente la actualización');
                        }
                    } else {
                        // Si no hay coincidencias, agrega la clave al arreglo
                        $sinCoincidencias[] = $clave_puesto;
                    }
                }
                $x++; // Incrementa el contador de líneas
            }
        }

        fclose($archivo); // Cierra el archivo

        // Validación para archivos que solo contienen encabezados
        if ($numeroLineas === 0) {
            throw new Exception('El archivo no contiene datos más allá de los encabezados.');
        }

    } else {
        throw new Exception('Error al abrir el archivo');
    }

    // Si hay claves sin coincidencias, genera un mensaje
    if (!empty($sinCoincidencias)) {
        throw new Exception('No se encontraron coincidencias para las siguientes claves: ' . implode(", ", $sinCoincidencias));
    }

} catch (Exception $e) {
    @pg_query($conexion, "ROLLBACK");
    $json = array('error' => true, 'mensaje' => 'Ocurrió un error: ' . $e->getMessage());
}

$jsonstring = json_encode($json); 
echo $jsonstring; 
?>
>>>>>>> e40c811f0792c47020ea16882dd53dc56fd1a088
>>>>>>> 390319036638cb11f96d0426c37d77bbec365fef
