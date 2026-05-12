<?php
require_once '/var/www/login_shared/middleware.php';
$usuario = validarAcceso();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Mantenimiento</title>
    <link rel="shortcut icon" href="./img/Logo_RTP.png" type="image/x-icon">
    <!-- Bootstrap -->
    <link rel="stylesheet" href="./lib/Bootstrap-5-5.3.0/css/bootstrap.min.css">
    <!-- fontawesome -->
    <link rel="stylesheet" type="text/css" href="./lib/fontawesome/css/all.min.css" />
    <!-- Estilo -->
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/style_mantenimiento.css">
    <!-- Chart.js -->
    <script src="./lib/chartjs/chart.umd.min.js"></script>
</head>

<body>

    <?php include 'header.html'; ?>

    <main>
        <div class="container-main">

            <div class="row align-items-center mb-3 g-2 top-row-seg">
                <div class="col-auto">
                    <button id="btnRegresarSeg" class="btn btn-warning btn-lg" onclick="location.href='index.html'">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                </div>

                <h3 class="text-center mb-4">Panel de Mantenimiento</h3>

                <!-- Filtros -->
                <div class="filtros-mantenimiento mb-4">
                    <div class="row g-3 align-items-end">
                        <div class="col-md-3">
                            <label for="fechaMant" class="form-label">Seleccionar fecha</label>
                            <input type="date" id="fechaMant" class="form-control" value="<?php echo date('Y-m-d'); ?>">
                        </div>

                        <div class="col-md-3">
                            <label for="tipoServicioMant" class="form-label">Tipo de servicio</label>
                            <select id="tipoServicioMant" class="form-select">
                                <option value="">Todos</option>
                                <option>Preventivo</option>
                                <option>Correctivo</option>
                                <option>Especial</option>
                            </select>
                        </div>

                        <div class="col-md-3">
                            <label for="moduloMant" class="form-label">Módulo</label>
                            <select id="moduloMant" class="form-select">
                                <option value="">Todos</option>
                                <option>Módulo 1</option>
                                <option>Módulo 2</option>
                                <option>Módulo 3</option>
                                <option>Módulo 4</option>
                                <option>Módulo 5</option>
                                <option>Módulo 6</option>
                                <option>Módulo 7</option>
                            </select>
                        </div>

                        <div class="col-md-3 text-md-end">
                            <button id="btnCargarMant" class="btn btn-success mt-3 mt-md-0">
                                Cargar Datos
                            </button>
                        </div>

                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-3">
                        <div class="card-resumen">
                            <h5>OM Preventivas</h5>
                            <div class="valor" id="cardPrev">420</div>
                            <div class="detalle">Órdenes de mantenimiento preventivo</div>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="card-resumen">
                            <h5>OM Correctivas</h5>
                            <div class="valor" id="cardCorr">185</div>
                            <div class="detalle">Órdenes por fallas</div>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="card-resumen">
                            <h5>OM Especiales</h5>
                            <div class="valor" id="cardEsp">32</div>
                            <div class="detalle">Campañas / adecuaciones</div>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="card-resumen">
                            <h5>Disponibilidad de Flota</h5>
                            <div class="valor" id="cardDisp">84%</div>
                            <div class="detalle">Unidades disponibles</div>
                        </div>
                    </div>
                </div>
                <div class="row mb-4">
                    <h4 class="text-center mb-3">Indicadores Operativos del Parque Vehicular</h4>
                    <div class="col-md-4">
                        <div class="card-resumen indicador-parque">
                            <h5>% Autobuses en Ruta</h5>
                            <div class="valor" id="indEnRuta">0%</div>
                            <div class="detalle">Promedio semanal de unidades en ruta</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card-resumen indicador-parque">
                            <h5>% Autobuses Operables para Ruta</h5>
                            <div class="valor" id="indOperables">0%</div>
                            <div class="detalle">Unidades operables y listas para asignarse</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card-resumen indicador-parque">
                            <h5>OM Correctivas / Preventivas</h5>
                            <div class="valor" id="indMantoRatio">0%</div>
                            <div class="detalle">Proporción de mantenimientos</div>
                        </div>
                    </div>
                </div>
                <div class="row">

                    <div class="col-md-6">
                        <div class="card-graph">
                            <h4>Cumplimiento Preventivo</h4>
                            <canvas id="grafPrevCumplimiento" class="doughnut-chart"></canvas>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card-graph">
                            <h4>Correctivos por Tipo de Falla</h4>
                            <canvas id="grafCorrectivoTipo" class="wide-chart"></canvas>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card-graph">
                            <h4>Tiempos Promedio de Reparación</h4>
                            <canvas id="grafTiempos" class="wide-chart"></canvas>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card-graph">
                            <h4>Disponibilidad</h4>
                            <canvas id="grafDisponibilidad" class="doughnut-chart"></canvas>
                        </div>
                    </div>

                </div>
                <div class="table-container">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="m-0">Órdenes de Mantenimiento</h4>

                        <div class="btn-group">
                            <button id="btnCopiar" class="btn btn-outline-light btn-sm">Copiar</button>
                            <button id="btnCSV" class="btn btn-outline-light btn-sm">CSV</button>
                            <button id="btnPDF" class="btn btn-outline-light btn-sm">PDF</button>
                        </div>
                    </div>


                    <table class="table table-dark table-hover" id="tablaMantenimiento">
                        <thead>
                            <tr>
                                <th>Folio<br><input type="text" placeholder="Buscar"></th>
                                <th>Fecha<br><input type="text" placeholder="Buscar"></th>
                                <th>Económico<br><input type="text" placeholder="Buscar"></th>
                                <th>Tipo Servicio<br><input type="text" placeholder="Buscar"></th>
                                <th>Estatus<br><input type="text" placeholder="Buscar"></th>
                                <th>Módulo<br><input type="text" placeholder="Buscar"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $tipos = ["Preventivo", "Correctivo", "Especial"];
                            $estatus = ["Abierto", "En proceso", "Concluido"];
                            $talleres = ["Módulo 1", "Módulo 2", "Módulo 3", "Módulo 4", "Módulo 5", "Módulo 6", "Módulo 7"];

                            for ($i = 1; $i <= 60; $i++):
                                $folio = 00 + $i;
                                $fecha = "2025-11-" . str_pad(rand(1, 28), 2, "0", STR_PAD_LEFT);
                                $eco = "90" . rand(100, 999);
                                $tipo = $tipos[array_rand($tipos)];
                                $est = $estatus[array_rand($estatus)];
                                $taller = $talleres[array_rand($talleres)];
                                ?>
                                <tr>
                                    <td><?= $folio ?></td>
                                    <td><?= $fecha ?></td>
                                    <td><?= $eco ?></td>
                                    <td><?= $tipo ?></td>
                                    <td><?= $est ?></td>
                                    <td><?= $taller ?></td>
                                </tr>
                            <?php endfor; ?>
                        </tbody>
                    </table>

                    <div id="paginacionMant" class="pagination-container"></div>
                </div>

            </div>
    </main>

    <?php include 'footer.html'; ?>

    <!-- JS de Bootstrap -->
    <script src="./lib/Bootstrap-5-5.3.0/js/bootstrap.bundle.min.js"></script>
    <!-- JS fontawesome -->
    <script src="./lib/fontawesome/js/all.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>
    <script src="script/mantenimiento.js"></script>
</body>

</html>