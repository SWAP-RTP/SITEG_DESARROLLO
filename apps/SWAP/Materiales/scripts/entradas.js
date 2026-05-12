//** importaciones */
import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

// ** VARIABLES DE CONTROL GLOBAL **
let timeoutBusqueda = null;
let registrosCompletos = []; 
let paginaActual = 1;       
const registrosPorPagina = 5; 


// ** FILTRA, PAGINA Y MANDA A PINTAR **
function procesarYMostrarTabla() {
    const inputFiltro = document.getElementById('busqueda-entrada');
    const termino = inputFiltro ? inputFiltro.value.toLowerCase() : '';

    //  FILTRAR: Primero filtramos sobre el array original
    const filtrados = registrosCompletos.filter(reg => {
        const folio = (reg.folio_material || '').toLowerCase();
        const desc = (reg.descripcion_material_entrada || '').toLowerCase();
        return folio.includes(termino) || desc.includes(termino);
    });

    //  SEGMENTAR (Paginación): Cortamos el array filtrado para la vista actual
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const datosParaVer = filtrados.slice(inicio, fin);

    //  RENDERIZAR: Mandamos a pintar la tabla y los botones
    renderizarTabla(datosParaVer);
    actualizarPaginacion(filtrados); // Basamos los botones en el total de filtrados
}

// ** FUNCIÓN PARA PINTAR LAS FILAS EN LA TABLA **
function renderizarTabla(datos) {
    const tbody = document.getElementById('tabla-registros');
    if (!tbody) return;

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-muted">No se encontraron registros</td></tr>`;
        return;
    }

    tbody.innerHTML = datos.map(reg => {
        let claseColor = 'bg-info text-dark';
        const estado = (reg.estado || '').toUpperCase();
        if (estado.includes('BUENO')) claseColor = 'bg-success text-white';
        else if (estado.includes('REGULAR')) claseColor = 'bg-warning text-dark';
        else if (estado.includes('MALO')) claseColor = 'bg-danger text-white';

        return `
            <tr>
                <td class="fw-bold">${reg.folio_material}</td>
                <td>${reg.descripcion_material_entrada}</td>
                <td>${reg.unidad}</td>
                <td><span class="badge ${claseColor}">${reg.estado}</span></td>
                <td>${reg.cantidad}</td>
                <td class="small">${reg.fecha_registro}</td>
            </tr>`;
    }).join('');
}

// ** FUNCIÓN PARA CREAR LOS BOTONES DE PAGINACIÓN **
function actualizarPaginacion(datosFiltrados) {
    const navPaginacion = document.getElementById('contenedor-paginacion');
    if (!navPaginacion) return;

    const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);
    let html = '';

    if (totalPaginas <= 1) {
        navPaginacion.innerHTML = '';
        return;
    }

    // Botón Anterior
    html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-pagina="${paginaActual - 1}">Anterior</a>
             </li>`;

    // Números
    for (let i = 1; i <= totalPaginas; i++) {
        html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <a class="page-link" href="#" data-pagina="${i}">${i}</a>
                 </li>`;
    }

    // Botón Siguiente
    html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" data-pagina="${paginaActual + 1}">Siguiente</a>
             </li>`;

    navPaginacion.innerHTML = html;

    // Eventos a los botones generados
    navPaginacion.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const nuevaPagina = parseInt(e.target.getAttribute('data-pagina'));
            if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
                paginaActual = nuevaPagina;
                procesarYMostrarTabla(); // Volver a procesar para cambiar de página
            }
        });
    });
}

// ** CARGAR REGISTROS DESDE EL SERVIDOR **
async function cargarRegistros() {
    const data = await MaterialesService.consultarEntradas();
    if (data.status === 'ok') {
        registrosCompletos = data.datos; 
        paginaActual = 1; // Resetear a la primera página
        procesarYMostrarTabla(); 
        document.getElementById('contenedor-tabla-registros').classList.remove('oculto');
        document.getElementById('contenedor-tabla-registros').style.display = 'block';
    }
}

//******* AUTOCOMPLETAR FORMULARIO ********************
async function cargarMaterial(folio) {
    const resultado = await MaterialesService.buscarPorFolio(folio);
    const inputFolio = document.getElementById('folio');
    const estadoMaterial = document.getElementById('estado-material');

    if (resultado.status === 'ok' && resultado.datos) {
        inputFolio.classList.remove('is-invalid');
        estadoMaterial.innerHTML = '';

        const material = resultado.datos;
        document.getElementById('descripcion').value = material.descripcion_material ?? '';
        document.getElementById('unidad').value = material.id_unidad_material ?? '';
        document.getElementById('estado').value = material.id_estado_material ?? '';
        document.getElementById('id_categoria').value = material.id_categoria_material ?? '';
        document.getElementById('adscripcion').value = material.adscripcion_modulo ?? '';

        ['descripcion', 'unidad', 'estado', 'id_categoria', 'adscripcion'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = true;
        });

        document.getElementById('cantidad').focus();
    } else {
        const nuevoFolio = await MaterialesService.generarFolio();
        if (nuevoFolio.status === 'ok') {
            inputFolio.value = nuevoFolio.folio;
        }

        Swal.fire({
            icon: 'info',
            title: 'Nuevo material detectado',
            text: 'El folio no existe. Capture los datos del material.',
            timer: 3000,
            showConfirmButton: false
        });

        document.getElementById('folio-oculto').style.display = 'none';
        ['descripcion', 'unidad', 'estado', 'id_categoria', 'adscripcion'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = false;
        });
    }
}

// *** GUARDAR EL REGISTRO ***
async function guardarEntrada(e) {
    e.preventDefault();
    const form = e.target;
    const camposBloqueados = form.querySelectorAll('input:disabled, select:disabled, input[readonly]');
    camposBloqueados.forEach(c => { c.disabled = false; c.readOnly = false; });

    const data = Object.fromEntries(new FormData(form).entries());
    const res = await MaterialesService.guardarEntrada(data);

    if (res.status === 'ok') {
        Swal.fire('Éxito', res.message, 'success');
        // cargarRegistros();
        form.reset();
        document.getElementById('folio-oculto').style.display = 'block';
        form.querySelectorAll('input, select, textarea').forEach(c => {
            c.disabled = false;
            c.classList.remove('bg-light', 'is-invalid');
        });
        document.getElementById('estado-material').innerHTML = '';
        document.getElementById('folio')?.focus();
    } else {
        Swal.fire('Error', res.message, 'error');
    }
}

//** RENDERIZAR RESULTADOS MODAL **
function renderizarResultadosEnModal(materiales, contenedor) {
    if (materiales.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-secondary text-center">No se encontraron coincidencias</div>';
        return;
    }

    let html = `<table class="table table-sm table-hover align-middle mt-2">
                    <thead class="table-dark">
                        <tr><th>Folio</th><th>Descripción</th><th class="text-center">Acción</th></tr>
                    </thead>
                    <tbody>`;

    materiales.forEach(mat => {
        html += `<tr>
                    <td class="fw-bold">${mat.folio_material}</td>
                    <td class="small">${mat.descripcion_material}</td>
                    <td class="text-center">
                        <button class="btn btn-primary btn-sm btn-seleccionar-modal" data-folio="${mat.folio_material}">
                            Seleccionar
                        </button>
                    </td>
                 </tr>`;
    });

    html += `</tbody></table>`;
    contenedor.innerHTML = html;

    contenedor.querySelectorAll('.btn-seleccionar-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const folio = e.target.getAttribute('data-folio');
            document.getElementById('folio').value = folio;
            cargarMaterial(folio);
            const instance = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
            if (instance) instance.hide();
        });
    });
}

// ** CONFIGURACIÓN DE EVENTOS **
function configurarEventos() {
    const folioInput = document.getElementById('folio');
    if (folioInput) {
        folioInput.addEventListener('input', (e) => {
            let valor = e.target.value.toUpperCase();
            
            // Si el valor no empieza con "MA-" y no está vacío, se lo agregamos.
            if (!valor.startsWith('MA-') && valor.length > 0) {
                valor = 'MA-' + valor.replace(/[^0-9]/g, '');
            } else {
                // Si ya empieza con "MA-", solo limpiamos lo que sigue.
                valor = 'MA-' + valor.substring(3).replace(/[^0-9]/g, '');
            }

            e.target.value = valor;

            clearTimeout(timeoutBusqueda);
            if (valor.length === 11) {
                timeoutBusqueda = setTimeout(() => cargarMaterial(valor), 400);
            } else if (valor.length <= 3) { // Si se borra el folio o solo queda "MA-"
                document.getElementById('form-entrada-material').reset();
                e.target.value = valor; // Mantenemos el "MA-" si es lo que queda
                ['descripcion', 'unidad', 'estado', 'id_categoria', 'adscripcion'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) el.disabled = false;
                });
            }
        });
    }

    document.getElementById('adscripcion')?.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

    const inputModalBusqueda = document.getElementById('buscar-material-modal-entrada');
    const contenedorResultados = document.getElementById('contenedor-materiales-modal');

    if (inputModalBusqueda) {
        inputModalBusqueda.addEventListener('input', async (e) => {
            const texto = e.target.value.trim();
            if (texto.length < 2) {
                if (texto.length === 0) {
                    const materiales = await MaterialesService.buscarDinamico(''); // Cargar todos
                    renderizarResultadosEnModal(materiales, contenedorResultados);
                }
                return;
            }
            const materiales = await MaterialesService.buscarDinamico(texto);
            renderizarResultadosEnModal(materiales, contenedorResultados);
        });
    }

    document.getElementById('modal-material-entrada')?.addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'exampleModalCenter',
            contenedorId: 'contenedor-materiales-modal',
            callback: (folio) => {
                document.getElementById('folio').value = folio;
                cargarMaterial(folio);
            }
        });
    });

    // --- LÓGICA DEL FILTRO DE LA TABLA INTEGRADA CON PAGINACIÓN ---
    const inputFiltroTabla = document.getElementById('busqueda-entrada');
    if (inputFiltroTabla) {
        inputFiltroTabla.addEventListener('input', () => {
            paginaActual = 1; // IMPORTANTE: Al buscar, siempre volvemos a la pág 1
            procesarYMostrarTabla();
        });
    }

    document.getElementById('btn-consultar-entradas')?.addEventListener('click', cargarRegistros);
    document.getElementById('form-entrada-material')?.addEventListener('submit', guardarEntrada);
    
    document.getElementById('btn-limpiar-entrada')?.addEventListener('click', () => {
        document.getElementById('form-entrada-material').reset();
        document.getElementById('contenedor-tabla-registros').style.display = 'none';
        document.getElementById('folio-oculto').style.display = 'block';
        document.getElementById('estado-material').innerHTML = '';
        document.getElementById('folio')?.focus();
        
        ['unidad', 'estado', 'id_categoria', 'descripcion', 'adscripcion', 'cantidad'].forEach(id => {
            const el = document.getElementById(id);
            if(el) { el.disabled = false; el.readOnly = false; }
        });
    });
}

// INICIO DE LA APLICACIÓN
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventos();
});