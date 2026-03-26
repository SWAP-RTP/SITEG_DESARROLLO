import { registrarMaterial, consultarMateriales, formatearFecha, buscarTrabajador } from './funciones.js';

document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.getElementById('form-materiales');
  const btnConsultar = document.getElementById('btn_consulta');
  const btnLimpiar = document.getElementById('btn_limpiar');
  const tabla = document.getElementById('tabla_registros');
  const tbody = document.getElementById('tabla_materiales');
  const tituloConsulta = document.getElementById('titulo-consulta');
  const credencialInput = document.getElementById('id_credencial');
  const nombreInput = document.getElementById('nombre_trabajador');

  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = {
      codigo_material: document.getElementById('codigo_material').value,
      descripcion_material: document.getElementById('descripcion_material').value,
      grupo_pertenece: document.getElementById('grupo_pertenece').value,
      unidad_entrada: document.getElementById('unidad_entrada').value,
      cantidad_material: document.getElementById('cantidad_material').value,
      ubicacion_almacen: document.getElementById('ubicacion_almacen').value,
      estado_material: document.getElementById('estado_material').value,
      id_credencial: document.getElementById('id_credencial').value,
      nombre_persona: document.getElementById('nombre_trabajador').value,
      area_adscripcion: document.getElementById('area_material').value
    };

    // Validación de campos vacíos
    const camposObligatorios = Object.values(datos).every(valor => valor && valor.trim() !== '');
    if (!camposObligatorios) {
      const toastErrorEl = document.getElementById('toastError');
      toastErrorEl.querySelector('.toast-body').textContent = "No se ha llenado el formulario completo";
      const toastError = new bootstrap.Toast(toastErrorEl);
      toastError.show();
      return;
    }

    registrarMaterial(datos);

    // Toast de éxito
    const toastExitoEl = document.getElementById('toastExito');
    toastExitoEl.querySelector('.toast-body').textContent = "¡Material registrado correctamente!";
    const toastExito = new bootstrap.Toast(toastExitoEl);
    toastExito.show();
  });
  

  // Evento para consultar materiales
  btnConsultar.addEventListener('click', async () => {
    const materiales = await consultarMateriales();

    // Limpia la tabla
    tbody.innerHTML = '';

    if (materiales && materiales.length > 0) {
      materiales.forEach(mat => {
        const fila = `
          <tr>
            <td>${mat.codigo_material}</td>
            <td>${mat.descripcion_material}</td>
            <td>${mat.grupo_pertenece}</td>
            <td>${mat.unidad_entrada}</td>
            <td>${mat.cantidad_material}</td>
            <td>${mat.ubicacion_almacen}</td>
            <td>${mat.estado_material}</td>
            <td>${mat.id_credencial}</td>
            <td>${mat.nombre_persona}</td>
            <td>${mat.area_adscripcion}</td>
           <td>${formatearFecha(mat.fecha_registro)}</td>
          </tr>
        `;
        tbody.innerHTML += fila;
      });
      tabla.classList.remove('d-none');
      tituloConsulta.style.display = 'block';
    } else {
      tabla.classList.add('d-none');
      tituloConsulta.style.display = 'none';
      // Toast de error personalizado para consulta vacía
      const toastErrorEl = document.getElementById('toastError');
      toastErrorEl.querySelector('.toast-body').textContent = "¡No se ha realizado ningún registro!";
      const toastError = new bootstrap.Toast(toastErrorEl);
      toastError.show();
    }
  });
  
  // Evento para limpiar el formulario y la tabla de consulta
    btnLimpiar.addEventListener('click', () => {
    formulario.reset(); // Limpia el formulario
    tbody.innerHTML = ''; // Limpia la tabla de consulta
    tabla.classList.add('d-none'); // Oculta la tabla
    tituloConsulta.style.display = 'none'; // Oculta el título
  });

  // Evento para buscar trabajador
  credencialInput.addEventListener('input', async () => {
    const id = credencialInput.value;
    if (!id) {
      nombreInput.value = '';
      nombreInput.readOnly = false;
      return;
    }
    const data = await buscarTrabajador(id);
    if (data.ok && data.nombre) {
      nombreInput.value = data.nombre;
      nombreInput.readOnly = true; // Solo lectura si se encuentra
    } else {
      nombreInput.value = '';
      nombreInput.readOnly = false;
    }
  });
});
