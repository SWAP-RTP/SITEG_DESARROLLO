import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

// ** VARIABLE DE CONTROL **
let timeoutBusqueda = null;

// ** AUTCOMPLETA EL FORMULARIO CON LOS DATOS DEL MATERIAL **
function actualizarUIInventario(datos, bloquear = false) {
    const descripcion = document.getElementById('descripcion_inventario');
    const adscripcion = document.getElementById('adscripcion_inventario');
    const stock = document.getElementById('stock_actual_inventario');

    if (descripcion) descripcion.value = datos?.descripcion_material ?? '';
    if (stock) stock.value = datos?.stock_actual ?? 0;
    if (adscripcion) adscripcion.value = datos?.adscripcion_modulo ?? '';

    [descripcion, adscripcion, stock].forEach(elemento => {
        if (elemento) {
            elemento.readOnly = bloquear;
            if (bloquear) elemento.classList.add('bg-light'); 
            else elemento.classList.remove('bg-light'); 
        }
    });
}

//** FUNCIÓN DEL DASHBOARD (CAMBIO AQUÍ: Alerta visual dinámica) **
async function cargarDashboard() {
    try {
        const res = await fetch('query_sql/dashboard.php');
        const data = await res.json();
        
        const cantidadBajo = parseInt(data.stock_bajo) || 0;

        document.getElementById('total_materiales').textContent = data.total_materiales || 0;
        document.getElementById('stock_total').textContent = data.stock_total || 0;
        document.getElementById('stock_bajo').textContent = cantidadBajo;
        document.getElementById('movimientos_hoy').textContent = data.movimientos_hoy || 0;

        // --- LÓGICA PARA VOLVER EL KPI COMPLETAMENTE ROJO ---
        const kpiCardBajo = document.getElementById('kpi-card-bajo');
        const kpiIcono = kpiCardBajo.querySelector('i');

        if (cantidadBajo > 0) {
            kpiCardBajo.classList.add('bg-danger', 'text-white');
            kpiIcono.style.setProperty('color', '#ffffff', 'important'); // Icono blanco para contraste
        } else {
            kpiCardBajo.classList.remove('bg-danger', 'text-white');
            kpiIcono.style.setProperty('color', '#e74c3c', 'important'); // Icono rojo original
        }
        // ----------------------------------------------------

        const tbody = document.getElementById('tabla_stock_bajo');
        tbody.innerHTML = (data.materiales_bajo || []).map(m => `
            <tr>
                <td>${m.folio_material}</td>
                <td>${m.descripcion_material}</td>
                <td><span class="badge bg-danger">${m.stock_actual}</span></td>
            </tr>
        `).join('') || '<tr><td colspan="3" class="text-center">No hay stock bajo</td></tr>';
        
        document.getElementById('dashboard-inventario').style.display = 'block';
    } catch (e) { console.error(e); }
}

// ** CONFIGURACIÓN DE EVENTOS **
function configurarEventosInventario() {
    const folioInput = document.getElementById('folio_inventario');

    // ** Detectar cuando se escribe con el teclado **
    folioInput?.addEventListener('input', (e) => {
        let valor = e.target.value.toUpperCase();

        if (!valor.startsWith('MA-')) valor = 'MA-' + valor.replace(/[^0-9]/g, '');
        else valor = 'MA-' + valor.slice(3).replace(/[^0-9]/g, '');
        e.target.value = valor;

        clearTimeout(timeoutBusqueda); 

        if (valor.length === 11) {
            timeoutBusqueda = setTimeout(async () => {
                const result = await MaterialesService.buscarPorFolio(valor);
                if (result.status === 'ok' && result.datos) {
                    actualizarUIInventario(result.datos, true);
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
            }, 500);
        } else {
            actualizarUIInventario(null, false);
        }
    });

    // ** EVENTO DEL MODAL **
    document.getElementById('btn-modal-inventario')?.addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'modalMaterialInventario',
            contenedorId: 'contenedor-materiales-modal-inventario',
            callback: async (folio) => {
                folioInput.value = folio;
                const result = await MaterialesService.buscarPorFolio(folio);
                if (result.status === 'ok' && result.datos) {
                    actualizarUIInventario(result.datos, true); 
                }
            }
        });
    });

    // ** EVENTO CONSULTAR **
    document.getElementById('btn-consultar-inventario')?.addEventListener('click', cargarDashboard);

    // ** EVENTO LIMPIAR (CAMBIO AQUÍ: Se restablece el estilo original del KPI) **
    document.getElementById('btn-limpiar-inventario')?.addEventListener('click', () => {
        document.getElementById('form-inventario-material').reset();
        actualizarUIInventario(null, false);
        const dash = document.getElementById('dashboard-inventario');
        if (dash) dash.style.display = 'none';

        // Restablecer el KPI de Stock Bajo a su estado base oscuro
        const kpiCardBajo = document.getElementById('kpi-card-bajo');
        if (kpiCardBajo) {
            kpiCardBajo.classList.remove('bg-danger', 'text-white');
            const kpiIcono = kpiCardBajo.querySelector('i');
            if (kpiIcono) kpiIcono.style.setProperty('color', '#e74c3c', 'important');
        }
    });
}

// ** ARRANCAR TODO AL CARGAR LA PÁGINA **
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventosInventario();
});