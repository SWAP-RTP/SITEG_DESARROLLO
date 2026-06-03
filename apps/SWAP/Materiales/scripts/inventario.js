
import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

let timeoutBusqueda = null;
const buscarElemento = (id) => document.getElementById(id);


const actualizarCampo = (elementoId, valor = '', bloquear = false) => {
    const el = buscarElemento(elementoId);
    if (!el) return;
    el.value = valor;
    el.readOnly = bloquear;
    el.classList.toggle('bg-light', bloquear); // Gris si es solo lectura
};

// 'formatearFolio' usa 'textoFolio' en lugar de 'v'
const formatearFolio = (textoFolio = '') => {
    textoFolio = textoFolio.toUpperCase();
    return 'MA-' + (textoFolio.startsWith('MA-') ? textoFolio.substring(3) : textoFolio).replace(/[^0-9]/g, '');
};

// Función para llenar el formulario con los 'datosMaterial'
function actualizarUIInventario(datosMaterial, bloquear = false) {
    actualizarCampo('descripcion_inventario', datosMaterial?.descripcion_material ?? '', bloquear);
    actualizarCampo('adscripcion_inventario', datosMaterial?.adscripcion_modulo ?? '', bloquear);
    actualizarCampo('stock_actual_inventario', datosMaterial?.stock_actual ?? 0, bloquear);
}

// --- DASHBOARD Y KPIs(son minitarjetas del inventario donde se muestran los datos) ---
async function cargarDashboard() {
    try {
        const respuesta = await fetch('query_sql/dashboard.php');
        const datos = await respuesta.json();
        const cantidadBajo = parseInt(datos.stock_bajo) || 0;

        buscarElemento('total_materiales').textContent = datos.total_materiales || 0;
        buscarElemento('stock_total').textContent = datos.stock_total || 0;
        buscarElemento('stock_bajo').textContent = cantidadBajo;
        buscarElemento('movimientos_hoy').textContent = datos.movimientos_hoy || 0;

        actualizarKPIStockBajo(cantidadBajo);
        renderizarTablaStockBajo(datos.materiales_bajo || []);
        buscarElemento('dashboard-inventario').style.display = 'block';
    } catch (error) { 
        console.error("Error al conectar con el servidor para el dashboard", error); 
    }
}

function actualizarKPIStockBajo(cantidad = 0) {
    const tarjetaKpi = buscarElemento('kpi-card-bajo');
    if (!tarjetaKpi) return;
    
    const icono = tarjetaKpi.querySelector('i');
    
    // Si hay stock bajo (>0), aplicamos clases de alerta de Bootstrap
    if (cantidad > 0) {
        tarjetaKpi.className = 'card l-bg-cherry kpi-card bg-danger text-white';
        if (icono) icono.style.setProperty('color', '#ffffff', 'important');
    } else {
        tarjetaKpi.className = 'card l-bg-cherry kpi-card';
        if (icono) icono.style.setProperty('color', '#e74c3c', 'important');
    }
}

function renderizarTablaStockBajo(listaMateriales = []) {
    const tablaCuerpo = buscarElemento('tabla_stock_bajo');
    if (!tablaCuerpo) return;

    if (!listaMateriales.length) {
        tablaCuerpo.innerHTML = '<tr><td colspan="3" class="text-center">No hay alertas de stock</td></tr>';
        return;
    }

    tablaCuerpo.innerHTML = listaMateriales.map(material => `
        <tr>
            <td>${material.folio_material}</td>
            <td>${material.descripcion_material}</td>
            <td><span class="badge bg-danger">${material.stock_actual}</span></td>
        </tr>`).join('');
}

// --- CONFIGURACIÓN DE EVENTOS ---

function configurarEventosInventario() {
    // Control del input de Folio
    buscarElemento('folio_inventario')?.addEventListener('input', (evento) => {
        const valorLimpio = formatearFolio(evento.target.value);
        evento.target.value = valorLimpio;

        clearTimeout(timeoutBusqueda);

        // Si el folio tiene 11 caracteres (MA-00000000), buscamos en la BD
        if (valorLimpio.length === 11) {
            timeoutBusqueda = setTimeout(async () => {
                const resultado = await MaterialesService.buscarPorFolio(valorLimpio);
                if (resultado.status === 'ok' && resultado.datos) {
                    actualizarUIInventario(resultado.datos, true);
                } else {
                    actualizarUIInventario(null, false);
                    Swal.fire('Atención', 'El folio no existe en el sistema.', 'warning');
                    evento.target.value = ''; 
                    evento.target.focus();
                }
            }, 500);
        } else { 
            actualizarUIInventario(null, false); 
        }
    });

    // Botón para abrir el buscador (Modal)
    buscarElemento('btn-modal-inventario')?.addEventListener('click', async () => {
        const materiales = await MaterialesService.buscarDinamico('');
        // Usamos el servicio de modales pasando los datos necesarios
        ModalService.abrir({
            modalId: 'modalMaterialInventario',
            contenedorId: 'contenedor-materiales-modal-inventario',
            callback: async (folioSeleccionado) => {
                buscarElemento('folio_inventario').value = folioSeleccionado;
                const res = await MaterialesService.buscarPorFolio(folioSeleccionado);
                if (res.status === 'ok') actualizarUIInventario(res.datos, true);
            }
        });
    });

    // Botón Consultar
    buscarElemento('btn-consultar-inventario')?.addEventListener('click', cargarDashboard);
    
    // Botón Limpiar formulario
    buscarElemento('btn-limpiar-inventario')?.addEventListener('click', () => {
        buscarElemento('form-inventario-material')?.reset();
        actualizarUIInventario(null, false);
        const dashboard = buscarElemento('dashboard-inventario');
        if (dashboard) dashboard.style.display = 'none';
        actualizarKPIStockBajo(0);
        buscarElemento('folio_inventario')?.focus();
    });
}

// Arrancamos el script cuando el navegador esté listo
document.addEventListener('DOMContentLoaded', async () => { 
    await cargarCatalogos(); 
    configurarEventosInventario(); 
});