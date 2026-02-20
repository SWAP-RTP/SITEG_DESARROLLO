function construirListaModulos() {
    const contModulos = document.getElementById('listaModulos');
    contModulos.innerHTML = '';

    $.ajax({
        url: 'query_sql/get_rutas.php',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            // console.log(data);
            const totalCard = document.createElement('total_rutas');
            totalCard.innerHTML = `
                    <div class = "card3 text-center p-3">
                        <h3>Total Rutas</h3>
                        <h3>${data.total}</h3>
                    </div>
            `;
            contModulos.appendChild(totalCard);

            const colores = {
                1: 'mod-color-1',
                2: 'mod-color-2',
                3: 'mod-color-3',
                4: 'mod-color-4',
                5: 'mod-color-5',
                6: 'mod-color-6',
                7: 'mod-color-7'
            };

            Object.keys(data).forEach(key => {
                if (!key.startsWith('m')) return; // ignora "total"
                 
                const mod = parseInt(key.replace('m', ''));
                const totalRutas = data[key].length;

                const card = document.createElement('div');
                card.className = `mod-card btn-modulo ${colores[mod] || 'mod-color-default'}`;
                card.dataset.modulo = mod;
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');

                card.innerHTML = `
                    <div class="mod-card-title">Modulo ${mod}</div>
                    <div class="mod-card-number">${totalRutas}</div>
                `;

                // PASAMOS data A LA FUNCION
                card.addEventListener('click', () => {
                    mostrarRutasDeModulo(mod, data);
                });

                contModulos.appendChild(card);
            });
            // por defecto salen las rutas del modulo 1 al cargar la pagina
            if (data.m1 && data.m1.length) { mostrarRutasDeModulo(1, data);}
        }
    });
}

function mostrarRutasDeModulo(modNum, data) {
    const tbodyRutas = document.getElementById('tbodyRutasModulo');

    const key = 'm' + modNum;
    const rutas = data[key] || [];

    tituloModuloSel.textContent = `Rutas del Modulo ${modNum}`;
    tbodyRutas.innerHTML = '';

    if (!rutas.length) {
        mensajeSinDatos?.classList.remove('d-none');
        return;
    }

    mensajeSinDatos?.classList.add('d-none');

    rutas.forEach((r, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${r.ruta}</td>
            <td>${r.origen}</td>
            <td>${r.destino}</td>
        `;
        tbodyRutas.appendChild(tr);
    });
}

function actualizarTodo() {
    construirListaModulos();
}

document.addEventListener('DOMContentLoaded', () => {
    //esta funcion se ejecutara una vez todos los dias 
    actualizarTodo();
    setInterval(function() {
        // console.log("Actualizando datos dinámicamente...");
        actualizarTodo();
    }, 24 * 60 * 60 * 1000); // 24 horas
});