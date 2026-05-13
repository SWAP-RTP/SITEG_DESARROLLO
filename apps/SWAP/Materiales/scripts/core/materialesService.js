//**exportamos la funcion de MaterialesService que contiene los metodos **
export const MaterialesService = {
    async buscarPorFolio(folio) {
        try {
            const respuesta = await fetch(`query_sql/Autocompletar.php?folio=${encodeURIComponent(folio)}`);
            const data = await respuesta.json();
            if (respuesta.ok && data?.status === 'ok' && data?.datos?.folio_material) {
                return { status: 'ok', datos: data.datos };
            }
            if (respuesta.ok && data?.folio_material) {
                return { status: 'ok', datos: data };
            }
            return { status: 'error', message: data?.error || 'Material no encontrado' };
        } catch (error) {
            console.error('[Error Crítico - buscarPorFolio]:', error);
            return { status: 'error', message: 'Error de conexión con el catálogo de folios' };
        }
    },
    async generarFolio() {
        try {
            const respuesta = await fetch('query_sql/generar_folio.php');
            if (!respuesta.ok) {
                throw new Error(`HTTP Error status: ${respuesta.status}`);
            }
            return await respuesta.json();
        } catch (error) {
            console.error('[Error Crítico - generarFolio]:', error);
            return { status: 'error', message: 'No se pudo generar un folio consecutivo nuevo' };
        }
    },
    async guardarEntrada(datos) {
        try {
            // El PHP espera los datos en este orden: folio, descripcion, unidad, estado, id_categoria, adscripcion, cantidad
            const respuesta = await fetch('query_sql/materiales_guardados.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            if (!respuesta.ok) {
                throw new Error(`HTTP Error status: ${respuesta.status}`);
            }
            return await respuesta.json();
        } catch (error) {
            console.error("[Error Crítico - guardarEntrada]:", error);
            return { status: 'error', message: 'Error de red al intentar procesar y almacenar la entrada' };
        }
    },
    async guardarSalida(datos) {
        try {
            // declaro el mapeo para materiales_salida_guardados.php
            const enviar = {
                folio_material: datos.folio,
                descripcion_material_salida: datos.descripcion,
                id_estado_material_salida: datos.estado,
                cantidad_material_salida: datos.cantidad,
                adscripcion_modulo: datos.adscripcion
            };

            const respuesta = await fetch('query_sql/materiales_salida_guardados.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enviar)
            });

            // Leer como texto primero para detectar respuestas HTML/errores PHP
            const texto = await respuesta.text();

            let json;
            try {
                json = JSON.parse(texto);
            } catch {
                return { status: 'error', message: `Error del servidor (HTTP ${respuesta.status}): respuesta inesperada del PHP.` };
            }

            return json;
        } catch (error) {
            console.error('[Error Crítico - guardarSalida]:', error);
            return { status: 'error', message: 'Error de red al procesar la salida: ' + error.message };
        }
    },
   async obtenerMateriales() {
        try {
            //nos va traer la lista de materiales que existen en la base de datos 
            const respuesta = await fetch('query_sql/modales_datos.php?tipo=material');
            if (!respuesta.ok) {
                throw new Error(`HTTP Error status: ${respuesta.status}`);
            }
            return await respuesta.json();
        } catch (error) {
            console.error("[Error Crítico - obtenerMateriales]:", error);
            return { status: 'error', message: 'Error de conexión al obtener los materiales base' };
        }
    },
    async consultarEntradas() {
        try {
            //nos va traer los datos de entrada que se han regsitrado
            const respuesta = await fetch('query_sql/consultas_materiales.php?tipo=entradas');
            if (!respuesta.ok) {
                throw new Error(`HTTP Error status: ${respuesta.status}`);
            }
            return await respuesta.json();
        } catch (error) {
            console.error("[Error Crítico - consultarEntradas]:", error);
            return { status: 'error', message: 'Error de conexión al consultar el historial de entradas' };
        }
    },
    async consultarSalidas() {
        try {
            //nos va traer los datos de salida que se han regsitrado
            const respuesta = await fetch('query_sql/consultas_materiales.php?tipo=salidas');
            if (!respuesta.ok) {
                throw new Error(`HTTP Error status: ${respuesta.status}`);
            }
            return await respuesta.json();
        } catch (error) {
            console.error("[Error Crítico - consultarSalidas]:", error);
            return { status: 'error', message: 'Error de conexión al consultar el historial de salidas' };
        }
    },
   //funcion recomendado para buscador
   async buscarDinamico(texto) {
        try {
            const resp = await fetch(`query_sql/buscador_dinamico.php?termino=${encodeURIComponent(texto)}`);
            if (!resp.ok) {
                throw new Error(`HTTP Error status: ${resp.status}`);
            }
            return await resp.json();
        } catch (error) {
            console.error("[Error Crítico - buscarDinamico]:", error);
            return []; // Mantiene el retorno de un arreglo vacío seguro para evitar romper los .forEach externos
        }
    },
};