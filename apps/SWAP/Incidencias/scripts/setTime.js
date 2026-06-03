export async function setTime() {
  try {

    const response = await fetch('/Incidencias/query_sql/update.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      });





  } catch (error) {
    console.error("Error al establecer el tiempo:", error);
  }
}
