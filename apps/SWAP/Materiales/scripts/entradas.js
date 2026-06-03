import { cargarCatalogos } from './core/catalogosService.js';
import { MaterialesService } from './core/materialesService.js';
import { ModalService } from './core/modalService.js';
//VARIABLES GLOBALES DE CONTROL
let timeoutBusqueda = null, registrosCompletos = [], paginaActual = 1;
let materialesFiltradosModal = [], paginaActualModal = 1;
const registrosPorPagina = 5, registrosPorPaginaModal = 5;
const camposMaterial = ['descripcion', 'unidad', 'estado', 'id_categoria', 'adscripcion'];

// --- FUNCIONES DE TABLA ---
function procesarYMostrarTabla() {
    const termino = document.getElementById('busqueda-entrada')?.value.toLowerCase() || '';
    const filtrados = registrosCompletos.filter(respuesta => 
        (respuesta.folio_material || '').toLowerCase().includes(termino) || 
        (respuesta.descripcion_material_entrada || '').toLowerCase().includes(termino)
    );
    const inicio = (paginaActual - 1) * registrosPorPagina;
    renderizarTabla(filtrados.slice(inicio, inicio + registrosPorPagina));
    actualizarPaginacion(filtrados);
}

function obtenerClaseEstado(estado = '') {
    estado = estado.toUpperCase();
    if (estado.includes('BUENO')) return 'bg-success text-white';
    if (estado.includes('REGULAR')) return 'bg-warning text-dark';
    if (estado.includes('MALO')) return 'bg-danger text-white';
    return 'bg-info text-dark';
}

function renderizarTabla(datos) {
    const tbody = document.getElementById('tabla-registros');
    if (!tbody) return;
    if (!datos.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-muted">No se encontraron registros</td></tr>`;
        return;
    }
    tbody.innerHTML = datos.map(respuesta => `
        <tr>
            <td class="fw-bold">${respuesta.folio_material}</td>
            <td>${respuesta.descripcion_material_entrada}</td>
            <td>${respuesta.unidad}</td>
            <td><span class="badge ${obtenerClaseEstado(respuesta.estado)}">${respuesta.estado}</span></td>
            <td>${respuesta.cantidad}</td>
            <td class="small">${respuesta.fecha_registro}</td>
        </tr>`).join('');
}

function actualizarPaginacion(datosFiltrados) {
    const nav = document.getElementById('contenedor-paginacion');
    const total = Math.ceil(datosFiltrados.length / registrosPorPagina);
    if (!nav || total <= 1) { nav ? nav.innerHTML = '' : null; return; }

    let html = `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-p="${paginaActual - 1}">Anterior</a></li>`;
    for (let i = 1; i <= total; i++) {
        html += `<li class="page-item ${i === paginaActual ? 'active' : ''}"><a class="page-link" href="#" data-p="${i}">${i}</a></li>`;
    }
    html += `<li class="page-item ${paginaActual === total ? 'disabled' : ''}"><a class="page-link" href="#" data-p="${paginaActual + 1}">Siguiente</a></li>`;
    
    nav.innerHTML = html;
    nav.querySelectorAll('.page-link').forEach(link => {
        link.onclick = (evento) => {
            evento.preventDefault();
            const n = parseInt(evento.target.dataset.p);
            if (n > 0 && n <= total) { paginaActual = n; procesarYMostrarTabla(); }
        };
    });
}

// --- LOGICA DE DATOS ---
async function cargarRegistros() {
    const cont = document.getElementById('contenedor-tabla-registros');
    if (!cont) return;
    if (cont.style.display === 'block') {
        cont.style.display = 'none'; cont.classList.add('oculto'); return;
    }
    try {
        const data = await MaterialesService.consultarEntradas();
        if (data.status === 'ok') {
            registrosCompletos = data.datos; paginaActual = 1;
            procesarYMostrarTabla();
            cont.classList.remove('oculto'); cont.style.display = 'block';
        }
    } catch (e) { console.error('Error en cargarRegistros:', e); }
}

async function cargarMaterial(folio) {
    try {
        const res = await MaterialesService.buscarPorFolio(folio);
        const inputFolio = document.getElementById('folio');
        if (res.status === 'ok' && res.datos) {
            inputFolio?.classList.remove('is-invalid');
            const m = res.datos;
            document.getElementById('estado-material') && (document.getElementById('estado-material').innerHTML = '');
            document.getElementById('descripcion').value = m.descripcion_material ?? '';
            document.getElementById('unidad').value = m.id_unidad_material ?? '';
            document.getElementById('estado').value = m.id_estado_material ?? '';
            document.getElementById('id_categoria').value = m.id_categoria_material ?? '';
            document.getElementById('adscripcion').value = m.adscripcion_modulo ?? '';
            camposMaterial.forEach(id => document.getElementById(id)?.setAttribute('disabled', true));
            document.getElementById('cantidad')?.focus();
        } else {
            const n = await MaterialesService.generarFolio();
            if (n.status === 'ok') inputFolio.value = n.folio;
            Swal.fire({icon:'info', title:'Nuevo material', text:'Capture los datos.', timer: 3000, showConfirmButton: false});
            document.getElementById('folio-oculto')?.style.setProperty('display', 'none');
            camposMaterial.forEach(id => { if(document.getElementById(id)) document.getElementById(id).disabled = false; });
        }
    } catch (e) { console.error('Error:', e); }
}

async function guardarEntrada(e) {
    e.preventDefault();
    const form = e.target;
    form.querySelectorAll('input:disabled, select:disabled').forEach(c => { c.disabled = false; c.readOnly = false; });
    const data = Object.fromEntries(new FormData(form));
    if (!data.folio || !data.cantidad) return Swal.fire('Error', 'Campos obligatorios', 'error');

    try {
        const res = await MaterialesService.guardarEntrada(data);
        if (res.status === 'ok') {
            const r = await Swal.fire({title: 'Guardado', text: '¿Desea registrar otro material?', icon: 'success', showCancelButton: true});
            if (r.isConfirmed) {
                form.reset(); document.getElementById('folio')?.focus();
                form.querySelectorAll('input, select').forEach(c => { c.disabled = false; c.readOnly = false; });
            } else { window.location.reload(); }
        }
    } catch (e) { console.error(e); }
}

// --- MODAL ---
export function renderizarResultadosEnModal(materiales, contenedor) {
    if (!contenedor) return;
    materialesFiltradosModal = materiales;
    if (!materiales.length) {
        contenedor.innerHTML = `<div class="alert alert-secondary text-center">No hay coincidencias</div>`; return;
    }
    const inicio = (paginaActualModal - 1) * registrosPorPaginaModal;
    const datos = materiales.slice(inicio, inicio + registrosPorPaginaModal);
    const total = Math.ceil(materiales.length / registrosPorPaginaModal);

    let html = `<table class="table table-sm table-hover mt-2"><thead class="table-dark"><tr><th>Folio</th><th>Descripción</th><th>Acción</th></tr></thead><tbody>` +
    datos.map(m => `<tr><td class="fw-bold">${m.folio_material}</td><td class="small">${m.descripcion_material}</td>
    <td class="text-center"><button class="btn btn-primary btn-sm btn-sel-modal" data-folio="${m.folio_material}">Seleccionar</button></td></tr>`).join('') + `</tbody></table>`;

    if (total > 1) {
        html += `<nav><ul class="pagination pagination-sm justify-content-center" id="paginacion-modal">
        <li class="page-item ${paginaActualModal === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-pm="${paginaActualModal - 1}">Anterior</a></li>` +
        Array.from({length: total}, (_, i) => `<li class="page-item ${i+1 === paginaActualModal ? 'active' : ''}"><a class="page-link" href="#" data-pm="${i+1}">${i+1}</a></li>`).join('') +
        `<li class="page-item ${paginaActualModal === total ? 'disabled' : ''}"><a class="page-link" href="#" data-pm="${paginaActualModal + 1}">Siguiente</a></li></ul></nav>`;
    }
    contenedor.innerHTML = html;

    contenedor.querySelectorAll('.btn-sel-modal').forEach(btn => {
        btn.onclick = () => {
            const f = btn.dataset.folio;
            document.getElementById('folio').value = f;
            cargarMaterial(f);
            bootstrap.Modal.getInstance(document.getElementById('modalMaterialEntrada'))?.hide();
        };
    });
    contenedor.querySelectorAll('[data-pm]').forEach(l => {
        l.onclick = (e) => {
            e.preventDefault();
            paginaActualModal = parseInt(e.target.dataset.pm);
            renderizarResultadosEnModal(materialesFiltradosModal, contenedor);
        };
    });
}
// --- CONFIGURACIÓN DE EVENTOS
function configurarEventos() {
    const elFolio = document.getElementById('folio');
    if (elFolio) {
        elFolio.addEventListener('input', (e) => {
            let v = e.target.value.toUpperCase();
            v = 'MA-' + (v.startsWith('MA-') ? v.substring(3) : v).replace(/[^0-9]/g, '');
            e.target.value = v;
            clearTimeout(timeoutBusqueda);
            if (v.length === 11) timeoutBusqueda = setTimeout(() => cargarMaterial(v), 400);
            else if (v.length <= 3) {
                document.getElementById('form-entrada-material')?.reset(); 
                e.target.value = v;
                camposMaterial.forEach(id => { if(document.getElementById(id)) document.getElementById(id).disabled = false; });
            }
        });
    }

    document.getElementById('adscripcion')?.addEventListener('input', e => {
        e.target.value = e.target.value.toUpperCase();
    });

    document.getElementById('buscar-material-modal-entrada')?.addEventListener('input', async e => {
        const mats = await MaterialesService.buscarDinamico(e.target.value.trim());
        paginaActualModal = 1; 
        renderizarResultadosEnModal(mats, document.getElementById('contenedor-materiales-modal'));
    });

    document.getElementById('modal-material-entrada')?.addEventListener('click', async () => {
        const mats = await MaterialesService.buscarDinamico('');
        paginaActualModal = 1; 
        renderizarResultadosEnModal(mats, document.getElementById('contenedor-materiales-modal'));
        ModalService.abrir({ modalId: 'modalMaterialEntrada' });
    });

    document.getElementById('busqueda-entrada')?.addEventListener('input', () => { 
        paginaActual = 1; 
        procesarYMostrarTabla(); 
    });

    document.getElementById('btn-consultar-entradas')?.addEventListener('click', cargarRegistros);
    document.getElementById('form-entrada-material')?.addEventListener('submit', guardarEntrada);
    
    document.getElementById('btn-limpiar-entrada')?.addEventListener('click', () => {
        const form = document.getElementById('form-entrada-material');
        form?.reset();
        
        const tablaCont = document.getElementById('contenedor-tabla-registros');
        if (tablaCont) tablaCont.style.display = 'none';
        
        const folioOculto = document.getElementById('folio-oculto');
        if (folioOculto) folioOculto.style.display = 'block';

        const estMat = document.getElementById('estado-material');
        if (estMat) estMat.innerHTML = '';

        document.getElementById('folio')?.focus();
        [...camposMaterial, 'cantidad'].forEach(id => { 
            const el = document.getElementById(id); 
            if(el) { el.disabled = false; el.readOnly = false; } 
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => { await cargarCatalogos(); configurarEventos(); });