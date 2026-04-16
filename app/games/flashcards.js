/**
 * app/games/flashcards.js
 * Flashcards — study mode for kanji, vocab, and verbs.
 * Extracted from Practice.js kRenderFC() and surrounding machinery.
 *
 * Shell contract (hybrid):
 *   Practice.js owns chrome (progress/best/streak top bar, hanabi, progress API).
 *   This module owns everything inside its stage div: card HTML, flip, nav,
 *   card rendering, flag management, re-queue logic.
 *   Shell passes: container, type, mode, activeLessons, DB, onCorrect, onWrong,
 *                 onExit, getBest, setBest, recordActivity.
 */
(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  var cfg = null;
  var container = null;
  var curSet = [];
  var curIdx = 0;
  var curMode = '';
  var curType = '';
  var skipNextStreak = false;
  var flagCounts = {};
  var activeFlags = {};

  function setTxt(id, txt) {
    var el = document.getElementById(id);
    if (el) el.innerText = txt;
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
  }

  // ---- Build curSet from type/mode ----
  function buildSet(type, mode, activeLessons, DB) {
    if (type === 'kanji') {
      return DB.kanji.filter(function (k) { return activeLessons.has(k.lesson); });
    }
    if (type === 'verb') {
      return DB.verb.slice();
    }
    if (type === 'vocab') {
      var tempMap = new Map();
      var activeK = DB.kanji.filter(function (k) { return activeLessons.has(k.lesson); });
      activeK.forEach(function (k) {
        var cs = (k.compounds || '').split(';');
        cs.forEach(function (c) {
          var vObj = DB.vocabMap.get(c);
          if (vObj && !tempMap.has(c)) {
            tempMap.set(c, {
              word: c,
              reading: vObj.reading,
              meaning: vObj.meaning,
              lesson: k.lesson,
              gtype: vObj.gtype,
              notes: vObj.notes,
              id: vObj.id,
              surface: vObj.surface,
              lesson_ids: vObj.lesson_ids
            });
          }
        });
      });
      return Array.from(tempMap.values());
    }
    if (type === 'mixed' && mode === 'flag-review') {
      var set = [];
      Object.keys(activeFlags).forEach(function (key) {
        if (!activeFlags[key]) return;
        var item = DB.kanji.find(function (k) { return k.kanji === key; });
        if (item) { set.push(Object.assign({}, item, { _type: 'kanji' })); return; }
        item = DB.vocabMap.get(key);
        if (item) {
          set.push(Object.assign({}, item, { word: item.surface, _type: 'vocab' }));
          return;
        }
        item = DB.verb.find(function (v) { return v.kanji === key || v.dict === key; });
        if (item) { set.push(Object.assign({}, item, { _type: 'verb' })); return; }
      });
      return set;
    }
    return [];
  }

  // ---- Dynamic compounds for kanji cards ----
  function getDynamicCompounds(kanjiChar, activeLessons, DB) {
    var activeKanji = new Set();
    DB.kanji.forEach(function (k) {
      if (activeLessons.has(k.lesson)) activeKanji.add(k.kanji);
    });
    var results = [];
    (DB.allVocab || []).forEach(function (v) {
      if (!v.surface.includes(kanjiChar)) return;
      var allKnown = Array.from(v.surface).every(function (ch) {
        if (ch.charCodeAt(0) >= 0x4E00 && ch.charCodeAt(0) <= 0x9FFF) {
          return activeKanji.has(ch);
        }
        return true;
      });
      if (allKnown) results.push(v);
    });
    return results;
  }

  // ---- Stage markup ----
  function renderStage() {
    container.innerHTML =
      '<div class="k-scene" id="k-fc-scene">' +
        '<div class="k-card-obj" id="k-fc-card-obj">' +
          '<div class="k-face k-face-front">' +
            '<div class="k-flag-stamp k-hidden" id="k-fc-flagged-icon">AGAIN</div>' +
            '<div class="k-lbl" id="k-fc-lbl" style="color:var(--primary)"></div>' +
            '<div class="k-big" id="k-fc-main"></div>' +
            '<div class="k-sub" id="k-fc-sub"></div>' +
            '<div class="k-tap-hint">Tap to Flip</div>' +
          '</div>' +
          '<div class="k-face k-face-back" id="k-fc-back-content"></div>' +
        '</div>' +
      '</div>' +
      '<div id="k-fc-nav-container" style="width:100%; margin-top:15px;"></div>';

    var scene = document.getElementById('k-fc-scene');
    if (scene) scene.addEventListener('click', flipCard);
  }

  function flipCard() {
    var c = document.getElementById('k-fc-card-obj');
    if (c) c.classList.toggle('is-flipped');
  }

  // ---- Render the current card ----
  function renderCard() {
    if (!curSet.length) return;
    var d = curSet[curIdx];
    setTxt('k-fc-progress', 'Card ' + (curIdx + 1) + ' / ' + curSet.length);

    var cardObj = document.getElementById('k-fc-card-obj');
    if (cardObj) cardObj.classList.remove('is-flipped');

    var stamp = document.getElementById('k-fc-flagged-icon');
    if (stamp) {
      var kKey = d.kanji || d.word || d.dict;
      if ((d.isRequeued || activeFlags[kKey]) && curMode !== 'flag-review') stamp.classList.remove('k-hidden');
      else stamp.classList.add('k-hidden');
    }

    renderNav();

    var backEl = document.getElementById('k-fc-back-content');
    var renderType = curType;
    if (curType === 'mixed' && d._type) renderType = d._type;

    var speakText = d.reading || d.kanji || d.word || d.surface;
    var escapedText = String(speakText).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    var speakBtnHtml = '<span class="jp-speak-btn" data-speak-text="' + escapedText + '" style="cursor:pointer; font-size:0.6em; margin-left:10px; opacity:0.7;">🔊</span>';

    if (renderType === 'kanji') renderKanjiCard(d, backEl, speakText, speakBtnHtml);
    else if (renderType === 'vocab') renderVocabCard(d, backEl, speakText, speakBtnHtml);
    else renderVerbCard(d, backEl, speakText, speakBtnHtml);
  }

  function renderNav() {
    var navContainer = document.getElementById('k-fc-nav-container');
    if (!navContainer) return;
    navContainer.innerHTML = '';

    if (curMode === 'flag-review') {
      navContainer.innerHTML =
        '<div style="display: flex; gap: 10px;">' +
          '<div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">' +
            '<button class="k-btn k-btn-sec" id="k-fc-btn-keepflag" style="color:#f39c12; border-color:#f39c12; font-weight:900; min-height: 70px; padding: 10px;">Keep Flag (+1)</button>' +
            '<button class="k-btn k-btn-sec" id="k-fc-btn-clearflag" style="color:#2ed573; border-color:#2ed573; font-weight:900; min-height: 70px; padding: 10px;">Clear Flag</button>' +
          '</div>' +
          '<div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">' +
            '<button class="k-btn k-btn-sec" id="k-fc-btn-prev" style="min-height: 70px; padding: 10px;">Prev</button>' +
            '<button class="k-btn k-btn-sec" id="k-fc-btn-next" style="min-height: 70px; padding: 10px;">Next</button>' +
          '</div>' +
        '</div>';
      wire('k-fc-btn-keepflag', function (e) { flag(e.currentTarget); });
      wire('k-fc-btn-clearflag', function (e) { clearFlag(e.currentTarget); });
    } else {
      navContainer.innerHTML =
        '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">' +
          '<button class="k-btn k-btn-sec" id="k-fc-btn-prev">Prev</button>' +
          '<button class="k-btn k-btn-sec" id="k-fc-btn-flag" style="color:#f39c12; border-color:#f39c12;">Flag 🚩</button>' +
          '<button class="k-btn k-btn-sec" id="k-fc-btn-next">Next</button>' +
        '</div>';
      wire('k-fc-btn-flag', function (e) { flag(e.currentTarget); });
    }
    wire('k-fc-btn-prev', function () { move(-1); });
    wire('k-fc-btn-next', function () { move(1); });
  }

  function wire(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function (ev) { ev.stopPropagation(); fn(ev); });
  }

  function attachSpeakBtn(selector, speakText) {
    var btn = document.querySelector(selector);
    if (!btn) return;
    btn.onclick = function (e) {
      e.stopPropagation();
      if (window.JPShared && window.JPShared.tts) window.JPShared.tts.speak(speakText);
    };
  }

  // ---- Card renderers ----
  function renderKanjiCard(d, backEl, speakText, speakBtnHtml) {
    setTxt('k-fc-lbl', d.lesson);
    if (curMode === 'flag-review') setTxt('k-fc-lbl', '🚩 Flags: ' + (flagCounts[d.kanji] || 0));

    var mainEl = document.getElementById('k-fc-main');
    if (mainEl) mainEl.innerHTML = esc(d.kanji) + speakBtnHtml;
    attachSpeakBtn('#k-fc-main .jp-speak-btn', speakText);
    setTxt('k-fc-sub', '');

    var h = '<div style="text-align:center; font-weight:700; font-size:2rem; margin-bottom:15px; color:var(--primary); line-height:1.2;">' + esc(d.meaning) + '</div>';
    var flags = flagCounts[d.kanji] || 0;
    if (flags > 0) h += '<div style="text-align:center; color:#ff4757; font-weight:700; margin-bottom:15px; font-size:0.8rem;">🚩 Flagged: ' + flags + ' times</div>';
    h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px; width:100%">' +
           '<div style="background:#f8f9fa; padding:10px; border-radius:8px; text-align:center"><div style="font-size:0.7rem; color:#aaa; font-weight:700;">ON-YOMI</div><div style="font-size:1.2rem; font-weight:600;">' + esc(d.on || '-') + '</div></div>' +
           '<div style="background:#f8f9fa; padding:10px; border-radius:8px; text-align:center"><div style="font-size:0.7rem; color:#aaa; font-weight:700;">KUN-YOMI</div><div style="font-size:1.2rem; font-weight:600;">' + esc(d.kun || '-') + '</div></div>' +
         '</div>';
    var dynCompounds = getDynamicCompounds(d.kanji, cfg.activeLessons, cfg.DB);
    function compoundRow(v, cls, hide) {
      return '<tr' + (cls ? ' class="' + cls + '"' : '') + (hide ? ' style="display:none"' : '') + '>' +
        '<td style="font-weight:bold; font-size:1.2rem">' + esc(v.surface) + '</td>' +
        '<td><div style="font-size:1rem">' + esc(v.reading || '') + '</div><div style="color:#747d8c; font-size:0.9rem">' + esc(v.meaning || '') + '</div></td></tr>';
    }
    h += '<div class="k-lbl" style="text-align:left;margin-top:10px;border-bottom:1px solid #eee;">Compounds' + (dynCompounds.length ? ' (' + dynCompounds.length + ')' : '') + '</div><table class="k-tbl">';
    if (dynCompounds.length === 0) {
      h += '<tr><td colspan="2" style="color:#aaa; font-size:0.9rem; padding:8px; text-align:center;">No compounds unlocked yet</td></tr>';
    } else {
      dynCompounds.slice(0, 5).forEach(function (v) { h += compoundRow(v); });
      if (dynCompounds.length > 5) {
        var extraId = 'k-extra-' + Date.now();
        h += '<tr class="k-show-more-row" data-extra-id="' + extraId + '"><td colspan="2" style="text-align:center; color:var(--primary); cursor:pointer; font-size:0.9rem; padding:8px; font-weight:600;">Show ' + (dynCompounds.length - 5) + ' more</td></tr>';
        dynCompounds.slice(5).forEach(function (v) { h += compoundRow(v, extraId, true); });
      }
    }
    if (backEl) {
      backEl.innerHTML = h + '</table>';
      var more = backEl.querySelector('.k-show-more-row');
      if (more) {
        more.addEventListener('click', function () {
          var id = more.dataset.extraId;
          more.style.display = 'none';
          backEl.querySelectorAll('.' + id).forEach(function (r) { r.style.display = ''; });
        });
      }
    }
  }

  function renderVocabCard(d, backEl, speakText, speakBtnHtml) {
    setTxt('k-fc-lbl', 'Vocabulary');
    if (curMode === 'flag-review') setTxt('k-fc-lbl', '🚩 Flags: ' + (flagCounts[d.word] || 0));

    var mainEl = document.getElementById('k-fc-main');
    if (mainEl) mainEl.innerHTML = esc(d.word) + speakBtnHtml;
    attachSpeakBtn('#k-fc-main .jp-speak-btn', speakText);
    setTxt('k-fc-sub', '');

    var h = '<div style="text-align:center; font-weight:700; font-size:2rem; margin-bottom:10px; color:var(--primary); line-height:1.2;">' + esc(d.meaning) + '</div>';
    h += '<div style="text-align:center; font-size:1.5rem; color:#555; font-family:\'Noto Sans JP\'; margin-bottom:15px;">' + esc(d.reading) + '</div>';
    if (d.gtype) h += '<div style="display:inline-block; background:#eee; color:#555; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:12px; text-transform:uppercase; margin-bottom:15px;">' + esc(d.gtype) + '</div>';
    if (d.notes) h += '<div style="margin-top:10px; padding:12px; background:#fff8e1; border-left:4px solid #ffca28; color:#5d4037; font-size:0.9rem; text-align:left; border-radius:4px; line-height:1.4;"><strong>Note:</strong> ' + esc(d.notes) + '</div>';
    var flags = flagCounts[d.word] || 0;
    if (flags > 0) h += '<div style="text-align:center; color:#ff4757; font-weight:700; margin-top:15px; font-size:0.8rem;">🚩 Flagged: ' + flags + ' times</div>';
    if (backEl) backEl.innerHTML = h;
  }

  function renderVerbCard(d, backEl, speakText, speakBtnHtml) {
    setTxt('k-fc-lbl', 'Verb');
    if (curMode === 'flag-review') setTxt('k-fc-lbl', '🚩 Flags: ' + (flagCounts[d.kanji || d.dict] || 0));

    var vText = d.kanji === '-' ? d.dict : d.kanji;
    var mainEl = document.getElementById('k-fc-main');
    if (mainEl) mainEl.innerHTML = esc(vText) + speakBtnHtml;
    attachSpeakBtn('#k-fc-main .jp-speak-btn', speakText);
    setTxt('k-fc-sub', '');

    var h = '<div style="text-align:center; font-weight:700; font-size:2rem; margin-bottom:15px; color:var(--primary);">' + esc(d.meaning) + '</div>';
    h += '<div style="text-align:center; margin-bottom:10px; color:#555;">' + esc(d.reading) + '</div>';
    h += '<table class="k-tbl">' +
      '<tr><th>Masu</th><td>' + esc(d.masu) + '</td></tr>' +
      '<tr><th>Te</th><td>' + esc(d.te) + '</td></tr>' +
      '<tr><th>Nai</th><td>' + esc(d.nai) + '</td></tr>' +
      '<tr><th>Ta</th><td>' + esc(d.ta) + '</td></tr>' +
      '<tr><th>Potential</th><td>' + esc(d.potential) + '</td></tr>' +
      '</table>';
    if (backEl) backEl.innerHTML = h;
  }

  // ---- Navigation ----
  function move(n) {
    var c = document.getElementById('k-fc-card-obj');
    var wasFlipped = c && c.classList.contains('is-flipped');

    if (curMode === 'flash' && n === 1) {
      if (skipNextStreak) {
        skipNextStreak = false;
      } else {
        if (cfg.onCorrect) cfg.onCorrect();
      }
    }

    if (wasFlipped) {
      c.classList.remove('is-flipped');
      setTimeout(function () {
        curIdx = (curIdx + n + curSet.length) % curSet.length;
        renderCard();
      }, 300);
    } else {
      curIdx = (curIdx + n + curSet.length) % curSet.length;
      renderCard();
    }
  }

  function flag(btn) {
    var currentItem = curSet[curIdx];
    var kKey = currentItem.kanji || currentItem.word || currentItem.dict;

    if (curMode === 'flash') {
      skipNextStreak = true;
      if (cfg.onWrong) cfg.onWrong();
    }

    flagCounts[kKey] = (flagCounts[kKey] || 0) + 1;
    activeFlags[kKey] = true;
    if (window.JPShared.progress) window.JPShared.progress.flagTerm(kKey);

    curSet.push(Object.assign({}, currentItem, { isRequeued: true }));

    var originalText = btn.innerText;
    btn.innerText = 'Marked & Re-queued! ↺';
    btn.style.backgroundColor = '#fff3cd';
    setTimeout(function () {
      btn.innerText = originalText;
      btn.style.backgroundColor = '';
      move(1);
    }, 800);
  }

  function clearFlag(btn) {
    var currentItem = curSet[curIdx];
    var kKey = currentItem.kanji || currentItem.word || currentItem.dict;

    delete activeFlags[kKey];
    if (window.JPShared.progress) window.JPShared.progress.clearFlag(kKey);

    btn.innerText = 'Cleared! ✨';

    setTimeout(function () {
      if (curSet.length > 1) {
        curSet.splice(curIdx, 1);
        if (curIdx >= curSet.length) curIdx = 0;
        renderCard();
      } else {
        alert('All active flags cleared! Returning to menu.');
        if (cfg.onExit) cfg.onExit();
      }
    }, 600);
  }

  // ---- Public API ----
  window.JPShared.flashcards = {
    init: function (containerEl, ctx) {
      cfg = ctx;
      container = containerEl;
      curType = ctx.type;
      curMode = ctx.mode;
      curIdx = 0;
      skipNextStreak = false;

      flagCounts = (window.JPShared.progress && window.JPShared.progress.getAllFlags()) || {};
      activeFlags = (window.JPShared.progress && window.JPShared.progress.getAllActiveFlags()) || {};

      curSet = buildSet(curType, curMode, cfg.activeLessons, cfg.DB);
      if (curSet.length === 0) {
        alert(curMode === 'flag-review' ? 'No active flagged items found!' : 'Please select at least one lesson.');
        if (cfg.onExit) cfg.onExit();
        return;
      }
      curSet.sort(function () { return Math.random() - 0.5; });

      renderStage();
      renderCard();
    },
    destroy: function () {
      if (container) container.innerHTML = '';
      cfg = null;
      container = null;
      curSet = [];
    }
  };
})();
