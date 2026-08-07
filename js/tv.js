(function () {
  var TV_DATA_URL = "data/tv.json";
  var NOTICIAS_DATA_URL = "data/noticias.json";
  var NOTICIAS_REFRESH_MS = 5 * 60 * 1000;

  var MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  var DIAS = [
    "domingo", "lunes", "martes", "mi\u00e9rcoles",
    "jueves", "viernes", "s\u00e1bado"
  ];

  function actualizarReloj() {
    var ahora = new Date();
    var horas = ahora.getHours() % 12;
    var minutos = ahora.getMinutes();
    var segundos = ahora.getSeconds();

    var gradosHora = (horas + minutos / 60) * 30;
    var gradosMinuto = (minutos + segundos / 60) * 6;
    var gradosSegundo = segundos * 6;

    var manecillaHora = document.getElementById("manecilla-hora");
    var manecillaMinuto = document.getElementById("manecilla-minuto");
    var manecillaSegundo = document.getElementById("manecilla-segundo");

    if (manecillaHora) manecillaHora.style.transform = "rotate(" + gradosHora + "deg)";
    if (manecillaMinuto) manecillaMinuto.style.transform = "rotate(" + gradosMinuto + "deg)";
    if (manecillaSegundo) manecillaSegundo.style.transform = "rotate(" + gradosSegundo + "deg)";

    var fechaEl = document.getElementById("fecha-actual");
    if (fechaEl) {
      var texto = DIAS[ahora.getDay()] + " " + ahora.getDate() + " de " +
        MESES[ahora.getMonth()] + " de " + ahora.getFullYear();
      fechaEl.textContent = texto.toUpperCase();
    }
  }

  function actualizarProximaFechaPatria(info) {
    var el = document.getElementById("proxima-fecha-patria");
    if (!el || !info) return;
    var fecha = new Date(info.fecha + "T00:00:00");
    var texto = info.nombre + " - " + fecha.getDate() + " de " + MESES[fecha.getMonth()];
    el.textContent = texto.toUpperCase();
  }

  function renderHorarios(grados) {
    var contenedor = document.getElementById("horarios-grid");
    if (!contenedor || !grados) return;
    contenedor.innerHTML = "";

    grados.forEach(function (grado) {
      var numero = document.createElement("div");
      numero.className = "celda celda--numero";
      numero.textContent = (grado.nombre.match(/\\d+/) || [""])[0];
      contenedor.appendChild(numero);

      var activa = document.createElement("div");
      activa.className = "celda celda--activa";
      activa.textContent = grado.activa || "SIN CLASE ACTIVA";
      contenedor.appendChild(activa);

      var proximas = grado.proximas || [];
      for (var i = 0; i < 3; i++) {
        var celda = document.createElement("div");
        celda.className = "celda";
        celda.textContent = proximas[i] ? proximas[i].toUpperCase() : "PROXIMA CLASE";
        contenedor.appendChild(celda);
      }
    });
  }

  function renderExamenes(examenes) {
    var contenedor = document.getElementById("examenes-lista");
    if (!contenedor || !examenes) return;
    contenedor.innerHTML = "";

    Object.keys(examenes).forEach(function (grado) {
      var fila = document.createElement("div");
      fila.className = "examen-fila";
      var items = examenes[grado] || [];
      var texto = "EXAMENES " + grado.toUpperCase();
      if (items.length) texto += ": " + items.join(" | ");
      fila.textContent = texto;
      contenedor.appendChild(fila);
    });
  }

  function cargarDatosTV() {
    fetch(TV_DATA_URL + "?t=" + Date.now())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        renderHorarios(data.grados);
        renderExamenes(data.examenes);
        actualizarProximaFechaPatria(data.proximaFechaPatria);
      })
      .catch(function (err) {
        console.error("Error cargando data/tv.json:", err);
      });
  }

  function renderNoticiasLateral(items) {
    var lista = document.getElementById("noticias-lista");
    if (!lista) return;
    lista.innerHTML = "";
    (items || []).slice(0, 8).forEach(function (n) {
      var li = document.createElement("li");
      li.textContent = n.titulo;
      lista.appendChild(li);
    });
  }

  function renderTickerFooter(items) {
    var footer = document.getElementById("noticias-footer");
    if (!footer) return;
    if (!items || !items.length) {
      footer.innerHTML = "";
      return;
    }
    var track = document.createElement("div");
    track.className = "tv-footer-ticker__track";
    items.forEach(function (n) {
      var span = document.createElement("span");
      span.className = "tv-footer-ticker__item";
      span.textContent = n.titulo;
      track.appendChild(span);
    });
    footer.innerHTML = "";
    footer.appendChild(track);
  }

  function cargarNoticias() {
    fetch(NOTICIAS_DATA_URL + "?t=" + Date.now())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        renderNoticiasLateral(data.items);
        renderTickerFooter(data.items);
      })
      .catch(function (err) {
        console.error("Error cargando data/noticias.json:", err);
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    actualizarReloj();
    setInterval(actualizarReloj, 1000);

    cargarDatosTV();
    setInterval(cargarDatosTV, 10 * 60 * 1000);

    cargarNoticias();
    setInterval(cargarNoticias, NOTICIAS_REFRESH_MS);
  });
})();
