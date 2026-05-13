export async function cargarCatalogos() {
    try {
        const res = await fetch('query_sql/catalogo_listas.php');
        
        // Verificamos si la petición HTTP fue exitosa antes de procesar el JSON
        if (!res.ok) {
            throw new Error(`Error en el servidor HTTP: ${res.status}`);
        }

        const data = await res.json();
        
        // Validamos que el objeto data exista antes de intentar leer sus propiedades
        if (data) {
            llenar('unidad', data.unidades, 'id_unidad_material', 'descripcion_unidad_material');
            llenar('estado', data.estados, 'id_estado_material', 'descripcion_estado_material');
            llenar('id_categoria', data.categorias, 'id_categoria_material', 'descripcion_categoria_material');   
            llenar('unidad_salida', data.unidades, 'id_unidad_material', 'descripcion_unidad_material');
            llenar('estado_salida', data.estados, 'id_estado_material', 'descripcion_estado_material');
            llenar('categoria_salida', data.categorias, 'id_categoria_material', 'descripcion_categoria_material');  
        } else {
            console.warn("[catalogosService]: El archivo PHP devolvió datos vacíos.");
        }
    } catch (error) {
        console.error('Error crítico al cargar catálogos desde el servidor:', error);
    }
}



function llenar(id, datos, value, text) {
    try {
        const select = document.getElementById(id);
        if (!select) return; // Salida segura si el elemento no existe en la vista actual
        
        select.innerHTML = '<option value="">Selecciona</option>';
        
        // El operador datos?.forEach evita que el script falle si alguna lista viene nula o indefinida
        datos?.forEach(d => {
            select.innerHTML += `<option value="${d[value]}">${d[text]}</option>`;
        });
    } catch (error) {
        console.error(`Error al llenar el selector con ID '${id}':`, error);
    }
}
