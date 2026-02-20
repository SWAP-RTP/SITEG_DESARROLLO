export async function insertarDatos(url, formData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      return data;
    } else {
      console.error("Error en la respuesta del servidor");
      return null;
    }
  } catch (error) {
    console.error("Error al insertar los datos:", error);
    return null;
  }
}
