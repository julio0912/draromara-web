/* ══════════════════════════════════════════════════════════
   ROMARA AESTHETICS — main.js v4
   Data layer SheetDB · Compatible con Google Sheet actualizado
   Nuevas columnas: destacado, texto_promo, orden
══════════════════════════════════════════════════════════ */

/* ── Loader 800ms ── */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 800);
});

/* ── Cursor (solo desktop) ── */
const cur = document.getElementById('cur');
const curR = document.getElementById('curR');
let cx = 0, cy = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
});
(function ar() {
  rx += (cx - rx) * .12; ry += (cy - ry) * .12;
  curR.style.left = rx + 'px'; curR.style.top = ry + 'px';
  requestAnimationFrame(ar);
})();
function addHover(el) {
  el.addEventListener('mouseenter', () => { cur.classList.add('h'); curR.classList.add('h'); });
  el.addEventListener('mouseleave', () => { cur.classList.remove('h'); curR.classList.remove('h'); });
}
document.querySelectorAll('a, button, .cat-tab').forEach(addHover);

/* ── Nav scroll ── */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', scrollY > 60);
}, { passive: true });

/* ── Menú móvil ── */
const burg = document.getElementById('burg');
const mob  = document.getElementById('mobMenu');
burg.addEventListener('click', () => {
  burg.classList.toggle('open');
  mob.classList.toggle('open');
  document.body.style.overflow = mob.classList.contains('open') ? 'hidden' : '';
});
function closeM() {
  burg.classList.remove('open');
  mob.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Reveal on scroll ── */
const revEls = document.querySelectorAll('.reveal');
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
  });
}, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
revEls.forEach(el => ro.observe(el));

/* ── Marquee ── */
const mqItems = [
  'Russian Lips','Botox Premium','Armonización Facial','Nefertiti Lips',
  'Bichectomía','Rinomodelación','Ácido Hialurónico','Bioestimulador de Colágeno',
  'Enzimas','Matrix','Ojeras','Contorno Facial'
];
const mqt = document.getElementById('mqt');
const mc  = [...mqItems, ...mqItems].map(t =>
  `<span class="mq-item">${t}<span class="mq-dot"></span></span>`
).join('');
mqt.innerHTML = mc + mc;

/* ── FAQ acordeón ── */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => {
      o.classList.remove('open');
      o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  });
});

/* ── Carrusel resultados ── */
(function initCarrusel() {
  const track   = document.getElementById('carTrack');
  const slides  = track ? track.querySelectorAll('.car-slide') : [];
  const dotsWrap = document.getElementById('carDots');
  const btnPrev = document.getElementById('carPrev');
  const btnNext = document.getElementById('carNext');
  if (!track || slides.length === 0) return;

  let current = 0, perView = getPerView();
  const total = slides.length;

  function getPerView() {
    if (window.innerWidth <= 560) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }
  function maxIndex() { return Math.max(0, total - perView); }
  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    track.style.transform = `translateX(-${(100 / perView) * current}%)`;
    document.querySelectorAll('.car-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));
  }
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = Array.from({ length: maxIndex() + 1 }, (_, i) =>
      `<button class="car-dot${i === 0 ? ' active' : ''}" aria-label="Slide ${i+1}"></button>`
    ).join('');
    dotsWrap.querySelectorAll('.car-dot').forEach((d, i) => {
      d.addEventListener('click', () => goTo(i));
      addHover(d);
    });
  }
  buildDots();
  btnPrev && btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext && btnNext.addEventListener('click', () => goTo(current + 1));

  let touchStartX = 0;
  const vp = document.getElementById('carViewport');
  if (vp) {
    vp.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    vp.addEventListener('touchend',   e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });
  }
  let autoTimer = setInterval(() => goTo(current >= maxIndex() ? 0 : current + 1), 4000);
  [btnPrev, btnNext].forEach(b => b && b.addEventListener('click', () => clearInterval(autoTimer)));
  window.addEventListener('resize', () => {
    const p = getPerView();
    if (p !== perView) { perView = p; current = 0; buildDots(); goTo(0); }
  });
})();

/* ══════════════════════════════════════════════════════════
   DATA LAYER
   ─────────────────────────────────────────────────────────
   IMPORTANTE: Para cambiar la API, solo edita API_URL.
   El resto del código se adapta automáticamente.
   
   Cómo conectar tu SheetDB:
   1. Crea tu Google Sheet con las columnas del template
   2. Entra a sheetdb.io → Create API → pega la URL del Sheet
   3. Copia la URL de la API (ej: https://sheetdb.io/api/v1/XXXXXXXX)
   4. Reemplaza el valor de API_URL abajo
   5. Sube el archivo y listo
══════════════════════════════════════════════════════════ */
const API_URL = 'https://sheetdb.io/api/v1/8p12fly6vq1si'; // ← reemplaza con tu URL
const CACHE_KEY    = 'romara_servicios_v2'; // v2 para limpiar caché anterior
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/* ── Parseo de precios ── */
// Maneja: "$6,000" / "$6.000" / "6000" / 6000
function parsePrecio(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  let s = String(val).trim().replace(/[$\s]/g, '');
  s = s.replace(/[.,](?=\d{3}(?:[.,]|$))/g, '');
  s = s.replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// Formatea número a "$6,000" o "Consultar" si es 0
const fmt = n => {
  const num = parsePrecio(n);
  return num > 0
    ? '$' + num.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : 'Consultar';
};

// Convierte "Sí" / "Si" / "SI" / "TRUE" / "1" → true
const esSi = v => /^(sí|si|yes|true|1)$/i.test(String(v || '').trim());

/* ── Normaliza una fila cruda de SheetDB al modelo interno ── */
function normalize(raw) {
  const pe = parsePrecio(raw.precio_efectivo);
  const pr = parsePrecio(raw.precio_regular);

  // Aviso si el precio llegó en formato inesperado
  if (pe === 0 && raw.precio_efectivo &&
      String(raw.precio_efectivo).trim() !== '' &&
      String(raw.precio_efectivo).trim() !== '0') {
    console.warn('[Romara] precio_efectivo no parseado:', JSON.stringify(raw.precio_efectivo));
  }

  return {
    nombre    : (raw.nombre_del_servicio    || '').trim(),
    cat       : (raw.categoria              || '').trim(),
    desc      : (raw.descripcion            || '').trim(),
    pe, pr,
    dur       : (raw.duracion_procedimiento || '').trim(),
    rec       : (raw.recuperacion           || '').trim(),
    efecto    : (raw.efecto_duracion        || '').trim(),
    anest     : (raw.anestesia              || '').trim(),
    activo    : esSi(raw.activo_si_no),
    promo     : esSi(raw.promocion_si_no),
    destacado : esSi(raw.destacado),
    txtPromo  : (raw.texto_promo            || '').trim(),
    orden     : parseInt(raw.orden, 10) || 99,
  };
}

/* ── Validación de caché ── */
function validateCache(data) {
  if (!Array.isArray(data) || data.length === 0) return false;
  // Si todos los precios son 0, probablemente es caché corrupta
  if (!data.some(s => s.pe > 0)) {
    console.warn('[Romara] Caché corrupta (todos los precios = 0). Limpiando...');
    localStorage.removeItem(CACHE_KEY);
    return false;
  }
  return true;
}

/* ── Caché con TTL ── */
function cacheGet() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) { localStorage.removeItem(CACHE_KEY); return null; }
    if (!validateCache(data)) return null;
    return data;
  } catch { return null; }
}
function cacheSet(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

/* ── Estados de carga en UI ── */
function showGridLoading() {
  document.getElementById('srvGrid').innerHTML = `
    <div class="loading-sk" style="padding:4rem 2rem;flex-direction:column;gap:.8rem">
      <div style="width:32px;height:32px;border:1px solid rgba(201,169,110,.3);
        border-top-color:var(--dorado);border-radius:50%;animation:spin .9s linear infinite"></div>
      <span style="font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gris)">
        Cargando tratamientos…
      </span>
    </div>`;
}
function showGridError(msg) {
  document.getElementById('srvGrid').innerHTML = `
    <div style="text-align:center;padding:4rem 2rem">
      <p style="font-size:.82rem;color:var(--gris);line-height:1.8;max-width:360px;margin:0 auto 1.5rem">${msg}</p>
      <a href="https://wa.me/523334043771" target="_blank" class="btn-p" style="display:inline-flex">
        <span>Consultar por WhatsApp</span><span class="arr">→</span>
      </a>
    </div>`;
}

/* ── Spinner CSS ── */
(function() {
  if (document.getElementById('spin-css')) return;
  const s = document.createElement('style');
  s.id = 'spin-css';
  s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
})();

/* ── Fetch de datos con caché ── */
async function loadData() {
  // 1. Intenta caché primero (evita request innecesario)
  const cached = cacheGet();
  if (cached) {
    console.info('[Romara] Datos desde caché (%d servicios)', cached.length);
    return cached;
  }

  // 2. Llama a la API
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) throw new Error('API devolvió lista vacía');

    // Normaliza y filtra solo los activos
    const data = json
      .map(normalize)
      .filter(s => s.activo && s.nombre);

    cacheSet(data);
    console.info('[Romara] Datos desde API (%d servicios activos)', data.length);
    return data;

  } catch (err) {
    console.warn('[Romara] API no disponible:', err.message);

    // Fallback: usar caché aunque esté vencida
    // (mejor dato viejo que página rota)
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { data } = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) {
          console.info('[Romara] Usando caché vencida como fallback');
          return data;
        }
      }
    } catch {}

    return null; // Sin datos disponibles
  }
}

/* ══════════════════════════════════════════════════════════
   ORDENAMIENTO
   Regla: destacado primero → orden ascendente → nombre
   Categorías fijas: Labios primero
══════════════════════════════════════════════════════════ */
const CAT_ORDER = ['Labios y Fillers','Contorno Facial','Toxinas','Bioestimulación','Enzimas'];

function sortData(data) {
  return [...data].sort((a, b) => {
    // 1. Orden de categoría
    const ai = CAT_ORDER.indexOf(a.cat), bi = CAT_ORDER.indexOf(b.cat);
    const catA = ai === -1 ? 99 : ai, catB = bi === -1 ? 99 : bi;
    if (catA !== catB) return catA - catB;

    // 2. Destacados primero dentro de su categoría
    if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;

    // 3. Por número de orden
    if (a.orden !== b.orden) return a.orden - b.orden;

    // 4. Alfabético como desempate
    return a.nombre.localeCompare(b.nombre, 'es');
  });
}

/* ── Mensaje de WhatsApp personalizado por servicio ── */
function waMsg(nombre) {
  return encodeURIComponent(
    `Hola, me interesa el servicio de ${nombre} en Romara Aesthetics. ¿Cuál es su disponibilidad esta semana?`
  );
}

/* ── Badges de urgencia (usa texto_promo del Sheet si existe) ── */
const BADGES_DEFAULT = ['🔥 Alta demanda','⚡ Promo del mes','🔥 Últimos lugares','⚡ Precio especial'];
function getBadge(s, idx) {
  return s.txtPromo || BADGES_DEFAULT[idx % BADGES_DEFAULT.length];
}

/* ══════════════════════════════════════════════════════════
   RENDER — ACORDEÓN DE SERVICIOS
══════════════════════════════════════════════════════════ */
function renderAcordeon(data, cat = 'todos') {
  const grid = document.getElementById('srvGrid');
  const filtered = cat === 'todos' ? data : data.filter(s => s.cat === cat);
  const sorted   = sortData(filtered);

  if (!sorted.length) {
    grid.innerHTML = `<div style="padding:3rem 2rem;text-align:center;color:var(--gris);font-size:.85rem">
      Sin servicios en esta categoría por el momento.</div>`;
    return;
  }

  grid.innerHTML = sorted.map((s, i) => {
    const esLabios = s.cat === 'Labios y Fillers';

    // Solo muestra metadatos que tienen valor real
    const metaItems = [
      s.dur    && !['Variable','No aplica','—',''].includes(s.dur)
        ? `<div class="srv-pm-item"><div class="srv-pm-label">Duración</div><div class="srv-pm-val">${s.dur}</div></div>` : '',
      s.efecto && !['No aplica','—',''].includes(s.efecto)
        ? `<div class="srv-pm-item"><div class="srv-pm-label">Efecto</div><div class="srv-pm-val">${s.efecto}</div></div>` : '',
      s.rec    && !['No aplica','—',''].includes(s.rec)
        ? `<div class="srv-pm-item"><div class="srv-pm-label">Recuperación</div><div class="srv-pm-val">${s.rec}</div></div>` : '',
      s.anest  && !['No aplica','—',''].includes(s.anest)
        ? `<div class="srv-pm-item"><div class="srv-pm-label">Anestesia</div><div class="srv-pm-val">${s.anest}</div></div>` : '',
    ].filter(Boolean).join('');

    return `
    <div class="srv-row${esLabios ? ' srv-row--labios' : ''}${s.destacado ? ' srv-row--dest' : ''}"
      style="opacity:0;transform:translateY(10px);transition:opacity .4s ${i * .03}s,transform .4s ${i * .03}s">
      <div class="srv-row-head">
        <div class="srv-row-head-left">
          <span class="srv-row-cat">${s.cat}</span>
          ${s.promo     ? '<span class="srv-row-promo">🔥 Promo</span>' : ''}
          ${s.destacado ? '<span class="srv-row-dest-badge">★</span>'   : ''}
          <span class="srv-row-nombre">${s.nombre}</span>
        </div>
        <div class="srv-row-head-right">
          <span class="srv-row-precio">${fmt(s.pe)}</span>
          <span class="srv-row-toggle">+</span>
        </div>
      </div>
      <div class="srv-panel">
        <div class="srv-panel-inner">
          <div>
            ${s.desc ? `<p class="srv-panel-desc">${s.desc}</p>` : ''}
            ${metaItems ? `<div class="srv-panel-meta">${metaItems}</div>` : ''}
          </div>
          <div class="srv-panel-cta">
            <div class="srv-panel-precio-wrap">
              ${s.promo ? '<div class="srv-panel-plabel">Precio efectivo</div>' : ''}
              <div class="srv-panel-precio">${fmt(s.pe)}</div>
              ${(s.pr && s.pr > s.pe) ? `<div class="srv-panel-preg">${fmt(s.pr)} regular</div>` : ''}
            </div>
            <a href="https://wa.me/523334043771?text=${waMsg(s.nombre)}"
              target="_blank" class="btn-p"
              style="white-space:nowrap;font-size:.65rem;padding:.8rem 1.5rem">
              <span>Agendar ${s.nombre}</span><span class="arr">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  // Animar entrada
  requestAnimationFrame(() => {
    document.querySelectorAll('.srv-row').forEach((el, i) => {
      setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, i * 30);
    });
  });

  // Acordeón click
  grid.querySelectorAll('.srv-row-head').forEach(head => {
    head.addEventListener('click', () => {
      const row    = head.closest('.srv-row');
      const isOpen = row.classList.contains('open');
      grid.querySelectorAll('.srv-row.open').forEach(r => r.classList.remove('open'));
      if (!isOpen) row.classList.add('open');
    });
    addHover(head);
  });
}

/* ── Render tabs de categoría ── */
function renderTabs(data) {
  const catsFromData  = [...new Set(data.map(s => s.cat).filter(Boolean))];
  const orderedCats   = CAT_ORDER.filter(c => catsFromData.includes(c));
  const remainingCats = catsFromData.filter(c => !CAT_ORDER.includes(c));
  const cats          = ['todos', ...orderedCats, ...remainingCats];

  const tabs = document.getElementById('catTabs');
  tabs.innerHTML = cats.map(c =>
    `<button class="cat-tab${c === 'todos' ? ' active' : ''}" data-cat="${c}">
      ${c === 'todos' ? 'Todos' : c}
    </button>`
  ).join('');

  tabs.addEventListener('click', e => {
    const btn = e.target.closest('.cat-tab');
    if (!btn) return;
    tabs.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderAcordeon(data, btn.dataset.cat);
  });
}

/* ── Render sección de promociones ── */
function renderPromos(data) {
  // Solo promos activas, labios primero, máximo 6
  const promos = sortData(data.filter(s => s.promo && s.pe > 0)).slice(0, 6);
  const g      = document.getElementById('promoGrid');

  if (!promos.length) {
    g.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--gris);
      font-size:.85rem;grid-column:1/-1">Próximamente nuevas promociones.</div>`;
    return;
  }

  g.innerHTML = promos.map((s, i) => `
    <div class="promo-c reveal">
      <div class="promo-urgencia-badge">${getBadge(s, i)}</div>
      <div class="promo-name">${s.nombre}</div>
      <p class="promo-desc">${s.desc.length > 85 ? s.desc.substring(0, 85) + '…' : s.desc}</p>
      <div class="promo-sav">
        <div class="promo-pe">${fmt(s.pe)}</div>
        ${(s.pr && s.pr > s.pe) ? `<div class="promo-pr">${fmt(s.pr)}</div>` : ''}
      </div>
      <a href="https://wa.me/523334043771?text=${waMsg(s.nombre)}"
        target="_blank" class="promo-cta-link">
        <span>Quiero esta promo</span><span>→</span>
      </a>
    </div>`
  ).join('');

  document.querySelectorAll('#promoGrid .reveal').forEach(el => ro.observe(el));
}

/* ══════════════════════════════════════════════════════════
   INIT — orquesta todo con un solo fetch
══════════════════════════════════════════════════════════ */
(async () => {
  showGridLoading();
  const data = await loadData();

  if (!data) {
    showGridError('No pudimos cargar los servicios.<br>Escríbenos directamente y te asesoramos.');
    document.getElementById('promoGrid').innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--gris);font-size:.82rem;grid-column:1/-1">
        Escríbenos por WhatsApp para conocer las promociones actuales.
      </div>`;
    return;
  }

  renderTabs(data);
  renderAcordeon(data);
  renderPromos(data);
})();

/* ── Smooth scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' }); }
  });
});
