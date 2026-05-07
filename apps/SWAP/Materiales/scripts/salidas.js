//******* 1. Importaciones *******
import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

// ── variable de control ──────────────────
let timeoutBusqueda = null;

// ── Autocompleta el formulario con los datos del material ──────────────────
async function cargarMaterialSalida(folio) {
    const result = await MaterialesService.buscarPorFolio(folio);

    if (result.status === 'ok' && result.datos) {
        const mat = result.datos;
        document.getElementById('descripcion_salida').value = mat.descripcion_material;
        document.getElementById('unidad_salida').value = mat.id_unidad_material;
        document.getElementById('estado_salida').value = mat.id_estado_material;
        document.getElementById('categoria_salida').value = mat.id_categoria_material;
        document.getElementById('adscripcion_salida').value = mat.adscripcion_modulo;

        const bloqueoGris = ['descripcion_salida', 'unidad_salida', 'estado_salida', 'categoria_salida', 'adscripcion_salida'];
        bloqueoGris.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
           
                elemento.classList.add('bg-light');
                
       
                if (elemento.tagName === 'SELECT') {
                    elemento.disabled = true; 
                } else {
                    elemento.readOnly = true;
                }
            }
        });
        
        // 3. Validación de Stock y Foco
        if (parseInt(mat.stock_actual) <= 0) {
            Swal.fire('Aviso', 'Material sin stock actual.', 'warning');
        }
        document.getElementById('cantidad_salida').focus();
    }
}
// ── Carga la tabla de registros de salidas ────────────────────────────────
async function cargarRegistrosSalida() {
    const data = await MaterialesService.consultarSalidas();
    if (data.status === 'ok') {
        const tbody = document.getElementById('tabla-salidas');
        tbody.innerHTML = data.datos.map(reg => `
            <tr>
                <td class="fw-bold">${reg.folio_material}</td>
                <td>${reg.descripcion_material_salida}</td>
                <td>${reg.unidad}</td>
                <td><span class="badge bg-warning text-dark">${reg.estado}</span></td>
                <td>${reg.cantidad}</td>
                <td class="small">${reg.fecha_registro}</td>
            </tr>
        `).join('');
        document.getElementById('contenedor-tabla-salidas').style.display = 'block';
    }
}
async function guardarSalida(e) {
    e.preventDefault();

    // Automatización: Captura manual de campos por ID para asegurar llaves
    const data = {
        folio: document.getElementById('folio_salida').value,
        descripcion: document.getElementById('descripcion_salida').value,
        unidad: document.getElementById('unidad_salida').value,
        estado: document.getElementById('estado_salida').value,
        id_categoria: document.getElementById('categoria_salida').value,
        adscripcion: document.getElementById('adscripcion_salida').value,
        cantidad: document.getElementById('cantidad_salida').value
    };
if (!data.folio || !data.cantidad) {
        Swal.fire('Atención', 'Folio y cantidad obligatorios', 'warning');
        return;
    }

    const res = await MaterialesService.guardarSalida(data);

    if (res.status === 'ok') {
        Swal.fire('Éxito', res.message, 'success');
        
        // 1. Resetear valores del formulario
        e.target.reset();

        // 2. Desbloqueo manual de campos y estilos
        const camposABloquear = [
            'descripcion_salida', 
            'unidad_salida', 
            'estado_salida', 
            'categoria_salida', 
            'adscripcion_salida'
        ];
        
        camposABloquear.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.readOnly = false;             // Permite escribir
                el.disabled = false;             // Habilita Selects
                el.classList.remove('bg-light'); // Quita el fondo gris
            }
        });

        // 3. Actualizar la tabla de registros
        cargarRegistrosSalida();

    } else {
        Swal.fire('Error', res.message, 'error');
    }
}
// ── 4. Eventos  ────────────────────────────────
function configurarEventosSalida() {
    const folioInput = document.getElementById('folio_salida');
    if (folioInput) {
        folioInput.maxLength = 11;
        folioInput.addEventListener('input', (e) => {
            let valor = e.target.value.toUpperCase();
            if (!valor.startsWith('MA-')) valor = 'MA-' + valor.replace(/[^0-9]/g, '');
            else valor = 'MA-' + valor.slice(3).replace(/[^0-9]/g, '');
            e.target.value = valor;

            clearTimeout(timeoutBusqueda);
            if (valor.length === 11) {
                timeoutBusqueda = setTimeout(() => cargarMaterialSalida(valor), 500);
            }
        });
    }

    document.getElementById('btn-modal-salida')?.addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'modalMaterialSalida',
            contenedorId: 'contenedor-materiales-modal-salida',
            callback: (folio) => {
                document.getElementById('folio_salida').value = folio;
                cargarMaterialSalida(folio);
            }
        });
    });
  // Consultar y Limpiar
    document.getElementById('btn-consultar-salidas')?.addEventListener('click', () => cargarRegistrosSalida());
    document.getElementById('form-salida-material')?.addEventListener('submit', guardarSalida);
    document.getElementById('btn-limpiar-salida')?.addEventListener('click', () => {
        document.getElementById('form-salida-material').reset();
        document.getElementById('contenedor-tabla-salidas').style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventosSalida();
});