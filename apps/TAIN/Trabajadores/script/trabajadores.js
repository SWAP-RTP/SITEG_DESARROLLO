import { cards_modulos } from './cards_modulos.js';
import { grafica_trabajadores } from './grafica.js';
/************************************************* * PANELES Y DESPLIEGUE
 *************************************************/
const panels = {
    activos: {
        card: document.getElementById('card_trabajadores_activos'),
        panel: document.getElementById('trabajadores-activos')
    },
    inactivos: {
        card: document.getElementById('card_trabajadores_inactivos'),
        panel: document.getElementById('trabajadores-inactivos')
    }
};

function togglePanel(panelToOpen, panelToClose) {
    const isOpen = panelToOpen.panel.classList.contains('mostrar');

    if (panelToClose.panel.classList.contains('mostrar')) {
        panelToClose.panel.classList.remove('mostrar');
        setTimeout(() => { panelToClose.panel.setAttribute('hidden', 'true'); }, 500);
    }

    if (isOpen) {
        panelToOpen.panel.classList.remove('mostrar');
        setTimeout(() => { panelToOpen.panel.setAttribute('hidden', 'true'); }, 500);
    } else {
        panelToOpen.panel.removeAttribute('hidden');
        setTimeout(() => { panelToOpen.panel.classList.add('mostrar'); }, 10);
    }
}

// Event Listeners para paneles (verificar que los elementos existan)
if (panels.activos.card) {
    panels.activos.card.addEventListener('click', () => togglePanel(panels.activos, panels.inactivos));
}
if (panels.inactivos.card) {
    panels.inactivos.card.addEventListener('click', () => togglePanel(panels.inactivos, panels.activos));
}

/************************************************* PINTAR DATOS EN LOS CARDS Y  *************************************************/
const url = 'query_sql/total_trabajadores.php';

async function fetchData() {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error de respuesta ');

        const data = await response.json();

        // Asignamos valores desde el JSON 
        const totalActivos = document.getElementById('total-activos');
        const totalInactivos = document.getElementById('total-inactivos');
        //TRABAJADORES ACTIVOS POR CATEGORÍA
        const totalOperadores = document.getElementById('total-operadores');
        const totalMantenimiento = document.getElementById('total-mantenimiento');
        const totalFuncionariosOficinas = document.getElementById('total-funcionarios-oficinas');
        const totalFuncionariosMod = document.getElementById('total-funcionarios-modulos');
        const totalConfianzaOficinas = document.getElementById('total-confianza-oficinas');
        const totalConfianzaModulos = document.getElementById('total-confianza-modulos');
        //TRABAJADORES INACTIVOS POR CATEGORÍA 
        const totalOperadoresin = document.getElementById('total-operadores-inactivos');
        const totalMantenimientoin = document.getElementById('total-mantenimiento-inactivos');
        const totalFuncionariosOficinasin = document.getElementById('total-funcionarios-oficinas-inactivos');
        const totalFuncionariosModin = document.getElementById('total-funcionarios-modulos-inactivos');
        const totalConfianzaOficinasin = document.getElementById('total-confianza-oficinas-inactivos');
        const totalConfianzaModulosin = document.getElementById('total-confianza-modulos-inactivos');

        //TOTAL TRABAJADORES
        if (totalActivos) totalActivos.innerText = data.general.totaltrabact || 0;
        if (totalInactivos) totalInactivos.innerText = data.general.totaltrabinact || 0;
        //TRABAJADORES ACTIVOS POR CATEGORÍA
        if (totalOperadores) totalOperadores.innerText = data.general.totaloperadoresact || 0;
        if (totalMantenimiento) totalMantenimiento.innerText = data.general.totalmantenimientoact || 0;
        if (totalFuncionariosOficinas) totalFuncionariosOficinas.innerText = data.general.totalfuncionariosoficinasact || 0;
        if (totalFuncionariosMod) totalFuncionariosMod.innerText = data.general.totalfuncionariosmodulosact || 0;
        if (totalConfianzaOficinas) totalConfianzaOficinas.innerText = data.general.totalconfianzaoficinaact || 0;
        if (totalConfianzaModulos) totalConfianzaModulos.innerText = data.general.totalconfianzamodulosact || 0;
        //TRABAJADORES INACTIVOS POR CATEGORÍA
        if (totalOperadoresin) totalOperadoresin.innerText = data.general.totaloperadoresinact || 0;
        if (totalMantenimientoin) totalMantenimientoin.innerText = data.general.totalmantenimientoinact || 0;
        if (totalFuncionariosOficinasin) totalFuncionariosOficinasin.innerText = data.general.totalfuncionariosoficinasinact || 0;
        if (totalFuncionariosModin) totalFuncionariosModin.innerText = data.general.totalfuncionariosmodulosinact || 0;
        if (totalConfianzaOficinasin) totalConfianzaOficinasin.innerText = data.general.totalconfianzaoficinainact || 0;
        if (totalConfianzaModulosin) totalConfianzaModulosin.innerText = data.general.totalconfianzamodulosinact || 0;
        //MODULOS
        if (data.detalle) {
            Object.entries(data.detalle).forEach(([moduloId, valores]) => {
                const card = document.getElementById('val_modulo' + moduloId);
                if (card) card.innerText = valores.totaltrabact || 0;
                if (moduloId === '0') {
                    const cardOC = document.getElementById('val_oc');
                    if (cardOC) cardOC.innerText = valores.totaltrabact || 0;
                }
            });
        }

        grafica_trabajadores(data);
        // LANZAR ANIMACIÓN después de que el DOM tiene los números reales
        iniciarAnimacionContadores();

    } catch (error) {
        console.error('Hubo un problema con la petición Fetch:', error);
        const errElem = document.getElementById('total-trabajadores');
        if (errElem) errElem.innerText = 'Error';
    }
}

function iniciarAnimacionContadores() {
    const counters = document.querySelectorAll('.value');
    counters.forEach(counter => {
        // Obtenemos el valor que acabamos de "pintar" con el fetch
        let finalValue = parseInt(counter.innerText.replace(/,/g, '')) || 0;
        let duration = 2000; // 2 segundos de animación
        let start = 0;
        let increment = finalValue / (duration / 30);

        if (finalValue === 0) return;

        let interval = setInterval(() => {
            start += increment;
            if (start >= finalValue) {
                start = finalValue;
                clearInterval(interval);
            }
            counter.innerText = Math.floor(start).toLocaleString('en-US');
        }, 30);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // 1. Cargar Datos y disparar animaciones
    fetchData();
    cards_modulos();


    // 2. Animación de aparición de cards (opacidad/delay)
    const cards = document.querySelectorAll(".card-number");
    cards.forEach((card, i) => {
        card.style.animationDelay = `${i * 0.25}s`;
    });

    // 3. Manejo de Formulario y Gráficas
    const form = document.getElementById("formFiltro");
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.classList.add("was-validated");
            } else {
                const body = document.getElementById("contenedor-graficas-cards");
                const grafBar = document.getElementById('container-modulos-espec');
                if (body) body.setAttribute('hidden', '');
                if (grafBar) grafBar.removeAttribute('hidden');

                // Aquí iría la lógica para actualizar la gráfica bar con los datos del form
                console.log("Filtrando...");
            }
        });
    }
});