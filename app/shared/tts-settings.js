/**
 * app/shared/tts-settings.js
 * TTS voice settings modal — lets users pick a Japanese voice, adjust speed,
 * and preview the result.
 *
 * Depends on: tts.js (window.JPShared.tts)
 * Load this file after tts.js and before feature modules.
 */

(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  var overlay = null;
  var isOpen = false;

  // --- Inject styles once ---
  var styleInjected = false;
  function injectStyles() {
    if (styleInjected) return;
    styleInjected = true;
    var css = `
      /* TTS Settings overlay */
      .jp-tts-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        animation: jpTtsFadeIn 0.2s ease;
      }
      @keyframes jpTtsFadeIn {
        from { opacity: 0; } to { opacity: 1; }
      }
      .jp-tts-modal {
        background: white;
        border-radius: 16px;
        width: 90%; max-width: 420px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        overflow: hidden;
        font-family: "Poppins", system-ui, sans-serif;
      }
      .jp-tts-header {
        background: linear-gradient(135deg, #4e54c8, #8f94fb);
        color: white;
        padding: 18px 20px;
        display: flex; align-items: center; justify-content: space-between;
      }
      .jp-tts-header h3 {
        margin: 0; font-size: 1.05rem; font-weight: 800;
      }
      .jp-tts-close {
        background: rgba(255,255,255,0.2);
        border: none; color: white;
        width: 32px; height: 32px;
        border-radius: 50%;
        font-size: 1.1rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s;
      }
      .jp-tts-close:hover { background: rgba(255,255,255,0.35); }

      .jp-tts-body { padding: 20px; }

      .jp-tts-field { margin-bottom: 20px; }
      .jp-tts-field label {
        display: block;
        font-weight: 700; font-size: 0.85rem;
        color: #555; margin-bottom: 8px;
        text-transform: uppercase; letter-spacing: 0.5px;
      }
      .jp-tts-field select {
        width: 100%; padding: 10px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 0.95rem;
        background: #fafafa;
        color: #333;
        appearance: auto;
        cursor: pointer;
        transition: border-color 0.2s;
      }
      .jp-tts-field select:focus {
        outline: none;
        border-color: #4e54c8;
      }

      /* Speed slider */
      .jp-tts-speed-row {
        display: flex; align-items: center; gap: 12px;
      }
      .jp-tts-speed-row input[type="range"] {
        flex: 1;
        accent-color: #4e54c8;
        height: 6px;
      }
      .jp-tts-speed-val {
        font-weight: 800; font-size: 0.95rem;
        color: #4e54c8;
        min-width: 42px; text-align: center;
      }
      .jp-tts-speed-labels {
        display: flex; justify-content: space-between;
        font-size: 0.72rem; color: #999; margin-top: 4px;
      }

      /* Test button */
      .jp-tts-test-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #4e54c8, #8f94fb);
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 700; font-size: 0.95rem;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .jp-tts-test-btn:hover { opacity: 0.9; }
      .jp-tts-test-btn:active { transform: scale(0.98); }

      /* No voices message */
      .jp-tts-no-voices {
        background: #fff3e0;
        border: 1px solid #ffe0b2;
        border-radius: 10px;
        padding: 12px 16px;
        font-size: 0.85rem;
        color: #e65100;
        line-height: 1.5;
      }

      /* Gear button styles (shared across modules) */
      .jp-settings-gear {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.4);
        color: white;
        width: 34px; height: 34px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1rem;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s;
        padding: 0;
        flex-shrink: 0;
      }
      .jp-settings-gear:hover { background: rgba(255,255,255,0.35); }

      /* Sentence-level speaker button (inline with jp text) */
      .jp-speak-sentence {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.85rem;
        opacity: 0.45;
        padding: 2px 4px;
        margin-left: 4px;
        transition: opacity 0.2s;
        vertical-align: middle;
        flex-shrink: 0;
      }
      .jp-speak-sentence:hover { opacity: 0.85; }
      .jp-speak-sentence:active { transform: scale(0.9); }

      /* Play-all button for reading passages and conversations */
      .jp-speak-all-btn {
        background: rgba(78,84,200,0.08);
        border: 1px solid rgba(78,84,200,0.2);
        color: #4e54c8;
        padding: 6px 14px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 600;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        margin-bottom: 10px;
      }
      .jp-speak-all-btn:hover {
        background: rgba(78,84,200,0.15);
        border-color: rgba(78,84,200,0.4);
      }
      .jp-speak-all-btn:active { transform: scale(0.97); }
      .jp-speak-all-btn.jp-speak-all-active {
        background: rgba(220,53,69,0.1);
        border-color: rgba(220,53,69,0.3);
        color: #dc3545;
      }
      .jp-speak-all-btn.jp-speak-all-active:hover {
        background: rgba(220,53,69,0.18);
        border-color: rgba(220,53,69,0.5);
      }

      /* Menu gear — dark version for white background */
      .jp-settings-gear-menu {
        background: rgba(0,0,0,0.06);
        border: 1px solid rgba(0,0,0,0.1);
        color: #666;
        width: 38px; height: 38px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.3rem;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s;
        padding: 0;
        position: absolute;
        top: 15px; right: 15px;
      }
      .jp-settings-gear-menu:hover { background: rgba(0,0,0,0.12); color: #4e54c8; }
    `;
    var el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
  }

  function buildModal() {
    var tts = window.JPShared.tts;
    var voices = tts.getVoices();
    var current = tts.getSelectedVoice();
    var currentURI = current ? current.voiceURI : '';
    var rate = tts.getRate();

    // Build voice options
    var voiceOptions = '';
    if (voices.length === 0) {
      voiceOptions = '<option value="">No Japanese voices found</option>';
    } else {
      voices.forEach(function (v) {
        var label = v.name;
        // Clean up verbose voice names
        if (v.localService) label += ' (local)';
        else label += ' (online)';
        var sel = (v.voiceURI === currentURI) ? ' selected' : '';
        voiceOptions += '<option value="' + v.voiceURI.replace(/"/g, '&quot;') + '"' + sel + '>' +
                        label.replace(/</g, '&lt;') + '</option>';
      });
    }

    var noVoicesMsg = voices.length === 0
      ? '<div class="jp-tts-no-voices">No Japanese voices detected on this device. ' +
        'On Mac, go to System Settings → Accessibility → Spoken Content → Manage Voices and download a Japanese voice. ' +
        'On iOS/Android, Japanese voices are usually pre-installed.</div>'
      : '';

    var html = '' +
      '<div class="jp-tts-modal">' +
        '<div class="jp-tts-header">' +
          '<h3>\u{1F50A} Voice Settings</h3>' +
          '<button class="jp-tts-close" id="jp-tts-close">\u2715</button>' +
        '</div>' +
        '<div class="jp-tts-body">' +
          '<div class="jp-tts-field">' +
            '<label>Japanese Voice</label>' +
            '<select id="jp-tts-voice-select">' + voiceOptions + '</select>' +
            noVoicesMsg +
          '</div>' +
          '<div class="jp-tts-field">' +
            '<label>Speed</label>' +
            '<div class="jp-tts-speed-row">' +
              '<input type="range" id="jp-tts-speed" min="0.5" max="1.5" step="0.05" value="' + rate + '">' +
              '<span class="jp-tts-speed-val" id="jp-tts-speed-val">' + rate.toFixed(2) + 'x</span>' +
            '</div>' +
            '<div class="jp-tts-speed-labels"><span>Slow</span><span>Normal</span><span>Fast</span></div>' +
          '</div>' +
          '<div class="jp-tts-field">' +
            '<button class="jp-tts-test-btn" id="jp-tts-test">' +
              '\u{1F50A} Test Voice — \u300C\u3053\u3093\u306B\u3061\u306F\u3001\u5143\u6C17\u3067\u3059\u304B\u3002\u300D' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    return html;
  }

  function open() {
    if (isOpen) return;
    injectStyles();
    isOpen = true;

    overlay = document.createElement('div');
    overlay.className = 'jp-tts-overlay';
    overlay.innerHTML = buildModal();
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    // Close button
    document.getElementById('jp-tts-close').addEventListener('click', close);

    // Voice selection
    var voiceSelect = document.getElementById('jp-tts-voice-select');
    voiceSelect.addEventListener('change', function () {
      window.JPShared.tts.setVoice(this.value);
    });

    // Speed slider
    var speedSlider = document.getElementById('jp-tts-speed');
    var speedVal = document.getElementById('jp-tts-speed-val');
    speedSlider.addEventListener('input', function () {
      var r = parseFloat(this.value);
      speedVal.textContent = r.toFixed(2) + 'x';
      window.JPShared.tts.setRate(r);
    });

    // Test button
    document.getElementById('jp-tts-test').addEventListener('click', function () {
      window.JPShared.tts.speak('\u3053\u3093\u306B\u3061\u306F\u3001\u5143\u6C17\u3067\u3059\u304B\u3002\u4ECA\u65E5\u306F\u3044\u3044\u5929\u6C17\u3067\u3059\u306D\u3002');
    });

    // Refresh voices if Chrome loads them late
    if (window.speechSynthesis) {
      var refresh = function () {
        var voices = window.JPShared.tts.getVoices();
        if (voices.length > 0 && voiceSelect.options.length <= 1 && voiceSelect.options[0].value === '') {
          // Voices loaded after modal opened — rebuild options
          var current = window.JPShared.tts.getSelectedVoice();
          var currentURI = current ? current.voiceURI : '';
          voiceSelect.innerHTML = '';
          voices.forEach(function (v) {
            var opt = document.createElement('option');
            opt.value = v.voiceURI;
            opt.textContent = v.name + (v.localService ? ' (local)' : ' (online)');
            if (v.voiceURI === currentURI) opt.selected = true;
            voiceSelect.appendChild(opt);
          });
          // Remove no-voices warning if present
          var warn = overlay.querySelector('.jp-tts-no-voices');
          if (warn) warn.remove();
        }
      };
      window.speechSynthesis.onvoiceschanged = refresh;
      // Also check once after a short delay
      setTimeout(refresh, 500);
    }
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    window.JPShared.tts.cancel();
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    overlay = null;
  }

  // Inject styles immediately so gear buttons render correctly
  injectStyles();

  // --- Public API ---
  window.JPShared.ttsSettings = {
    open: open,
    close: close,
    isOpen: function () { return isOpen; }
  };

})();
