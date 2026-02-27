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
    let CONJUGATION_RULES = null;
    let COUNTER_RULES = null;
    let drillCorrect = 0;
    let drillTotal = 0;
    const drillAnswered = new Set();
    let currentGrammars = [];
    let grammarId = null;
    let allLevelsData = null;
    let currentLevelId = null;
    let showEN = false;

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

    // --- Shared Lesson Styles (inject if not already present from Lesson.js) ---
    if (!document.getElementById('jp-lesson-style')) {
      const style = document.createElement('style');
      style.id = 'jp-lesson-style';
      style.textContent = `
        #jp-lesson-app-root, #jp-grammar-app-root {
          --primary: #4e54c8; --primary-dark: #3f44a5;
          --bg-grad: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
          --text-main: #2f3542; --text-sub: #747d8c;
          font-family: 'Poppins', 'Noto Sans JP', sans-serif;
          background: var(--bg-grad); color: var(--text-main);
          display: flex; flex-direction: column;
          width: 100%; max-width: 600px; margin: 0 auto;
          height: 800px; border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.05); overflow: hidden; position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        #jp-lesson-app-root *, #jp-grammar-app-root * { box-sizing: border-box; }
        .jp-header {
          background: rgba(78, 84, 200, 0.95); padding: 1.2rem;
          color: white; border-bottom: none;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 4px 15px rgba(78, 84, 200, 0.3); backdrop-filter: blur(5px);
          z-index: 10;
        }
        .jp-title { font-weight: 900; font-size: 1.1rem; color: white; }
        .jp-progress-container { height: 6px; width: 100%; background: rgba(0,0,0,0.1); }
        .jp-progress-bar { height: 100%; background: #2ed573; width: 0%; transition: width 0.3s ease; }
        .jp-body { padding: 1.5rem; flex: 1; overflow-y: auto; background: transparent; display: flex; flex-direction: column; }
        .jp-footer {
          padding: 15px 20px; background: white; border-top: 1px solid rgba(0,0,0,0.05);
          display: flex; gap: 10px; justify-content: space-between;
          box-shadow: 0 -5px 15px rgba(0,0,0,0.03); z-index: 10;
        }
        .jp-nav-btn {
          padding: 12px 24px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer;
          font-size: 0.95rem; transition: transform 0.1s;
        }
        .jp-nav-btn:active { transform: scale(0.96); }
        .jp-nav-btn.prev { background: #f1f2f6; color: #747d8c; }
        .jp-nav-btn.next { background: var(--primary); color: #fff; box-shadow: 0 4px 10px rgba(78,84,200,0.3); }
        .jp-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .jp-exit-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.8rem; }
        .jp-back-btn { background: transparent; color: rgba(255,255,255,0.8); border: none; cursor: pointer; font-weight: bold; font-size: 0.9rem; margin-right: 10px; }
        .jp-back-btn:hover { color: white; }
        .jp-menu-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .jp-menu-item {
          background: #fff; padding: 20px; border-radius: 16px; cursor: pointer;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid rgba(0,0,0,0.02); text-align: left;
          display: flex; justify-content: space-between; align-items: center;
        }
        .jp-menu-item:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(78,84,200,0.15); border-color: var(--primary); }
        .jp-menu-id { font-weight: 900; color: var(--primary); font-size: 1.1rem; }
        .jp-menu-name { font-size: 0.85rem; color: #a4b0be; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .jp-level-card {
          background: #fff; padding: 28px 24px; border-radius: 20px; cursor: pointer;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid rgba(0,0,0,0.02); text-align: center;
        }
        .jp-level-card:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(78,84,200,0.15); border-color: var(--primary); }
        .jp-level-name { font-weight: 900; font-size: 1.4rem; color: var(--primary); margin-bottom: 6px; }
        .jp-level-count { font-size: 0.85rem; color: #a4b0be; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .jp-card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 20px; border: 1px solid rgba(0,0,0,0.02); }
        .jp-speaker-bubble { background: #f1f2f6; color: var(--primary-dark); font-weight: 900; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .jp-row { display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-start; }
        .jp-jp { font-size: 1.15rem; line-height: 1.6; font-family: 'Noto Sans JP', sans-serif; color: #2f3542; }
        .jp-en { font-size: 0.9rem; color: #747d8c; margin-top: 6px; display: none; padding-left: 2px; }
        .jp-term { color: var(--primary); font-weight: 700; cursor: pointer; border-bottom: 2px solid rgba(78,84,200,0.1); transition: 0.2s; }
        .jp-term:hover { background: rgba(78,84,200,0.05); border-bottom-color: var(--primary); }
        .jp-toggle-en { font-size: 0.75rem; font-weight: 700; color: #747d8c; background: #fff; border: 2px solid #f1f2f6; padding: 8px 16px; border-radius: 20px; cursor: pointer; margin-bottom: 20px; width: 100%; }
        .jp-mcq-opt { display: block; width: 100%; text-align: left; padding: 15px; margin-bottom: 10px; background: #fff; border: 2px solid #eee; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; color: #2f3542; transition: 0.2s; }
        .jp-mcq-opt:hover { border-color: var(--primary); background: #f8f9fa; }
        .jp-mcq-opt.correct { background: #d4edda; border-color: #c3e6cb; color: #155724; }
        .jp-mcq-opt.wrong { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
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

    // --- Grammar-specific Styles ---
    if (!document.getElementById('jp-grammar-style')) {
      const style = document.createElement('style');
      style.id = 'jp-grammar-style';
      style.textContent = `
        #jp-grammar-app-root {
          --gr-accent: #F97316;
          --gr-accent-dark: #DC2626;
          --gr-bg: #FFF8F5;
        }
        .gr-header {
          background: linear-gradient(135deg, #F97316, #DC2626);
          padding: 1.2rem;
          color: white; border-bottom: none;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
          z-index: 10;
        }
        .gr-body {
          padding: 1.5rem; flex: 1; overflow-y: auto;
          background: transparent; display: flex; flex-direction: column;
        }
        .gr-section-card {
          background: #FFF8F5; border-radius: 16px; padding: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 20px;
          border: 1px solid rgba(0,0,0,0.02);
        }
        .gr-pattern-formula {
          display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
          margin-bottom: 16px;
        }
        .gr-pattern-chip {
          display: flex; flex-direction: column; align-items: center;
          padding: 8px 14px; border-radius: 10px; color: white;
          min-width: 48px; text-align: center; line-height: 1.2;
        }
        .gr-pattern-chip-label {
          font-size: 0.6rem; font-weight: 900; text-transform: uppercase;
          letter-spacing: 1px; opacity: 0.85; margin-bottom: 2px;
        }
        .gr-pattern-chip-text {
          font-size: 1rem; font-weight: 700;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .gr-pattern-arrow {
          font-size: 1.1rem; color: #aaa; font-weight: 300; flex-shrink: 0;
        }
        .gr-parts-inline {
          font-size: 1.2rem; line-height: 1.8; font-family: 'Noto Sans JP', sans-serif;
          flex-wrap: wrap;
        }
        .gr-part-span {
          display: inline; border-bottom: 2px solid; padding: 1px 3px;
          border-radius: 3px; cursor: default; position: relative;
        }
        .gr-table {
          width: 100%; border-collapse: collapse; font-size: 0.9rem;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .gr-table th {
          background: rgba(249, 115, 22, 0.12); color: #D97706;
          font-weight: 700; padding: 10px 12px; text-align: left;
          border-bottom: 2px solid rgba(249, 115, 22, 0.2);
          white-space: nowrap;
        }
        .gr-table td {
          padding: 9px 12px; border-bottom: 1px solid rgba(0,0,0,0.05);
          vertical-align: middle;
        }
        .gr-table tr:last-child td { border-bottom: none; }
        .gr-table tr:hover td { background: rgba(249,115,22,0.04); }
        .gr-table-wrapper { overflow-x: auto; border-radius: 10px; border: 1px solid rgba(0,0,0,0.06); }
        .gr-score-bar-track {
          height: 8px; background: #f1f2f6; border-radius: 4px; overflow: hidden;
          margin-bottom: 4px;
        }
        .gr-score-bar {
          height: 100%; background: linear-gradient(90deg, #F97316, #DC2626);
          border-radius: 4px; transition: width 0.4s ease;
        }
        .gr-score-label {
          font-size: 0.8rem; font-weight: 700; color: #888;
          text-align: right; margin-bottom: 12px;
        }
        .gr-choice-chip {
          display: inline-block; padding: 10px 18px; margin: 5px;
          border-radius: 50px; border: 2px solid #e0e0e0; background: #fff;
          cursor: pointer; font-size: 0.95rem; font-weight: 600;
          font-family: 'Noto Sans JP', sans-serif;
          transition: transform 0.1s, border-color 0.2s, background 0.2s;
          color: #2f3542;
        }
        .gr-choice-chip:active { transform: scale(0.95); }
        .gr-choice-chip:hover { border-color: #F97316; background: #FFF8F5; }
        .gr-choice-chip.correct { background: #d4edda; border-color: #28a745; color: #155724; }
        .gr-choice-chip.wrong { background: #f8d7da; border-color: #dc3545; color: #721c24; }
        .gr-choice-chip:disabled, .gr-choice-chip.answered { pointer-events: none; }
        .gr-slot {
          display: inline-block; min-width: 60px; min-height: 36px;
          border: 2px solid #FDCB6E; border-radius: 8px; background: #FFFBF0;
          text-align: center; vertical-align: middle; padding: 4px 10px;
          font-size: 1.1rem; font-family: 'Noto Sans JP', sans-serif;
          font-weight: 700; margin: 0 4px; line-height: 1.6;
          transition: background 0.2s, border-color 0.2s;
        }
        .gr-slot.correct { background: #d4edda; border-color: #28a745; color: #155724; }
        .gr-slot.wrong { background: #f8d7da; border-color: #dc3545; color: #721c24; }
        .gr-comparison-card {
          flex: 1; min-width: 240px; background: #fff; border-radius: 12px;
          padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          border-left: 4px solid #ccc; margin-bottom: 12px;
        }
        .gr-tip-callout {
          background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px;
          padding: 14px 16px; margin-top: 12px;
          font-size: 0.9rem; color: #92400E; line-height: 1.5;
        }
        .gr-context-tag {
          display: inline-block; font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1px;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(249,115,22,0.12); color: #C2410C;
          margin-bottom: 8px;
        }
        .gr-verb-badge {
          display: inline-block; font-size: 0.65rem; font-weight: 900;
          text-transform: uppercase; letter-spacing: 1px;
          padding: 2px 8px; border-radius: 20px; margin-left: 8px;
          vertical-align: middle;
        }
        .gr-verb-badge.ru { background: #EDE9FE; color: #7C3AED; }
        .gr-verb-badge.u  { background: #DBEAFE; color: #1D4ED8; }
        .gr-verb-badge.irr { background: #FEE2E2; color: #B91C1C; }
        .gr-collapsible-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.8rem; color: #888; font-weight: 700;
          padding: 4px 0; text-decoration: underline;
        }
        .gr-collapsible-content { margin-top: 8px; display: none; }
        .gr-collapsible-content.open { display: block; }
        .gr-tts-btn {
          background: none; border: 1px solid rgba(0,0,0,0.12); cursor: pointer;
          font-size: 0.8rem; padding: 4px 10px; border-radius: 20px;
          color: #888; float: right; margin-left: 8px;
          transition: background 0.2s;
        }
        .gr-tts-btn:hover { background: rgba(249,115,22,0.08); border-color: #F97316; color: #F97316; }
        .gr-drill-verb-display {
          text-align: center; padding: 20px 10px 8px;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .gr-drill-verb-main {
          font-size: 2rem; font-weight: 900; color: #2f3542; line-height: 1.2;
        }
        .gr-drill-verb-reading {
          font-size: 0.85rem; color: #888; margin-bottom: 8px;
        }
        .gr-drill-arrow-label {
          font-size: 1.1rem; color: #aaa; margin: 6px 0;
        }
        .gr-drill-target-label {
          font-size: 0.9rem; font-weight: 700; color: #F97316; margin-bottom: 10px;
        }
        .gr-choices-row {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 8px; padding: 0 8px 12px;
        }
        .gr-hint-box {
          font-size: 0.82rem; color: #555; background: #FFF8F5;
          border: 1px solid rgba(249,115,22,0.2); border-radius: 8px;
          padding: 8px 12px; margin: 8px 12px 0;
          display: none;
        }
        .gr-hint-box.visible { display: block; }
        .gr-transform-row {
          display: flex; align-items: stretch; gap: 10px;
          margin-bottom: 14px; flex-wrap: wrap;
        }
        .gr-transform-card {
          flex: 1; min-width: 120px; background: #fff; border-radius: 10px;
          border: 2px solid #eee; padding: 12px 14px;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .gr-transform-card .form-label {
          font-size: 0.65rem; font-weight: 900; text-transform: uppercase;
          letter-spacing: 1px; color: #aaa; margin-bottom: 6px;
        }
        .gr-transform-card .sentence {
          font-size: 1rem; font-weight: 600; color: #2f3542; min-height: 28px;
        }
        .gr-transform-card.correct { border-color: #28a745; background: #f0fff4; }
        .gr-transform-card.wrong { border-color: #dc3545; background: #fff5f5; }
        .gr-transform-arrow { font-size: 1.4rem; color: #ccc; align-self: center; flex-shrink: 0; }
        .gr-fill-sentence {
          font-size: 1.15rem; line-height: 2; font-family: 'Noto Sans JP', sans-serif;
          text-align: center; margin-bottom: 16px; color: #2f3542;
        }
        .gr-pattern-match-card {
          background: #fff; border-radius: 12px; border: 2px solid #eee;
          padding: 14px 16px; margin-bottom: 10px;
          transition: border-color 0.2s;
        }
        .gr-pattern-match-card.correct { border-color: #28a745; background: #f0fff4; }
        .gr-pattern-match-card.wrong { border-color: #dc3545; background: #fff5f5; }
        .gr-match-sentence {
          font-size: 1.05rem; font-family: 'Noto Sans JP', sans-serif;
          margin-bottom: 8px; color: #2f3542;
        }
        .gr-match-btns { display: flex; gap: 8px; }
        .gr-match-btn {
          padding: 6px 16px; border-radius: 8px; border: 2px solid #ddd;
          background: #fff; cursor: pointer; font-weight: 700; font-size: 0.9rem;
          transition: 0.15s;
        }
        .gr-match-btn.correct-btn { border-color: #28a745; color: #28a745; }
        .gr-match-btn.wrong-btn  { border-color: #dc3545; color: #dc3545; }
        .gr-explanation {
          font-size: 0.82rem; color: #555; margin-top: 8px;
          padding: 6px 10px; background: rgba(0,0,0,0.03); border-radius: 6px;
          display: none;
        }
        .gr-explanation.visible { display: block; }
        .gr-per-type-breakdown {
          font-size: 0.82rem; color: #666; background: #f8f8f8;
          border-radius: 8px; padding: 10px 14px; margin-bottom: 10px;
        }
        .gr-per-type-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .gr-nav-btn-gr.next { background: linear-gradient(135deg, #F97316, #DC2626); }
        .gr-intro-icon { font-size: 3.5rem; margin-bottom: 10px; text-align: center; }
        .gr-intro-title { font-size: 1.4rem; font-weight: 900; color: #2f3542; margin-bottom: 8px; text-align: center; }
        .gr-intro-summary { font-size: 0.95rem; color: #555; text-align: center; margin-bottom: 14px; }
        .gr-objectives-list { list-style: none; padding: 0; margin: 0; }
        .gr-objectives-list li {
          padding: 6px 0 6px 24px; position: relative; font-size: 0.9rem; color: #444;
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }
        .gr-objectives-list li:last-child { border-bottom: none; }
        .gr-objectives-list li::before { content: '☐'; position: absolute; left: 0; color: #F97316; font-weight: 700; }
        .gr-section-title { font-weight: 900; font-size: 1rem; color: #2f3542; margin-bottom: 12px; }
        .gr-meaning-text { font-size: 1.1rem; font-weight: 700; color: #2f3542; margin-bottom: 8px; }
        .gr-explanation-text { font-size: 0.9rem; color: #555; line-height: 1.6; margin-bottom: 12px; }
        .gr-example-card {
          background: #fff; border-radius: 10px; border: 1px solid rgba(0,0,0,0.06);
          padding: 14px 16px; margin-bottom: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .gr-example-en { font-size: 0.85rem; color: #888; margin-top: 6px; }
        .gr-notes-list { list-style: none; padding: 0; margin: 0; }
        .gr-notes-list li {
          padding: 4px 0 4px 18px; position: relative; font-size: 0.85rem; color: #555;
        }
        .gr-notes-list li::before { content: '•'; position: absolute; left: 0; color: #F97316; }
        .gr-table-note {
          font-size: 0.82rem; color: #777; background: #FFF8F5;
          border-radius: 8px; padding: 8px 12px; margin-top: 10px;
          border-left: 3px solid #FDCB6E;
        }
        .gr-stem { font-weight: 900; }
        .gr-ending { font-weight: 900; }
        @keyframes gr-flash-green {
          0%   { background: #d4edda; }
          100% { background: transparent; }
        }
        @keyframes gr-flash-red {
          0%   { background: #f8d7da; }
          100% { background: transparent; }
        }
        .gr-flash-green { animation: gr-flash-green 0.6s ease; }
        .gr-flash-red   { animation: gr-flash-red 0.6s ease; }
        .gr-completion-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: #d4edda; color: #155724; border-radius: 20px;
          font-size: 0.75rem; font-weight: 700; padding: 2px 8px; margin-left: 6px;
        }
        .gr-lock-badge {
          font-size: 0.7rem; color: #aaa; font-weight: 600; margin-top: 2px;
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

    function esc(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function getCdnUrl(filepath) {
      return window.getAssetUrl(REPO_CONFIG, filepath);
    }

    // --- TTS Helpers ---
    function speakParts(parts) {
      const text = (parts || []).map(p => p.text).join('');
      if (window.JPShared && window.JPShared.tts && window.JPShared.tts.speak) {
        window.JPShared.tts.speak(text);
      }
    }

    function speakText(text) {
      if (window.JPShared && window.JPShared.tts && window.JPShared.tts.speak) {
        window.JPShared.tts.speak(text);
      }
    }

    // --- Parts Renderer (color-coded spans) ---
    function renderParts(parts) {
      return (parts || []).map(part => {
        const color = GRAMMAR_COLORS[part.role] || '#666';
        const bg = color + '26';
        let html = '<span class="gr-part-span" style="background:' + bg + ';border-bottom:2px solid ' + color + ';padding:1px 3px;border-radius:3px;cursor:default;"';
        if (part.gloss) html += ' data-gloss="' + esc(part.gloss) + '" title="' + esc(part.gloss) + '"';
        html += '>' + esc(part.text) + '</span>';
        return html;
      }).join('');
    }

    // --- TTS Button ---
    function makeTtsBtn(onClickFn) {
      const btn = el('button', 'gr-tts-btn', '🔊');
      btn.title = 'Listen';
      btn.onclick = function(e) { e.stopPropagation(); onClickFn(); };
      return btn;
    }

    // --- Collapsible Section ---
    function makeCollapsible(label, contentEl) {
      const wrap = el('div', '');
      const btn = el('button', 'gr-collapsible-btn', label);
      const body = el('div', 'gr-collapsible-content');
      body.appendChild(contentEl);
      btn.onclick = function() {
        body.classList.toggle('open');
        btn.textContent = body.classList.contains('open') ? label.replace('▶', '▼') : label.replace('▼', '▶');
      };
      wrap.appendChild(btn);
      wrap.appendChild(body);
      return wrap;
    }

    // --- Progress Helpers ---
    function progressSet(key, val) {
      if (window.JPShared && window.JPShared.progress && typeof window.JPShared.progress.set === 'function') {
        window.JPShared.progress.set(key, val);
      } else {
        try { localStorage.setItem('jp-grammar-' + key, JSON.stringify(val)); } catch(e) {}
      }
    }

    function progressGet(key) {
      if (window.JPShared && window.JPShared.progress && typeof window.JPShared.progress.get === 'function') {
        return window.JPShared.progress.get(key);
      } else {
        try {
          const raw = localStorage.getItem('jp-grammar-' + key);
          return raw !== null ? JSON.parse(raw) : undefined;
        } catch(e) { return undefined; }
      }
    }

    function markSectionSeen(id, idx) {
      progressSet('grammar_' + id + '_section_' + idx, true);
    }

    function markGrammarComplete(id, score) {
      progressSet('grammar_' + id + '_complete', true);
      if (score !== undefined) progressSet('grammar_' + id + '_drill_score', score);
    }

    function isGrammarComplete(id) {
      return !!progressGet('grammar_' + id + '_complete');
    }

    // --- Resource Loading (same pattern as Lesson.js) ---
    async function loadResources() {
      const manifest = await window.getManifest(REPO_CONFIG);
      const conjUrl     = getCdnUrl(manifest.globalFiles.conjugationRules);
      const counterUrl  = getCdnUrl(manifest.globalFiles.counterRules);
      const particleUrl = getCdnUrl(manifest.shared.particles);
      console.log('[Grammar] Conjugation URL:', conjUrl);
      console.log('[Grammar] Counter URL:', counterUrl);
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

    // --- RANK CELEBRATION ---
    const SCORE_RANKS = [
      { min: 0,   msg: '頑張れ！',     sub: 'Keep Going!',    colors: ['#a4b0be','#747d8c','#57606f'],                              particles: 8  },
      { min: 50,  msg: 'いいね！',     sub: 'Nice!',          colors: ['#FFD700','#FFA500','#FFE066'],                              particles: 15 },
      { min: 60,  msg: 'すごい！',     sub: 'Amazing!',       colors: ['#FF6B35','#FF4500','#FF8C00'],                              particles: 24 },
      { min: 70,  msg: 'さすが！',     sub: 'Impressive!',    colors: ['#FF1493','#FF69B4','#FF85C8'],                              particles: 35 },
      { min: 80,  msg: 'すばらしい！', sub: 'Wonderful!',     colors: ['#00E5FF','#00BCD4','#4DD0E1'],                              particles: 45 },
      { min: 90,  msg: '天才！',       sub: 'Genius!',        colors: ['#8B5CF6','#A78BFA','#7C3AED'],                              particles: 55 },
      { min: 100, msg: '神！',         sub: 'Godlike!',       colors: ['#FF1493','#FFD700','#00E5FF','#8B5CF6','#2ED573','#FF6B35'], particles: 70 },
    ];

    function launchHanabi(rank, targetEl) {
      targetEl.style.position = 'relative';
      const container = document.createElement('div');
      container.className = 'jp-hanabi-container';
      targetEl.appendChild(container);
      const w = targetEl.offsetWidth || 300;
      const h = targetEl.offsetHeight || 200;
      const burstPoints = rank.particles >= 55 ? [
        { x: w * 0.3, y: h * 0.25 }, { x: w * 0.7, y: h * 0.3 }, { x: w * 0.5, y: h * 0.15 }
      ] : rank.particles >= 35 ? [
        { x: w * 0.35, y: h * 0.25 }, { x: w * 0.65, y: h * 0.25 }
      ] : [{ x: w / 2, y: h * 0.25 }];
      const perBurst = Math.ceil(rank.particles / burstPoints.length);
      burstPoints.forEach((bp, bIdx) => {
        for (let i = 0; i < perBurst; i++) {
          const p = document.createElement('div');
          p.className = 'jp-hanabi-particle';
          const angle = (Math.PI * 2 * i / perBurst) + (Math.random() * 0.4 - 0.2);
          const dist = 50 + Math.random() * 100;
          const color = rank.colors[Math.floor(Math.random() * rank.colors.length)];
          const size = 3 + Math.random() * 5;
          const delay = bIdx * 150 + Math.random() * 100;
          const dx = Math.cos(angle) * dist;
          const dy = Math.sin(angle) * dist + 40;
          p.style.cssText = 'left:' + bp.x + 'px;top:' + bp.y + 'px;width:' + size + 'px;height:' + size + 'px;background:' + color + ';box-shadow:0 0 ' + size + 'px ' + color + ';transition:transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94),opacity 0.9s ease-out;transition-delay:' + delay + 'ms;';
          container.appendChild(p);
          requestAnimationFrame(() => requestAnimationFrame(() => {
            p.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
            p.style.opacity = '0';
          }));
        }
      });
      const msgEl = document.createElement('div');
      msgEl.className = 'jp-hanabi-msg';
      msgEl.innerHTML = '<div class="jp-hanabi-jp" style="color:' + rank.colors[0] + '">' + rank.msg + '</div><div class="jp-hanabi-en">' + rank.sub + '</div>';
      container.appendChild(msgEl);
      setTimeout(() => container.remove(), 3000);
    }

    // --- Modal ---
    if (window.JPShared && window.JPShared.termModal && window.JPShared.termModal.inject) {
      window.JPShared.termModal.inject();
    }

    // =========================================================================
    // SECTION RENDERERS
    // =========================================================================

    // --- Pattern Formula Builder ---
    function buildPatternFormula(pattern) {
      const row = el('div', 'gr-pattern-formula');
      (pattern || []).forEach((chip, idx) => {
        if (idx > 0) {
          row.appendChild(el('span', 'gr-pattern-arrow', '→'));
        }
        const color = GRAMMAR_COLORS[chip.color] || '#999';
        const chipEl = el('div', 'gr-pattern-chip');
        chipEl.style.background = color;
        chipEl.innerHTML = '<div class="gr-pattern-chip-label">' + esc(chip.label) + '</div><div class="gr-pattern-chip-text">' + esc(chip.text) + '</div>';
        row.appendChild(chipEl);
      });
      return row;
    }

    // --- renderGrammarIntro ---
    function renderGrammarIntro(sec) {
      const card = el('div', 'gr-section-card');

      // Icon
      if (sec.icon) {
        card.appendChild(el('div', 'gr-intro-icon', sec.icon));
      }

      // Title
      card.appendChild(el('div', 'gr-intro-title', esc(sec.title)));

      // Summary
      if (sec.summary) {
        card.appendChild(el('div', 'gr-intro-summary', esc(sec.summary)));
      }

      // Why it matters callout
      if (sec.whyItMatters) {
        const callout = el('div', 'gr-tip-callout');
        callout.innerHTML = '<strong>💡 Why it matters:</strong> ' + esc(sec.whyItMatters);
        card.appendChild(callout);
      }

      // You will learn
      if (sec.youWillLearn && sec.youWillLearn.length > 0) {
        const heading = el('div', '', '');
        heading.style.cssText = 'font-weight:700; font-size:0.85rem; color:#888; text-transform:uppercase; letter-spacing:1px; margin: 14px 0 8px;';
        heading.textContent = 'You will learn';
        card.appendChild(heading);
        const list = el('ul', 'gr-objectives-list');
        sec.youWillLearn.forEach(obj => {
          list.appendChild(el('li', '', esc(obj)));
        });
        card.appendChild(list);
      }

      // Prerequisites nudge
      if (sec.prerequisites && sec.prerequisites.length > 0) {
        const incompletePrereqs = sec.prerequisites.filter(p => !isGrammarComplete(p));
        if (incompletePrereqs.length > 0) {
          const nudge = el('div', '');
          nudge.style.cssText = 'margin-top:12px; font-size:0.82rem; color:#888; background:#f8f8f8; border-radius:8px; padding:8px 12px;';
          nudge.textContent = '📌 Tip: Complete ' + incompletePrereqs.join(', ') + ' first for the best results.';
          card.appendChild(nudge);
        }
      }

      return card;
    }

    // --- renderGrammarRule ---
    function renderGrammarRule(sec) {
      const wrap = el('div', '');

      const card = el('div', 'gr-section-card');

      // Pattern formula
      if (sec.pattern && sec.pattern.length > 0) {
        card.appendChild(buildPatternFormula(sec.pattern));
      }

      // Meaning
      if (sec.meaning) {
        card.appendChild(el('div', 'gr-meaning-text', esc(sec.meaning)));
      }

      // Explanation
      if (sec.explanation) {
        card.appendChild(el('div', 'gr-explanation-text', esc(sec.explanation)));
      }

      // Notes (collapsible)
      if (sec.notes && sec.notes.length > 0) {
        const notesList = el('ul', 'gr-notes-list');
        sec.notes.forEach(n => notesList.appendChild(el('li', '', esc(n))));
        card.appendChild(makeCollapsible('▶ 📝 Notes', notesList));
      }

      wrap.appendChild(card);

      // Examples
      (sec.examples || []).forEach(ex => {
        const exCard = el('div', 'gr-example-card');

        // Header row: TTS button
        const headerRow = el('div', '');
        headerRow.style.cssText = 'display:flex; justify-content:flex-end; margin-bottom:6px;';
        headerRow.appendChild(makeTtsBtn(() => speakParts(ex.parts)));
        exCard.appendChild(headerRow);

        // Color-coded parts
        const partsDiv = el('div', 'gr-parts-inline');
        partsDiv.innerHTML = renderParts(ex.parts);
        exCard.appendChild(partsDiv);

        // English
        if (ex.en) {
          exCard.appendChild(el('div', 'gr-example-en', esc(ex.en)));
        }

        // Breakdown (collapsible)
        if (ex.breakdown) {
          const bdEl = el('div', '');
          bdEl.style.cssText = 'font-size:0.8rem; color:#777; padding:4px 8px; background:#f8f8f8; border-radius:6px;';
          bdEl.textContent = ex.breakdown;
          exCard.appendChild(makeCollapsible('▶ Breakdown', bdEl));
        }

        wrap.appendChild(exCard);
      });

      return wrap;
    }

    // --- renderGrammarTable ---
    function renderGrammarTable(sec) {
      const wrap = el('div', '');

      const card = el('div', 'gr-section-card');

      if (sec.title) {
        card.appendChild(el('div', 'gr-section-title', esc(sec.title)));
      }
      if (sec.description) {
        card.appendChild(el('div', 'gr-explanation-text', esc(sec.description)));
      }

      wrap.appendChild(card);

      // Table
      const tableWrap = el('div', 'gr-table-wrapper');
      const table = el('table', 'gr-table');

      // Header row
      if (sec.headers && sec.headers.length > 0) {
        const thead = el('thead', '');
        const tr = el('tr', '');
        sec.headers.forEach(h => tr.appendChild(el('th', '', esc(h))));
        if (sec.tableType === 'conjugation') tr.appendChild(el('th', '', 'Meaning'));
        thead.appendChild(tr);
        table.appendChild(thead);
      }

      // Body rows
      const tbody = el('tbody', '');
      (sec.rows || []).forEach(row => {
        const tr = el('tr', '');

        // Row label
        const labelTd = el('td', '');
        labelTd.style.cssText = 'font-weight:700; color:#555; white-space:nowrap; font-size:0.85rem;';
        labelTd.textContent = row.label || '';
        tr.appendChild(labelTd);

        // Cells
        (row.cells || []).forEach((cell, cIdx) => {
          const td = el('td', '');

          if (sec.tableType === 'conjugation' && sec.highlight) {
            // Attempt stem/ending split
            if (typeof cell === 'object' && cell.stem !== undefined) {
              // Explicit split provided in JSON
              const stemSpan = el('span', 'gr-stem');
              stemSpan.style.color = sec.highlight.stem || '#0984E3';
              stemSpan.textContent = cell.stem;
              const endSpan = el('span', 'gr-ending');
              endSpan.style.color = sec.highlight.ending || '#D63031';
              endSpan.textContent = cell.ending;
              td.appendChild(stemSpan);
              td.appendChild(endSpan);
            } else {
              // Auto-split: find shared prefix with the first row's same cell
              const cellStr = String(cell);
              const firstRowCells = sec.rows[0] && sec.rows[0].cells;
              const refCell = firstRowCells ? String(firstRowCells[cIdx] || '') : '';
              let prefixLen = 0;
              while (prefixLen < cellStr.length && prefixLen < refCell.length && cellStr[prefixLen] === refCell[prefixLen]) {
                prefixLen++;
              }
              if (prefixLen > 0 && prefixLen < cellStr.length) {
                const stemSpan = el('span', 'gr-stem');
                stemSpan.style.color = sec.highlight.stem || '#0984E3';
                stemSpan.textContent = cellStr.slice(0, prefixLen);
                const endSpan = el('span', 'gr-ending');
                endSpan.style.color = sec.highlight.ending || '#D63031';
                endSpan.textContent = cellStr.slice(prefixLen);
                td.appendChild(stemSpan);
                td.appendChild(endSpan);
              } else {
                td.textContent = cellStr;
              }
            }
            // TTS on tap
            td.style.cursor = 'pointer';
            td.title = 'Listen';
            td.onclick = function() { speakText(typeof cell === 'object' ? (cell.stem || '') + (cell.ending || '') : String(cell)); };
          } else {
            td.innerHTML = '<span style="font-family:\'Noto Sans JP\',sans-serif;">' + esc(typeof cell === 'object' ? JSON.stringify(cell) : String(cell)) + '</span>';
          }

          tr.appendChild(td);
        });

        // Meaning column for conjugation tables
        if (sec.tableType === 'conjugation' && row.meaning) {
          const mTd = el('td', '');
          mTd.style.cssText = 'color:#aaa; font-style:italic; font-size:0.82rem;';
          mTd.textContent = row.meaning;
          tr.appendChild(mTd);
        }

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      tableWrap.appendChild(table);
      wrap.appendChild(tableWrap);

      // Notes below table
      if (sec.notes && sec.notes.length > 0) {
        sec.notes.forEach(n => {
          const note = el('div', 'gr-table-note', esc(n));
          wrap.appendChild(note);
        });
      }

      return wrap;
    }

    // --- renderGrammarComparison ---
    function renderGrammarComparison(sec) {
      const wrap = el('div', '');

      if (sec.title) {
        const title = el('div', 'gr-section-title', esc(sec.title));
        title.style.marginBottom = '16px';
        wrap.appendChild(title);
      }

      const cardsRow = el('div', '');
      cardsRow.style.cssText = 'display:flex; gap:12px; flex-wrap:wrap; margin-bottom:12px;';

      (sec.items || []).forEach(item => {
        const color = GRAMMAR_COLORS[item.color] || '#aaa';
        const card = el('div', 'gr-comparison-card');
        card.style.borderLeftColor = color;

        // Label with colored dot
        const labelRow = el('div', '');
        labelRow.style.cssText = 'display:flex; align-items:center; margin-bottom:10px;';
        const dot = el('span', '');
        dot.style.cssText = 'width:10px; height:10px; border-radius:50%; background:' + color + '; display:inline-block; margin-right:8px; flex-shrink:0;';
        labelRow.appendChild(dot);
        const labelEl = el('span', '');
        labelEl.style.cssText = 'font-weight:900; font-size:0.9rem; color:#2f3542;';
        labelEl.textContent = item.label || '';
        labelRow.appendChild(labelEl);
        card.appendChild(labelRow);

        // Points list
        if (item.points && item.points.length > 0) {
          const list = el('ul', 'gr-notes-list');
          item.points.forEach(pt => list.appendChild(el('li', '', esc(pt))));
          card.appendChild(list);
        }

        // Example sentence
        if (item.example) {
          const exDiv = el('div', '');
          exDiv.style.cssText = 'margin-top:10px; padding-top:10px; border-top:1px solid rgba(0,0,0,0.06);';

          const ttsRow = el('div', '');
          ttsRow.style.cssText = 'display:flex; justify-content:flex-end; margin-bottom:4px;';
          ttsRow.appendChild(makeTtsBtn(() => speakParts(item.example.parts)));
          exDiv.appendChild(ttsRow);

          const partsDiv = el('div', 'gr-parts-inline');
          partsDiv.innerHTML = renderParts(item.example.parts);
          exDiv.appendChild(partsDiv);

          if (item.example.en) {
            exDiv.appendChild(el('div', 'gr-example-en', esc(item.example.en)));
          }
          card.appendChild(exDiv);
        }

        cardsRow.appendChild(card);
      });

      wrap.appendChild(cardsRow);

      // Tip callout
      if (sec.tip) {
        const tip = el('div', 'gr-tip-callout');
        tip.innerHTML = '<strong>💡</strong> ' + esc(sec.tip);
        wrap.appendChild(tip);
      }

      return wrap;
    }

    // --- renderAnnotatedExample ---
    function renderAnnotatedExample(sec) {
      const wrap = el('div', '');

      if (sec.title) {
        wrap.appendChild(el('div', 'gr-section-title', esc(sec.title)));
      }

      (sec.examples || []).forEach(ex => {
        const card = el('div', 'gr-example-card');

        // Context tag
        if (ex.context) {
          card.appendChild(el('div', 'gr-context-tag', esc(ex.context)));
        }

        // TTS button
        const ttsRow = el('div', '');
        ttsRow.style.cssText = 'display:flex; justify-content:flex-end; margin-bottom:4px;';
        ttsRow.appendChild(makeTtsBtn(() => speakParts(ex.parts)));
        card.appendChild(ttsRow);

        // Color-coded parts
        const partsDiv = el('div', 'gr-parts-inline');
        partsDiv.innerHTML = renderParts(ex.parts);
        card.appendChild(partsDiv);

        // English
        if (ex.en) {
          card.appendChild(el('div', 'gr-example-en', esc(ex.en)));
        }

        // Note (collapsible)
        if (ex.note) {
          const noteEl = el('div', '');
          noteEl.style.cssText = 'font-size:0.82rem; color:#777;';
          noteEl.textContent = ex.note;
          card.appendChild(makeCollapsible('▶ Why?', noteEl));
        }

        wrap.appendChild(card);
      });

      return wrap;
    }

    // --- renderConjugationDrill ---
    function renderConjugationDrill(sec) {
      const wrap = el('div', '');

      const items = sec.items || [];
      if (items.length === 0) return wrap;

      // Per-section state
      let drillIdx = 0;
      let secCorrect = 0;
      let secTotal = items.length;
      const secAnswered = new Set();
      // Per-type tracking: { ru: [c,t], u: [c,t], irr: [c,t] }
      const typeBreakdown = { ru: [0, 0], u: [0, 0], irr: [0, 0] };
      items.forEach(item => {
        const t = (item.type === 'ru') ? 'ru' : (item.type === 'u') ? 'u' : 'irr';
        typeBreakdown[t][1]++;
      });

      function getScorePct() {
        return secTotal > 0 ? Math.round(secAnswered.size > 0 ? (secCorrect / secAnswered.size * 100) : 0) : 100;
      }

      function renderDrillItem() {
        wrap.innerHTML = '';

        // Score bar
        const scorePct = secTotal > 0 ? Math.round(secAnswered.size / secTotal * 100) : 0;
        const scoreDiv = el('div', '');
        scoreDiv.style.cssText = 'margin-bottom:8px;';
        scoreDiv.innerHTML = '<div class="gr-score-bar-track"><div class="gr-score-bar" style="width:' + scorePct + '%;"></div></div><div class="gr-score-label">' + secAnswered.size + ' / ' + secTotal + ' answered &nbsp;|&nbsp; ' + secCorrect + ' correct</div>';
        wrap.appendChild(scoreDiv);

        if (drillIdx >= items.length) {
          // Summary screen
          const summaryCard = el('div', 'gr-section-card');
          summaryCard.style.textAlign = 'center';
          summaryCard.style.position = 'relative';

          const finalPct = secAnswered.size > 0 ? Math.round(secCorrect / secAnswered.size * 100) : 0;
          const rank = [...SCORE_RANKS].reverse().find(r => finalPct >= r.min) || SCORE_RANKS[0];

          summaryCard.innerHTML = '<h3 style="margin-bottom:10px;">Drill Complete!</h3>' +
            '<div style="font-size:2.5rem;font-weight:900;color:' + rank.colors[0] + ';line-height:1.1;">' + rank.msg + '</div>' +
            '<div style="font-size:0.95rem;color:#747d8c;font-weight:600;margin:4px 0 12px;">' + rank.sub + '</div>' +
            '<div style="font-size:2rem;font-weight:900;color:#F97316;">' + finalPct + '%</div>' +
            '<div style="font-size:0.85rem;color:#888;margin-top:4px;">' + secCorrect + ' / ' + secAnswered.size + ' correct</div>';

          // Per-type breakdown
          const breakdown = el('div', 'gr-per-type-breakdown');
          const typeLabels = { ru: 'RU-verbs', u: 'U-verbs', irr: 'Irregular' };
          Object.keys(typeBreakdown).forEach(t => {
            const [c, total] = typeBreakdown[t];
            if (total > 0) {
              const row = el('div', 'gr-per-type-row');
              row.innerHTML = '<span>' + typeLabels[t] + '</span><span style="font-weight:700;">' + c + ' / ' + total + '</span>';
              breakdown.appendChild(row);
            }
          });
          summaryCard.appendChild(breakdown);

          wrap.appendChild(summaryCard);

          // Save conjugation score to progress
          progressSet('grammar_' + (grammarId || 'unknown') + '_conj_score', finalPct);
          progressSet('grammar_' + (grammarId || 'unknown') + '_conj_breakdown', {
            ru: typeBreakdown.ru, u: typeBreakdown.u, irr: typeBreakdown.irr
          });

          if (finalPct >= 80) {
            launchHanabi(rank, summaryCard);
          }
          return;
        }

        const item = items[drillIdx];
        const verbType = (item.type === 'ru') ? 'ru' : (item.type === 'u') ? 'u' : 'irr';
        const typeLabel = (item.type === 'ru') ? 'RU' : (item.type === 'u') ? 'U' : 'IRR';
        const itemKey = 'conj_' + drillIdx + '_' + item.verb;
        let answered = false;

        const card = el('div', 'gr-section-card');

        // Verb display
        const verbDiv = el('div', 'gr-drill-verb-display');
        verbDiv.innerHTML = '<div class="gr-drill-verb-main">' + esc(item.verb) + ' <span class="gr-verb-badge ' + verbType + '">' + typeLabel + '</span></div>' +
          (item.reading ? '<div class="gr-drill-verb-reading">' + esc(item.reading) + '</div>' : '') +
          '<div class="gr-drill-arrow-label">→</div>' +
          '<div class="gr-drill-target-label">' + esc(item.targetForm || '') + '</div>';
        card.appendChild(verbDiv);

        // Hint box (hidden initially)
        const hintBox = el('div', 'gr-hint-box', item.hint ? '💡 ' + esc(item.hint) : '');

        // Choices
        const choicesRow = el('div', 'gr-choices-row');
        const shuffled = [...item.choices].sort(() => Math.random() - 0.5);

        shuffled.forEach(choice => {
          const chip = el('button', 'gr-choice-chip', esc(choice));
          chip.onclick = function() {
            if (answered) return;
            answered = true;

            if (choice === item.answer) {
              chip.classList.add('correct');
              if (!secAnswered.has(itemKey)) {
                secAnswered.add(itemKey);
                secCorrect++;
                const t = verbType;
                typeBreakdown[t][0]++;
              }
              hintBox.textContent = '✓ ' + (item.hint || item.answer);
              hintBox.classList.add('visible');
              speakText(item.answer || '');
              setTimeout(() => {
                drillIdx++;
                renderDrillItem();
              }, 1500);
            } else {
              chip.classList.add('wrong');
              if (!secAnswered.has(itemKey)) secAnswered.add(itemKey);
              hintBox.classList.add('visible');
              // Highlight correct
              Array.from(choicesRow.children).forEach(c => {
                if (c.textContent === item.answer) c.classList.add('correct');
                c.classList.add('answered');
              });
              // Student must tap correct to advance
              const correctBtn = Array.from(choicesRow.children).find(c => c.textContent === item.answer);
              if (correctBtn) {
                correctBtn.style.pointerEvents = 'auto';
                correctBtn.onclick = function() {
                  speakText(item.answer || '');
                  setTimeout(() => {
                    drillIdx++;
                    renderDrillItem();
                  }, 1200);
                };
              }
            }
          };
          choicesRow.appendChild(chip);
        });

        card.appendChild(choicesRow);
        card.appendChild(hintBox);

        // Navigation within drill
        const navRow = el('div', '');
        navRow.style.cssText = 'display:flex; justify-content:space-between; margin-top:10px; padding: 0 4px;';
        const prevBtn = el('button', 'jp-nav-btn prev', 'Prev');
        prevBtn.disabled = (drillIdx === 0);
        prevBtn.onclick = function() { if (drillIdx > 0) { drillIdx--; renderDrillItem(); } };
        const skipBtn = el('button', 'jp-nav-btn next', drillIdx < items.length - 1 ? 'Skip →' : 'Finish');
        skipBtn.style.background = 'linear-gradient(135deg, #F97316, #DC2626)';
        skipBtn.onclick = function() {
          if (!secAnswered.has(itemKey)) secAnswered.add(itemKey);
          drillIdx++;
          renderDrillItem();
        };
        navRow.appendChild(prevBtn);
        navRow.appendChild(el('span', '', (drillIdx + 1) + ' / ' + items.length));
        navRow.appendChild(skipBtn);
        card.appendChild(navRow);

        wrap.appendChild(card);
      }

      renderDrillItem();
      return wrap;
    }

    // --- renderPatternMatch ---
    function renderPatternMatch(sec) {
      const wrap = el('div', '');

      // Pattern formula at top
      if (sec.pattern) {
        const patternCard = el('div', 'gr-section-card');
        patternCard.style.marginBottom = '12px';
        const labelEl = el('div', '');
        labelEl.style.cssText = 'font-size:0.75rem; font-weight:700; color:#aaa; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;';
        labelEl.textContent = 'Pattern';
        patternCard.appendChild(labelEl);
        const formulaEl = el('div', '');
        formulaEl.style.cssText = 'font-size:1rem; font-weight:700; color:#2f3542; font-family:\'Noto Sans JP\',sans-serif;';
        formulaEl.textContent = sec.pattern;
        patternCard.appendChild(formulaEl);
        wrap.appendChild(patternCard);
      }

      // Score tracking
      let pmCorrect = 0;
      let pmTotal = (sec.items || []).length;
      let pmAnswered = 0;

      const scoreEl = el('div', 'gr-score-label', '0 / ' + pmTotal + ' answered');
      const barTrack = el('div', 'gr-score-bar-track');
      const bar = el('div', 'gr-score-bar');
      bar.style.width = '0%';
      barTrack.appendChild(bar);

      const scoreWrap = el('div', '');
      scoreWrap.appendChild(barTrack);
      scoreWrap.appendChild(scoreEl);
      wrap.appendChild(scoreWrap);

      function updateScore() {
        const pct = pmTotal > 0 ? Math.round(pmAnswered / pmTotal * 100) : 0;
        bar.style.width = pct + '%';
        scoreEl.textContent = pmAnswered + ' / ' + pmTotal + ' answered | ' + pmCorrect + ' correct';
      }

      (sec.items || []).forEach((item, idx) => {
        const card = el('div', 'gr-pattern-match-card');

        // TTS + sentence row
        const sentRow = el('div', '');
        sentRow.style.cssText = 'display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;';
        const sentEl = el('div', 'gr-match-sentence', esc(item.sentence));
        sentRow.appendChild(sentEl);
        sentRow.appendChild(makeTtsBtn(() => speakText(item.sentence)));
        card.appendChild(sentRow);

        // Buttons
        const btnsRow = el('div', 'gr-match-btns');
        const correctBtn = el('button', 'gr-match-btn', '✓ Correct');
        const wrongBtn = el('button', 'gr-match-btn', '✗ Incorrect');
        btnsRow.appendChild(correctBtn);
        btnsRow.appendChild(wrongBtn);
        card.appendChild(btnsRow);

        // Explanation
        const expl = el('div', 'gr-explanation', esc(item.explanation || ''));
        card.appendChild(expl);

        let answered = false;

        function handleAnswer(userSaysCorrect) {
          if (answered) return;
          answered = true;
          pmAnswered++;

          const isCorrect = (userSaysCorrect === item.correct);
          if (isCorrect) {
            pmCorrect++;
            card.classList.add('correct');
            (userSaysCorrect ? correctBtn : wrongBtn).classList.add('correct-btn');
          } else {
            card.classList.add('wrong');
            (userSaysCorrect ? correctBtn : wrongBtn).classList.add('wrong-btn');
            // Highlight correct answer button
            (item.correct ? correctBtn : wrongBtn).classList.add('correct-btn');
          }

          expl.classList.add('visible');
          correctBtn.disabled = true;
          wrongBtn.disabled = true;
          updateScore();
        }

        correctBtn.onclick = () => handleAnswer(true);
        wrongBtn.onclick = () => handleAnswer(false);

        wrap.appendChild(card);
      });

      return wrap;
    }

    // --- renderSentenceTransform ---
    function renderSentenceTransform(sec) {
      const wrap = el('div', '');

      const items = sec.items || [];
      if (items.length === 0) return wrap;

      // Instructions
      if (sec.instructions) {
        const instrEl = el('div', '');
        instrEl.style.cssText = 'font-size:0.85rem; color:#777; margin-bottom:12px; font-style:italic;';
        instrEl.textContent = sec.instructions;
        wrap.appendChild(instrEl);
      }

      let stIdx = 0;
      let stCorrect = 0;
      const stAnswered = new Set();

      function renderSTItem() {
        // Remove all children except instructions (first child)
        while (wrap.children.length > 1) wrap.removeChild(wrap.lastChild);

        // Score bar
        const pct = items.length > 0 ? Math.round(stAnswered.size / items.length * 100) : 0;
        const scoreDiv = el('div', '');
        scoreDiv.innerHTML = '<div class="gr-score-bar-track"><div class="gr-score-bar" style="width:' + pct + '%;"></div></div><div class="gr-score-label">' + stAnswered.size + ' / ' + items.length + ' &nbsp;|&nbsp; ' + stCorrect + ' correct</div>';
        wrap.appendChild(scoreDiv);

        if (stIdx >= items.length) {
          // Summary
          const finalPct = stAnswered.size > 0 ? Math.round(stCorrect / stAnswered.size * 100) : 0;
          const rank = [...SCORE_RANKS].reverse().find(r => finalPct >= r.min) || SCORE_RANKS[0];
          const summCard = el('div', 'gr-section-card');
          summCard.style.cssText = 'text-align:center; position:relative;';
          summCard.innerHTML = '<h3 style="margin-bottom:10px;">Transform Complete!</h3>' +
            '<div style="font-size:2.5rem;font-weight:900;color:' + rank.colors[0] + ';">' + rank.msg + '</div>' +
            '<div style="color:#747d8c;font-weight:600;margin:4px 0 12px;">' + rank.sub + '</div>' +
            '<div style="font-size:2rem;font-weight:900;color:#F97316;">' + finalPct + '%</div>' +
            '<div style="font-size:0.85rem;color:#888;">' + stCorrect + ' / ' + stAnswered.size + ' correct</div>';
          wrap.appendChild(summCard);
          if (finalPct >= 80) launchHanabi(rank, summCard);
          return;
        }

        const item = items[stIdx];
        const itemKey = 'st_' + stIdx;
        let answered = false;

        const card = el('div', 'gr-section-card');

        // Transform display
        const transRow = el('div', 'gr-transform-row');

        const fromCard = el('div', 'gr-transform-card');
        fromCard.innerHTML = '<div class="form-label">' + esc(item.givenLabel || 'Given') + '</div><div class="sentence">' + esc(item.given) + '</div>';

        const arrowEl = el('div', 'gr-transform-arrow', '→');

        const toCard = el('div', 'gr-transform-card');
        toCard.id = 'gr-to-card-' + stIdx;
        toCard.innerHTML = '<div class="form-label">' + esc(item.targetLabel || 'Transform to') + '</div><div class="sentence" id="gr-to-sentence-' + stIdx + '">___</div>';

        transRow.appendChild(fromCard);
        transRow.appendChild(arrowEl);
        transRow.appendChild(toCard);
        card.appendChild(transRow);

        // TTS for given
        const ttsRow = el('div', '');
        ttsRow.style.cssText = 'display:flex; justify-content:flex-end; margin-bottom:8px;';
        ttsRow.appendChild(makeTtsBtn(() => speakText(item.given)));
        card.appendChild(ttsRow);

        // Choices
        const choicesRow = el('div', 'gr-choices-row');
        const shuffled = [...item.choices].sort(() => Math.random() - 0.5);

        shuffled.forEach(choice => {
          const chip = el('button', 'gr-choice-chip', esc(choice));
          chip.onclick = function() {
            if (answered) return;
            answered = true;

            const toSentEl = document.getElementById('gr-to-sentence-' + stIdx);
            const toCardEl = document.getElementById('gr-to-card-' + stIdx);

            if (choice === item.answer) {
              if (!stAnswered.has(itemKey)) { stAnswered.add(itemKey); stCorrect++; }
              chip.classList.add('correct');
              if (toSentEl) toSentEl.textContent = item.answer;
              if (toCardEl) toCardEl.classList.add('correct');
              speakText(item.answer);
              setTimeout(() => { stIdx++; renderSTItem(); }, 1500);
            } else {
              if (!stAnswered.has(itemKey)) stAnswered.add(itemKey);
              chip.classList.add('wrong');
              if (toCardEl) toCardEl.classList.add('wrong');
              // Highlight correct
              Array.from(choicesRow.children).forEach(c => {
                if (c.textContent === item.answer) c.classList.add('correct');
                c.classList.add('answered');
              });
              const correctChip = Array.from(choicesRow.children).find(c => c.textContent === item.answer);
              if (correctChip) {
                correctChip.style.pointerEvents = 'auto';
                correctChip.onclick = function() {
                  if (toSentEl) toSentEl.textContent = item.answer;
                  if (toCardEl) { toCardEl.classList.remove('wrong'); toCardEl.classList.add('correct'); }
                  speakText(item.answer);
                  setTimeout(() => { stIdx++; renderSTItem(); }, 1200);
                };
              }
            }
          };
          choicesRow.appendChild(chip);
        });
        card.appendChild(choicesRow);

        // Navigation
        const navRow = el('div', '');
        navRow.style.cssText = 'display:flex; justify-content:space-between; margin-top:10px; align-items:center;';
        const prevBtn = el('button', 'jp-nav-btn prev', 'Prev');
        prevBtn.disabled = (stIdx === 0);
        prevBtn.onclick = function() { if (stIdx > 0) { stIdx--; renderSTItem(); } };
        const skipBtn = el('button', 'jp-nav-btn next', stIdx < items.length - 1 ? 'Skip →' : 'Finish');
        skipBtn.style.background = 'linear-gradient(135deg, #F97316, #DC2626)';
        skipBtn.onclick = function() {
          if (!stAnswered.has(itemKey)) stAnswered.add(itemKey);
          stIdx++;
          renderSTItem();
        };
        navRow.appendChild(prevBtn);
        navRow.appendChild(el('span', '', (stIdx + 1) + ' / ' + items.length));
        navRow.appendChild(skipBtn);
        card.appendChild(navRow);

        wrap.appendChild(card);
      }

      renderSTItem();
      return wrap;
    }

    // --- renderFillSlot ---
    function renderFillSlot(sec) {
      const wrap = el('div', '');

      const items = sec.items || [];
      if (items.length === 0) return wrap;

      let fsIdx = 0;
      let fsCorrect = 0;
      const fsAnswered = new Set();

      function renderFSItem() {
        wrap.innerHTML = '';

        // Score bar
        const pct = items.length > 0 ? Math.round(fsAnswered.size / items.length * 100) : 0;
        const scoreDiv = el('div', '');
        scoreDiv.innerHTML = '<div class="gr-score-bar-track"><div class="gr-score-bar" style="width:' + pct + '%;"></div></div><div class="gr-score-label">' + fsAnswered.size + ' / ' + items.length + ' &nbsp;|&nbsp; ' + fsCorrect + ' correct</div>';
        wrap.appendChild(scoreDiv);

        if (fsIdx >= items.length) {
          const finalPct = fsAnswered.size > 0 ? Math.round(fsCorrect / fsAnswered.size * 100) : 0;
          const rank = [...SCORE_RANKS].reverse().find(r => finalPct >= r.min) || SCORE_RANKS[0];
          const summCard = el('div', 'gr-section-card');
          summCard.style.cssText = 'text-align:center; position:relative;';
          summCard.innerHTML = '<h3 style="margin-bottom:10px;">Fill-in Complete!</h3>' +
            '<div style="font-size:2.5rem;font-weight:900;color:' + rank.colors[0] + ';">' + rank.msg + '</div>' +
            '<div style="color:#747d8c;font-weight:600;margin:4px 0 12px;">' + rank.sub + '</div>' +
            '<div style="font-size:2rem;font-weight:900;color:#F97316;">' + finalPct + '%</div>' +
            '<div style="font-size:0.85rem;color:#888;">' + fsCorrect + ' / ' + fsAnswered.size + ' correct</div>';
          wrap.appendChild(summCard);
          if (finalPct >= 80) launchHanabi(rank, summCard);
          return;
        }

        const item = items[fsIdx];
        const itemKey = 'fs_' + fsIdx;
        let answered = false;

        const card = el('div', 'gr-section-card');

        // Sentence with slot
        const sentDiv = el('div', 'gr-fill-sentence');
        const slotEl = el('span', 'gr-slot', '　　');
        slotEl.id = 'gr-slot-' + fsIdx;
        sentDiv.appendChild(document.createTextNode(item.before || ''));
        sentDiv.appendChild(slotEl);
        sentDiv.appendChild(document.createTextNode(item.after || ''));
        card.appendChild(sentDiv);

        // Explanation
        const expl = el('div', 'gr-explanation', esc(item.explanation || ''));
        expl.id = 'gr-slot-expl-' + fsIdx;

        // Choices
        const choicesRow = el('div', 'gr-choices-row');
        const shuffled = [...item.choices].sort(() => Math.random() - 0.5);

        shuffled.forEach(choice => {
          const chip = el('button', 'gr-choice-chip', esc(choice));
          chip.onclick = function() {
            if (answered) return;
            answered = true;

            const slot = document.getElementById('gr-slot-' + fsIdx);
            const explEl = document.getElementById('gr-slot-expl-' + fsIdx);

            if (choice === item.answer) {
              if (!fsAnswered.has(itemKey)) { fsAnswered.add(itemKey); fsCorrect++; }
              chip.classList.add('correct');
              if (slot) { slot.textContent = item.answer; slot.classList.add('correct'); }
              if (explEl) explEl.classList.add('visible');
              // TTS: full sentence
              speakText((item.before || '') + item.answer + (item.after || ''));
              setTimeout(() => { fsIdx++; renderFSItem(); }, 1600);
            } else {
              if (!fsAnswered.has(itemKey)) fsAnswered.add(itemKey);
              chip.classList.add('wrong');
              if (slot) slot.classList.add('wrong');
              if (explEl) explEl.classList.add('visible');
              // Highlight correct
              Array.from(choicesRow.children).forEach(c => {
                if (c.textContent === item.answer) c.classList.add('correct');
                c.classList.add('answered');
              });
              const correctChip = Array.from(choicesRow.children).find(c => c.textContent === item.answer);
              if (correctChip) {
                correctChip.style.pointerEvents = 'auto';
                correctChip.onclick = function() {
                  if (slot) { slot.textContent = item.answer; slot.classList.remove('wrong'); slot.classList.add('correct'); }
                  speakText((item.before || '') + item.answer + (item.after || ''));
                  setTimeout(() => { fsIdx++; renderFSItem(); }, 1300);
                };
              }
            }
          };
          choicesRow.appendChild(chip);
        });

        card.appendChild(choicesRow);
        card.appendChild(expl);

        // Navigation
        const navRow = el('div', '');
        navRow.style.cssText = 'display:flex; justify-content:space-between; margin-top:10px; align-items:center;';
        const prevBtn = el('button', 'jp-nav-btn prev', 'Prev');
        prevBtn.disabled = (fsIdx === 0);
        prevBtn.onclick = function() { if (fsIdx > 0) { fsIdx--; renderFSItem(); } };
        const skipBtn = el('button', 'jp-nav-btn next', fsIdx < items.length - 1 ? 'Skip →' : 'Finish');
        skipBtn.style.background = 'linear-gradient(135deg, #F97316, #DC2626)';
        skipBtn.onclick = function() {
          if (!fsAnswered.has(itemKey)) fsAnswered.add(itemKey);
          fsIdx++;
          renderFSItem();
        };
        navRow.appendChild(prevBtn);
        navRow.appendChild(el('span', '', (fsIdx + 1) + ' / ' + items.length));
        navRow.appendChild(skipBtn);
        card.appendChild(navRow);

        wrap.appendChild(card);
      }

      renderFSItem();
      return wrap;
    }

    // --- renderConversation (reused from Lesson.js pattern) ---
    function createToggle() {
      const btn = el('button', 'jp-toggle-en', showEN ? 'Hide English Translation' : 'Show English Translation');
      btn.onclick = function() { showEN = !showEN; renderCurrentStep(); };
      return btn;
    }

    function renderConversation(sec) {
      const div = el('div', '');
      div.appendChild(createToggle());
      (sec.lines || []).forEach(line => {
        const row = el('div', 'jp-row');
        row.innerHTML = '<div class="jp-speaker-bubble" translate="no">' + esc(line.spk) + '</div><div style="flex:1"><div class="jp-jp">' +
          (window.JPShared && window.JPShared.textProcessor
            ? window.JPShared.textProcessor.processText(line.jp, line.terms, termMapData, CONJUGATION_RULES, COUNTER_RULES)
            : esc(line.jp)) +
          '</div><div class="jp-en" style="display:' + (showEN ? 'block' : 'none') + '">' + esc(line.en) + '</div></div>';
        div.appendChild(row);
      });
      return div;
    }

    // --- renderDrills (reused from Lesson.js pattern) ---
    function renderDrills(sec) {
      const div = el('div', '');
      (sec.items || []).forEach((item, itemIdx) => {
        if (item.kind === 'mcq') {
          const card = el('div', 'jp-card');
          const qHtml = (window.JPShared && window.JPShared.textProcessor)
            ? window.JPShared.textProcessor.processText(item.q, item.terms, termMapData, CONJUGATION_RULES, COUNTER_RULES)
            : esc(item.q);
          card.innerHTML = '<div class="jp-jp" style="margin-bottom:15px; font-weight:bold;">' + qHtml + '</div>';
          const optsDiv = el('div');
          let solved = false;
          const itemKey = 'drill__' + itemIdx + '__' + item.q;

          const choices = [...item.choices].sort(() => Math.random() - 0.5);

          choices.forEach(choice => {
            const btn = el('button', 'jp-mcq-opt', esc(choice));
            btn.onclick = () => {
              if (solved) return;
              solved = true;
              if (choice === item.answer) {
                btn.classList.add('correct');
                if (!drillAnswered.has(itemKey)) { drillAnswered.add(itemKey); drillCorrect++; }
              } else {
                btn.classList.add('wrong');
                if (!drillAnswered.has(itemKey)) drillAnswered.add(itemKey);
                Array.from(optsDiv.children).forEach(c => {
                  if (c.innerText === item.answer) c.classList.add('correct');
                });
                if (item.terms && item.terms.length > 0 && window.JPShared && window.JPShared.textProcessor) {
                  item.terms.forEach(termId => {
                    const rootTerm = window.JPShared.textProcessor.getRootTerm(termId, termMapData);
                    if (rootTerm && window.JPShared.progress && window.JPShared.progress.flagTerm) {
                      window.JPShared.progress.flagTerm(rootTerm.surface);
                    }
                  });
                }
              }
              // Show explanation if present
              if (item.explanation) {
                const explEl = el('div', '');
                explEl.style.cssText = 'margin-top:8px; font-size:0.82rem; color:#555; background:#f8f8f8; border-radius:6px; padding:8px 10px;';
                explEl.textContent = item.explanation;
                optsDiv.parentElement.appendChild(explEl);
              }
            };
            optsDiv.appendChild(btn);
          });

          card.appendChild(optsDiv);
          div.appendChild(card);
        }
      });
      return div;
    }

    // =========================================================================
    // SECTION DISPATCHER
    // =========================================================================

    function renderCurrentStep() {
      const body = root.querySelector('.gr-body');
      const title = root.querySelector('.jp-title');
      const bar = root.querySelector('.jp-progress-bar');
      const nextBtn = root.querySelector('.jp-nav-btn.next');
      const prevBtn = root.querySelector('.jp-nav-btn.prev');

      if (!body || !grammarData) return;

      body.innerHTML = '';
      bar.style.width = (((currentStep + 1) / totalSteps) * 100) + '%';

      if (currentStep >= grammarData.sections.length) {
        // Summary screen
        title.innerText = 'Complete!';
        const pct = drillTotal > 0 ? Math.round(drillCorrect / drillTotal * 100) : 100;
        const rank = [...SCORE_RANKS].reverse().find(r => pct >= r.min) || SCORE_RANKS[0];
        const card = el('div', 'jp-card');
        card.style.cssText = 'text-align:center; position:relative; padding:30px 20px;';
        card.innerHTML = '<h2 style="margin-bottom:15px;">🎉 Grammar Lesson Complete!</h2>' +
          (drillTotal > 0 ? '<div style="font-size:0.8rem;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Drill Score</div>' +
            '<div style="font-size:3rem;font-weight:900;color:' + rank.colors[0] + ';line-height:1.1;">' + rank.msg + '</div>' +
            '<div style="font-size:1rem;color:#747d8c;font-weight:600;margin:6px 0 14px;">' + rank.sub + '</div>' +
            '<div style="font-size:2.2rem;font-weight:900;color:#F97316;">' + pct + '%</div>' +
            '<div style="font-size:0.9rem;color:#888;margin-top:4px;">' + drillCorrect + ' / ' + drillTotal + ' correct</div>' : '');
        body.appendChild(card);
        nextBtn.innerText = 'Finish';
        markGrammarComplete(grammarId, drillTotal > 0 ? pct : undefined);
        if (drillTotal > 0) launchHanabi(rank, card);
        return;
      }

      const sec = grammarData.sections[currentStep];

      // Mark section seen
      markSectionSeen(grammarId, currentStep);

      title.innerText = sec.title || grammarData.title || '';

      const wrap = el('div');
      let content = null;

      switch (sec.type) {
        case 'grammarIntro':
          content = renderGrammarIntro(sec);
          break;
        case 'grammarRule':
          content = renderGrammarRule(sec);
          break;
        case 'grammarTable':
          content = renderGrammarTable(sec);
          break;
        case 'grammarComparison':
          content = renderGrammarComparison(sec);
          break;
        case 'annotatedExample':
          content = renderAnnotatedExample(sec);
          break;
        case 'conjugationDrill':
          content = renderConjugationDrill(sec);
          break;
        case 'patternMatch':
          content = renderPatternMatch(sec);
          break;
        case 'sentenceTransform':
          content = renderSentenceTransform(sec);
          break;
        case 'fillSlot':
          content = renderFillSlot(sec);
          break;
        case 'conversation':
          content = renderConversation(sec);
          break;
        case 'drills':
          content = renderDrills(sec);
          break;
        default:
          content = el('div', 'jp-card', '<em>Unknown section type: ' + esc(sec.type) + '</em>');
          break;
      }

      if (content) wrap.appendChild(content);
      body.appendChild(wrap);

      prevBtn.disabled = (currentStep === 0);
      nextBtn.innerText = (currentStep === totalSteps - 1) ? 'Finish' : 'Next';
    }

    // =========================================================================
    // GRAMMAR LOADING
    // =========================================================================

    async function loadGrammar(filePath, id) {
      root.innerHTML = '<div class="gr-header"><button class="jp-back-btn">← List</button><div class="jp-title">Loading...</div><button class="jp-exit-btn">Exit</button></div>' +
        '<div class="jp-progress-container"><div class="jp-progress-bar"></div></div>' +
        '<div class="gr-body"></div>' +
        '<div class="jp-footer"><button class="jp-nav-btn prev">Prev</button><button class="jp-nav-btn next">Next</button></div>';

      root.querySelector('.jp-back-btn').onclick = () => renderMenu(currentLevelId, currentGrammars);
      root.querySelector('.jp-exit-btn').onclick = exitCallback;

      try {
        const grammarUrl = getCdnUrl(filePath);
        console.log('[Grammar] Loading grammar lesson:', grammarUrl);
        const [gRes, resources] = await Promise.all([
          fetch(grammarUrl),
          loadResources()
        ]);
        grammarData = await gRes.json();
        grammarId = id;
        drillCorrect = 0; drillTotal = 0; drillAnswered.clear();
        showEN = false;

        // Count drill items for score tracking
        grammarData.sections.forEach(sec => {
          if (sec.type === 'drills') {
            (sec.items || []).forEach(item => { if (item.kind === 'mcq') drillTotal++; });
          }
        });

        termMapData = resources.map;
        CONJUGATION_RULES = resources.conj;
        COUNTER_RULES = resources.counter;

        if (window.JPShared && window.JPShared.termModal && window.JPShared.termModal.setTermMap) {
          window.JPShared.termModal.setTermMap(termMapData);
        }

        currentStep = 0;
        totalSteps = grammarData.sections.length;

        // Navigation events
        root.querySelector('.jp-nav-btn.prev').onclick = () => {
          if (currentStep > 0) {
            currentStep--;
            showEN = false;
            renderCurrentStep();
          }
        };
        root.querySelector('.jp-nav-btn.next').onclick = () => {
          if (currentStep < totalSteps) {
            currentStep++;
            showEN = false;
            renderCurrentStep();
          } else {
            renderMenu(currentLevelId, currentGrammars);
          }
        };

        renderCurrentStep();
      } catch (err) {
        console.error('[Grammar] Error loading grammar lesson:', err);
        const body = root.querySelector('.gr-body');
        if (body) body.innerHTML = '<div class="jp-card" style="color:#ff4757; text-align:center; padding:20px;"><h3>Error Loading Lesson</h3><p>' + esc(err.message) + '</p></div>';
      }
    }

    // =========================================================================
    // MENU & NAVIGATION
    // =========================================================================

    function renderMenu(levelId, grammars) {
      currentLevelId = levelId;
      currentGrammars = grammars || [];
      const levelNum = (levelId || '').replace('N', '');

      root.innerHTML = '<div class="gr-header"><button class="jp-back-btn">← Levels</button><div class="jp-title">Grammar N' + esc(levelNum) + '</div><button class="jp-exit-btn">Exit</button></div>' +
        '<div class="gr-body"><div class="jp-menu-grid" id="gr-menu-container"></div></div>';

      root.querySelector('.jp-back-btn').onclick = () => renderLevelPicker();
      root.querySelector('.jp-exit-btn').onclick = exitCallback;

      const menuEl = document.getElementById('gr-menu-container');

      if (!currentGrammars.length) {
        menuEl.innerHTML = '<div style="text-align:center; color:#aaa; padding:40px 20px;">No grammar lessons available for this level yet.</div>';
        return;
      }

      currentGrammars.forEach(g => {
        const btn = el('div', 'jp-menu-item');
        btn.style.cssText += '; border-left: 4px solid rgba(249,115,22,0.4);';

        const complete = isGrammarComplete(g.id);
        const icon = g.icon || '📐';

        const leftDiv = el('div', '');
        leftDiv.innerHTML = '<div class="jp-menu-id">' + esc(icon) + ' ' + esc(g.id) + (complete ? ' <span class="gr-completion-badge">✓</span>' : '') + '</div>' +
          '<div class="jp-menu-name">' + esc(g.title || '') + '</div>' +
          (g.unlocksAfter ? '<div class="gr-lock-badge">Unlocks after ' + esc(g.unlocksAfter) + '</div>' : '');

        const rightDiv = el('div', '');
        rightDiv.innerHTML = complete ? '<span style="font-size:1.2rem;">✅</span>' : '<span style="font-size:1.2rem; color:#ddd;">→</span>';

        btn.appendChild(leftDiv);
        btn.appendChild(rightDiv);
        btn.onclick = () => loadGrammar(g.file, g.id);
        menuEl.appendChild(btn);
      });
    }

    function renderLevelPicker() {
      root.innerHTML = '<div class="gr-header"><div class="jp-title">📐 Grammar</div><button class="jp-exit-btn">Exit</button></div>' +
        '<div class="gr-body"><div class="jp-menu-grid" id="gr-level-container"></div></div>';

      root.querySelector('.jp-exit-btn').onclick = exitCallback;

      const container = document.getElementById('gr-level-container');

      if (!allLevelsData || allLevelsData.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#aaa; padding:40px 20px;">No grammar lessons found in manifest.</div>';
        return;
      }

      allLevelsData.forEach(({ level, levelNum, grammars }) => {
        const card = el('div', 'jp-level-card');
        const completedCount = grammars.filter(g => isGrammarComplete(g.id)).length;
        card.innerHTML = '<div class="jp-level-name" style="color:#F97316;">JLPT Level N' + esc(String(levelNum)) + '</div>' +
          '<div class="jp-level-count">' + grammars.length + ' grammar lesson' + (grammars.length !== 1 ? 's' : '') +
          (completedCount > 0 ? ' · ' + completedCount + ' completed' : '') + '</div>';
        card.onclick = () => renderMenu(level, grammars);
        container.appendChild(card);
      });
    }

    // =========================================================================
    // FETCH GRAMMAR LIST
    // =========================================================================

    async function fetchGrammarList() {
      root.innerHTML = '<div class="gr-header"><div class="jp-title">📐 Grammar</div><button class="jp-exit-btn">Exit</button></div>' +
        '<div class="gr-body" style="text-align:center; justify-content:center; color:#888; display:flex; align-items:center;">Loading...</div>';

      root.querySelector('.jp-exit-btn').onclick = exitCallback;

      try {
        const manifest = await window.getManifest(REPO_CONFIG);
        const levelsData = [];

        (manifest.levels || []).forEach(level => {
          const levelData = manifest.data && manifest.data[level];
          if (!levelData) return;
          const grammars = levelData.grammar || [];
          if (grammars.length === 0) return;
          const levelNum = parseInt(level.replace('N', ''));
          levelsData.push({ level, levelNum, grammars });
        });

        // Sort: N4 before N5 (lower number = more advanced content shown first)
        levelsData.sort((a, b) => a.levelNum - b.levelNum);

        console.log('[Grammar] Found levels with grammar:', levelsData.map(l => l.level));
        allLevelsData = levelsData;

        if (levelsData.length === 0) {
          root.innerHTML = '<div class="gr-header"><div class="jp-title">📐 Grammar</div><button class="jp-exit-btn">Exit</button></div>' +
            '<div class="gr-body" style="text-align:center; color:#aaa; padding:40px 20px; justify-content:center;"><div style="font-size:2rem; margin-bottom:10px;">📐</div><div>No grammar lessons available yet.</div><div style="font-size:0.8rem; margin-top:8px; color:#ccc;">Check back after adding grammar lesson files to the manifest.</div></div>';
          root.querySelector('.jp-exit-btn').onclick = exitCallback;
          return;
        }

        // If only one level, go straight to menu for that level
        if (levelsData.length === 1) {
          renderMenu(levelsData[0].level, levelsData[0].grammars);
        } else {
          renderLevelPicker();
        }
      } catch (err) {
        console.error('[Grammar] Error loading manifest:', err);
        root.innerHTML = '<div class="gr-header"><div class="jp-title">📐 Grammar</div><button class="jp-exit-btn">Exit</button></div>' +
          '<div class="gr-body" style="color:#ff4757; text-align:center; padding:20px; justify-content:center;">' +
          '<h3>Error</h3><p>' + esc(err.message) + '</p></div>';
        const exitBtnEl = root.querySelector('.jp-exit-btn');
        if (exitBtnEl) exitBtnEl.onclick = exitCallback;
      }
    }

    // =========================================================================
    // INITIALIZE
    // =========================================================================

    fetchGrammarList();
  }
};
