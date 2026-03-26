function sistemas_acceso() {
    $.ajax({
        url: "/includes/query_sql/sistemas_sinteg.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            // console.log(data);
            data.forEach((sistema) => {
                let cards_dinamicos = `
                  <div class="card fade-card d-flex flex-column align-items-center text-center">
                      <div class="mt-3 mb-3 ms-3 me-3">
                          <img src="../includes/img/${sistema.sistema_imagen}" alt="${sistema.acronimo}">
                          <div class="mt-3">
                              <h5 class="titulo-sistema">${sistema.acronimo}</h5>
                              <button type="button" class="btn btn-sistema" data-sistema="${sistema.acronimo.toLowerCase()}">
                                  Entrar <i class="fa-solid fa-arrow-up-right-from-square"></i>
                              </button>
                          </div>
                      </div>
                  </div>
              `;
                $('#container').append(cards_dinamicos);
            });

            // aplicamos un retrazo de aparicion por cada card que dibuja
            const cards = document.querySelectorAll(".card");

            cards.forEach((card, index) => {
                card.style.animationDelay = (index * 0.3) + "s";
            });
        },
        error: function (xhr) {
            console.log("Error:", xhr.responseText);
        }
    });
}

// CLICK DINÁMICO
$(document).on("click", ".btn-sistema", function () {
    let sistema = $(this).attr("data-sistema");
    // esto es igual a http://localhost:8086/app-swap/
    let url = `${window.location.origin}/app-${sistema}/`;

    window.open(url, "_blank");
});

// CLICK CUANDO EL MENU ES RESPONSIVO
$(document).on("click", ".hamburger", function () {
    $(this).toggleClass("active");
    $(".sidebar").toggleClass("active");
});

document.addEventListener("DOMContentLoaded", function () {
    sistemas_acceso();
});