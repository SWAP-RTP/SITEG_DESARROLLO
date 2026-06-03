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
                    <div class = "card2 text-center mb-3 p-3">
                        <h3>Total Rutas</h3>
                        <h3>${data.total}</h3>
                    </div>
            `;
            contModulos.appendChild(totalCard);

            Object.keys(data).forEach(key => {
                if (!key.startsWith('m')) return; // ignora "total"
                 
                const mod = parseInt(key.replace('m', ''));
                const totalRutas = data[key].length;

                const card = document.createElement('div');
                card.dataset.modulo = mod;
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');

                card.innerHTML = `
                        <div class="card-info card-number mb-3 modulo${mod}">
                            <div class="seccion">
                                <h4 class="text-white">Modulo ${mod}</h4>
                                <div class="value">${totalRutas}</div>
                            </div>
                        </div>
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
    if ($.fn.DataTable.isDataTable('.dataTable_generica')) {
        $('.dataTable_generica').DataTable().destroy();
    }
    const thead = document.querySelector('.dataTable_generica thead tr');

    // Limpiar por si ya tiene contenido
    thead.innerHTML = '';

    thead.innerHTML = `
        <th>Ruta</th>
        <th>Origen</th>
        <th>Destino</th>
    `;

    const key = 'm' + modNum;
    const rutas = data[key] || [];

    $('.tituloDataTable').html(`Rutas del Modulo ${modNum}`);

    $('.dataTable_generica').DataTable({
        data: rutas, 
        responsive: true,
        scrollX: true,
        autoWidth: false,

        columns: [
            { data: "ruta", className: "text-center", width: "8%" },
            { data: "origen", className: "text-center", width: "20%" },
            { data: "destino", className: "text-center", width: "20%" },
        ],
        language: {
            url: "/lib/datatables.net-1.13.6/es-ES.json",
        }
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