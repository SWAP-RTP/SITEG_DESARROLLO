//** importaciones */
import { cargarCatalogos } from './core/catalogosService.js';
import { MaterialesService } from './core/materialesService.js';

// ** VARIABLES DE CONTROL GLOBAL **
let timeoutBusqueda = null;
let registrosCompletos = [];
let paginaActual = 1;
const registrosPorPagina = 5;

//**VARIABLES DE CONTROL PARA PAGINACION DEL MODAL**
let materialesFiltradosModal = [];
let paginaActualModal = 1;
const registrosPorPaginaModal = 5;

//!!---------------------------------------------------------------------------------
// --- UTILIDADES ---
const IDS_FORMULARIO = [
    'descripcion_salida',
    'unidad_salida',
    'estado_salida',
    'categoria_salida',
    'adscripcion_salida'
];

function obtenerElemento(id) {
    return document.getElementById(id);
}

function habilitarCampos(ids, estado = true) {
    ids.forEach(id => {
        const el = obtenerElemento(id);
        if (el) el.disabled = estado;
    });
}

function limpiarCampos(ids) {
    ids.forEach(id => {
        const el = obtenerElemento(id);
        if (el) {
            el.value = '';
            el.disabled = false;
        }
    });
}

function obtenerClaseEstado(estado = '') {
    estado = estado.toUpperCase();

    if (estado.includes('BUENO')) return 'bg-success text-white';
    if (estado.includes('REGULAR')) return 'bg-warning text-dark';
    if (estado.includes('MALO')) return 'bg-danger text-white';

    return 'bg-info text-dark';
}

function formatearFolio(valor = '') {
    valor = valor.toUpperCase();

    if (!valor.startsWith('MA-') && valor.length > 0) {
        return 'MA-' + valor.replace(/[^0-9]/g, '');
    }

    return 'MA-' + valor.substring(3).replace(/[^0-9]/g, '');
}

function paginarDatos(datos = [], pagina = 1, limite = 5) {
    const inicio = (pagina - 1) * limite;
    return datos.slice(inicio, inicio + limite);
}

//!!---------------------------------------------------------------------------------
// --- FUNCIONES DE TABLA PRINCIPAL ---
function procesarYMostrarTabla() {
    try {
        const inputFiltro = obtenerElemento('busqueda-salida');
        const termino = inputFiltro?.value.toLowerCase() || '';

        const filtrados = registrosCompletos.filter(reg => {
            const folio = (reg.folio_material || '').toLowerCase();

            const descripcion = (
                reg.descripcion_material_salida ||
                reg.descripcion_material_entrada ||
                ''
            ).toLowerCase();

            return (
                folio.includes(termino) ||
                descripcion.includes(termino)
            );
        });

        renderizarTabla(
            paginarDatos(
                filtrados,
                paginaActual,
                registrosPorPagina
            )
        );

        actualizarPaginacion(filtrados);

    } catch (error) {
        console.error("Error en procesarYMostrarTabla:", error);
    }
}

//!!---------------------------------------------------------------------------------
function renderizarTabla(datos) {
    try {
        const tbody = obtenerElemento('tabla-salidas');
        if (!tbody) return;

        if (!datos.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-muted p-3 text-center">
                        No se encontraron registros
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = datos.map(reg => `
            <tr>
                <td class="fw-bold">${reg.folio_material}</td>

                <td class="text-start">
                    ${reg.descripcion_material_salida || reg.descripcion_material_entrada}
                </td>

                <td>${reg.unidad}</td>

                <td>
                    <span class="badge ${obtenerClaseEstado(reg.estado)}">
                        ${reg.estado}
                    </span>
                </td>

                <td>${reg.cantidad}</td>

                <td class="small">${reg.fecha_registro}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Error en renderizarTabla:", error);
    }
}

//!!---------------------------------------------------------------------------------
function actualizarPaginacion(datosFiltrados) {
    try {
        const navPaginacion = obtenerElemento('paginacion-salidas');
        if (!navPaginacion) return;

        const totalPaginas = Math.ceil(
            datosFiltrados.length / registrosPorPagina
        );

        if (totalPaginas <= 1) {
            navPaginacion.innerHTML = '';
            navPaginacion.closest('nav')?.classList.add('oculto');
            return;
        }

        navPaginacion.closest('nav')?.classList.remove('oculto');

        let html = `
            <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-pagina="${paginaActual - 1}">
                    Anterior
                </a>
            </li>
        `;

        for (let i = 1; i <= totalPaginas; i++) {
            html += `
                <li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <a class="page-link" href="#" data-pagina="${i}">
                        ${i}
                    </a>
                </li>
            `;
        }

        html += `
            <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" data-pagina="${paginaActual + 1}">
                    Siguiente
                </a>
            </li>
        `;

        navPaginacion.innerHTML = html;

        navPaginacion.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', cambiarPagina);
        });

    } catch (error) {
        console.error("Error en actualizarPaginacion:", error);
    }
}

function cambiarPagina(e) {
    e.preventDefault();

    const nuevaPagina = parseInt(
        e.target.getAttribute('data-pagina')
    );

    const totalPaginas = Math.ceil(
        registrosCompletos.length / registrosPorPagina
    );

    if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        procesarYMostrarTabla();
    }
}

//!!---------------------------------------------------------------------------------
// --- LOGICA DE NEGOCIO ---
async function cargarRegistros() {
    try {
        const contenedor = obtenerElemento('contenedor-tabla-salidas');
        if (!contenedor) return;

        if (!contenedor.classList.contains('oculto')) {
            contenedor.classList.add('oculto');
            return;
        }

        const data = await MaterialesService.consultarSalidas();

        if (data.status === 'ok') {
            registrosCompletos = data.datos;
            paginaActual = 1;

            procesarYMostrarTabla();

            contenedor.classList.remove('oculto');
        }

    } catch (error) {
        console.error("Error en cargarRegistros:", error);
    }
}

//!!---------------------------------------------------------------------------------
async function cargarMaterial(folio) {
    try {
        const resultado = await MaterialesService.buscarPorFolio(folio);
        const inputFolio = obtenerElemento('folio_salida');

        if (resultado.status === 'ok' && resultado.datos) {

            inputFolio?.classList.remove('is-invalid');

            const material = resultado.datos;

            obtenerElemento('descripcion_salida').value = material.descripcion_material ?? '';
            obtenerElemento('unidad_salida').value = material.id_unidad_material ?? '';
            obtenerElemento('estado_salida').value = material.id_estado_material ?? '';
            obtenerElemento('categoria_salida').value = material.id_categoria_material ?? '';
            obtenerElemento('adscripcion_salida').value = material.adscripcion_modulo ?? '';

            habilitarCampos(IDS_FORMULARIO, true);

            obtenerElemento('cantidad_salida')?.focus();

        } else {

            Swal.fire({
                title: 'Atención',
                text: 'El folio no existe en el catálogo.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            }).then(() => {
                if (inputFolio) {
                    inputFolio.value = '';
                    inputFolio.focus();
                }
            });
        }

    } catch (error) {
        console.error("Error en cargarMaterial:", error);
    }
}

//!!---------------------------------------------------------------------------------
async function guardarSalida(e) {
    try {
        e.preventDefault();

        const form = e.target;
        const inputFolio = obtenerElemento('folio_salida');

        habilitarCampos(IDS_FORMULARIO, false);

        const data = Object.fromEntries(
            new FormData(form).entries()
        );

        const res = await MaterialesService.guardarSalida(data);

        if (res.status === 'ok') {

            Swal.fire('Éxito', res.message, 'success');

            form.reset();

            const eventoSilencioso = new CustomEvent('input', {
                detail: { skipSearch: true }
            });

            inputFolio?.dispatchEvent(eventoSilencioso);

            habilitarCampos(IDS_FORMULARIO, false);

            inputFolio?.focus();

        } else {

            habilitarCampos(IDS_FORMULARIO, true);

            Swal.fire('Error', res.message, 'error');
        }

    } catch (error) {
        console.error("Error en guardarSalida:", error);
    }
}

//!!---------------------------------------------------------------------------------
// --- LOGICA DEL MODAL ---
export function renderizarResultadosEnModal(materiales, contenedor) {
    try {
        if (!contenedor) return;

        materialesFiltradosModal = materiales;

        if (!materialesFiltradosModal.length) {
            contenedor.innerHTML = `
                <div class="text-center p-3 text-muted">
                    No se encontraron materiales
                </div>
            `;
            return;
        }

        const datosParaVer = paginarDatos(
            materialesFiltradosModal,
            paginaActualModal,
            registrosPorPaginaModal
        );

        let html = `
            <table class="table table-sm table-hover align-middle mt-2">
                <thead>
                    <tr>
                        <th class="border-bottom-0">Folio</th>
                        <th class="border-bottom-0">Descripción</th>
                        <th class="border-bottom-0 text-center">Acción</th>
                    </tr>
                </thead>

                <tbody>
        `;

        datosParaVer.forEach(mat => {
            html += `
                <tr>
                    <td class="fw-bold">${mat.folio_material}</td>

                    <td class="text-start small">
                        ${mat.descripcion_material}
                    </td>

                    <td class="text-center">
                        <button
                            class="btn btn-primary btn-sm btn-seleccionar-modal"
                            data-folio="${mat.folio_material}"
                        >
                            Seleccionar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;

        const totalPaginas = Math.ceil(
            materialesFiltradosModal.length / registrosPorPaginaModal
        );

        if (totalPaginas > 1) {

            html += `
                <nav aria-label="Paginación modal" class="mt-3">
                    <ul class="pagination pagination-sm justify-content-center" id="paginacion-modal">

                        <li class="page-item ${paginaActualModal === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-pagina-modal="${paginaActualModal - 1}">
                                Anterior
                            </a>
                        </li>
            `;

            for (let i = 1; i <= totalPaginas; i++) {
                html += `
                    <li class="page-item ${i === paginaActualModal ? 'active' : ''}">
                        <a class="page-link" href="#" data-pagina-modal="${i}">
                            ${i}
                        </a>
                    </li>
                `;
            }

            html += `
                        <li class="page-item ${paginaActualModal === totalPaginas ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-pagina-modal="${paginaActualModal + 1}">
                                Siguiente
                            </a>
                        </li>

                    </ul>
                </nav>
            `;
        }

        contenedor.innerHTML = html;

        configurarEventosModal(contenedor, totalPaginas);

    } catch (error) {
        console.error("Error en renderizarResultadosEnModal:", error);
    }
}

function configurarEventosModal(contenedor, totalPaginas) {

    contenedor.querySelectorAll('.btn-seleccionar-modal').forEach(btn => {

        btn.addEventListener('click', (e) => {

            const folio = e.currentTarget.getAttribute('data-folio');

            obtenerElemento('folio_salida').value = folio;

            cargarMaterial(folio);

            const modalEl = obtenerElemento('modalMaterialSalida');

            const instance = bootstrap.Modal.getInstance(modalEl);

            if (instance) instance.hide();
        });
    });

    const navPaginacion = contenedor.querySelector('#paginacion-modal');

    if (!navPaginacion) return;

    navPaginacion.querySelectorAll('.page-link').forEach(link => {

        link.addEventListener('click', (e) => {

            e.preventDefault();

            const nuevaPagina = parseInt(
                e.target.getAttribute('data-pagina-modal')
            );

            if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {

                paginaActualModal = nuevaPagina;

                renderizarResultadosEnModal(
                    materialesFiltradosModal,
                    contenedor
                );
            }
        });
    });
}

//!!---------------------------------------------------------------------------------
// --- CONFIGURACION DE EVENTOS ---
function configurarEventos() {

    configurarEventoFolio();
    configurarBusquedaModal();
    configurarModal();
    configurarFiltroTabla();

    obtenerElemento('btn-consultar-salidas')
        ?.addEventListener('click', cargarRegistros);

    obtenerElemento('form-salida-material')
        ?.addEventListener('submit', guardarSalida);

    obtenerElemento('btn-limpiar-salida')
        ?.addEventListener('click', limpiarFormulario);
}

//!!---------------------------------------------------------------------------------
function configurarEventoFolio() {

    const folioInput = obtenerElemento('folio_salida');

    if (!folioInput) return;

    folioInput.addEventListener('input', (e) => {

        try {

            if (e.detail?.skipSearch) return;

            const valor = formatearFolio(e.target.value);

            e.target.value = valor;

            clearTimeout(timeoutBusqueda);

            if (valor.length === 11) {

                timeoutBusqueda = setTimeout(() => {
                    cargarMaterial(valor);
                }, 400);

            } else if (valor.length <= 3) {

                limpiarCampos(IDS_FORMULARIO);
            }

        } catch (error) {
            console.error(
                "Error en evento input de folio_salida:",
                error
            );
        }
    });
}

//!!---------------------------------------------------------------------------------
function configurarBusquedaModal() {

    const inputModal = obtenerElemento('buscar-material-modal-salida');
    const contenedorModal = obtenerElemento('contenedor-materiales-modal-salida');

    if (!inputModal) return;

    inputModal.addEventListener('input', async (e) => {

        try {

            const texto = e.target.value.trim();

            const materiales = await MaterialesService.buscarDinamico(texto);

            renderizarResultadosEnModal(
                materiales,
                contenedorModal
            );

        } catch (error) {

            console.error(
                "Error en entrada del buscador del modal:",
                error
            );
        }
    });
}

//!!---------------------------------------------------------------------------------
function configurarModal() {

    obtenerElemento('btn-modal-salida')
        ?.addEventListener('click', async () => {

            try {

                const modalEl = obtenerElemento('modalMaterialSalida');

                if (!modalEl) return;

                const modal = new bootstrap.Modal(modalEl);

                modal.show();

                const inputModal = obtenerElemento('buscar-material-modal-salida');
                const contenedorModal = obtenerElemento('contenedor-materiales-modal-salida');

                if (inputModal) {
                    inputModal.value = '';
                }

                if (contenedorModal) {
                    contenedorModal.innerHTML = `
                        <div class="text-center p-4">
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                        </div>
                    `;
                }

                const iniciales = await MaterialesService.buscarDinamico('');

                renderizarResultadosEnModal(
                    iniciales,
                    contenedorModal
                );

            } catch (error) {

                console.error(
                    "Error al desplegar el modal de salidas:",
                    error
                );
            }
        });
}

//!!---------------------------------------------------------------------------------
function configurarFiltroTabla() {

    obtenerElemento('busqueda-salida')
        ?.addEventListener('input', () => {

            try {

                paginaActual = 1;

                procesarYMostrarTabla();

            } catch (error) {

                console.error(
                    "Error en el filtro de búsqueda:",
                    error
                );
            }
        });
}

//!!---------------------------------------------------------------------------------
function limpiarFormulario() {

    try {

        const form = obtenerElemento('form-salida-material');

        if (form) {

            form.reset();

            form.querySelectorAll('input, select')
                .forEach(el => el.disabled = false);
        }

        obtenerElemento('contenedor-tabla-salidas')
            ?.classList.add('oculto');

        obtenerElemento('folio_salida')
            ?.focus();

    } catch (error) {

        console.error(
            "Error al limpiar el formulario:",
            error
        );
    }
}

//!!---------------------------------------------------------------------------------
//INICIO DE LA APLICACIÓN
document.addEventListener('DOMContentLoaded', async () => {

    await cargarCatalogos();

    configurarEventos();
});