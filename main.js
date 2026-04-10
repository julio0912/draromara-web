/* Loader */
window.addEventListener('load',()=>setTimeout(()=>document.getElementById('loader').classList.add('done'),2200));

/* Cursor */
const cur=document.getElementById('cur'),curR=document.getElementById('curR');
let cx=0,cy=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY;cur.style.left=cx+'px';cur.style.top=cy+'px'});
(function ar(){rx+=(cx-rx)*.12;ry+=(cy-ry)*.12;curR.style.left=rx+'px';curR.style.top=ry+'px';requestAnimationFrame(ar)})();
document.querySelectorAll('a,button,.cat-tab,.srv-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.classList.add('h');curR.classList.add('h')});
  el.addEventListener('mouseleave',()=>{cur.classList.remove('h');curR.classList.remove('h')});
});

/* Nav scroll */
window.addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('scrolled',scrollY>60),{passive:true});

/* Mobile menu */
const burg=document.getElementById('burg'),mob=document.getElementById('mobMenu');
burg.addEventListener('click',()=>{burg.classList.toggle('open');mob.classList.toggle('open');document.body.style.overflow=mob.classList.contains('open')?'hidden':''});
function closeM(){burg.classList.remove('open');mob.classList.remove('open');document.body.style.overflow=''}

/* Reveal */
const revs=document.querySelectorAll('.reveal');
const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
revs.forEach(el=>ro.observe(el));

/* Marquee */
const items=['Russian Lips','Botox Premium','Armonización Facial','Nefertiti Lips','Bichectomía','Rinomodelación','Ácido Hialurónico','Bioestimulador de Colágeno','Enzimas','Matrix','Ojeras','Contorno Facial'];
const mqt=document.getElementById('mqt');
const mc=[...items,...items].map(t=>`<span class="mq-item">${t}<span class="mq-dot"></span></span>`).join('');
mqt.innerHTML=mc+mc;

/* ══════════════════════════════════════════════════════════
   DATA LAYER — SheetDB API
   API: https://sheetdb.io/api/v1/a41te1d4zzrd0
   Caché: localStorage, TTL 5 minutos
   Fallback: datos locales si la API falla
══════════════════════════════════════════════════════════ */

const API_URL       = 'https://sheetdb.io/api/v1/a41te1d4zzrd0';
const CACHE_KEY     = 'romara_servicios_v1';
const CACHE_TTL_MS  = 5 * 60 * 1000; // 5 minutos

/* ── Utilidades ── */

/**
 * Convierte cualquier formato de precio a numero.
 * Maneja formato ingles ($6,000), formato contabilidad español ($6.000)
 * y valores crudos (6000). El punto/coma antes de exactamente 3 digitos
 * se trata como separador de miles y se elimina.
 */
function parsePrecio(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  let s = String(val).trim().replace(/[$\s]/g, '');
  // Elimina separadores de miles: punto o coma seguidos de exactamente 3 dígitos
  // hasta fin de cadena o antes de otro separador. Ej: "6.000" → "6000", "6,000" → "6000"
  s = s.replace(/[.,](?=\d{3}(?:[.,]|$))/g, '');
  // Si queda coma como decimal (formato español), la convierte a punto
  s = s.replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

const fmt = n => {
  const num = parsePrecio(n);
  return num > 0
    ? '$' + num.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : 'Gratuita';
};

/* ── Normaliza un objeto crudo de SheetDB al modelo interno ── */
function normalize(raw) {
  const pe = parsePrecio(raw.precio_efectivo);
  const pr = parsePrecio(raw.precio_regular);

  // Aviso en consola si el precio llega en formato inesperado
  if (pe === 0 && raw.precio_efectivo && String(raw.precio_efectivo).trim() !== '' && String(raw.precio_efectivo).trim() !== '0') {
    console.warn('[Romara] precio no parseado:', JSON.stringify(raw.precio_efectivo));
  }

  return {
    nombre : (raw.nombre_del_servicio    || '').trim(),
    cat    : (raw.categoria              || '').trim(),
    desc   : (raw.descripcion            || '').trim(),
    pe,
    pr,
    unidad : (raw.unidad                 || '').trim(),
    dur    : (raw.duracion_procedimiento || '').trim(),
    rec    : (raw.recuperacion           || '').trim(),
    res    : (raw.resultado_final        || '').trim(),
    efecto : (raw.efecto_duracion        || '').trim(),
    anest  : (raw.anestesia              || '').trim(),
    marca  : (raw.marca_insumo           || '').trim(),
    notas  : (raw.notas_restricciones    || '').trim(),
    activo : (raw.activo_si_no           || '').trim(),
    promo  : (raw.promocion_si_no        || '').trim(),
  };
}

/* ── Limpia cache corrupta si todos los precios son 0 ── */
function validateCache(data) {
  if (!data || !data.length) return false;
  const hayPrecio = data.some(s => s.pe > 0);
  if (!hayPrecio) {
    console.warn('[Romara] Cache corrupta (todos precios = 0). Limpiando...');
    localStorage.removeItem(CACHE_KEY);
    return false;
  }
  return true;
}

/* ── Caché ── */
function cacheGet() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    // TTL expirado
    if (Date.now() - ts > CACHE_TTL_MS) { localStorage.removeItem(CACHE_KEY); return null; }
    // Valida que los datos no esten corruptos (precios todos en 0)
    if (!validateCache(data)) return null;
    return data;
  } catch { return null; }
}

function cacheSet(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

/* ── Estado de loading en la UI ── */
function showGridLoading() {
  document.getElementById('srvGrid').innerHTML = `
    <div class="loading-sk" style="grid-column:1/-1;flex-direction:column;gap:1.5rem;padding:4rem 2rem">
      <div style="display:flex;flex-direction:column;align-items:center;gap:.8rem">
        <div style="width:36px;height:36px;border:1px solid rgba(201,169,110,.3);border-top-color:var(--dorado);
          border-radius:50%;animation:spin .9s linear infinite"></div>
        <span style="font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gris)">
          Cargando tratamientos…
        </span>
      </div>
    </div>`;
}

function showGridError(msg) {
  document.getElementById('srvGrid').innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem">
      <div style="font-family:var(--font-d);font-size:2rem;color:rgba(201,169,110,.3);margin-bottom:1rem">✦</div>
      <p style="font-size:.82rem;color:var(--gris);line-height:1.8;max-width:360px;margin:0 auto">${msg}</p>
      <a href="https://wa.me/523334043771" target="_blank" class="btn-p" style="margin-top:1.5rem;display:inline-flex">
        <span>Consultar por WhatsApp</span><span>→</span>
      </a>
    </div>`;
}

/* ── Spinner CSS (una sola vez) ── */
(function injectSpinnerCSS(){
  if (document.getElementById('spin-css')) return;
  const s = document.createElement('style');
  s.id = 'spin-css';
  s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
})();

/* ── Fetch desde SheetDB con caché ── */
async function loadData() {
  // 1. Intenta caché primero
  const cached = cacheGet();
  if (cached && cached.length) {
    console.info('[Romara] Datos desde caché (%d servicios)', cached.length);
    return cached;
  }

  // 2. Llama a la API
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    if (!Array.isArray(json) || json.length === 0) {
      throw new Error('La API devolvió una lista vacía');
    }

    // Normaliza, filtra activos y ordena por categoría
    const data = json
      .map(normalize)
      .filter(s => s.activo === 'Sí' && s.nombre);

    cacheSet(data);
    console.info('[Romara] Datos desde API (%d servicios activos)', data.length);
    return data;

  } catch (err) {
    console.warn('[Romara] API no disponible:', err.message);
    return null; // señal de error
  }
}

/* ── Render tarjetas ── */
function renderCards(data, cat = 'todos') {
  const grid = document.getElementById('srvGrid');
  const f = cat === 'todos' ? data : data.filter(s => s.cat === cat);

  if (!f.length) {
    grid.innerHTML = `<div class="loading-sk" style="color:var(--gris);grid-column:1/-1">
      Sin servicios en esta categoría por el momento.</div>`;
    return;
  }

  grid.innerHTML = f.map((s, i) => `
    <article class="srv-card${s.promo === 'Sí' ? ' srv-card--promo' : ''}"
      style="opacity:0;transform:translateY(20px);transition:opacity .5s ${i * .05}s ease,transform .5s ${i * .05}s ease">

      ${s.promo === 'Sí' ? '<span class="card-promo">Promo efectivo</span>' : ''}
      <span class="card-tag">${s.cat}</span>
      <h3 class="card-name">${s.nombre}</h3>
      <p class="card-desc">${s.desc}</p>

      <div class="card-meta">
        ${s.dur && !['Variable','No aplica',''].includes(s.dur)
          ? `<div><div class="cm-label">Duración</div><div class="cm-val">${s.dur}</div></div>` : ''}
        ${s.efecto && s.efecto !== 'No aplica' && s.efecto !== ''
          ? `<div><div class="cm-label">Efecto</div><div class="cm-val">${s.efecto}</div></div>` : ''}
        ${s.rec && s.rec !== 'No aplica' && s.rec !== ''
          ? `<div><div class="cm-label">Recuperación</div><div class="cm-val">${s.rec}</div></div>` : ''}
        ${s.res && s.res !== 'No aplica' && s.res !== ''
          ? `<div><div class="cm-label">Resultado</div><div class="cm-val">${s.res}</div></div>` : ''}
      </div>

      <div class="card-foot">
        <div>
          ${s.promo === 'Sí' ? '<div class="card-plabel">Precio efectivo</div>' : ''}
          <div class="card-price">${fmt(s.pe)}</div>
          ${(s.pr && s.pr !== s.pe && s.pr > 0)
            ? `<div class="card-preg">${fmt(s.pr)} regular</div>` : ''}
          ${s.unidad
            ? `<div style="font-size:.62rem;color:var(--gris);margin-top:.3rem">${s.unidad}</div>` : ''}
        </div>
        <a href="https://wa.me/523334043771?text=Hola%2C%20me%20interesa%20el%20servicio%3A%20${encodeURIComponent(s.nombre)}"
          target="_blank" class="card-cta">
          <span>Agendar</span><span>→</span>
        </a>
      </div>
    </article>
  `).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.srv-card').forEach((el, i) => {
      setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, i * 55);
    });
  });
}

/* ── Render tabs de categoría ── */
function renderTabs(data) {
  const cats = ['todos', ...new Set(data.map(s => s.cat).filter(Boolean))];
  const tabs  = document.getElementById('catTabs');

  tabs.innerHTML = cats.map(c =>
    `<button class="cat-tab ${c === 'todos' ? 'active' : ''}" data-cat="${c}">
      ${c === 'todos' ? 'Todos' : c}
    </button>`
  ).join('');

  tabs.addEventListener('click', e => {
    const btn = e.target.closest('.cat-tab');
    if (!btn) return;
    tabs.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards(data, btn.dataset.cat);
  });
}

/* ── Render sección promociones ── */
function renderPromos(data) {
  const promos = data.filter(s => s.promo === 'Sí' && s.pe > 0);
  const g = document.getElementById('promoGrid');

  if (!promos.length) {
    g.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--gris);
      font-size:.85rem;grid-column:1/-1;letter-spacing:.05em">
      Próximamente nuevas promociones.</div>`;
    return;
  }

  g.innerHTML = promos.slice(0, 6).map(s => `
    <div class="promo-c reveal">
      <div class="promo-lbl">Precio especial en efectivo</div>
      <div class="promo-name">${s.nombre}</div>
      <p style="font-size:.8rem;color:var(--gris);line-height:1.6">
        ${s.desc.length > 90 ? s.desc.substring(0, 90) + '…' : s.desc}
      </p>
      <div class="promo-sav">
        <div class="promo-pe">${fmt(s.pe)}</div>
        ${(s.pr && s.pr > s.pe) ? `<div class="promo-pr">${fmt(s.pr)}</div>` : ''}
      </div>
      <a href="https://wa.me/523334043771?text=Hola%2C%20me%20interesa%20la%20promo%20de%3A%20${encodeURIComponent(s.nombre)}"
        target="_blank" style="display:inline-flex;align-items:center;gap:.5rem;
        margin-top:1.2rem;font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;
        color:var(--dorado);text-decoration:none;cursor:none;transition:gap .3s"
        onmouseover="this.style.gap='.9rem'" onmouseout="this.style.gap='.5rem'">
        <span>Aprovechar promo</span><span>→</span>
      </a>
    </div>
  `).join('');

  document.querySelectorAll('#promoGrid .reveal').forEach(el => ro.observe(el));
}

/* ── Init: orquesta todo ── */
(async () => {
  showGridLoading();

  const data = await loadData();

  if (!data) {
    // Error de red sin fallback disponible
    showGridError(
      'No pudimos cargar los servicios en este momento.<br>' +
      'Escríbenos directamente y con gusto te asesoramos.'
    );
    document.getElementById('promoGrid').innerHTML =
      `<div style="text-align:center;padding:2rem;color:var(--gris);
        font-size:.82rem;grid-column:1/-1">Sin conexión — intenta de nuevo más tarde.</div>`;
    return;
  }

  renderTabs(data);
  renderCards(data);
  renderPromos(data);
})();

/* Smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href');if(id==='#')return;
    const el=document.querySelector(id);
    if(el){e.preventDefault();window.scrollTo({top:el.offsetTop-80,behavior:'smooth'})}
  });
});
