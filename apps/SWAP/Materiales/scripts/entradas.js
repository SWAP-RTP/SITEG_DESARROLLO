//** importaciones **
import { cargarCatalogos } from './core/catalogosService.js';
import { MaterialesService } from './core/materialesService.js';
import { ModalService } from './core/modalService.js';

//!!---------------------------------------------------------------------------------
// ** VARIABLES GLOBALES **
let timeoutBusqueda = null;
let registrosCompletos = [];
let paginaActual = 1;
const registrosPorPagina = 5;

let materialesFiltradosModal = [];
let paginaActualModal = 1;
const registrosPorPaginaModal = 5;

//!!---------------------------------------------------------------------------------
// ** HELPERS GENERALES **
const $ = (id) => document.getElementById(id);

const obtenerTextoBusqueda = () =>
    $('busqueda-entrada')?.value.toLowerCase() || '';

const obtenerInicioPaginacion = (pagina, limite) =>
    (pagina - 1) * limite;

const cambiarEstadoCampos = (disabled = false) => {
    [
        'descripcion',
        'unidad',
        'estado',
        'id_categoria',
        'adscripcion'
    ].forEach(id => {
        const campo = $(id);
        if (campo) campo.disabled = disabled;
    });
};

const limpiarFormulario = () => {
    const form = $('form-entrada-material');

    if (form) form.reset();

    $('contenedor-tabla-registros')?.style.setProperty('display', 'none');
    $('folio-oculto')?.style.setProperty('display', 'block');

    const estado = $('estado-material');
    if (estado) estado.innerHTML = '';

    cambiarEstadoCampos(false);

    [
        'unidad',
        'estado',
        'id_categoria',
        'descripcion',
        'adscripcion',
        'cantidad'
    ].forEach(id => {
        const campo = $(id);

        if (campo) {
            campo.disabled = false;
            campo.readOnly = false;
        }
    });

    $('folio')?.focus();
};

//!!---------------------------------------------------------------------------------
// ** TABLA PRINCIPAL **
function filtrarRegistros(termino) {
    return registrosCompletos.filter(registro =>
        (registro.folio_material || '')
            .toLowerCase()
            .includes(termino) ||

        (registro.descripcion_material_entrada || '')
            .toLowerCase()
            .includes(termino)
    );
}

function obtenerDatosPaginados(datos, pagina, limite) {
    const inicio = obtenerInicioPaginacion(pagina, limite);
    return datos.slice(inicio, inicio + limite);
}

function procesarYMostrarTabla() {
    try {
        const filtrados = filtrarRegistros(obtenerTextoBusqueda());

        renderizarTabla(
            obtenerDatosPaginados(
                filtrados,
                paginaActual,
                registrosPorPagina
            )
        );

        actualizarPaginacion(filtrados);

    } catch (error) {
        console.error('Error en procesarYMostrarTabla:', error);
    }
}

//!!---------------------------------------------------------------------------------
// ** RENDER TABLA **
function obtenerClaseEstado(estado = '') {
    estado = estado.toUpperCase();

    if (estado.includes('BUENO')) return 'bg-success text-white';
    if (estado.includes('REGULAR')) return 'bg-warning text-dark';
    if (estado.includes('MALO')) return 'bg-danger text-white';

    return 'bg-info text-dark';
}

function crearFilaTabla(registro) {
    return `
        <tr>
            <td class="fw-bold">${registro.folio_material}</td>
            <td>${registro.descripcion_material_entrada}</td>
            <td>${registro.unidad}</td>
            <td>
                <span class="badge ${obtenerClaseEstado(registro.estado)}">
                    ${registro.estado}
                </span>
            </td>
            <td>${registro.cantidad}</td>
            <td class="small">${registro.fecha_registro}</td>
        </tr>
    `;
}

function renderizarTabla(datos) {
    try {
        const tbody = $('tabla-registros');

        if (!tbody) return;

        if (!datos.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-muted">
                        No se encontraron registros
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = datos.map(crearFilaTabla).join('');

    } catch (error) {
        console.error('Error en renderizarTabla:', error);
    }
}

//!!---------------------------------------------------------------------------------
// ** PAGINACIÓN **
function crearBotonPaginacion(texto, pagina, activo = false, disabled = false) {
    return `
        <li class="page-item ${activo ? 'active' : ''} ${disabled ? 'disabled' : ''}">
            <a class="page-link" href="#" data-pagina="${pagina}">
                ${texto}
            </a>
        </li>
    `;
}

function generarNumerosPagina(totalPaginas) {
    let html = '';

    for (let i = 1; i <= totalPaginas; i++) {
        html += crearBotonPaginacion(
            i,
            i,
            i === paginaActual
        );
    }

    return html;
}

function agregarEventosPaginacion(nav, totalPaginas) {
    nav.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const nuevaPagina = parseInt(
                e.target.dataset.pagina
            );

            if (
                nuevaPagina > 0 &&
                nuevaPagina <= totalPaginas
            ) {
                paginaActual = nuevaPagina;
                procesarYMostrarTabla();
            }
        });
    });
}

function actualizarPaginacion(datosFiltrados) {
    try {
        const nav = $('contenedor-paginacion');

        if (!nav) return;

        const totalPaginas = Math.ceil(
            datosFiltrados.length / registrosPorPagina
        );

        if (totalPaginas <= 1) {
            nav.innerHTML = '';
            return;
        }

        nav.innerHTML = `
            ${crearBotonPaginacion(
                'Anterior',
                paginaActual - 1,
                false,
                paginaActual === 1
            )}

            ${generarNumerosPagina(totalPaginas)}

            ${crearBotonPaginacion(
                'Siguiente',
                paginaActual + 1,
                false,
                paginaActual === totalPaginas
            )}
        `;

        agregarEventosPaginacion(nav, totalPaginas);

    } catch (error) {
        console.error('Error en actualizarPaginacion:', error);
    }
}

//!!---------------------------------------------------------------------------------
// ** CONSULTAR REGISTROS **
async function cargarRegistros() {
    try {
        const contenedor = $('contenedor-tabla-registros');

        if (!contenedor) return;

        if (contenedor.style.display === 'block') {
            contenedor.style.display = 'none';
            contenedor.classList.add('oculto');
            return;
        }

        const data = await MaterialesService.consultarEntradas();

        if (data.status !== 'ok') return;

        registrosCompletos = data.datos;
        paginaActual = 1;

        procesarYMostrarTabla();

        contenedor.classList.remove('oculto');
        contenedor.style.display = 'block';

    } catch (error) {
        console.error('Error en cargarRegistros:', error);
    }
}

//!!---------------------------------------------------------------------------------
// ** AUTOCOMPLETAR MATERIAL **
function llenarFormularioMaterial(material) {
    $('descripcion').value = material.descripcion_material ?? '';
    $('unidad').value = material.id_unidad_material ?? '';
    $('estado').value = material.id_estado_material ?? '';
    $('id_categoria').value = material.id_categoria_material ?? '';
    $('adscripcion').value = material.adscripcion_modulo ?? '';

    cambiarEstadoCampos(true);

    $('cantidad')?.focus();
}

async function configurarNuevoMaterial(inputFolio) {
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

    $('folio-oculto').style.display = 'none';

    cambiarEstadoCampos(false);
}

async function cargarMaterial(folio) {
    try {
        const resultado = await MaterialesService.buscarPorFolio(folio);

        const inputFolio = $('folio');
        const estadoMaterial = $('estado-material');

        if (resultado.status === 'ok' && resultado.datos) {
            inputFolio.classList.remove('is-invalid');

            if (estadoMaterial) {
                estadoMaterial.innerHTML = '';
            }

            llenarFormularioMaterial(resultado.datos);

            return;
        }

        await configurarNuevoMaterial(inputFolio);

    } catch (error) {
        console.error('Error en cargarMaterial:', error);
    }
}

//!!---------------------------------------------------------------------------------
// ** GUARDAR ENTRADA **
function desbloquearCamposFormulario(form) {
    form.querySelectorAll(
        'input:disabled, select:disabled, input[readonly]'
    ).forEach(campo => {
        campo.disabled = false;
        campo.readOnly = false;
    });
}

function restaurarFormulario(form) {
    form.reset();

    $('folio-oculto').style.display = 'block';

    form.querySelectorAll('input, select, textarea')
        .forEach(campo => {
            campo.disabled = false;
            campo.classList.remove('bg-light', 'is-invalid');
        });

    $('estado-material').innerHTML = '';

    $('folio')?.focus();
}

async function guardarEntrada(e) {
    try {
        e.preventDefault();

        const form = e.target;

        desbloquearCamposFormulario(form);

        const data = Object.fromEntries(
            new FormData(form).entries()
        );

        const res = await MaterialesService.guardarEntrada(data);

        if (res.status !== 'ok') {
            Swal.fire('Error', res.message, 'error');
            return;
        }

        Swal.fire('Éxito', res.message, 'success');

        restaurarFormulario(form);

    } catch (error) {
        console.error('Error en guardarEntrada:', error);
    }
}

//!!---------------------------------------------------------------------------------
// ** EVENTOS **
function formatearFolio(valor) {
    valor = valor.toUpperCase();

    if (!valor.startsWith('MA-') && valor.length > 0) {
        return 'MA-' + valor.replace(/[^0-9]/g, '');
    }

    return 'MA-' + valor.substring(3).replace(/[^0-9]/g, '');
}

function manejarInputFolio(e) {
    try {
        let valor = formatearFolio(e.target.value);

        e.target.value = valor;

        clearTimeout(timeoutBusqueda);

        if (valor.length === 11) {
            timeoutBusqueda = setTimeout(
                () => cargarMaterial(valor),
                400
            );

            return;
        }

        if (valor.length <= 3) {
            $('form-entrada-material').reset();

            e.target.value = valor;

            cambiarEstadoCampos(false);
        }

    } catch (error) {
        console.error('Error en input folio:', error);
    }
}

function configurarEventos() {
    try {
        $('folio')?.addEventListener('input', manejarInputFolio);

        $('adscripcion')?.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });

        $('busqueda-entrada')?.addEventListener('input', () => {
            paginaActual = 1;
            procesarYMostrarTabla();
        });

        $('btn-consultar-entradas')
            ?.addEventListener('click', cargarRegistros);

        $('form-entrada-material')
            ?.addEventListener('submit', guardarEntrada);

        $('btn-limpiar-entrada')
            ?.addEventListener('click', limpiarFormulario);

        $('modal-material-entrada')
            ?.addEventListener('click', () => {
                ModalService.abrir({
                    modalId: 'modalMaterialEntrada',
                    contenedorId: 'contenedor-materiales-modal',
                    callback: (folio) => {
                        $('folio').value = folio;
                        cargarMaterial(folio);
                    }
                });
            });

    } catch (error) {
        console.error('Error en configurarEventos:', error);
    }
}

//!!---------------------------------------------------------------------------------
// ** INICIO APP **
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventos();
});