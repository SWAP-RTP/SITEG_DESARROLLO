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
            return { status: 'error', message: data.error || 'Material no encontrado' };
        } catch (error) {
            console.error('Error al buscar folio:', error);
            return { status: 'error', message: 'Error de conexión' };
        }
    },
    async generarFolio() {
        const respuesta = await fetch('query_sql/generar_folio.php');
        return await respuesta.json();
    },
    async guardarEntrada(datos) {
        try {
            // El PHP espera los datos en este orden: folio, descripcion, unidad, estado, id_categoria, adscripcion, cantidad
            const respuesta = await fetch('query_sql/materiales_guardados.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            return await respuesta.json();
        } catch (error) {
            console.error("Error al guardar entrada:", error);
            return { status: 'error', message: 'Error al procesar la entrada' };
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

            //console.log('[guardarSalida] Enviando datos:', enviar);

            const respuesta = await fetch('query_sql/materiales_salida_guardados.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enviar)
            });

            // Leer como texto primero para detectar respuestas HTML/errores PHP
            const texto = await respuesta.text();
            //console.log('[guardarSalida] Respuesta del servidor (raw):', texto);

            let json;
            try {
                json = JSON.parse(texto);
            } catch {
                //console.error('[guardarSalida] La respuesta no es JSON válido:', texto);
                return { status: 'error', message: `Error del servidor (HTTP ${respuesta.status}): respuesta inesperada del PHP.` };
            }

            return json;
        } catch (error) {
            //console.error('Error al guardar salida:', error);
            return { status: 'error', message: 'Error de red al procesar la salida: ' + error.message };
        }
    },
    async obtenerMateriales() {
        try {
            //nos va traer  la lista de materiales que existen en la base de datos 
            const respuesta = await fetch('query_sql/modales_datos.php?tipo=material');
            return await respuesta.json();
        } catch (error) {
            console.error("Error al obtener materiales:", error);
            return { status: 'error', message: 'Error de conexión' };
        }
    },
    async consultarEntradas() {
        try {
            //nos va traer los datos de entrada que se han regsitrado
            const respuesta = await fetch('query_sql/consultas_materiales.php?tipo=entradas');
            return await respuesta.json();
        } catch (error) {
            console.error("Error al consultar entradas:", error);
            return { status: 'error', message: 'Error de conexión' };
        }
    },
    async consultarSalidas() {
        try {
            //nos va traer los datos de salida que se han regsitrado
            const respuesta = await fetch('query_sql/consultas_materiales.php?tipo=salidas');
            return await respuesta.json();
        } catch (error) {
            console.error("Error al consultar salidas:", error);
            return { status: 'error', message: 'Error de conexión' };
        }
    },
//funcion recomendado para buscador
    async buscarDinamico(texto) {
        try {
            const resp = await fetch(`query_sql/buscador_dinamico.php?termino=${encodeURIComponent(texto)}`);
            return await resp.json();
        } catch (error) {
            console.error("Error en búsqueda dinámica:", error);
            return [];
        }
    },
};