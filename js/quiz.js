(function () {
  var root = document.getElementById('quiz');
  if (!root) return;

  var QUESTIONS = [
    { q: 'Where are you in your trading journey?', a: [
      ['Just getting started', { builder: 2, lone: 1 }],
      ['A few months in and still figuring it out', { hesitant: 1, impulse: 1, lone: 1 }],
      ['Trading for a while but not consistent yet', { impulse: 2, hesitant: 1 }],
      ['Experienced and fine tuning', { builder: 2 }] ] },
    { q: 'A setup looks good but price runs without you. What do you do?', a: [
      ['Chase it before it is gone', { impulse: 3 }],
      ['Freeze and watch it go', { hesitant: 3 }],
      ['Let it go and wait for the next one', { builder: 3 }],
      ['Ask someone else what they would do', { lone: 2, hesitant: 1 }] ] },
    { q: 'After a losing trade, you usually...', a: [
      ['Jump straight into another one to win it back', { impulse: 3 }],
      ['Doubt everything and skip the next setup', { hesitant: 3 }],
      ['Review it and move on', { builder: 3 }],
      ['Sit with it alone and wonder what went wrong', { lone: 3 }] ] },
    { q: 'How do you usually learn trading?', a: [
      ['YouTube and social media, all over the place', { impulse: 1, lone: 2 }],
      ['One course or mentor at a time', { builder: 2, hesitant: 1 }],
      ['On my own with trial and error', { lone: 3 }],
      ['In a group with real conversations', { builder: 3 }] ] },
    { q: 'What would help you the most right now?', a: [
      ['Slowing down and trading with a plan', { impulse: 3 }],
      ['More confidence to pull the trigger', { hesitant: 3 }],
      ['People to talk charts and mindset with', { lone: 3 }],
      ['A clear routine I can repeat every week', { builder: 3 }] ] }
  ];

  var RESULTS = {
    impulse: { name: 'The Impulse Trader', line: 'You see it, you click it. Speed is your gift and your trap.',
      tip: 'Add a pause. Write your entry, stop and target before you click, and if you cannot write them in 30 seconds, skip the trade.',
      link: ['Run your risk first on the Risk page', 'risk.html'] },
    hesitant: { name: 'The Overthinker', line: 'You read the chart well, then talk yourself out of it.',
      tip: 'Shrink the risk until the trade feels easy, then judge yourself on following your plan, not on win or loss.',
      link: ['See your risk in dollars on the Risk page', 'risk.html'] },
    lone: { name: 'The Lone Wolf', line: 'You have been grinding by yourself. That takes grit, and it is also heavy.',
      tip: 'Share one trade with someone this week, wins and losses. Feedback from real people shortens the learning curve.',
      link: ['See how steady habits stack up', 'calculator.html'] },
    builder: { name: 'The Steady Builder', line: 'You like process, routine and doing the boring things well.',
      tip: 'Keep a simple journal and review it weekly. Small edges plus discipline are what carry over time.',
      link: ['Play with the compound calculator', 'calculator.html'] }
  };

  var idx = 0, scores = { impulse: 0, hesitant: 0, lone: 0, builder: 0 }, picks = [];

  var esc = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };

  function renderQ() {
    var item = QUESTIONS[idx], pct = Math.round(idx / QUESTIONS.length * 100);
    var html = '<div class="q-top"><span>Question ' + (idx + 1) + ' of ' + QUESTIONS.length + '</span><span>' + pct + '%</span></div>' +
      '<div class="q-bar"><i style="width:' + pct + '%"></i></div>' +
      '<h2 class="q-title">' + esc(item.q) + '</h2><div class="q-opts" role="group" aria-label="Answers">';
    item.a.forEach(function (o, i) { html += '<button type="button" class="q-opt" data-i="' + i + '">' + esc(o[0]) + '</button>'; });
    html += '</div>' + (idx > 0 ? '<button type="button" class="q-back">← Back</button>' : '');
    root.innerHTML = html;
    root.querySelectorAll('.q-opt').forEach(function (b) {
      b.addEventListener('click', function () { choose(+b.getAttribute('data-i')); });
    });
    var back = root.querySelector('.q-back'); if (back) back.addEventListener('click', goBack);
    var first = root.querySelector('.q-opt'); if (first) first.focus();
  }

  function apply(sign, weights) { for (var k in weights) scores[k] += sign * weights[k]; }
  function choose(i) { var w = QUESTIONS[idx].a[i][1]; picks[idx] = i; apply(1, w); idx++; if (idx >= QUESTIONS.length) renderResult(); else renderQ(); }
  function goBack() { idx--; apply(-1, QUESTIONS[idx].a[picks[idx]][1]); renderQ(); }

  function renderResult() {
    var top = 'impulse';
    ['impulse', 'hesitant', 'lone', 'builder'].forEach(function (k) { if (scores[k] > scores[top]) top = k; });
    var r = RESULTS[top];
    root.innerHTML = '<div class="q-top"><span>Your result</span><span>100%</span></div><div class="q-bar"><i style="width:100%"></i></div>' +
      '<div class="kick" style="margin-top:34px">You are</div>' +
      '<h2 class="q-res neon">' + esc(r.name) + '</h2>' +
      '<p class="lead" style="margin-top:10px">' + esc(r.line) + '</p>' +
      '<div class="q-tip"><b>Try this</b>' + esc(r.tip) + '</div>' +
      '<div class="cta" style="margin-top:30px"><button type="button" class="btn b1" id="q-join">Join Free Community →</button>' +
      '<a class="btn b3" href="' + r.link[1] + '">' + esc(r.link[0]) + '</a></div>' +
      '<button type="button" class="q-back" id="q-redo" style="margin-top:26px">↺ Retake the quiz</button>' +
      '<p class="note">Just for fun and self reflection. Not financial advice, and not a prediction of results.</p>';
    document.getElementById('q-join').addEventListener('click', function () { if (window.LT_openJoin) window.LT_openJoin(); });
    document.getElementById('q-redo').addEventListener('click', function () { idx = 0; picks = []; for (var k in scores) scores[k] = 0; renderQ(); });
  }

  renderQ();
})();
