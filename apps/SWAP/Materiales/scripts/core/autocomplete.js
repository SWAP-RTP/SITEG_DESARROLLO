import { MaterialesService } from './materialesService.js';
//** AUTOCOMPLETE GENÉRICO **
export async function autocompletarBase(folio, config) {
    const resultado = await MaterialesService.buscarPorFolio(folio);
    if (resultado.status !== 'ok') {
        alert('No encontrado');
        return null;
    }
    //**Vamos extraer el objeto que contiene los datos**
    const objeto = resultado.datos;
    config.setValues(objeto);
    //**Bloquear los campos que se pidan**
    if (config.lockFields) {
        MaterialesService.bloquearCampos(config.fields, true);
    }

    return objeto;
}