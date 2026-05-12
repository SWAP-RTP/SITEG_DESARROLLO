//******* 1. Importaciones *******
import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

// ** Variable de control para el debounce de búsqueda **
let timeoutBusqueda = null;

//********************* AUTOCOMPLETAR FORMULARIO *********************************
async function cargarMaterialSalida(folio) {
    const resultado = await MaterialesService.buscarPorFolio(folio);
    const inputFolio = document.getElementById('folio_salida');
    const estadoMaterial = document.getElementById('estado-material-salida');

    if (resultado.status === 'ok' && resultado.datos) {
        inputFolio.classList.remove('is-invalid');
        estadoMaterial.innerHTML = '';

        const mat = resultado.datos;

        // Llenar campos del formulario
        document.getElementById('descripcion_salida').value = mat.descripcion_material ?? '';
        document.getElementById('unidad_salida').value = mat.id_unidad_material ?? '';
        document.getElementById('estado_salida').value = mat.id_estado_material ?? '';
        document.getElementById('categoria_salida').value = mat.id_categoria_material ?? '';
        document.getElementById('adscripcion_salida').value = mat.adscripcion_modulo ?? '';

        // Bloquear campos y aplicar estilo gris (solo lectura para salidas)
        const campos = ['descripcion_salida', 'unidad_salida', 'estado_salida', 'categoria_salida', 'adscripcion_salida'];
        campos.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('bg-light');
                if (el.tagName === 'SELECT') el.disabled = true;
                else el.readOnly = true;
            }
        });

        // Validar existencias
        if (parseInt(mat.stock_actual) <= 0) {
            Swal.fire('Aviso', 'Material sin stock actual.', 'warning');
        }

        document.getElementById('cantidad_salida').focus();
    } else {
        inputFolio.classList.add('is-invalid');
        Swal.fire({
            title: 'Material no encontrado',
            text: 'El folio ingresado no existe en el sistema.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#6f42c1'
        });
    }
}

//********************* CARGAR TABLA DE REGISTROS *********************************
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
            </tr>`).join('');

        document.getElementById('contenedor-tabla-salidas').style.display = 'block';
    }
}

//*************** GUARDAR SALIDA ***************************************
async function guardarSalida(e) {
    e.preventDefault();
    const form = e.target;
    
    // Habilitar campos temporalmente para que el navegador permita leer los valores
    const camposABloquear = ['descripcion_salida', 'unidad_salida', 'estado_salida', 'categoria_salida', 'adscripcion_salida'];
    camposABloquear.forEach(id => {
        const el = document.getElementById(id);
        if(el) { el.disabled = false; el.readOnly = false; }
    });

    // Captura de datos manual para asegurar que no viajen vacíos
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
        Swal.fire('Atención', 'Folio y cantidad son obligatorios.', 'warning');
        // Re-bloquear si falló la validación
        camposABloquear.forEach(id => {
            const el = document.getElementById(id);
            if(el) { el.disabled = true; el.classList.add('bg-light'); }
        });
        return;
    }

    const respuesta = await MaterialesService.guardarSalida(data);

    if (respuesta.status === 'ok') {
        if (respuesta.stock_restante <= 30) {
            Swal.fire('Stock Bajo', `Salida registrada. Quedan ${respuesta.stock_restante} piezas.`, 'warning');
        } else {
            Swal.fire('Éxito', respuesta.message, 'success');
        }
        
        form.reset();
        document.getElementById('folio_salida').classList.remove('is-invalid');
        document.getElementById('estado-material-salida').innerHTML = '';
        
        // Desbloquear todo para el siguiente registro
        const todos = form.querySelectorAll('input, select');
        todos.forEach(c => {
            c.disabled = false;
            c.readOnly = false;
            c.classList.remove('bg-light');
        });

        cargarRegistrosSalida();
    } else {
        Swal.fire('Error', respuesta.message, 'error');
        // Re-bloquear en caso de error
        camposABloquear.forEach(id => {
            const el = document.getElementById(id);
            if(el) { el.disabled = true; el.classList.add('bg-light'); }
        });
    }
}

// --- RENDERIZAR RESULTADOS MODAL SALIDA ---
function renderizarResultadosEnModalSalida(materiales, contenedor) {
    if (materiales.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-secondary text-center">No se encontraron coincidencias</div>';
        return;
    }

    let html = `<table class="table table-sm table-hover align-middle mt-2">
        <thead class="table-dark">
            <tr><th>Folio</th><th>Descripción</th><th class="text-center">Acción</th></tr>
        </thead>
        <tbody>`;

    materiales.forEach(mat => {
        html += `
            <tr>
                <td class="fw-bold">${mat.folio_material}</td>
                <td class="small">${mat.descripcion_material}</td>
                <td class="text-center">
                    <button class="btn btn-primary btn-sm btn-seleccionar-salida" data-folio="${mat.folio_material}">
                        Seleccionar
                    </button>
                </td>
            </tr>`;
    });

    html += `</tbody></table>`;
    contenedor.innerHTML = html;

    contenedor.querySelectorAll('.btn-seleccionar-salida').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const folio = e.currentTarget.getAttribute('data-folio');
            document.getElementById('folio_salida').value = folio;
            cargarMaterialSalida(folio);
            const instance = bootstrap.Modal.getInstance(document.getElementById('modalMaterialSalida'));
            if (instance) instance.hide();
        });
    });
}

//**************** CONFIGURAR EVENTOS **************************************
function configurarEventosSalida() {
    // Formato de Folio y Búsqueda Automática
    const folioInput = document.getElementById('folio_salida');
    if (folioInput) {
        folioInput.addEventListener('input', (e) => {
            let valor = e.target.value.toUpperCase();
            valor = valor.startsWith('MA-') ? 'MA-' + valor.slice(3).replace(/[^0-9]/g, '') : 'MA-' + valor.replace(/[^0-9]/g, '');
            e.target.value = valor;
            clearTimeout(timeoutBusqueda);
            if (valor.length === 11) timeoutBusqueda = setTimeout(() => cargarMaterialSalida(valor), 400);
        });
    }

    // Buscador Dinámico en Modal
    const inputModalBusqueda = document.getElementById('buscar-material-modal-salida'); 
    const contenedorResultados = document.getElementById('contenedor-materiales-modal-salida');

    if (inputModalBusqueda) {
        inputModalBusqueda.addEventListener('input', async (e) => {
            const texto = e.target.value.trim();
            if (texto.length < 2) return;
            const materiales = await MaterialesService.buscarDinamico(texto);
            renderizarResultadosEnModalSalida(materiales, contenedorResultados);
        });
    }

    //  Abrir Modal y Resetear Buscador
    document.getElementById('btn-modal-salida')?.addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'modalMaterialSalida',
            contenedorId: 'contenedor-materiales-modal-salida',
            callback: (folio) => {
                document.getElementById('folio_salida').value = folio;
                cargarMaterialSalida(folio);
            }
        });
        if(inputModalBusqueda) {
            inputModalBusqueda.value = '';
            setTimeout(() => inputModalBusqueda.focus(), 500);
        }
    });

    //  Otros Botones de Acción
    document.getElementById('btn-consultar-salidas')?.addEventListener('click', cargarRegistrosSalida);
    document.getElementById('form-salida-material')?.addEventListener('submit', guardarSalida);
    
    //  BOTÓN LIMPIAR (Lógica Completa: Reset + Ocultar Consulta)
    document.getElementById('btn-limpiar-salida')?.addEventListener('click', () => {
        document.getElementById('form-salida-material').reset();
        
        // Ocultar la tabla de registros
        const contenedorTabla = document.getElementById('contenedor-tabla-salidas');
        if (contenedorTabla) contenedorTabla.style.display = 'none';

        // Resetear alertas visuales
        document.getElementById('folio_salida').classList.remove('is-invalid');
        document.getElementById('estado-material-salida').innerHTML = '';

        // Habilitar campos bloqueados
        const campos = ['descripcion_salida', 'unidad_salida', 'estado_salida', 'categoria_salida', 'adscripcion_salida'];
        campos.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.readOnly = false;
                el.disabled = false;
                el.classList.remove('bg-light');
            }
        });
        document.getElementById('folio_salida')?.focus();
    });
}

// INICIO DE LA APLICACIÓN
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventosSalida();
});