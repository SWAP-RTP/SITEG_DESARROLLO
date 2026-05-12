import {consulta_usuarios} from './usuarios.js';
import {consulta_sistemas, mayusculas} from './sistemas.js';
import {consulta_modulos_swap} from './modulos_sistema.js';

//Ocultamos contenido de forma dinamica con el hidden y al seleccionarlo que remueva el hidden
document.querySelectorAll('.nav-link[data-tab]').forEach(tab => {
    tab.addEventListener('click', function (e) {
        e.preventDefault();

        //Quitar la clase 'active' de todos los enlaces y ponerla en el clicado
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');

        //Obtener el nombre del tab (ej: "usuarios", "sistemas")
        const tabTarget = this.getAttribute('data-tab');

        // Buscamos todos los divs dentro de card-body que tengan un ID que empiece con "contenido-"
        document.querySelectorAll('.card-body > div').forEach(content => {
            content.setAttribute('hidden', true);
        });

        //Mostrar el contenedor correspondiente
        const targetDiv = document.getElementById(`contenido-${tabTarget}`);
        if (targetDiv) {
            targetDiv.removeAttribute('hidden');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    consulta_usuarios();
    consulta_sistemas();
    mayusculas();

    consulta_modulos_swap();
});