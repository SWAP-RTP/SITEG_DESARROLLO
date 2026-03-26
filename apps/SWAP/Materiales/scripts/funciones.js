export async function registrarMaterial(datos) {
  try {
    const response = await fetch('/app-swap/Materiales/backend/registrar_material.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const data = await response.json();

    if (data.ok) {
      // Oculta el toast de error si está visible
      const toastErrorEl = document.getElementById('toastError');
      const toastError = bootstrap.Toast.getInstance(toastErrorEl);
      if (toastError) toastError.hide();

      // Muestra el toast de éxito
      const toastExitoEl = document.getElementById('toastExito');
      toastExitoEl.querySelector('.toast-body').textContent = data.mensaje;
      const toastExito = new bootstrap.Toast(toastExitoEl);
      toastExito.show();
    } else {
      // Oculta el toast de éxito si está visible
      const toastExitoEl = document.getElementById('toastExito');
      const toastExito = bootstrap.Toast.getInstance(toastExitoEl);
      if (toastExito) toastExito.hide();

      // Muestra el toast de error
      const toastErrorEl = document.getElementById('toastError');
      toastErrorEl.querySelector('.toast-body').textContent = data.mensaje;
      const toastError = new bootstrap.Toast(toastErrorEl);
      toastError.show();
    }

  } catch (error) {
    const toastErrorEl = document.getElementById('toastError');
    toastErrorEl.querySelector('.toast-body').textContent = "Error de conexión con el servidor";
    const toastError = new bootstrap.Toast(toastErrorEl);
    toastError.show();
    console.error("Error de conexión con el servidor", error);
  }
}

export async function consultarMateriales() {
  try {
    const response = await fetch('/app-swap/Materiales/backend/consultar_material.php');
    const data = await response.json();
    return data.materiales; 
  } catch (error) {
    console.error("Error al consultar materiales", error);
    return [];
  }
}

export async function buscarTrabajador(id_credencial) {
  try {
    const response = await fetch('/app-swap/Materiales/backend/buscar_trabajador.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_credencial })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { ok: false, nombre: '' };
  }
}

export function formatearFecha(fecha) {
  try {
    if (!fecha) return '';
    const d = new Date(fecha);
    if (isNaN(d)) return fecha;

    let horas = d.getHours();
    const minutos = String(d.getMinutes()).padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12;

    return (
      d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + ' ' +
      String(horas).padStart(2, '0') + ':' +
      minutos + ' ' + ampm
    );
  } catch (error) {
    return '';
  }
}