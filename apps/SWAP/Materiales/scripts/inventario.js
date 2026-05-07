import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

let timeoutBusqueda = null;

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

// 3. FUNCIÓN DEL DASHBOARD
async function cargarDashboard() {
    try {
        const res = await fetch('query_sql/dashboard.php');
        const data = await res.json();
        document.getElementById('total_materiales').textContent = data.total_materiales || 0;
        document.getElementById('stock_total').textContent = data.stock_total || 0;
        document.getElementById('stock_bajo').textContent = data.stock_bajo || 0;
        document.getElementById('movimientos_hoy').textContent = data.movimientos_hoy || 0;

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

// 4. CONFIGURACIÓN DE EVENTOS (Aquí es donde activamos todo)
function configurarEventosInventario() {
    const folioInput = document.getElementById('folio_inventario');

    // --- ESTO ES LO QUE TE FALTABA: Detectar cuando escribes con el teclado ---
    folioInput?.addEventListener('input', (e) => {
        let valor = e.target.value.toUpperCase();
        
        // Formato MA-00000000
        if (!valor.startsWith('MA-')) valor = 'MA-' + valor.replace(/[^0-9]/g, '');
        else valor = 'MA-' + valor.slice(3).replace(/[^0-9]/g, '');
        e.target.value = valor;

        clearTimeout(timeoutBusqueda); // Limpia la espera anterior

        // Si ya escribiste los 11 caracteres (ej: MA-00000001)
        if (valor.length === 11) {
            // Espera un poquito (500ms) para no saturar y busca
            timeoutBusqueda = setTimeout(async () => {
                const result = await MaterialesService.buscarPorFolio(valor);
                if (result.status === 'ok' && result.datos) {
                    actualizarUIInventario(result.datos, true); // <--- Llama a la función maestra
                }
            }, 500);
        } else {
            // Si borras texto, quita el gris y limpia
            actualizarUIInventario(null, false);
        }
    });

    // --- EVENTO DEL MODAL ---
    document.getElementById('btn-modal-inventario')?.addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'modalMaterialInventario',
            contenedorId: 'contenedor-materiales-modal-inventario',
            callback: async (folio) => {
                folioInput.value = folio;
                const result = await MaterialesService.buscarPorFolio(folio);
                if (result.status === 'ok' && result.datos) {
                    actualizarUIInventario(result.datos, true); // <--- Llama a la función maestra
                }
            }
        });
    });

    // --- EVENTO CONSULTAR ---
    document.getElementById('btn-consultar-inventario')?.addEventListener('click', cargarDashboard);

    // --- EVENTO LIMPIAR ---
    document.getElementById('btn-limpiar-inventario')?.addEventListener('click', () => {
        document.getElementById('form-inventario-material').reset();
        actualizarUIInventario(null, false); 
        const dash = document.getElementById('dashboard-inventario');
        if (dash) dash.style.display = 'none';
    });
}

// 5. ARRANCAR TODO AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventosInventario();
});