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
    <!-- ESTILO PERSONALIZADO -->
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/style_sefis.css">
</head>

<body>
<?php include 'header.html'; ?>  

<main>
    <div class="container-main">

        <!-- BARRA SUPERIOR -->
        <div class="row align-items-center mb-3 g-2 top-row-seg">
            <div class="col-auto">
                <button id="btnRegresarSeg" class="btn btn-warning btn-lg" onclick="location.href='index.html'">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
            </div>

            <div class="col text-center">
                <h3 class="mb-0">SEFIS</h3>
            </div>
        </div>

        <!-- FILTROS-->
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
            <div class="row g-4 mb-4">
                <div class="col-md-4">
                    <div class="card card-sefis shadow-sm p-3">
                        <h6 class="text-muted">SEFIs activos</h6>
                        <h2 id="kpiActivos" class="fw-bold">4</h2>
                        <p class="small text-muted mb-0">En operación actualmente</p>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card card-sefis shadow-sm p-3">
                        <h6 class="text-muted">Unidades en Servicio</h6>
                        <h2 id="kpiUnidades" class="fw-bold">22</h2>
                        <p class="small text-muted mb-0">Total de autobuses desplegados</p>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card card-sefis shadow-sm p-3">
                        <h6 class="text-muted">Afluencia Estimada Hoy</h6>
                        <h2 id="kpiAfluencia" class="fw-bold">12,450</h2>
                        <p class="small text-muted mb-0">Pasajeros transportados</p>
                    </div>
                </div>
            </div>

            <div class="card mb-4 shadow-sm p-4">
                <h5 class="mb-3"><i class="fa-solid fa-triangle-exclamation me-2"></i>Estado General del SEFI</h5>

                <div class="row g-4">
                    <div class="col-md-4">
                        <strong>Motivo de activación:</strong>
                        <p class="text-muted">Apoyo por contingencia Metro L3</p>
                    </div>

                    <div class="col-md-4">
                        <strong>Zonas atendidas:</strong>
                        <p class="text-muted">Universidad – Miguel Ángel de Quevedo</p>
                    </div>

                    <div class="col-md-4">
                        <strong>Duración estimada:</strong>
                        <p class="text-muted">4 horas</p>
                    </div>
                </div>
            </div>

            <div class="card shadow-sm mb-4 p-4">
                <h5 class="mb-3"><i class="fa-solid fa-chart-line me-2"></i>Frecuencia Real vs Objetivo</h5>
                <canvas id="graficoFrecuencia" height="110"></canvas>
            </div>

            <div class="card shadow-sm mb-4 p-4">
                <h5 class="mb-3"><i class="fa-solid fa-bus me-2"></i>Ocupación Promedio por Unidad</h5>
                <canvas id="graficoOcupacion" height="110"></canvas>
            </div>

            <div class="card shadow-sm p-4 mb-5">
                <h5 class="mb-3"><i class="fa-solid fa-list-check me-2"></i>Unidades en Servicio</h5>

                <div class="table-responsive">
                    <table class="table table-striped table-sm table-dark align-middle">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Eco</th>
                                <th>Operador</th>
                                <th>Ocupación</th>
                                <th>Último reporte</th>
                                <th>Estatus</th>
                            </tr>
                        </thead>
                        <tbody id="tablaUnidades">
                            <tr>
                                <td>1</td>
                                <td>7784</td>
                                <td>Juan Pérez</td>
                                <td>68%</td>
                                <td>12:35 PM</td>
                                <td><span class="badge bg-success">En ruta</span></td>
                            </tr>

                            <tr>
                                <td>2</td>
                                <td>6621</td>
                                <td>Mario López</td>
                                <td>74%</td>
                                <td>12:33 PM</td>
                                <td><span class="badge bg-success">En ruta</span></td>
                            </tr>

                            <tr>
                                <td>3</td>
                                <td>5502</td>
                                <td>Carlos Ruiz</td>
                                <td>52%</td>
                                <td>12:30 PM</td>
                                <td><span class="badge bg-warning text-dark">Pausa operativa</span></td>
                            </tr>

                            <tr>
                                <td>4</td>
                                <td>8891</td>
                                <td>Sergio Medina</td>
                                <td>89%</td>
                                <td>12:28 PM</td>
                                <td><span class="badge bg-danger">Saturado</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
</main>

<?php include 'footer.html'; ?>

<!-- JS de Bootstrap -->
<script src="./lib/Bootstrap-5-5.3.0/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
<!-- JS de Fontawesome -->
<script type="text/javascript" src="./lib/fontawesome/js/all.min.js"></script>
<!-- Chart.js -->
<script src="./lib/chartjs/chart.umd.min.js"></script>
<!-- JS del dashboard -->
<script src="script/sefis.js"></script>

</body>
</html>