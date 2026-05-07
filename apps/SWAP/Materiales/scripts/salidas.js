//******* 1. Importaciones *******
import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

//******* 2. Variables de control *******
let timeoutBusqueda = null;

//******* 3. Automatización *******
async function cargarMaterialSalida(folio) {
    const result = await MaterialesService.buscarPorFolio(folio);

    if (result.status === 'ok' && result.datos) {
        const mat = result.datos;
        document.getElementById('descripcion_salida').value = mat.descripcion_material;
        document.getElementById('unidad_salida').value = mat.id_unidad_material;
        document.getElementById('estado_salida').value = mat.id_estado_material;
        document.getElementById('categoria_salida').value = mat.id_categoria_material;
        document.getElementById('adscripcion_salida').value = mat.adscripcion_modulo;

        if (parseInt(mat.stock_actual) <= 0) {
            Swal.fire('Aviso', 'Material sin stock actual.', 'warning');
        }
        document.getElementById('cantidad_salida').focus();
    }
}

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
        e.target.reset();
        cargarRegistrosSalida();
    } else {
        Swal.fire('Error', res.message, 'error');
    }
}

//******* 4. Eventos *******
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

    document.getElementById('btn-consultar-salidas')?.addEventListener('click', () => cargarRegistrosSalida());
    document.getElementById('form-salida-material')?.addEventListener('submit', guardarSalida);
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventosSalida();
});