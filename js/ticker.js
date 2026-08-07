(function () {
  var FOOTER_ID = "noticias-footer";
  var DATA_URL = "data/noticias.json";
  var REFRESH_MS = 5 * 60 * 1000;

  function crearFooter() {
    var existente = document.getElementById(FOOTER_ID);
    if (existente) return existente;
    var footer = document.createElement("div");
    footer.id = FOOTER_ID;
    footer.className = "noticias-footer";
    document.body.appendChild(footer);
    return footer;
  }

  function render(footer, items) {
    if (!items || !items.length) {
      footer.innerHTML = "";
      return;
    }
    var track = document.createElement("div");
    track.className = "noticias-footer__track";
    items.forEach(function (n) {
      var span = document.createElement("span");
      span.className = "noticias-footer__item";
      span.textContent = n.titulo;
      track.appendChild(span);
    });
    footer.innerHTML = "";
    footer.appendChild(track);
  }

  function cargarNoticias() {
    fetch(DATA_URL + "?t=" + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error("No se pudo cargar noticias.json");
        return res.json();
      })
      .then(function (data) {
        var footer = crearFooter();
        render(footer, data.items);
      })
      .catch(function (err) {
        console.error("Error cargando noticias RSS:", err);
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    cargarNoticias();
    setInterval(cargarNoticias, REFRESH_MS);
  });
})();
