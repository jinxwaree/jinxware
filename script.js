document.getElementById('y').textContent = new Date().getFullYear().toString();

const btn = document.getElementById('startBtn');
if (btn) {
  btn.addEventListener('click', (e) => {
    // Simple demo: prevent jump and show a toast
    e.preventDefault();
    showToast('Thanks for trying the demo! Customize this action.');
  });
}

function showToast(message) {
  const t = document.createElement('div');
  t.textContent = message;
  t.style.position = 'fixed';
  t.style.left = '50%';
  t.style.bottom = '24px';
  t.style.transform = 'translateX(-50%)';
  t.style.background = 'linear-gradient(135deg, #6d7cff, #20e3b2)';
  t.style.color = '#0b0d10';
  t.style.padding = '10px 14px';
  t.style.borderRadius = '10px';
  t.style.fontWeight = '700';
  t.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
  t.style.zIndex = '9999';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// Animations
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal on scroll
(function() {
  const els = Array.from(document.querySelectorAll('.reveal'));
  if (!els.length) return;
  if (prefersReduced) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });

  els.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 35, 210)}ms`;
    io.observe(el);
  });
})();

// Hero parallax
(function() {
  if (prefersReduced) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 10;
    hero.style.setProperty('--mx', `${x}px`);
    hero.style.setProperty('--my', `${y}px`);
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--mx', '0px');
    hero.style.setProperty('--my', '0px');
  });
})();

// Background particles
(function() {
  if (prefersReduced) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  Object.assign(canvas.style, { position: 'fixed', inset: '0', zIndex: '0', pointerEvents: 'none' });
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, particles = [], running = true;

  function resize() {
    W = canvas.width = Math.floor(window.innerWidth * dpr);
    H = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    initParticles();
  }

  function initParticles() {
    const count = Math.floor((window.innerWidth * window.innerHeight) / 40000);
    const max = Math.max(30, Math.min(100, count));
    particles = new Array(max).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.15 * dpr,
      vy: (Math.random() - 0.5) * 0.15 * dpr,
      r: (Math.random() * 1.2 + 0.4) * dpr,
      a: Math.random() * 0.5 + 0.2
    }));
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      const hue = 220 + (p.x / W) * 80; // bluish to teal
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  step();

  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) step();
  });
})();

// Products filter
(function() {
  const filters = document.querySelector('.filters');
  if (!filters) return;
  const buttons = Array.from(filters.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.card[data-category]'));

  function setActive(btn) {
    buttons.forEach(b => b.classList.toggle('active', b === btn));
  }
  function applyFilter(val) {
    cards.forEach(c => {
      const cat = c.getAttribute('data-category');
      const show = (val === 'all') || (cat === val);
      c.style.display = show ? '' : 'none';
    });
  }

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    e.preventDefault();
    const val = btn.getAttribute('data-filter');
    setActive(btn);
    applyFilter(val);
    const hash = btn.getAttribute('href') || '#all';
    history.replaceState(null, '', hash);
  });

  // Initialize based on URL hash
  const hash = (location.hash || '#all').toLowerCase();
  const btn = buttons.find(b => (b.getAttribute('href') || '').toLowerCase() === hash) || buttons[0];
  setActive(btn);
  applyFilter(btn.getAttribute('data-filter'));
})();


// Modal variant selector
(function() {
  const MODAL = document.getElementById('variant-modal');
  if (!MODAL) return;
  const CONTENT = document.getElementById('variant-content');

  let DATA = {
    cod: {
      name: 'CoD external',
      image: 'assets/cod.jpg',
      imagePos: 'left center',
      variants: [
        { sku: 'cod-day', name: 'Day', price: 5.99, stock: 14 },
        { sku: 'cod-week', name: 'Week', price: 20.00, stock: 15 },
        { sku: 'cod-month', name: 'Month', price: 29.99, stock: 10 },
        { sku: 'cod-lifetime', name: 'Lifetime', price: 99.99, stock: 5 }
      ]
    },
    fortnite: {
      name: 'Fortnite external',
      image: 'assets/fortnite.jpg',
      imagePos: 'left center',
      variants: [
        { sku: 'fn-day', name: 'Day', price: 7.99, stock: null },
        { sku: 'fn-3day', name: '3 Day', price: 15.99, stock: null },
        { sku: 'fn-week', name: 'Week', price: 31.99, stock: null },
        { sku: 'fn-month', name: 'Month', price: 59.99, stock: null },
        { sku: 'fn-lifetime', name: 'Lifetime', price: 269.99, stock: null }
      ]
    }
  };

  // Try to fetch live products from API server, then render any dynamic grids/filters
  (async () => {
    try {
      const base = location.protocol === 'file:' ? 'http://localhost:3001' : '';
      const r = await fetch(`${base}/api/products`, { method: 'GET' });
      if (r.ok) {
        const arr = await r.json();
        const next = {};
        for (const p of arr) {
          next[p.id] = {
            name: p.name,
            image: p.image?.startsWith('/') ? p.image.slice(1) : p.image || DATA[p.id]?.image,
            imagePos: DATA[p.id]?.imagePos || 'center',
            variants: Array.isArray(p.variants) ? p.variants : []
          };
        }
        if (Object.keys(next).length) {
          DATA = { ...DATA, ...next };
        }
      }
    } catch (e) { /* ignore */ }
    renderDynamicProducts();
  })();

  function renderDynamicProducts() {
    const grid = document.getElementById('grid-products');
    if (grid) {
      const items = Object.entries(DATA).map(([id, d]) => {
        const img = d.image || '';
        return `
          <div class="card" data-category="${id}">
            <div class="thumb" data-cat="${id}">
              ${img ? `<img class=\"thumb-img\" src=\"${img}\" alt=\"${d.name}\" loading=\"lazy\" decoding=\"async\" />` : ''}
            </div>
            <h4>${d.name}</h4>
            <div style="margin-top: 8px;"><a class="btn primary buy-btn" href="#" data-product="${id}">Buy</a></div>
          </div>`;
      }).join('');
      grid.innerHTML = items;
    }

    const filters = document.getElementById('filters');
    if (filters) {
      const buttons = [`<a class="btn filter active" href="#all" data-filter="all">All</a>`]
        .concat(Object.entries(DATA).map(([id, d]) => `<a class="btn filter" href="#${id}" data-filter="${id}">${d.name}</a>`));
      filters.classList.add('filters');
      filters.innerHTML = buttons.join(' ');

      // Attach filter behavior
      const btns = Array.from(filters.querySelectorAll('[data-filter]'));
      const cards = Array.from(document.querySelectorAll('.card[data-category]'));
      function setActive(b){ btns.forEach(x => x.classList.toggle('active', x===b)); }
      function apply(val){ cards.forEach(c => { const show = (val==='all') || (c.getAttribute('data-category')===val); c.style.display = show ? '' : 'none'; }); }
      filters.addEventListener('click', (e)=>{ const b=e.target.closest('[data-filter]'); if(!b) return; e.preventDefault(); setActive(b); apply(b.getAttribute('data-filter')); history.replaceState(null,'',b.getAttribute('href')||'#all'); });
      const hash=(location.hash||'#all').toLowerCase(); const def=btns.find(b => (b.getAttribute('href')||'').toLowerCase()===hash) || btns[0]; setActive(def); apply(def.getAttribute('data-filter'));
    }
  }

  function fmtPrice(p) { return p == null ? 'TBD' : `$${Number(p).toFixed(2)}`; }

  function openModal(product) {
    const d = DATA[product];
    if (!d) return;
    document.body.classList.add('modal-open');
    MODAL.hidden = false;
    MODAL.setAttribute('aria-hidden', 'false');

    const options = d.variants.map((v, i) => `
      <button class="variant ${i===0 ? 'selected' : ''}" type="button" data-sku="${v.sku}" data-price="${v.price ?? ''}" data-name="${v.name}">
        <span class="name">${v.name}</span>
        <span class="meta"><span class="stock">${v.stock != null ? v.stock + ' in stock' : ''}</span><span class="vprice">${fmtPrice(v.price)}</span></span>
      </button>
    `).join('');

    CONTENT.innerHTML = `
      <div class="modal-header">
        <img src="${d.image}" alt="${d.name}" style="object-position: ${d.imagePos || 'center'};" />
        <div>
          <h3 id="variant-title" style="margin:0;">${d.name} — Choose a variant</h3>
          <p class="muted" style="margin:4px 0 0;">Select a duration and proceed.</p>
        </div>
      </div>
      <div class="variants">${options}</div>
      <div class="modal-actions">
        <a href="#" class="btn" data-close="true">Cancel</a>
        <a href="#" class="btn primary" id="variant-confirm">Buy ${fmtPrice(d.variants[0]?.price)}</a>
      </div>
    `;

    let current = CONTENT.querySelector('.variant.selected');
    function updateConfirm() {
      const price = current.getAttribute('data-price');
      const btn = CONTENT.querySelector('#variant-confirm');
      btn.textContent = `Buy ${fmtPrice(price === '' ? null : Number(price))}`;
      btn.classList.toggle('disabled', price === '');
    }

    CONTENT.querySelectorAll('.variant').forEach(el => el.addEventListener('click', () => {
      if (current) current.classList.remove('selected');
      current = el; el.classList.add('selected');
      updateConfirm();
    }));

    CONTENT.querySelector('#variant-confirm').addEventListener('click', (e) => {
      e.preventDefault();
      const name = current.getAttribute('data-name');
      const price = current.getAttribute('data-price');
      if (price === '') { showToast('Pricing coming soon'); return; }
      showToast(`Selected ${name} — ${fmtPrice(Number(price))}`);
      closeModal();
    });
  }

  function closeModal() {
    MODAL.hidden = true;
    MODAL.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    CONTENT.innerHTML = '';
  }

  MODAL.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { e.preventDefault(); closeModal(); }
  });
  document.addEventListener('keydown', (e) => { if (!MODAL.hidden && e.key === 'Escape') closeModal(); });

  // Openers: Buy buttons and thumbnails
  document.addEventListener('click', (e) => {
    const buy = e.target.closest('.buy-btn');
    const thumb = e.target.closest('.thumb');
    if (!buy && !thumb) return;
    e.preventDefault();
    const card = (buy || thumb).closest('.card[data-category]');
    const product = buy?.getAttribute('data-product') || card?.getAttribute('data-category');
    if (product) openModal(product);
  });
})();

// Typewriter effect
(function() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  let strings = [el.getAttribute('aria-label') || ''];
  try {
    const attr = el.getAttribute('data-strings');
    if (attr) strings = JSON.parse(attr);
  } catch {}

  if (prefersReduced) {
    el.textContent = strings[0] || '';
    return;
  }

  const typeSpeed = 38, deleteSpeed = 28, pause = 1200;
  let i = 0, idx = 0, forward = true;

  function tick() {
    const s = strings[idx] || '';
    if (forward) {
      i++;
      el.textContent = s.slice(0, i);
      if (i >= s.length) {
        forward = false;
        setTimeout(tick, pause);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      i--;
      el.textContent = s.slice(0, i);
      if (i <= 0) {
        forward = true;
        idx = (idx + 1) % strings.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }
  tick();
})();
