<?php
session_start();
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/pdfs/table_def.inc');
require_once($_SERVER['DOCUMENT_ROOT'] . '/pdfs/fpdf_table.php');



// === Obtener el ID de la incidencia (entero) ===
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

$incidencia_sql = "
  SELECT 
    folio,
    modulo,
    credencial,
    nombre,
    puesto,
    postura,
    economico,
    hora_reporte,                                   
    to_char(hora_reporte, 'YYYY-MM-DD') AS fecha,   
    to_char(hora_reporte, 'HH24:MI')     AS hora,   
    planta,
    ruta,
    articulo,
    art_inciso,
    mb_articulo,
    mb_inciso,
    anomalia_detectada,
    anomalia_id,
    desc_anomalia,
    user_regconsecutivo   AS usuario_registra,
    nombre_registro_consecutivo,
    user_supervisorep     AS usuario_supervisor,
    nombre_supervisor,
    user_jefaturags       AS usuario_jefatura,
    nombre_jefatura,
    nombre_tipo_jefe,
    user_adsctrab         AS usuario_adscrito,
    user_captura          AS usuario_captura,
    estatus_id
  FROM sgio_reportes
  WHERE id = $id
  ORDER BY id DESC;
";

$r1 = @pg_query($conexion, $incidencia_sql);
if (!$r1) {
    die('Error consultando la incidencia.');
}
$row1 = pg_fetch_assoc($r1);
if (!$row1) {
    die('No se encontró la incidencia solicitada.');
}

//Variables Incidencia

$folio = $row1['folio'];
$nombre = $row1['nombre'];
$credencial = $row1['credencial'];
$modulo = $row1['modulo'];
$puesto = $row1['puesto'];
$hora_reporte = $row1['hora_reporte'];
$postura = $row1['postura'];
$economico = $row1['economico'];
$planta = $row1['planta'];
$ruta = $row1['ruta'];
$articulo = $row1['articulo'];
$art_inciso = $row1['art_inciso'];
$mb_articulo = $row1['mb_articulo'];
$mb_inciso = $row1['mb_inciso'];
$anomalia_detectada = $row1['anomalia_detectada'];
$anomalia_id = $row1['anomalia_id'];
$desc_anomalia = $row1['desc_anomalia'];

$usuario_registra = $row1['usuario_registra'];
$nombre_registro_consecutivo = $row1['nombre_registro_consecutivo'];
$usuario_supervisor = $row1['usuario_supervisor'];
$nombre_supervisor = $row1['nombre_supervisor'];

$nombre_jefatura = $row1['nombre_jefatura'];
$nombre_tipo_jefe = $row1['nombre_tipo_jefe'];

// Formateados desde SQL
$fecha = $row1['fecha'];   // ej. 2025-10-05
$hora = $row1['hora'];    // ej. 00:16

$qTotal = "
  SELECT COUNT(*) AS total_registros
  FROM sgio_reportes
  WHERE credencial = $credencial;
";
$r2 = @pg_query($conexion, $qTotal);
if (!$r2) {
    die('Error consultando total de reportes.');
}
$row2 = pg_fetch_assoc($r2);
$total_registros = isset($row2['total_registros']) ? (int) $row2['total_registros'] : 0;

// === 3) Total de reportes el mismo día que ESTE reporte (por credencial) ===
$qDia = "
  SELECT COUNT(*) AS xdia
  FROM sgio_reportes
  WHERE credencial = $credencial
    AND hora_reporte::date = (
      SELECT hora_reporte::date
      FROM sgio_reportes
      WHERE id = $id
      LIMIT 1
    );
";
$r3 = @pg_query($conexion, $qDia);
if (!$r3) {
    die('Error consultando total por día.');
}
$row3 = pg_fetch_assoc($r3);
$xdia = isset($row3['xdia']) ? (int) $row3['xdia'] : 0;

// Clase PDF personalizada con header y footer
class PDF extends FPDF
{
    function Header()
    {
        // Logo izquierdo
        $this->Image($_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/logo.jpg', 10, 5, 40);
        // Texto encabezado izquierdo
        $this->SetXY(55, 5); // Ajusta la posición según lo necesites
        $this->SetFont('Arial', 'B', 6);
        $this->MultiCell(115, 3, utf8_decode(
            "RED DE TRANSPORTE DE PASAJEROS DE LA CIUDAD DE MEXICO\nDIRRECCION EJECUTIVA DE OPERACION Y MANTENIMIENTO.\nGERENCIA DE OPERACION DEL SERVICIO."
        ), 0, 'L');

        // Logo derecho (simétrico)
        $centroX = $this->w / 2;
        $this->Image($_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/logo.jpg', $centroX + 10, 5, 40);
        // Texto encabezado derecho
        $this->SetXY($centroX + 55, 5);
        $this->SetFont('Arial', 'B', 6);
        $this->MultiCell(115, 3, utf8_decode(
            "RED DE TRANSPORTE DE PASAJEROS DE LA CIUDAD DE MEXICO\nDIRRECCION EJECUTIVA DE OPERACION Y MANTENIMIENTO.\nGERENCIA DE OPERACION DEL SERVICIO."
        ), 0, 'L');
    }

    // function Footer()
    // {
    // 	$this->SetY(-15);
    // 	$this->SetFont('Arial', 'I', 8);
    // 	$this->Cell(0, 10, utf8_decode('Pie de página - Página ') . $this->PageNo(), 0, 0, 'C');
    // }
// ...existing code...
// ...existing code...
}

// Crear PDF horizontal y mostrar header
$pdf = new PDF('L');
$pdf->AddPage();
$pdf->SetFont('Arial', '', 12);

// Línea vertical justo en el centro
$centroX = $pdf->w / 2;
$pdf->SetDrawColor(0, 0, 0);
$pdf->SetLineWidth(0.5);
$pdf->Line($centroX, 0, $centroX, $pdf->h);


// Función para dibujar la tabla de descripción de la anomalía en ambos lados
function dibujarTablaDescripcionAnomaliaDoble($pdf, $centroX, $x, $y, $titulo, $descripcion, $wCelda = 60, $hTitulo = 5, $hDesc = 18, $font = 'Arial', $fontStyle = 'B', $fontSizeTitulo = 6, $fontSizeDesc = 5)
{
    // Título
    $pdf->SetFont($font, $fontStyle, $fontSizeTitulo);
    $pdf->SetXY($x, $y);
    $pdf->Cell($wCelda, $hTitulo, utf8_decode($titulo), 1, 0, 'C');
    $pdf->SetXY($centroX + $x, $y);
    $pdf->Cell($wCelda, $hTitulo, utf8_decode($titulo), 1, 0, 'C');

    // Descripción (MultiCell para responsividad)
    $pdf->SetFont($font, '', $fontSizeDesc);
    $pdf->SetXY($x, $y + $hTitulo);
    $pdf->MultiCell($wCelda, 6, utf8_decode($descripcion), 1, 'L');
    $pdf->SetXY($centroX + $x, $y + $hTitulo);
    $pdf->MultiCell($wCelda, 6, utf8_decode($descripcion), 1, 'L');
}



// Función para dibujar el bloque en ambos lados usando MultiCell
function dibujarBloqueDobleMulti($pdf, $centroX, $x, $y, $texto, $w = 80, $h = 8, $font = 'Arial', $fontStyle = '', $fontSize = 12, $align = 'L', $borde = 1, $offsetX = 0, $offsetY = 0)
{
    $pdf->SetFont($font, $fontStyle, $fontSize);
    // Lado izquierdo
    $pdf->SetXY($x + $offsetX, $y + $offsetY);
    $pdf->MultiCell($w, $h, utf8_decode($texto), $borde, $align);
    // Lado derecho
    $pdf->SetXY($centroX + $x + $offsetX, $y + $offsetY);
    $pdf->MultiCell($w, $h, utf8_decode($texto), $borde, $align);
}



// Ejemplo de uso: puedes controlar fuente, tamaño, estilo y alineación
dibujarBloqueDobleMulti($pdf, $centroX, 15, 17, 'REPORTE POR PARTE DEL PERSONAL DE SUPERVISION', 125, 7, 'Arial', 'B', 9, 'C', 1);

// FOLIO con línea y valor ficticio usando la nueva función
$yFolio = 30;
$xFolio = 14; // margen izquierdo
$wFolio = 13; // ancho del texto
$wLinea = 20; // largo de la línea subrayada
// $folioValor = '123456'; // valor ficticio
$offsetLineaY = 5; // distancia vertical de la línea respecto a $yFolio
$offsetValorY = $offsetLineaY + 4;// distancia vertical del valor respecto a $yFolio


// Función para dibujar el folio, la línea y el valor en ambos lados, todo parametrizable
function dibujarFolioDoble($pdf, $centroX, $x, $y, $wTexto, $wLinea, $folio, $offsetLineaY = 5, $offsetValorY = 7, $font = 'Arial', $fontStyle = '', $fontSize = 9)
{
    // Texto FOLIO:
    $pdf->SetFont($font, $fontStyle, $fontSize);
    $pdf->SetXY($x, $y);
    $pdf->Cell($wTexto, 7, 'FOLIO:', 0, 0, 'L');
    $pdf->SetXY($centroX + $x, $y);
    $pdf->Cell($wTexto, 7, 'FOLIO:', 0, 0, 'L');

    // Línea subrayada justo al terminar "FOLIO:"
    $lineStartX = $x + $wTexto;
    $lineY = $y + $offsetLineaY;
    $pdf->SetDrawColor(0, 0, 0);
    $pdf->SetLineWidth(0.5);
    $pdf->Line($lineStartX, $lineY, $lineStartX + $wLinea, $lineY);

    $lineStartXRight = $centroX + $x + $wTexto;
    $pdf->Line($lineStartXRight, $lineY, $lineStartXRight + $wLinea, $lineY);

    // Valor centrado sobre la línea
    $pdf->SetFont($font, '', $fontSize);
    $pdf->SetXY($x + $wTexto + 0, $y + $offsetValorY);
    $pdf->Cell($wLinea, -12, $folio, 0, 0, 'C');
    $pdf->SetXY($centroX + $x + $wTexto, $y + $offsetValorY);
    $pdf->Cell($wLinea, -12, $folio, 0, 0, 'C');
}
dibujarFolioDoble($pdf, $centroX, $xFolio, $yFolio, $wFolio, $wLinea, $folio, $offsetLineaY, $offsetValorY);

function dibujarFechaDoble($pdf, $centroX, $x, $y, $dia, $mes, $anio, $hora, $wCelda = 10, $hCelda = 4, $font = 'Arial', $fontStyle = '', $fontSize = 7)
{
    $pdf->SetFont($font, $fontStyle, $fontSize);

    // Encabezados
    $encabezados = array('DÍA', 'MES', 'AÑO', 'HORA');
    foreach (array(0, 1) as $lado) {
        $baseX = $lado == 0 ? $x : $centroX + $x;
        $pdf->SetXY($baseX, $y);
        foreach ($encabezados as $titulo) {
            $pdf->Cell($wCelda, $hCelda, utf8_decode($titulo), 1, 0, 'C');
        }
        $pdf->Ln();

        // Valores
        $pdf->SetX($baseX);
        $pdf->Cell($wCelda, $hCelda, utf8_decode($dia), 1, 0, 'C');
        $pdf->Cell($wCelda, $hCelda, utf8_decode($mes), 1, 0, 'C');
        $pdf->Cell($wCelda, $hCelda, utf8_decode($anio), 1, 0, 'C');
        $pdf->Cell($wCelda, $hCelda, utf8_decode($hora), 1, 0, 'C');
        $pdf->Ln();
    }
}

// Obtener día, mes, año y hora desde la variable $fecha y $hora
list($anio, $mes, $dia) = explode('-', $fecha); // $fecha viene en formato YYYY-MM-DD
dibujarFechaDoble($pdf, $centroX, 100, 29, $dia, $mes, $anio, $hora);

function dibujarCampoLineaDoble($pdf, $centroX, $x, $y, $nombreCampo, $valorCampo = '', $wCampo = 25, $wLinea = 40, $font = 'Arial', $fontStyle = '', $fontSize = 9, $offsetLineaX = 0, $offsetLineaY = 5, $offsetValorY = 9)
{
    $pdf->SetFont($font, $fontStyle, $fontSize);
    // Lado izquierdo
    $pdf->SetXY($x, $y);
    $pdf->Cell($wCampo, 7, utf8_decode($nombreCampo . ':'), 0, 0, 'L');
    $pdf->SetDrawColor(0, 0, 0);
    $pdf->SetLineWidth(0.5);
    $pdf->Line($x + $wCampo + $offsetLineaX, $y + $offsetLineaY, $x + $wCampo + $wLinea + $offsetLineaX, $y + $offsetLineaY);
    // Valor sobre la línea (izquierda)
    $pdf->SetXY($x + $wCampo + $offsetLineaX, $y + $offsetValorY);
    $pdf->Cell($wLinea, 5, utf8_decode($valorCampo), 0, 0, 'C');

    // Lado derecho
    $pdf->SetXY($centroX + $x, $y);
    $pdf->Cell($wCampo, 7, utf8_decode($nombreCampo . ':'), 0, 0, 'L');
    $pdf->SetDrawColor(0, 0, 0);
    $pdf->SetLineWidth(0.5);
    $pdf->Line($centroX + $x + $wCampo + $offsetLineaX, $y + $offsetLineaY, $centroX + $x + $wCampo + $wLinea + $offsetLineaX, $y + $offsetLineaY);
    // Valor sobre la línea (derecha)
    $pdf->SetXY($centroX + $x + $wCampo + $offsetLineaX, $y + $offsetValorY);
    $pdf->Cell($wLinea, 5, utf8_decode($valorCampo), 0, 0, 'C');
}

// Ejemplo de uso con valores reales:
$campos = array(
    array('nombre' => 'NOMBRE DEL TRABAJADOR', 'valor' => $nombre, 'x' => 14, 'y' => 45, 'fontSize' => 7, 'offsetLineaX' => 15, 'offsetLineaY' => 5, 'offsetValorY' => 1, 'wLinea' => 50, ),
    array('nombre' => 'CREDENCIAL', 'valor' => $credencial, 'x' => 110, 'y' => 45, 'fontSize' => 7, 'offsetLineaX' => -6, 'offsetLineaY' => 5, 'offsetValorY' => 1, 'wLinea' => 8, ),
    array('nombre' => 'MODULO', 'valor' => $modulo, 'x' => 14, 'y' => 52, 'fontSize' => 7, 'offsetLineaX' => -10, 'offsetLineaY' => 5, 'offsetValorY' => 1, 'wLinea' => 9, ),
    array('nombre' => 'PUESTO', 'valor' => $puesto, 'x' => 42, 'y' => 52, 'fontSize' => 7, 'offsetLineaX' => -12, 'offsetLineaY' => 5, 'offsetValorY' => 1, 'wLinea' => 50, ),
    array('nombre' => 'ECONÓMICO', 'valor' => $economico, 'x' => 106, 'y' => 52, 'fontSize' => 6, 'offsetLineaX' => -8, 'offsetLineaY' => 5, 'offsetValorY' => 1, 'wLinea' => 5, ),
    array('nombre' => 'RUTA', 'valor' => $ruta, 'x' => 14, 'y' => 60, 'fontSize' => 7, 'offsetLineaX' => -14, 'offsetLineaY' => 5, 'offsetValorY' => 1, 'wLinea' => 26, ),
    array('nombre' => 'ANOMALIA DECTECTADA EN', 'valor' => $anomalia_detectada, 'x' => 52, 'y' => 60, 'fontSize' => 7, 'offsetLineaX' => 12, 'offsetLineaY' => 5, 'offsetValorY' => 1, 'wLinea' => 48, ),

);

foreach ($campos as $campo) {
    dibujarCampoLineaDoble(
        $pdf,
        $centroX,
        $campo['x'],
        $campo['y'],
        $campo['nombre'],
        $campo['valor'],
        25,
        $campo['wLinea'],
        'Arial',
        '',
        $campo['fontSize'],
        $campo['offsetLineaX'],
        $campo['offsetLineaY'],
        $campo['offsetValorY']
    );
}

// Ejemplo de uso de la tabla de descripción de la anomalía

// Unir la tabla de anomalía y la fila de artículo/inciso en una sola tabla
$xDesc = 14; // posición horizontal
$yDesc = 70; // posición vertical
$wDesc = 120; // ancho de la celda
$hTitulo = 8; // alto de la celda de título
$hDesc = 18; // alto mínimo de la celda de descripción (MultiCell lo ajusta)
$hCeldaAI = 8; // alto de la fila de artículo/inciso
$wCeldaAI = $wDesc / 4;

// Lado izquierdo

$pdf->SetLineWidth(0.3);
$pdf->SetFont('Arial', 'B', 8);
$pdf->SetXY($xDesc, $yDesc);
$pdf->Cell($wDesc, $hTitulo, utf8_decode('DESCRIPCIÓN DE LA ANOMALÍA'), 1, 0, 'C');
$pdf->SetFont('Arial', '', 7);
$pdf->SetXY($xDesc, $yDesc + $hTitulo);
$pdf->MultiCell($wDesc, 3, utf8_decode($desc_anomalia), 1, 'L');
// Fila de artículo/inciso pegada
$yArticuloInciso = $pdf->GetY();
$pdf->SetFont('Arial', 'B', 6);
$pdf->SetXY($xDesc, $yArticuloInciso);
$pdf->Cell($wCeldaAI, $hCeldaAI, 'RTP ARTICULO', 1, 0, 'C');
$pdf->SetFont('Arial', '', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, utf8_decode($articulo), 1, 0, 'C');
$pdf->SetFont('Arial', 'B', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, 'RTP INCISO', 1, 0, 'C');
$pdf->SetFont('Arial', '', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, utf8_decode($art_inciso), 1, 1, 'C');
//Fila de MB articulo
$ymbArticuloInciso = $pdf->GetY();
$pdf->SetFont('Arial', 'B', 6);
$pdf->SetXY($xDesc, $ymbArticuloInciso);
$pdf->Cell($wCeldaAI, $hCeldaAI, 'MB ARTICULO', 1, 0, 'C');
$pdf->SetFont('Arial', '', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, utf8_decode($mb_articulo), 1, 0, 'C');
$pdf->SetFont('Arial', 'B', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, 'MB INCISO', 1, 0, 'C');
$pdf->SetFont('Arial', '', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, utf8_decode($mb_inciso), 1, 0, 'C');


// Lado derecho
$pdf->SetLineWidth(0.3);
$pdf->SetFont('Arial', 'B', 8);
$pdf->SetXY($centroX + $xDesc, $yDesc);
$pdf->Cell($wDesc, $hTitulo, utf8_decode('DESCRIPCIÓN DE LA ANOMALÍA'), 1, 0, 'C');
$pdf->SetFont('Arial', '', 7);
$pdf->SetXY($centroX + $xDesc, $yDesc + $hTitulo);
$pdf->MultiCell($wDesc, 3, utf8_decode($desc_anomalia), 1, 'L');
$yArticuloIncisoDer = $pdf->GetY();
$pdf->SetFont('Arial', 'B', 6);
$pdf->SetXY($centroX + $xDesc, $yArticuloIncisoDer);
$pdf->Cell($wCeldaAI, $hCeldaAI, 'RTP ARTICULO', 1, 0, 'C');
$pdf->SetFont('Arial', '', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, utf8_decode($articulo), 1, 0, 'C');
$pdf->SetFont('Arial', 'B', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, 'RTP INCISO', 1, 0, 'C');
$pdf->SetFont('Arial', '', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, utf8_decode($art_inciso), 1, 1, 'C');
//Fila de MB articulo
$ymbArticuloIncisoDer = $pdf->GetY();
$pdf->SetFont('Arial', 'B', 6);
$pdf->SetXY($centroX + $xDesc, $ymbArticuloIncisoDer);
$pdf->Cell($wCeldaAI, $hCeldaAI, 'MB ARTICULO', 1, 0, 'C');
$pdf->SetFont('Arial', '', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, utf8_decode($mb_articulo), 1, 0, 'C');
$pdf->SetFont('Arial', 'B', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, 'MB INCISO', 1, 0, 'C');
$pdf->SetFont('Arial', '', 6);
$pdf->Cell($wCeldaAI, $hCeldaAI, utf8_decode($mb_inciso), 1, 0, 'C');

// Función para dibujar el bloque de firmas en ambos lados, adaptado y pequeño
function dibujarFirmasDoble($pdf, $centroX, $y, $firmantes, $hTitulo = 7, $hNombre = 6, $hLinea = 2, $hFirma = 6, $font = 'Arial', $fontSizeTitulo = 8, $fontSizeNombre = 8, $fontSizeFirma = 7)
{
    $n = count($firmantes);
    $anchoMitad = $centroX - 15;
    $wCelda = $anchoMitad / $n;
    for ($lado = 0; $lado < 2; $lado++) {
        $baseX = $lado == 0 ? 15 : $centroX + 15;
        // Títulos
        $pdf->SetFont($font, 'B', $fontSizeTitulo);
        for ($i = 0; $i < $n; $i++) {
            $offsetX = isset($firmantes[$i]['offsetX']) ? $firmantes[$i]['offsetX'] : 0;
            $offsetY = isset($firmantes[$i]['offsetY']) ? $firmantes[$i]['offsetY'] : 0;
            $offsetYTitulo = isset($firmantes[$i]['offsetYTitulo']) ? $firmantes[$i]['offsetYTitulo'] : 0;
            $pdf->SetXY($baseX + $i * $wCelda + $offsetX, $y + $offsetY + $offsetYTitulo);
            $pdf->Cell($wCelda, $hTitulo, utf8_decode($firmantes[$i]['titulo']), 0, 0, 'C');
        }
        // Nombres
        $pdf->SetFont($font, '', $fontSizeNombre);
        for ($i = 0; $i < $n; $i++) {
            $offsetX = isset($firmantes[$i]['offsetX']) ? $firmantes[$i]['offsetX'] : 0;
            $offsetY = isset($firmantes[$i]['offsetY']) ? $firmantes[$i]['offsetY'] : 0;
            $pdf->SetXY($baseX + $i * $wCelda + $offsetX, $y + $hTitulo + $offsetY);
            $pdf->Cell($wCelda, $hNombre, utf8_decode($firmantes[$i]['nombre']), 0, 0, 'C');
        }
        // Línea de firma
        for ($i = 0; $i < $n; $i++) {
            $offsetX = isset($firmantes[$i]['offsetX']) ? $firmantes[$i]['offsetX'] : 0;
            $offsetY = isset($firmantes[$i]['offsetY']) ? $firmantes[$i]['offsetY'] : 0;
            $pdf->SetDrawColor(0, 0, 0);
            $pdf->SetLineWidth(0.4);
            $pdf->Line($baseX + $i * $wCelda + 8 + $offsetX, $y + $hTitulo + $hNombre + $hLinea + $offsetY, $baseX + ($i + 1) * $wCelda - 8 + $offsetX, $y + $hTitulo + $hNombre + $hLinea + $offsetY);
        }
        // Pie de firma
        $pdf->SetFont($font, '', $fontSizeFirma);
        for ($i = 0; $i < $n; $i++) {
            $offsetX = isset($firmantes[$i]['offsetX']) ? $firmantes[$i]['offsetX'] : 0;
            $offsetY = isset($firmantes[$i]['offsetY']) ? $firmantes[$i]['offsetY'] : 0;
            $pdf->SetXY($baseX + $i * $wCelda + $offsetX, $y + $hTitulo + $hNombre + $hLinea + +$offsetY);
            $pdf->Cell($wCelda, $hFirma, 'Nombre y Firma', 0, 0, 'C');
        }
    }
}

// Ejemplo de uso del bloque de firmas adaptado y pequeño

$firmantes = array(
    array('titulo' => 'REGISTRO CONSECUTIVO', 'nombre' => $nombre_registro_consecutivo, 'offsetX' => -8, 'offsetY' => 42, 'offsetYTitulo' => -5),
    array('titulo' => 'SUPERVISOR QUE REPORTA', 'nombre' => $nombre_supervisor, 'offsetX' => -10, 'offsetY' => 42, 'offsetYTitulo' => -5),
    array('titulo' => 'JEFATURA DE GESTIÓN DEL SERVICIO', 'nombre' => $nombre_jefatura, 'offsetX' => -9, 'offsetY' => 42, 'offsetYTitulo' => -5)
);
// Ajusta la posición vertical justo después de la tabla de anomalía
$yFirmas = $yDesc + 40; // posición vertical para que se vea en ambos lados
// Cambia $hNombre de 7 a 2 para que el nombre quede pegado a la raya
dibujarFirmasDoble($pdf, $centroX, $yFirmas, $firmantes, 20, 0, 2, 6, 'Arial', 7, 6, 7);

// Agregar debajo de 'Nombre y Firma' del REGISTRO CONSECUTIVO el texto de JUD solo en la primera celda
$nFirmas = count($firmantes);
$anchoMitad = $centroX - 15;
$wCelda = $anchoMitad / $nFirmas;
for ($lado = 0; $lado < 2; $lado++) {
    $baseX = $lado == 0 ? 15 : $centroX + 15;
    $xJUD = $baseX + 0 * $wCelda + $firmantes[0]['offsetX'];
    $yJUD = $yFirmas + 20 + 2 + 2 + $firmantes[0]['offsetY'] + 6; // y + hTitulo + hNombre + hLinea + hFirma + offsetY
    $pdf->SetFont('Arial', 'B', 6.5);
    $pdf->SetXY($xJUD, $yJUD);
    $pdf->Cell($wCelda, 4, utf8_decode('GERENTE O JEFE DE UNIDAD DEPARTAMENTAL : ' . $nombre_tipo_jefe), 0, 0, 'L');

    // TOTAL GENERAL alineado a la derecha de la celda izquierda
    $yTotal = $yJUD + 4; // solo 4pt debajo
    $pdf->SetFont('Arial', 'B', 6.5);
    $margenDerechoIzq = 7.5;
    $anchoTextoIzq = $pdf->GetStringWidth('TOTAL GENERAL  ' . $total_registros . '  REPORTES');
    $xTextoIzq = $xJUD + $wCelda - $anchoTextoIzq - $margenDerechoIzq;
    $pdf->SetXY($xTextoIzq, $yTotal);
    $pdf->Cell($anchoTextoIzq, 3, utf8_decode('TOTAL GENERAL  ' . $total_registros . '  REPORTES'), 0, 1, 'L');
    // Subrayado solo bajo el número
    $numWidthIzq = $pdf->GetStringWidth($total_registros);
    $xNumIzq = $xTextoIzq + $pdf->GetStringWidth('TOTAL GENERAL  ');
    $pdf->SetLineWidth(0.3);
    $desplazamientoRaya = 1; // Cambia este valor para mover la raya: positivo = derecha, negativo = izquierda
    $pdf->Line($xNumIzq + $desplazamientoRaya, $yTotal + 2.5, $xNumIzq + $numWidthIzq + $desplazamientoRaya, $yTotal + 2.5);
    $pdf->SetLineWidth(0.1);

    // TOTAL DE REPORTES DEL DÍA alineado a la derecha en ambos lados
    $pdf->SetFont('Arial', 'B', 6.5);
    $margenDerecho = -80; // margen interno derecho
    $anchoTexto = $pdf->GetStringWidth('TOTAL DE REPORTES: ' . $xdia);
    $xTexto = $xJUD + $wCelda - $anchoTexto - $margenDerecho;
    $pdf->SetXY($xTexto, $yTotal);
    $txt = 'TOTAL DE REPORTES: ' . $xdia;
    $pdf->Cell($anchoTexto, 3, utf8_decode($txt), 0, 1, 'L');
    // Subrayado solo bajo el número
    $numWidth = $pdf->GetStringWidth($xdia);
    $xNum = $xTexto + $pdf->GetStringWidth('TOTAL DE REPORTES: ');
    $pdf->SetLineWidth(0.3);

    $lineaExtra = 3; // ancho extra en la línea
    $desplazamiento = 1; // mueve 10 puntos a la izquierda
    $pdf->Line($xNum - $lineaExtra / 2 + $desplazamiento, $yTotal + 3.5, $xNum + $numWidth + $lineaExtra / 2 + $desplazamiento, $yTotal + 3.5);
    $pdf->SetLineWidth(0.1);
}


// Función para dibujar el logo en el footer, con tamaño y posición personalizables
function dibujarFooterLogo($pdf, $rutaLogo, $x = 10, $y = 190, $w = 60, $h = 0)
{
    // $x: posición horizontal, $y: posición vertical, $w: ancho, $h: alto (0 = proporcional)
    $pdf->Image($rutaLogo, $x, $y, $w, $h);
}



// Ejemplo: puedes cambiar ruta, posición y tamaño

// Footer lado izquierdo
dibujarFooterLogo($pdf, $_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/logo2026.jpg', 9, 192, 130, 0);
// dibujarFooterLogo($pdf, $_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/logocdmx_mujer.jpg', 105, 200, 20, 0);
// dibujarFooterLogo($pdf, $_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/70_AÑOS.jpg', 125, 198, 15, 0);

// Footer lado derecho (simétrico)
dibujarFooterLogo($pdf, $_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/logo2026.jpg', $centroX + 9, 192, 130, 0);
// dibujarFooterLogo($pdf, $_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/logocdmx_mujer.jpg', $centroX + 105, 200, 20, 0);
// dibujarFooterLogo($pdf, $_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/70_AÑOS.jpg', $centroX + 125, 198, 15, 0);

$pdf->Output();
