//** importaciones */
import { cargarCatalogos } from './core/catalogosService.js';
import { MaterialesService } from './core/materialesService.js';

// ** VARIABLES DE CONTROL GLOBAL **
let timeoutBusqueda = null;
let registrosCompletos = []; 
let paginaActual = 1;        
const registrosPorPagina = 5; 

// --- FUNCIONES DE TABLA PRINCIPAL ---

function procesarYMostrarTabla() {
    const inputFiltro = document.getElementById('busqueda-salida');
    const termino = inputFiltro ? inputFiltro.value.toLowerCase() : '';

    const filtrados = registrosCompletos.filter(reg => {
        const folio = (reg.folio_material || '').toLowerCase();
        const desc = (reg.descripcion_material_salida || reg.descripcion_material_entrada || '').toLowerCase();
        return folio.includes(termino) || desc.includes(termino);
    });

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const datosParaVer = filtrados.slice(inicio, fin);

    renderizarTabla(datosParaVer);
    actualizarPaginacion(filtrados);
}

function renderizarTabla(datos) {
    const tbody = document.getElementById('tabla-salidas');
    if (!tbody) return;

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-muted p-3 text-center">No se encontraron registros</td></tr>`;
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
                <td class="text-start">${reg.descripcion_material_salida || reg.descripcion_material_entrada}</td>
                <td>${reg.unidad}</td>
                <td><span class="badge ${claseColor}">${reg.estado}</span></td>
                <td>${reg.cantidad}</td>
                <td class="small">${reg.fecha_registro}</td>
            </tr>`;
    }).join('');
}

function actualizarPaginacion(datosFiltrados) {
    const navPaginacion = document.getElementById('paginacion-salidas');
    if (!navPaginacion) return;

    const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);
    let html = '';

    if (totalPaginas <= 1) {
        navPaginacion.innerHTML = '';
        navPaginacion.closest('nav').classList.add('oculto');
        return;
    }

    navPaginacion.closest('nav').classList.remove('oculto');

    html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-pagina="${paginaActual - 1}">Anterior</a>
             </li>`;

    for (let i = 1; i <= totalPaginas; i++) {
        html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <a class="page-link" href="#" data-pagina="${i}">${i}</a>
                 </li>`;
    }

    html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" data-pagina="${paginaActual + 1}">Siguiente</a>
             </li>`;

    navPaginacion.innerHTML = html;

    navPaginacion.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const nuevaPagina = parseInt(e.target.getAttribute('data-pagina'));
            if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
                paginaActual = nuevaPagina;
                procesarYMostrarTabla();
            }
        });
    });
}

// --- LOGICA DE NEGOCIO ---

async function cargarRegistros() {
    const data = await MaterialesService.consultarSalidas(); 
    if (data.status === 'ok') {
        registrosCompletos = data.datos; 
        paginaActual = 1; 
        procesarYMostrarTabla(); 
        document.getElementById('contenedor-tabla-salidas').classList.remove('oculto');
    }
}

async function cargarMaterial(folio) {
    const resultado = await MaterialesService.buscarPorFolio(folio);
    const inputFolio = document.getElementById('folio_salida');

    if (resultado.status === 'ok' && resultado.datos) {
        inputFolio.classList.remove('is-invalid');
        const material = resultado.datos;
        
        document.getElementById('descripcion_salida').value = material.descripcion_material ?? '';
        document.getElementById('unidad_salida').value = material.id_unidad_material ?? '';
        document.getElementById('estado_salida').value = material.id_estado_material ?? '';
        document.getElementById('categoria_salida').value = material.id_categoria_material ?? '';
        document.getElementById('adscripcion_salida').value = material.adscripcion_modulo ?? '';

        ['descripcion_salida', 'unidad_salida', 'estado_salida', 'categoria_salida', 'adscripcion_salida'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = true;
        });

        document.getElementById('cantidad_salida').focus();
    } else {
        Swal.fire({
            title: 'Atención',
            text: 'El folio no existe en el catálogo.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        }).then(() => {
            // Reset manual para limpiar errores
            inputFolio.value = ''; 
            inputFolio.focus(); 
        });
    }
}

async function guardarSalida(e) {
    e.preventDefault();
    const form = e.target;
    const inputFolio = document.getElementById('folio_salida');
    const camposABloquear = ['descripcion_salida', 'unidad_salida', 'estado_salida', 'categoria_salida', 'adscripcion_salida'];

    camposABloquear.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.disabled = false;
    });

    const data = Object.fromEntries(new FormData(form).entries());
    const res = await MaterialesService.guardarSalida(data);

    if (res.status === 'ok') {
        Swal.fire('Éxito', res.message, 'success');
        //cargarRegistros();

        // --- SOLUCIÓN PARA EVITAR DISPARO AL GUARDAR ---
        form.reset();
        // Disparamos un evento 'input' manual indicando que debe ignorar la búsqueda
        const eventoSilencioso = new CustomEvent('input', { detail: { skipSearch: true } });
        inputFolio.dispatchEvent(eventoSilencioso);

        camposABloquear.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = false;
        });
        
        inputFolio.focus();
    } else {
        camposABloquear.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = true;
        });
        Swal.fire('Error', res.message, 'error');
    }
}

// --- LOGICA DEL MODAL ---

function renderizarResultadosEnModal(materiales, contenedor) {
    if (materiales.length === 0) {
        contenedor.innerHTML = '<div class="text-center p-3 text-muted">No se encontraron materiales</div>';
        return;
    }

    // Encabezado sin "table-dark"
    let html = `<table class="table table-sm table-hover align-middle mt-2">
                    <thead>
                        <tr>
                            <th class="border-bottom-0">Folio</th>
                            <th class="border-bottom-0">Descripción</th>
                            <th class="border-bottom-0 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody>`;

    materiales.forEach(mat => {
        html += `<tr>
                    <td class="fw-bold">${mat.folio_material}</td>
                    <td class="text-start small">${mat.descripcion_material}</td>
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
            const folio = e.currentTarget.getAttribute('data-folio');
            document.getElementById('folio_salida').value = folio;
            cargarMaterial(folio);
            const modalEl = document.getElementById('modalMaterialSalida');
            const instance = bootstrap.Modal.getInstance(modalEl);
            if (instance) instance.hide();
        });
    });
}

function configurarEventos() {
    const folioInput = document.getElementById('folio_salida');
    if (folioInput) {
        folioInput.addEventListener('input', (e) => {
            // SI EL EVENTO ES MARCADO COMO "skipSearch", NO HACE NADA
            if (e.detail && e.detail.skipSearch) return;

            let valor = e.target.value.toUpperCase();
            if (!valor.startsWith('MA-') && valor.length > 0) {
                valor = 'MA-' + valor.replace(/[^0-9]/g, '');
            } else {
                valor = 'MA-' + valor.substring(3).replace(/[^0-9]/g, '');
            }
            e.target.value = valor;

            clearTimeout(timeoutBusqueda);

            // Solo dispara si la longitud es 11 (y no es un evento de salto)
            if (valor.length === 11) {
                timeoutBusqueda = setTimeout(() => cargarMaterial(valor), 400);
            } else if (valor.length <= 3) {
                // Comportamiento igual a Entrada: limpiar campos al borrar folio
                ['descripcion_salida', 'unidad_salida', 'estado_salida', 'categoria_salida', 'adscripcion_salida'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) { el.value = ''; el.disabled = false; }
                });
            }
        });
    }

    const inputModal = document.getElementById('buscar-material-modal-salida');
    const contenedorModal = document.getElementById('contenedor-materiales-modal-salida');
    if (inputModal) {
        inputModal.addEventListener('input', async (e) => {
            const texto = e.target.value.trim();
            const materiales = await MaterialesService.buscarDinamico(texto);
            renderizarResultadosEnModal(materiales, contenedorModal);
        });
    }

    document.getElementById('btn-modal-salida')?.addEventListener('click', async () => {
        const modalEl = document.getElementById('modalMaterialSalida');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        if (inputModal) inputModal.value = '';
        contenedorModal.innerHTML = '<div class="text-center p-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>';
        const iniciales = await MaterialesService.buscarDinamico('');
        renderizarResultadosEnModal(iniciales, contenedorModal);
    });

    document.getElementById('busqueda-salida')?.addEventListener('input', () => {
        paginaActual = 1;
        procesarYMostrarTabla();
    });

    document.getElementById('btn-consultar-salidas')?.addEventListener('click', cargarRegistros);
    document.getElementById('form-salida-material')?.addEventListener('submit', guardarSalida);
    
    document.getElementById('btn-limpiar-salida')?.addEventListener('click', () => {
        const form = document.getElementById('form-salida-material');
        form.reset();
        document.getElementById('contenedor-tabla-salidas').classList.add('oculto');
        form.querySelectorAll('input, select').forEach(el => el.disabled = false);
        document.getElementById('folio_salida')?.focus();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventos();
});