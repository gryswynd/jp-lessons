window.GrammarModule = {
  start: function (container, sharedConfig, exitCallback) {

    // --- CONFIGURATION ---
    const REPO_CONFIG = sharedConfig;

    // --- Grammar Colors ---
    const GRAMMAR_COLORS = {
      topic:       '#6C5CE7',
      subject:     '#0984E3',
      object:      '#00B894',
      verb:        '#D63031',
      particle:    '#FDCB6E',
      destination: '#E17055',
      location:    '#00CEC9',
      modifier:    '#A29BFE',
      time:        '#FAB1A0',
      connector:   '#FD79A8',
      predicate:   '#D63031',
    };

    // --- State ---
    let currentStep = 0;
    let totalSteps = 0;
    let grammarData = null;
    let termMapData = {};
    let showEN = false;
    let drillCorrect = 0;
    let drillTotal = 0;
    const drillAnswered = new Set();
    let CONJUGATION_RULES = null;
    let COUNTER_RULES = null;
    let currentGrammars = [];
    let grammarId = null;

    // --- Setup UI Container ---
    container.innerHTML = '';
    const root = document.createElement('div');
    root.id = 'jp-grammar-app-root';
    container.appendChild(root);

    // --- Fonts ---
    if (!document.getElementById('jp-fonts')) {
      const link = document.createElement('link');
      link.id = 'jp-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Poppins:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }

    // --- Styles ---
    if (!document.getElementById('jp-grammar-style')) {
      const style = document.createElement('style');
      style.id = 'jp-grammar-style';
      style.textContent = `
        #jp-grammar-app-root {
          --gr-primary: #F97316;
          --gr-primary-dark: #DC2626;
          --gr-bg: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
          --text-main: #2f3542; --text-sub: #747d8c;
          font-family: 'Poppins', 'Noto Sans JP', sans-serif;
          background: var(--gr-bg); color: var(--text-main);
          display: flex; flex-direction: column;
          width: 100%; max-width: 600px; margin: 0 auto;
          height: 800px; border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.05); overflow: hidden; position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        #jp-grammar-app-root * { box-sizing: border-box; }

        .gr-header {
          background: linear-gradient(135deg, #F97316, #DC2626);
          padding: 1.2rem; color: white; border-bottom: none;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 4px 15px rgba(249,115,22,0.35); z-index: 10;
        }
        .gr-title { font-weight: 900; font-size: 1.1rem; color: white; }
        .gr-progress-container { height: 6px; width: 100%; background: rgba(0,0,0,0.1); }
        .gr-progress-bar { height: 100%; background: #2ed573; width: 0%; transition: width 0.3s ease; }
        .gr-body { padding: 1.5rem; flex: 1; overflow-y: auto; background: transparent; display: flex; flex-direction: column; }
        .gr-footer {
          padding: 15px 20px; background: white; border-top: 1px solid rgba(0,0,0,0.05);
          display: flex; gap: 10px; justify-content: space-between;
          box-shadow: 0 -5px 15px rgba(0,0,0,0.03); z-index: 10;
        }
        .gr-nav-btn {
          padding: 12px 24px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer;
          font-size: 0.95rem; transition: transform 0.1s;
        }
        .gr-nav-btn:active { transform: scale(0.96); }
        .gr-nav-btn.prev { background: #f1f2f6; color: #747d8c; }
        .gr-nav-btn.next { background: linear-gradient(135deg, #F97316, #DC2626); color: #fff; box-shadow: 0 4px 10px rgba(249,115,22,0.3); }
        .gr-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .gr-exit-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.8rem; }
        .gr-back-btn { background: transparent; color: rgba(255,255,255,0.8); border: none; cursor: pointer; font-weight: bold; font-size: 0.9rem; margin-right: 10px; }
        .gr-back-btn:hover { color: white; }

        .gr-card { background: #FFF8F5; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 20px; border: 1px solid rgba(249,115,22,0.08); }
        .gr-card-white { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 20px; border: 1px solid rgba(0,0,0,0.02); }

        /* Menu */
        .gr-menu-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .gr-menu-item {
          background: #fff; padding: 18px 20px; border-radius: 16px; cursor: pointer;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid rgba(0,0,0,0.02); text-align: left;
          display: flex; justify-content: space-between; align-items: center;
        }
        .gr-menu-item:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(249,115,22,0.15); border-color: var(--gr-primary); }
        .gr-menu-item.locked { opacity: 0.55; cursor: default; }
        .gr-menu-item.locked:hover { transform: none; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-color: transparent; }
        .gr-menu-icon { font-size: 1.5rem; margin-right: 12px; }
        .gr-menu-id { font-weight: 900; color: #F97316; font-size: 1rem; }
        .gr-menu-name { font-size: 0.8rem; color: #a4b0be; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .gr-menu-badge { font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
        .gr-menu-badge.done { background: #d4edda; color: #155724; }
        .gr-menu-badge.lock { background: #f1f2f6; color: #999; }

        /* Intro section */
        .gr-intro-card { text-align: center; padding: 30px 20px; display: flex; flex-direction: column; align-items: center; }
        .gr-intro-icon { font-size: 3.5rem; margin-bottom: 10px; }
        .gr-intro-title { font-size: 1.4rem; font-weight: 900; color: #2f3542; margin-bottom: 12px; }
        .gr-intro-summary { font-size: 1rem; color: #555; margin-bottom: 16px; line-height: 1.6; }
        .gr-why-box { background: #FFF3E0; border-left: 4px solid #F97316; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; text-align: left; width: 100%; font-size: 0.9rem; color: #555; }
        .gr-learn-list { text-align: left; width: 100%; }
        .gr-learn-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 0.9rem; color: #444; }
        .gr-learn-check { color: #F97316; font-size: 0.9rem; flex-shrink: 0; margin-top: 1px; }

        /* Pattern formula */
        .gr-formula { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .gr-chip {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 8px 14px; border-radius: 10px; min-width: 60px;
          color: white; font-weight: 700;
        }
        .gr-chip-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85; margin-bottom: 2px; }
        .gr-chip-text { font-size: 1.1rem; font-family: 'Noto Sans JP', sans-serif; }
        .gr-arrow { color: #aaa; font-size: 1.1rem; align-self: center; }

        /* Grammar rule */
        .gr-rule-meaning { font-size: 1.15rem; font-weight: 700; color: #2f3542; margin-bottom: 10px; }
        .gr-rule-explanation { font-size: 0.9rem; color: #555; line-height: 1.7; margin-bottom: 14px; }
        .gr-notes-toggle { font-size: 0.8rem; color: #888; cursor: pointer; margin-bottom: 8px; border: none; background: none; text-decoration: underline; padding: 0; }
        .gr-notes-list { list-style: none; padding: 0; margin: 0 0 12px; }
        .gr-notes-list li { font-size: 0.82rem; color: #666; padding: 4px 0 4px 16px; position: relative; }
        .gr-notes-list li::before { content: "•"; position: absolute; left: 0; color: #F97316; }

        /* Examples */
        .gr-example-card { background: white; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; border: 1px solid rgba(0,0,0,0.06); }
        .gr-example-sentence { font-size: 1.1rem; font-family: 'Noto Sans JP', sans-serif; line-height: 1.8; margin-bottom: 6px; display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px; }
        .gr-example-en { font-size: 0.85rem; color: #747d8c; margin-bottom: 6px; }
        .gr-breakdown-toggle { font-size: 0.75rem; color: #aaa; cursor: pointer; border: none; background: none; padding: 0; text-decoration: underline; }
        .gr-breakdown-text { font-size: 0.8rem; color: #888; margin-top: 4px; font-style: italic; }
        .gr-tts-btn { font-size: 0.8rem; background: none; border: 1px solid #ddd; border-radius: 6px; padding: 3px 8px; cursor: pointer; color: #888; margin-top: 4px; }
        .gr-tts-btn:hover { background: #f8f9fa; }

        /* Part spans */
        .gr-part { border-radius: 3px; padding: 1px 3px; cursor: default; position: relative; font-family: 'Noto Sans JP', sans-serif; }
        .gr-part[data-gloss]:hover::after {
          content: attr(data-gloss);
          position: absolute; bottom: calc(100% + 4px); left: 50%; transform: translateX(-50%);
          background: #333; color: white; font-size: 0.72rem; padding: 3px 7px; border-radius: 5px;
          white-space: nowrap; pointer-events: none; font-family: 'Poppins', sans-serif; z-index: 100;
        }

        /* Table */
        .gr-table-wrap { overflow-x: auto; margin-bottom: 12px; }
        .gr-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .gr-table th { background: #FFF3E0; color: #F97316; font-weight: 700; padding: 10px 12px; text-align: left; border-bottom: 2px solid #F97316; white-space: nowrap; }
        .gr-table td { padding: 9px 12px; border-bottom: 1px solid #f1f2f6; vertical-align: top; font-family: 'Noto Sans JP', sans-serif; }
        .gr-table tr:last-child td { border-bottom: none; }
        .gr-table tr:hover td { background: #FFF8F5; }
        .gr-table-label { font-family: 'Poppins', sans-serif; font-weight: 600; color: #555; white-space: nowrap; }
        .gr-table-meaning { font-family: 'Poppins', sans-serif; color: #888; font-style: italic; }
        .gr-cell-stem { background: rgba(0,184,148,0.2); border-radius: 2px; }
        .gr-cell-ending { background: rgba(214,48,49,0.2); border-radius: 2px; }
        .gr-notes-box { background: #f8f9fa; border-radius: 8px; padding: 12px 14px; margin-top: 10px; font-size: 0.82rem; color: #666; }
        .gr-notes-box li { margin-bottom: 4px; }

        /* Comparison */
        .gr-comparison { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .gr-comp-card { flex: 1; min-width: 200px; background: white; border-radius: 12px; padding: 14px; border-left: 4px solid; }
        .gr-comp-label { font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: #333; }
        .gr-comp-points { list-style: none; padding: 0; margin: 0 0 10px; }
        .gr-comp-points li { font-size: 0.82rem; color: #555; padding: 3px 0 3px 12px; position: relative; }
        .gr-comp-points li::before { content: "→"; position: absolute; left: 0; font-size: 0.75rem; color: #888; }
        .gr-tip-box { background: #FFF9C4; border: 1px solid #F9A825; border-radius: 10px; padding: 12px 16px; font-size: 0.88rem; color: #555; margin-top: 8px; }

        /* Annotated examples */
        .gr-ae-card { background: white; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; border: 1px solid rgba(0,0,0,0.06); }
        .gr-ae-context { display: inline-block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 2px 8px; border-radius: 4px; background: #FFF3E0; color: #F97316; margin-bottom: 8px; }
        .gr-ae-note { font-size: 0.8rem; color: #888; margin-top: 6px; font-style: italic; }

        /* Drills (shared with lesson style) */
        .gr-drill-card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 20px; border: 1px solid rgba(0,0,0,0.02); }
        .gr-drill-q { font-size: 1.05rem; line-height: 1.6; font-family: 'Noto Sans JP', sans-serif; font-weight: bold; margin-bottom: 15px; color: #2f3542; }
        .gr-mcq-opt { display: block; width: 100%; text-align: left; padding: 12px 15px; margin-bottom: 8px; background: #fff; border: 2px solid #eee; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 0.95rem; color: #2f3542; transition: 0.2s; }
        .gr-mcq-opt:hover { border-color: #F97316; background: #FFF8F5; }
        .gr-mcq-opt.correct { background: #d4edda; border-color: #c3e6cb; color: #155724; }
        .gr-mcq-opt.wrong { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
        .gr-explanation { font-size: 0.82rem; color: #666; margin-top: 8px; padding: 8px 12px; background: #f8f9fa; border-radius: 8px; display: none; }
        .gr-explanation.visible { display: block; }

        /* Interactive drills */
        .gr-score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .gr-score-text { font-size: 0.85rem; font-weight: 700; color: #555; white-space: nowrap; }
        .gr-score-bar-wrap { flex: 1; height: 8px; background: #f1f2f6; border-radius: 4px; overflow: hidden; }
        .gr-score-bar-fill { height: 100%; background: linear-gradient(90deg, #F97316, #DC2626); border-radius: 4px; transition: width 0.4s ease; }

        .gr-drill-item { text-align: center; }
        .gr-verb-display { font-size: 2rem; font-weight: 900; font-family: 'Noto Sans JP', sans-serif; color: #2f3542; margin-bottom: 6px; }
        .gr-verb-reading { font-size: 0.9rem; color: #888; margin-bottom: 10px; }
        .gr-verb-type-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; margin-bottom: 10px; }
        .gr-type-ru { background: #d1ecf1; color: #0c5460; }
        .gr-type-u { background: #d4edda; color: #155724; }
        .gr-type-irr { background: #fff3cd; color: #856404; }
        .gr-transform-arrow { font-size: 1.5rem; color: #F97316; margin: 10px 0; }
        .gr-target-label { font-size: 0.85rem; font-weight: 700; color: #F97316; background: #FFF3E0; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 16px; }
        .gr-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
        .gr-choice-chip {
          padding: 12px 10px; border-radius: 12px; border: 2px solid #eee; background: white;
          cursor: pointer; font-family: 'Noto Sans JP', sans-serif; font-size: 1rem; font-weight: 600;
          text-align: center; transition: 0.18s; color: #2f3542;
        }
        .gr-choice-chip:hover { border-color: #F97316; background: #FFF8F5; }
        .gr-choice-chip.correct { background: #d4edda; border-color: #c3e6cb; color: #155724; }
        .gr-choice-chip.wrong { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
        .gr-hint-text { font-size: 0.82rem; color: #666; margin-top: 10px; padding: 8px 12px; background: #f8f9fa; border-radius: 8px; }

        /* Fill slot */
        .gr-slot-sentence { font-size: 1.2rem; font-family: 'Noto Sans JP', sans-serif; line-height: 2; text-align: center; margin: 16px 0; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px; }
        .gr-slot-blank { display: inline-block; min-width: 50px; height: 36px; border: 2px solid #FDCB6E; border-radius: 8px; padding: 4px 12px; text-align: center; background: #FFFDE7; font-size: 1.1rem; font-weight: 700; color: #333; transition: 0.2s; vertical-align: middle; line-height: 26px; }
        .gr-slot-blank.filled-correct { border-color: #00B894; background: #d4edda; color: #155724; }
        .gr-slot-blank.filled-wrong { border-color: #D63031; background: #f8d7da; color: #721c24; }
        .gr-slot-choices { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px; }
        .gr-slot-chip { padding: 8px 18px; border-radius: 20px; border: 2px solid #eee; background: white; cursor: pointer; font-family: 'Noto Sans JP', sans-serif; font-size: 1rem; font-weight: 700; transition: 0.18s; }
        .gr-slot-chip:hover { border-color: #FDCB6E; background: #FFFDE7; }

        /* Pattern match */
        .gr-pm-card { background: white; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; border: 2px solid #eee; cursor: pointer; transition: 0.2s; }
        .gr-pm-card.answered-correct { border-color: #00B894; }
        .gr-pm-card.answered-wrong { border-color: #D63031; }
        .gr-pm-sentence { font-size: 1.05rem; font-family: 'Noto Sans JP', sans-serif; margin-bottom: 8px; }
        .gr-pm-buttons { display: flex; gap: 8px; }
        .gr-pm-btn { flex: 1; padding: 8px; border-radius: 8px; border: 2px solid #eee; background: white; cursor: pointer; font-weight: 700; font-size: 1rem; }
        .gr-pm-btn.correct-choice { background: #d4edda; border-color: #00B894; color: #155724; }
        .gr-pm-btn.wrong-choice { background: #f8d7da; border-color: #D63031; color: #721c24; }
        .gr-pm-explanation { font-size: 0.8rem; color: #666; margin-top: 8px; padding: 6px 10px; background: #f8f9fa; border-radius: 6px; }

        /* Sentence transform */
        .gr-st-from { background: white; border-radius: 10px; padding: 14px; border: 2px solid #eee; margin-bottom: 10px; }
        .gr-st-to { background: #FFF8F5; border-radius: 10px; padding: 14px; border: 2px dashed #F97316; min-height: 60px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .gr-st-label { font-size: 0.72rem; font-weight: 700; color: #F97316; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .gr-st-sentence { font-size: 1.05rem; font-family: 'Noto Sans JP', sans-serif; color: #2f3542; }
        .gr-st-arrow { text-align: center; font-size: 1.5rem; color: #F97316; margin: 6px 0; }

        /* Conversation (grammar context) */
        .gr-conv-toggle { font-size: 0.75rem; font-weight: 700; color: #747d8c; background: #fff; border: 2px solid #f1f2f6; padding: 8px 16px; border-radius: 20px; cursor: pointer; margin-bottom: 20px; width: 100%; }
        .gr-conv-row { display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-start; }
        .gr-speaker-bubble { background: #FFF3E0; color: #F97316; font-weight: 900; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.05); font-family: 'Noto Sans JP', sans-serif; font-size: 0.75rem; }
        .gr-jp { font-size: 1.15rem; line-height: 1.6; font-family: 'Noto Sans JP', sans-serif; color: #2f3542; }
        .gr-en { font-size: 0.9rem; color: #747d8c; margin-top: 6px; }
        .gr-term { color: #F97316; font-weight: 700; cursor: pointer; margin-right: 1px; border-bottom: 2px solid rgba(249,115,22,0.2); transition: 0.2s; }
        .gr-term:hover { background: rgba(249,115,22,0.06); border-bottom-color: #F97316; }

        /* Summary / celebration */
        .jp-hanabi-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100; overflow: hidden; }
        .jp-hanabi-particle { position: absolute; border-radius: 50%; }
        .jp-hanabi-msg { position: absolute; top: 35%; left: 50%; transform: translate(-50%, -50%) scale(0); text-align: center; font-family: 'Noto Sans JP', sans-serif; animation: jp-hanabi-pop 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; white-space: nowrap; }
        .jp-hanabi-jp { font-size: 3rem; font-weight: 900; text-shadow: 0 2px 10px rgba(0,0,0,0.15); }
        .jp-hanabi-en { font-size: 1rem; color: #747d8c; font-weight: 600; margin-top: 5px; }
        @keyframes jp-hanabi-pop {
          0%   { transform: translate(-50%, -50%) scale(0);   opacity: 0; }
          20%  { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
          40%  { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
          80%  { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // --- Helpers ---
    function el(tag, cls, inner) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (inner !== undefined) {
        if (typeof inner === 'string') e.innerHTML = inner;
        else e.appendChild(inner);
      }
      return e;
    }
    function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function getCdnUrl(fp) { return window.getAssetUrl(REPO_CONFIG, fp); }

    // --- TTS ---
    function speakText(text) {
      if (window.JPShared && window.JPShared.tts && window.JPShared.tts.speak) {
        window.JPShared.tts.speak(text);
      }
    }
    function speakParts(parts) {
      speakText((parts || []).map(p => p.text).join(''));
    }

    // --- Progress ---
    function progressSet(key, val) {
      if (window.JPShared && window.JPShared.progress) {
        if (typeof window.JPShared.progress.set === 'function') {
          window.JPShared.progress.set(key, val);
        } else {
          try { localStorage.setItem('gr_' + key, JSON.stringify(val)); } catch(e) {}
        }
      }
    }
    function progressGet(key) {
      if (window.JPShared && window.JPShared.progress) {
        if (typeof window.JPShared.progress.get === 'function') {
          return window.JPShared.progress.get(key);
        }
      }
      try { return JSON.parse(localStorage.getItem('gr_' + key)); } catch(e) { return null; }
    }
    function markGrammarComplete(id, score) {
      progressSet('grammar_' + id + '_complete', true);
      if (score !== undefined) progressSet('grammar_' + id + '_drill_score', score);
    }
    function isGrammarComplete(id) {
      return !!progressGet('grammar_' + id + '_complete');
    }

    // --- Celebration ---
    const SCORE_RANKS = [
      { min: 0,   msg: '頑張れ！',     sub: 'Keep Going!',    colors: ['#a4b0be','#747d8c','#57606f'], particles: 8 },
      { min: 50,  msg: 'いいね！',     sub: 'Nice!',          colors: ['#FFD700','#FFA500','#FFE066'], particles: 15 },
      { min: 60,  msg: 'すごい！',     sub: 'Amazing!',       colors: ['#FF6B35','#FF4500','#FF8C00'], particles: 24 },
      { min: 70,  msg: 'さすが！',     sub: 'Impressive!',    colors: ['#FF1493','#FF69B4','#FF85C8'], particles: 35 },
      { min: 80,  msg: 'すばらしい！', sub: 'Wonderful!',     colors: ['#00E5FF','#00BCD4','#4DD0E1'], particles: 45 },
      { min: 90,  msg: '天才！',       sub: 'Genius!',        colors: ['#8B5CF6','#A78BFA','#7C3AED'], particles: 55 },
      { min: 100, msg: '神！',         sub: 'Godlike!',       colors: ['#FF1493','#FFD700','#00E5FF','#8B5CF6','#2ED573','#FF6B35'], particles: 70 },
    ];

    function launchHanabi(rank, targetEl) {
      targetEl.style.position = 'relative';
      const cont = document.createElement('div');
      cont.className = 'jp-hanabi-container';
      targetEl.appendChild(cont);
      const w = targetEl.offsetWidth || 300, h = targetEl.offsetHeight || 200;
      const bpts = rank.particles >= 55 ? [
        {x:w*0.3,y:h*0.25},{x:w*0.7,y:h*0.3},{x:w*0.5,y:h*0.15}
      ] : rank.particles >= 35 ? [
        {x:w*0.35,y:h*0.25},{x:w*0.65,y:h*0.25}
      ] : [{x:w/2,y:h*0.25}];
      const pb = Math.ceil(rank.particles / bpts.length);
      bpts.forEach((bp, bi) => {
        for (let i = 0; i < pb; i++) {
          const p = document.createElement('div');
          p.className = 'jp-hanabi-particle';
          const angle = (Math.PI*2*i/pb)+(Math.random()*0.4-0.2);
          const dist = 50+Math.random()*100;
          const color = rank.colors[Math.floor(Math.random()*rank.colors.length)];
          const size = 3+Math.random()*5;
          const delay = bi*150+Math.random()*100;
          const dx = Math.cos(angle)*dist, dy = Math.sin(angle)*dist+40;
          p.style.cssText = 'left:'+bp.x+'px;top:'+bp.y+'px;width:'+size+'px;height:'+size+'px;background:'+color+';box-shadow:0 0 '+size+'px '+color+';transition:transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94),opacity 0.9s ease-out;transition-delay:'+delay+'ms;';
          cont.appendChild(p);
          requestAnimationFrame(() => requestAnimationFrame(() => {
            p.style.transform = 'translate('+dx+'px,'+dy+'px)'; p.style.opacity = '0';
          }));
        }
      });
      const msg = document.createElement('div');
      msg.className = 'jp-hanabi-msg';
      msg.innerHTML = '<div class="jp-hanabi-jp" style="color:'+rank.colors[0]+'">'+rank.msg+'</div><div class="jp-hanabi-en">'+rank.sub+'</div>';
      cont.appendChild(msg);
      setTimeout(() => cont.remove(), 3000);
    }

    // --- Parts renderer ---
    function renderParts(parts) {
      return (parts || []).map(part => {
        const color = GRAMMAR_COLORS[part.role] || '#888';
        const bg = color + '26';
        let html = '<span class="gr-part" style="background:' + bg + ';border-bottom:2px solid ' + color + ';"';
        if (part.gloss) html += ' data-gloss="' + esc(part.gloss) + '" title="' + esc(part.gloss) + '"';
        html += '>' + esc(part.text) + '</span>';
        return html;
      }).join('');
    }

    // --- Resources ---
    async function loadResources() {
      const manifest = await window.getManifest(REPO_CONFIG);
      const conjUrl    = getCdnUrl(manifest.globalFiles.conjugationRules);
      const counterUrl = getCdnUrl(manifest.globalFiles.counterRules);
      const particleUrl = getCdnUrl(manifest.shared.particles);
      const [conj, counter, particleData, ...glossParts] = await Promise.all([
        fetch(conjUrl).then(r => r.json()),
        fetch(counterUrl).then(r => r.json()),
        fetch(particleUrl).then(r => r.json()),
        ...manifest.levels.map(lvl => fetch(getCdnUrl(manifest.data[lvl].glossary)).then(r => r.json()))
      ]);
      const map = {};
      glossParts.forEach(g => g.entries.forEach(i => { map[i.id] = i; }));
      (particleData.particles || []).forEach(p => {
        map[p.id] = { id: p.id, surface: p.particle, reading: p.reading, meaning: p.role, notes: p.explanation, type: 'particle' };
      });
      return { map, conj, counter };
    }

    // ──────────────────────────────────────────────
    // SECTION RENDERERS
    // ──────────────────────────────────────────────

    function renderGrammarIntro(sec) {
      const div = el('div', 'gr-intro-card');
      div.appendChild(el('div', 'gr-intro-icon', sec.icon || '📐'));
      div.appendChild(el('div', 'gr-intro-title', esc(sec.title)));
      div.appendChild(el('div', 'gr-intro-summary', esc(sec.summary)));
      if (sec.whyItMatters) {
        div.appendChild(el('div', 'gr-why-box', '💡 ' + esc(sec.whyItMatters)));
      }
      if (sec.youWillLearn && sec.youWillLearn.length) {
        const list = el('div', 'gr-learn-list');
        sec.youWillLearn.forEach(item => {
          const row = el('div', 'gr-learn-item');
          row.appendChild(el('span', 'gr-learn-check', '☐'));
          row.appendChild(el('span', '', esc(item)));
          list.appendChild(row);
        });
        div.appendChild(list);
      }
      return div;
    }

    function buildFormula(pattern) {
      const row = el('div', 'gr-formula');
      (pattern || []).forEach((chip, i) => {
        const color = GRAMMAR_COLORS[chip.color] || '#888';
        const chipEl = el('div', 'gr-chip');
        chipEl.style.background = color;
        chipEl.innerHTML = '<span class="gr-chip-label">' + esc(chip.label) + '</span><span class="gr-chip-text">' + esc(chip.text) + '</span>';
        row.appendChild(chipEl);
        if (i < pattern.length - 1) row.appendChild(el('span', 'gr-arrow', '→'));
      });
      return row;
    }

    function renderGrammarRule(sec) {
      const div = el('div', 'gr-card');
      div.appendChild(buildFormula(sec.pattern));
      div.appendChild(el('div', 'gr-rule-meaning', esc(sec.meaning)));
      div.appendChild(el('div', 'gr-rule-explanation', esc(sec.explanation)));

      if (sec.notes && sec.notes.length) {
        const toggle = el('button', 'gr-notes-toggle', '📝 Notes (' + sec.notes.length + ')');
        const notesList = el('ul', 'gr-notes-list');
        notesList.style.display = 'none';
        sec.notes.forEach(n => notesList.appendChild(el('li', '', esc(n))));
        toggle.onclick = () => {
          const hidden = notesList.style.display === 'none';
          notesList.style.display = hidden ? 'block' : 'none';
          toggle.textContent = (hidden ? '📝 Notes ▲' : '📝 Notes ▼');
        };
        div.appendChild(toggle);
        div.appendChild(notesList);
      }

      (sec.examples || []).forEach(ex => {
        const card = el('div', 'gr-example-card');
        const sent = el('div', 'gr-example-sentence');
        sent.innerHTML = renderParts(ex.parts);
        card.appendChild(sent);
        card.appendChild(el('div', 'gr-example-en', esc(ex.en)));
        if (ex.breakdown) {
          const btn = el('button', 'gr-breakdown-toggle', '▼ Breakdown');
          const bd = el('div', 'gr-breakdown-text', esc(ex.breakdown));
          bd.style.display = 'none';
          btn.onclick = () => { const h = bd.style.display === 'none'; bd.style.display = h ? 'block' : 'none'; btn.textContent = h ? '▲ Breakdown' : '▼ Breakdown'; };
          card.appendChild(btn);
          card.appendChild(bd);
        }
        const tts = el('button', 'gr-tts-btn', '🔊');
        tts.onclick = () => speakParts(ex.parts);
        card.appendChild(tts);
        div.appendChild(card);
      });
      return div;
    }

    function renderGrammarTable(sec) {
      const div = el('div', 'gr-card-white');
      div.appendChild(el('div', '', '<strong>' + esc(sec.title) + '</strong>'));
      div.appendChild(el('div', 'gr-rule-explanation', esc(sec.description)));

      const wrap = el('div', 'gr-table-wrap');
      const table = el('table', 'gr-table');
      const thead = el('tr', '');
      (sec.headers || []).forEach(h => thead.appendChild(el('th', '', esc(h))));
      table.appendChild(el('thead', '', thead));
      const tbody = el('tbody', '');
      (sec.rows || []).forEach(row => {
        const tr = el('tr', '');
        tr.appendChild(el('td', 'gr-table-label', esc(row.label)));
        (row.cells || []).forEach(cell => {
          const td = el('td', '');
          // Attempt stem/ending split if highlight provided
          if (sec.highlight && typeof cell === 'string' && cell.length > 1) {
            const stemLen = Math.max(1, cell.length - 2);
            td.innerHTML = '<span class="gr-cell-stem">' + esc(cell.slice(0, stemLen)) + '</span><span class="gr-cell-ending">' + esc(cell.slice(stemLen)) + '</span>';
          } else {
            td.textContent = typeof cell === 'object' ? (cell.stem || '') + (cell.ending || '') : cell;
          }
          tr.appendChild(td);
        });
        if (row.meaning) tr.appendChild(el('td', 'gr-table-meaning', esc(row.meaning)));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);
      div.appendChild(wrap);

      if (sec.notes && sec.notes.length) {
        const nb = el('ul', 'gr-notes-box');
        sec.notes.forEach(n => nb.appendChild(el('li', '', esc(n))));
        div.appendChild(nb);
      }
      return div;
    }

    function renderGrammarComparison(sec) {
      const div = el('div', 'gr-card-white');
      div.appendChild(el('div', '', '<strong>' + esc(sec.title) + '</strong><br><br>'));
      const row = el('div', 'gr-comparison');
      (sec.items || []).forEach(item => {
        const color = GRAMMAR_COLORS[item.color] || '#888';
        const card = el('div', 'gr-comp-card');
        card.style.borderLeftColor = color;
        card.appendChild(el('div', 'gr-comp-label', '<span style="color:' + color + '">●</span> ' + esc(item.label)));
        const pts = el('ul', 'gr-comp-points');
        (item.points || []).forEach(p => pts.appendChild(el('li', '', esc(p))));
        card.appendChild(pts);
        if (item.example) {
          const ex = el('div', 'gr-example-card');
          const sent = el('div', 'gr-example-sentence');
          sent.innerHTML = renderParts(item.example.parts);
          ex.appendChild(sent);
          ex.appendChild(el('div', 'gr-example-en', esc(item.example.en)));
          const tts = el('button', 'gr-tts-btn', '🔊');
          tts.onclick = () => speakParts(item.example.parts);
          ex.appendChild(tts);
          card.appendChild(ex);
        }
        row.appendChild(card);
      });
      div.appendChild(row);
      if (sec.tip) div.appendChild(el('div', 'gr-tip-box', '💡 ' + esc(sec.tip)));
      return div;
    }

    function renderAnnotatedExample(sec) {
      const div = el('div', '');
      div.appendChild(el('div', '', '<strong>' + esc(sec.title) + '</strong><br><br>'));
      (sec.examples || []).forEach(ex => {
        const card = el('div', 'gr-ae-card');
        if (ex.context) card.appendChild(el('span', 'gr-ae-context', esc(ex.context)));
        const sent = el('div', 'gr-example-sentence');
        sent.innerHTML = renderParts(ex.parts);
        card.appendChild(sent);
        card.appendChild(el('div', 'gr-example-en', esc(ex.en)));
        if (ex.note) card.appendChild(el('div', 'gr-ae-note', '💬 ' + esc(ex.note)));
        const tts = el('button', 'gr-tts-btn', '🔊');
        tts.onclick = () => speakParts(ex.parts);
        card.appendChild(tts);
        div.appendChild(card);
      });
      return div;
    }

    function renderConjugationDrill(sec) {
      const div = el('div', '');
      const items = sec.items || [];
      let idx = 0, correct = 0, answered = 0;

      const scoreRow = el('div', 'gr-score-row');
      const scoreText = el('div', 'gr-score-text', '0 / ' + items.length);
      const barWrap = el('div', 'gr-score-bar-wrap');
      const barFill = el('div', 'gr-score-bar-fill');
      barFill.style.width = '0%';
      barWrap.appendChild(barFill);
      scoreRow.appendChild(scoreText);
      scoreRow.appendChild(barWrap);
      div.appendChild(scoreRow);

      const itemDiv = el('div', 'gr-card gr-drill-item');
      div.appendChild(itemDiv);

      function renderItem() {
        if (idx >= items.length) {
          const pct = items.length > 0 ? Math.round(correct / items.length * 100) : 100;
          progressSet('grammar_' + grammarId + '_conj_score', pct);
          itemDiv.innerHTML = '<div style="text-align:center;padding:20px;"><div style="font-size:1.4rem;font-weight:900;color:#F97316;">' + pct + '%</div><div style="color:#888;margin-top:8px;">Conjugation complete!</div></div>';
          return;
        }
        const item = items[idx];
        itemDiv.innerHTML = '';
        const typeCls = item.type === 'ru' ? 'gr-type-ru' : item.type === 'u' ? 'gr-type-u' : 'gr-type-irr';
        const typeLbl = item.type === 'ru' ? 'RU-verb' : item.type === 'u' ? 'U-verb' : 'Irregular';
        itemDiv.innerHTML = '<div style="margin-bottom:4px;font-size:0.8rem;color:#aaa;">' + (idx+1) + ' of ' + items.length + '</div>';
        itemDiv.appendChild(el('div', 'gr-verb-display', esc(item.verb)));
        itemDiv.appendChild(el('div', 'gr-verb-reading', esc(item.reading)));
        itemDiv.appendChild(el('span', 'gr-verb-type-badge ' + typeCls, typeLbl));
        itemDiv.appendChild(el('div', 'gr-transform-arrow', '↓'));
        itemDiv.appendChild(el('div', 'gr-target-label', esc(item.targetForm.replace(/_/g, ' '))));

        const hint = el('div', 'gr-hint-text', esc(item.hint));
        hint.style.display = 'none';

        const choices = el('div', 'gr-choices');
        const shuffled = [...item.choices].sort(() => Math.random() - 0.5);
        let solved = false;
        shuffled.forEach(ch => {
          const btn = el('button', 'gr-choice-chip', esc(ch));
          btn.onclick = () => {
            if (solved) return;
            if (ch === item.answer) {
              btn.classList.add('correct');
              if (!solved) { correct++; answered++; solved = true; }
              hint.style.display = 'block';
              scoreText.textContent = answered + ' / ' + items.length;
              barFill.style.width = (answered / items.length * 100) + '%';
              speakText(item.answer);
              setTimeout(() => { idx++; renderItem(); }, 1400);
            } else {
              btn.classList.add('wrong');
              if (!solved) { answered++; solved = true; }
              hint.style.display = 'block';
              scoreText.textContent = answered + ' / ' + items.length;
              barFill.style.width = (answered / items.length * 100) + '%';
              // highlight correct
              choices.querySelectorAll('.gr-choice-chip').forEach(b => {
                if (b.textContent === item.answer) b.classList.add('correct');
              });
            }
          };
          choices.appendChild(btn);
        });
        itemDiv.appendChild(choices);
        itemDiv.appendChild(hint);
      }
      renderItem();
      return div;
    }

    function renderPatternMatch(sec) {
      const div = el('div', '');
      // Pattern formula display
      const patternBox = el('div', 'gr-card');
      patternBox.innerHTML = '<div style="font-size:0.8rem;font-weight:700;color:#888;margin-bottom:8px;text-transform:uppercase;">Pattern</div><div style="font-family:\'Noto Sans JP\',sans-serif;font-size:0.95rem;color:#333;">' + esc(sec.pattern) + '</div>';
      div.appendChild(patternBox);

      let correct = 0, total = 0;
      const scoreRow = el('div', 'gr-score-row');
      const scoreText = el('div', 'gr-score-text', '0 / ' + (sec.items || []).length);
      const barWrap = el('div', 'gr-score-bar-wrap');
      const barFill = el('div', 'gr-score-bar-fill');
      barFill.style.width = '0%';
      barWrap.appendChild(barFill);
      scoreRow.appendChild(scoreText);
      scoreRow.appendChild(barWrap);
      div.appendChild(scoreRow);

      (sec.items || []).forEach(item => {
        const card = el('div', 'gr-pm-card');
        card.appendChild(el('div', 'gr-pm-sentence', esc(item.sentence)));
        const btns = el('div', 'gr-pm-buttons');
        const expEl = el('div', 'gr-pm-explanation', esc(item.explanation));
        expEl.style.display = 'none';
        let answered = false;

        const makeBtn = (label, isCorrectChoice) => {
          const btn = el('button', 'gr-pm-btn', label);
          btn.onclick = () => {
            if (answered) return;
            answered = true; total++;
            expEl.style.display = 'block';
            if (isCorrectChoice === item.correct) {
              correct++;
              btn.classList.add('correct-choice');
              card.classList.add('answered-correct');
            } else {
              btn.classList.add('wrong-choice');
              card.classList.add('answered-wrong');
              btns.querySelectorAll('.gr-pm-btn').forEach(b => {
                if ((b.textContent === '✓') === item.correct) b.classList.add('correct-choice');
              });
            }
            scoreText.textContent = total + ' / ' + (sec.items || []).length;
            barFill.style.width = (total / (sec.items || []).length * 100) + '%';
          };
          return btn;
        };
        btns.appendChild(makeBtn('✓', true));
        btns.appendChild(makeBtn('✗', false));

        const tts = el('button', 'gr-tts-btn', '🔊');
        tts.onclick = () => speakText(item.sentence);
        card.appendChild(tts);
        card.appendChild(btns);
        card.appendChild(expEl);
        div.appendChild(card);
      });
      return div;
    }

    function renderSentenceTransform(sec) {
      const div = el('div', '');
      const items = sec.items || [];
      let idx = 0, correct = 0, answered = 0;

      const scoreRow = el('div', 'gr-score-row');
      const scoreText = el('div', 'gr-score-text', '0 / ' + items.length);
      const barWrap = el('div', 'gr-score-bar-wrap');
      const barFill = el('div', 'gr-score-bar-fill');
      barFill.style.width = '0%';
      barWrap.appendChild(barFill);
      scoreRow.appendChild(scoreText);
      scoreRow.appendChild(barWrap);
      div.appendChild(scoreRow);

      const itemDiv = el('div', 'gr-card');
      div.appendChild(itemDiv);

      function renderItem() {
        if (idx >= items.length) {
          const pct = items.length > 0 ? Math.round(correct / items.length * 100) : 100;
          itemDiv.innerHTML = '<div style="text-align:center;padding:16px;"><div style="font-size:1.4rem;font-weight:900;color:#F97316;">' + pct + '%</div><div style="color:#888;margin-top:8px;">Transform practice complete!</div></div>';
          return;
        }
        const item = items[idx];
        itemDiv.innerHTML = '';
        itemDiv.innerHTML = '<div style="margin-bottom:4px;font-size:0.8rem;color:#aaa;">' + (idx+1) + ' of ' + items.length + '</div>';

        const from = el('div', 'gr-st-from');
        from.innerHTML = '<div class="gr-st-label">' + esc(item.givenLabel) + '</div><div class="gr-st-sentence">' + esc(item.given) + '</div>';
        const tts1 = el('button', 'gr-tts-btn', '🔊'); tts1.onclick = () => speakText(item.given); from.appendChild(tts1);
        itemDiv.appendChild(from);
        itemDiv.appendChild(el('div', 'gr-st-arrow', '↓'));

        const toBox = el('div', 'gr-st-to');
        toBox.innerHTML = '<div style="text-align:center;color:#aaa;"><div class="gr-st-label">' + esc(item.targetLabel) + '</div><div style="color:#ccc;font-size:0.85rem;">Choose the correct form below</div></div>';
        itemDiv.appendChild(toBox);

        const choices = el('div', 'gr-choices');
        const shuffled = [...item.choices].sort(() => Math.random() - 0.5);
        let solved = false;
        shuffled.forEach(ch => {
          const btn = el('button', 'gr-choice-chip', esc(ch));
          btn.onclick = () => {
            if (solved) return;
            if (ch === item.answer) {
              btn.classList.add('correct');
              if (!solved) { correct++; answered++; solved = true; }
              toBox.innerHTML = '<div style="text-align:center;"><div class="gr-st-label" style="color:#00B894;">' + esc(item.targetLabel) + '</div><div class="gr-st-sentence" style="color:#155724;">' + esc(item.answer) + '</div></div>';
              const tts2 = el('button', 'gr-tts-btn', '🔊'); tts2.onclick = () => speakText(item.answer); toBox.appendChild(tts2);
              scoreText.textContent = answered + ' / ' + items.length;
              barFill.style.width = (answered / items.length * 100) + '%';
              setTimeout(() => { idx++; renderItem(); }, 1500);
            } else {
              btn.classList.add('wrong');
              if (!solved) { answered++; solved = true; }
              scoreText.textContent = answered + ' / ' + items.length;
              barFill.style.width = (answered / items.length * 100) + '%';
              choices.querySelectorAll('.gr-choice-chip').forEach(b => {
                if (b.textContent === item.answer) b.classList.add('correct');
              });
            }
          };
          choices.appendChild(btn);
        });
        itemDiv.appendChild(choices);
      }
      renderItem();
      return div;
    }

    function renderFillSlot(sec) {
      const div = el('div', '');
      const items = sec.items || [];
      let idx = 0, correct = 0, answered = 0;

      const scoreRow = el('div', 'gr-score-row');
      const scoreText = el('div', 'gr-score-text', '0 / ' + items.length);
      const barWrap = el('div', 'gr-score-bar-wrap');
      const barFill = el('div', 'gr-score-bar-fill');
      barFill.style.width = '0%';
      barWrap.appendChild(barFill);
      scoreRow.appendChild(scoreText);
      scoreRow.appendChild(barWrap);
      div.appendChild(scoreRow);

      const itemDiv = el('div', 'gr-card');
      div.appendChild(itemDiv);

      function renderItem() {
        if (idx >= items.length) {
          const pct = items.length > 0 ? Math.round(correct / items.length * 100) : 100;
          itemDiv.innerHTML = '<div style="text-align:center;padding:16px;"><div style="font-size:1.4rem;font-weight:900;color:#F97316;">' + pct + '%</div><div style="color:#888;margin-top:8px;">Fill-slot practice complete!</div></div>';
          return;
        }
        const item = items[idx];
        itemDiv.innerHTML = '';
        itemDiv.innerHTML = '<div style="margin-bottom:8px;font-size:0.8rem;color:#aaa;">' + (idx+1) + ' of ' + items.length + '</div>';

        const sent = el('div', 'gr-slot-sentence');
        sent.appendChild(el('span', '', esc(item.before)));
        const blank = el('span', 'gr-slot-blank', '　');
        sent.appendChild(blank);
        if (item.after) sent.appendChild(el('span', '', esc(item.after)));
        itemDiv.appendChild(sent);

        const expEl = el('div', 'gr-hint-text', esc(item.explanation));
        expEl.style.display = 'none';

        const chipsRow = el('div', 'gr-slot-choices');
        let solved = false;
        (item.choices || []).forEach(ch => {
          const chip = el('button', 'gr-slot-chip', esc(ch));
          chip.onclick = () => {
            if (solved) return;
            solved = true;
            blank.textContent = ch;
            if (ch === item.answer) {
              correct++; answered++;
              blank.classList.add('filled-correct');
              speakText(item.before + ch + (item.after || ''));
            } else {
              answered++;
              blank.classList.add('filled-wrong');
              chipsRow.querySelectorAll('.gr-slot-chip').forEach(c => {
                if (c.textContent === item.answer) { c.style.borderColor = '#00B894'; c.style.background = '#d4edda'; }
              });
            }
            expEl.style.display = 'block';
            scoreText.textContent = answered + ' / ' + items.length;
            barFill.style.width = (answered / items.length * 100) + '%';
            setTimeout(() => { idx++; renderItem(); }, 1600);
          };
          chipsRow.appendChild(chip);
        });
        itemDiv.appendChild(chipsRow);
        itemDiv.appendChild(expEl);
      }
      renderItem();
      return div;
    }

    function renderConversation(sec) {
      const div = el('div', '');
      const toggle = el('button', 'gr-conv-toggle', showEN ? 'Hide English Translation' : 'Show English Translation');
      toggle.onclick = () => { showEN = !showEN; renderCurrentStep(); };
      div.appendChild(toggle);
      (sec.lines || []).forEach(line => {
        const row = el('div', 'gr-conv-row');
        const bubble = el('div', 'gr-speaker-bubble', esc(line.spk));
        const content = el('div', '');
        content.style.flex = '1';
        const jp = el('div', 'gr-jp');
        jp.innerHTML = window.JPShared.textProcessor.processText(line.jp, line.terms, termMapData, CONJUGATION_RULES, COUNTER_RULES);
        // Apply grammar color highlights to focus particles/forms
        const particles = (grammarData.meta && grammarData.meta.particles) || [];
        if (particles.length) {
          // Wrap focus particles in highlight spans
          particles.forEach(p => {
            jp.innerHTML = jp.innerHTML.replace(
              new RegExp(p, 'g'),
              '<span style="background:' + GRAMMAR_COLORS.particle + '40;border-bottom:2px solid ' + GRAMMAR_COLORS.particle + ';border-radius:2px;padding:0 2px;">' + p + '</span>'
            );
          });
        }
        content.appendChild(jp);
        const enDiv = el('div', 'gr-en', esc(line.en));
        enDiv.style.display = showEN ? 'block' : 'none';
        content.appendChild(enDiv);
        const tts = el('button', 'gr-tts-btn', '🔊'); tts.onclick = () => speakText(line.jp);
        content.appendChild(tts);
        row.appendChild(bubble);
        row.appendChild(content);
        div.appendChild(row);
      });
      return div;
    }

    function renderDrills(sec) {
      const div = el('div', '');
      (sec.items || []).forEach((item, itemIdx) => {
        if (item.kind === 'mcq') {
          const card = el('div', 'gr-drill-card');
          const qEl = el('div', 'gr-drill-q');
          qEl.innerHTML = item.terms
            ? window.JPShared.textProcessor.processText(item.q, item.terms, termMapData, CONJUGATION_RULES, COUNTER_RULES)
            : esc(item.q);
          card.appendChild(qEl);
          const optsDiv = el('div', '');
          const expEl = el('div', 'gr-explanation', item.explanation ? esc(item.explanation) : '');
          let solved = false;
          const itemKey = 'gr_drill__' + grammarId + '__' + itemIdx;
          const shuffled = [...item.choices].sort(() => Math.random() - 0.5);
          shuffled.forEach(choice => {
            const btn = el('button', 'gr-mcq-opt', esc(choice));
            btn.onclick = () => {
              if (solved) return; solved = true;
              if (choice === item.answer) {
                btn.classList.add('correct');
                if (!drillAnswered.has(itemKey)) { drillAnswered.add(itemKey); drillCorrect++; }
              } else {
                btn.classList.add('wrong');
                if (!drillAnswered.has(itemKey)) drillAnswered.add(itemKey);
                optsDiv.querySelectorAll('.gr-mcq-opt').forEach(c => {
                  if (c.textContent === item.answer) c.classList.add('correct');
                });
                if (item.terms && item.terms.length > 0) {
                  item.terms.forEach(termId => {
                    const rt = window.JPShared.textProcessor.getRootTerm(termId, termMapData);
                    if (rt) window.JPShared.progress.flagTerm(rt.surface);
                  });
                }
              }
              if (expEl.textContent) expEl.classList.add('visible');
            };
            optsDiv.appendChild(btn);
          });
          drillTotal++;
          card.appendChild(optsDiv);
          card.appendChild(expEl);
          div.appendChild(card);
        }
      });
      return div;
    }

    // ──────────────────────────────────────────────
    // STEP RENDERING
    // ──────────────────────────────────────────────

    function renderCurrentStep() {
      const body = root.querySelector('.gr-body');
      const title = root.querySelector('.gr-title');
      const bar = root.querySelector('.gr-progress-bar');
      const nextBtn = root.querySelector('.gr-nav-btn.next');
      const prevBtn = root.querySelector('.gr-nav-btn.prev');

      body.innerHTML = '';
      bar.style.width = (((currentStep + 1) / totalSteps) * 100) + '%';

      if (currentStep >= grammarData.sections.length) {
        title.innerText = 'Complete!';
        const pct = drillTotal > 0 ? Math.round(drillCorrect / drillTotal * 100) : 100;
        const rank = [...SCORE_RANKS].reverse().find(r => pct >= r.min) || SCORE_RANKS[0];
        markGrammarComplete(grammarId, pct);
        body.innerHTML = `
          <div class="gr-card" style="text-align:center; position:relative; padding:30px 20px;">
            <h2 style="margin-bottom:15px;">🌿 Grammar Lesson Complete!</h2>
            ${drillTotal > 0 ? `
            <div style="font-size:0.8rem;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Drill Score</div>
            <div style="font-size:3rem;font-weight:900;color:${rank.colors[0]};line-height:1.1;">${rank.msg}</div>
            <div style="font-size:1rem;color:#747d8c;font-weight:600;margin:6px 0 14px;">${rank.sub}</div>
            <div style="font-size:2.2rem;font-weight:900;color:#F97316;">${pct}%</div>
            <div style="font-size:0.9rem;color:#888;margin-top:4px;">${drillCorrect} / ${drillTotal} correct</div>
            ` : ''}
          </div>`;
        nextBtn.innerText = 'Finish';
        if (drillTotal > 0) launchHanabi(rank, body.querySelector('.gr-card'));
        return;
      }

      const sec = grammarData.sections[currentStep];
      title.innerText = sec.title || grammarData.title;

      const wrap = el('div', '');
      let content = null;

      if      (sec.type === 'grammarIntro')      content = renderGrammarIntro(sec);
      else if (sec.type === 'grammarRule')        content = renderGrammarRule(sec);
      else if (sec.type === 'grammarTable')       content = renderGrammarTable(sec);
      else if (sec.type === 'grammarComparison')  content = renderGrammarComparison(sec);
      else if (sec.type === 'annotatedExample')   content = renderAnnotatedExample(sec);
      else if (sec.type === 'conjugationDrill')   content = renderConjugationDrill(sec);
      else if (sec.type === 'patternMatch')        content = renderPatternMatch(sec);
      else if (sec.type === 'sentenceTransform')  content = renderSentenceTransform(sec);
      else if (sec.type === 'fillSlot')           content = renderFillSlot(sec);
      else if (sec.type === 'conversation')       content = renderConversation(sec);
      else if (sec.type === 'drills')             content = renderDrills(sec);
      else content = el('div', 'gr-card', '<em>Unknown section type: ' + esc(sec.type) + '</em>');

      if (content) wrap.appendChild(content);
      body.appendChild(wrap);

      prevBtn.disabled = (currentStep === 0);
      nextBtn.innerText = (currentStep === totalSteps - 1) ? 'Finish' : 'Next';
    }

    // ──────────────────────────────────────────────
    // LOAD & NAVIGATION
    // ──────────────────────────────────────────────

    async function loadGrammarLesson(file, id) {
      root.innerHTML = `
        <div class="gr-header">
          <button class="gr-back-btn">← List</button>
          <div class="gr-title">Loading...</div>
          <button class="gr-exit-btn">Exit</button>
        </div>
        <div class="gr-progress-container"><div class="gr-progress-bar"></div></div>
        <div class="gr-body"></div>
        <div class="gr-footer">
          <button class="gr-nav-btn prev">Prev</button>
          <button class="gr-nav-btn next">Next</button>
        </div>`;
      root.querySelector('.gr-back-btn').onclick = () => renderMenu();
      root.querySelector('.gr-exit-btn').onclick = exitCallback;

      try {
        const url = getCdnUrl(file);
        const [gRes, resources] = await Promise.all([fetch(url), loadResources()]);
        grammarData = await gRes.json();
        grammarId = id;
        drillCorrect = 0; drillTotal = 0; drillAnswered.clear();
        termMapData = resources.map;
        CONJUGATION_RULES = resources.conj;
        COUNTER_RULES = resources.counter;
        window.JPShared.termModal.setTermMap(termMapData);

        currentStep = 0;
        totalSteps = grammarData.sections.length + 1;
        showEN = false;

        root.querySelector('.gr-nav-btn.prev').onclick = () => {
          if (currentStep > 0) { currentStep--; showEN = false; renderCurrentStep(); }
        };
        root.querySelector('.gr-nav-btn.next').onclick = () => {
          if (currentStep < totalSteps) { currentStep++; showEN = false; renderCurrentStep(); }
          else renderMenu();
        };
        renderCurrentStep();
      } catch (err) {
        console.error(err);
        root.querySelector('.gr-body').innerHTML = '<div style="color:red;padding:20px;">Error loading grammar lesson: ' + esc(err.message) + '</div>';
      }
    }

    async function fetchGrammarList() {
      root.innerHTML = `
        <div class="gr-header">
          <div class="gr-title">🌿 Grammar Garden</div>
          <button class="gr-exit-btn">Exit</button>
        </div>
        <div class="gr-body" style="justify-content:center;align-items:center;color:#888;">Loading...</div>`;
      root.querySelector('.gr-exit-btn').onclick = exitCallback;

      try {
        const manifest = await window.getManifest(REPO_CONFIG);
        currentGrammars = [];
        (manifest.levels || []).forEach(level => {
          const levelData = manifest.data && manifest.data[level];
          if (!levelData || !levelData.grammar) return;
          levelData.grammar.forEach(g => {
            currentGrammars.push({ ...g, level });
          });
        });
        renderMenu();
      } catch (err) {
        root.querySelector('.gr-body').innerHTML = '<div style="color:red;padding:20px;">Error: ' + esc(err.message) + '</div>';
      }
    }

    function renderMenu() {
      root.innerHTML = `
        <div class="gr-header">
          <div class="gr-title">🌿 Grammar Garden</div>
          <button class="gr-exit-btn">Exit</button>
        </div>
        <div class="gr-body">
          <div style="font-size:0.8rem;color:#888;margin-bottom:16px;text-transform:uppercase;font-weight:700;letter-spacing:1px;">Grammar Lessons</div>
          <div class="gr-menu-grid" id="gr-menu-container"></div>
        </div>`;
      root.querySelector('.gr-exit-btn').onclick = exitCallback;
      const menuEl = document.getElementById('gr-menu-container');

      currentGrammars.forEach(g => {
        const done = isGrammarComplete(g.id);
        const item = el('div', 'gr-menu-item' + (false ? ' locked' : ''));
        const left = el('div', '', '');
        left.style.display = 'flex'; left.style.alignItems = 'center';
        left.appendChild(el('span', 'gr-menu-icon', g.icon || '📐'));
        const info = el('div', '');
        info.appendChild(el('div', 'gr-menu-id', g.id));
        info.appendChild(el('div', 'gr-menu-name', g.title));
        left.appendChild(info);
        item.appendChild(left);

        const badge = el('span', 'gr-menu-badge ' + (done ? 'done' : 'lock'), done ? '✓ Done' : '→');
        item.appendChild(badge);

        item.onclick = () => loadGrammarLesson(g.file, g.id);
        menuEl.appendChild(item);
      });

      if (currentGrammars.length === 0) {
        menuEl.innerHTML = '<div style="text-align:center;color:#aaa;padding:40px;">No grammar lessons available yet.</div>';
      }
    }

    // --- Modal ---
    window.JPShared.termModal.inject();

    // --- Initialize ---
    fetchGrammarList();
  }
};
