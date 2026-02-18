/**
 * app/shared/term-modal.js
 * Shared term-detail modal: one DOM overlay reused across all feature modules.
 *
 * Replaces duplicated implementations in:
 *   - Lesson.js  — inline modal creation + window.JP_OPEN_TERM definition
 *   - Review.js  — injectModal() method + openTerm() method
 *   - Story.js   — setupTermModal() function + local window.JP_OPEN_TERM definition
 *
 * API:
 *   JPShared.termModal.setTermMap(map)        — register the active module's term map
 *   JPShared.termModal.inject()               — create DOM + CSS + default JP_OPEN_TERM (idempotent)
 *   JPShared.termModal.open(termId, options)  — populate and show the modal
 *
 * Options accepted by open():
 *   enableFlag {boolean}   — whether to trigger flagging (default true)
 *   onFlag     {function}  — custom flag handler: onFlag(termId, msgBox)
 *                            If omitted, the default count-based flag logic runs
 *                            (Lesson.js / Review.js style: flags by root surface,
 *                            increments a count, always shows the message banner).
 *                            Story.js passes its own onFlag because it flags by
 *                            term ID (boolean), only flags once, and auto-hides
 *                            the message after 2 seconds.
 *
 * Load this file before any feature module scripts (after tts.js, text-processor.js).
 */

(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  // The currently-active module's term map. Only one module is loaded at a time.
  var _termMap = {};

  window.JPShared.termModal = {

    /**
     * Register the active module's term map so that open() can look up terms.
     * Call this after the module has loaded its glossary data.
     * @param {Object} map — { [termId]: termObject }
     */
    setTermMap: function (map) {
      _termMap = map || {};
    },

    /**
     * Inject the modal overlay into the DOM (idempotent — safe to call multiple
     * times; only creates the DOM and CSS once).
     *
     * Also sets window.JP_OPEN_TERM to a default implementation that calls
     * termModal.open(). Modules can reassign JP_OPEN_TERM afterwards to pass
     * custom options (e.g. Story.js overrides it to supply its own onFlag).
     */
    inject: function () {
      // --- CSS (idempotent via id check) ---
      if (!document.getElementById('jp-modal-style')) {
        var style = document.createElement('style');
        style.id = 'jp-modal-style';
        style.textContent = [
          '.jp-modal-overlay {',
          '  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;',
          '  background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);',
          '  z-index: 999999; display: none; align-items: center; justify-content: center;',
          '}',
          '.jp-modal {',
          '  background: #fff; width: 85%; max-width: 400px; border-radius: 20px;',
          '  padding: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.25);',
          '  position: relative; text-align: center;',
          '}',
          '.jp-close-btn {',
          '  position: absolute; top: 15px; right: 15px; background: #f1f2f6;',
          '  border: none; width: 30px; height: 30px; border-radius: 50%;',
          '  cursor: pointer; font-weight: bold;',
          '}',
          '.jp-auto-flag-msg {',
          '  margin-top: 15px; background: #d4edda; color: #155724;',
          '  padding: 8px 16px; border-radius: 20px; font-weight: 700;',
          '  font-size: 0.85rem; display: none;',
          '}'
        ].join('\n');
        document.head.appendChild(style);
      }

      // --- DOM (idempotent via class check) ---
      if (document.querySelector('.jp-modal-overlay')) return;

      var overlay = document.createElement('div');
      overlay.className = 'jp-modal-overlay';
      overlay.innerHTML = [
        '<div class="jp-modal">',
        '  <button class="jp-close-btn">✕</button>',
        '  <h2 id="jp-m-title" style="margin:0 0 5px 0; color:#4e54c8; font-size:2rem;"></h2>',
        '  <div id="jp-m-meta" style="color:#747d8c; font-weight:700; margin-bottom:15px;"></div>',
        '  <div id="jp-m-notes" style="line-height:1.5; margin-bottom:15px; font-size:0.95rem; color:#2d3436;"></div>',
        '  <div class="jp-auto-flag-msg">\u2705 Added to Practice Queue</div>',
        '</div>'
      ].join('\n');
      document.body.appendChild(overlay);

      var close = function () { overlay.style.display = 'none'; };
      overlay.onclick = function (e) { if (e.target === overlay) close(); };
      overlay.querySelector('.jp-close-btn').onclick = close;

      // Default JP_OPEN_TERM — modules may reassign after calling inject()
      window.JP_OPEN_TERM = function (id, enableFlag) {
        window.JPShared.termModal.open(id, { enableFlag: enableFlag !== false });
      };
    },

    /**
     * Populate and show the modal for a given term ID.
     *
     * @param {string} termId
     * @param {Object} [options]
     * @param {boolean}  [options.enableFlag=true]
     * @param {function} [options.onFlag]  — onFlag(termId, msgBox)
     *   When provided, the callback is fully responsible for:
     *     - updating localStorage
     *     - showing/hiding msgBox
     *   When omitted, the default count-based logic runs (matching
     *   Lesson.js / Review.js behaviour: increments k-flags count keyed
     *   by the root term's surface form, and always shows the message).
     */
    open: function (termId, options) {
      var opts = options || {};
      var enableFlag = opts.enableFlag !== false;
      var onFlag     = opts.onFlag || null;

      var t = _termMap[termId];
      if (!t) return;

      var textToSpeak = t.reading || t.surface;

      // --- Title row (surface + speaker button) ---
      var titleEl = document.getElementById('jp-m-title');
      if (titleEl) {
        titleEl.innerHTML = [
          '<div style="display:flex; align-items:center; justify-content:center; gap:10px;">',
          '  <span>' + (t.surface || '') + '</span>',
          '  <button id="jp-m-speak-btn" style="background:none; border:none; cursor:pointer; font-size:1.5rem; opacity:0.8;">\uD83D\uDD0A</button>',
          '</div>'
        ].join('');
      }

      // --- Reading • Meaning ---
      var metaEl = document.getElementById('jp-m-meta');
      if (metaEl) {
        var meaning = t.meaning ? ' \u2022 ' + t.meaning.replace(/<[^>]*>/g, '') : '';
        metaEl.innerText = (t.reading || '') + meaning;
      }

      // --- Notes ---
      var notesEl = document.getElementById('jp-m-notes');
      if (notesEl) notesEl.innerText = t.notes || '';

      // --- Speaker button ---
      var speakBtn = document.getElementById('jp-m-speak-btn');
      if (speakBtn) {
        speakBtn.onclick = function (e) {
          e.stopPropagation();
          window.JPShared.tts.speak(textToSpeak);
        };
      }

      // --- Flagging ---
      var msgBox = document.querySelector('.jp-auto-flag-msg');
      if (enableFlag) {
        if (typeof onFlag === 'function') {
          // Custom handler — callback owns msgBox display
          onFlag(termId, msgBox);
        } else {
          // Default: count-based flagging keyed by root term's surface
          var rootTerm = window.JPShared.textProcessor.getRootTerm(termId, _termMap);
          var key = rootTerm ? rootTerm.surface : t.surface;
          var flags  = JSON.parse(localStorage.getItem('k-flags')       || '{}');
          var active = JSON.parse(localStorage.getItem('k-active-flags') || '{}');
          flags[key]  = (flags[key] || 0) + 1;
          active[key] = true;
          localStorage.setItem('k-flags',       JSON.stringify(flags));
          localStorage.setItem('k-active-flags', JSON.stringify(active));
          if (msgBox) msgBox.style.display = 'inline-block';
        }
      } else {
        if (msgBox) msgBox.style.display = 'none';
      }

      // --- Show ---
      var overlay = document.querySelector('.jp-modal-overlay');
      if (overlay) overlay.style.display = 'flex';
    }

  };

})();
