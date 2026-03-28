/**
 * app/games/marathon.js
 * Sentence Challenge — progressive-difficulty sentence scramble with belt ranks.
 *
 * Shell contract:
 *   Practice.js owns chrome (progress counter, hanabi, session tracking).
 *   This module owns everything inside its container div.
 *   Shell passes: container, level ('N4'), activeLessons, config,
 *                 onComplete, onExit, onProgress.
 *
 * Data format (scramble.N4.json):
 *   { mode:"progressive", marathons:[{ id, title, requires[],
 *     warmup:[items], buildup:[items], challenge:[items] }] }
 */
(function () {
  'use strict';
  window.JPShared = window.JPShared || {};

  var PHASES = [
    { key: 'warmup',    label: '\u767D\u5E2F Warm-up',  bg: '#e8e8e8', color: '#333' },
    { key: 'buildup',   label: '\u9EC4\u5E2F Build-up', bg: '#f0c040', color: '#333' },
    { key: 'challenge', label: '\u8336\u5E2F Challenge', bg: '#8B4513', color: '#fff' }
  ];

  // ── CSS ───────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('jp-mara-style')) return;
    var s = document.createElement('style');
    s.id = 'jp-mara-style';
    s.textContent =
      '.mara-wrap{font-family:"Poppins","Noto Sans JP",sans-serif;max-width:480px;margin:0 auto;}' +
      '.mara-pick-hdr{font-size:1.05rem;font-weight:800;color:#f0e6ff;text-align:center;margin:16px 0 12px;}' +
      '.mara-pick-list{display:grid;grid-template-columns:1fr;gap:7px;}' +
      '.mara-pick-item{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;background:#1e1442;border:1.5px solid #3d2f6e;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s,border-color 0.15s;}' +
      '.mara-pick-item:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(212,114,154,0.22);border-color:#d4729a;}' +
      '.mara-pick-num{font-weight:900;font-size:0.88rem;color:#d4729a;min-width:20px;flex-shrink:0;}' +
      '.mara-pick-info{flex:1;min-width:0;}' +
      '.mara-pick-title{font-weight:700;font-size:0.88rem;color:#f0e6ff;}' +
      '.mara-pick-sub{font-size:0.75rem;color:#a89cc8;margin-top:2px;}' +
      '.mara-pick-badge{width:44px;height:44px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}' +
      '.mara-pick-badge img{width:100%;height:100%;object-fit:contain;opacity:0.85;animation:maraPickPop 0.3s ease;}' +
      '.mara-pick-go{font-size:0.82rem;font-weight:700;color:#5b4a7a;flex-shrink:0;}' +
      '@keyframes maraPickPop{0%{transform:scale(2) rotate(0deg);opacity:0}60%{transform:scale(0.9)}100%{transform:scale(1);opacity:0.85}}' +
      '.mara-game{max-width:480px;margin:0 auto;padding:8px 0 0;animation:maraSlideIn 0.25s ease;}' +
      '.mara-game-hdr{display:flex;align-items:center;gap:8px;margin-bottom:6px;}' +
      '.mara-btn-back-sm{background:none;border:none;color:#a89cc8;font-weight:700;font-size:0.82rem;cursor:pointer;padding:4px 0;flex-shrink:0;}' +
      '.mara-btn-back-sm:hover{color:#f0e6ff;}' +
      '.mara-progress-dots{display:flex;gap:5px;flex:1;justify-content:center;}' +
      '.mara-dot{width:8px;height:8px;border-radius:50%;background:#3d2f6e;transition:background 0.25s,transform 0.25s;}' +
      '.mara-dot-done{background:#27ae60;}' +
      '.mara-dot-active{background:#d4729a;transform:scale(1.25);}' +
      '.mara-progress-text{font-size:0.75rem;color:#a89cc8;font-weight:700;flex-shrink:0;min-width:36px;text-align:right;}' +
      '.mara-phase{text-align:center;padding:6px 14px;border-radius:8px;font-weight:800;font-size:0.78rem;margin-bottom:10px;letter-spacing:0.04em;transition:background 0.3s,color 0.3s;}' +
      '.mara-prompt{text-align:center;font-size:1rem;color:#f0e6ff;font-weight:600;margin-bottom:14px;line-height:1.4;padding:0 8px;}' +
      '.mara-slot-area{background:rgba(255,255,255,0.04);border:2px dashed #3d2f6e;border-radius:16px;min-height:64px;padding:12px;margin:0 4px 14px;transition:border-color 0.2s,background 0.2s;}' +
      '.mara-slot-area.mara-drop-active{border-color:#d4729a;background:rgba(212,114,154,0.08);}' +
      '.mara-slot-empty{text-align:center;color:#5b4a7a;font-size:0.78rem;font-weight:600;padding:12px 0;user-select:none;}' +
      '.mara-slot{display:flex;flex-wrap:wrap;gap:8px;min-height:10px;justify-content:center;}' +
      '.mara-bank{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:4px 8px;margin-bottom:14px;min-height:48px;}' +
      '.mara-tile{display:inline-flex;align-items:center;justify-content:center;padding:10px 16px;background:#1e1442;border:2px solid #3d2f6e;border-radius:10px;font-family:"Noto Sans JP",sans-serif;font-size:1.05rem;font-weight:600;color:#f0e6ff;cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;transition:transform 0.18s,box-shadow 0.18s,opacity 0.18s,border-color 0.18s,background 0.18s;box-shadow:0 2px 6px rgba(0,0,0,0.2);}' +
      '.mara-tile:hover{border-color:#7c5cbf;transform:translateY(-2px);}' +
      '.mara-tile:active{cursor:grabbing;}' +
      '.mara-tile.mara-dragging{opacity:0.25;transform:scale(0.95);}' +
      '.mara-tile.mara-correct{border-color:#27ae60;background:#1a3a1e;color:#6ddf80;}' +
      '.mara-tile.mara-wrong{border-color:#c0392b;background:#3a1a1a;animation:maraShake 0.45s ease;}' +
      '.mara-tile-ghost{position:fixed;z-index:10000;pointer-events:none;padding:10px 16px;background:#2a1d5c;border:2px solid #d4729a;border-radius:10px;font-family:"Noto Sans JP",sans-serif;font-size:1.05rem;font-weight:600;color:#f0e6ff;box-shadow:0 10px 28px rgba(0,0,0,0.35);transform:scale(1.06);}' +
      '.mara-actions{padding:0 4px;}' +
      '.mara-btn-check{display:block;width:100%;padding:13px;border:none;border-radius:12px;font-weight:700;font-size:0.93rem;cursor:pointer;color:#fff;background:linear-gradient(135deg,#d4729a 0%,#b8527e 100%);box-shadow:0 4px 12px rgba(212,114,154,0.3);transition:opacity 0.15s,transform 0.1s;}' +
      '.mara-btn-check:active:not(:disabled){transform:scale(0.97);}' +
      '.mara-btn-check:disabled{opacity:0.3;cursor:default;box-shadow:none;}' +
      '.mara-explain{margin-top:12px;padding:14px;background:rgba(39,174,96,0.1);border-radius:12px;border:1px solid rgba(39,174,96,0.25);}' +
      '.mara-explain-text{color:#6ddf80;font-size:0.82rem;line-height:1.55;}' +
      '.mara-btn-next{display:block;width:100%;padding:13px;margin-top:10px;border:none;border-radius:12px;font-weight:700;font-size:0.93rem;cursor:pointer;color:#fff;background:linear-gradient(135deg,#27ae60 0%,#1e8c4c 100%);box-shadow:0 4px 12px rgba(39,174,96,0.3);}' +
      '.mara-btn-next:active{transform:scale(0.97);}' +
      '.mara-result{text-align:center;padding:40px 16px;}' +
      '.mara-result-stamp img{width:80px;height:80px;margin-bottom:8px;}' +
      '.mara-result-msg{font-size:1.1rem;font-weight:800;color:#f0e6ff;margin:12px 0 20px;}' +
      '.mara-btn-full{display:block;width:100%;padding:13px;border:none;border-radius:12px;font-weight:700;font-size:0.93rem;cursor:pointer;margin-top:8px;}' +
      '.mara-btn-full:active{transform:scale(0.97);}' +
      '.mara-btn-full-primary{color:#fff;background:linear-gradient(135deg,#d4729a 0%,#b8527e 100%);}' +
      '.mara-btn-full-sec{color:#c77dff;background:rgba(199,125,255,0.12);border:1.5px solid rgba(199,125,255,0.28);}' +
      '.mara-btn-full-warn{color:#fff;background:linear-gradient(135deg,#e67e22 0%,#c0392b 100%);}' +
      '.mara-empty{text-align:center;padding:40px 16px;}' +
      '.mara-empty-icon{font-size:2.4rem;margin-bottom:12px;}' +
      '.mara-empty-msg{font-size:0.92rem;color:#a89cc8;line-height:1.6;margin-bottom:20px;}' +
      '@keyframes maraShake{0%,100%{transform:translateX(0)}15%,45%,75%{transform:translateX(-5px)}30%,60%,90%{transform:translateX(5px)}}' +
      '@keyframes maraSlideIn{0%{opacity:0;transform:translateY(-8px)}100%{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }

  // ── Helpers ───────────────────────────────────────────────────────
  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }
  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; }
    return true;
  }

  // ── Persistence ───────────────────────────────────────────────────
  var RESULT_KEY = 'k-mara-';
  function savePuzzleResult(id, status) {
    var existing = getPuzzleResult(id);
    if (status === 'failed' && existing && existing.status === 'complete') return;
    var tilt = existing && existing.tilt !== undefined
      ? existing.tilt : (Math.floor(Math.random() * 41) - 20);
    try {
      localStorage.setItem(RESULT_KEY + id,
        JSON.stringify({ status: status, ts: Date.now(), tilt: tilt }));
    } catch (e) {}
  }
  function getPuzzleResult(id) {
    try {
      var raw = localStorage.getItem(RESULT_KEY + id);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // ── State ─────────────────────────────────────────────────────────
  var cfg = {}, container = null, allMarathons = [], dataCache = null;
  var curMarathon = null, flatItems = [], curIdx = 0;
  var slotTiles = [], bankTiles = [], locked = false;
  var drag = null, ghostEl = null;

  // ── Flatten marathon into ordered item list with phase info ───────
  function flattenMarathon(m) {
    var out = [];
    PHASES.forEach(function (ph) {
      (m[ph.key] || []).forEach(function (item) {
        out.push({ item: item, phase: ph });
      });
    });
    return out;
  }

  // ── Data loading ──────────────────────────────────────────────────
  function loadData(level, cb) {
    if (dataCache) { cb(null, dataCache); return; }
    var path = 'data/' + level + '/scramble/scramble.' + level + '.json';
    var url = window.getAssetUrl(cfg.config, path) + '?t=' + Date.now();
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { dataCache = data; cb(null, data); })
      .catch(function (e) { cb(e); });
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init(containerEl, ctx) {
    injectStyles();
    cfg = ctx; container = containerEl;
    container.innerHTML = ''; allMarathons = []; locked = false;
    cleanupDrag();

    var level = cfg.level || 'N4';
    container.innerHTML = '<div class="mara-wrap" style="text-align:center;padding:32px;color:#a89cc8;font-size:0.9rem;">Loading\u2026</div>';

    loadData(level, function (err, data) {
      if (err) {
        container.innerHTML =
          '<div class="mara-wrap"><div class="mara-empty"><div class="mara-empty-icon">\u26A0\uFE0F</div>' +
          '<div class="mara-empty-msg">Could not load challenges.<br>Please check your connection.</div>' +
          '<button class="mara-btn-full mara-btn-full-sec" id="mara-err-exit">Exit</button></div></div>';
        document.getElementById('mara-err-exit').onclick = function () { if (cfg.onExit) cfg.onExit(); };
        return;
      }

      var marathons = (data.marathons || []).filter(function (m) {
        if (!m.requires || !cfg.activeLessons) return true;
        return m.requires.every(function (r) { return cfg.activeLessons.has(r); });
      });

      if (marathons.length === 0) {
        container.innerHTML =
          '<div class="mara-wrap"><div class="mara-empty"><div class="mara-empty-icon">\uD83E\uDD4B</div>' +
          '<div class="mara-empty-msg">No challenges unlocked yet!<br>Complete more N4 lessons to earn your belt.</div>' +
          '<button class="mara-btn-full mara-btn-full-sec" id="mara-nopuz-exit">Back to Menu</button></div></div>';
        document.getElementById('mara-nopuz-exit').onclick = function () { if (cfg.onExit) cfg.onExit(); };
        return;
      }

      allMarathons = marathons;
      renderPicker();
    });
  }

  // ── Picker ────────────────────────────────────────────────────────
  function renderPicker() {
    if (window.JPShared && window.JPShared.streak) window.JPShared.streak.recordActivity();
    var stampApi = window.JPShared && window.JPShared.stampSettings;
    var stampUrl = stampApi && stampApi.getStampUrl ? stampApi.getStampUrl() : '';
    var pooUrl = stampApi && stampApi.getPooUrl ? stampApi.getPooUrl() : '';

    var completedCount = 0;
    allMarathons.forEach(function (m) {
      var r = getPuzzleResult(m.id);
      if (r && r.status === 'complete') completedCount++;
    });
    if (cfg.onProgress) cfg.onProgress(completedCount, allMarathons.length);

    var html = '<div class="mara-wrap"><div class="mara-pick-hdr">Sentence Challenge</div><div class="mara-pick-list">';

    allMarathons.forEach(function (m, i) {
      var result = getPuzzleResult(m.id);
      var tilt = result ? result.tilt : 0;
      var count = (m.warmup || []).length + (m.buildup || []).length + (m.challenge || []).length;

      html += '<div class="mara-pick-item" data-idx="' + i + '">';
      html += '<div class="mara-pick-num">' + (i + 1) + '</div>';
      html += '<div class="mara-pick-info"><div class="mara-pick-title">' + esc(m.title) + '</div>';
      html += '<div class="mara-pick-sub">' + count + ' sentences</div></div>';

      if (result && result.status === 'complete' && stampUrl) {
        html += '<div class="mara-pick-badge"><img src="' + esc(stampUrl) + '" alt="\u2713" style="transform:rotate(' + tilt + 'deg);"></div>';
      } else if (result && result.status === 'failed' && pooUrl) {
        html += '<div class="mara-pick-badge"><img src="' + esc(pooUrl) + '" alt="\u2717" style="transform:rotate(' + tilt + 'deg);"></div>';
      } else {
        html += '<span class="mara-pick-go">Go \u2192</span>';
      }
      html += '</div>';
    });

    html += '</div></div>';
    container.innerHTML = html;

    container.querySelectorAll('.mara-pick-item').forEach(function (item) {
      item.addEventListener('click', function () {
        startMarathon(allMarathons[parseInt(item.dataset.idx, 10)]);
      });
    });
  }

  // ── Start marathon ────────────────────────────────────────────────
  function startMarathon(m) {
    curMarathon = m;
    flatItems = flattenMarathon(m);
    curIdx = 0;
    prepareItem();
  }

  function prepareItem() {
    var entry = flatItems[curIdx];
    locked = false; cleanupDrag();
    var allWords = entry.item.segments.concat(entry.item.distractors || []);
    bankTiles = shuffle(allWords.slice());
    slotTiles = [];
    renderGame();
  }

  // ── Render game ───────────────────────────────────────────────────
  function renderGame() {
    var entry = flatItems[curIdx];
    var item = entry.item;
    var phase = entry.phase;
    var total = flatItems.length;

    var html = '<div class="mara-game">';
    html += '<div class="mara-game-hdr">';
    html += '<button class="mara-btn-back-sm" id="mara-back">\u2190 Challenges</button>';
    html += '<div class="mara-progress-dots">';
    for (var d = 0; d < total; d++) {
      var cls = d < curIdx ? ' mara-dot-done' : d === curIdx ? ' mara-dot-active' : '';
      html += '<span class="mara-dot' + cls + '"></span>';
    }
    html += '</div>';
    html += '<div class="mara-progress-text">' + (curIdx + 1) + '/' + total + '</div></div>';

    // Phase banner
    html += '<div class="mara-phase" style="background:' + phase.bg + ';color:' + phase.color + ';">' + esc(phase.label) + '</div>';

    html += '<div class="mara-prompt">' + esc(item.q) + '</div>';

    // Slot area
    html += '<div class="mara-slot-area" id="mara-slot-area">';
    if (slotTiles.length === 0) {
      html += '<div class="mara-slot-empty">Tap or drag words to build the sentence</div>';
    }
    html += '<div class="mara-slot" id="mara-slot">';
    slotTiles.forEach(function (t, i) {
      html += '<div class="mara-tile" data-zone="slot" data-idx="' + i + '">' + esc(t) + '</div>';
    });
    html += '</div></div>';

    // Bank
    html += '<div class="mara-bank" id="mara-bank">';
    bankTiles.forEach(function (t, i) {
      html += '<div class="mara-tile" data-zone="bank" data-idx="' + i + '">' + esc(t) + '</div>';
    });
    html += '</div>';

    html += '<div class="mara-actions"><button class="mara-btn-check" id="mara-check"' +
      (slotTiles.length === 0 ? ' disabled' : '') + '>Check</button></div>';
    html += '</div>';
    container.innerHTML = html;
    wireEvents();
  }

  // ── Events ────────────────────────────────────────────────────────
  function wireEvents() {
    container.querySelectorAll('.mara-tile').forEach(function (tile) {
      tile.addEventListener('pointerdown', onPointerDown);
    });
    var backBtn = document.getElementById('mara-back');
    if (backBtn) backBtn.addEventListener('click', function () {
      savePuzzleResult(curMarathon.id, 'failed');
      curMarathon = null;
      renderPicker();
    });
    var checkBtn = document.getElementById('mara-check');
    if (checkBtn) checkBtn.addEventListener('click', checkAnswer);
  }

  // ── Drag / tap ────────────────────────────────────────────────────
  function onPointerDown(e) {
    if (locked) return;
    var tile = e.target.closest('.mara-tile');
    if (!tile) return;
    e.preventDefault();
    tile.setPointerCapture(e.pointerId);
    drag = {
      active: false, el: tile,
      zone: tile.dataset.zone,
      idx: parseInt(tile.dataset.idx, 10),
      text: tile.dataset.zone === 'bank' ? bankTiles[parseInt(tile.dataset.idx, 10)] : slotTiles[parseInt(tile.dataset.idx, 10)],
      startX: e.clientX, startY: e.clientY, offsetX: 0, offsetY: 0
    };
    tile.addEventListener('pointermove', onPointerMove);
    tile.addEventListener('pointerup', onPointerUp);
    tile.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!drag) return;
    var dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
    if (!drag.active && (dx * dx + dy * dy) > 36) {
      drag.active = true;
      var rect = drag.el.getBoundingClientRect();
      drag.offsetX = e.clientX - rect.left;
      drag.offsetY = e.clientY - rect.top;
      drag.el.classList.add('mara-dragging');
      var ghost = document.createElement('div');
      ghost.className = 'mara-tile-ghost';
      ghost.textContent = drag.text;
      ghost.style.width = rect.width + 'px';
      ghost.style.left = (e.clientX - drag.offsetX) + 'px';
      ghost.style.top = (e.clientY - drag.offsetY) + 'px';
      document.body.appendChild(ghost);
      ghostEl = ghost;
    }
    if (drag.active && ghostEl) {
      ghostEl.style.left = (e.clientX - drag.offsetX) + 'px';
      ghostEl.style.top = (e.clientY - drag.offsetY) + 'px';
      var slotArea = container.querySelector('#mara-slot-area');
      if (slotArea) {
        var sr = slotArea.getBoundingClientRect();
        slotArea.classList.toggle('mara-drop-active',
          e.clientY >= sr.top - 30 && e.clientY <= sr.bottom + 30 &&
          e.clientX >= sr.left - 30 && e.clientX <= sr.right + 30);
      }
    }
  }

  function onPointerUp(e) {
    if (!drag) return;
    var d = drag; drag = null;
    d.el.removeEventListener('pointermove', onPointerMove);
    d.el.removeEventListener('pointerup', onPointerUp);
    d.el.removeEventListener('pointercancel', onPointerUp);
    if (d.active) {
      d.el.classList.remove('mara-dragging');
      if (ghostEl) { ghostEl.remove(); ghostEl = null; }
      var slotArea = container.querySelector('#mara-slot-area');
      if (slotArea) slotArea.classList.remove('mara-drop-active');
      var sr = slotArea ? slotArea.getBoundingClientRect() : { top: 0, bottom: 0, left: 0, right: 0 };
      var inSlot = e.clientY >= sr.top - 30 && e.clientY <= sr.bottom + 30 &&
                   e.clientX >= sr.left - 30 && e.clientX <= sr.right + 30;
      if (d.zone === 'bank') {
        if (inSlot) { bankTiles.splice(d.idx, 1); slotTiles.splice(getSlotInsertIdx(e.clientX, -1), 0, d.text); }
      } else {
        slotTiles.splice(d.idx, 1);
        if (inSlot) { slotTiles.splice(getSlotInsertIdx(e.clientX, d.idx), 0, d.text); }
        else { bankTiles.push(d.text); }
      }
      renderGame();
    } else {
      if (d.zone === 'bank') { bankTiles.splice(d.idx, 1); slotTiles.push(d.text); }
      else { slotTiles.splice(d.idx, 1); bankTiles.push(d.text); }
      renderGame();
    }
  }

  function getSlotInsertIdx(clientX, skipIdx) {
    var slotEl = container.querySelector('#mara-slot');
    if (!slotEl) return 0;
    var tiles = slotEl.querySelectorAll('.mara-tile');
    var pos = 0;
    for (var i = 0; i < tiles.length; i++) {
      if (i === skipIdx) continue;
      var rect = tiles[i].getBoundingClientRect();
      if (clientX < rect.left + rect.width / 2) return pos;
      pos++;
    }
    return pos;
  }

  function cleanupDrag() { if (ghostEl) { ghostEl.remove(); ghostEl = null; } drag = null; }

  // ── Answer checking ───────────────────────────────────────────────
  function checkAnswer() {
    if (locked || slotTiles.length === 0) return;
    locked = true;
    var item = flatItems[curIdx].item;
    var correct = arraysEqual(slotTiles, item.segments);
    if (!correct && item.alts) {
      for (var a = 0; a < item.alts.length; a++) {
        if (arraysEqual(slotTiles, item.alts[a])) { correct = true; break; }
      }
    }
    var tiles = container.querySelectorAll('#mara-slot .mara-tile');
    if (correct) {
      tiles.forEach(function (t) { t.classList.add('mara-correct'); });
      showExplanation(item);
    } else {
      tiles.forEach(function (t) { t.classList.add('mara-wrong'); });
      setTimeout(function () { locked = false; tiles.forEach(function (t) { t.classList.remove('mara-wrong'); }); }, 550);
    }
  }

  function showExplanation(item) {
    var actionsEl = container.querySelector('.mara-actions');
    if (!actionsEl) return;
    var isLast = curIdx >= flatItems.length - 1;
    actionsEl.innerHTML =
      '<div class="mara-explain"><div class="mara-explain-text">' + esc(item.explanation) + '</div></div>' +
      '<button class="mara-btn-next" id="mara-next">' + (isLast ? 'Finish \u2713' : 'Next \u2192') + '</button>';
    document.getElementById('mara-next').addEventListener('click', function () {
      curIdx++;
      if (curIdx < flatItems.length) { prepareItem(); }
      else {
        savePuzzleResult(curMarathon.id, 'complete');
        if (cfg.onComplete) cfg.onComplete();
        showResult(true);
      }
    });
  }

  // ── Result screen ─────────────────────────────────────────────────
  function showResult(completed) {
    var stampApi = window.JPShared && window.JPShared.stampSettings;
    var stampUrl = stampApi && stampApi.getStampUrl ? stampApi.getStampUrl() : '';
    var pooUrl = stampApi && stampApi.getPooUrl ? stampApi.getPooUrl() : '';
    var html = '<div class="mara-wrap"><div class="mara-result">';
    if (completed) {
      if (stampUrl) html += '<div class="mara-result-stamp"><img src="' + esc(stampUrl) + '" alt="\u2605"></div>';
      html += '<div class="mara-result-msg">Challenge Complete!</div>';
      html += '<button class="mara-btn-full mara-btn-full-primary" id="mara-res-back">Back to Challenges</button>';
    } else {
      if (pooUrl) html += '<div class="mara-result-stamp"><img src="' + esc(pooUrl) + '" alt="\u2717"></div>';
      html += '<div class="mara-result-msg">Challenge Incomplete</div>';
      html += '<button class="mara-btn-full mara-btn-full-warn" id="mara-res-retry">Retry</button>';
      html += '<button class="mara-btn-full mara-btn-full-sec" id="mara-res-back">Back to Challenges</button>';
    }
    html += '</div></div>';
    container.innerHTML = html;
    var retry = document.getElementById('mara-res-retry');
    if (retry) retry.addEventListener('click', function () { startMarathon(curMarathon); });
    document.getElementById('mara-res-back').addEventListener('click', function () { curMarathon = null; renderPicker(); });
  }

  // ── Destroy ───────────────────────────────────────────────────────
  function destroy() {
    cleanupDrag();
    if (container) container.innerHTML = '';
    container = null; cfg = {}; allMarathons = [];
    curMarathon = null; flatItems = []; locked = false;
  }

  window.JPShared.marathon = { init: init, destroy: destroy };
})();
