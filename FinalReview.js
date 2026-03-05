// ============================================================
//  FinalReview.js — N4 Final Interactive Review
//  8 game-style sections: Speed Round, Conversation Gauntlet,
//  Grammar Roulette, Scramble Relay, Detective Reading,
//  Match Pairs, Vocab Categories, Kanji Bingo
// ============================================================
window.FinalReviewModule = (function () {
  'use strict';

  let container = null;
  let config = null;
  let onExit = null;
  let reviewData = null;
  let termMap = {};
  let conjugations = null;
  let counterRules = null;

  // ── State ──
  let totalScore = 0;
  let maxPossible = 0;
  let sectionIdx = 0;
  let sectionScores = [];

  // ── Rikizo stamp (base64 inline — tiny 40×40 face) ──
  // We'll generate it as an SVG data URI so no external asset is needed
  const RIKIZO_STAMP = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
    '<circle cx="20" cy="20" r="18" fill="#FFE0B2"/>' +
    '<circle cx="14" cy="16" r="2.5" fill="#333"/>' +
    '<circle cx="26" cy="16" r="2.5" fill="#333"/>' +
    '<path d="M14 26 Q20 32 26 26" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<rect x="10" y="8" width="8" height="4" rx="1" fill="#333" opacity="0.7"/>' +
    '<rect x="22" y="8" width="8" height="4" rx="1" fill="#333" opacity="0.7"/>' +
    '<path d="M6 14 Q8 4 20 2 Q32 4 34 14" stroke="#222" stroke-width="2.5" fill="#222"/>' +
    '</svg>'
  );

  // ── Helpers ──
  function el(id) { return document.getElementById(id); }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getUrl(rel) {
    return window.getAssetUrl(config, rel);
  }

  function processText(jp, terms) {
    if (!window.JPShared || !window.JPShared.textProcessor) return jp;
    return window.JPShared.textProcessor.processText(jp, terms, termMap, conjugations, counterRules);
  }

  // ── Styles ──
  function injectStyles() {
    if (document.getElementById('jp-final-review-styles')) return;
    const s = document.createElement('style');
    s.id = 'jp-final-review-styles';
    s.textContent = `
      #jp-fr-root {
        --fr-primary: #E91E63;
        --fr-primary-dark: #C2185B;
        --fr-gold: #FFD700;
        --fr-bg: #FFF8E1;
        --fr-card: #FFFFFF;
        --fr-text: #2f3542;
        --fr-text-sub: #747d8c;
        font-family: 'Poppins', 'Noto Sans JP', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        color: var(--fr-text);
      }
      .fr-header {
        background: linear-gradient(135deg, #E91E63, #9C27B0);
        color: white;
        padding: 20px 24px;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .fr-header h2 { margin: 0; font-size: 1.3rem; font-weight: 900; }
      .fr-header-score {
        background: rgba(255,255,255,0.2);
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.95rem;
      }
      .fr-progress-track {
        height: 6px;
        background: #eee;
        position: relative;
      }
      .fr-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #E91E63, #FFD700);
        transition: width 0.5s ease;
        border-radius: 0 3px 3px 0;
      }
      .fr-body {
        background: var(--fr-bg);
        padding: 24px;
        border-radius: 0 0 16px 16px;
        min-height: 400px;
      }
      .fr-section-title {
        font-size: 1.4rem;
        font-weight: 900;
        text-align: center;
        margin-bottom: 6px;
      }
      .fr-section-desc {
        text-align: center;
        color: var(--fr-text-sub);
        margin-bottom: 20px;
        font-size: 0.95rem;
      }
      .fr-btn {
        display: inline-block;
        padding: 12px 28px;
        border: none;
        border-radius: 12px;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
        font-family: inherit;
      }
      .fr-btn:active { transform: scale(0.96); }
      .fr-btn-primary {
        background: linear-gradient(135deg, #E91E63, #9C27B0);
        color: white;
        box-shadow: 0 4px 15px rgba(233,30,99,0.3);
      }
      .fr-btn-secondary {
        background: white;
        color: var(--fr-primary);
        border: 2px solid var(--fr-primary);
      }
      .fr-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ── Speed Round ── */
      .fr-speed-card {
        background: white;
        border-radius: 16px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        position: relative;
        overflow: hidden;
      }
      .fr-speed-kanji {
        font-size: 5rem;
        font-weight: 900;
        line-height: 1.1;
        margin-bottom: 10px;
      }
      .fr-speed-timer {
        position: absolute;
        top: 0; left: 0;
        height: 4px;
        background: var(--fr-primary);
        transition: width 0.1s linear;
      }
      .fr-speed-choices {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 16px;
      }
      .fr-speed-choice {
        padding: 14px;
        border-radius: 12px;
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
        font-weight: 600;
      }
      .fr-speed-choice:hover { border-color: var(--fr-primary); background: #fff0f3; }
      .fr-speed-choice.correct { background: #d4edda; border-color: #28a745; color: #155724; }
      .fr-speed-choice.wrong { background: #f8d7da; border-color: #dc3545; color: #721c24; }
      .fr-speed-streak {
        position: absolute;
        top: 12px;
        right: 16px;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--fr-gold);
      }
      .fr-speed-combo {
        animation: frPulse 0.3s ease;
      }
      @keyframes frPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.4); }
        100% { transform: scale(1); }
      }

      /* ── Conversation ── */
      .fr-conv-scene {
        background: white;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }
      .fr-conv-context {
        font-style: italic;
        color: var(--fr-text-sub);
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
        font-size: 0.9rem;
      }
      .fr-conv-line {
        display: flex;
        gap: 10px;
        margin-bottom: 8px;
        align-items: flex-start;
      }
      .fr-conv-spk {
        min-width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--fr-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.8rem;
        flex-shrink: 0;
      }
      .fr-conv-text {
        font-size: 1.05rem;
        line-height: 1.6;
      }

      /* ── Grammar Roulette ── */
      .fr-wheel-container {
        position: relative;
        width: 280px;
        height: 280px;
        margin: 0 auto 20px;
      }
      .fr-wheel {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        transition: transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99);
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      }
      .fr-wheel-pointer {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 14px solid transparent;
        border-right: 14px solid transparent;
        border-top: 24px solid #333;
        z-index: 10;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      }
      .fr-wheel-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
      }

      /* ── MCQ shared ── */
      .fr-choices {
        display: grid;
        gap: 10px;
        margin-top: 16px;
      }
      .fr-choice {
        padding: 14px 18px;
        border-radius: 12px;
        background: white;
        border: 2px solid #e9ecef;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
        text-align: left;
      }
      .fr-choice:hover { border-color: var(--fr-primary); }
      .fr-choice.correct { background: #d4edda; border-color: #28a745; }
      .fr-choice.wrong { background: #f8d7da; border-color: #dc3545; }
      .fr-choice.locked { pointer-events: none; }
      .fr-explanation {
        margin-top: 12px;
        padding: 12px 16px;
        background: #f0f0f0;
        border-radius: 10px;
        font-size: 0.9rem;
        color: #555;
        display: none;
      }
      .fr-explanation.show { display: block; animation: frFadeIn 0.3s; }

      /* ── Scramble Relay ── */
      .fr-relay-track {
        display: flex;
        gap: 4px;
        margin-bottom: 16px;
        justify-content: center;
      }
      .fr-relay-dot {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 700;
        color: white;
        transition: all 0.3s;
      }
      .fr-relay-dot.active { background: var(--fr-primary); transform: scale(1.2); }
      .fr-relay-dot.done { background: #28a745; }
      .fr-relay-dot.failed { background: #dc3545; }
      .fr-scramble-box {
        min-height: 50px;
        background: white;
        border: 2px dashed #ccc;
        border-radius: 12px;
        padding: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin-bottom: 12px;
        transition: border-color 0.3s;
      }
      .fr-scramble-box.correct { border-color: #28a745; background: #f0fff0; }
      .fr-scramble-box.wrong { border-color: #dc3545; }
      .fr-chip {
        padding: 8px 16px;
        border-radius: 10px;
        background: #f0f0f0;
        cursor: pointer;
        font-size: 1.05rem;
        font-weight: 600;
        transition: all 0.2s;
        user-select: none;
        font-family: inherit;
        border: 2px solid transparent;
      }
      .fr-chip:hover { background: #e0e0e0; }
      .fr-chip.used { opacity: 0.3; pointer-events: none; }
      .fr-chip.in-box {
        background: white;
        border: 2px solid var(--fr-primary);
      }
      .fr-chip-pool {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin-bottom: 16px;
      }

      /* ── Detective / Reading ── */
      .fr-passage {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        line-height: 1.8;
        font-size: 1.05rem;
      }
      .fr-clue-badge {
        display: inline-block;
        background: var(--fr-primary);
        color: white;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
        margin-bottom: 8px;
      }

      /* ── Match Pairs ── */
      .fr-match-grid {
        display: grid;
        gap: 10px;
        margin: 0 auto;
      }
      .fr-match-card {
        aspect-ratio: 1;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.3s, background 0.3s;
        user-select: none;
        position: relative;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
      .fr-match-card.flipped {
        background: white;
        color: var(--fr-text);
        border: 2px solid #ddd;
        transform: rotateY(0deg);
      }
      .fr-match-card.matched {
        background: #d4edda;
        border: 2px solid #28a745;
        color: #155724;
        pointer-events: none;
      }
      .fr-match-card.wrong-flip {
        background: #f8d7da;
        border: 2px solid #dc3545;
      }
      .fr-match-card .fr-card-back {
        font-size: 1.5rem;
      }
      .fr-match-moves {
        text-align: center;
        font-weight: 700;
        color: var(--fr-text-sub);
        margin-bottom: 12px;
      }

      /* ── Vocab Categories ── */
      .fr-cat-bank {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin-bottom: 20px;
      }
      .fr-cat-word {
        padding: 10px 18px;
        border-radius: 12px;
        background: white;
        border: 2px solid #e0e0e0;
        font-size: 1.05rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      .fr-cat-word:hover { border-color: var(--fr-primary); }
      .fr-cat-word.selected { border-color: var(--fr-primary); background: #fff0f3; }
      .fr-cat-word.placed { opacity: 0.3; pointer-events: none; }
      .fr-cat-slots {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }
      .fr-cat-group {
        background: white;
        border-radius: 12px;
        padding: 14px;
        text-align: center;
        border: 2px solid #e9ecef;
        min-height: 120px;
      }
      .fr-cat-group-title {
        font-weight: 800;
        font-size: 0.9rem;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 2px solid #eee;
      }
      .fr-cat-group.correct { border-color: #28a745; background: #f0fff0; }
      .fr-cat-group.wrong { border-color: #dc3545; background: #fff0f0; }
      .fr-cat-placed-word {
        display: inline-block;
        padding: 4px 10px;
        margin: 3px;
        border-radius: 8px;
        background: #f0f0f0;
        font-size: 0.9rem;
      }

      /* ── Bingo ── */
      .fr-bingo-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
        max-width: 400px;
        margin: 0 auto 20px;
      }
      .fr-bingo-cell {
        aspect-ratio: 1;
        border-radius: 10px;
        background: white;
        border: 2px solid #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        user-select: none;
      }
      .fr-bingo-cell:hover { border-color: var(--fr-primary); }
      .fr-bingo-cell.stamped {
        pointer-events: none;
      }
      .fr-bingo-cell.stamped::after {
        content: '';
        position: absolute;
        inset: 4px;
        background: url("${RIKIZO_STAMP}") center/contain no-repeat;
        opacity: 0.85;
        animation: frStamp 0.3s ease;
      }
      .fr-bingo-cell.free {
        background: #fff0f3;
        border-color: var(--fr-primary);
        pointer-events: none;
      }
      .fr-bingo-cell.free::after {
        content: '';
        position: absolute;
        inset: 4px;
        background: url("${RIKIZO_STAMP}") center/contain no-repeat;
        opacity: 0.85;
      }
      .fr-bingo-cell.wrong-tap {
        animation: frShake 0.4s ease;
      }
      .fr-bingo-cell.bingo-line {
        box-shadow: 0 0 0 3px var(--fr-gold), 0 0 15px rgba(255,215,0,0.5);
      }
      .fr-bingo-call {
        text-align: center;
        background: white;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }
      .fr-bingo-call-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--fr-text-sub);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }
      .fr-bingo-call-text {
        font-size: 1.6rem;
        font-weight: 900;
      }
      .fr-bingo-call-hint {
        font-size: 0.9rem;
        color: var(--fr-text-sub);
        margin-top: 4px;
      }
      .fr-bingo-status {
        text-align: center;
        font-weight: 700;
        margin-bottom: 12px;
      }
      @keyframes frStamp {
        0% { transform: scale(2); opacity: 0; }
        60% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 0.85; }
      }
      @keyframes frShake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
      @keyframes frFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* ── Section transition ── */
      .fr-section-intro {
        text-align: center;
        padding: 40px 20px;
        animation: frFadeIn 0.5s;
      }
      .fr-section-intro-emoji {
        font-size: 4rem;
        margin-bottom: 12px;
      }
      .fr-section-intro h3 {
        font-size: 1.8rem;
        font-weight: 900;
        margin-bottom: 8px;
      }
      .fr-section-result {
        text-align: center;
        padding: 20px;
        animation: frFadeIn 0.4s;
      }
      .fr-section-result-score {
        font-size: 2.5rem;
        font-weight: 900;
        color: var(--fr-primary);
      }

      /* ── Final screen ── */
      .fr-final {
        text-align: center;
        padding: 40px 20px;
        animation: frFadeIn 0.6s;
      }
      .fr-final-pct {
        font-size: 4.5rem;
        font-weight: 900;
        background: linear-gradient(135deg, #E91E63, #FFD700);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .fr-final-rank {
        font-size: 2rem;
        font-weight: 900;
        margin: 10px 0;
      }

      /* ── Responsive ── */
      @media (max-width: 600px) {
        .fr-bingo-cell { font-size: 1.3rem; }
        .fr-speed-kanji { font-size: 3.5rem; }
        .fr-cat-slots { grid-template-columns: 1fr; }
        .fr-match-grid { gap: 6px; }
        .fr-match-card { font-size: 1.2rem; }
        .fr-wheel-container { width: 220px; height: 220px; }
      }
    `;
    document.head.appendChild(s);
  }

  // ══════════════════════════════════════════════════════════════
  //  PUBLIC START
  // ══════════════════════════════════════════════════════════════
  function start(c, cfg, exit) {
    container = c;
    config = cfg;
    onExit = exit;
    totalScore = 0;
    maxPossible = 0;
    sectionIdx = 0;
    sectionScores = [];
    injectStyles();
    loadData();
  }

  async function loadData() {
    container.innerHTML = '<div style="text-align:center;padding:60px;color:#888;">Loading Final Review...</div>';
    try {
      const manifest = await window.getManifest(config);
      // Find the final review file
      const n4Reviews = (manifest.data.N4.reviews || []);
      let frEntry = n4Reviews.find(r => r.id === 'N4.Final.Review');
      if (!frEntry) {
        // fallback search
        frEntry = n4Reviews.find(r => r.file && r.file.includes('Final'));
      }
      if (!frEntry) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:red;">Final Review not found in manifest.</div><button onclick="arguments[0]()" style="margin:20px auto;display:block;">Back</button>';
        return;
      }
      const dataUrl = getUrl(frEntry.file);

      // Load data files in parallel
      const [data, conjData, ctrData, glossN5, glossN4, particles] = await Promise.all([
        window.JPShared.assets.fetchJSON(dataUrl),
        window.JPShared.assets.fetchJSON(getUrl(manifest.globalFiles.conjugationRules)),
        window.JPShared.assets.fetchJSON(getUrl(manifest.globalFiles.counterRules)),
        window.JPShared.assets.fetchJSON(getUrl(manifest.data.N5.glossary)),
        window.JPShared.assets.fetchJSON(getUrl(manifest.data.N4.glossary)),
        window.JPShared.assets.fetchJSON(getUrl(manifest.shared.particles))
      ]);

      reviewData = data;
      conjugations = conjData;
      counterRules = ctrData;

      // Build term map
      termMap = {};
      [glossN5, glossN4].forEach(g => {
        (Array.isArray(g) ? g : []).forEach(entry => {
          if (entry.id) termMap[entry.id] = entry;
        });
      });
      (Array.isArray(particles) ? particles : []).forEach(p => {
        if (p.id) termMap[p.id] = p;
      });

      renderShell();
      renderSectionIntro();
    } catch (err) {
      console.error('[FinalReview] Load error:', err);
      container.innerHTML = '<div style="text-align:center;padding:40px;color:red;">Error loading: ' + err.message + '</div>';
    }
  }

  // ── Shell ──
  function renderShell() {
    container.innerHTML = '';
    const root = document.createElement('div');
    root.id = 'jp-fr-root';
    root.innerHTML = `
      <div class="fr-header">
        <div>
          <h2>りきぞうファイナル</h2>
          <div style="font-size:0.8rem;opacity:0.8;">N4 Final Review</div>
        </div>
        <div class="fr-header-score" id="fr-total-score">0 pts</div>
      </div>
      <div class="fr-progress-track">
        <div class="fr-progress-bar" id="fr-progress" style="width:0%"></div>
      </div>
      <div class="fr-body" id="fr-stage"></div>
    `;
    container.appendChild(root);
  }

  function updateProgress() {
    const pct = ((sectionIdx) / reviewData.sections.length) * 100;
    const bar = el('fr-progress');
    if (bar) bar.style.width = pct + '%';
    const sc = el('fr-total-score');
    if (sc) sc.textContent = totalScore + ' pts';
  }

  // ══════════════════════════════════════════════════════════════
  //  SECTION ROUTER
  // ══════════════════════════════════════════════════════════════
  function renderSectionIntro() {
    if (sectionIdx >= reviewData.sections.length) {
      renderFinalScreen();
      return;
    }
    updateProgress();
    const sec = reviewData.sections[sectionIdx];
    const stage = el('fr-stage');
    stage.innerHTML = `
      <div class="fr-section-intro">
        <div class="fr-section-intro-emoji">${sec.emoji || '🎯'}</div>
        <h3>${sec.title}</h3>
        <p style="color:var(--fr-text-sub);margin-bottom:24px;">${sec.instructions}</p>
        <button class="fr-btn fr-btn-primary" id="fr-start-section">Let's Go!</button>
      </div>
    `;
    el('fr-start-section').onclick = () => runSection(sec);
  }

  function runSection(sec) {
    const stage = el('fr-stage');
    switch (sec.type) {
      case 'speed_round':     renderSpeedRound(stage, sec); break;
      case 'conversation':    renderConversation(stage, sec); break;
      case 'grammar_roulette': renderGrammarRoulette(stage, sec); break;
      case 'scramble_relay':  renderScrambleRelay(stage, sec); break;
      case 'detective_reading': renderDetectiveReading(stage, sec); break;
      case 'match_pairs':     renderMatchPairs(stage, sec); break;
      case 'vocab_categories': renderVocabCategories(stage, sec); break;
      case 'kanji_bingo':     renderKanjiBingo(stage, sec); break;
      default:
        stage.innerHTML = '<p>Unknown section type: ' + sec.type + '</p>';
    }
  }

  function finishSection(earned, possible) {
    sectionScores.push({ earned, possible });
    totalScore += earned;
    maxPossible += possible;
    sectionIdx++;
    updateProgress();

    const stage = el('fr-stage');
    const pct = possible > 0 ? Math.round((earned / possible) * 100) : 100;
    stage.innerHTML = `
      <div class="fr-section-result">
        <div class="fr-section-result-score">${earned} / ${possible}</div>
        <div style="font-size:1.1rem;color:var(--fr-text-sub);margin:8px 0 20px;">${pct}% — ${pct >= 80 ? 'すばらしい！' : pct >= 60 ? 'いいね！' : '頑張れ！'}</div>
        <button class="fr-btn fr-btn-primary" id="fr-next-section">${sectionIdx >= reviewData.sections.length ? 'See Final Results' : 'Next Section →'}</button>
      </div>
    `;
    el('fr-next-section').onclick = () => renderSectionIntro();
  }

  // ══════════════════════════════════════════════════════════════
  //  SECTION 1: SPEED ROUND
  // ══════════════════════════════════════════════════════════════
  function renderSpeedRound(stage, sec) {
    const items = shuffle(sec.items).slice(0, sec.count || 15);
    let idx = 0, score = 0, streak = 0, timer = null;
    const TIME_LIMIT = sec.timePerItem || 5000;

    function showCard() {
      if (idx >= items.length) {
        clearTimeout(timer);
        finishSection(score, items.length);
        return;
      }
      const item = items[idx];
      const choices = shuffle(item.choices);
      stage.innerHTML = `
        <div style="animation:frFadeIn 0.3s;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-weight:700;color:var(--fr-text-sub);">${idx + 1} / ${items.length}</span>
            <span class="fr-speed-streak" id="fr-streak">${streak > 0 ? '🔥 ' + streak : ''}</span>
          </div>
          <div class="fr-speed-card">
            <div class="fr-speed-timer" id="fr-timer-bar" style="width:100%"></div>
            <div class="fr-speed-kanji">${item.kanji}</div>
            <div style="font-size:0.9rem;color:var(--fr-text-sub);margin-bottom:8px;">${item.hint || ''}</div>
            <div class="fr-speed-choices" id="fr-speed-choices">
              ${choices.map(c => `<button class="fr-speed-choice" data-val="${c}">${c}</button>`).join('')}
            </div>
          </div>
        </div>
      `;

      // Timer
      let elapsed = 0;
      const interval = 50;
      const timerBar = el('fr-timer-bar');
      clearTimeout(timer);
      const tick = () => {
        elapsed += interval;
        if (timerBar) timerBar.style.width = Math.max(0, (1 - elapsed / TIME_LIMIT) * 100) + '%';
        if (elapsed >= TIME_LIMIT) {
          handleAnswer(null);
          return;
        }
        timer = setTimeout(tick, interval);
      };
      timer = setTimeout(tick, interval);

      // Choices
      const btns = el('fr-speed-choices').querySelectorAll('.fr-speed-choice');
      btns.forEach(btn => {
        btn.onclick = () => handleAnswer(btn.dataset.val);
      });
    }

    function handleAnswer(val) {
      clearTimeout(timer);
      const item = items[idx];
      const correct = val === item.answer;
      if (correct) {
        score++;
        streak++;
      } else {
        streak = 0;
      }

      // Highlight
      const btns = el('fr-speed-choices').querySelectorAll('.fr-speed-choice');
      btns.forEach(btn => {
        btn.style.pointerEvents = 'none';
        if (btn.dataset.val === item.answer) btn.classList.add('correct');
        else if (btn.dataset.val === val) btn.classList.add('wrong');
      });

      // Update streak
      const streakEl = el('fr-streak');
      if (streakEl && streak > 0) {
        streakEl.innerHTML = '🔥 ' + streak;
        streakEl.classList.remove('fr-speed-combo');
        void streakEl.offsetWidth;
        streakEl.classList.add('fr-speed-combo');
      }

      idx++;
      setTimeout(showCard, 800);
    }

    showCard();
  }

  // ══════════════════════════════════════════════════════════════
  //  SECTION 2: CONVERSATION GAUNTLET
  // ══════════════════════════════════════════════════════════════
  function renderConversation(stage, sec) {
    const items = sec.items;
    let idx = 0, score = 0;

    function showConv() {
      if (idx >= items.length) {
        finishSection(score, items.length);
        return;
      }
      const item = items[idx];
      const choices = shuffle(item.choices.slice());
      stage.innerHTML = `
        <div style="animation:frFadeIn 0.3s;">
          <div style="font-weight:700;color:var(--fr-text-sub);margin-bottom:8px;">${item.title} • ${idx + 1}/${items.length}</div>
          <div class="fr-conv-scene">
            <div class="fr-conv-context">${item.context}</div>
            ${item.lines.map(l => `
              <div class="fr-conv-line">
                <div class="fr-conv-spk">${l.spk}</div>
                <div class="fr-conv-text">${processText(l.jp, l.terms)}</div>
              </div>
            `).join('')}
          </div>
          <div style="font-weight:700;margin-bottom:8px;">${item.question}</div>
          <div class="fr-choices" id="fr-conv-choices">
            ${choices.map(c => `<button class="fr-choice" data-val="${c}">${c}</button>`).join('')}
          </div>
          <div class="fr-explanation" id="fr-conv-explain">${item.explanation || ''}</div>
        </div>
      `;

      el('fr-conv-choices').querySelectorAll('.fr-choice').forEach(btn => {
        btn.onclick = () => {
          const correct = btn.dataset.val === item.answer;
          if (correct) score++;
          el('fr-conv-choices').querySelectorAll('.fr-choice').forEach(b => {
            b.classList.add('locked');
            if (b.dataset.val === item.answer) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
          });
          el('fr-conv-explain').classList.add('show');
          idx++;
          setTimeout(showConv, 2000);
        };
      });
    }

    showConv();
  }

  // ══════════════════════════════════════════════════════════════
  //  SECTION 3: GRAMMAR ROULETTE
  // ══════════════════════════════════════════════════════════════
  function renderGrammarRoulette(stage, sec) {
    const categories = sec.categories;
    let idx = 0, score = 0;
    let allItems = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        allItems.push({ ...item, category: cat.label, color: cat.color });
      });
    });
    allItems = shuffle(allItems).slice(0, sec.count || 8);

    function showSpin() {
      if (idx >= allItems.length) {
        finishSection(score, allItems.length);
        return;
      }
      const item = allItems[idx];

      // Build wheel
      const n = categories.length;
      const segAngle = 360 / n;
      let wheelSvg = '<svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">';
      categories.forEach((cat, i) => {
        const startAngle = i * segAngle - 90;
        const endAngle = startAngle + segAngle;
        const x1 = 140 + 140 * Math.cos(startAngle * Math.PI / 180);
        const y1 = 140 + 140 * Math.sin(startAngle * Math.PI / 180);
        const x2 = 140 + 140 * Math.cos(endAngle * Math.PI / 180);
        const y2 = 140 + 140 * Math.sin(endAngle * Math.PI / 180);
        const largeArc = segAngle > 180 ? 1 : 0;
        wheelSvg += `<path d="M140,140 L${x1},${y1} A140,140 0 ${largeArc},1 ${x2},${y2} Z" fill="${cat.color || '#' + Math.floor(Math.random()*16777215).toString(16)}"/>`;
        // Label
        const midAngle = (startAngle + segAngle / 2) * Math.PI / 180;
        const lx = 140 + 90 * Math.cos(midAngle);
        const ly = 140 + 90 * Math.sin(midAngle);
        wheelSvg += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="11" font-weight="700" transform="rotate(${startAngle + segAngle/2 + 90}, ${lx}, ${ly})">${cat.label}</text>`;
      });
      wheelSvg += '</svg>';

      // Find category index for this item
      const catIdx = categories.findIndex(c => c.label === item.category);
      const targetAngle = 360 * 4 + (360 - (catIdx * segAngle + segAngle / 2)); // 4 full spins + land on cat

      stage.innerHTML = `
        <div style="animation:frFadeIn 0.3s;">
          <div style="font-weight:700;color:var(--fr-text-sub);text-align:center;margin-bottom:12px;">Spin ${idx + 1} / ${allItems.length}</div>
          <div class="fr-wheel-container">
            <div class="fr-wheel-pointer"></div>
            <div class="fr-wheel" id="fr-wheel">${wheelSvg}</div>
            <div class="fr-wheel-center">🎯</div>
          </div>
          <div id="fr-roulette-q" style="display:none;animation:frFadeIn 0.3s;"></div>
        </div>
      `;

      // Spin animation
      const wheel = el('fr-wheel');
      setTimeout(() => {
        wheel.style.transform = 'rotate(' + targetAngle + 'deg)';
      }, 100);

      // Show question after spin
      setTimeout(() => {
        const qDiv = el('fr-roulette-q');
        qDiv.style.display = 'block';
        const choices = shuffle(item.choices.slice());
        qDiv.innerHTML = `
          <div style="text-align:center;margin-bottom:8px;">
            <span style="display:inline-block;padding:4px 14px;border-radius:20px;background:${item.color || '#E91E63'};color:white;font-weight:700;font-size:0.85rem;">${item.category}</span>
          </div>
          <div style="font-weight:700;font-size:1.1rem;text-align:center;margin-bottom:12px;">${item.q}</div>
          <div class="fr-choices" id="fr-roul-choices">
            ${choices.map(c => `<button class="fr-choice" data-val="${c}">${c}</button>`).join('')}
          </div>
          <div class="fr-explanation" id="fr-roul-explain">${item.explanation || ''}</div>
        `;
        el('fr-roul-choices').querySelectorAll('.fr-choice').forEach(btn => {
          btn.onclick = () => {
            const correct = btn.dataset.val === item.answer;
            if (correct) score++;
            el('fr-roul-choices').querySelectorAll('.fr-choice').forEach(b => {
              b.classList.add('locked');
              if (b.dataset.val === item.answer) b.classList.add('correct');
              else if (b === btn) b.classList.add('wrong');
            });
            el('fr-roul-explain').classList.add('show');
            idx++;
            setTimeout(showSpin, 2000);
          };
        });
      }, 3300);
    }

    showSpin();
  }

  // ══════════════════════════════════════════════════════════════
  //  SECTION 4: SCRAMBLE RELAY
  // ══════════════════════════════════════════════════════════════
  function renderScrambleRelay(stage, sec) {
    const items = sec.items;
    let idx = 0, score = 0;

    function showRelay() {
      if (idx >= items.length) {
        finishSection(score, items.length * 2); // 2pts max per scramble
        return;
      }
      const item = items[idx];
      let order = [];
      let attempts = 0;

      const allWords = shuffle([...item.segments, ...(item.distractors || [])]);
      const altFulls = (item.alts || []).map(a => a.join(''));

      stage.innerHTML = `
        <div style="animation:frFadeIn 0.3s;">
          <div class="fr-relay-track">
            ${items.map((_, i) => `<div class="fr-relay-dot ${i < idx ? 'done' : i === idx ? 'active' : ''}">${i + 1}</div>`).join('')}
          </div>
          <div style="font-weight:700;margin-bottom:12px;text-align:center;">${item.q}</div>
          <div class="fr-scramble-box" id="fr-scr-box">
            <span style="color:#aaa;">Tap words below...</span>
          </div>
          <div class="fr-chip-pool" id="fr-scr-pool">
            ${allWords.map(w => `<div class="fr-chip" data-word="${w}">${w}</div>`).join('')}
          </div>
          <div style="text-align:center;">
            <button class="fr-btn fr-btn-secondary" id="fr-scr-clear" style="margin-right:8px;">Clear</button>
            <button class="fr-btn fr-btn-primary" id="fr-scr-check" disabled>Check ✓</button>
          </div>
          <div class="fr-explanation" id="fr-scr-explain">${item.explanation || ''}</div>
        </div>
      `;

      const box = el('fr-scr-box');
      const pool = el('fr-scr-pool');
      const checkBtn = el('fr-scr-check');
      const clearBtn = el('fr-scr-clear');

      function updateCheck() {
        checkBtn.disabled = order.length !== item.segments.length;
        checkBtn.style.opacity = checkBtn.disabled ? '0.4' : '1';
      }

      pool.querySelectorAll('.fr-chip').forEach(chip => {
        chip.onclick = () => {
          if (chip.classList.contains('used')) return;
          chip.classList.add('used');
          order.push(chip.dataset.word);

          // Clear placeholder
          if (box.querySelector('span')) box.innerHTML = '';

          const inChip = document.createElement('div');
          inChip.className = 'fr-chip in-box';
          inChip.textContent = chip.dataset.word;
          inChip.onclick = () => {
            inChip.remove();
            chip.classList.remove('used');
            order = order.filter((w, i) => {
              if (w === chip.dataset.word) {
                order.splice(i, 1);
                return false;
              }
              return true;
            });
            // Recalculate order from box
            order = Array.from(box.querySelectorAll('.fr-chip')).map(c => c.textContent);
            if (order.length === 0) box.innerHTML = '<span style="color:#aaa;">Tap words below...</span>';
            box.classList.remove('correct', 'wrong');
            updateCheck();
          };
          box.appendChild(inChip);
          box.classList.remove('correct', 'wrong');
          updateCheck();
        };
      });

      clearBtn.onclick = () => {
        pool.querySelectorAll('.fr-chip').forEach(c => c.classList.remove('used'));
        order = [];
        box.innerHTML = '<span style="color:#aaa;">Tap words below...</span>';
        box.classList.remove('correct', 'wrong');
        updateCheck();
      };

      checkBtn.onclick = () => {
        const userAnswer = order.join('');
        const full = item.segments.join('');
        const isCorrect = userAnswer === full || altFulls.includes(userAnswer);
        attempts++;

        if (isCorrect) {
          box.classList.add('correct');
          const pts = attempts === 1 ? 2 : 1;
          score += pts;
          pool.querySelectorAll('.fr-chip').forEach(c => c.style.pointerEvents = 'none');
          checkBtn.style.display = 'none';
          clearBtn.style.display = 'none';
          el('fr-scr-explain').classList.add('show');
          idx++;
          setTimeout(showRelay, 1800);
        } else {
          box.classList.add('wrong');
          if (attempts >= 3) {
            // Show answer
            box.innerHTML = item.segments.map(s => `<div class="fr-chip in-box">${s}</div>`).join('');
            box.classList.remove('wrong');
            box.classList.add('correct');
            checkBtn.style.display = 'none';
            clearBtn.style.display = 'none';
            el('fr-scr-explain').classList.add('show');
            idx++;
            setTimeout(showRelay, 2000);
          }
        }
      };
    }

    showRelay();
  }

  // ══════════════════════════════════════════════════════════════
  //  SECTION 5: DETECTIVE READING
  // ══════════════════════════════════════════════════════════════
  function renderDetectiveReading(stage, sec) {
    const passages = sec.passages;
    const questions = sec.questions;
    let passIdx = 0, qIdx = 0, score = 0;
    let readPassages = [];

    function showPassage() {
      if (passIdx >= passages.length) {
        showQuestions();
        return;
      }
      const p = passages[passIdx];
      readPassages.push(p);
      stage.innerHTML = `
        <div style="animation:frFadeIn 0.3s;">
          <div class="fr-clue-badge">Clue ${passIdx + 1} of ${passages.length}</div>
          <div class="fr-passage">
            ${p.lines.map(l => `<div style="margin-bottom:8px;">${processText(l.jp, l.terms)}</div>`).join('')}
          </div>
          <div style="text-align:center;">
            <button class="fr-btn fr-btn-primary" id="fr-det-next">${passIdx < passages.length - 1 ? 'Next Clue →' : 'Answer Questions →'}</button>
          </div>
        </div>
      `;
      el('fr-det-next').onclick = () => {
        passIdx++;
        showPassage();
      };
    }

    function showQuestions() {
      if (qIdx >= questions.length) {
        finishSection(score, questions.length);
        return;
      }
      const q = questions[qIdx];
      const choices = shuffle(q.choices.slice());
      stage.innerHTML = `
        <div style="animation:frFadeIn 0.3s;">
          <div style="font-weight:700;color:var(--fr-text-sub);margin-bottom:8px;">Question ${qIdx + 1} / ${questions.length}</div>
          <div style="font-weight:700;font-size:1.1rem;margin-bottom:16px;">${q.q}</div>
          <div class="fr-choices" id="fr-det-choices">
            ${choices.map(c => `<button class="fr-choice" data-val="${c}">${c}</button>`).join('')}
          </div>
          <div class="fr-explanation" id="fr-det-explain">${q.explanation || ''}</div>
        </div>
      `;
      el('fr-det-choices').querySelectorAll('.fr-choice').forEach(btn => {
        btn.onclick = () => {
          const correct = btn.dataset.val === q.answer;
          if (correct) score++;
          el('fr-det-choices').querySelectorAll('.fr-choice').forEach(b => {
            b.classList.add('locked');
            if (b.dataset.val === q.answer) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
          });
          el('fr-det-explain').classList.add('show');
          qIdx++;
          setTimeout(showQuestions, 2000);
        };
      });
    }

    showPassage();
  }

  // ══════════════════════════════════════════════════════════════
  //  SECTION 6: MATCH PAIRS
  // ══════════════════════════════════════════════════════════════
  function renderMatchPairs(stage, sec) {
    const pairs = shuffle(sec.pairs).slice(0, sec.count || 8);
    // Build cards: each pair creates 2 cards (kanji + meaning)
    let cards = [];
    pairs.forEach((p, i) => {
      cards.push({ id: i, type: 'kanji', display: p.kanji, pairId: i });
      cards.push({ id: i, type: 'meaning', display: p.meaning, pairId: i });
    });
    cards = shuffle(cards);

    let matched = 0, moves = 0;
    let flipped = [];
    let locked = false;
    const total = pairs.length;
    const cols = cards.length <= 12 ? 4 : 4;

    function render() {
      stage.innerHTML = `
        <div style="animation:frFadeIn 0.3s;">
          <div class="fr-section-title">🃏 Match Pairs</div>
          <div class="fr-match-moves" id="fr-match-moves">Moves: ${moves} | Matched: ${matched}/${total}</div>
          <div class="fr-match-grid" id="fr-match-grid" style="grid-template-columns:repeat(${cols},1fr);max-width:${cols * 90}px;">
            ${cards.map((c, i) => `
              <div class="fr-match-card ${c.matched ? 'matched flipped' : ''}" data-idx="${i}" id="fr-mc-${i}">
                <span class="fr-card-front" style="display:${c.matched ? 'block' : 'none'}">${c.display}</span>
                <span class="fr-card-back" style="display:${c.matched ? 'none' : 'block'}">?</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      el('fr-match-grid').querySelectorAll('.fr-match-card').forEach(card => {
        card.onclick = () => {
          if (locked) return;
          const i = parseInt(card.dataset.idx);
          if (cards[i].matched || flipped.includes(i)) return;

          // Flip
          flipped.push(i);
          card.classList.add('flipped');
          card.querySelector('.fr-card-front').style.display = 'block';
          card.querySelector('.fr-card-back').style.display = 'none';

          if (flipped.length === 2) {
            moves++;
            locked = true;
            const [a, b] = flipped;
            const match = cards[a].pairId === cards[b].pairId && cards[a].type !== cards[b].type;

            setTimeout(() => {
              if (match) {
                cards[a].matched = true;
                cards[b].matched = true;
                matched++;
                document.getElementById('fr-mc-' + a).classList.add('matched');
                document.getElementById('fr-mc-' + b).classList.add('matched');
              } else {
                [a, b].forEach(x => {
                  const el = document.getElementById('fr-mc-' + x);
                  el.classList.add('wrong-flip');
                  setTimeout(() => {
                    el.classList.remove('flipped', 'wrong-flip');
                    el.querySelector('.fr-card-front').style.display = 'none';
                    el.querySelector('.fr-card-back').style.display = 'block';
                  }, 500);
                });
              }
              flipped = [];
              locked = false;
              el('fr-match-moves').textContent = `Moves: ${moves} | Matched: ${matched}/${total}`;

              if (matched === total) {
                // Score based on efficiency
                const efficiency = Math.max(0, total * 2 - moves + total);
                const maxEff = total * 2;
                const pts = Math.min(total, Math.round((efficiency / maxEff) * total));
                setTimeout(() => finishSection(pts, total), 800);
              }
            }, 600);
          }
        };
      });
    }

    render();
  }

  // ══════════════════════════════════════════════════════════════
  //  SECTION 7: VOCAB CATEGORIES
  // ══════════════════════════════════════════════════════════════
  function renderVocabCategories(stage, sec) {
    const rounds = sec.rounds;
    let roundIdx = 0, score = 0, totalPossible = 0;

    function showRound() {
      if (roundIdx >= rounds.length) {
        finishSection(score, totalPossible);
        return;
      }
      const round = rounds[roundIdx];
      const allWords = shuffle(round.groups.flatMap(g => g.words));
      const placements = {}; // word -> groupIdx
      let selected = null;

      totalPossible += allWords.length;

      stage.innerHTML = `
        <div style="animation:frFadeIn 0.3s;">
          <div style="font-weight:700;color:var(--fr-text-sub);text-align:center;margin-bottom:12px;">Round ${roundIdx + 1} / ${rounds.length}</div>
          <div class="fr-section-desc">Sort these words into the correct categories!</div>
          <div class="fr-cat-bank" id="fr-cat-bank">
            ${allWords.map(w => `<div class="fr-cat-word" data-word="${w}">${w}</div>`).join('')}
          </div>
          <div class="fr-cat-slots" id="fr-cat-slots">
            ${round.groups.map((g, i) => `
              <div class="fr-cat-group" data-group="${i}" id="fr-catg-${i}">
                <div class="fr-cat-group-title">${g.label}</div>
                <div class="fr-cat-placed" id="fr-catplaced-${i}"></div>
              </div>
            `).join('')}
          </div>
          <div style="text-align:center;">
            <button class="fr-btn fr-btn-primary" id="fr-cat-check" disabled>Check Answers</button>
          </div>
        </div>
      `;

      // Word selection
      el('fr-cat-bank').querySelectorAll('.fr-cat-word').forEach(word => {
        word.onclick = () => {
          if (word.classList.contains('placed')) return;
          document.querySelectorAll('.fr-cat-word.selected').forEach(w => w.classList.remove('selected'));
          word.classList.add('selected');
          selected = word.dataset.word;
        };
      });

      // Group clicking to place
      el('fr-cat-slots').querySelectorAll('.fr-cat-group').forEach(group => {
        group.onclick = () => {
          if (!selected) return;
          const gIdx = parseInt(group.dataset.group);
          placements[selected] = gIdx;

          // Show in group
          const placed = el('fr-catplaced-' + gIdx);
          const chip = document.createElement('span');
          chip.className = 'fr-cat-placed-word';
          chip.textContent = selected;
          chip.dataset.word = selected;
          chip.onclick = (e) => {
            e.stopPropagation();
            delete placements[chip.dataset.word];
            chip.remove();
            // Unmark in bank
            el('fr-cat-bank').querySelectorAll('.fr-cat-word').forEach(w => {
              if (w.dataset.word === chip.dataset.word) w.classList.remove('placed');
            });
            updateCheckBtn();
          };
          placed.appendChild(chip);

          // Mark used
          el('fr-cat-bank').querySelectorAll('.fr-cat-word').forEach(w => {
            if (w.dataset.word === selected) {
              w.classList.remove('selected');
              w.classList.add('placed');
            }
          });
          selected = null;
          updateCheckBtn();
        };
      });

      function updateCheckBtn() {
        const allPlaced = Object.keys(placements).length === allWords.length;
        el('fr-cat-check').disabled = !allPlaced;
        el('fr-cat-check').style.opacity = allPlaced ? '1' : '0.4';
      }

      el('fr-cat-check').onclick = () => {
        // Score
        let roundScore = 0;
        round.groups.forEach((g, gIdx) => {
          g.words.forEach(w => {
            if (placements[w] === gIdx) roundScore++;
          });
          // Color groups
          const groupEl = el('fr-catg-' + gIdx);
          const allCorrect = g.words.every(w => placements[w] === gIdx);
          groupEl.classList.add(allCorrect ? 'correct' : 'wrong');
        });
        score += roundScore;

        // Disable interaction
        el('fr-cat-bank').querySelectorAll('.fr-cat-word').forEach(w => w.style.pointerEvents = 'none');
        el('fr-cat-slots').querySelectorAll('.fr-cat-group').forEach(g => g.style.cursor = 'default');
        el('fr-cat-check').style.display = 'none';

        roundIdx++;
        setTimeout(showRound, 1800);
      };
    }

    showRound();
  }

  // ══════════════════════════════════════════════════════════════
  //  SECTION 8: KANJI BINGO (Grand Finale!)
  // ══════════════════════════════════════════════════════════════
  function renderKanjiBingo(stage, sec) {
    const pool = shuffle(sec.kanjiPool.slice());
    // Pick 24 for the grid (center is free)
    const gridKanji = pool.slice(0, 24);
    const grid = []; // 25 cells, idx 12 is free
    let gi = 0;
    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        grid.push({ kanji: 'FREE', reading: '', meaning: 'りきぞう', stamped: true, isFree: true });
      } else {
        grid.push({ ...gridKanji[gi], stamped: false, isFree: false });
        gi++;
      }
    }

    // Build call queue from the grid kanji (shuffled)
    const callQueue = shuffle(gridKanji.slice());
    let callIdx = 0;
    let bingoCount = 0;
    let stamped = 1; // free space
    const bingoLines = [];
    let score = 0;
    const maxScore = sec.bingoTarget || 1; // points per bingo line

    function checkBingo() {
      const lines = [
        [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24], // rows
        [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24], // cols
        [0,6,12,18,24],[4,8,12,16,20] // diags
      ];
      let newBingos = 0;
      lines.forEach((line, li) => {
        if (bingoLines.includes(li)) return;
        if (line.every(i => grid[i].stamped)) {
          bingoLines.push(li);
          newBingos++;
          // Highlight
          line.forEach(i => {
            const cell = document.getElementById('fr-bc-' + i);
            if (cell) cell.classList.add('bingo-line');
          });
        }
      });
      return newBingos;
    }

    function render() {
      const currentCall = callIdx < callQueue.length ? callQueue[callIdx] : null;

      stage.innerHTML = `
        <div style="animation:frFadeIn 0.3s;">
          <div class="fr-section-title">🎰 Kanji Bingo</div>
          <div class="fr-bingo-status" id="fr-bingo-status">
            ${bingoLines.length > 0 ? '🎉 BINGO x' + bingoLines.length + '!' : 'Find the kanji on your card!'}
          </div>
          ${currentCall ? `
            <div class="fr-bingo-call" id="fr-bingo-call">
              <div class="fr-bingo-call-label">Now Calling</div>
              <div class="fr-bingo-call-text">${currentCall.reading}</div>
              <div class="fr-bingo-call-hint">${currentCall.meaning}</div>
            </div>
          ` : '<div class="fr-bingo-call"><div class="fr-bingo-call-text">Game Over!</div></div>'}
          <div class="fr-bingo-grid" id="fr-bingo-grid">
            ${grid.map((cell, i) => `
              <div class="fr-bingo-cell ${cell.stamped ? (cell.isFree ? 'free' : 'stamped') : ''} ${bingoLines.some(li => {
                const lines = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],[0,6,12,18,24],[4,8,12,16,20]];
                return lines[li] && lines[li].includes(i);
              }) ? 'bingo-line' : ''}"
                id="fr-bc-${i}" data-idx="${i}">
                ${cell.isFree ? '' : cell.kanji}
              </div>
            `).join('')}
          </div>
          <div style="text-align:center;margin-top:12px;">
            <span style="font-size:0.85rem;color:var(--fr-text-sub);">Stamped: ${stamped}/25 | Bingos: ${bingoLines.length}</span>
          </div>
          ${callIdx >= callQueue.length || bingoLines.length >= (sec.bingoTarget || 3) ? `
            <div style="text-align:center;margin-top:16px;">
              <button class="fr-btn fr-btn-primary" id="fr-bingo-finish">Finish Bingo!</button>
            </div>
          ` : ''}
        </div>
      `;

      // Cell clicks
      if (currentCall) {
        el('fr-bingo-grid').querySelectorAll('.fr-bingo-cell').forEach(cell => {
          cell.onclick = () => {
            const i = parseInt(cell.dataset.idx);
            if (grid[i].stamped || grid[i].isFree) return;

            if (grid[i].kanji === currentCall.kanji) {
              // Correct!
              grid[i].stamped = true;
              stamped++;
              cell.classList.add('stamped');

              // Check bingo
              const newBingos = checkBingo();
              if (newBingos > 0) {
                score += newBingos;
                bingoCount += newBingos;
              }

              // Next call
              callIdx++;
              setTimeout(render, 600);
            } else {
              // Wrong
              cell.classList.add('wrong-tap');
              setTimeout(() => cell.classList.remove('wrong-tap'), 400);
            }
          };
        });
      }

      // Finish button
      const finBtn = document.getElementById('fr-bingo-finish');
      if (finBtn) {
        finBtn.onclick = () => {
          const maxBingo = sec.bingoTarget || 3;
          finishSection(Math.min(score, maxBingo), maxBingo);
        };
      }
    }

    render();
  }

  // ══════════════════════════════════════════════════════════════
  //  FINAL SCREEN
  // ══════════════════════════════════════════════════════════════
  function renderFinalScreen() {
    updateProgress();
    const pct = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 100;
    const stage = el('fr-stage');

    let rank, rankColor;
    if (pct >= 100) { rank = '神！ Godlike!'; rankColor = '#8B5CF6'; }
    else if (pct >= 90) { rank = '天才！ Genius!'; rankColor = '#E91E63'; }
    else if (pct >= 80) { rank = 'すばらしい！ Wonderful!'; rankColor = '#00BCD4'; }
    else if (pct >= 70) { rank = 'さすが！ Impressive!'; rankColor = '#FF6B35'; }
    else if (pct >= 60) { rank = 'いいね！ Nice!'; rankColor = '#FFD700'; }
    else { rank = '頑張れ！ Keep Going!'; rankColor = '#747d8c'; }

    // Save score
    if (window.JPShared && window.JPShared.progress) {
      const prev = window.JPShared.progress.getReviewScore('N4.Final.Review');
      if (prev === undefined || pct > prev) {
        window.JPShared.progress.setReviewScore('N4.Final.Review', pct);
      }
    }

    stage.innerHTML = `
      <div class="fr-final">
        <div style="font-size:3rem;margin-bottom:10px;">🏆</div>
        <div style="font-size:0.85rem;font-weight:700;color:var(--fr-text-sub);text-transform:uppercase;letter-spacing:1px;">Final Score</div>
        <div class="fr-final-pct">${pct}%</div>
        <div class="fr-final-rank" style="color:${rankColor};">${rank}</div>
        <div style="margin:12px 0 8px;font-size:1.1rem;color:var(--fr-text-sub);">${totalScore} / ${maxPossible} points</div>
        <div style="margin-bottom:24px;">
          ${sectionScores.map((s, i) => {
            const secName = reviewData.sections[i] ? reviewData.sections[i].title : 'Section ' + (i+1);
            const secPct = s.possible > 0 ? Math.round((s.earned / s.possible) * 100) : 100;
            return `<div style="display:flex;justify-content:space-between;max-width:350px;margin:4px auto;font-size:0.9rem;">
              <span>${secName}</span>
              <span style="font-weight:700;color:${secPct >= 80 ? '#28a745' : secPct >= 60 ? '#FFD700' : '#dc3545'};">${s.earned}/${s.possible}</span>
            </div>`;
          }).join('')}
        </div>
        <button class="fr-btn fr-btn-primary" style="margin-right:10px;" onclick="window.FinalReviewModule.start(document.getElementById('jp-fr-root').parentElement, window.FinalReviewModule._config, window.FinalReviewModule._onExit)">Try Again</button>
        <button class="fr-btn fr-btn-secondary" onclick="window.FinalReviewModule._onExit()">Back to Menu</button>
      </div>
    `;
  }

  // ── Public interface ──
  return {
    start: function(c, cfg, exit) {
      this._config = cfg;
      this._onExit = exit;
      start(c, cfg, exit);
    }
  };
})();
