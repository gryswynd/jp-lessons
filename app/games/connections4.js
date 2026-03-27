/**
 * app/games/connections4.js
 * Link Up: Hidden — word-grouping puzzle with festival/lantern theme.
 * Third game module under the Practice.js plugin architecture.
 *
 * Shell contract:
 *   Practice.js owns chrome (streak counter, hanabi, session tracking).
 *   This module owns everything inside its container div.
 *   Shell passes: container, level ('N4'), activeLessons, config,
 *                 onCorrect, onWrong, onExit, onProgress, getStreakInfo.
 *
 * Data format (connections.N4.json):
 *   { puzzles: [{ id, requires, groups: [{ label, words[] }] }] }
 *   N4 puzzles have 4 groups of 4 words each.
 *
 * Game rules:
 *   - 4×4 grid of word tiles; tap to select, submit groups of 4.
 *   - 4 lives (lanterns); lose one per wrong guess.
 *   - "One away" hint when guess overlaps a group by exactly 3.
 *   - Full puzzle solved → onCorrect (shell drives streak + hanabi).
 *   - Out of lives → onWrong (shell resets streak).
 */
(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  // ── Festival palette — lantern colors per group ────────────────────
  var LANTERN_BG   = ['#c0392b', '#d35400', '#1a6e3c', '#5b3a9e'];
  var LANTERN_TEXT = ['#fff',    '#fff',    '#fff',    '#fff'   ];

  // ── CSS (injected once) ───────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('jp-c4-style')) return;
    var s = document.createElement('style');
    s.id = 'jp-c4-style';
    s.textContent =
      '.c4-wrap{font-family:"Poppins","Noto Sans JP",sans-serif;}' +

      // Hint bar
      '.c4-hint{text-align:center;font-size:0.85rem;font-weight:600;color:#a89cc8;' +
        'margin-bottom:10px;min-height:20px;transition:color 0.25s;}' +
      '.c4-hint.c4-one-away{color:#e67e22;}' +
      '.c4-hint.c4-err{color:#c0392b;}' +
      '.c4-hint.c4-ok{color:#27ae60;}' +

      // Solved rows (animate in from above)
      '.c4-solved-zone{display:flex;flex-direction:column;gap:6px;margin-bottom:8px;}' +
      '.c4-solved-row{border-radius:12px;padding:10px 14px;' +
        'animation:c4SlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1);}' +
      '.c4-solved-label{font-weight:800;font-size:0.72rem;text-transform:uppercase;' +
        'letter-spacing:0.07em;opacity:0.82;margin-bottom:2px;}' +
      '.c4-solved-words{font-size:0.93rem;font-weight:600;' +
        'font-family:"Noto Sans JP",sans-serif;}' +

      // Tile grid
      '.c4-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;' +
        'margin-bottom:10px;background:#13102a;border-radius:14px;padding:10px;}' +
      '.c4-tile{background:#1e1442;border:2px solid #3d2f6e;color:#f0e6ff;' +
        'border-radius:10px;font-size:0.9rem;font-weight:700;' +
        'font-family:"Noto Sans JP",sans-serif;padding:0 5px;cursor:pointer;' +
        'transition:border-color 0.15s,background 0.15s,transform 0.12s,box-shadow 0.15s;' +
        'text-align:center;min-height:52px;display:flex;align-items:center;' +
        'justify-content:center;line-height:1.3;user-select:none;-webkit-user-select:none;}' +
      '.c4-tile:hover{background:#2a1d5c;border-color:#7c5cbf;transform:translateY(-2px);}' +
      '.c4-tile.c4-sel{background:#2c1a06;border-color:#e67e22;color:#ffb347;' +
        'box-shadow:0 0 12px rgba(230,126,34,0.5);transform:translateY(-3px);}' +

      // Lives (lanterns)
      '.c4-lives{display:flex;align-items:center;justify-content:center;' +
        'gap:8px;margin:8px 0 10px;}' +
      '.c4-lantern{font-size:1.45rem;transition:filter 0.5s,opacity 0.5s,transform 0.4s;}' +
      '.c4-lantern.c4-dim{filter:grayscale(1) brightness(0.45);opacity:0.35;' +
        'transform:scale(0.82);}' +
      '.c4-lives-lbl{font-size:0.78rem;font-weight:700;color:#a89cc8;margin-left:2px;}' +

      // Action buttons
      '.c4-actions{display:flex;gap:8px;margin-top:6px;}' +
      '.c4-btn{flex:1;padding:12px;border:none;border-radius:12px;font-weight:700;' +
        'font-size:0.93rem;cursor:pointer;transition:opacity 0.15s,transform 0.1s;}' +
      '.c4-btn:active:not(:disabled){transform:scale(0.97);}' +
      '.c4-btn-primary{color:#fff;' +
        'background:linear-gradient(135deg,#e67e22 0%,#c0392b 100%);' +
        'box-shadow:0 4px 12px rgba(230,126,34,0.32);}' +
      '.c4-btn-sec{color:#c77dff;background:rgba(199,125,255,0.1);' +
        'border:1.5px solid rgba(199,125,255,0.28);}' +
      '.c4-btn:disabled{opacity:0.32;cursor:default;box-shadow:none;}' +

      // Stamp overlay (completion / poo)
      '.c4-stamp{text-align:center;margin:10px 0;}' +
      '.c4-stamp img{height:68px;display:block;margin:0 auto 4px;}' +
      '.c4-stamp-lbl{font-size:0.85rem;font-weight:700;}' +

      // Summary
      '.c4-summary{text-align:center;padding:24px 8px;}' +
      '.c4-summary-icon{font-size:2.4rem;margin-bottom:8px;}' +
      '.c4-summary-title{font-size:1.3rem;font-weight:900;color:#e67e22;margin-bottom:6px;}' +
      '.c4-summary-score{font-size:2.6rem;font-weight:900;color:#f0e6ff;line-height:1.1;}' +
      '.c4-summary-pct{color:#a89cc8;font-weight:600;margin:4px 0 16px;}' +
      '.c4-summary-stats{display:flex;justify-content:center;gap:32px;margin-bottom:20px;}' +
      '.c4-stat-val{font-size:1.35rem;font-weight:900;}' +
      '.c4-stat-lbl{font-size:0.7rem;color:#a89cc8;font-weight:600;' +
        'text-transform:uppercase;letter-spacing:0.05em;}' +
      '.c4-btn-col{display:flex;flex-direction:column;gap:8px;}' +

      // Empty / error
      '.c4-empty{text-align:center;padding:40px 16px;}' +
      '.c4-empty-icon{font-size:2.4rem;margin-bottom:12px;}' +
      '.c4-empty-msg{font-size:0.92rem;color:#a89cc8;line-height:1.6;margin-bottom:20px;}' +

      // Keyframes
      '@keyframes c4SlideIn{' +
        '0%{opacity:0;transform:translateY(-10px) scale(0.96)}' +
        '100%{opacity:1;transform:translateY(0) scale(1)}}' +
      '@keyframes c4Shake{' +
        '0%,100%{transform:translateX(0)}' +
        '15%,45%,75%{transform:translateX(-5px)}' +
        '30%,60%,90%{transform:translateX(5px)}}' +
      '.c4-grid.c4-shaking{animation:c4Shake 0.45s ease;}';

    document.head.appendChild(s);
  }

  // ── Helpers ───────────────────────────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  // ── Module-level state ────────────────────────────────────────────
  var cfg        = {};
  var container  = null;
  var puzzles    = [];
  var puzzleIdx  = 0;
  var sessionScore = 0;
  var sessionTotal = 0;
  var dataCache  = null;      // preserved across init/destroy cycles
  var advanceTimer = null;

  // Per-puzzle state (reset in renderPuzzle)
  var puzzle     = null;
  var remaining  = [];        // shuffled flat word list
  var solved     = [];        // group indices solved, in discovery order
  var selected   = [];        // currently highlighted words (max 4)
  var lives      = 4;
  var locked     = false;     // blocks interaction during transitions

  // ── Data loading ──────────────────────────────────────────────────
  function loadData(level, cb) {
    if (dataCache) { cb(null, dataCache); return; }
    var path = 'data/' + level + '/connections/connections.' + level + '.json';
    var url  = window.getAssetUrl(cfg.config, path) + '?t=' + Date.now();
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) { dataCache = data; cb(null, data); })
      .catch(function (e)   { cb(e); });
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init(containerEl, ctx) {
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }

    injectStyles();
    cfg          = ctx;
    container    = containerEl;
    container.innerHTML = '';
    puzzles      = [];
    puzzleIdx    = 0;
    sessionScore = 0;
    sessionTotal = 0;
    locked       = false;

    var level = cfg.level || 'N4';
    container.innerHTML =
      '<div class="c4-wrap" style="text-align:center;padding:32px;' +
      'color:#a89cc8;font-size:0.9rem;">Loading…</div>';

    loadData(level, function (err, data) {
      if (err) {
        container.innerHTML =
          '<div class="c4-wrap"><div class="c4-empty">' +
          '<div class="c4-empty-icon">⚠️</div>' +
          '<div class="c4-empty-msg">Could not load puzzles.<br>' +
          'Please check your connection.</div>' +
          '<button class="c4-btn c4-btn-sec" id="c4-err-exit">Exit</button>' +
          '</div></div>';
        document.getElementById('c4-err-exit').onclick = function () {
          if (cfg.onExit) cfg.onExit();
        };
        return;
      }

      var available = (data.puzzles || []).filter(function (p) {
        if (!p.requires || !cfg.activeLessons) return true;
        return p.requires.every(function (req) {
          return cfg.activeLessons.has(req);
        });
      });

      if (available.length === 0) {
        container.innerHTML =
          '<div class="c4-wrap"><div class="c4-empty">' +
          '<div class="c4-empty-icon">🏮</div>' +
          '<div class="c4-empty-msg">No puzzles unlocked yet!<br>' +
          'Complete more N4 lessons to light up these lanterns.</div>' +
          '<button class="c4-btn c4-btn-sec" id="c4-nopuz-exit">Back to Menu</button>' +
          '</div></div>';
        document.getElementById('c4-nopuz-exit').onclick = function () {
          if (cfg.onExit) cfg.onExit();
        };
        return;
      }

      puzzles = shuffle(available.slice());
      renderPuzzle();
    });
  }

  // ── Puzzle setup ──────────────────────────────────────────────────
  function renderPuzzle() {
    if (puzzleIdx >= puzzles.length) { renderSummary(); return; }

    puzzle   = puzzles[puzzleIdx];
    solved   = [];
    selected = [];
    lives    = 4;
    locked   = false;

    // Flatten all words from 4 groups and shuffle
    var allWords = [];
    puzzle.groups.forEach(function (g) {
      g.words.forEach(function (w) { allWords.push(w); });
    });
    remaining = shuffle(allWords);

    sessionTotal += 16;  // 4 groups × 4 words
    if (cfg.onProgress) cfg.onProgress(puzzleIdx + 1, puzzles.length);

    render();
  }

  // ── Pure DOM render ───────────────────────────────────────────────
  function render() {
    var isPuzzleComplete = solved.length === puzzle.groups.length;

    // Solved group banners (in discovery order)
    var solvedHtml = solved.map(function (si) {
      var g   = puzzle.groups[si];
      var bg  = LANTERN_BG[si];
      var txt = LANTERN_TEXT[si];
      return '<div class="c4-solved-row" style="background:' + bg + ';color:' + txt + ';">' +
        '<div class="c4-solved-label">' + esc(g.label) + '</div>' +
        '<div class="c4-solved-words">' + g.words.map(esc).join('　·　') + '</div>' +
        '</div>';
    }).join('');

    // Remaining tiles (words not yet solved)
    var unsolvedWords = remaining.filter(function (w) {
      return !solved.some(function (si) {
        return puzzle.groups[si].words.indexOf(w) !== -1;
      });
    });

    var gridHtml = '';
    if (!isPuzzleComplete) {
      gridHtml = unsolvedWords.map(function (w) {
        var sel = selected.indexOf(w) !== -1;
        return '<div class="c4-tile' + (sel ? ' c4-sel' : '') +
          '" data-word="' + esc(w) + '">' + esc(w) + '</div>';
      }).join('');
    }

    // Lantern lives
    var livesHtml = '';
    for (var i = 0; i < 4; i++) {
      livesHtml += '<span class="c4-lantern' + (i >= lives ? ' c4-dim' : '') + '">🏮</span>';
    }

    // Completion stamp
    var stampHtml = '';
    if (isPuzzleComplete) {
      var stampApi = window.JPShared && window.JPShared.stampSettings;
      var stampUrl = stampApi && stampApi.getStampUrl ? stampApi.getStampUrl() : '';
      if (stampUrl) {
        stampHtml =
          '<div class="c4-stamp">' +
          '<img src="' + esc(stampUrl) + '" alt="">' +
          '<span class="c4-stamp-lbl" style="color:#27ae60;">Complete!</span>' +
          '</div>';
      }
    }

    var disableDesel  = locked || selected.length === 0;
    var disableSubmit = locked || selected.length !== 4 || isPuzzleComplete;

    var html =
      '<div class="c4-wrap">' +
      '<div class="c4-hint" id="c4-hint">' +
        (isPuzzleComplete ? '🎇 Puzzle solved!' : 'Find 4 words that belong together') +
      '</div>' +
      '<div class="c4-solved-zone">' + solvedHtml + '</div>' +
      (isPuzzleComplete
        ? stampHtml
        : '<div class="c4-grid" id="c4-grid">' + gridHtml + '</div>' +
          '<div class="c4-lives">' + livesHtml +
            '<span class="c4-lives-lbl">' + lives + ' left</span>' +
          '</div>' +
          '<div class="c4-actions">' +
            '<button class="c4-btn c4-btn-sec" id="c4-desel"' +
              (disableDesel ? ' disabled' : '') + '>Clear</button>' +
            '<button class="c4-btn c4-btn-primary" id="c4-submit"' +
              (disableSubmit ? ' disabled' : '') + '>Submit</button>' +
          '</div>'
      ) +
      '</div>';

    container.innerHTML = html;
    wireInteraction();
  }

  function wireInteraction() {
    container.querySelectorAll('.c4-tile').forEach(function (tile) {
      tile.addEventListener('click', function () {
        if (locked) return;
        var w = tile.dataset.word;
        var idx = selected.indexOf(w);
        if (idx !== -1) {
          selected.splice(idx, 1);
        } else if (selected.length < 4) {
          selected.push(w);
        }
        render();
      });
    });

    var deselBtn = document.getElementById('c4-desel');
    if (deselBtn) {
      deselBtn.addEventListener('click', function () {
        if (locked) return;
        selected = [];
        render();
      });
    }

    var subBtn = document.getElementById('c4-submit');
    if (subBtn) {
      subBtn.addEventListener('click', function () { trySubmit(); });
    }
  }

  // ── Submit / guess logic ──────────────────────────────────────────
  function trySubmit() {
    if (locked || selected.length !== 4) return;
    locked = true;

    var guess = selected.slice();

    // Check for exact match against an unsolved group
    var correctIdx = -1;
    puzzle.groups.forEach(function (g, gi) {
      if (solved.indexOf(gi) !== -1) return;
      var allIn = g.words.every(function (w) { return guess.indexOf(w) !== -1; });
      if (allIn) correctIdx = gi;
    });

    if (correctIdx !== -1) {
      // ── Correct group ──
      solved.push(correctIdx);
      sessionScore += 4;
      selected = [];
      locked = false;

      if (solved.length === puzzle.groups.length) {
        // Full puzzle complete
        render();  // show all solved + stamp
        if (cfg.onCorrect) cfg.onCorrect();
        advanceTimer = setTimeout(function () {
          advanceTimer = null;
          puzzleIdx++;
          renderPuzzle();
        }, 2200);
      } else {
        render();
        setHint('✓ That group is correct!', 'c4-ok');
      }
      return;
    }

    // Check for "one away" (3 of 4 overlap with an unsolved group)
    var oneAway = false;
    puzzle.groups.forEach(function (g, gi) {
      if (solved.indexOf(gi) !== -1) return;
      var overlap = guess.filter(function (w) {
        return g.words.indexOf(w) !== -1;
      }).length;
      if (overlap === 3) oneAway = true;
    });

    // Wrong guess: lose a life
    lives--;
    selected = [];

    if (lives <= 0) {
      // Keep locked to prevent interaction during delay
      render();
      shakeGrid();
      setHint(oneAway ? 'So close — one away! No lanterns left.' : 'No lanterns left!', 'c4-err');
      setTimeout(function () { gameOver(); }, 1300);
    } else {
      locked = false;
      render();
      shakeGrid();
      setHint(oneAway ? 'So close — one away!' : 'Not quite — try another group', oneAway ? 'c4-one-away' : 'c4-err');
    }
  }

  function setHint(msg, cls) {
    var el = document.getElementById('c4-hint');
    if (!el) return;
    el.className = 'c4-hint' + (cls ? ' ' + cls : '');
    el.textContent = msg;
  }

  function shakeGrid() {
    var grid = document.getElementById('c4-grid');
    if (!grid) return;
    grid.classList.add('c4-shaking');
    setTimeout(function () {
      if (grid.parentNode) grid.classList.remove('c4-shaking');
    }, 500);
  }

  // ── Game over ─────────────────────────────────────────────────────
  function gameOver() {
    if (window.JPShared && window.JPShared.streak) {
      window.JPShared.streak.recordActivity();
    }
    if (cfg.onWrong) cfg.onWrong();

    // Reveal all unsolved groups in original order
    puzzle.groups.forEach(function (_, gi) {
      if (solved.indexOf(gi) === -1) solved.push(gi);
    });

    var solvedHtml = solved.map(function (si) {
      var g   = puzzle.groups[si];
      var bg  = LANTERN_BG[si];
      var txt = LANTERN_TEXT[si];
      return '<div class="c4-solved-row" style="background:' + bg + ';color:' + txt + ';">' +
        '<div class="c4-solved-label">' + esc(g.label) + '</div>' +
        '<div class="c4-solved-words">' + g.words.map(esc).join('　·　') + '</div>' +
        '</div>';
    }).join('');

    var pooHtml = '';
    var stampApi = window.JPShared && window.JPShared.stampSettings;
    if (stampApi && stampApi.getPooUrl) {
      var pooUrl = stampApi.getPooUrl();
      if (pooUrl) {
        pooHtml =
          '<div class="c4-stamp">' +
          '<img src="' + esc(pooUrl) + '" alt="">' +
          '<span class="c4-stamp-lbl" style="color:#c0392b;">All lanterns out!</span>' +
          '</div>';
      }
    }

    container.innerHTML =
      '<div class="c4-wrap">' +
      '<div class="c4-hint c4-err">No more lanterns — here\'s the answer</div>' +
      '<div class="c4-solved-zone">' + solvedHtml + '</div>' +
      pooHtml +
      '<div class="c4-actions" style="margin-top:12px;">' +
        '<button class="c4-btn c4-btn-sec" id="c4-go-next">Next Puzzle →</button>' +
      '</div>' +
      '</div>';

    document.getElementById('c4-go-next').addEventListener('click', function () {
      puzzleIdx++;
      renderPuzzle();
    });
  }

  // ── Summary ───────────────────────────────────────────────────────
  function renderSummary() {
    if (window.JPShared && window.JPShared.streak) {
      window.JPShared.streak.recordActivity();
    }

    var pct = sessionTotal > 0
      ? Math.round(sessionScore / sessionTotal * 100) : 0;
    var streakInfo = cfg.getStreakInfo
      ? cfg.getStreakInfo() : { streak: 0, best: 0 };

    container.innerHTML =
      '<div class="c4-wrap"><div class="c4-summary">' +
      '<div class="c4-summary-icon">🎇</div>' +
      '<div class="c4-summary-title">Link Up: Hidden Complete!</div>' +
      '<div class="c4-summary-score">' + sessionScore + ' / ' + sessionTotal + '</div>' +
      '<div class="c4-summary-pct">' + pct + '% correct</div>' +
      '<div class="c4-summary-stats">' +
        '<div>' +
          '<div class="c4-stat-val" style="color:#e67e22;">🔥 ' +
            esc(String(streakInfo.streak)) + '</div>' +
          '<div class="c4-stat-lbl">Final Streak</div>' +
        '</div>' +
        '<div>' +
          '<div class="c4-stat-val" style="color:#c77dff;">🏆 ' +
            esc(String(streakInfo.best)) + '</div>' +
          '<div class="c4-stat-lbl">Best Streak</div>' +
        '</div>' +
      '</div>' +
      '<div class="c4-btn-col">' +
        '<button class="c4-btn c4-btn-primary" id="c4-again">Play Again</button>' +
        '<button class="c4-btn c4-btn-sec" id="c4-exit">Back to Menu</button>' +
      '</div>' +
      '</div></div>';

    document.getElementById('c4-again').addEventListener('click', function () {
      puzzles      = shuffle(puzzles.slice());
      puzzleIdx    = 0;
      sessionScore = 0;
      sessionTotal = 0;
      renderPuzzle();
    });
    document.getElementById('c4-exit').addEventListener('click', function () {
      if (cfg.onExit) cfg.onExit();
    });
  }

  // ── Public API ────────────────────────────────────────────────────
  window.JPShared.connections4Game = {
    /**
     * Start (or restart) the game.
     * @param {HTMLElement} containerEl  Shell-owned stage div to write into.
     * @param {Object}      ctx
     *   ctx.level          - 'N4' (default)
     *   ctx.activeLessons  - Set<string> of completed lesson IDs
     *   ctx.config         - REPO_CONFIG passed to window.getAssetUrl()
     *   ctx.onCorrect()    - called when a full puzzle is solved without dying
     *   ctx.onWrong()      - called on game over (all 4 lives lost)
     *   ctx.onExit()       - called when the player exits to menu
     *   ctx.onProgress(current, total)
     *   ctx.getStreakInfo() - returns { streak, best }
     */
    init: function (containerEl, ctx) {
      init(containerEl, ctx);
    },

    /**
     * Skip the current puzzle; counts as a wrong answer (streak resets).
     * Safe to call while the advance-delay timer is running.
     */
    skip: function () {
      if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
      if (cfg.onWrong) cfg.onWrong();
      if (puzzleIdx < puzzles.length) puzzleIdx++;
      renderPuzzle();
    },

    /** Tear down — clean up DOM and any dangling timers. */
    destroy: function () {
      if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
      if (container)    { container.innerHTML = ''; }
      container = null;
      cfg       = {};
      puzzles   = [];
      puzzle    = null;
      locked    = false;
      // dataCache intentionally preserved for re-use across init/destroy cycles
    }
  };

})();
