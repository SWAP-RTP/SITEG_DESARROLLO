function cargarTema() {
    const themeSwitch = document.getElementById('switchCheckDefault');
    const darkThemeLink = document.querySelector('.theme-dark');
    const lightThemeLink = document.querySelector('.theme-light');

    // Función para habilitar/deshabilitar los archivos CSS
    const aplicarEstilos = (isLight) => {
        if (darkThemeLink && lightThemeLink) {
            darkThemeLink.disabled = isLight;
            lightThemeLink.disabled = !isLight;
        }
    };

    // 1. LEER PREFERENCIA (Funciona en Index y Login)
    // Si no hay nada guardado, usamos 'dark' por defecto
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isLightMode = (savedTheme === 'light');

    // Aplicar inmediatamente al cargar la página
    aplicarEstilos(isLightMode);

    // 2. LOGICA DEL SWITCH (Solo si existe, ej. en el Index)
    if (themeSwitch) {
        // Sincronizar el estado visual del switch con lo guardado
        themeSwitch.checked = isLightMode;

        themeSwitch.addEventListener('change', () => {
            const nuevoEstadoLight = themeSwitch.checked;
            
            // añadir clase para transiciones suaves de color
            document.body.classList.add('tema-transicion');
            
            // Aplicar cambios
            aplicarEstilos(nuevoEstadoLight);
            
            // Guardar para la siguiente página (o el login)
            localStorage.setItem('theme', nuevoEstadoLight ? 'light' : 'dark');

            setTimeout(() => {
                document.body.classList.remove('tema-transicion');
            }, 400);
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
  cargarTema ();
});