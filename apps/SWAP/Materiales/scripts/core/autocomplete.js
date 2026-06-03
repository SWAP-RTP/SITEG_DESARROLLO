import { MaterialesService } from './materialesService.js';

//** AUTOCOMPLETE GENÉRICO **
export async function autocompletarBase(folio, config) {
    try {
        const resultado = await MaterialesService.buscarPorFolio(folio);
        
        if (resultado.status !== 'ok') {
            alert('No encontrado');
            return null;
        }
        
        //**Vamos extraer el objeto que contiene los datos**
        const objeto = resultado.datos;
        
        // Validamos que el objeto config y su método setValues existan antes de invocarlos
        if (config && typeof config.setValues === 'function') {
            config.setValues(objeto);
        } else {
            console.warn("[autocompletarBase]: El objeto de configuración no tiene un método 'setValues' válido.");
        }
        
        //**Bloquear los campos que se pidan**
        if (config && config.lockFields) {
            // Validamos que exista la función bloquearCampos y el arreglo de campos antes de proceder
            if (typeof MaterialesService.bloquearCampos === 'function' && Array.isArray(config.fields)) {
                MaterialesService.bloquearCampos(config.fields, true);
            } else {
                console.warn("[autocompletarBase]: No se pudo bloquear campos. Verifique 'MaterialesService.bloquearCampos' o 'config.fields'.");
            }
        }

        return objeto;
        
    } catch (error) {
        console.error("Error crítico en la función autocompletarBase:", error);
        return null; // Retorno seguro para evitar que el script que lo invoca colapse
    }
}
