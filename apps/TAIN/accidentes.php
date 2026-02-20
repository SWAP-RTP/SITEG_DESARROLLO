<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Accidentes</title>
    <link rel="shortcut icon" href="./img/Logo_RTP.png" type="image/x-icon">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="./lib/Bootstrap-5-5.3.0/css/bootstrap.min.css">
    <!-- Fontawesome -->
    <link rel="stylesheet" type="text/css" href="./lib/fontawesome/css/all.min.css"/>
    <!-- Mapa de calor -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <!-- Estilos -->
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/style_accidentes.css">
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

            <div class="col text-center">
                <h3 class="mb-0">Accidentes</h3>
            </div>

            <div class="col-auto">
                <div class="btn-group btn-group-sm" role="group" aria-label="Ver sección">
                    <button id="btnVerGraficas" type="button" class="btn btn-outline-info active">
                        <i class="fa-solid fa-chart-column me-1"></i> Gráficas
                    </button>
                    <button id="btnVerTabla" type="button" class="btn btn-outline-info">
                        <i class="fa-solid fa-table me-1"></i> Detalle
                    </button>
                </div>
            </div>
        </div>

        <!-- FILTRO-->
        <div class="filtros-accidentes mb-4">
            <div class="row g-3 align-items-end">
                <div class="col-md-3">
                    <label for="fechaAccidentes" class="form-label">Seleccionar fecha</label>
                    <input type="date" id="fechaAccidentes" class="form-control" value="<?php echo date('Y-m-d'); ?>">
                </div>

                <div class="col-md-3">
                    <label for="tipoEstatusAccidentes" class="form-label">Estatus</label>
                    <select id="tipoEstatusAccidentes" class="form-select">
                        <option value="">Todos</option>
                        <option>En Proceso</option>
                        <option>Concluidos</option>
                        <option>Cancelados</option>
                    </select>
                </div>

                <div class="col-md-3">
                    <label for="moduloAccidentes" class="form-label">Módulo</label>
                    <select id="moduloAccidentes" class="form-select">
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
                    <button id="btnCargarAcc" class="btn btn-success mt-3 mt-md-0">
                        Cargar Datos
                    </button>
                </div>
            </div>
        </div>

<!-- INDICADORES -->
<div class="row mb-4 g-3">

    <div class="col-md-4 col-12">
        <div class="card-indicador ind-variacion">
            <h4>Variación vs Mes Anterior</h4>
            <div class="indicador-valor" id="valorVariacionMes">0%</div>
            <small>Diferencia porcentual de accidentes</small>
        </div>
    </div>

    <div class="col-md-4 col-12">
        <div class="card-indicador ind-modulo">
            <h4>Módulo más crítico</h4>
            <div class="indicador-valor" id="valorModuloCritico">–</div>
            <small>Mayor número de accidentes</small>
        </div>
    </div>


    <div class="col-md-4 col-12">
        <div class="card-indicador ind-ruta">
            <h4>Ruta más riesgosa</h4>
            <div class="indicador-valor" id="valorRutaRiesgosa">–</div>
            <small>Diez rutas más riesgosas (Top 1)</small>
        </div>
    </div>

</div>

<!-- MODULOS -->
<div id="panelRankingModulos" class="panel-ranking-modulos mt-2" hidden>
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h4 class="mb-0">Ranking de módulos por número de accidentes</h4>
        <button id="btnCerrarRanking" class="btn btn-sm btn-outline-light">
            <i class="fa-solid fa-xmark"></i>
        </button>
    </div>

    <small class="text-light-50">
        Del módulo más crítico al de menor incidencia. Datos del periodo filtrado.
    </small>

    <div class="lista-modulos-ranking mt-3">
    </div>
</div>

<div id="panelVariacionMes" class="panel-ranking-variacion" hidden>
    <h5 class="mb-1">Variación por Módulo, Mes actual vs Mes Anterior</h5>
    <p class="text-muted small mb-3">
        Cambio porcentual de accidentes por módulo comparando el mes actual con el mes anterior.
    </p>
    <div id="listaVariacionModulos"></div>
</div>

<div id="panelRutasModulos" class="panel-ranking-rutas" hidden>
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h4 class="mb-0">Rutas más riesgosas por módulo</h4>
        <button id="btnCerrarRutas" class="btn btn-sm btn-outline-light">
            <i class="fa-solid fa-xmark"></i>
        </button>
    </div>

    <p class="text-muted small mb-3">
        Ruta con mayor número de accidentes en cada módulo
        (periodo considerado).
    </p>

    <div id="listaRutasModulos" class="lista-rutas-modulos">
    </div>
</div>
        <section id="seccionGraficas">
            <div class="row g-4">

                <div class="col-xl-6 col-lg-12">
                    <div class="card-graph">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="mb-0">Mapa de Calor CDMX</h4>
                            <span class="badge rounded-pill bg-info-subtle text-info-emphasis small">
                                <i class="fa-solid fa-location-dot me-1"></i> Concentración de accidentes
                            </span>
                        </div>

                        <div id="mapaCalor" class="mapa-calor">
                            <a href="http://10.10.31.207:8086/script/mapa_de_calor/index.html" target="_blank">
                                <img src="script/mapa_de_calor/scripts/mapa.png" 
                                    alt="Mapa de calor CDMX" 
                                    class="img-mapa-calor">
                            </a>
                        </div>
                    </div>
                </div>

                <div class="col-xl-6 col-lg-12">
                    <div class="card-graph text-center">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="mb-0">Accidentes por Tipo</h4>
                            <span class="badge rounded-pill bg-success-subtle text-success-emphasis small">
                                <i class="fa-solid fa-car-burst me-1"></i> Clasificación por categoría
                            </span>
                        </div>
                        <canvas id="grafTipos" class="w-100"></canvas>
                    </div>
                </div>

                <div class="col-xl-6 col-lg-12">
                    <div class="card-graph text-center">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="mb-0">Accidentes en el Tiempo</h4>
                            <span class="badge rounded-pill bg-primary-subtle text-primary-emphasis small">
                                <i class="fa-solid fa-chart-line me-1"></i> Evolución por tipo
                            </span>
                        </div>
                        <canvas id="grafTiempoLineal" class="w-100"></canvas>
                    </div>
                </div>

                <div class="col-xl-6 col-lg-12">
                    <div class="card-graph text-center">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="mb-0">Top 10 Rutas con Mayor Incidencia</h4>
                            <span class="badge rounded-pill bg-warning-subtle text-warning-emphasis small">
                                <i class="fa-solid fa-road me-1"></i> Rutas más riesgosas
                            </span>
                        </div>
                        <canvas id="grafTopRutas" class="w-100"></canvas>
                    </div>
                </div>

            </div>
        </section>

<!-- SECCION TABLA DETALLE -->
<section id="seccionTabla" class="mt-4">
    <div class="table-container">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <h3 class="mb-0">Detalle de Accidentes</h3>

            <div class="btn-group btn-group-sm" role="group" aria-label="Exportar">
                <button id="btnExportCSV" class="btn btn-outline-light">
                    <i class="fa-solid fa-file-csv me-1"></i> CSV
                </button>
                <button id="btnExportExcel" class="btn btn-outline-success">
                    <i class="fa-solid fa-file-excel me-1"></i> Excel
                </button>
            </div>
        </div>
        
        <table class="table table-dark table-hover mb-2 align-middle" id="tablaSeguridad">
            <thead>
                <tr>
                    <th>ID<br><input type="text" placeholder="Buscar..."></th>
                    <th>Tipo<br><input type="text" placeholder="Buscar..."></th>
                    <th>Económico<br><input type="text" placeholder="Buscar..."></th>
                    <th>Ruta<br><input type="text" placeholder="Buscar..."></th>
                    <th>Estatus<br><input type="text" placeholder="Buscar..."></th>
                    <th>Fecha<br><input type="text" placeholder="Buscar..."></th>
                </tr>
            </thead>
            <tbody id="tablaSeguridadBody">
                <!-- DATOS REALES SE INSERTAN POR JS -->
            </tbody>
        </table>

        <div id="paginacionSeg" class="pagination-container"></div>
    </div>
</section>


    </div>
</main>

<?php include 'footer.html'; ?>

<!-- JS de Bootstrap -->
<script src="./lib/Bootstrap-5-5.3.0/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
<!-- JS de Fontawesome -->
<script type="text/javascript" src="./lib/fontawesome/js/all.min.js"></script>
<!-- Chart.js -->
<script src="./lib/chartjs/chart.umd.min.js"></script>
<!-- Leaflet base -->
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<!-- Heatmap plugin -->
<script src="https://unpkg.com/leaflet.heat/dist/leaflet-heat.js"></script>
<!-- JS del dashboard -->
<script src="script/accidentes.js"></script>


</body>
</html>