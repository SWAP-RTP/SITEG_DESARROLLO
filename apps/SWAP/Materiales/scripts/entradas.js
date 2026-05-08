import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

// ** VARIABLE DE CONTROL **
let timeoutBusqueda = null;


//******* AUTOCOMPLETAR FORMULARIO ********************
async function cargarMaterial(folio) {
    const resultado = await MaterialesService.buscarPorFolio(folio);

    // Referencias reutilizables
    const inputFolio = document.getElementById('folio');
    const estadoMaterial = document.getElementById('estado-material');

    // Si el folio existe
    if (resultado.status === 'ok' && resultado.datos) {

        // quitar alerta visual
        inputFolio.classList.remove('is-invalid');
        estadoMaterial.innerHTML = '';

        const material = resultado.datos;

        document.getElementById('descripcion').value =
            material.descripcion_material ?? '';

        document.getElementById('unidad').value =
            material.id_unidad_material ?? '';

        document.getElementById('estado').value =
            material.id_estado_material ?? '';

        document.getElementById('id_categoria').value =
            material.id_categoria_material ?? '';

        document.getElementById('adscripcion').value =
            material.adscripcion_modulo ?? '';

        // Bloquear campos
        document.getElementById('descripcion').disabled = true;
        document.getElementById('unidad').disabled = true;
        document.getElementById('estado').disabled = true;
        document.getElementById('id_categoria').disabled = true;
        document.getElementById('adscripcion').disabled = true;

        document.getElementById('cantidad').focus();

    } else {

        // Si NO existe → generar nuevo folio
        const nuevoFolio = await MaterialesService.generarFolio();

        if (nuevoFolio.status === 'ok') {
            inputFolio.value = nuevoFolio.folio;
        }

        // Mostrar alerta visual
        inputFolio.classList.add('is-invalid');

        estadoMaterial.innerHTML = `
            <small class="text-danger">
                Folio no encontrado. Se va a generar automáticamente uno nuevo.
                Llene los campos para registrar este nuevo material.
            </small>
        `;

        // Desbloquear campos
        document.getElementById('descripcion').disabled = false;
        document.getElementById('unidad').disabled = false;
        document.getElementById('estado').disabled = false;
        document.getElementById('id_categoria').disabled = false;
        document.getElementById('adscripcion').disabled = false;
    }
}


// ****CARGAR LA TABLA DE REGISTROS DE ENTRADAS **************
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


// *** GUARDAR EL REGISTRO DE ENTRADA **************
async function guardarEntrada(e) {
    e.preventDefault();

    const form = e.target;

    const camposBloqueados = form.querySelectorAll(
        'input:disabled, select:disabled, input[readonly]'
    );

    camposBloqueados.forEach(c => {
        c.disabled = false;
        c.readOnly = false;
    });

    const data = Object.fromEntries(
        new FormData(form).entries()
    );

    const res = await MaterialesService.guardarEntrada(data);

    if (res.status === 'ok') {
        Swal.fire('Éxito', res.message, 'success');

        form.reset();

        const todosLosCampos = form.querySelectorAll(
            'input, select, textarea'
        );

        todosLosCampos.forEach(campo => {
            campo.disabled = false;
            campo.readOnly = false;
            campo.classList.remove('bg-light');
            campo.classList.remove('is-invalid');
        });

        // limpiar mensaje del folio
        document.getElementById('estado-material').innerHTML = '';

        if (typeof cargarRegistros === 'function') {
            cargarRegistros();
        }

        document.getElementById('folio')?.focus();

    } else {
        Swal.fire('Error', res.message, 'error');
    }
}


// ** EVENTOS **
function configurarEventos() {

    // ** FOLIO: formateo automático MA- y disparo de búsqueda **
    const folioInput = document.getElementById('folio');

    if (folioInput) {
        folioInput.addEventListener('input', (e) => {
            let valor = e.target.value.toUpperCase();

            valor = valor.startsWith('MA-')
                ? 'MA-' + valor.slice(3).replace(/[^0-9]/g, '')
                : 'MA-' + valor.replace(/[^0-9]/g, '');

            e.target.value = valor;

            // quitar alerta mientras vuelvo a escribir
            e.target.classList.remove('is-invalid');
            document.getElementById('estado-material').innerHTML = '';

            clearTimeout(timeoutBusqueda);

            if (valor.length === 11) {
                timeoutBusqueda = setTimeout(
                    () => cargarMaterial(valor),
                    400
                );
            }
        });
    }
    const adscripcionInput = document.getElementById('adscripcion');

    if (adscripcionInput) {
        adscripcionInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }


    //** EL BOTÓN DE LUPA DEL MODAL**
    document.getElementById('modal-material-entrada')
        ?.addEventListener('click', () => {
            ModalService.abrir({
                modalId: 'exampleModalCenter',
                contenedorId: 'contenedor-materiales-modal',
                callback: (folio) => {
                    document.getElementById('folio').value = folio;
                    cargarMaterial(folio);
                }
            });
        });


    // ** CONSULTAR **
    document.getElementById('btn-consultar-entradas')
        ?.addEventListener('click', cargarRegistros);


    // ** GUARDAR **
    document.getElementById('form-entrada-material')
        ?.addEventListener('submit', guardarEntrada);


    // ** LIMPIAR **
    document.getElementById('btn-limpiar-entrada')
        ?.addEventListener('click', () => {
            document.getElementById('form-entrada-material').reset();

            document.getElementById('contenedor-tabla-registros').style.display = 'none';

            document.getElementById('unidad').disabled = false;
            document.getElementById('estado').disabled = false;
            document.getElementById('id_categoria').disabled = false;
            document.getElementById('descripcion').disabled = false;
            document.getElementById('adscripcion').disabled = false;

            document.getElementById('folio').classList.remove('is-invalid');
            document.getElementById('estado-material').innerHTML = '';
        });
}


//** ARRANCAR TODO AL CARGAR LA PÁGINA **
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventos();
});