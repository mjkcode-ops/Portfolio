/* ════════════════════════════════════════════════
   Muhammad Jahanzaib Khan — Portfolio Script
   ════════════════════════════════════════════════ */

/* ─── LOADER ─── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2000);
});

/* ─── THEME TOGGLE ─── */
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

// Persist preference
const savedTheme = localStorage.getItem('mjk-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('mjk-theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

/* ─── HAMBURGER NAV ─── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

/* ─── STICKY NAV ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── ACTIVE NAV LINK ─── */
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkEls.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ─── BACK TO TOP ─── */
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  backTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ─── CIRCUIT CANVAS BACKGROUND ─── */
(function initCircuit() {
  const canvas = document.getElementById('circuitCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes, pulses;

  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildNodes();
  }

  function buildNodes() {
    const cols = Math.ceil(W / 80);
    const rows = Math.ceil(H / 80);
    nodes = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const jitter = (v) => v + (Math.random() - 0.5) * 30;
        nodes.push({
          x: jitter(c * 80),
          y: jitter(r * 80),
          dot: Math.random() < 0.4,
          connections: [],
        });
      }
    }
    // Connect neighbors
    const maxDist = 130;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist && Math.random() < 0.35) {
          nodes[i].connections.push(j);
        }
      }
    }
    // Init pulses
    pulses = [];
    for (let k = 0; k < 6; k++) spawnPulse();
  }

  function spawnPulse() {
    const start = Math.floor(Math.random() * nodes.length);
    if (nodes[start].connections.length === 0) return;
    const endIdx = nodes[start].connections[Math.floor(Math.random() * nodes[start].connections.length)];
    pulses.push({
      startNode: start,
      endNode:   endIdx,
      t:         0,
      speed:     0.005 + Math.random() * 0.008,
      hue:       Math.random() < 0.5 ? 210 : 270, // blue or purple
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const dark = isDark();
    const lineColor = dark ? 'rgba(37,99,235,0.2)' : 'rgba(37,99,235,0.12)';
    const dotColor  = dark ? 'rgba(6,182,212,0.5)'  : 'rgba(6,182,212,0.35)';

    // Lines
    ctx.strokeStyle = lineColor;
    ctx.lineWidth   = 1;
    nodes.forEach((n, i) => {
      n.connections.forEach(j => {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      });
    });

    // Dots
    nodes.forEach(n => {
      if (!n.dot) return;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
    });

    // Pulses
    pulses.forEach((p, idx) => {
      const s = nodes[p.startNode];
      const e = nodes[p.endNode];
      const x = s.x + (e.x - s.x) * p.t;
      const y = s.y + (e.y - s.y) * p.t;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, 10);
      const color = p.hue === 210 ? '37,99,235' : '124,58,237';
      grad.addColorStop(0,   `rgba(${color},0.9)`);
      grad.addColorStop(0.5, `rgba(${color},0.4)`);
      grad.addColorStop(1,   `rgba(${color},0)`);

      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      p.t += p.speed;
      if (p.t >= 1) {
        pulses.splice(idx, 1);
        if (pulses.length < 8) spawnPulse();
      }
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ─── TYPING ANIMATION ─── */
(function initTyping() {
  const el     = document.getElementById('typedText');
  if (!el) return;
  const phrases = [
    'Future Software Engineer',
    'AI Enthusiast',
    'Python Developer',
    'Problem Solver',
    'CS Student',
  ];
  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let wait      = false;

  function tick() {
    const phrase = phrases[phraseIdx];
    if (wait) { wait = false; setTimeout(tick, 1400); return; }

    if (!deleting) {
      el.textContent = phrase.slice(0, ++charIdx);
      if (charIdx === phrase.length) { deleting = true; wait = true; setTimeout(tick, 80); return; }
      setTimeout(tick, 75 + Math.random() * 40);
    } else {
      el.textContent = phrase.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 40);
    }
  }
  tick();
})();

/* ─── SCROLL REVEAL ─── */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => revealObs.observe(el));

/* ─── ANIMATED COUNTERS ─── */
function animateCounter(el, target, duration = 1500) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const val = Math.floor(progress * target);
    el.textContent = val;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el  = entry.target;
      const val = parseInt(el.getAttribute('data-count'), 10);
      animateCounter(el, val);
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-count]').forEach(el => counterObs.observe(el));

/* ─── SKILL BAR ANIMATION ─── */
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill  = entry.target.querySelector('.skill-fill');
      const width = entry.target.querySelector('.skill-fill').getAttribute('data-width');
      if (fill) {
        setTimeout(() => { fill.style.width = width + '%'; }, 200);
      }
      barObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-track').forEach(el => barObs.observe(el));

/* ─── CONTACT FORM ─── */
const form    = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    formMsg.className = '';
    if (!name || !email || !message) {
      formMsg.textContent = '⚠ Please fill in all required fields.';
      formMsg.className   = 'form-note error';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formMsg.textContent = '⚠ Please enter a valid email address.';
      formMsg.className   = 'form-note error';
      return;
    }

    // Simulate send (replace with real backend / EmailJS when ready)
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled    = true;
    btn.innerHTML   = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    setTimeout(() => {
      form.reset();
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      formMsg.textContent = '✓ Message sent! I\'ll get back to you soon.';
      formMsg.className   = 'form-note success';
      setTimeout(() => { formMsg.textContent = ''; formMsg.className = ''; }, 5000);
    }, 1600);
  });
}

/* ─── RESUME BUTTON ─── */
const resumeBtn = document.getElementById('resumeBtn');
if (resumeBtn) {
  resumeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Resume PDF coming soon! Check back later.');
  });
}