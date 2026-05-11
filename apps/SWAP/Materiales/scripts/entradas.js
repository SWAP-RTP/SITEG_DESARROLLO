//**importaciones */
import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

// ** VARIABLE DE CONTROL **
let timeoutBusqueda = null;

//******* AUTOCOMPLETAR FORMULARIO ********************
async function cargarMaterial(folio) {
    const resultado = await MaterialesService.buscarPorFolio(folio);
    const inputFolio = document.getElementById('folio');
    const estadoMaterial = document.getElementById('estado-material');

    if (resultado.status === 'ok' && resultado.datos) {
        inputFolio.classList.remove('is-invalid');
        estadoMaterial.innerHTML = '';

        const material = resultado.datos;
        document.getElementById('descripcion').value = material.descripcion_material ?? '';
        document.getElementById('unidad').value = material.id_unidad_material ?? '';
        document.getElementById('estado').value = material.id_estado_material ?? '';
        document.getElementById('id_categoria').value = material.id_categoria_material ?? '';
        document.getElementById('adscripcion').value = material.adscripcion_modulo ?? '';

        ['descripcion', 'unidad', 'estado', 'id_categoria', 'adscripcion'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = true;
        });

        document.getElementById('cantidad').focus();
    } else {
        const nuevoFolio = await MaterialesService.generarFolio();
        if (nuevoFolio.status === 'ok') {
            inputFolio.value = nuevoFolio.folio;
        }

        Swal.fire({
            icon: 'info',
            title: 'Nuevo material detectado',
            text: 'El folio no existe. Capture los datos del material.',
            timer: 4000,
            showConfirmButton: false
        });

        document.getElementById('folio-oculto').style.display = 'none';
        ['descripcion', 'unidad', 'estado', 'id_categoria', 'adscripcion'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = false;
        });
    }
}
// **** CARGAR LA TABLA DE REGISTROS **************
async function cargarRegistros() {
    const data = await MaterialesService.consultarEntradas();
    if (data.status === 'ok') {
        const tbody = document.getElementById('tabla-registros');
        tbody.innerHTML = data.datos.map(reg => {
            let claseColor = 'bg-info text-dark';
            const estado = (reg.estado || '').toUpperCase();
            if (estado.includes('BUENO')) claseColor = 'bg-success text-white';
            else if (estado.includes('REGULAR')) claseColor = 'bg-warning text-dark';
            else if (estado.includes('MALO')) claseColor = 'bg-danger text-white';

            return `
                <tr>
                    <td class="fw-bold">${reg.folio_material}</td>
                    <td>${reg.descripcion_material_entrada}</td>
                    <td>${reg.unidad}</td>
                    <td><span class="badge ${claseColor}">${reg.estado}</span></td>
                    <td>${reg.cantidad}</td>
                    <td class="small">${reg.fecha_registro}</td>
                </tr>`;
        }).join('');
        document.getElementById('contenedor-tabla-registros').style.display = 'block';
    }
}

// *** GUARDAR EL REGISTRO ***
async function guardarEntrada(e) {
    e.preventDefault();
    const form = e.target;
    const camposBloqueados = form.querySelectorAll('input:disabled, select:disabled, input[readonly]');
    camposBloqueados.forEach(c => { c.disabled = false; c.readOnly = false; });

    const data = Object.fromEntries(new FormData(form).entries());
    const res = await MaterialesService.guardarEntrada(data);

    if (res.status === 'ok') {
        Swal.fire('Éxito', res.message, 'success');
        cargarRegistros();
        form.reset();
        document.getElementById('folio-oculto').style.display = 'block';
        form.querySelectorAll('input, select, textarea').forEach(c => {
            c.disabled = false;
            c.classList.remove('bg-light', 'is-invalid');
        });
        document.getElementById('estado-material').innerHTML = '';
        document.getElementById('folio')?.focus();
    } else {
        Swal.fire('Error', res.message, 'error');
    }
}

//** RENDERIZAR RESULTADOS MODAL **
function renderizarResultadosEnModal(materiales, contenedor) {
    if (materiales.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-secondary text-center">No se encontraron coincidencias</div>';
        return;
    }

    let html = `
        <table class="table table-sm table-hover align-middle mt-2">
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
                    <button class="btn btn-primary btn-sm btn-seleccionar-modal" data-folio="${mat.folio_material}">
                        Seleccionar
                    </button>
                </td>
            </tr>`;
    });

    html += `</tbody></table>`;
    contenedor.innerHTML = html;

    contenedor.querySelectorAll('.btn-seleccionar-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const folio = e.target.getAttribute('data-folio');
            document.getElementById('folio').value = folio;
            cargarMaterial(folio);
            const instance = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
            if (instance) instance.hide();
        });
    });
}
// ** EVENTOS **
// ** EVENTOS CORREGIDOS **
function configurarEventos() {
    const folioInput = document.getElementById('folio');
    
    //  Manejo del input de Folio (Formato y búsqueda automática)
    if (folioInput) {
        folioInput.addEventListener('input', (e) => {
            let valor = e.target.value.toUpperCase();
            valor = valor.startsWith('MA-') ? 'MA-' + valor.slice(3).replace(/[^0-9]/g, '') : 'MA-' + valor.replace(/[^0-9]/g, '');
            e.target.value = valor;
            clearTimeout(timeoutBusqueda);
            if (valor.length === 11) timeoutBusqueda = setTimeout(() => cargarMaterial(valor), 400);
        });
    }

    //  Convertir Adscripción a Mayúsculas automáticamente
    document.getElementById('adscripcion')?.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

    //  Buscador Dinámico en el Modal
    const inputModalBusqueda = document.getElementById('buscar-material-modal-entrada');
    const contenedorResultados = document.getElementById('contenedor-materiales-modal');

    if (inputModalBusqueda) {
        inputModalBusqueda.addEventListener('input', async (e) => {
            const texto = e.target.value.trim();
            if (texto.length < 2) return;
            
            // Llama al servicio (asegúrate de haber puesto el espacio en "static async buscarDinamico")
            const materiales = await MaterialesService.buscarDinamico(texto);
            renderizarResultadosEnModal(materiales, contenedorResultados);
        });
    }

    // 4. Configuración de apertura del Modal
    document.getElementById('modal-material-entrada')?.addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'exampleModalCenter',
            contenedorId: 'contenedor-materiales-modal',
            callback: (folio) => {
                document.getElementById('folio').value = folio;
                cargarMaterial(folio);
            }
        });
        if(inputModalBusqueda) {
            inputModalBusqueda.value = '';
            setTimeout(() => inputModalBusqueda.focus(), 500);
        }
    });

    // 5. Botones de Acción (Consultar y Guardar)
    document.getElementById('btn-consultar-entradas')?.addEventListener('click', cargarRegistros);
    document.getElementById('form-entrada-material')?.addEventListener('submit', guardarEntrada);
    
    // 6. BOTÓN LIMPIAR
    document.getElementById('btn-limpiar-entrada')?.addEventListener('click', () => {
        // Resetear valores del formulario
        document.getElementById('form-entrada-material').reset();
        
        //  OCULTAR LA TABLA DE CONSULTA
        const contenedorTabla = document.getElementById('contenedor-tabla-registros');
        if (contenedorTabla) {
            contenedorTabla.style.display = 'none';
        }

        //  Restablecer alertas y visibilidad
        document.getElementById('folio-oculto').style.display = 'block';
        document.getElementById('estado-material').innerHTML = '';
        document.getElementById('folio')?.classList.remove('is-invalid');
        
        // HABILITAR TODOS LOS CAMPOS Y QUITAR EL GRIS (bg-light)
        const camposALimpiar = ['unidad', 'estado', 'id_categoria', 'descripcion', 'adscripcion', 'cantidad'];
        camposALimpiar.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.disabled = false;
                el.readOnly = false;
                el.classList.remove('bg-light');
            }
        });

        // Regresar el foco al folio para nueva captura
        document.getElementById('folio')?.focus();
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventos();
});