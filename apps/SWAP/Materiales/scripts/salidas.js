/** * LÓGICA DE SALIDAS - Optimización del sistema de inventario.
 * Nota: Se mantiene la paginación doble (tabla y modal) y el bloqueo de edición.
 */
import { cargarCatalogos } from './core/catalogosService.js';
import { MaterialesService } from './core/materialesService.js';

// --- CONTROL DE ESTADO ---
let timeoutBusqueda = null, registrosCompletos = [], paginaActual = 1;
let materialesFiltradosModal = [], paginaActualModal = 1;
const registrosPorPagina = 5, registrosPorPaginaModal = 5;
const IDS_FORM = ['descripcion_salida','unidad_salida','estado_salida','categoria_salida','adscripcion_salida'];

// --- UTILIDADES RÁPIDAS ---
const obtenerEl = (id) => document.getElementById(id);

// Función "todo en uno" para habilitar, bloquear o limpiar los inputs del material
const gestionarCampos = (ids, bloquear = true, limpiar = false) => {
    ids.forEach(id => {
        const el = obtenerEl(id);
        if (el) {
            if (limpiar) el.value = '';
            el.disabled = bloquear;
        }
    });
};

// Colores de Bootstrap según estado (usamos ternarios para ahorrar espacio)
const obtenerClaseEstado = (e = '') => {
    const s = e.toUpperCase();
    return s.includes('BUENO') ? 'bg-success text-white' : s.includes('REGULAR') ? 'bg-warning text-dark' : s.includes('MALO') ? 'bg-danger text-white' : 'bg-info text-dark';
};

// Validamos que el folio siempre lleve el prefijo MA- y solo números
const formatearFolio = (v = '') => {
    v = v.toUpperCase();
    return 'MA-' + (v.startsWith('MA-') ? v.substring(3) : v).replace(/[^0-9]/g, '');
};

// --- GESTIÓN DE TABLA PRINCIPAL ---
function procesarYMostrarTabla() {
    const termino = obtenerEl('busqueda-salida')?.value.toLowerCase() || '';
    
    // Filtramos sobre el backup en memoria para no pedirle todo al server de nuevo
    const filtrados = registrosCompletos.filter(r => 
        (r.folio_material || '').toLowerCase().includes(termino) || 
        (r.descripcion_material_salida || r.descripcion_material_entrada || '').toLowerCase().includes(termino)
    );
    
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const datos = filtrados.slice(inicio, inicio + registrosPorPagina);
    const tbody = obtenerEl('tabla-salidas');
    
    if (!tbody) return;
    tbody.innerHTML = datos.length ? datos.map(r => `
        <tr>
            <td class="fw-bold">${r.folio_material}</td>
            <td>${r.descripcion_material_salida || r.descripcion_material_entrada}</td>
            <td>${r.unidad}</td>
            <td><span class="badge ${obtenerClaseEstado(r.estado)}">${r.estado}</span></td>
            <td>${r.cantidad}</td>
            <td class="small">${r.fecha_registro}</td>
        </tr>`).join('') : '<tr><td colspan="6" class="text-center text-muted p-3">No hay registros de salida</td></tr>';
    
    actualizarPaginacion(filtrados);
}

// Generador dinámico de botones de página
function actualizarPaginacion(datos) {
    const nav = obtenerEl('paginacion-salidas');
    const total = Math.ceil(datos.length / registrosPorPagina);
    if (!nav) return;

    if (total <= 1) { nav.innerHTML = ''; nav.closest('nav')?.classList.add('oculto'); return; }
    nav.closest('nav')?.classList.remove('oculto');

    let html = `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-p="${paginaActual - 1}">Anterior</a></li>`;
    for (let i = 1; i <= total; i++) html += `<li class="page-item ${i === paginaActual ? 'active' : ''}"><a class="page-link" href="#" data-p="${i}">${i}</a></li>`;
    html += `<li class="page-item ${paginaActual === total ? 'disabled' : ''}"><a class="page-link" href="#" data-p="${paginaActual + 1}">Siguiente</a></li>`;

    nav.innerHTML = html;
    nav.querySelectorAll('.page-link').forEach(l => l.onclick = (e) => {
        e.preventDefault();
        const n = parseInt(e.target.dataset.p);
        if (n > 0 && n <= total) { paginaActual = n; procesarYMostrarTabla(); }
    });
}

// --- LÓGICA DE DATOS ---

// Buscamos material por folio. Si existe, llenamos y bloqueamos para no "romper" el catálogo
async function cargarMaterial(folio) {
    const res = await MaterialesService.buscarPorFolio(folio);
    const inputFolio = obtenerEl('folio_salida');
    if (res.status === 'ok' && res.datos) {
        inputFolio?.classList.remove('is-invalid');
        const m = res.datos;
        obtenerEl('descripcion_salida').value = m.descripcion_material ?? '';
        obtenerEl('unidad_salida').value = m.id_unidad_material ?? '';
        obtenerEl('estado_salida').value = m.id_estado_material ?? '';
        obtenerEl('categoria_salida').value = m.id_categoria_material ?? '';
        obtenerEl('adscripcion_salida').value = m.adscripcion_modulo ?? '';
        gestionarCampos(IDS_FORM, true); // Ojo: Bloqueamos descripción y otros para que solo capturen cantidad
        obtenerEl('cantidad_salida')?.focus();
    } else {
        Swal.fire('Atención', 'Este folio no está registrado en el sistema.', 'warning');
        if (inputFolio) { inputFolio.value = ''; inputFolio.focus(); }
    }
}

// Procesar guardado. Habilitamos todo antes de mandar el FormData para que no se pierdan datos
async function guardarSalida(e) {
    e.preventDefault();
    const form = e.target;
    form.querySelectorAll('input, select').forEach(c => { c.disabled = false; c.readOnly = false; });
    
    const data = Object.fromEntries(new FormData(form));
    if (!data.folio_salida || !data.cantidad_salida) return Swal.fire('Error', 'Debes completar folio y cantidad', 'error');

    const res = await MaterialesService.guardarSalida(data);
    if (res.status === 'ok') {
        const r = await Swal.fire({title: 'Éxito', text: 'Salida registrada. ¿Hacer otra?', icon: 'success', showCancelButton: true});
        r.isConfirmed ? (form.reset(), gestionarCampos(IDS_FORM, false, true), obtenerEl('folio_salida')?.focus()) : window.location.reload();
    } else {
        Swal.fire('Error', res.message, 'error');
    }
}

// --- MODAL DE BÚSQUEDA ---

export function renderizarResultadosEnModal(materiales, contenedor) {
    if (!contenedor) return;
    materialesFiltradosModal = materiales;
    const inicio = (paginaActualModal - 1) * registrosPorPaginaModal;
    const datos = materiales.slice(inicio, inicio + registrosPorPaginaModal);
    const total = Math.ceil(materiales.length / registrosPorPaginaModal);

    // Renderizamos tabla del modal
    let html = `<table class="table table-sm table-hover mt-2"><thead><tr><th>Folio</th><th>Descripción</th><th>Acción</th></tr></thead><tbody>` +
        (datos.length ? datos.map(m => `<tr><td class="fw-bold">${m.folio_material}</td><td class="small">${m.descripcion_material}</td><td><button class="btn btn-primary btn-sm btn-sel" data-f="${m.folio_material}">Seleccionar</button></td></tr>`).join('') : '<tr><td colspan="3" class="text-center">Sin resultados</td></tr>') + `</tbody></table>`;

    // Paginación modal simplificada
    if (total > 1) {
        html += `<nav class="mt-2"><ul class="pagination pagination-sm justify-content-center">` +
            Array.from({length: total}, (_, i) => `<li class="page-item ${i+1 === paginaActualModal ? 'active' : ''}"><a class="page-link" href="#" data-pm="${i+1}">${i+1}</a></li>`).join('') + `</ul></nav>`;
    }
    contenedor.innerHTML = html;

    // Al seleccionar, mandamos el folio al form principal y disparamos la carga
    contenedor.querySelectorAll('.btn-sel').forEach(b => b.onclick = () => {
        obtenerEl('folio_salida').value = b.dataset.f;
        cargarMaterial(b.dataset.f);
        bootstrap.Modal.getInstance(obtenerEl('modalMaterialSalida'))?.hide();
    });
    
    // Cambio de página en el modal
    contenedor.querySelectorAll('[data-pm]').forEach(l => l.onclick = (e) => {
        e.preventDefault(); paginaActualModal = parseInt(e.target.dataset.pm); renderizarResultadosEnModal(materialesFiltradosModal, contenedor);
    });
}

// --- CONFIGURACIÓN DE EVENTOS ---
function configurarEventos() {
    // Formateo y búsqueda automática al llegar a 11 caracteres
    obtenerEl('folio_salida')?.addEventListener('input', (e) => {
        const v = formatearFolio(e.target.value);
        e.target.value = v;
        clearTimeout(timeoutBusqueda);
        if (v.length === 11) timeoutBusqueda = setTimeout(() => cargarMaterial(v), 400);
        else if (v.length <= 3) gestionarCampos(IDS_FORM, false, true);
    });

    // Control del modal de búsqueda
    obtenerEl('btn-modal-salida')?.addEventListener('click', async () => {
        const m = await MaterialesService.buscarDinamico('');
        paginaActualModal = 1;
        renderizarResultadosEnModal(m, obtenerEl('contenedor-materiales-modal-salida'));
        new bootstrap.Modal(obtenerEl('modalMaterialSalida')).show();
    });

    obtenerEl('buscar-material-modal-salida')?.addEventListener('input', async (e) => {
        const m = await MaterialesService.buscarDinamico(e.target.value.trim());
        renderizarResultadosEnModal(m, obtenerEl('contenedor-materiales-modal-salida'));
    });

    // Consultar historial de salidas (Efecto Toggle)
    obtenerEl('btn-consultar-salidas')?.addEventListener('click', async () => {
        const c = obtenerEl('contenedor-tabla-salidas');
        if (c && !c.classList.contains('oculto')) return c.classList.add('oculto');
        
        const res = await MaterialesService.consultarSalidas();
        if (res.status === 'ok') { 
            registrosCompletos = res.datos; 
            paginaActual = 1; 
            procesarYMostrarTabla(); 
            c?.classList.remove('oculto'); 
        }
    });

    obtenerEl('form-salida-material')?.addEventListener('submit', guardarSalida);
    
    // Reset manual del formulario
    obtenerEl('btn-limpiar-salida')?.addEventListener('click', () => {
        obtenerEl('form-salida-material')?.reset();
        gestionarCampos(IDS_FORM, false, true);
        obtenerEl('contenedor-tabla-salidas')?.classList.add('oculto');
        obtenerEl('folio_salida')?.focus();
    });
}

// Iniciamos todo al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => { await cargarCatalogos(); configurarEventos(); });