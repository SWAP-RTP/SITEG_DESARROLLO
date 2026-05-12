export async function cargarCatalogos() {
    const res = await fetch('query_sql/catalogo_listas.php');
    const data = await res.json();
    llenar('unidad', data.unidades, 'id_unidad_material', 'descripcion_unidad_material');
    llenar('estado', data.estados, 'id_estado_material', 'descripcion_estado_material');
    llenar('id_categoria', data.categorias, 'id_categoria_material', 'descripcion_categoria_material');   
    llenar('unidad_salida', data.unidades, 'id_unidad_material', 'descripcion_unidad_material');
    llenar('estado_salida', data.estados, 'id_estado_material', 'descripcion_estado_material');
    llenar('categoria_salida', data.categorias, 'id_categoria_material', 'descripcion_categoria_material');  
}
function llenar(id, datos, value, text) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '<option value="">Selecciona</option>';
    datos?.forEach(d => {
        select.innerHTML += `<option value="${d[value]}">${d[text]}</option>`;
    });
}

