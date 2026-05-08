//**SE VA ENCARGAR DE ABRIR EL MODAL Y RENDERIZAR LA TABLA DINAMICA **
import { MaterialesService } from './materialesService.js';

//**VOY IMPORTAR EL OBJETO **
export const ModalService = {
    //Inserto el metodo de abrir para poder abrir el modal y obtener sus materiales
    async abrir({ modalId, contenedorId, callback, datosPrecargados = null }) { //uso una desestrucutración de objetos para hacer mas compacto el codigo
        //busco el modal en el HTML, sino exitiera retorno y termina la función
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;
        /**obtengo la instancia del Bootstrap
         * si existe el modal lo vuelvo a reutilizar, sino, lo crea**/
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        //aqui ya veo si está el modal
        modal.show();

        let materiales = datosPrecargados;
        /*creo la condición para mandar a llamar los datos desde el Back, y sino hay datos 
        precargados los mando a  llamar**/
        if (!materiales) {
            const data = await MaterialesService.obtenerMateriales();
            //voy a guardar los datos en un arreglo
            materiales = data.datos || [];
        }

        this.render(materiales, contenedorId, callback, modalId);
    },
    //creo la tabla, pinto los materiales y agrego los eventos correspondientes
    render(materiales, contenedorId, callback, modalId) {
        //busco el contenedor donde va ir la tabla
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;

        // Limpiar contenedor antes de renderizar para que no duplique tablas
        contenedor.innerHTML = '';
        //hago una validacion por sino existe materiales
        if (materiales.length === 0) {
            contenedor.innerHTML = '<div class="alert alert-info text-center">No se encontraron materiales.</div>';
            return;
        }

        /**
          * Se crea dinámicamente la estructura HTML de la tabla.
          * El map genera un arreglo de filas HTML
          * y join('') las une en un solo string HTML.
          */
        const table = document.createElement('table');
        table.className = 'table table-hover align-middle mt-2';
        table.innerHTML = `
            <thead class="">
                <tr>
                    <th class="ps-3">Folio</th>
                    <th>Descripción</th>
                    <th class="text-center">Acción</th>
                </tr>
            </thead>
            <tbody>
                ${materiales.map(m => ` 
                    <tr>
                        <td class="ps-3 fw-bold">${m.folio_material}</td>
                        <td class="text-uppercase small" style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${m.descripcion_material}
                        </td>
                        <td class="text-center">
                            <button class="btn btn-primary btn-sm px-3 btn-seleccionar" data-folio="${m.folio_material}">
                                Seleccionar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        //asi se puede mostrar lo que se hace en pantalla (se visualiza la tabla)
        contenedor.appendChild(table);

        // Eventos de botones
        contenedor.querySelectorAll('.btn-seleccionar').forEach(btn => {
            btn.onclick = () => {
                //utilizo el CALLBACK para tener primero la instruccion, y luego ver si la ejecuto para que sea mas felxible la funcion
                callback(btn.dataset.folio);
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById(modalId));
                if (modalInstance) modalInstance.hide();
            };
        });
    }
};