import { buscarCredencial} from '../../includes/utils/buscarCredencial.js';
import { datosTabla, dataTable } from '../../includes/utils/dataTable_v2.js';

// Configura el autocompletado de credencial
buscarCredencial(
  'query_sql/credencialesControl.php', // Ruta real de tu endpoint de credenciales
  'id_credencial',
  'nombre_registra',
  'lista-credenciales'
);

// Maneja el submit del formulario de materiales
const formMateriales = document.getElementById('form-materiales');
if (formMateriales) {
  formMateriales.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formMateriales);
    try {
      const response = await fetch('query_sql/materialesControl.php', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      console.log(result); // <-- Agregar esto para ver la respuesta del servidor en la consola
      if (result.success) {
        formMateriales.reset();
        alert('Registro guardado correctamente');
      } else {
        alert('Error al guardar el registro: ' + (result.error || ''));
      }
    } catch (error) {
      alert('Error de conexión al guardar el registro');
    }
  });
}

// Consulta y muestra los registros en la tabla
const btnConsulta = document.getElementById('btn_consulta');
if (btnConsulta) {
  btnConsulta.addEventListener('click', async () => {
    // Cuando implementes la consulta por GET en materialesControl.php, usa esta ruta
    const datos = await datosTabla('query_sql/materialesControl.php');
    dataTable(datos, '#tabla_registros', [
      { data: 'codigo_material' },
      { data: 'descripcion_material' },
      { data: 'grupo_pertenece' },
      { data: 'unidad_entrada' },
      { data: 'cantidad_material' },
      { data: 'ubicacion_almacen' },
      { data: 'estado_material' },
      { data: 'id_credencial' },
      { data: 'nombre_persona' },
      { data: 'area_adscripcion' },
      { data: 'fecha_registro' }
    ]);
    document.getElementById('tabla_registros').classList.remove('d-none');
    document.getElementById('titulo-consulta').style.display = 'block';
  });
}