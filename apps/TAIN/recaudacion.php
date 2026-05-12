<?php
require_once '/var/www/login_shared/middleware.php';
$usuario = validarAcceso();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Recaudación</title>
    <link rel="shortcut icon" href="./img/Logo_RTP.png" type="image/x-icon">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="./lib/Bootstrap-5-5.3.0/css/bootstrap.min.css">
    <!-- Fontawesome -->
    <link rel="stylesheet" type="text/css" href="./lib/fontawesome/css/all.min.css" />

    <!-- ESTILO PERSONALIZADO -->
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/style_recaudacion.css">
</head>

<body>
    <?php include 'header.html'; ?>

    <main>
        <div class="container-main">

            <!-- TOP BAR -->
            <div class="row align-items-center mb-3 g-2 top-row">
                <div class="col-auto">
                    <button id="btnRegresar" class="btn btn-warning btn-lg" onclick="location.href='index.html'">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                </div>

                <div class="col text-center">
                    <h3 class="mb-0">Recaudación</h3>
                </div>
            </div>

            <!-- FILTROS -->
            <div class="filtros-card mb-3">
                <div class="row g-3 align-items-end">
                    <div class="col-md-3">
                        <label class="form-label text-light">Seleccionar día</label>
                        <input id="filtroFecha" type="date" class="form-control" value="2025-11-22">
                    </div>

                    <div class="col-md-3">
                        <label class="form-label text-light">Rango horario</label>
                        <select id="filtroHorario" class="form-select">
                            <option value="all">Todo el día</option>
                            <option value="05-09">05:00 - 09:00</option>
                            <option value="09-13">09:00 - 13:00</option>
                            <option value="13-17">13:00 - 17:00</option>
                            <option value="17-21">17:00 - 21:00</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label text-light">Ruta</label>
                        <select id="filtroRuta" class="form-select">
                            <option value="all">Todas las rutas</option>
                            <option value="34-A">34-A</option>
                            <option value="57-A">57-A</option>
                            <option value="162-B">162-B</option>
                        </select>
                    </div>

                    <div class="col-md-2 d-grid">
                        <button id="btnCargar" class="btn btn-success btn-lg btn-cargar">
                            <i class="fa-solid fa-cloud-arrow-up"></i> Cargar Datos
                        </button>
                    </div>
                </div>
            </div>

            <!-- TARJETAS -->
            <div class="row g-3 mb-3">
                <div class="col-md-3">
                    <div class="kpi-card kpi-acento-1">
                        <div class="kpi-title">Total de Pasajeros</div>
                        <div class="kpi-value">59,841</div>
                        <div class="kpi-foot">Suma del periodo</div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="kpi-card kpi-acento-2">
                        <div class="kpi-title">Total Recaudado</div>
                        <div class="kpi-value">$226,574</div>
                        <div class="kpi-foot">MXN</div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="kpi-card kpi-acento-3">
                        <div class="kpi-title">Pasajeros con Gratuidad</div>
                        <div class="kpi-value">428</div>
                        <div class="kpi-foot">DIF / Apoyos</div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="kpi-card kpi-acento-4">
                        <div class="kpi-title">Ruta con Mayor Recaudación</div>
                        <div class="kpi-value">34-A</div>
                        <div class="kpi-foot">Ranking</div>
                    </div>
                </div>
            </div>

            <!-- GRAFICAS -->
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h5 class="mb-0">Distribución por Tipo de Operación</h5>
                            <span class="panel-badge"><i class="fa-solid fa-chart-pie"></i> %</span>
                        </div>
                        <div class="panel-body">
                            <canvas id="grafTipoOperacion"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h5 class="mb-0">Recaudación por Tipo de Tarifa</h5>
                            <span class="panel-badge"><i class="fa-solid fa-chart-column"></i> $ / pax</span>
                        </div>
                        <div class="panel-body">
                            <canvas id="grafTarifa"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h5 class="mb-0">Top 10 Rutas con Mayor Recaudación</h5>
                            <span class="panel-badge"><i class="fa-solid fa-arrow-up-wide-short"></i> top</span>
                        </div>
                        <div class="panel-body">
                            <canvas id="grafTopRutas"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h5 class="mb-0">Top 10 Rutas con Menor Recaudación</h5>
                            <span class="panel-badge"><i class="fa-solid fa-arrow-down-wide-short"></i> bottom</span>
                        </div>
                        <div class="panel-body">
                            <canvas id="grafBottomRutas"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h5 class="mb-0">Top 10 Rutas con Más Pasajeros</h5>
                            <span class="panel-badge"><i class="fa-solid fa-people-group"></i> valid + grat</span>
                        </div>
                        <div class="panel-body">
                            <canvas id="grafTopPasajeros"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h5 class="mb-0">Top 10 Rutas con Menos Pasajeros</h5>
                            <span class="panel-badge"><i class="fa-solid fa-person-circle-minus"></i> valid +
                                grat</span>
                        </div>
                        <div class="panel-body">
                            <canvas id="grafBottomPasajeros"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h5 class="mb-0">Recaudación por Hora</h5>
                            <span class="panel-badge"><i class="fa-solid fa-clock"></i> line + bar</span>
                        </div>
                        <div class="panel-body">
                            <canvas id="grafRecaHora"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h5 class="mb-0">Mapa de Calor</h5>
                            <span class="panel-badge">
                                <i class="fa-solid fa-clock"></i> line + bar
                            </span>
                        </div>

                        <div class="panel-body mapa-calor-container sin-padding">
                            <a href="http://10.10.31.207:8086/script/mapa_de_calor/recaudo.html" target="_blank"
                                class="mapa-calor-link">
                                <img src="script/mapa_de_calor/scripts/mapa.png" alt="Mapa de Calor"
                                    class="mapa-calor-img">
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <?php include 'footer.html'; ?>

    <!-- JS Bootstrap -->
    <script src="./lib/Bootstrap-5-5.3.0/js/bootstrap.bundle.min.js"></script>
    <!-- JS Fontawesome -->
    <script type="text/javascript" src="./lib/fontawesome/js/all.min.js"></script>
    <!-- Chart.js (local o CDN, aquí lo dejo CDN por simple) -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- JS -->
    <script src="script/recaudacion.js"></script>
</body>

</html>