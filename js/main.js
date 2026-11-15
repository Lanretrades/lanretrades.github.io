(function () {
  var C = window.LT_CONFIG || {};

  // Wire buttons to configured links. Empty links scroll to the join section instead of dead-linking.
  document.querySelectorAll('[data-link]').forEach(function (el) {
    var url = C[el.getAttribute('data-link')];
    if (url) { el.setAttribute('href', url); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    else { el.setAttribute('href', el.getAttribute('data-fallback') || '#join'); }
  });
  document.querySelectorAll('[data-social]').forEach(function (el) {
    var url = (C.socials || {})[el.getAttribute('data-social')];
    if (url) { el.setAttribute('href', url); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    else { el.style.display = 'none'; }
  });

  // Sign-up form: posts to the configured endpoint. It never pretends to succeed.
  var form = document.getElementById('signup-form');
  if (form) {
    var msg = form.querySelector('.msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!C.formEndpoint) {
        msg.className = 'msg err';
        msg.textContent = 'Sign ups are not switched on yet. Please use the Free Community button above.';
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      var btn = form.querySelector('button');
      btn.disabled = true; msg.className = 'msg'; msg.textContent = 'Sending...';
      fetch(C.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error('Request failed (' + r.status + ')'); })
        .then(function () {
          form.style.display = 'none';
          var t = document.getElementById('thanks'); if (t) t.style.display = 'block';
        })
        .catch(function (err) { msg.className = 'msg err'; msg.textContent = 'Could not send that: ' + err.message; btn.disabled = false; });
    });
  }

  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var paint = function (r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); };

  // Compound calculator
  var calc = document.getElementById('calc');
  if (calc) {
    var $ = function (id) { return document.getElementById(id); };
    var run = function () {
      var B = +$('c-bal').value, r = +$('c-rate').value / 100, n = +$('c-mon').value, D = +$('c-dep').value, comp = $('c-comp').checked;
      ['c-bal', 'c-rate', 'c-mon', 'c-dep'].forEach(function (i) { paint($(i)); });
      $('o-bal').textContent = money(B); $('o-rate').textContent = $('c-rate').value + '%';
      $('o-mon').textContent = n + (n === 1 ? ' month' : ' months'); $('o-dep').textContent = money(D);
      var withC = [B], flat = [B], a = B;
      for (var i = 1; i <= n; i++) { a = a * (1 + r) + D; withC.push(a); flat.push(B + B * r * i + D * i); }
      var series = comp ? withC : flat, end = series[n], put = B + D * n;
      $('proj').textContent = money(end); $('pf').textContent = money(end - put); $('dp').textContent = money(put);
      $('gr').textContent = (end / B).toFixed(1) + '×';
      var mx = Math.max(withC[n], flat[n]), mn = B;
      var pt = function (arr) { return arr.map(function (v, i) { return (n ? i * 600 / n : 0).toFixed(1) + ',' + (180 - (mx === mn ? 0 : (v - mn) / (mx - mn)) * 160).toFixed(1); }); };
      var p1 = pt(series), p2 = pt(comp ? flat : withC);
      $('line').setAttribute('points', p1.join(' '));
      $('area').setAttribute('d', 'M' + p1.join(' L') + ' L600,190 L0,190Z');
      $('flat').setAttribute('points', p2.join(' '));
      $('l1').textContent = comp ? '— With compounding' : '— Without compounding';
      $('l2').textContent = comp ? '- - Without' : '- - With compounding';
    };
    calc.addEventListener('input', run); run();
  }

  // Risk page
  var risk = document.getElementById('risk');
  if (risk) {
    var $r = function (id) { return document.getElementById(id); };
    var INSTR = {
      XAUUSD: { label: 'Stop distance in price ($)', perUnit: 100, def: 8, note: 'Gold: 1 lot is 100 oz, so a $1 move is $100 per lot.' },
      EURUSD: { label: 'Stop distance in pips', perUnit: 10, def: 20, note: 'EURUSD: about $10 per pip per lot.' },
      GBPUSD: { label: 'Stop distance in pips', perUnit: 10, def: 20, note: 'GBPUSD: about $10 per pip per lot.' },
      US30: { label: 'Stop distance in points', perUnit: 1, def: 50, note: 'US30: about $1 per point per lot. Contract size varies by broker.' },
      NAS100: { label: 'Stop distance in points', perUnit: 1, def: 30, note: 'NAS100: about $1 per point per lot. Contract size varies by broker.' }
    };
    var last = 'XAUUSD';
    var go = function () {
      var key = $r('r-ins').value, ins = INSTR[key];
      if (key !== last) { $r('r-stop').value = ins.def; last = key; }
      $r('r-stoplab').textContent = ins.label; $r('r-note').textContent = ins.note + ' Always confirm your broker’s values before trading.';
      var bal = +$r('r-bal').value, pct = +$r('r-pct').value, stop = +$r('r-stop').value;
      var dollars = bal * pct / 100;
      $r('r-risk').textContent = '$' + dollars.toFixed(2);
      var lots = stop > 0 ? Math.floor(dollars / (stop * ins.perUnit) * 100) / 100 : 0;
      $r('r-lots').textContent = lots.toFixed(2);
      var tbl = $r('streak'); tbl.innerHTML = '';
      [1, 2, 5, 10].forEach(function (p) {
        var left = bal * Math.pow(1 - p / 100, 10), hot = p >= 5;
        tbl.insertAdjacentHTML('beforeend', '<tr><td>' + p + '%</td><td class="' + (hot ? 'hot' : 'gd') + '">' + money(left) + '</td></tr>');
      });
      $r('r-sbal').textContent = money(bal);
    };
    risk.addEventListener('input', go); go();
  }
})();
