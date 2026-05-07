import { MaterialesService } from './materialesService.js';

export const ModalService = {
    async abrir({ modalId, contenedorId, callback, datosPrecargados = null }) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;

        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();

        let materiales = datosPrecargados;

        if (!materiales) {
            const data = await MaterialesService.obtenerMateriales();
            materiales = data.datos || [];
        }

        this.render(materiales, contenedorId, callback, modalId);
    },

    render(materiales, contenedorId, callback, modalId) {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;

        // Limpiar contenedor antes de renderizar
        contenedor.innerHTML = '';

        if (materiales.length === 0) {
            contenedor.innerHTML = '<div class="alert alert-info text-center">No se encontraron materiales.</div>';
            return;
        }

        // Crear la tabla con el diseño de tu captura
        const table = document.createElement('table');
        table.className = 'table table-hover align-middle mt-2';
        table.innerHTML = `
            <thead class="table-dark">
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

        contenedor.appendChild(table);

        // Eventos de botones
        contenedor.querySelectorAll('.btn-seleccionar').forEach(btn => {
            btn.onclick = () => {
                callback(btn.dataset.folio);
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById(modalId));
                if (modalInstance) modalInstance.hide();
            };
        });
    }
};