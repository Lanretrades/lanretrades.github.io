(function () {
  var C = window.LT_CONFIG || {};
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var forceStatic = /[?&]static\b/.test(location.search);

  // ---- Scroll reveal ----
  if (!reduce && !forceStatic && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.card,.g4,.rule,.tm,.pts div,.frame,.book,.box,.faq details,.live');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    targets.forEach(function (t, i) { t.classList.add('rv'); t.style.transitionDelay = ((i % 4) * 70) + 'ms'; io.observe(t); });
  }

  // ---- Live session countdown ----
  function partsIn(date, tz) {
    var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    var o = {}; f.formatToParts(date).forEach(function (p) { if (p.type !== 'literal') o[p.type] = +p.value; });
    return o;
  }
  function offsetMs(date, tz) { var p = partsIn(date, tz); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(date.getTime() / 1000) * 1000; }
  function zonedToUtc(y, m, d, h, mi, tz) {
    var guess = Date.UTC(y, m - 1, d, h, mi);
    var utc = guess - offsetMs(new Date(guess), tz);
    return new Date(guess - offsetMs(new Date(utc), tz));
  }
  function nextSession(now) {
    var tz = C.sessionTimeZone, list = C.sessions || [], best = null;
    if (!tz || !list.length) return null;
    var p = partsIn(now, tz);
    for (var i = 0; i < 8; i++) {
      var day = new Date(Date.UTC(p.year, p.month - 1, p.day + i));
      list.forEach(function (s) {
        if (day.getUTCDay() !== s.day) return;
        var t = zonedToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), s.hour, s.minute, tz);
        if (t > now && (!best || t < best.t)) best = { t: t, s: s };
      });
    }
    return best;
  }
  var live = document.getElementById('live');
  if (live) {
    var cd = { d: document.getElementById('cd-d'), h: document.getElementById('cd-h'), m: document.getElementById('cd-m'), s: document.getElementById('cd-s') };
    var when = document.getElementById('live-when');
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var tick = function () {
      var now = new Date(), nx = nextSession(now);
      if (!nx) { live.style.display = 'none'; return; }
      var diff = Math.max(0, nx.t - now), s = Math.floor(diff / 1000);
      cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s % 86400 / 3600));
      cd.m.textContent = pad(Math.floor(s % 3600 / 60)); cd.s.textContent = pad(s % 60);
      when.textContent = nx.t.toLocaleString([], { weekday: 'long', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
    };
    tick(); setInterval(tick, 1000);
  }

  // ---- Sticky join bar (phones) ----
  var bar = document.getElementById('sticky-join');
  if (bar) {
    var show = function () { bar.classList.toggle('on', window.scrollY > 520); };
    window.addEventListener('scroll', show, { passive: true }); show();
    var b = bar.querySelector('button');
    if (b) b.addEventListener('click', function () { if (window.LT_openJoin) window.LT_openJoin(); });
  }
})();
