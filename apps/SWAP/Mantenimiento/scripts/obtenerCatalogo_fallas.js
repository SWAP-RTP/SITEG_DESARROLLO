export async function obtenerCatalogoFallas(url) {
  try {
    const respose = await fetch(url);
    const data = await respose.json();
    const select = document.getElementById("falla");
    data.forEach((catalogo) => {
      const option = document.createElement("option");
      option.value = catalogo.id;
      option.textContent = `${catalogo.falla_descripcion}`;
      select.appendChild(option);
    });

    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching catalogo fallas:", error);
  }
}
