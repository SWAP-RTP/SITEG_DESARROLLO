import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

// ** VARIABLE DE CONTROL **
let timeoutBusqueda = null;

//!!---------------------------------------------------------------------------------
// --- UTILIDADES ---
function obtenerElemento(id) {
    return document.getElementById(id);
}

function actualizarCampo(elemento, valor = '', bloquear = false) {
    if (!elemento) return;

    elemento.value = valor;
    elemento.readOnly = bloquear;

    elemento.classList.toggle('bg-light', bloquear);
}

function formatearFolio(valor = '') {
    valor = valor.toUpperCase();

    if (!valor.startsWith('MA-')) {
        return 'MA-' + valor.replace(/[^0-9]/g, '');
    }

    return 'MA-' + valor.slice(3).replace(/[^0-9]/g, '');
}

//!!---------------------------------------------------------------------------------
// ** AUTOCOMPLETA EL FORMULARIO CON LOS DATOS DEL MATERIAL **
function actualizarUIInventario(datos, bloquear = false) {
    try {

        actualizarCampo(
            obtenerElemento('descripcion_inventario'),
            datos?.descripcion_material ?? '',
            bloquear
        );

        actualizarCampo(
            obtenerElemento('adscripcion_inventario'),
            datos?.adscripcion_modulo ?? '',
            bloquear
        );

        actualizarCampo(
            obtenerElemento('stock_actual_inventario'),
            datos?.stock_actual ?? 0,
            bloquear
        );

    } catch (error) {
        console.error('Error al actualizar UI de inventario:', error);
    }
}

//!!---------------------------------------------------------------------------------
//** RENDERIZAR RESULTADOS MODAL INVENTARIO */
function renderizarResultadosEnModalInventario(materiales, contenedor) {

    try {

        if (!contenedor) return;

        if (!materiales.length) {

            contenedor.innerHTML = `
                <div class="alert alert-secondary text-center">
                    No se encontraron coincidencias
                </div>
            `;

            return;
        }

        let html = `
            <table class="table table-sm table-hover align-middle mt-2">

                <thead class="table-dark">
                    <tr>
                        <th>Folio</th>
                        <th>Descripción</th>
                        <th class="text-center">Acción</th>
                    </tr>
                </thead>

                <tbody>
        `;

        materiales.forEach(mat => {

            html += `
                <tr>

                    <td class="fw-bold">
                        ${mat.folio_material}
                    </td>

                    <td class="small">
                        ${mat.descripcion_material}
                    </td>

                    <td class="text-center">
                        <button
                            class="btn btn-primary btn-sm btn-seleccionar-inventario"
                            data-folio="${mat.folio_material}"
                        >
                            Seleccionar
                        </button>
                    </td>

                </tr>
            `;
        });

        html += `</tbody></table>`;

        contenedor.innerHTML = html;

        configurarEventosSeleccionModal(contenedor);

    } catch (error) {

        console.error(
            "Error en renderizarResultadosEnModalInventario:",
            error
        );
    }
}

//!!---------------------------------------------------------------------------------
function configurarEventosSeleccionModal(contenedor) {

    contenedor.querySelectorAll('.btn-seleccionar-inventario')
        .forEach(btn => {

            btn.addEventListener('click', (e) => {

                try {

                    const folio = e.currentTarget.getAttribute('data-folio');

                    const folioInput = obtenerElemento('folio_inventario');

                    if (folioInput) {

                        folioInput.value = folio;

                        folioInput.dispatchEvent(
                            new Event('input', { bubbles: true })
                        );
                    }

                    const modal = bootstrap.Modal.getInstance(
                        obtenerElemento('modalMaterialInventario')
                    );

                    if (modal) modal.hide();

                } catch (error) {

                    console.error(
                        "Error al seleccionar material en modal:",
                        error
                    );
                }
            });
        });
}

//!!---------------------------------------------------------------------------------
//** FUNCIÓN DEL DASHBOARD **/
async function cargarDashboard() {

    try {

        const res = await fetch('query_sql/dashboard.php');

        const data = await res.json();

        const cantidadBajo = parseInt(data.stock_bajo) || 0;

        obtenerElemento('total_materiales').textContent =
            data.total_materiales || 0;

        obtenerElemento('stock_total').textContent =
            data.stock_total || 0;

        obtenerElemento('stock_bajo').textContent =
            cantidadBajo;

        obtenerElemento('movimientos_hoy').textContent =
            data.movimientos_hoy || 0;

        actualizarKPIStockBajo(cantidadBajo);

        renderizarTablaStockBajo(data.materiales_bajo || []);

        obtenerElemento('dashboard-inventario').style.display = 'block';

    } catch (error) {

        console.error(error);
    }
}

//!!---------------------------------------------------------------------------------
function actualizarKPIStockBajo(cantidadBajo = 0) {

    const kpiCard = obtenerElemento('kpi-card-bajo');

    if (!kpiCard) return;

    const icono = kpiCard.querySelector('i');

    if (cantidadBajo > 0) {

        kpiCard.classList.add('bg-danger', 'text-white');

        icono?.style.setProperty(
            'color',
            '#ffffff',
            'important'
        );

    } else {

        kpiCard.classList.remove('bg-danger', 'text-white');

        icono?.style.setProperty(
            'color',
            '#e74c3c',
            'important'
        );
    }
}

//!!---------------------------------------------------------------------------------
function renderizarTablaStockBajo(materiales = []) {

    const tbody = obtenerElemento('tabla_stock_bajo');

    if (!tbody) return;

    if (!materiales.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">
                    No hay stock bajo
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = materiales.map(m => `
        <tr>

            <td>${m.folio_material}</td>

            <td>${m.descripcion_material}</td>

            <td>
                <span class="badge bg-danger">
                    ${m.stock_actual}
                </span>
            </td>

        </tr>
    `).join('');
}

//!!---------------------------------------------------------------------------------
// ** CONFIGURACIÓN DE EVENTOS **
function configurarEventosInventario() {

    configurarEventoFolio();
    configurarBusquedaModal();
    configurarBotonModal();
    configurarConsultar();
    configurarLimpiar();
}

//!!---------------------------------------------------------------------------------
function configurarEventoFolio() {

    const folioInput = obtenerElemento('folio_inventario');

    folioInput?.addEventListener('input', (e) => {

        try {

            const valor = formatearFolio(e.target.value);

            e.target.value = valor;

            clearTimeout(timeoutBusqueda);

            if (valor.length === 11) {

                timeoutBusqueda = setTimeout(async () => {

                    try {

                        const result =
                            await MaterialesService.buscarPorFolio(valor);

                        if (
                            result.status === 'ok' &&
                            result.datos
                        ) {

                            actualizarUIInventario(
                                result.datos,
                                true
                            );

                        } else {

                            actualizarUIInventario(null, false);

                            Swal.fire({
                                icon: 'warning',
                                title: 'Material no encontrado',
                                text: 'El folio ingresado no existe en el inventario.',
                                confirmButtonText: 'Aceptar'
                            }).then(() => {

                                folioInput.value = '';

                                folioInput.focus();
                            });
                        }

                    } catch (error) {

                        console.error(
                            "Error en búsqueda por folio:",
                            error
                        );
                    }

                }, 500);

            } else {

                actualizarUIInventario(null, false);
            }

        } catch (error) {

            console.error(
                "Error en input folio_inventario:",
                error
            );
        }
    });
}

//!!---------------------------------------------------------------------------------
function configurarBusquedaModal() {

    const inputBusqueda =
        obtenerElemento('buscar-material-modal-inventario');

    const contenedor =
        obtenerElemento('contenedor-materiales-modal-inventario');

    if (!inputBusqueda) return;

    inputBusqueda.addEventListener('input', async (e) => {

        try {

            const texto = e.target.value.trim();

            const materiales =
                await MaterialesService.buscarDinamico(texto);

            renderizarResultadosEnModalInventario(
                materiales,
                contenedor
            );

        } catch (error) {

            console.error(
                "Error en búsqueda modal inventario:",
                error
            );
        }
    });
}

//!!---------------------------------------------------------------------------------
function configurarBotonModal() {

    obtenerElemento('btn-modal-inventario')
        ?.addEventListener('click', async () => {

            try {

                const inputBusqueda =
                    obtenerElemento('buscar-material-modal-inventario');

                const contenedor =
                    obtenerElemento('contenedor-materiales-modal-inventario');

                if (inputBusqueda) {
                    inputBusqueda.value = '';
                }

                const materiales =
                    await MaterialesService.buscarDinamico('');

                renderizarResultadosEnModalInventario(
                    materiales,
                    contenedor
                );

                ModalService.abrir({
                    modalId: 'modalMaterialInventario',
                    contenedorId: 'contenedor-materiales-modal-inventario',

                    callback: async (folio) => {

                        try {

                            obtenerElemento('folio_inventario').value = folio;

                            const result =
                                await MaterialesService.buscarPorFolio(folio);

                            if (
                                result.status === 'ok' &&
                                result.datos
                            ) {

                                actualizarUIInventario(
                                    result.datos,
                                    true
                                );
                            }

                        } catch (error) {

                            console.error(
                                "Error callback modal inventario:",
                                error
                            );
                        }
                    }
                });

            } catch (error) {

                console.error(
                    "Error al abrir modal inventario:",
                    error
                );
            }
        });
}

//!!---------------------------------------------------------------------------------
function configurarConsultar() {

    obtenerElemento('btn-consultar-inventario')
        ?.addEventListener('click', cargarDashboard);
}

//!!---------------------------------------------------------------------------------
function configurarLimpiar() {

    obtenerElemento('btn-limpiar-inventario')
        ?.addEventListener('click', () => {

            try {

                const form =
                    obtenerElemento('form-inventario-material');

                form?.reset();

                actualizarUIInventario(null, false);

                const dashboard =
                    obtenerElemento('dashboard-inventario');

                if (dashboard) {
                    dashboard.style.display = 'none';
                }

                actualizarKPIStockBajo(0);

                obtenerElemento('folio_inventario')?.focus();

            } catch (error) {

                console.error(
                    "Error al limpiar inventario:",
                    error
                );
            }
        });
}

//!!---------------------------------------------------------------------------------
// ** ARRANCAR TODO AL CARGAR LA PÁGINA **
document.addEventListener('DOMContentLoaded', async () => {

    await cargarCatalogos();

    configurarEventosInventario();
});