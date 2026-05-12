const toast = {
    config: {
        success: { bg: 'rgb(61,199,99)', icon: 'fas fa-check-circle' },
        error:   { bg: 'rgb(216, 41, 41)', icon: 'fas fa-times-circle' },
        warning: { bg: 'rgb(241, 153, 36)', icon: 'fas fa-exclamation-triangle' },
        info:    { bg: 'rgb(29, 49, 226)', icon: 'fas fa-info-circle' }
    },

    open: function(type, message) {
        const settings = this.config[type] || this.config.info;
        const container = document.querySelector('.toast-container');
        
        // Crear el elemento del Toast
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true" style="background-color: ${settings.bg}">
                <div class="d-flex mt-4 mb-4">
                    <div class="toast-body d-flex align-items-center">
                        <i class="${settings.icon} me-2 fs-5"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`;

        // Insertar en el DOM
        container.insertAdjacentHTML('beforeend', toastHTML);

        // Inicializar y mostrar con Bootstrap
        const toastElement = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastElement, { delay: 4000 });
        bsToast.show();

        // Limpiar el DOM después de que se oculte para no llenar la memoria
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
};

export const ToastBootstrap = {
    success: (msg) => toast.open('success', msg),
    error:   (msg) => toast.open('error', msg),
    warning: (msg) => toast.open('warning', msg),
    info:    (msg) => toast.open('info', msg)
};