// FUNCION QUE SE USA PARA DESPLEGAR Y COMPRIMIR EL MENU CON EL ICONO MENU HAMBURGUESA
$(document).on("click", ".menu_hamburguesa", function (e) {
  const menu = $(".menu-compacto");
  const ancho_actual = menu.width();

  if (ancho_actual > 100) {
    // Compactamos el menú
    menu.animate({ width: "80px" }, 300);
    menu.addClass("menu-colapsado");

    menu.find("span").hide("fast");
    $(".fa-chevron-down").hide("fast");

    $(".btn.btn-toggle").each(function () {
      // Guardar atributos
      $(this).data("bs-toggle", $(this).attr("data-bs-toggle"));
      $(this).data("bs-target", $(this).attr("data-bs-target"));
      $(this).data("aria-expanded", $(this).attr("aria-expanded"));

      // Desactivar funcionalidad de collapse
      $(this).removeAttr("data-bs-toggle");
      $(this).removeAttr("data-bs-target");
      $(this).removeAttr("aria-expanded");
    });
    
    $(".collapse").removeClass("show");
    
  } else {
    // Expandimos el menú
    menu.animate({ width: "300px" }, 300);
    menu.removeClass("menu-colapsado");

    menu.find("span").show("fast");
    $(".fa-chevron-down").show("fast");

    $(".btn.btn-toggle").each(function () {
      // Restaurar atributos
      $(this).attr("data-bs-toggle", $(this).data("bs-toggle"));
      $(this).attr("data-bs-target", $(this).data("bs-target"));
      $(this).attr("aria-expanded", "false"); // siempre empieza cerrado
    });
  }
});