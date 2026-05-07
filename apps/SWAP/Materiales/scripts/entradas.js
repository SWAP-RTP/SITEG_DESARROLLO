import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';
// ── variable de control ──────────────────
let timeoutBusqueda = null;

// ── Autocompleta el formulario con los datos del material ──────────────────
async function cargarMaterial(folio) {
    const result = await MaterialesService.buscarPorFolio(folio);

    if (result.status === 'ok' && result.datos) {
        const mat = result.datos;

        document.getElementById('descripcion').value = mat.descripcion_material ?? '';
        document.getElementById('unidad').value = mat.id_unidad_material ?? '';
        document.getElementById('estado').value = mat.id_estado_material ?? '';
        document.getElementById('id_categoria').value = mat.id_categoria_material ?? '';
        document.getElementById('adscripcion').value = mat.adscripcion_modulo ?? '';

        // Bloquear campos para material existente
      
        document.getElementById('descripcion').disabled = true;
        document.getElementById('unidad').disabled = true;
        document.getElementById('estado').disabled = true;
        document.getElementById('id_categoria').disabled = true;
        document.getElementById('adscripcion').disabled = true;
        document.getElementById('cantidad').focus();

    } else {
        // Material nuevo: desbloquear
        document.getElementById('descripcion').disabled = false;
        document.getElementById('unidad').disabled = false;
        document.getElementById('estado').disabled = false;
        document.getElementById('id_categoria').disabled = false;
        document.getElementById('adscripcion').disabled = false;
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
    const form = e.target;
    const camposBloqueados = form.querySelectorAll('input:disabled, select:disabled, input[readonly]');
    camposBloqueados.forEach(c => {
        c.disabled = false;
        c.readOnly = false;
    });
    const data = Object.fromEntries(new FormData(form).entries());
    const res = await MaterialesService.guardarEntrada(data);

    if (res.status === 'ok') {
        Swal.fire('Éxito', res.message, 'success');
        form.reset(); 

        const todosLosCampos = form.querySelectorAll('input, select, textarea');
        todosLosCampos.forEach(campo => {
            campo.disabled = false;   
            campo.readOnly = false;   
            campo.classList.remove('bg-light'); 
        });
        if(typeof cargarRegistros === 'function') cargarRegistros();
        document.getElementById('folio')?.focus();

    } else {
     
        camposBloqueados.forEach(c => {
        });
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

    // ── Botón lupa → modal ────────────────────────────────────────────────────────────────
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

    // ── Consultar y Limpiar ────────────────────────────────────────────────────────────────
    document.getElementById('btn-consultar-entradas')?.addEventListener('click', cargarRegistros);
    document.getElementById('form-entrada-material')?.addEventListener('submit', guardarEntrada);
    document.getElementById('btn-limpiar-entrada')?.addEventListener('click', () => {
        document.getElementById('form-entrada-material').reset();
        document.getElementById('contenedor-tabla-registros').style.display = 'none';
        document.getElementById('descripcion').disabled = false;
        document.getElementById('adscripcion').disabled = false;
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventos();
});
