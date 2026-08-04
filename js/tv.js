/* ==============================================
   Sistema TV - Ciencias Politicas UNA
   tv.js - logica principal
   ============================================== */

const CONFIG_URL   = 'data/tv.json';
const REFRESH_MIN  = 5;
 const DURACION_BLQ = 45;
const MAX_PROXIMAS = 6;

const DIAS_ES  = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];
const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio',
                  'julio','agosto','septiembre','octubre','noviembre','diciembre'];

const DIAS_ES_FULL = ['Domingo','Lunes','Martes','Mi\u00e9rcoles','Jueves','Viernes','S\u00e1bado'];
const MESES_ES_FULL = ['enero','febrero','marzo','abril','mayo','junio',
                       'julio','agosto','septiembre','octubre','noviembre','diciembre'];

let semestresConfig = [];
let todosDatos      = {};
let cuentaSeg       = REFRESH_MIN * 60;

/* RELOJ */
function tickReloj() {
  const n  = new Date();
  const hh = String(n.getHours()).padStart(2,'0');
  const mm = String(n.getMinutes()).padStart(2,'0');
  const ss = String(n.getSeconds()).padStart(2,'0');
  document.getElementById('reloj').textContent = hh + ':' + mm + ':' + ss;
  const dia = DIAS_ES_FULL[n.getDay()];
  document.getElementById('fecha').textContent =
    dia + ', ' + n.getDate() + ' de ' + MESES_ES_FULL[n.getMonth()] + ' de ' + n.getFullYear();
}

/* CUENTA REGRESIVA */
function tickRefresh() {
  cuentaSeg--;
  if (cuentaSeg <= 0) {
    cuentaSeg = REFRESH_MIN * 60;
    cargarTodosLosDatos();
  }
  const m  = Math.floor(cuentaSeg / 60);
  const s  = String(cuentaSeg % 60).padStart(2,'0');
  const el = document.getElementById('cuentaRegresiva');
  if (el) el.textContent = m + ':' + s;
}

/* CARGA DE DATOS */
async function cargarConfig() {
  const r   = await fetch(CONFIG_URL + '?_v=' + Date.now(), { cache: 'no-store' });
  const cfg = await r.json();
  semestresConfig = cfg.semestres || [];
}

async function cargarSemestre(sem) {
  try {
    const r    = await fetch(sem.dataUrl + '?_v=' + Date.now(), { cache: 'no-store' });
    const data = await r.json();
    todosDatos[sem.id] = {
      horario:  data.horario  || [],
      examenes: data.examenes || []
    };
  } catch (e) {
    console.warn('[TV] No se pudo cargar ' + sem.id + ':', e.message);
    todosDatos[sem.id] = { horario: [], examenes: [] };
  }
}

async function cargarTodosLosDatos() {
  await Promise.all(semestresConfig.map(function(s){ return cargarSemestre(s); }));
  renderTodo();
}

/* HELPERS */
function horaAMin(str) {
  str = str || '0:0';
  var parts = str.split(':');
  return parseInt(parts[0],10) * 60 + (parseInt(parts[1],10) || 0);
}
function minActual() {
  var n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}
function diaHoy() {
  return DIAS_ES_FULL[new Date().getDay()];
}

/* RENDER */
function renderTodo() {
  renderClasesAhora();
  renderClasesProximas();
  renderExamenes();
}

function renderClasesAhora() {
  var c   = document.getElementById('clasesAhora');
  var hoy = diaHoy();
  var min = minActual();
  var cards = [];

  semestresConfig.forEach(function(sem) {
    var datos = todosDatos[sem.id];
    if (!datos) return;
    var vistos = {};
    datos.horario.forEach(function(b) {
      if (b.dia !== hoy) return;
      var inicio = horaAMin(b.hora || b.desde);
      var fin    = inicio + DURACION_BLQ;
      if (min < inicio || min >= fin) return;
      var key = sem.id + '|' + b.materia;
      if (vistos[key]) return;
      vistos[key] = true;
      cards.push(cardClase(sem, b, true));
    });
  });

  c.innerHTML = cards.length
    ? cards.join('')
    : '<div class="tv-empty">Sin clases en este momento</div>';
}

function renderClasesProximas() {
  var c   = document.getElementById('clasesProximas');
  var hoy = diaHoy();
  var min = minActual();
  var futuras = [];

  semestresConfig.forEach(function(sem) {
    var datos = todosDatos[sem.id];
    if (!datos) return;
    var vistos = {};
    datos.horario
      .filter(function(b){ return b.dia === hoy; })
      .forEach(function(b) {
        var minI = horaAMin(b.hora || b.desde);
        if (minI <= min) return;
        var key = sem.id + '|' + b.materia + '|' + (b.hora || b.desde);
        if (vistos[key]) return;
        vistos[key] = true;
        futuras.push({ sem: sem, b: b, minI: minI });
      });
  });

  futuras.sort(function(a,z){ return a.minI - z.minI; });
  var cards = futuras.slice(0, MAX_PROXIMAS).map(function(item){
    return cardClase(item.sem, item.b, false);
  });
  c.innerHTML = cards.length
    ? cards.join('')
    : '<div class="tv-empty">Sin m\u00e1s clases hoy</div>';
}

function cardClase(sem, b, esLive) {
  var desde = b.desde || b.hora || '';
  var hasta = b.hasta || '';
  var rango = hasta ? (desde + ' \u2013 ' + hasta) : desde;
  var badge = esLive ? '<span class="tv-badge-live">En curso</span>' : '';
  return '<div class="tv-card' + (esLive ? ' live' : '') + '" style="border-left-color:' + sem.color + '">'
    + badge
    + '<div class="tv-card-semestre" style="color:' + sem.color + '">' + sem.label + '</div>'
    + '<div class="tv-card-materia">' + esc(b.materia) + '</div>'
    + '<div class="tv-card-meta">'
    + '<span>\u{1F550} ' + esc(rango) + '</span>'
    + '<span>\u{1F464} ' + esc(b.profesor || 'Docente') + '</span>'
    + '</div></div>';
}

function renderExamenes() {
  var c    = document.getElementById('examenesContainer');
  var todo = [];

  semestresConfig.forEach(function(sem) {
    var datos = todosDatos[sem.id];
    if (!datos || !datos.examenes || !datos.examenes.length) return;
    datos.examenes.forEach(function(ex){ todo.push({ sem: sem, ex: ex }); });
  });

  if (!todo.length) {
    c.innerHTML = '<div class="tv-empty">Sin ex\u00e1menes programados</div>';
    return;
  }

  c.innerHTML = todo.map(function(item) {
    var sem = item.sem, ex = item.ex;
    var aula  = ex.aula     ? '<span>&#128682; Aula ' + esc(ex.aula) + '</span>' : '';
    var prof  = ex.profesor ? '<span>&#128100; ' + esc(ex.profesor) + '</span>'  : '';
    return '<div class="tv-exam-card" style="border-left-color:' + sem.color + '">'
      + '<div class="tv-exam-semestre" style="color:' + sem.color + '">' + sem.label + '</div>'
      + '<span class="tv-exam-tipo">' + esc(ex.tipo || 'Examen') + '</span>'
      + '<div class="tv-exam-materia">' + esc(ex.materia) + '</div>'
      + '<div class="tv-exam-meta">'
      + '<span>&#128197; ' + esc(ex.fecha || '') + '</span>'
      + '<span>&#128336; ' + esc(ex.hora  || '') + '</span>'
      + aula + prof
      + '</div></div>';
  }).join('');
}

function esc(str) {
  var d = document.createElement('div');
  d.textContent = str != null ? str : '';
  return d.innerHTML;
}

/* INIT */
function init() {
  tickReloj();
  setInterval(tickReloj,   1000);
  setInterval(tickRefresh, 1000);
  setInterval(renderTodo,  60000);

  cargarConfig().then(function(){
    return cargarTodosLosDatos();
  }).catch(function(e){
    console.error('[TV] Error de inicializacion:', e);
  });
}

document.addEventListener('DOMContentLoaded', init);
