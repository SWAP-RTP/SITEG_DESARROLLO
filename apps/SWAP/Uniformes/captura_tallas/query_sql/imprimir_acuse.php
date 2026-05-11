<?php

session_start();

require_once '/var/www/login_shared/conf/conexion.php';

$conexion = Database::conectar();

if ($conexion) {
    require_once("../../../pdfs/table_def.inc");
    require_once('../../../pdfs/fpdf_table.php');

    class HPDF extends FPDF_TABLE {
        function Header() {}

        // Línea punteada horizontal (sin SetDash)
        function dashedHLine($y, $x1=12, $x2=202, $dash=1.2, $gap=1.2){
            $this->SetDrawColor(150,150,150);
            $x = $x1;
            while ($x < $x2) {
                $xEnd = $x + $dash;
                if ($xEnd > $x2) $xEnd = $x2;
                $this->Line($x, $y, $xEnd, $y);
                $x = $xEnd + $gap;
            }
        }
    }

    // Encabezado compacto
    function drawHeader($pdf, $y0) {
        $pdf->Image('../img/logo_2025.jpg', 12, $y0 + 2, 20);
        $pdf->Image('../img/ciudadinnovadora_2025.jpg', 170, $y0 + 4, 28);

        $pdf->SetFont('Arial','B',6.5);
        $pdf->SetXY(50, $y0 + 2);
        $pdf->Cell(110, 3, utf8_decode("RED DE TRANSPORTE DE PASAJEROS DE LA CIUDAD DE MÉXICO"), 0, 0, "C");

        $pdf->SetFont('Arial','',6.3);
        $pdf->Ln(4); $pdf->SetX(50);
        $pdf->Cell(110, 3, utf8_decode("DIRECCIÓN EJECUTIVA DE ADMINISTRACIÓN Y FINANZAS"), 0, 0, "C");
        $pdf->Ln(4); $pdf->SetX(50);
        $pdf->Cell(110, 3, utf8_decode("GERENCIA DE ADMINISTRACIÓN DE CAPITAL HUMANO"), 0, 0, "C");

        // fecha
        $dias  = array('Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado');
        $meses = array('', 'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre');
        $hoy   = getdate();
        $fecha = $dias[$hoy['wday']] . ' ' . $hoy['mday'] . ' de ' . $meses[$hoy['mon']] . ' de ' . $hoy['year'];

        $pdf->SetFont('Arial','',6.5);
        $pdf->SetXY(120, $y0 + 22);
        $pdf->Cell(85, 4, utf8_decode("Ciudad de México, a " . $fecha), 0, 0, "R");

        return $y0 + 28;
    }

    // Cuerpo reducido (con firma en un solo recuadro)
    function drawAcuse($pdf, $y0, $data, $detalle) {
        // Anchos (total 190)
        $wNum     = 28;  
        $wCred    = 28;
        $wNomLbl  = 24;  
        $wNom     = 110; 
        $wLeftAll = $wNum + $wCred + $wNomLbl; // 80

        $wCant    = 25;
        $wTalla   = 25;
        $wDesc    = 90;
        $wFirma   = 50;

        $rowH = 4.5;

        // Reset colores
        $pdf->SetFillColor(255,255,255);
        $pdf->SetTextColor(0,0,0);
        $pdf->SetDrawColor(0,0,0);

        // Título
        $pdf->SetFont('Arial','B',6.5);
        $pdf->SetXY(12, $y0);
        $pdf->Cell(190, 6, "ACUSE CONFORMIDAD DE TALLAS", 1, 0, "C");
        $pdf->Ln(); $pdf->SetX(12);

        // Num. empleado / Nombre
        $pdf->Cell($wNum, 6, "NUM. EMPLEADO", 1, 0, "C");
        $pdf->SetFont('Arial','',6.5);
        $pdf->Cell($wCred, 6, $data['credencial'], 1, 0, "C");
        $pdf->SetFont('Arial','B',6.5);
        $pdf->Cell($wNomLbl, 6, "NOMBRE", 1, 0, "C");
        $pdf->SetFont('Arial','',6.5);
        $pdf->Cell($wNom, 6, $data['nombre'], 1, 0, "C");
        $pdf->Ln(); $pdf->SetX(12);

        // Clave puesto / Puesto
        $pdf->SetFont('Arial','B',6.5);
        $pdf->Cell($wNum, 8, "CLAVE PUESTO", 1, 0, "C");
        $pdf->SetFont('Arial','',6.5);
        $pdf->Cell($wCred, 8, $data['clave_puesto'], 1, 0, "C");
        $pdf->SetFont('Arial','B',6.5);
        $pdf->Cell($wNomLbl, 8, "PUESTO", 1, 0, "C");
        $pdf->SetFont('Arial','',6.5);
        $pdf->Cell($wNom, 8, $data['puesto'], 1, 0, "C");
        $pdf->Ln(); $pdf->SetX(12);

        // Fecha captura debajo de puesto
        $pdf->SetFont('Arial','B',6.5);
        $pdf->Cell($wLeftAll, 6, "FECHA CAPTURA", 1, 0, "C");
        $pdf->SetFont('Arial','',6.5);
        $pdf->Cell($wNom, 6, $data['fecha_registro'], 1, 0, "C");
        $pdf->Ln(); $pdf->SetX(12);

        // Encabezados de la tabla (firma en dos líneas)
        $pdf->SetFont('Arial','B',6.5);
        $pdf->Cell($wCant, 6, "CANTIDAD", 1, 0, "C");
        $pdf->Cell($wTalla, 6, "TALLA", 1, 0, "C");
        $pdf->Cell($wDesc,  6, "DESCRIPCION", 1, 0, "C");
        $xFirmaCol = $pdf->GetX(); // X inicio de col. firma
        $yHeader   = $pdf->GetY();
        $pdf->MultiCell($wFirma, 6, "NOMBRE Y FIRMA\nDE CONFORMIDAD DE TALLAS", 1, "C");

        // Posición para filas del detalle
        $pdf->SetXY(12, $yHeader + 6);
        $pdf->SetX(12);

        // Guardar Y inicial de filas
        $yInicioFilas = $pdf->GetY();

        // Detalle: SOLO 3 columnas (no pintamos la de firma en cada fila)
        $pdf->SetFont('Arial','',6.3);
        foreach ($detalle as $row) {
            $pdf->Cell($wCant,  $rowH, $row['cantidad'], 1, 0, "C");
            $pdf->Cell($wTalla, $rowH, $row['talla'],     1, 0, "C");
            $pdf->Cell($wDesc,  $rowH, $row['uniforme'],  1, 0, "C");
            $pdf->Ln();
            $pdf->SetX(12);
        }

        // Y final de las filas
        $yFinFilas = $pdf->GetY();
        $altoFirma = $yFinFilas - $yInicioFilas;

        // Dibujar UN SOLO recuadro vacío para la firma (blanco)
        $pdf->SetXY($xFirmaCol, $yInicioFilas);
        $pdf->MultiCell($wFirma, $altoFirma, "", 1, "C");

        // Total
        $pdf->SetFont('Arial','B',6.5);
        $pdf->SetXY(12, $yFinFilas);
        $pdf->Cell($wCant + $wTalla + $wDesc, 6, "TOTAL DE PIEZAS SOLICITADAS", 1, 0, "R");
        $pdf->SetFont('Arial','',6.5);
        $pdf->Cell($wFirma, 6, $data['total_prendas'], 1, 0, "C");
        $pdf->Ln(6);

        // Leyenda centrada
        $leyenda = '"Declaro bajo protesta de decir verdad que la información proporcionada respecto a mis tallas es correcta y corresponde a mis medidas actuales, por lo que manifiesto mi conformidad con el registro realizado."';
        $pdf->SetFont('Arial','',6);
        $pdf->SetX(12);
        $pdf->MultiCell(190, 3.8, utf8_decode($leyenda), 0, 'C');
    }

    // --- Datos ---
    $id = $_GET['id'];
    $sql_trab = "SELECT tu.*, 
                        t.trab_nombre || ' ' || t.trab_apaterno || ' ' || t.trab_amaterno AS nombre,
                        p.puesto_grupo || p.puesto_rama || p.puesto_puesto || p.puesto_nivel || p.puesto_categoria AS puesto_numero,
                        p.puesto_descripcion, cu.nombre_uniforme, cu.num_prenda, dtu.talla, tu.credencial
                 FROM trabajador_uniforme tu 
                 LEFT JOIN trabajador t ON (t.trab_credencial = tu.credencial)
                 LEFT JOIN trab_puesto p ON (t.puesto_clave = p.puesto_clave)
                 LEFT JOIN detalle_trabajador_uniforme dtu ON (tu.id = dtu.id_trabajador_uniforme)
                 LEFT JOIN catalogo_uniformes cu ON (cu.id = dtu.id_catalogo_uniforme)
                 WHERE tu.estatus = 1 AND tu.id = $id;";
    $qry_trab = @pg_query($conexion, $sql_trab);

    $detalle = array();
    $data    = array();
    while ($res = @pg_fetch_array($qry_trab)) {
        $detalle[] = array(
            "cantidad" => $res['num_prenda'],
            "talla"    => $res['talla'],
            "uniforme" => $res['nombre_uniforme']
        );
        $data = array(
            "credencial"     => utf8_decode($res['credencial']),
            "nombre"         => $res['nombre'],
            "clave_puesto"   => $res['puesto_numero'],
            "puesto"         => utf8_decode($res['puesto_descripcion']),
            "fecha_registro" => $res['fecha_registro'],
            "total_prendas"  => $res['total_prendas_adquiridas']
        );
    }

    // --- PDF (dos copias en una hoja Carta) ---
    $pdf = new HPDF('P','mm','Letter');
    $pdf->SetAutoPageBreak(false);
    $pdf->AddPage();

    // Copia 1 (arriba)
    $y1 = drawHeader($pdf, 10);
    drawAcuse($pdf, $y1, $data, $detalle);

    // Línea punteada de corte
    $pdf->dashedHLine(140, 12, 202, 1.2, 1.2);

    // Reset colores antes de la segunda copia (evita “gris”)
    $pdf->SetFillColor(255,255,255);
    $pdf->SetTextColor(0,0,0);
    $pdf->SetDrawColor(0,0,0);

    // Copia 2 (abajo)
    $y2 = drawHeader($pdf, 150);
    drawAcuse($pdf, $y2, $data, $detalle);

    $pdf->Output();
}
