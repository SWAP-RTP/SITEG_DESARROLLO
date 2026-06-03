//**SE VA ENCARGAR DE ABRIR EL MODAL Y RENDERIZAR LA TABLA DINAMICA **
import { MaterialesService } from './materialesService.js';

// ** VARIABLES LOCALES DE PAGINACIÓN PARA EL MODAL **
let materialesCompletosModal = []; 
let paginaActualModal = 1;        
const registrosPorPaginaModal = 5; 

//**VOY IMPORTAR EL OBJETO **
export const ModalService = {
    //Inserto el metodo de abrir para poder abrir el modal y obtener sus materiales
    async abrir({ modalId, contenedorId, callback, datosPrecargados = null }) { 
        try {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.warn(`[ModalService]: No se encontró el modal con ID '${modalId}' en el DOM.`);
                return;
            }

            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.show();

            // CADA VEZ QUE SE ABRE EL MODAL: Reiniciamos la navegación a la página 1
            paginaActualModal = 1;

            let materiales = datosPrecargados;
            if (!materiales) {
                const data = await MaterialesService.obtenerMateriales();
                materiales = data.datos || [];
            }

            // Guardamos el arreglo completo en la variable local del servicio
            materialesCompletosModal = materiales;

            this.render(materialesCompletosModal, contenedorId, callback, modalId);
        } catch (error) {
            console.error("[Error Crítico - ModalService.abrir]:", error);
        }
    },

    //creo la tabla, pinto los materiales y agrego los eventos correspondientes
    render(materiales, contenedorId, callback, modalId) {
        try {
            const contenedor = document.getElementById(contenedorId);
            if (!contenedor) {
                console.warn(`[ModalService]: No se encontró el contenedor con ID '${contenedorId}' en el DOM.`);
                return;
            }

            contenedor.innerHTML = '';
            
            // Hacemos una validación por si no existen materiales
            if ((materiales || []).length === 0) {
                contenedor.innerHTML = '<div class="alert alert-info text-center">No se encontraron materiales.</div>';
                return;
            }

            // 1. SEGMENTACIÓN: Cortamos el array según la página activa del modal
            const inicio = (paginaActualModal - 1) * registrosPorPaginaModal;
            const fin = inicio + registrosPorPaginaModal;
            const datosParaVer = materiales.slice(inicio, fin);

            // 2. CREACIÓN DE LA TABLA DINÁMICA (Solo con los 5 registros correspondientes)
            const table = document.createElement('table');
            table.className = 'table table-sm table-hover align-middle mt-2';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th class="ps-3">Folio</th>
                        <th>Descripción</th>
                        <th class="text-center">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${datosParaVer.map(m => ` 
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
            contenedor.appendChild(table);

            // 3. CREACIÓN DE LOS BOTONES DE PAGINACIÓN DE BOOTSTRAP
            const totalPaginas = Math.ceil(materiales.length / registrosPorPaginaModal);
            
            if (totalPaginas > 1) {
                const nav = document.createElement('nav');
                nav.setAttribute('aria-label', 'Paginación modal');
                nav.className = 'mt-3';
                
                let htmlPaginacion = `
                    <ul class="pagination pagination-sm justify-content-center mb-2">
                        <li class="page-item ${paginaActualModal === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-pag-modal="${paginaActualModal - 1}">Anterior</a>
                        </li>`;

                for (let i = 1; i <= totalPaginas; i++) {
                    htmlPaginacion += `
                        <li class="page-item ${i === paginaActualModal ? 'active' : ''}">
                            <a class="page-link" href="#" data-pag-modal="${i}">${i}</a>
                        </li>`;
                }

                htmlPaginacion += `
                        <li class="page-item ${paginaActualModal === totalPaginas ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-pag-modal="${paginaActualModal + 1}">Siguiente</a>
                        </li>
                    </ul>`;
                
                nav.innerHTML = htmlPaginacion;
                contenedor.appendChild(nav);

                // Eventos de los botones de Paginación del Modal
                nav.querySelectorAll('.page-link').forEach(link => {
                    link.onclick = (e) => {
                        try {
                            e.preventDefault();
                            const nuevaPagina = parseInt(link.getAttribute('data-pag-modal'));
                            if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
                                paginaActualModal = nuevaPagina;
                                // Volvemos a renderizar pasando el array completo original
                                this.render(materiales, contenedorId, callback, modalId);
                            }
                        } catch (errPaginacion) {
                            console.error("Error en evento click de paginación del modal:", errPaginacion);
                        }
                    };
                });
            }

            // Eventos de botones "Seleccionar"
            contenedor.querySelectorAll('.btn-seleccionar').forEach(btn => {
                btn.onclick = () => {
                    try {
                        callback(btn.dataset.folio);
                        const modalTarget = document.getElementById(modalId);
                        if (modalTarget) {
                            const modalInstance = bootstrap.Modal.getInstance(modalTarget);
                            if (modalInstance) modalInstance.hide();
                        }
                    } catch (errSeleccion) {
                        console.error("Error al procesar la selección del material en el modal:", errSeleccion);
                    }
                };
            });
        } catch (error) {
            console.error("[Error Crítico - ModalService.render]:", error);
        }
    }
};
