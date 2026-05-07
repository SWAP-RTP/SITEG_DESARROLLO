import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

let timeoutBusqueda = null;

// ── Autocompleta el formulario con los datos del material ──────────────────
async function cargarMaterial(folio) {
    const result = await MaterialesService.buscarPorFolio(folio);

    if (result.status === 'ok' && result.datos) {
        const mat = result.datos;

        // IDs exactos del HTML + propiedades exactas del PHP
        document.getElementById('descripcion').value = mat.descripcion_material ?? '';
        document.getElementById('unidad').value = mat.id_unidad_material ?? '';
        document.getElementById('estado').value = mat.id_estado_material ?? '';
        document.getElementById('id_categoria').value = mat.id_categoria_material ?? '';
        document.getElementById('adscripcion').value = mat.adscripcion_modulo ?? '';

        // Bloquear campos para material existente
        document.getElementById('descripcion').readOnly = true;
        document.getElementById('adscripcion').readOnly = true;

        document.getElementById('cantidad').focus();

    } else {
        // Material nuevo: desbloquear
        document.getElementById('descripcion').readOnly = false;
        document.getElementById('adscripcion').readOnly = false;
    }
}

// ── Carga la tabla de registros de entradas ────────────────────────────────
async function cargarRegistros() {
    const data = await MaterialesService.consultarEntradas();
    if (data.status === 'ok') {
        const tbody = document.getElementById('tabla-registros');
        tbody.innerHTML = data.datos.map(reg => `
            <tr>
                <td class="fw-bold">${reg.folio_material}</td>
                <td>${reg.descripcion_material_entrada}</td>
                <td>${reg.unidad}</td>
                <td><span class="badge bg-info text-dark">${reg.estado}</span></td>
                <td>${reg.cantidad}</td>
                <td class="small">${reg.fecha_registro}</td>
            </tr>
        `).join('');
        document.getElementById('contenedor-tabla-registros').style.display = 'block';
    }
}

// ── Guarda el registro de entrada ──────────────────────────────────────────
async function guardarEntrada(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const res = await MaterialesService.guardarEntrada(data);

    if (res.status === 'ok') {
        Swal.fire('Éxito', res.message, 'success');
        e.target.reset();
        document.getElementById('descripcion').readOnly = false;
        document.getElementById('adscripcion').readOnly = false;
        cargarRegistros();
    } else {
        Swal.fire('Error', res.message, 'error');
    }
}

// ── Eventos ────────────────────────────────────────────────────────────────
function configurarEventos() {
    // Folio: formateo automático MA- y disparo de búsqueda
    const folioInput = document.getElementById('folio');
    if (folioInput) {
        folioInput.addEventListener('input', (e) => {
            let v = e.target.value.toUpperCase();
            v = v.startsWith('MA-')
                ? 'MA-' + v.slice(3).replace(/[^0-9]/g, '')
                : 'MA-' + v.replace(/[^0-9]/g, '');
            e.target.value = v;

            clearTimeout(timeoutBusqueda);
            if (v.length === 11) {
                timeoutBusqueda = setTimeout(() => cargarMaterial(v), 400);
            }
        });
    }

    // Botón lupa → modal
    document.getElementById('modal-material-entrada')?.addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'exampleModalCenter',
            contenedorId: 'contenedor-materiales-modal',
            callback: (folio) => {
                document.getElementById('folio').value = folio;
                cargarMaterial(folio);
            }
        });
    });

    // Consultar y Limpiar
    document.getElementById('btn-consultar-entradas')?.addEventListener('click', cargarRegistros);
    document.getElementById('form-entrada-material')?.addEventListener('submit', guardarEntrada);
    document.getElementById('btn-limpiar-entrada')?.addEventListener('click', () => {
        document.getElementById('form-entrada-material').reset();
        document.getElementById('contenedor-tabla-registros').style.display = 'none';
        document.getElementById('descripcion').readOnly = false;
        document.getElementById('adscripcion').readOnly = false;
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventos();
});
