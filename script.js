(function () {
  /* ---------------- Menús (SHOP / COLLECTION) ---------------- */
  const header = document.getElementById('siteHeader');
  const items = Array.from(document.querySelectorAll('.has-menu'));
  const timers = new WeakMap();

  function anyOpen() { return items.some((i) => i.classList.contains('is-open')); }

  function open(item) {
    clearTimeout(timers.get(item));
    items.forEach((other) => { if (other !== item) close(other); });
    item.classList.add('is-open');
    header.classList.add('is-open');
    item.querySelector('.nav-link').setAttribute('aria-expanded', 'true');
  }
  function close(item) {
    item.classList.remove('is-open');
    item.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
    if (!anyOpen()) header.classList.remove('is-open');
  }
  function closeSoon(item) {
    clearTimeout(timers.get(item));
    timers.set(item, setTimeout(() => close(item), 120));
  }
  function closeAll() { items.forEach(close); }

  items.forEach((item) => {
    const link = item.querySelector('.nav-link');
    item.addEventListener('mouseenter', () => open(item));
    item.addEventListener('mouseleave', () => closeSoon(item));
    item.addEventListener('focusin', () => open(item));
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) closeSoon(item); });
    link.addEventListener('click', (e) => {
      if (!item.classList.contains('is-open')) { e.preventDefault(); open(item); }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeAll(); document.activeElement.blur(); }
  });
  document.addEventListener('click', (e) => {
    items.forEach((item) => { if (!item.contains(e.target)) close(item); });
  });

  /* ---------------- Productos (datos de ejemplo) ---------------- */
  // img: pon aquí la ruta de la foto real, p. ej. "img/corset.jpg"
  const PRODUCTS = [
    { name: 'Bow Lace Corset Top',   price: 48,  type: 'top',    col: 'dreamy-blooms',       isNew: true,  color: '#f3efe6' },
    { name: 'Bow Lace Mini Skirt',   price: 42,  type: 'bottom', col: 'dreamy-blooms',       isNew: false, color: '#f6f2ea' },
    { name: 'Satin Cowl Maxi Dress', price: 89,  type: 'dress',  col: 'the-sparkling-touch', isNew: false, color: '#a9c9ec' },
    { name: 'Pink Bubble Midi Dress',price: 95,  type: 'dress',  col: 'heartfelt-petals',    isNew: true,  color: '#f2c9d4' },
    { name: 'Heartfelt Satin Top',   price: 52,  type: 'top',    col: 'heartfelt-petals',    isNew: false, color: '#f4d3dc' },
    { name: 'Crimson Slip Gown',     price: 112, type: 'dress',  col: 'the-sparkling-touch', isNew: true,  color: '#b3202d' },
    { name: 'Petal Pleated Skirt',   price: 58,  type: 'bottom', col: 'dreamy-blooms',       isNew: false, color: '#f1c9d5' },
    { name: 'Sparkle Cami Top',      price: 46,  type: 'top',    col: 'the-sparkling-touch', isNew: false, color: '#d9d4cf' },
  ].map((p, i) => Object.assign({ rank: i }, p));

  const TITLES = {
    'all-items': 'All Products', 'new-arrivals': 'New Arrivals', 'dress': 'Dress', 'top': 'Top', 'bottom': 'Bottom',
    'dreamy-blooms': 'Dreamy Blooms', 'heartfelt-petals': 'Heartfelt Petals', 'the-sparkling-touch': 'The Sparkling Touch',
  };

  const home = document.getElementById('home');
  const listing = document.getElementById('products');
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const titleEl = document.getElementById('listTitle');
  const sortEl = document.getElementById('sort');
  const shopLink = document.getElementById('shopLink');
  let current = { kind: 'shop', slug: 'all-items' };

  function filtered() {
    const { kind, slug } = current;
    let list = PRODUCTS.slice();
    if (kind === 'collection') list = list.filter((p) => p.col === slug);
    else if (slug === 'new-arrivals') list = list.filter((p) => p.isNew);
    else if (slug !== 'all-items') list = list.filter((p) => p.type === slug);

    const s = sortEl.value;
    if (s === 'low') list.sort((a, b) => a.price - b.price);
    else if (s === 'high') list.sort((a, b) => b.price - a.price);
    else if (s === 'newest') list.sort((a, b) => Number(b.isNew) - Number(a.isNew) || a.rank - b.rank);
    else list.sort((a, b) => a.rank - b.rank);
    return list;
  }

  /* Tarjeta con galería: al pasar el cursor cambia de vista, las flechas navegan */
  const CHEV_L = '<svg viewBox="0 0 11 18"><path d="M9.500 1L1.500 9l8 8"/></svg>';
  const CHEV_R = '<svg viewBox="0 0 11 18"><path d="M1.500 1l8 8-8 8"/></svg>';

  function buildCard(p) {
    const art = document.createElement('article');
    art.className = 'card';
    // p.imgs = 4 fotos reales (frente, lado, 3/4, acercamiento); si no hay, se usan 4 vistas de reemplazo
    const slides = (p.imgs && p.imgs.length)
      ? p.imgs.map((src) => '<img class="slide" src="' + src + '" alt="' + p.name + '">')
      : [0, 1, 2, 3].map((v) => '<div class="slide"><div class="fig fig--' + p.type + ' fig--v' + v + '" style="--c:' + p.color + '" role="img" aria-label="' + p.name + '"></div></div>');
    art.innerHTML =
      '<div class="card-img">' + slides.join('') +
        '<a class="card-hit" href="#" aria-label="' + p.name + '"></a>' +
        '<button class="arrow arrow--prev" type="button" aria-label="Previous image">' + CHEV_L + '</button>' +
        '<button class="arrow arrow--next" type="button" aria-label="Next image">' + CHEV_R + '</button>' +
      '</div>' +
      '<a class="card-meta" href="#"><span class="card-name">' + p.name + '</span>' +
      '<span class="card-price">$' + p.price.toFixed(0) + '</span></a>';

    const els = art.querySelectorAll('.slide');
    const media = art.querySelector('.card-img');
    let i = 0;
    function show(n) {
      i = (n + els.length) % els.length;
      els.forEach((s, k) => s.classList.toggle('is-on', k === i));
    }
    show(0);
    media.addEventListener('mouseenter', () => { if (i === 0 && els.length > 1) show(1); });
    media.addEventListener('mouseleave', () => show(0));
    art.querySelector('.arrow--prev').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); show(i - 1); });
    art.querySelector('.arrow--next').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); show(i + 1); });
    return art;
  }

  function renderGrid() {
    const list = filtered();
    grid.innerHTML = '';
    list.forEach((p) => grid.appendChild(buildCard(p)));
    empty.hidden = list.length > 0;
  }

  /* ---------------- Router por hash ---------------- */
  const login = document.getElementById('login');
  const cartView = document.getElementById('cart');
  const views = [home, listing, login, cartView];

  function show(view) { views.forEach((v) => { v.hidden = v !== view; }); }

  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');   // ["shop","dress"]
    const kind = parts[0], slug = parts[1];
    closeAll();

    if ((kind === 'shop' || kind === 'collection') && TITLES[slug]) {
      current = { kind, slug };
      titleEl.textContent = TITLES[slug];
      document.title = TITLES[slug] + ' – JUBIN';
      sortEl.value = 'best';
      renderGrid();
      show(listing);
      document.body.classList.add('is-products');
      shopLink.classList.remove('is-active');
    } else if (kind === 'cart') {
      document.title = 'Your cart – JUBIN';
      show(cartView);
      document.body.classList.add('is-products');
      shopLink.classList.remove('is-active');
    } else if (kind === 'account' && slug === 'login') {
      document.title = 'Login – JUBIN';
      show(login);
      document.body.classList.add('is-products');   // header blanco con línea
      shopLink.classList.remove('is-active');
    } else {
      show(home);
      document.body.classList.remove('is-products');
      shopLink.classList.add('is-active');
      document.title = 'JUBIN – The perfect wardrobe for Petite Girls';
    }
    window.scrollTo(0, 0);
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  sortEl.addEventListener('change', renderGrid);
  window.addEventListener('hashchange', route);

  /* ---------------- Formularios (demo, sin servidor) ---------------- */
  const okEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
  function say(id, text) { document.getElementById(id).textContent = text; }

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('lEmail').value;
    const pass = document.getElementById('lPass').value;
    if (!okEmail(email) || !pass) return say('loginMsg', 'Enter a valid email and your password.');
    say('loginMsg', 'Demo only: connect a store or backend to sign in.');
  });
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = document.getElementById('cName').value.trim();
    const m = document.getElementById('cMsg').value.trim();
    if (!n || !okEmail(document.getElementById('cEmail').value) || !m) return say('contactMsg', 'Please fill in your name, a valid email and a message.');
    e.target.reset();
    say('contactMsg', 'Thanks! We will get back to you soon.');
  });
  document.getElementById('newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!okEmail(document.getElementById('nEmail').value)) return say('newsMsg', 'Enter a valid email.');
    e.target.reset();
    say('newsMsg', 'Thanks for subscribing!');
  });

  // Los enlaces vacíos (#) no deben saltar al inicio
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* ---------------- Búsqueda (la lupa) ---------------- */
  const sOverlay = document.getElementById('searchOverlay');
  const sInput = document.getElementById('searchInput');
  const sSugg = document.getElementById('searchSugg');
  const sResults = document.getElementById('searchResults');
  const sBtn = document.getElementById('searchBtn');

  function searchProducts(q) {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hay = (p) => (p.name + ' ' + p.type + ' ' + p.col.replace(/-/g, ' ') + (p.isNew ? ' new' : '')).toLowerCase();
    const scored = PRODUCTS.map((p) => ({ p, s: tokens.reduce((n, t) => n + (hay(p).includes(t) ? 1 : 0), 0) }));
    const hits = scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.p.rank - b.p.rank);
    if (hits.length) return hits.map((x) => x.p);
    // Sin coincidencias exactas: siempre se muestra algo (lo más parecido por letras)
    const letters = q.toLowerCase().replace(/\s+/g, '');
    return PRODUCTS.map((p) => ({ p, s: Array.from(new Set(letters)).filter((ch) => hay(p).includes(ch)).length }))
      .sort((a, b) => b.s - a.s || a.p.rank - b.p.rank).map((x) => x.p);
  }

  function updateSearch() {
    const q = sInput.value.trim();
    sOverlay.classList.toggle('has-query', !!q);
    sSugg.hidden = !q;
    sResults.innerHTML = '';
    if (!q) return;
    sSugg.innerHTML = 'Suggestions: ';
    [q, q + ' skirt'].forEach((text, n) => {
      const b = document.createElement('button');
      b.type = 'button';
      if (n === 1) { b.appendChild(document.createTextNode(q + ' ')); const d = document.createElement('span'); d.className = 'dim'; d.textContent = 'skirt'; b.appendChild(d); }
      else b.textContent = q;
      b.addEventListener('click', () => { sInput.value = text; updateSearch(); sInput.focus(); });
      sSugg.appendChild(b);
    });
    searchProducts(q).forEach((p) => sResults.appendChild(buildCard(p)));
  }

  function openSearch() {
    closeAll();
    sOverlay.hidden = false;
    document.documentElement.classList.add('search-open');
    sBtn.setAttribute('aria-expanded', 'true');
    sInput.focus();
  }
  function closeSearch() {
    if (sOverlay.hidden) return;
    sOverlay.hidden = true;
    document.documentElement.classList.remove('search-open');
    sBtn.setAttribute('aria-expanded', 'false');
    sInput.value = '';
    updateSearch();
    sBtn.focus();
  }

  sBtn.addEventListener('click', openSearch);
  document.getElementById('searchClose').addEventListener('click', closeSearch);
  sOverlay.addEventListener('click', (e) => { if (e.target === sOverlay) closeSearch(); });
  sInput.addEventListener('input', updateSearch);
  document.getElementById('searchForm').addEventListener('submit', (e) => { e.preventDefault(); updateSearch(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

  /* ---------------- Menú lateral móvil ---------------- */
  const drawer = document.getElementById('drawer');
  const scrim = document.getElementById('drawerScrim');
  const menuBtn = document.getElementById('menuBtn');
  const drawerBody = drawer.querySelector('.drawer-body');
  const panels = Array.from(drawer.querySelectorAll('.drawer-panel'));
  const feat = document.getElementById('featScroll');
  const thumb = document.getElementById('featThumb');

  PRODUCTS.slice(0, 6).forEach((p) => feat.appendChild(buildCard(p)));

  function showPanel(name) {
    panels.forEach((el) => { el.hidden = el.dataset.panel !== name; });
    drawerBody.scrollTop = 0;
  }
  function updateThumb() {
    const total = feat.scrollWidth, view = feat.clientWidth;
    if (!total || !view) return;
    const w = Math.min(1, view / total);
    const max = feat.scrollWidth - feat.clientWidth || 1;
    thumb.style.width = (w * 100) + '%';
    thumb.style.left = ((feat.scrollLeft / max) * (1 - w) * 100) + '%';
  }
  function openDrawer() {
    closeAll();
    showPanel('main');
    drawer.classList.add('is-open');
    scrim.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('drawer-open');
    requestAnimationFrame(updateThumb);
    document.getElementById('drawerClose').focus();
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('drawer-open');
    menuBtn.focus();
  }

  menuBtn.addEventListener('click', openDrawer);
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', (e) => {
    const sub = e.target.closest('[data-sub]');
    if (sub) return showPanel(sub.dataset.sub);
    if (e.target.closest('[data-back]')) return showPanel('main');
    if (e.target.closest('a')) closeDrawer();
  });
  feat.addEventListener('scroll', updateThumb, { passive: true });
  window.addEventListener('resize', updateThumb);
  window.addEventListener('hashchange', closeDrawer);
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) closeDrawer(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  /* Insignia del carrito: JUBIN.setCartCount(1) la muestra */
  window.JUBIN = { setCartCount(n) {
    const b = document.getElementById('cartCount');
    b.textContent = n; b.hidden = !n;
  } };

  route();
})();


/* =====================================================
   INICIO: video (con reemplazo) y fotos pasando
   ===================================================== */
(function () {
  /* Video: los .mp4 están sueltos junto a index.html.
     Cambia aquí los nombres si tus archivos se llaman distinto. */
  var VIDEO_PC = 'hero-pc.mp4';      // pantallas grandes (computadora)
  var VIDEO_MOBILE = 'hero.mp4';     // celular / tablet

  var box = document.getElementById('heroVideoBox');
  var video = document.getElementById('heroVideo');
  if (video) {
    var desktop = window.matchMedia('(min-width: 961px)');
    var current = null, triedOther = false;

    var load = function (file) {
      current = file;
      video.src = file;
      video.load();
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* autoplay bloqueado: queda el reemplazo */ });
    };
    var choose = function () {
      triedOther = false;
      box.classList.remove('has-video');
      load(desktop.matches ? VIDEO_PC : VIDEO_MOBILE);
    };

    video.addEventListener('playing', function () { box.classList.add('has-video'); });
    video.addEventListener('error', function () {
      if (!triedOther) {                       // si falta uno, prueba con el otro
        triedOther = true;
        load(current === VIDEO_PC ? VIDEO_MOBILE : VIDEO_PC);
      } else {
        box.classList.remove('has-video');     // ninguno carga: se ve el fondo animado
      }
    });
    desktop.addEventListener('change', choose); // al cambiar de tamaño, cambia de video
    choose();
  }

  /* Fotos pasando */
  var show = document.getElementById('photoShow');
  if (!show) return;
  var items = Array.prototype.slice.call(show.querySelectorAll('.show-item'));
  var dots = Array.prototype.slice.call(show.querySelectorAll('.show-dots button'));
  var i = 0, timer = null;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function go(n) {
    i = (n + items.length) % items.length;
    items.forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
    dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
  }
  function play() { if (reduce || timer) return; timer = setInterval(function () { go(i + 1); }, 4500); }
  function stop() { clearInterval(timer); timer = null; }

  show.querySelector('.show-arrow--prev').addEventListener('click', function () { go(i - 1); });
  show.querySelector('.show-arrow--next').addEventListener('click', function () { go(i + 1); });
  dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
  show.addEventListener('mouseenter', stop);
  show.addEventListener('mouseleave', play);
  show.addEventListener('focusin', stop);
  show.addEventListener('focusout', play);
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : play(); });

  var x0 = null;   // deslizar con el dedo
  show.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  show.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  play();
})();