/**
 * app/games/conjugation-dojo.js
 * Conjugation Station — typing-based verb/adjective conjugation drill.
 * First game module under the Practice.js plugin architecture.
 *
 * Shell contract (hybrid):
 *   Practice.js owns chrome (streak counter, hanabi, session tracking).
 *   This module owns everything inside its container div.
 *   Shell passes: container, activeLessons, vocabMap, conjugationRules,
 *                 textProcessor, unlock, onCorrect, onWrong, onExit, getStreakInfo.
 */
(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  // ---- CSS (injected once) ----
  function injectStyles() {
    if (document.getElementById('jp-dojo-style')) return;
    var s = document.createElement('style');
    s.id = 'jp-dojo-style';
    s.textContent =
      '.dojo-wrap { font-family: "Poppins","Noto Sans JP",sans-serif; }' +

      // Form picker
      '.dojo-section-hdr { font-weight:800; font-size:0.85rem; text-transform:uppercase; color:#8e44ad; margin:16px 0 8px; display:flex; align-items:center; gap:6px; cursor:pointer; }' +
      '.dojo-section-hdr .arrow { transition:transform 0.2s; font-size:0.7rem; }' +
      '.dojo-section-hdr.open .arrow { transform:rotate(90deg); }' +
      '.dojo-form-list { display:none; flex-direction:column; gap:4px; margin-bottom:8px; }' +
      '.dojo-section-hdr.open + .dojo-form-list { display:flex; }' +
      '.dojo-form-row { display:flex; align-items:center; gap:8px; padding:4px 8px; border-radius:8px; }' +
      '.dojo-form-row:hover { background:rgba(142,68,173,0.06); }' +
      '.dojo-form-row input[type=checkbox] { accent-color:#8e44ad; width:16px; height:16px; }' +
      '.dojo-form-label { font-size:0.9rem; flex:1; cursor:pointer; }' +
      '.dojo-form-tag { font-size:0.65rem; color:#999; background:#f0f0f0; padding:1px 6px; border-radius:4px; }' +
      '.dojo-vc-filter { display:flex; gap:10px; margin:12px 0; flex-wrap:wrap; }' +
      '.dojo-vc-filter label { font-size:0.85rem; display:flex; align-items:center; gap:4px; cursor:pointer; }' +
      '.dojo-start-btn { width:100%; padding:14px; border:none; border-radius:12px; font-weight:700; font-size:1rem; color:#fff; background:linear-gradient(135deg,#8e44ad 0%,#6c3483 100%); cursor:pointer; margin-top:16px; transition:opacity 0.15s; }' +
      '.dojo-start-btn:disabled { opacity:0.4; cursor:default; }' +
      '.dojo-queue-info { text-align:center; font-size:0.85rem; color:#999; margin-top:8px; }' +

      // Drill
      '.dojo-prompt { text-align:center; padding:24px 16px; }' +
      '.dojo-dict { font-size:2.4rem; font-weight:900; line-height:1.2; }' +
      '.dojo-reading { font-size:1.1rem; color:#8e44ad; font-weight:600; margin-top:2px; }' +
      '.dojo-meaning { font-size:0.9rem; color:#747d8c; margin-top:4px; }' +
      '.dojo-target { font-size:1rem; font-weight:700; color:#DC2626; margin-top:12px; }' +
      '.dojo-badge { display:inline-block; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:20px; background:#f0e6f6; color:#8e44ad; margin-top:6px; }' +
      '.dojo-input-wrap { display:flex; gap:8px; margin-top:16px; }' +
      '.dojo-input { flex:1; font-size:1.3rem; font-family:"Noto Sans JP",sans-serif; padding:12px 16px; border:2px solid #ddd; border-radius:12px; outline:none; transition:border-color 0.15s; }' +
      '.dojo-input:focus { border-color:#8e44ad; }' +
      '.dojo-submit { padding:12px 20px; border:none; border-radius:12px; font-weight:700; font-size:1rem; color:#fff; background:#8e44ad; cursor:pointer; }' +

      // Feedback
      '.dojo-feedback { margin-top:16px; text-align:center; min-height:60px; }' +
      '.dojo-correct-msg { font-size:1.3rem; font-weight:800; color:#2ed573; }' +
      '.dojo-wrong-msg { font-size:1rem; font-weight:700; color:#ff4757; margin-bottom:8px; }' +
      '.dojo-diff { display:flex; justify-content:center; gap:2px; flex-wrap:wrap; margin:8px 0; }' +
      '.dojo-char { display:inline-flex; align-items:center; justify-content:center; width:32px; height:36px; font-size:1.2rem; font-family:"Noto Sans JP",sans-serif; border-radius:6px; font-weight:600; }' +
      '.dojo-char-ok { background:#d4edda; color:#155724; }' +
      '.dojo-char-wrong { background:#f8d7da; color:#721c24; text-decoration:line-through; }' +
      '.dojo-char-missing { background:#fff3cd; color:#856404; border-bottom:2px dashed #856404; }' +
      '.dojo-char-extra { background:#e2e3e5; color:#383d41; text-decoration:line-through; }' +
      '.dojo-answer-reveal { font-size:1.1rem; font-weight:700; color:#2f3542; margin:8px 0; }' +
      '.dojo-hint { font-size:0.85rem; color:#8e44ad; background:#f9f0ff; padding:8px 12px; border-radius:8px; border-left:3px solid #8e44ad; margin:8px auto; max-width:320px; text-align:left; }' +
      '.dojo-next-btn { padding:10px 28px; border:none; border-radius:10px; font-weight:700; color:#fff; background:#8e44ad; cursor:pointer; margin-top:10px; font-size:0.95rem; }' +

      // Helper panel
      '.dojo-helper-toggle { font-size:0.85rem; color:#8e44ad; background:none; border:1px solid #8e44ad; border-radius:8px; padding:4px 12px; cursor:pointer; margin-top:12px; }' +
      '.dojo-helper { display:none; margin-top:10px; padding:12px; background:#fdf8ff; border:1px solid #e8d5f5; border-radius:10px; font-size:0.85rem; font-family:"Noto Sans JP",monospace; }' +
      '.dojo-helper.open { display:block; }' +
      '.dojo-helper table { width:100%; border-collapse:collapse; }' +
      '.dojo-helper td { padding:3px 8px; }' +
      '.dojo-helper .hl { color:#8e44ad; font-weight:700; }' +

      // Summary
      '.dojo-summary { text-align:center; padding:20px 0; }' +
      '.dojo-score { font-size:2rem; font-weight:900; }' +
      '.dojo-score-pct { font-size:1.1rem; color:#747d8c; }' +
      '.dojo-breakdown { margin:16px 0; text-align:left; font-size:0.85rem; }' +
      '.dojo-breakdown-row { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #f0f0f0; }' +
      '.dojo-summary-btns { display:flex; flex-direction:column; gap:8px; margin-top:16px; }' +
      '.dojo-summary-btns button { padding:12px; border:none; border-radius:10px; font-weight:700; font-size:0.95rem; cursor:pointer; }' +
      '.dojo-btn-primary { color:#fff; background:linear-gradient(135deg,#8e44ad 0%,#6c3483 100%); }' +
      '.dojo-btn-secondary { color:#8e44ad; background:#f0e6f6; }' +

      // Animation
      '@keyframes dojoCorrectFlash { 0%{background:#d4edda} 100%{background:transparent} }' +
      '@keyframes dojoWrongShake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }' +
      '.dojo-flash-correct { animation:dojoCorrectFlash 0.6s ease; }' +
      '.dojo-flash-wrong { animation:dojoWrongShake 0.4s ease; }';
    document.head.appendChild(s);
  }

  // ---- State ----
  var cfg = {};
  var container = null;
  var activeForms = new Set();
  var excludedForms = loadExcluded();
  var activeVerbClasses = new Set(['godan', 'ichidan', 'irr_suru', 'irr_kuru', 'irr_aru', 'irr_iku']);
  var queue = [];
  var qIdx = 0;
  var sessionCorrect = 0;
  var sessionTotal = 0;
  var mistakes = [];
  var helperVisible = false;
  var isComposing = false;

  function loadExcluded() {
    try { return new Set(JSON.parse(localStorage.getItem('k-dojo-excluded') || '[]')); }
    catch (e) { return new Set(); }
  }
  function saveExcluded() {
    try { localStorage.setItem('k-dojo-excluded', JSON.stringify(Array.from(excludedForms))); }
    catch (e) { /* ignore */ }
  }

  // ---- Verb class helpers ----
  function normalizeClass(vc) {
    if (vc === 'u') return 'godan';
    if (vc === 'ru') return 'ichidan';
    if (vc === 'verb') return 'godan';
    return vc || 'godan';
  }
  function classLabel(vc) {
    var labels = { godan: 'Godan', ichidan: 'Ichidan', irr_suru: 'Irregular', irr_kuru: 'Irregular', irr_aru: 'Irregular', irr_iku: 'Irregular', i_adj: 'i-Adj', na_adj: 'na-Adj', irr_ii: 'Irregular' };
    return labels[vc] || vc;
  }

  // ---- Form gating ----
  // Map introducedIn content-lesson IDs to the grammar lesson that teaches the form.
  // Forms already keyed to G-lessons pass through unchanged.
  var INTRO_TO_GRAMMAR = {
    'N5.1':  'G7',   // Polite Verb Forms — ます形
    'N5.5':  'G8',   // て-form — Connecting Actions
    'N5.8':  'G9',   // ている・たいです・ましょう
    'N5.9':  'G10',  // Plain Forms & Basic Connectors
    'N5.10': 'G11',  // i-Adjective Conjugation
    'N5.11': 'G12',  // na-Adjective Conjugation
    'N4.3':  'G13',  // Potential Form
    'N4.10': 'G19',  // Connecting Actions (nagara/tari)
    'N4.25': 'G25',  // Obligations & Conditionals
    'N4.31': 'G28'   // Passive & Causative
  };

  function isFormUnlocked(introducedIn) {
    // No unlock system or free mode → all forms available
    if (!cfg.unlock || cfg.unlock.isFree()) return true;
    // Gated mode → check grammar lesson completion
    var gLesson = INTRO_TO_GRAMMAR[introducedIn] || introducedIn;
    return cfg.unlock.isCompleted(gLesson);
  }

  var FORM_CATEGORIES = [
    { name: 'Polite Forms', keys: ['polite_masu','polite_mashita','polite_negative','polite_past_negative','polite_adj','polite_past_adj','polite_past_copula'] },
    { name: 'Te / Ta Forms', keys: ['te_form','plain_past','masu_stem','polite_negative_te'] },
    { name: 'Desire & Volitional', keys: ['desire_tai','desire_tai_negative','polite_desire_tai_negative','desire_tai_past','polite_volitional_mashou'] },
    { name: 'Plain Forms', keys: ['plain_negative','plain_past_negative','plain_adj','plain_past_adj','plain_desire_tai','plain_desire_tai_past','plain_volitional','plain_appearance_sou'] },
    { name: 'Progressive & Appearance', keys: ['casual_te_iru','appearance_sou_stem','appearance_sou','adverbial','attributive_na'] },
    { name: 'Potential', keys: ['potential','polite_potential','potential_negative','polite_potential_negative','plain_potential_negative','polite_potential_past','plain_potential_past'] },
    { name: 'Conditional', keys: ['conditional_ba','conditional_tara','nakereba'] },
    { name: 'Tari & Nagara', keys: ['tari_form','nagara_form'] },
    { name: 'Causative & Passive', keys: ['passive','causative','polite_passive','polite_passive_past','plain_passive_past','polite_causative','polite_causative_past','plain_causative_past','causative_passive','polite_causative_passive'] },
    { name: 'Excessive (Sugiru)', keys: ['sugiru_form','polite_sugiru_form','sugiru_past','polite_sugiru_past'] }
  ];

  function getUnlockedForms() {
    var rules = cfg.conjugationRules;
    var unlocked = [];
    for (var key in rules) {
      var form = rules[key];
      if (!form || !form.introducedIn || !form.rules) continue;
      if (key === 'plain_form') continue;
      // Gate by grammar lesson completion, not content lesson selection
      if (!isFormUnlocked(form.introducedIn)) continue;
      var classes = Object.keys(form.rules);
      if (!classes.some(function (c) { return c !== 'copula'; })) continue;
      var gLesson = INTRO_TO_GRAMMAR[form.introducedIn] || form.introducedIn;
      unlocked.push({ key: key, label: form.label, introducedIn: form.introducedIn, gLesson: gLesson, rules: form.rules });
    }
    return unlocked;
  }

  function countQueue() {
    var rules = cfg.conjugationRules;
    var count = 0;
    cfg.vocabMap.forEach(function (entry) {
      if (!entry.verb_class || (entry.id && entry.id.includes('__'))) return;
      if (entry.lesson_ids && !cfg.activeLessons.has(entry.lesson_ids)) return;
      var vc = normalizeClass(entry.verb_class);
      if (!activeVerbClasses.has(vc)) return;
      activeForms.forEach(function (ruleKey) {
        var formDef = rules[ruleKey];
        if (!formDef) return;
        var effectiveClass = vc;
        if (vc === 'irr_iku' && !formDef.rules['irr_iku']) effectiveClass = 'godan';
        if (!formDef.rules[effectiveClass]) return;
        if (formDef.rules[effectiveClass].type === 'identity') return;
        count++;
      });
    });
    return Math.min(count, 30);
  }

  // ---- Form picker UI ----
  function renderFormPicker() {
    var unlocked = getUnlockedForms();
    var unlockedKeys = new Set(unlocked.map(function (f) { return f.key; }));
    var formMap = {};
    unlocked.forEach(function (f) { formMap[f.key] = f; });

    // Restore previous selections (default: all on except excluded)
    activeForms.clear();
    unlocked.forEach(function (f) {
      if (!excludedForms.has(f.key)) activeForms.add(f.key);
    });

    var html = '<div class="dojo-wrap">';

    // Verb class filter
    html += '<div style="font-weight:700;font-size:0.85rem;color:#555;margin-bottom:4px;">Verb Types</div>';
    html += '<div class="dojo-vc-filter">';
    ['godan', 'ichidan', 'irr_suru', 'irr_kuru', 'irr_iku'].forEach(function (vc) {
      var lbl = vc === 'irr_suru' ? 'する' : vc === 'irr_kuru' ? '来る' : vc === 'irr_iku' ? '行く' : classLabel(vc);
      html += '<label><input type="checkbox" class="dojo-vc-chk" data-vc="' + vc + '" checked> ' + lbl + '</label>';
    });
    html += '</div>';

    // Form categories
    FORM_CATEGORIES.forEach(function (cat) {
      var catForms = cat.keys.filter(function (k) { return unlockedKeys.has(k); });
      if (catForms.length === 0) return;

      var allOn = catForms.every(function (k) { return activeForms.has(k); });
      html += '<div class="dojo-section-hdr open" data-cat="' + cat.name + '">' +
        '<span class="arrow">&#9654;</span>' +
        '<input type="checkbox" class="dojo-cat-chk" data-cat="' + cat.name + '"' + (allOn ? ' checked' : '') + '> ' +
        cat.name + ' <span style="color:#bbb;font-weight:400;font-size:0.75rem">(' + catForms.length + ')</span></div>';
      html += '<div class="dojo-form-list" data-cat="' + cat.name + '" style="display:flex;">';
      catForms.forEach(function (key) {
        var f = formMap[key];
        var checked = activeForms.has(key) ? ' checked' : '';
        html += '<div class="dojo-form-row">' +
          '<input type="checkbox" class="dojo-form-chk" data-key="' + key + '"' + checked + '>' +
          '<span class="dojo-form-label">' + f.label + '</span>' +
          '<span class="dojo-form-tag">' + (f.gLesson || f.introducedIn) + '</span></div>';
      });
      html += '</div>';
    });

    html += '<button class="dojo-start-btn" id="dojo-start-btn">Start Drill</button>';
    html += '<div class="dojo-queue-info" id="dojo-queue-info"></div>';
    html += '</div>';

    container.innerHTML = html;
    updateQueueInfo();

    // Wire events
    container.querySelectorAll('.dojo-section-hdr').forEach(function (hdr) {
      hdr.addEventListener('click', function (e) {
        if (e.target.tagName === 'INPUT') return;
        hdr.classList.toggle('open');
        var list = hdr.nextElementSibling;
        if (list) list.style.display = hdr.classList.contains('open') ? 'flex' : 'none';
      });
    });

    container.querySelectorAll('.dojo-cat-chk').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var catName = chk.dataset.cat;
        var list = container.querySelector('.dojo-form-list[data-cat="' + catName + '"]');
        if (!list) return;
        list.querySelectorAll('.dojo-form-chk').forEach(function (fc) {
          fc.checked = chk.checked;
          toggleForm(fc.dataset.key, chk.checked);
        });
        updateQueueInfo();
      });
    });

    container.querySelectorAll('.dojo-form-chk').forEach(function (chk) {
      chk.addEventListener('change', function () {
        toggleForm(chk.dataset.key, chk.checked);
        syncCatCheckbox(chk);
        updateQueueInfo();
      });
    });

    container.querySelectorAll('.dojo-vc-chk').forEach(function (chk) {
      chk.addEventListener('change', function () {
        if (chk.checked) activeVerbClasses.add(chk.dataset.vc);
        else activeVerbClasses.delete(chk.dataset.vc);
        updateQueueInfo();
      });
    });

    document.getElementById('dojo-start-btn').addEventListener('click', function () {
      if (activeForms.size === 0) return;
      startDrill();
    });
  }

  function toggleForm(key, on) {
    if (on) { activeForms.add(key); excludedForms.delete(key); }
    else { activeForms.delete(key); excludedForms.add(key); }
    saveExcluded();
  }

  function syncCatCheckbox(formChk) {
    var row = formChk.closest('.dojo-form-list');
    if (!row) return;
    var catName = row.dataset.cat;
    var catChk = container.querySelector('.dojo-cat-chk[data-cat="' + catName + '"]');
    if (!catChk) return;
    var all = row.querySelectorAll('.dojo-form-chk');
    var checked = row.querySelectorAll('.dojo-form-chk:checked');
    catChk.checked = checked.length === all.length;
    catChk.indeterminate = checked.length > 0 && checked.length < all.length;
  }

  function updateQueueInfo() {
    var c = countQueue();
    var info = document.getElementById('dojo-queue-info');
    var btn = document.getElementById('dojo-start-btn');
    if (info) info.textContent = c > 0 ? c + ' questions available' : 'Select forms and lessons to begin';
    if (btn) btn.disabled = c === 0;
  }

  // ---- Queue building ----
  function buildQueue() {
    var rules = cfg.conjugationRules;
    var tp = cfg.textProcessor;
    var pairs = [];
    cfg.vocabMap.forEach(function (entry) {
      if (!entry.verb_class || (entry.id && entry.id.includes('__'))) return;
      if (entry.lesson_ids && !cfg.activeLessons.has(entry.lesson_ids)) return;
      var vc = normalizeClass(entry.verb_class);
      if (!activeVerbClasses.has(vc)) return;
      activeForms.forEach(function (ruleKey) {
        var formDef = rules[ruleKey];
        if (!formDef) return;
        var effectiveClass = vc;
        if (vc === 'irr_iku' && !formDef.rules['irr_iku']) effectiveClass = 'godan';
        if (!formDef.rules[effectiveClass]) return;
        if (formDef.rules[effectiveClass].type === 'identity') return;
        var term = { surface: entry.surface, reading: entry.reading, meaning: entry.meaning, verb_class: vc };
        var conjugated = tp.conjugate(term, ruleKey, rules);
        if (conjugated.surface !== entry.surface) {
          pairs.push({
            term: entry, vc: vc, ruleKey: ruleKey, formLabel: formDef.label,
            correctSurface: conjugated.surface, correctReading: conjugated.reading
          });
        }
      });
    });
    pairs.sort(function () { return Math.random() - 0.5; });
    return pairs.slice(0, 30);
  }

  // ---- Drill ----
  function startDrill() {
    queue = buildQueue();
    if (queue.length === 0) return;
    qIdx = 0; sessionCorrect = 0; sessionTotal = 0; mistakes = [];
    helperVisible = false;
    renderDrill();
  }

  function startDrillWithQueue(q) {
    queue = q;
    if (queue.length === 0) { renderFormPicker(); return; }
    qIdx = 0; sessionCorrect = 0; sessionTotal = 0; mistakes = [];
    helperVisible = false;
    renderDrill();
  }

  function renderDrill() {
    if (qIdx >= queue.length) { renderSummary(); return; }
    var item = queue[qIdx];
    cfg.onProgress && cfg.onProgress(qIdx + 1, queue.length);

    var html = '<div class="dojo-wrap">';

    // Prompt card
    html += '<div class="dojo-prompt">';
    html += '<div class="dojo-dict">' + esc(item.term.surface) + '</div>';
    html += '<div class="dojo-reading">' + esc(item.term.reading) + '</div>';
    html += '<div class="dojo-meaning">' + esc(item.term.meaning) + '</div>';
    html += '<div class="dojo-target">\u2192 ' + esc(item.formLabel) + '</div>';
    html += '<div class="dojo-badge">' + classLabel(item.vc) + '</div>';
    html += '</div>';

    // Input
    html += '<div class="dojo-input-wrap">';
    html += '<input type="text" class="dojo-input" id="dojo-input" lang="ja" inputmode="text" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="Type answer...">';
    html += '<button class="dojo-submit" id="dojo-submit-btn">Go</button>';
    html += '</div>';

    // Feedback area
    html += '<div class="dojo-feedback" id="dojo-feedback"></div>';

    // Helper toggle + panel
    html += '<div style="text-align:center">';
    html += '<button class="dojo-helper-toggle" id="dojo-helper-toggle">\uD83D\uDCD6 Helper</button>';
    html += '</div>';
    html += buildHelperHTML(item);

    html += '</div>';
    container.innerHTML = html;

    // Wire IME-safe input
    var inp = document.getElementById('dojo-input');
    var submitted = false;
    isComposing = false;

    inp.addEventListener('compositionstart', function () { isComposing = true; });
    inp.addEventListener('compositionend', function () { isComposing = false; });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !isComposing && !submitted) {
        e.preventDefault();
        submitted = true;
        submitAnswer(item, inp.value);
      }
    });
    document.getElementById('dojo-submit-btn').addEventListener('click', function () {
      if (!submitted) { submitted = true; submitAnswer(item, inp.value); }
    });
    document.getElementById('dojo-helper-toggle').addEventListener('click', function () {
      helperVisible = !helperVisible;
      var panel = document.getElementById('dojo-helper-panel');
      if (panel) panel.classList.toggle('open', helperVisible);
    });

    inp.focus();
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  // ---- Answer checking + feedback ----
  function submitAnswer(item, input) {
    var normalized = (input || '').trim();
    if (!normalized) return;
    sessionTotal++;
    var isCorrect = normalized === item.correctSurface || normalized === item.correctReading;
    var fb = document.getElementById('dojo-feedback');
    var inp = document.getElementById('dojo-input');
    if (inp) inp.disabled = true;

    if (isCorrect) {
      cfg.onCorrect && cfg.onCorrect();
      if (fb) {
        fb.innerHTML = '<div class="dojo-correct-msg">\u6B63\u89E3\uFF01</div>';
        fb.classList.add('dojo-flash-correct');
      }
      sessionCorrect++;
      setTimeout(function () { qIdx++; renderDrill(); }, 1000);
    } else {
      cfg.onWrong && cfg.onWrong();
      mistakes.push(item);
      var expected = item.correctReading;
      var diff = buildCharDiff(normalized, expected);
      var hint = getGodanHint(item);
      var h = '<div class="dojo-wrong-msg">\u6B8B\u5FF5\uFF01</div>';
      h += '<div class="dojo-diff">' + diff.map(function (d) {
        return '<span class="dojo-char dojo-char-' + d.status + '">' + esc(d.char) + '</span>';
      }).join('') + '</div>';
      h += '<div class="dojo-answer-reveal">\u6B63\u89E3: ' + esc(item.correctSurface) + ' (' + esc(item.correctReading) + ')</div>';
      if (hint) h += '<div class="dojo-hint">' + esc(hint) + '</div>';
      h += '<button class="dojo-next-btn" id="dojo-next-btn">Next \u27A1</button>';
      if (fb) { fb.innerHTML = h; fb.classList.add('dojo-flash-wrong'); }
      var nextBtn = document.getElementById('dojo-next-btn');
      if (nextBtn) nextBtn.addEventListener('click', function () { qIdx++; renderDrill(); });
    }
  }

  function buildCharDiff(userInput, expected) {
    var result = [];
    var maxLen = Math.max(userInput.length, expected.length);
    for (var i = 0; i < maxLen; i++) {
      if (i < userInput.length && i < expected.length) {
        if (userInput[i] === expected[i]) result.push({ char: userInput[i], status: 'ok' });
        else result.push({ char: userInput[i], status: 'wrong' });
      } else if (i >= userInput.length) {
        result.push({ char: expected[i], status: 'missing' });
      } else {
        result.push({ char: userInput[i], status: 'extra' });
      }
    }
    return result;
  }

  // ---- Godan contextual hints ----
  var SOUND_GROUPS = {
    'te_form': [
      { chars: ['\u3080','\u3076','\u306C'], result: '\u3093\u3067', label: '\u3080/\u3076/\u306C \u2192 \u3093\u3067' },
      { chars: ['\u304F'], result: '\u3044\u3066', label: '\u304F \u2192 \u3044\u3066' },
      { chars: ['\u3050'], result: '\u3044\u3067', label: '\u3050 \u2192 \u3044\u3067' },
      { chars: ['\u3059'], result: '\u3057\u3066', label: '\u3059 \u2192 \u3057\u3066' },
      { chars: ['\u3046','\u3064','\u308B'], result: '\u3063\u3066', label: '\u3046/\u3064/\u308B \u2192 \u3063\u3066' }
    ],
    'plain_past': [
      { chars: ['\u3080','\u3076','\u306C'], result: '\u3093\u3060', label: '\u3080/\u3076/\u306C \u2192 \u3093\u3060' },
      { chars: ['\u304F'], result: '\u3044\u305F', label: '\u304F \u2192 \u3044\u305F' },
      { chars: ['\u3050'], result: '\u3044\u3060', label: '\u3050 \u2192 \u3044\u3060' },
      { chars: ['\u3059'], result: '\u3057\u305F', label: '\u3059 \u2192 \u3057\u305F' },
      { chars: ['\u3046','\u3064','\u308B'], result: '\u3063\u305F', label: '\u3046/\u3064/\u308B \u2192 \u3063\u305F' }
    ],
    'tari_form': [
      { chars: ['\u3080','\u3076','\u306C'], result: '\u3093\u3060\u308A', label: '\u3080/\u3076/\u306C \u2192 \u3093\u3060\u308A' },
      { chars: ['\u304F'], result: '\u3044\u305F\u308A', label: '\u304F \u2192 \u3044\u305F\u308A' },
      { chars: ['\u3050'], result: '\u3044\u3060\u308A', label: '\u3050 \u2192 \u3044\u3060\u308A' },
      { chars: ['\u3059'], result: '\u3057\u305F\u308A', label: '\u3059 \u2192 \u3057\u305F\u308A' },
      { chars: ['\u3046','\u3064','\u308B'], result: '\u3063\u305F\u308A', label: '\u3046/\u3064/\u308B \u2192 \u3063\u305F\u308A' }
    ]
  };

  function getGodanHint(item) {
    if (item.vc !== 'godan') return null;
    var lastChar = item.term.reading.slice(-1);
    var family = null;
    if (item.ruleKey === 'te_form' || item.ruleKey === 'polite_negative_te' || item.ruleKey === 'casual_te_iru') family = 'te_form';
    else if (item.ruleKey === 'plain_past' || item.ruleKey === 'conditional_tara') family = 'plain_past';
    else if (item.ruleKey === 'tari_form') family = 'tari_form';
    if (!family || !SOUND_GROUPS[family]) return null;
    var groups = SOUND_GROUPS[family];
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].chars.indexOf(lastChar) !== -1) {
        return lastChar + ' is in the ' + groups[i].label + ' group';
      }
    }
    return null;
  }

  // ---- Helper panel ----
  function buildHelperHTML(item) {
    var openClass = helperVisible ? ' open' : '';
    var h = '<div class="dojo-helper' + openClass + '" id="dojo-helper-panel">';
    h += '<table>';
    // Te-form chart (most commonly needed)
    h += '<tr><td colspan="2" style="font-weight:700;color:#8e44ad;padding-bottom:4px;">\u3066-form Rules (Godan)</td></tr>';
    h += '<tr><td class="hl">\u304F \u2192 \u3044\u3066</td><td class="hl">\u3050 \u2192 \u3044\u3067</td></tr>';
    h += '<tr><td class="hl">\u3059 \u2192 \u3057\u3066</td><td></td></tr>';
    h += '<tr><td class="hl">\u3080/\u3076/\u306C \u2192 \u3093\u3067</td><td></td></tr>';
    h += '<tr><td class="hl">\u3046/\u3064/\u308B \u2192 \u3063\u3066</td><td></td></tr>';
    h += '<tr><td colspan="2" style="padding-top:6px;color:#555;">Ichidan: drop \u308B, add \u3066</td></tr>';
    h += '<tr><td colspan="2" style="color:#555;">\u3059\u308B \u2192 \u3057\u3066 \u3000 \u6765\u308B \u2192 \u304D\u3066</td></tr>';
    h += '<tr><td colspan="2" style="color:#555;">\u884C\u304F \u2192 \u884C\u3063\u3066 (exception)</td></tr>';
    // Masu-stem chart
    h += '<tr><td colspan="2" style="font-weight:700;color:#8e44ad;padding-top:10px;">\u307E\u3059-stem (Godan: \u3046\u2192\u3044 row)</td></tr>';
    h += '<tr><td colspan="2" style="color:#555;">Ichidan: drop \u308B</td></tr>';
    h += '</table></div>';
    return h;
  }

  // ---- Summary ----
  function renderSummary() {
    var pct = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    var streakInfo = cfg.getStreakInfo ? cfg.getStreakInfo() : { streak: 0, best: 0 };

    var html = '<div class="dojo-wrap"><div class="dojo-summary">';
    html += '<div class="dojo-score">' + sessionCorrect + ' / ' + sessionTotal + '</div>';
    html += '<div class="dojo-score-pct">' + pct + '% correct</div>';

    // Breakdown by form
    var formCounts = {};
    var formCorrectCounts = {};
    queue.forEach(function (item, idx) {
      var label = item.formLabel;
      formCounts[label] = (formCounts[label] || 0) + 1;
    });
    var mistakeKeys = {};
    mistakes.forEach(function (item) { mistakeKeys[item.formLabel] = (mistakeKeys[item.formLabel] || 0) + 1; });
    Object.keys(formCounts).forEach(function (label) {
      formCorrectCounts[label] = formCounts[label] - (mistakeKeys[label] || 0);
    });

    if (Object.keys(formCounts).length > 1) {
      html += '<div class="dojo-breakdown"><div style="font-weight:700;margin-bottom:4px;">By Form</div>';
      Object.keys(formCounts).forEach(function (label) {
        html += '<div class="dojo-breakdown-row"><span>' + esc(label) + '</span><span>' +
          formCorrectCounts[label] + '/' + formCounts[label] + '</span></div>';
      });
      html += '</div>';
    }

    // Breakdown by verb class
    var vcCounts = {};
    var vcMistakes = {};
    queue.forEach(function (item) {
      var cl = classLabel(item.vc);
      vcCounts[cl] = (vcCounts[cl] || 0) + 1;
    });
    mistakes.forEach(function (item) {
      var cl = classLabel(item.vc);
      vcMistakes[cl] = (vcMistakes[cl] || 0) + 1;
    });
    if (Object.keys(vcCounts).length > 1) {
      html += '<div class="dojo-breakdown"><div style="font-weight:700;margin-bottom:4px;">By Verb Type</div>';
      Object.keys(vcCounts).forEach(function (cl) {
        var correct = vcCounts[cl] - (vcMistakes[cl] || 0);
        html += '<div class="dojo-breakdown-row"><span>' + esc(cl) + '</span><span>' +
          correct + '/' + vcCounts[cl] + '</span></div>';
      });
      html += '</div>';
    }

    html += '<div class="dojo-summary-btns">';
    if (mistakes.length > 0) {
      html += '<button class="dojo-btn-primary" id="dojo-retry-btn">\uD83D\uDD01 Retry Mistakes (' + mistakes.length + ')</button>';
    }
    html += '<button class="dojo-btn-secondary" id="dojo-new-btn">New Session</button>';
    html += '<button class="dojo-btn-secondary" id="dojo-exit-btn">Back to Menu</button>';
    html += '</div></div></div>';

    container.innerHTML = html;

    if (mistakes.length > 0) {
      document.getElementById('dojo-retry-btn').addEventListener('click', function () {
        var retryQueue = mistakes.map(function (m) { return Object.assign({}, m); });
        retryQueue.sort(function () { return Math.random() - 0.5; });
        startDrillWithQueue(retryQueue);
      });
    }
    document.getElementById('dojo-new-btn').addEventListener('click', function () { renderFormPicker(); });
    document.getElementById('dojo-exit-btn').addEventListener('click', function () { cfg.onExit && cfg.onExit(); });
  }

  // ---- Public API ----
  window.JPShared.conjugationDojo = {
    init: function (containerEl, ctx) {
      injectStyles();
      cfg = ctx;
      container = containerEl;
      container.innerHTML = '';
      renderFormPicker();
    },
    destroy: function () {
      if (container) container.innerHTML = '';
    }
  };
})();
