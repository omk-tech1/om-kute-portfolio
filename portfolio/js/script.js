/* ==========================================================================
   Om Kute — Portfolio · interactions and animation
   Plain JavaScript, no libraries. Each feature is wrapped so that one
   failure can never stop the rest of the page.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var safe = function (fn) { try { fn(); } catch (err) { if (window.console) console.warn('[portfolio]', err); } };

  root.classList.add('js');
  root.classList.add('ready'); // tells the CSS that scripting is running

  /* ------------------------------------------------------------------ *
   * Bright / dark theme toggle
   * ------------------------------------------------------------------ */
  safe(function () {
    var toggle = $('[data-theme-toggle]');
    if (!toggle) { return; }
    var themeMeta = $('meta[name="theme-color"]');
    var brightArt = $('.bright-hero-art img');

    function applyTheme(theme, persist) {
      var bright = theme === 'bright';
      root.setAttribute('data-theme', bright ? 'bright' : 'dark');
      toggle.textContent = bright ? 'B' : 'D';
      toggle.setAttribute('aria-pressed', String(bright));
      toggle.setAttribute('aria-label', bright ? 'Switch to dark theme' : 'Switch to bright theme');
      if (themeMeta) { themeMeta.setAttribute('content', bright ? '#f7faff' : '#050505'); }
      if (brightArt) {
        brightArt.loading = bright ? 'eager' : 'lazy';
        brightArt.fetchPriority = bright ? 'high' : 'low';
      }
      if (persist) {
        try { window.localStorage.setItem('om-kute-theme', bright ? 'bright' : 'dark'); }
        catch (err) {
          if (window.console) { console.warn('[portfolio] Theme preference could not be saved.', err); }
        }
      }
    }

    applyTheme(root.getAttribute('data-theme') === 'bright' ? 'bright' : 'dark', false);
    toggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'bright' ? 'dark' : 'bright', true);
    });
  });

  /* ------------------------------------------------------------------ *
   * Motion preference: follows the visitor's system "reduce motion" setting
   * ------------------------------------------------------------------ */
  var reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var motionOn = !(reduceQuery && reduceQuery.matches);
  var motionHooks = [];

  function setMotion(on) {
    motionOn = on;
    root.classList.toggle('motion-off', !on);
    motionHooks.forEach(function (fn) { safe(function () { fn(on); }); });
  }
  if (reduceQuery) {
    var onMotionChange = function (e) { setMotion(!e.matches); };
    if (reduceQuery.addEventListener) { reduceQuery.addEventListener('change', onMotionChange); }
    else if (reduceQuery.addListener) { reduceQuery.addListener(onMotionChange); }
  }

  /* ------------------------------------------------------------------ *
   * Glowing neural-network background (canvas)
   * ------------------------------------------------------------------ */
  var Net = (function () {
    var cv = $('#net');
    var none = { start: function () {}, stop: function () {}, redraw: function () {}, alpha: function () {} };
    if (!cv || !cv.getContext) { return none; }
    var ctx;
    try { ctx = cv.getContext('2d'); }
    catch (err) {
      if (window.console) { console.warn('[portfolio] Canvas effects are unavailable in this browser context.', err); }
      return none;
    }
    if (!ctx) { return none; }

    var W = 0, H = 0, dpr = 1, link = 150;
    var nodes = [], packets = [];
    var mouse = { x: -9999, y: -9999 };
    var raf = 0, last = 0, spawnIn = 0.4;
    var sprite = makeSprite();

    function makeSprite() {
      var s = document.createElement('canvas');
      s.width = 64; s.height = 64;
      var c;
      try { c = s.getContext('2d'); }
      catch (err) {
        if (window.console) { console.warn('[portfolio] Canvas effects are unavailable in this browser context.', err); }
        return null;
      }
      if (!c) { return null; }
      var g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.16, 'rgba(255,193,142,0.95)');
      g.addColorStop(0.45, 'rgba(242,138,75,0.34)');
      g.addColorStop(1, 'rgba(242,138,75,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 64, 64);
      return s;
    }
    if (!sprite) { return none; }

    function build(count) {
      nodes = [];
      for (var i = 0; i < count; i++) {
        var speed = 7 + Math.random() * 16;
        var dir = Math.random() * Math.PI * 2;
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: Math.cos(dir) * speed, vy: Math.sin(dir) * speed,
          r: 0.8 + Math.random() * 1.3,
          bright: Math.random() < 0.14,
          tw: Math.random() * 6.28, ts: 0.6 + Math.random() * 1.4
        });
      }
      packets = [];
    }

    function resize() {
      var w = cv.clientWidth || window.innerWidth;
      var h = cv.clientHeight || window.innerHeight;
      var widthChanged = Math.abs(w - W) > 1;
      W = w; H = h;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      link = W < 700 ? 110 : 150;
      var target = clamp(Math.round((W * H) / 17000), 26, 88);
      if (!nodes.length || widthChanged) { build(target); }
      draw();
    }

    function step(dt) {
      var i, n, dx, dy, d;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx * dt; n.y += n.vy * dt; n.tw += n.ts * dt;
        if (n.x < -20) { n.x = W + 20; } else if (n.x > W + 20) { n.x = -20; }
        if (n.y < -20) { n.y = H + 20; } else if (n.y > H + 20) { n.y = -20; }
        dx = n.x - mouse.x; dy = n.y - mouse.y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130 && d > 0.1) {
          n.x += (dx / d) * (1 - d / 130) * 46 * dt;
          n.y += (dy / d) * (1 - d / 130) * 46 * dt;
        }
      }
      spawnIn -= dt;
      if (spawnIn <= 0 && packets.length < 8) {
        spawnIn = 0.35 + Math.random() * 0.5;
        var a = nodes[(Math.random() * nodes.length) | 0];
        if (a) {
          for (var k = 0; k < nodes.length; k++) {
            var b = nodes[k];
            if (b === a) { continue; }
            var ex = a.x - b.x, ey = a.y - b.y;
            if (ex * ex + ey * ey < link * link) { packets.push({ a: a, b: b, t: 0 }); break; }
          }
        }
      }
      for (i = packets.length - 1; i >= 0; i--) {
        packets[i].t += dt / 0.8;
        if (packets[i].t >= 1) { packets.splice(i, 1); }
      }
    }

    function draw() {
      var i, j, a, b, dx, dy, d2, al, d, s;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      var l2 = link * link;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y; d2 = dx * dx + dy * dy;
          if (d2 < l2) {
            al = 1 - Math.sqrt(d2) / link;
            ctx.strokeStyle = 'rgba(242,138,75,' + (al * 0.3).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 170) {
          ctx.strokeStyle = 'rgba(255,193,142,' + ((1 - d / 170) * 0.55).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        s = a.r * (a.bright ? 13 : 7);
        ctx.globalAlpha = clamp(0.5 + 0.45 * Math.sin(a.tw), 0.15, 1);
        ctx.drawImage(sprite, a.x - s / 2, a.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < packets.length; i++) {
        var p = packets[i];
        var px = p.a.x + (p.b.x - p.a.x) * p.t;
        var py = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.drawImage(sprite, px - 8, py - 8, 16, 16);
      }
    }

    function frame(t) {
      raf = window.requestAnimationFrame(frame);
      var dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      step(dt);
      draw();
    }

    function start() {
      if (raf || document.hidden) { return; }
      last = performance.now();
      raf = window.requestAnimationFrame(frame);
    }
    function stop() {
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    }

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { safe(resize); }, 150);
    });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') { return; }
      mouse.x = e.clientX; mouse.y = e.clientY;
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget) { mouse.x = -9999; mouse.y = -9999; }
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else if (motionOn) { start(); }
    });

    resize();
    return {
      start: start,
      stop: stop,
      redraw: function () { mouse.x = -9999; mouse.y = -9999; draw(); },
      alpha: function (v) { cv.style.opacity = v.toFixed(3); }
    };
  })();

  motionHooks.push(function (on) {
    if (on) { Net.start(); } else { Net.stop(); Net.redraw(); }
  });

  /* ------------------------------------------------------------------ *
   * Count-up statistics (verified numbers only)
   * ------------------------------------------------------------------ */
  var counters = $$('[data-count]');
  function fmtCount(el, value) {
    el.textContent = (el.getAttribute('data-prefix') || '') + value + (el.getAttribute('data-suffix') || '');
  }
  function runCount(el) {
    if (el._done) { return; }
    el._done = true;
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (!motionOn) { fmtCount(el, target); return; }
    var startTs = null;
    var dur = 1700;
    function tick(ts) {
      if (startTs === null) { startTs = ts; }
      var p = clamp((ts - startTs) / dur, 0, 1);
      fmtCount(el, Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1 && motionOn) { window.requestAnimationFrame(tick); } else { fmtCount(el, target); }
    }
    window.requestAnimationFrame(tick);
  }
  motionHooks.push(function (on) {
    if (!on) {
      counters.forEach(function (el) {
        el._done = true;
        fmtCount(el, parseInt(el.getAttribute('data-count'), 10) || 0);
      });
    }
  });

  /* ------------------------------------------------------------------ *
   * Scroll-triggered reveals
   * ------------------------------------------------------------------ */
  safe(function () {
    var reveals = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
      counters.forEach(runCount);
      return;
    }
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { revealIO.observe(el); });

    if (motionOn) { counters.forEach(function (el) { fmtCount(el, 0); }); }
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); countIO.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIO.observe(el); });
  });

  /* ------------------------------------------------------------------ *
   * Mobile navigation
   * ------------------------------------------------------------------ */
  var menuBtn = $('.menu-btn');
  var menuText = menuBtn ? $('.menu-label', menuBtn) : null;
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    if (menuText) { menuText.textContent = open ? 'Close' : 'Menu'; }
  }
  safe(function () {
    if (!menuBtn) { return; }
    menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1040 && root.classList.contains('menu-open')) { setMenu(false); }
    });
  });

  /* ------------------------------------------------------------------ *
   * Smooth in-page navigation
   * ------------------------------------------------------------------ */
  safe(function () {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = (a.getAttribute('href') || '').slice(1);
        var target = id ? document.getElementById(id) : null;
        if (!target) { return; }
        e.preventDefault();
        setMenu(false);
        target.scrollIntoView({ behavior: motionOn ? 'smooth' : 'auto', block: 'start' });
      });
    });
  });

  /* ------------------------------------------------------------------ *
   * Resume preview dialog
   * ------------------------------------------------------------------ */
  safe(function () {
    var modal = $('#resume-modal');
    if (!modal) { return; }
    var closeBtn = $('.modal-close', modal);
    var lastFocus = null;

    function openModal() {
      lastFocus = document.activeElement;
      setMenu(false);
      modal.hidden = false;
      root.classList.add('modal-open');
      if (closeBtn) { closeBtn.focus(); }
    }
    function closeModal() {
      modal.hidden = true;
      root.classList.remove('modal-open');
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    }
    $$('[data-resume-open]').forEach(function (b) { b.addEventListener('click', openModal); });
    $$('[data-resume-close]', modal).forEach(function (b) { b.addEventListener('click', closeModal); });
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) { return; }
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        var items = $$('a[href], button', modal);
        if (!items.length) { return; }
        var first = items[0];
        var lastItem = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastItem.focus(); }
        else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); first.focus(); }
      }
    });
  });

  /* Highlight the current section in the navigation */
  safe(function () {
    if (!('IntersectionObserver' in window)) { return; }
    var links = $$('[data-nav]');
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      (map[id] = map[id] || []).push(a);
    });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        (map[en.target.id] || []).forEach(function (a) { a.setAttribute('aria-current', 'true'); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) { navIO.observe(sec); }
    });
  });

  /* ------------------------------------------------------------------ *
   * Scroll progress, header state, parallax, timeline fill
   * ------------------------------------------------------------------ */
  var progressBar = $('.progress span');
  var header = $('.hdr');
  var heroIn = $('.hero-in');
  var timeline = $('.tl');
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.pageYOffset || root.scrollTop || 0;
    var vh = window.innerHeight || 800;
    var max = Math.max(1, root.scrollHeight - vh);
    if (progressBar) { progressBar.style.transform = 'scaleX(' + clamp(y / max, 0, 1).toFixed(4) + ')'; }
    if (header) { header.classList.toggle('scrolled', y > 30); }
    Net.alpha(clamp(1 - y / (vh * 1.3), 0.42, 1));
    if (heroIn) { heroIn.style.setProperty('--sy', motionOn ? Math.min(y, 1000).toFixed(1) : '0'); }
    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var p = clamp((vh * 0.62 - r.top) / Math.max(1, r.height), 0, 1);
      timeline.style.setProperty('--tl', p.toFixed(3));
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  motionHooks.push(function () { update(); });

  /* Pointer parallax on the portrait (mouse only) */
  safe(function () {
    var hero = $('.hero');
    if (!hero || !heroIn) { return; }
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function loop() {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      heroIn.style.setProperty('--px', cx.toFixed(4));
      heroIn.style.setProperty('--py', cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) { raf = window.requestAnimationFrame(loop); } else { raf = 0; }
    }
    hero.addEventListener('pointermove', function (e) {
      if (!motionOn || e.pointerType === 'touch') { return; }
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) { raf = window.requestAnimationFrame(loop); }
    });
    hero.addEventListener('pointerleave', function () {
      tx = 0; ty = 0;
      if (!raf) { raf = window.requestAnimationFrame(loop); }
    });
    motionHooks.push(function (on) {
      if (!on) { tx = ty = cx = cy = 0; heroIn.style.setProperty('--px', '0'); heroIn.style.setProperty('--py', '0'); }
    });
  });

  /* ------------------------------------------------------------------ *
   * Card glow + tilt
   * ------------------------------------------------------------------ */
  safe(function () {
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    $$('.card').forEach(function (card) {
      var tiltable = card.classList.contains('tilt');
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        if (fine && motionOn && tiltable) {
          card.style.setProperty('--ry', ((x / r.width - 0.5) * 7).toFixed(2) + 'deg');
          card.style.setProperty('--rx', ((0.5 - y / r.height) * 7).toFixed(2) + 'deg');
        }
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  });

  /* ------------------------------------------------------------------ *
   * Copy e-mail address
   * ------------------------------------------------------------------ */
  safe(function () {
    var btn = $('#copy-email');
    var toast = $('#toast');
    var addr = $('.addr');
    if (!btn || !toast) { return; }
    var timer = 0;
    function show(message) {
      toast.textContent = message;
      toast.classList.add('show');
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { toast.classList.remove('show'); }, 2400);
    }
    function fallback() {
      var ok = false;
      try {
        var range = document.createRange();
        range.selectNodeContents(addr);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        ok = document.execCommand('copy');
      } catch (err) { ok = false; }
      show(ok ? 'Email address copied' : 'Address selected. Press Ctrl or Cmd + C to copy');
    }
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { show('Email address copied'); }, fallback);
      } else {
        fallback();
      }
    });
  });

  /* Compose a contact email from the validated form fields. */
  safe(function () {
    var form = $('#contact-form');
    if (!form) { return; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var values = new FormData(form);
      var subject = String(values.get('subject') || '').trim();
      var body = [
        'Name: ' + String(values.get('name') || '').trim(),
        'Email: ' + String(values.get('email') || '').trim(),
        '',
        'Message:',
        String(values.get('message') || '').trim()
      ].join('\n');
      window.location.href = 'mailto:om.tech2026@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  });

  /* Footer year */
  safe(function () {
    var y = $('#year');
    if (y) { y.textContent = String(new Date().getFullYear()); }
  });

  /* ------------------------------------------------------------------ *
   * Start
   * ------------------------------------------------------------------ */
  setMotion(motionOn);
  update();
})();
