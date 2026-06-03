<?php
session_start();
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf/conexion.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/pdfs/table_def.inc');
require_once($_SERVER['DOCUMENT_ROOT'] . '/pdfs/fpdf_table.php');

// === Obtener el ID de la incidencia (entero) ===
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

// === Incidencia con fecha/hora formateadas desde SQL ===
$incidencia_sql = "
  SELECT 
    folio, modulo, credencial, nombre, puesto, postura, economico,
    hora_reporte,
    to_char(hora_reporte, 'YYYY-MM-DD') AS fecha,
    to_char(hora_reporte, 'HH24:MI')     AS hora,
    planta, ruta, articulo, art_inciso,
    anomalia_detectada, anomalia_id, desc_anomalia,
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
if (!$r1)
  die('Error consultando la incidencia.');
$row1 = pg_fetch_assoc($r1);
if (!$row1)
  die('No se encontró la incidencia solicitada.');

// === Asignación de variables ===
$folio = $row1['folio'];
$nombre = $row1['nombre'];
$credencial = $row1['credencial'];
$modulo = $row1['modulo'];
$puesto = $row1['puesto'];
$postura = $row1['postura'];
$economico = ($row1['economico'] && trim($row1['economico']) !== '') ? $row1['economico'] : 'N/A';
$planta = $row1['planta'];
$ruta = $row1['ruta'];
$articulo = $row1['articulo'];
$art_inciso = $row1['art_inciso'];
$anomalia_detectada = $row1['anomalia_detectada'];
$desc_anomalia = $row1['desc_anomalia'];

$nombre_registro_consecutivo = $row1['nombre_registro_consecutivo'];
$nombre_supervisor = $row1['nombre_supervisor'];
$nombre_jefatura = $row1['nombre_jefatura'];
$nombre_tipo_jefe = $row1['nombre_tipo_jefe'];

$fecha = $row1['fecha']; // 2025-10-05
$hora = $row1['hora'];  // 13:30

// Totales
$qTotal = "SELECT COUNT(*) AS total_registros FROM sgio_reportes WHERE credencial = $credencial;";
$r2 = @pg_query($conexion, $qTotal);
if (!$r2)
  die('Error consultando total de reportes.');
$row2 = pg_fetch_assoc($r2);
$total_registros = isset($row2['total_registros']) ? (int) $row2['total_registros'] : 0;

$qDia = "
  SELECT COUNT(*) AS xdia
  FROM sgio_reportes
  WHERE credencial = $credencial
    AND hora_reporte::date = (
      SELECT hora_reporte::date FROM sgio_reportes WHERE id = $id LIMIT 1
    );
";
$r3 = @pg_query($conexion, $qDia);
if (!$r3)
  die('Error consultando total por día.');
$row3 = pg_fetch_assoc($r3);
$xdia = isset($row3['xdia']) ? (int) $row3['xdia'] : 0;

// =================== PDF ===================
class PDF extends FPDF
{
  function Header()
  {
    // Logo
    $this->Image($_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/logo.jpg', 10, 6, 65);
    // Título
    $this->SetXY(96, 8);
    $this->SetFont('Arial', 'B', 9);
    $this->MultiCell(110, 3.4, utf8_decode(
      "RED DE TRANSPORTE DE PASAJEROS DE LA CIUDAD DE MEXICO\nDIRECCIÓN EJECUTIVA DE OPERACIÓN Y MANTENIMIENTO.\nGERENCIA DE OPERACIÓN DEL SERVICIO."
    ), 0, 'L');
    // Línea separadora
    // $this->SetY(22);
    // $this->SetDrawColor(0,0,0);
    // $this->SetLineWidth(0.3);
    // $this->Line(10, $this->GetY(), 200, $this->GetY());
  }
}

$pdf = new PDF('P', 'mm', 'A4');   // VERTICAL
$pdf->SetMargins(10, 8, 10);
$pdf->AddPage();
$pdf->SetAutoPageBreak(true, 18);

// Helper: celda con etiqueta y línea + valor encima
function campoLinea($pdf, $x, $y, $etiqueta, $valor = '', $wEtiqueta = 38, $wLinea = 60, $font = 'Arial', $size = 8)
{
  $pdf->SetFont($font, '', $size);
  $pdf->SetXY($x, $y);
  $pdf->Cell($wEtiqueta, 6, utf8_decode($etiqueta . ':'), 0, 0, 'L');
  $pdf->SetDrawColor(0, 0, 0);
  $pdf->SetLineWidth(0.3);
  $lineX1 = $x + $wEtiqueta + 1;
  $lineX2 = $lineX1 + $wLinea;
  $lineY = $y + 4.5;
  $pdf->Line($lineX1, $lineY, $lineX2, $lineY);
  // Valor centrado sobre la línea
  $pdf->SetXY($lineX1, $y + 1.2);
  $pdf->Cell($wLinea, 3.5, utf8_decode($valor), 0, 0, 'C');
}

// Título del formato
$pdf->SetFont('Arial', 'B', 10);
$pdf->SetXY(10, 22);
$pdf->Cell(188, 9, utf8_decode('REPORTE POR PARTE DEL PERSONAL DE SUPERVISIÓN'), 1, 0, 'C');

// FOLIO (izquierda)
$pdf->SetFont('Arial', '', 8);
$pdf->SetXY(10, 40); //sube y baja
$pdf->Cell(10, 7, 'FOLIO:', 0, 0, 'L');
$pdf->SetLineWidth(0.3); //grosor de línea
$pdf->Line(22, 45, 40, 45); // linea debajo del folio, alinea, largo o corto la linea, alinea
$pdf->SetXY(6, 41); //mueve hacia derecha o izq, sube y baja el $folio
$pdf->Cell(50, 5, utf8_decode($folio), 0, 0, 'C');

// Cuadro de fecha/hora (derecha)
list($anio, $mes, $dia) = explode('-', $fecha);
$xFecha = 145;
$yFecha = 33;
$wCel = 13;
$hCel = 5.5; //posicion izq o der, 
$pdf->SetFont('Arial', '', 8);
$pdf->SetXY($xFecha, $yFecha);
$encabezados = array('DÍA', 'MES', 'AÑO', 'HORA');
foreach ($encabezados as $txt) {
  $pdf->Cell($wCel, $hCel, utf8_decode($txt), 1, 0, 'C');
}
$pdf->Ln();
$pdf->SetX($xFecha);
$pdf->Cell($wCel, $hCel, utf8_decode($dia), 1, 0, 'C');
$pdf->Cell($wCel, $hCel, utf8_decode($mes), 1, 0, 'C');
$pdf->Cell($wCel, $hCel, utf8_decode($anio), 1, 0, 'C');
$pdf->Cell($wCel, $hCel, utf8_decode($hora), 1, 0, 'C');

// Bloque de datos del trabajador
$y0 = 47; //Espacio entre el folio y el nombre del trabajador
campoLinea($pdf, 10, $y0, 'NOMBRE DEL TRABAJADOR', $nombre, 40, 75);
campoLinea($pdf, 130, $y0, 'CREDENCIAL', $credencial, 20, 28);

$y0 += 7;
campoLinea($pdf, 10, $y0, 'MÓDULO', $modulo, 15, 10);
campoLinea($pdf, 40, $y0, 'PUESTO', $puesto, 13, 55);
campoLinea($pdf, 112, $y0, 'ECONÓMICO', $economico, 20, 20);

$y0 += 7;
campoLinea($pdf, 10, $y0, 'RUTA', $ruta, 9, 35);
campoLinea($pdf, 58, $y0, 'ANOMALÍA DETECTADA EN', $anomalia_detectada, 40, 70);

// Descripción de la anomalía
$yDesc = $y0 + 12;
$pdf->SetLineWidth(0.3);
$pdf->SetFont('Arial', 'B', 11);
$pdf->SetXY(11, $yDesc);
$pdf->Cell(206 - 2 * 10, 7, utf8_decode('DESCRIPCIÓN DE LA ANOMALÍA'), 1, 0, 'C');

$pdf->SetFont('Arial', '', 7);
$pdf->SetXY(11, $yDesc + 7);
$wDesc = 206 - 2 * 10;
$pdf->MultiCell($wDesc, 5, utf8_decode($desc_anomalia), 1, 'L');

// Fila ARTÍCULO / INCISO
$yAI = $pdf->GetY();
$pdf->SetFont('Arial', 'B', 9);
$pdf->SetXY(11, $yAI);
$pdf->Cell($wDesc / 4, 6, 'ARTICULO', 1, 0, 'C');
$pdf->SetFont('Arial', '', 7);
$pdf->Cell($wDesc / 4, 6, utf8_decode($articulo), 1, 0, 'C');
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell($wDesc / 4, 6, 'INCISO', 1, 0, 'C');
$pdf->SetFont('Arial', '', 7);
$pdf->Cell($wDesc / 4, 6, utf8_decode($art_inciso), 1, 0, 'C');

$yFirmas = $yAI + 10;

// ====== Bloque de firmas (3 columnas) ======
$col = 3;
$wCol = (210 - 2 * 10) / $col;
$titulos = array(
  'REGISTRO CONSECUTIVO',
  'SUPERVISOR QUE REPORTA',
  'JEFATURA DE GESTIÓN DEL SERVICIO'
);
$nombres = array(
  $nombre_registro_consecutivo,
  $nombre_supervisor,
  $nombre_jefatura
);

$pdf->SetFont('Arial', 'B', 9);
for ($i = 0; $i < $col; $i++) {
  $pdf->SetXY(5 + $i * $wCol, $yFirmas);
  $pdf->Cell($wCol, 15, utf8_decode($titulos[$i]), 0, 0, 'C');
}
$pdf->SetFont('Arial', '', 8);
for ($i = 0; $i < $col; $i++) {
  $pdf->SetXY(8 + $i * $wCol, $yFirmas + 6);
  $pdf->Cell($wCol, 50, utf8_decode($nombres[$i]), 0, 0, 'C');
}
// línea de firma
$pdf->SetDrawColor(0, 0, 0);
$pdf->SetLineWidth(0.3);
for ($i = 0; $i < $col; $i++) {
  $x1 = 10 + $i * $wCol + 8;
  $x2 = 8 + ($i + 1) * $wCol - 8;
  $yL = $yFirmas + 28;
  $pdf->Line($x1, $yL, $x2, $yL);
}
// pie "Nombre y Firma"
$pdf->SetFont('Arial', '', 9);
for ($i = 0; $i < $col; $i++) {
  $pdf->SetXY(7 + $i * $wCol, $yFirmas + 15);
  $pdf->Cell($wCol, 40, 'Nombre y Firma', 0, 0, 'C');
}

// Texto JUD (debajo de la 1ª columna)
$pdf->SetFont('Arial', 'B', 9);
$pdf->SetXY(10, $yFirmas + 22);
$pdf->Cell($wCol, 40, utf8_decode('GERENTE O JEFE DE UNIDAD DEPARTAMENTAL : ' . $nombre_tipo_jefe), 0, 0, 'L');

// Totales (derecha)
$pdf->SetFont('Arial', 'B', 8);
$txt1 = 'TOTAL GENERAL  ' . $total_registros . '  REPORTES';
$ancho1 = $pdf->GetStringWidth($txt1);
$pdf->SetXY(-145 - 10 - $ancho1, $yFirmas + 50);
$pdf->Cell($ancho1, 4, utf8_decode($txt1), 0, 0, 'L');
$pref = 'TOTAL GENERAL  ';
$xNum1 = 66 - 10 - $ancho1 + $pdf->GetStringWidth($pref);
$numWidth1 = $pdf->GetStringWidth((string) $total_registros);
$pdf->SetLineWidth(0.3);
$pdf->Line($xNum1, $yFirmas + 53.5, $xNum1 + $numWidth1, $yFirmas + 53.5);

// Total del día
$txt2 = 'TOTAL DE REPORTES: ' . $xdia;
$ancho2 = $pdf->GetStringWidth($txt2);
$pdf->SetXY(200 - 10 - $ancho2, $yFirmas + 50);
$pdf->Cell($ancho2, 4, utf8_decode($txt2), 0, 0, 'L');
$pref2 = 'TOTAL DE REPORTES: ';
$xNum2 = 201 - 10 - $ancho2 + $pdf->GetStringWidth($pref2);
$numWidth2 = $pdf->GetStringWidth((string) $xdia);
$pdf->Line($xNum2, $yFirmas + 53.5, $xNum2 + $numWidth2, $yFirmas + 53.5);

// ====== Logos al pie ======
function dibujarFooterLogo($pdf, $rutaLogo, $x, $y, $w, $h = 0)
{
  $pdf->Image($rutaLogo, $x, $y, $w, $h);
}
$yFooter = 270;
dibujarFooterLogo($pdf, $_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/logo2026.jpg', 15, $yFooter - 6, 180);
// dibujarFooterLogo($pdf, $_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/logocdmx_mujer.jpg', 150, $yFooter-5, 40);
// dibujarFooterLogo($pdf, $_SERVER['DOCUMENT_ROOT'] . '/Incidencias/img/70_AÑOS.jpg',        175, $yFooter-7, 15);

$pdf->Output();
