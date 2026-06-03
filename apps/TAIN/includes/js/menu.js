function opciones_menu() {
    const opciones = [
        { 
            nombre: "Trabajadores", 
            icono: "fa-users-line", 
            link: "/app-tain/trabajadores/trabajadores.html" 
        },
        { 
            nombre: "Parque Vehicular", 
            icono: "fa-bus-alt", 
            link: "/app-tain/parque_vehicular/parque_vehicular.html" 
        },
        { 
            nombre: "Rutas", 
            icono: "fa-route", 
            link: "/app-tain/Rutas/rutas.html" 
        },
        // { 
        //     nombre: "Sefis", 
        //     icono: "fa-bus", 
        //     link: "#" 
        // },
        { 
            nombre: "Accidentes", 
            icono: "fa-car-crash", 
            link: "/app-tain/accidentes/accidentes.html" 
        },
        { 
            nombre: "Mantenimiento", 
            icono: "fa-screwdriver-wrench", 
            link: "/app-tain/mantenimiento/mantenimiento.html" 
        },
        { 
            nombre: "Recaudación", 
            icono: "fa-money-check-alt", 
            link: "#" 
        },
        { 
            nombre: "Salir", 
            icono: "fa-person-walking-dashed-line-arrow-right", 
            link: "/auth/logout.php",
            clase: "nav-link" 
        }
    ];

    const $container = $('#menu-dinamico');
    $container.empty(); // Limpiamos el contenedor antes de pintar

    // 2. Iteramos sobre los módulos para crear el HTML
    opciones.forEach((mod, index) => {
        let itemMenu = `
            <li class="menu-item-animado" style="animation-delay: ${index * 0.1}s">
                <a class="${mod.clase || ''}" href="${mod.link}">
                    <i class="fa-solid ${mod.icono}"></i>
                    <span>${mod.nombre}</span>
                </a>
            </li>
        `;
        $container.append(itemMenu);
    });
}

// CLICK CUANDO EL MENU ES RESPONSIVO
$(document).on("click", ".hamburger", function () {
    $(this).toggleClass("active");
    $(".sidebar").toggleClass("active");
});

document.addEventListener("DOMContentLoaded", function () {
    opciones_menu();
});