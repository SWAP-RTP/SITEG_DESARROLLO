export const MaterialesService = {
    async buscarPorFolio(folio) {
        try {
            const res = await fetch(`query_sql/Autocompletar.php?folio=${encodeURIComponent(folio)}`);
            const data = await res.json();
            if (res.ok && data?.status === 'ok' && data?.datos?.folio_material) {
                return { status: 'ok', datos: data.datos };
            }
            if (res.ok && data?.folio_material) {
                return { status: 'ok', datos: data };
            }
            return { status: 'error', message: data.error || 'Material no encontrado' };
        } catch (error) {
            console.error('Error al buscar folio:', error);
            return { status: 'error', message: 'Error de conexión' };
        }
    },
    async guardarEntrada(datos) {
        try {
            // El PHP espera: folio, descripcion, unidad, estado, id_categoria, adscripcion, cantidad
            const res = await fetch('query_sql/materiales_guardados.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            return await res.json();
        } catch (error) {
            console.error("Error al guardar entrada:", error);
            return { status: 'error', message: 'Error al procesar la entrada' };
        }
    },
    async guardarSalida(datos) {
        try {
            // Mapeo de llaves para materiales_salida_guardados.php
            const payload = {
                folio_material: datos.folio,
                descripcion_material_salida: datos.descripcion,
                id_estado_material_salida: datos.estado,
                cantidad_material_salida: datos.cantidad,
                adscripcion_modulo: datos.adscripcion
            };

            console.log('[guardarSalida] Enviando datos:', payload);

            const res = await fetch('query_sql/materiales_salida_guardados.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Leer como texto primero para detectar respuestas HTML/errores PHP
            const texto = await res.text();
            console.log('[guardarSalida] Respuesta del servidor (raw):', texto);

            let json;
            try {
                json = JSON.parse(texto);
            } catch {
                console.error('[guardarSalida] La respuesta no es JSON válido:', texto);
                return { status: 'error', message: `Error del servidor (HTTP ${res.status}): respuesta inesperada del PHP.` };
            }

            return json;
        } catch (error) {
            console.error('Error al guardar salida:', error);
            return { status: 'error', message: 'Error de red al procesar la salida: ' + error.message };
        }
    },
    async obtenerMateriales() {
        try {
            const res = await fetch('query_sql/modales_datos.php?tipo=material');
            return await res.json();
        } catch (error) {
            console.error("Error al obtener materiales:", error);
            return { status: 'error', message: 'Error de conexión' };
        }
    },
    async consultarEntradas() {
        try {
            const res = await fetch('query_sql/consultas_materiales.php?tipo=entradas');
            return await res.json();
        } catch (error) {
            console.error("Error al consultar entradas:", error);
            return { status: 'error', message: 'Error de conexión' };
        }
    },
    async consultarSalidas() {
        try {
            const res = await fetch('query_sql/consultas_materiales.php?tipo=salidas');
            return await res.json();
        } catch (error) {
            console.error("Error al consultar salidas:", error);
            return { status: 'error', message: 'Error de conexión' };
        }
    }

};