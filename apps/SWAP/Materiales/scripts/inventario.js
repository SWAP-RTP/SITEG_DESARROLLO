import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

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

function configurarEventosInventario() {
    document.getElementById('btn-modal-inventario')?.addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'modalMaterialInventario',
            contenedorId: 'contenedor-materiales-modal-inventario',
            callback: (folio) => {
                document.getElementById('folio_inventario').value = folio;
            }
        });
    });

    document.getElementById('btn-consultar-inventario')?.addEventListener('click', () => cargarDashboard());

    document.getElementById('btn-limpiar-inventario')?.addEventListener('click', (e) => {
      
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventosInventario();
    //cargarDashboard();
});
