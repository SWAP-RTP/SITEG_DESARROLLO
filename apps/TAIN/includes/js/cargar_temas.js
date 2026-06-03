function cargarTema() {
    const themeSwitch = document.getElementById('switchCheckDefault');
    const darkThemeLink = document.querySelector('.theme-dark');
    const lightThemeLink = document.querySelector('.theme-light');
    const main = document.querySelector('main');

    // FUNCIÓN PARA RECARGAR TODAS LAS GRÁFICAS
    const recargarGraficas = () => {
        if (Array.isArray(window.graficasRegistradas)) {
            window.graficasRegistradas.forEach(g => {
                try {
                    if (g && typeof g.render === 'function') {
                        g.render();
                    }
                } catch (e) {
                    console.warn('Error en gráfica:', e);
                }
            });
        }
    };

    const aplicarEstilos = (isLight) => {
        // Intercambiar CSS
        if (darkThemeLink && lightThemeLink) {
            darkThemeLink.disabled = isLight;
            lightThemeLink.disabled = !isLight;
        }

        // Aplicar clase global
        if (main) {
            main.classList.remove('dark', 'light');
            main.classList.add(isLight ? 'light' : 'dark');
        }

        // esperar a que el DOM se actualice
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                recargarGraficas();
            });
        });
    };

    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isLightMode = (savedTheme === 'light');

    aplicarEstilos(isLightMode);

    if (themeSwitch) {
        themeSwitch.checked = isLightMode;

        themeSwitch.addEventListener('change', () => {
            const nuevoEstado = themeSwitch.checked;

            document.body.classList.add('tema-transicion');

            aplicarEstilos(nuevoEstado);
            localStorage.setItem('theme', nuevoEstado ? 'light' : 'dark');

            setTimeout(() => {
                document.body.classList.remove('tema-transicion');
            }, 400);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarTema();
});