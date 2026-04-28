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
/* ══════════════════════════════════════════════════════════
   SERVICIOS — datos hardcodeados
   ─────────────────────────────────────────────────────────
   Para editar: cambia los valores directamente aquí.
   
   Campos de cada servicio:
     nombre    → nombre visible en la página
     cat       → categoría (debe coincidir con CAT_ORDER)
     desc      → descripción corta
     pe        → precio en efectivo (número)
     pr        → precio regular con tarjeta (número, 0 si igual)
     dur       → duración del procedimiento
     efecto    → duración del efecto
     rec       → tiempo de recuperación
     anest     → tipo de anestesia
     promo     → true/false → aparece en sección Promociones
     destacado → true/false → aparece primero en su categoría
     txtPromo  → badge: "Alta demanda" / "Promo del mes" / etc
     orden     → número para ordenar dentro de su categoría
══════════════════════════════════════════════════════════ */

const SERVICIOS = [

  /* ── LABIOS Y FILLERS ── */
  {
    nombre: 'Aumento de Labios con Ácido Hialurónico',
    cat: 'Labios y Fillers',
    desc: 'Hidrata, define y voluminiza los labios con resultado discreto y natural. Tratamiento estrella de Romara.',
    pe: 6000, pr: 7200,
    dur: '20 min aprox', efecto: '6 a 12 meses', rec: 'No aplica', anest: 'Tópica',
    promo: true, destacado: true, txtPromo: '🔥 Alta demanda', orden: 1
  },
  {
    nombre: 'Russian Lips',
    cat: 'Labios y Fillers',
    desc: 'Técnica estrella de Romara Aesthetics. Mayor definición y volumen que técnicas convencionales.',
    pe: 6000, pr: 7200,
    dur: '20 min aprox', efecto: '9 a 12 meses', rec: 'No aplica', anest: 'Tópica',
    promo: true, destacado: true, txtPromo: '⚡ Promo del mes', orden: 2
  },
  {
    nombre: 'Nefertiti Lips',
    cat: 'Labios y Fillers',
    desc: 'Técnica NUEVA Y EXCLUSIVA de Romara. Labios voluminosos con definición sutil. Combina relleno y toxina.',
    pe: 6500, pr: 7800,
    dur: '30 min aprox', efecto: '6 a 12 meses', rec: '3 a 5 días', anest: 'Tópica',
    promo: true, destacado: true, txtPromo: '🔥 Últimos lugares', orden: 3
  },
  {
    nombre: 'Rellenos con Ácido Hialurónico — Fillers Faciales',
    cat: 'Labios y Fillers',
    desc: 'Definen, hidratan, rejuvenecen y reposicionan diferentes zonas del rostro según las necesidades de cada paciente.',
    pe: 6000, pr: 7200,
    dur: '20 min aprox', efecto: '6 a 12 meses', rec: '2 a 3 días', anest: 'Tópica',
    promo: true, destacado: false, txtPromo: '', orden: 4
  },
  {
    nombre: 'Relleno de Ojeras con Ácido Hialurónico',
    cat: 'Labios y Fillers',
    desc: 'Disimula y minimiza el hundimiento de la zona. Logra mirada fresca y aspecto juvenil.',
    pe: 6000, pr: 7200,
    dur: '20 min aprox', efecto: '6 a 9 meses', rec: '2 a 3 días', anest: 'Tópica',
    promo: true, destacado: false, txtPromo: '', orden: 5
  },

  /* ── CONTORNO FACIAL ── */
  {
    nombre: 'Rinomodelación con Ácido Hialurónico',
    cat: 'Contorno Facial',
    desc: 'Mejora el aspecto de la nariz sin cirugía. Alternativa no invasiva para mejorar el perfil y la armonía facial.',
    pe: 6500, pr: 7800,
    dur: '20 min aprox', efecto: '6 a 12 meses', rec: '2 a 3 días', anest: 'Tópica',
    promo: true, destacado: false, txtPromo: '⚡ Precio especial', orden: 1
  },
  {
    nombre: 'Bichectomía con Ácido Hialurónico',
    cat: 'Contorno Facial',
    desc: 'Reduce el volumen de las mejillas para un rostro más definido y estilizado, sin cirugía.',
    pe: 7000, pr: 8500,
    dur: '30 min aprox', efecto: 'Permanente', rec: '5 a 7 días', anest: 'Local',
    promo: false, destacado: false, txtPromo: '', orden: 2
  },
  {
    nombre: 'Mentón y Mandíbula',
    cat: 'Contorno Facial',
    desc: 'Define y proyecta el mentón y la mandíbula para un perfil más armonioso y estructurado.',
    pe: 6500, pr: 7800,
    dur: '20 min aprox', efecto: '12 a 18 meses', rec: '2 a 3 días', anest: 'Tópica',
    promo: false, destacado: false, txtPromo: '', orden: 3
  },
  {
    nombre: 'Armonización Facial',
    cat: 'Contorno Facial',
    desc: 'Tratamiento integral que combina diferentes técnicas para equilibrar y realzar los rasgos del rostro de forma natural.',
    pe: 12000, pr: 15000,
    dur: '60 min aprox', efecto: '6 a 12 meses', rec: '3 a 5 días', anest: 'Tópica',
    promo: false, destacado: false, txtPromo: '', orden: 4
  },

  /* ── TOXINAS ── */
  {
    nombre: 'Toxina Botulínica — Botox',
    cat: 'Toxinas',
    desc: 'Relaja los músculos de expresión para suavizar líneas y arrugas. Resultado natural y preventivo.',
    pe: 5500, pr: 6500,
    dur: '20 min aprox', efecto: '3 a 6 meses', rec: 'No aplica', anest: 'No aplica',
    promo: true, destacado: false, txtPromo: '🔥 Alta demanda', orden: 1
  },
  {
    nombre: 'Tratamiento para Bruxismo con Toxina Botulínica',
    cat: 'Toxinas',
    desc: 'Relaja el músculo masetero para reducir el bruxismo y afinar el óvalo facial como beneficio estético.',
    pe: 6000, pr: 7200,
    dur: '20 min aprox', efecto: '4 a 6 meses', rec: 'No aplica', anest: 'No aplica',
    promo: true, destacado: false, txtPromo: '', orden: 2
  },
  {
    nombre: 'Perfilado de Cejas con Toxina Botulínica',
    cat: 'Toxinas',
    desc: 'Eleva y arquea las cejas con toxina para una mirada más abierta y expresiva sin cirugía.',
    pe: 4500, pr: 5500,
    dur: '15 min aprox', efecto: '3 a 4 meses', rec: 'No aplica', anest: 'No aplica',
    promo: false, destacado: false, txtPromo: '', orden: 3
  },
  {
    nombre: 'Toxina Botulínica — Cuello (Nefertiti Lift)',
    cat: 'Toxinas',
    desc: 'Levanta y define el cuello y el óvalo facial con toxina botulínica. Efecto lifting sin cirugía.',
    pe: 6000, pr: 7200,
    dur: '20 min aprox', efecto: '3 a 4 meses', rec: 'No aplica', anest: 'No aplica',
    promo: false, destacado: false, txtPromo: '', orden: 4
  },

  /* ── BIOESTIMULACIÓN ── */
  {
    nombre: 'Bioestimulador de Colágeno — Sculptra / Radiesse',
    cat: 'Bioestimulación',
    desc: 'Estimula la producción natural de colágeno para recuperar volumen y firmeza de forma progresiva.',
    pe: 9500, pr: 11500,
    dur: '30 min aprox', efecto: 'Hasta 2 años', rec: '3 a 5 días', anest: 'Tópica',
    promo: false, destacado: false, txtPromo: '', orden: 1
  },
  {
    nombre: 'Matrix — Biorevitalización',
    cat: 'Bioestimulación',
    desc: 'Mejora la calidad, hidratación y luminosidad de la piel desde adentro. Ideal para piel apagada o deshidratada.',
    pe: 4500, pr: 5500,
    dur: '30 min aprox', efecto: '4 a 6 meses', rec: '2 a 3 días', anest: 'Tópica',
    promo: false, destacado: false, txtPromo: '', orden: 2
  },

  /* ── ENZIMAS ── */
  {
    nombre: 'Enzimas — Mesoterapia Facial',
    cat: 'Enzimas',
    desc: 'Tratamiento inyectable que hidrata, nutre y revitaliza la piel. Ideal para mejorar textura y tono.',
    pe: 3500, pr: 4200,
    dur: '20 min aprox', efecto: '3 a 4 meses', rec: '1 a 2 días', anest: 'Tópica',
    promo: false, destacado: false, txtPromo: '', orden: 1
  },
  {
    nombre: 'Enzimas — Papada',
    cat: 'Enzimas',
    desc: 'Reduce la grasa localizada en la papada de forma no quirúrgica mediante inyección de enzimas lipolíticas.',
    pe: 4500, pr: 5500,
    dur: '20 min aprox', efecto: 'Permanente', rec: '3 a 5 días', anest: 'Tópica',
    promo: false, destacado: false, txtPromo: '', orden: 2
  },
  {
    nombre: 'Enzimas — Corporal',
    cat: 'Enzimas',
    desc: 'Aplicación de enzimas en zonas con grasa localizada para reducir medidas sin cirugía.',
    pe: 4000, pr: 5000,
    dur: '30 min aprox', efecto: 'Permanente', rec: '2 a 4 días', anest: 'Tópica',
    promo: false, destacado: false, txtPromo: '', orden: 3
  },

];

/* ══════════════════════════════════════════════════════════
   UTILIDADES
══════════════════════════════════════════════════════════ */

// Formatea número a "$6,000"
const fmt = n =>
  n > 0
    ? '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : 'Consultar';

// Mensaje WhatsApp personalizado
const waMsg = nombre =>
  encodeURIComponent(
    `Hola, me interesa el servicio de ${nombre} en Romara Aesthetics. ¿Cuál es su disponibilidad esta semana?`
  );

// Badges por defecto si txtPromo está vacío
const BADGES = ['🔥 Alta demanda','⚡ Promo del mes','🔥 Últimos lugares','⚡ Precio especial'];
const getBadge = (s, i) => s.txtPromo || BADGES[i % BADGES.length];

/* ── Orden de categorías ── */
const CAT_ORDER = ['Labios y Fillers','Contorno Facial','Toxinas','Bioestimulación','Enzimas'];

function sortData(data) {
  return [...data].sort((a, b) => {
    const ai = CAT_ORDER.indexOf(a.cat), bi = CAT_ORDER.indexOf(b.cat);
    const ca = ai === -1 ? 99 : ai, cb = bi === -1 ? 99 : bi;
    if (ca !== cb) return ca - cb;
    if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
    if (a.orden !== b.orden) return a.orden - b.orden;
    return a.nombre.localeCompare(b.nombre, 'es');
  });
}

/* ══════════════════════════════════════════════════════════
   RENDER — ACORDEÓN DE SERVICIOS
══════════════════════════════════════════════════════════ */
function renderAcordeon(data, cat = 'todos') {
  const grid   = document.getElementById('srvGrid');
  const filtered = cat === 'todos' ? data : data.filter(s => s.cat === cat);
  const sorted   = sortData(filtered);

  if (!sorted.length) {
    grid.innerHTML = `<div style="padding:3rem 2rem;text-align:center;color:var(--gris);font-size:.85rem">
      Sin servicios en esta categoría.</div>`;
    return;
  }

  const SKIP = ['Variable','No aplica','—',''];

  grid.innerHTML = sorted.map((s, i) => {
    const esLabios = s.cat === 'Labios y Fillers';
    const metaItems = [
      s.dur    && !SKIP.includes(s.dur)    ? `<div class="srv-pm-item"><div class="srv-pm-label">Duración</div><div class="srv-pm-val">${s.dur}</div></div>`    : '',
      s.efecto && !SKIP.includes(s.efecto) ? `<div class="srv-pm-item"><div class="srv-pm-label">Efecto</div><div class="srv-pm-val">${s.efecto}</div></div>`    : '',
      s.rec    && !SKIP.includes(s.rec)    ? `<div class="srv-pm-item"><div class="srv-pm-label">Recuperación</div><div class="srv-pm-val">${s.rec}</div></div>` : '',
      s.anest  && !SKIP.includes(s.anest)  ? `<div class="srv-pm-item"><div class="srv-pm-label">Anestesia</div><div class="srv-pm-val">${s.anest}</div></div>`  : '',
    ].filter(Boolean).join('');

    return `
    <div class="srv-row${esLabios ? ' srv-row--labios' : ''}${s.destacado ? ' srv-row--dest' : ''}"
      style="opacity:0;transform:translateY(10px);transition:opacity .4s ${i*.03}s,transform .4s ${i*.03}s">
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
              ${s.pr > s.pe ? `<div class="srv-panel-preg">${fmt(s.pr)} regular</div>` : ''}
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

  requestAnimationFrame(() => {
    document.querySelectorAll('.srv-row').forEach((el, i) =>
      setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, i * 30)
    );
  });

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

/* ── Render tabs ── */
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

/* ── Render promociones ── */
function renderPromos(data) {
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
        ${s.pr > s.pe ? `<div class="promo-pr">${fmt(s.pr)}</div>` : ''}
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
   INIT — sin API, datos directos
══════════════════════════════════════════════════════════ */
(function init() {
  renderTabs(SERVICIOS);
  renderAcordeon(SERVICIOS);
  renderPromos(SERVICIOS);
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
