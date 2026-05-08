//******* 1. Importaciones *******
import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

// ** variable de control **
let timeoutBusqueda = null;


//*********************AUTOCOMPLETAR FORMULARIO CON DATOS DEL MATERIAL*********************************
async function cargarMaterialSalida(folio) {
    const result = await MaterialesService.buscarPorFolio(folio);

    const inputFolio = document.getElementById('folio_salida');
    const estadoMaterial = document.getElementById('estado-material-salida');

    if (result.status === 'ok' && result.datos) {

        // Si existe → quitar alerta roja
        inputFolio.classList.remove('is-invalid');
        estadoMaterial.innerHTML = '';

        const mat = result.datos;

        // Llenar formulario
        document.getElementById('descripcion_salida').value = mat.descripcion_material;
        document.getElementById('unidad_salida').value = mat.id_unidad_material;
        document.getElementById('estado_salida').value = mat.id_estado_material;
        document.getElementById('categoria_salida').value = mat.id_categoria_material;
        document.getElementById('adscripcion_salida').value = mat.adscripcion_modulo;

        // Bloquear campos y poner gris
        const bloqueoGris = [
            'descripcion_salida',
            'unidad_salida',
            'estado_salida',
            'categoria_salida',
            'adscripcion_salida'
        ];

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

        // Validar stock
        if (parseInt(mat.stock_actual) <= 0) {
            Swal.fire(
                'Aviso',
                'Material sin stock actual.',
                'warning'
            );
        }

        // Enviar foco a cantidad
        document.getElementById('cantidad_salida').focus();

    } else {

        // Si NO existe → mostrar alerta roja
        inputFolio.classList.add('is-invalid');

        estadoMaterial.innerHTML = `
            <small class="text-danger">
                El código no está registrado. Verifique el folio.
            </small>
        `;
    }
}


//*********************CARGAR TABLA DE REGISTROS*********************************
async function cargarRegistrosSalida() {
    const data = await MaterialesService.consultarSalidas();

    if (data.status === 'ok') {
        const tbody = document.getElementById('tabla-salidas');

        tbody.innerHTML = data.datos.map(reg => `
            <tr>
                <td class="fw-bold">${reg.folio_material}</td>
                <td>${reg.descripcion_material_salida}</td>
                <td>${reg.unidad}</td>
                <td>
                    <span class="badge bg-warning text-dark">
                        ${reg.estado}
                    </span>
                </td>
                <td>${reg.cantidad}</td>
                <td class="small">${reg.fecha_registro}</td>
            </tr>
        `).join('');

        document.getElementById(
            'contenedor-tabla-salidas'
        ).style.display = 'block';
    }
}

//*************** GUARDAR SALIDA***************************************
async function guardarSalida(e) {
    e.preventDefault();

    const data = {
        folio: document.getElementById('folio_salida').value,
        descripcion: document.getElementById('descripcion_salida').value,
        unidad: document.getElementById('unidad_salida').value,
        estado: document.getElementById('estado_salida').value,
        id_categoria: document.getElementById('categoria_salida').value,
        adscripcion: document.getElementById('adscripcion_salida').value,
        cantidad: document.getElementById('cantidad_salida').value
    };

    // Validación mínima
    if (!data.folio || !data.cantidad) {
        Swal.fire(
            'Atención',
            'Datos insuficientes',
            'warning'
        );
        return;
    }

    const res = await MaterialesService.guardarSalida(data);

    if (res.status === 'ok') {
        Swal.fire(
            'Éxito',
            res.message,
            'success'
        );

        // Resetear formulario
        e.target.reset();

        // Quitar borde rojo
        document.getElementById('folio_salida')
            .classList.remove('is-invalid');

        // Borrar mensaje rojo
        document.getElementById(
            'estado-material-salida'
        ).innerHTML = '';

        // Desbloquear campos
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
                el.readOnly = false;
                el.disabled = false;
                el.classList.remove('bg-light');
            }
        });

        // Actualizar tabla
        cargarRegistrosSalida();

    } else {
        Swal.fire(
            'Error',
            res.message,
            'error'
        );
    }
}



//**************** CONFIGURAR EVENTOS**************************************
function configurarEventosSalida() {

    //******** INPUT DEL FOLIO ********
    const folioInput = document.getElementById('folio_salida');

    if (folioInput) {
        folioInput.maxLength = 11;

        folioInput.addEventListener('input', (e) => {
            let valor = e.target.value.toUpperCase();

            // Formato automático MA-00000001
            if (!valor.startsWith('MA-')) {
                valor = 'MA-' + valor.replace(/[^0-9]/g, '');
            } else {
                valor = 'MA-' + valor
                    .slice(3)
                    .replace(/[^0-9]/g, '');
            }

            e.target.value = valor;

            // Quitar alerta roja mientras escribe
            e.target.classList.remove('is-invalid');

            document.getElementById(
                'estado-material-salida'
            ).innerHTML = '';

            clearTimeout(timeoutBusqueda);

            if (valor.length === 11) {
                timeoutBusqueda = setTimeout(
                    () => cargarMaterialSalida(valor),
                    400
                );
            }
        });
    }


    //******** BOTÓN DEL MODAL ********
    document.getElementById('btn-modal-salida')
        ?.addEventListener('click', () => {

            ModalService.abrir({
                modalId: 'modalMaterialSalida',
                contenedorId:
                    'contenedor-materiales-modal-salida',

                callback: (folio) => {
                    document.getElementById(
                        'folio_salida'
                    ).value = folio;

                    cargarMaterialSalida(folio);
                }
            });
        });


    //******** CONSULTAR ********
    document.getElementById(
        'btn-consultar-salidas'
    )?.addEventListener(
        'click',
        () => cargarRegistrosSalida()
    );


    //******** GUARDAR ********
    document.getElementById('form-salida-material')?.addEventListener('submit',guardarSalida);
    //******** LIMPIAR ********
    document.getElementById( 'btn-limpiar-salida' )?.addEventListener('click', () => {
        // Resetear formulario
        document.getElementById('form-salida-material').reset();
        // Ocultar tabla
        document.getElementById('contenedor-tabla-salidas').style.display = 'none';
        // Quitar borde rojo
        document.getElementById('folio_salida').classList.remove('is-invalid');
        // Borrar mensaje rojo
        document.getElementById('estado-material-salida').innerHTML = '';
      // Desbloquear campos
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
                el.readOnly = false;
                el.disabled = false;
                el.classList.remove('bg-light');
            }
        });
    });
}




//************ES LA CARGA INICIAL******************************************************
document.addEventListener(
    'DOMContentLoaded',
    async () => {
        await cargarCatalogos();
        configurarEventosSalida();
    }
);