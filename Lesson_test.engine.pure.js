(function () {
  const cfg = window.JP_LESSON_CONFIG;
  if (!cfg) {
    console.error("[JP Lesson] Missing window.JP_LESSON_CONFIG. Define it before loading this script.", {
      expected: { rootId: "jp-lesson-root", lessonUrl: "...", glossaryUrl: "...", rulesUrl: "..." }
    });
    return;
  }

  const lessonUrl = cfg.lessonUrl;
  const glossaryUrl = cfg.glossaryUrl;
  const rulesUrlCfg = cfg.rulesUrl;
  const rootId = cfg.rootId || "jp-lesson-root";

  if (!lessonUrl || !glossaryUrl) {
    console.error("[JP Lesson] lessonUrl/glossaryUrl missing in JP_LESSON_CONFIG.", cfg);
    return;
  }

  const resolveUrl = (u) => new URL(u, window.location.href).href;
  const inferredRulesUrl = rulesUrlCfg || new URL("conjugation_rules.json", new URL(glossaryUrl, window.location.href)).href;

  const root = document.getElementById(rootId);
  if (!root) return;

  // --- State ---
  let currentStep = 0;
  let totalSteps = 0;
  let lessonData = null;
  let termMapData = {};
  let showEN = false;

  // --- Styles ---
  const style = document.createElement("style");
  style.textContent = `
    #${rootId} {
      --primary: #4e54c8; --primary-dark: #3f44a5;
      --bg-grad: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
      --text-main: #2f3542; --text-sub: #747d8c;
      font-family: 'Poppins', 'Noto Sans JP', sans-serif;
      color: var(--text-main); background: var(--bg-grad);
      border-radius: 18px; overflow: hidden; max-width: 820px; margin: 0 auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      position: relative; min-height: 600px; display: flex; flex-direction: column;
    }
    #${rootId} .jp-header {
      background: #fff; padding: 15px 20px; border-bottom: 1px solid rgba(0,0,0,0.05);
      display: flex; align-items: center; justify-content: space-between;
    }
    #${rootId} .jp-title { font-weight: 900; font-size: 1.1rem; color: var(--primary); }
    #${rootId} .jp-progress-container { height: 6px; width: 100%; background: #eee; }
    #${rootId} .jp-progress-bar { height: 100%; background: var(--primary); width: 0%; transition: width 0.3s ease; }
    #${rootId} .jp-body { padding: 20px; flex: 1; overflow-y: auto; }
    #${rootId} .jp-footer {
      padding: 15px 20px; background: #fff; border-top: 1px solid rgba(0,0,0,0.05);
      display: flex; gap: 10px; justify-content: space-between;
    }
    #${rootId} .jp-nav-btn {
      padding: 10px 20px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer;
    }
    #${rootId} .jp-nav-btn.prev { background: #f1f2f6; color: var(--text-sub); }
    #${rootId} .jp-nav-btn.next { background: var(--primary); color: #fff; box-shadow: 0 4px 10px rgba(78,84,200,0.3); }
    #${rootId} .jp-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    #${rootId} .jp-card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); margin-bottom: 15px; }

    /* Intro Card Specifics */
    #${rootId} .jp-intro-card { text-align: center; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
    #${rootId} .jp-intro-title { font-size: 2rem; color: var(--primary); margin-bottom: 20px; line-height: 1.2; }
    #${rootId} .jp-intro-focus { font-size: 1.1rem; color: var(--text-sub); margin-bottom: 40px; background: #f8f9fa; padding: 15px 25px; border-radius: 50px; display: inline-block; }
    #${rootId} .jp-intro-kanji-row { font-size: 2.5rem; font-weight: 900; color: var(--text-main); display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
    #${rootId} .jp-intro-dot { color: var(--primary); opacity: 0.4; }

    #${rootId} .jp-row { display: flex; gap: 12px; margin-bottom: 15px; align-items: flex-start; }
    #${rootId} .jp-spk {
      background: #f1f2f6; color: var(--primary-dark); font-weight: 900;
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      border-radius: 8px; flex-shrink: 0;
    }
    #${rootId} .jp-jp { font-size: 1.2rem; line-height: 1.6; font-family: 'Noto Sans JP', sans-serif; }
    #${rootId} .jp-en { font-size: 0.9rem; color: var(--text-sub); margin-top: 4px; display: none; }
    #${rootId} .jp-term {
      color: var(--primary); font-weight: 700; cursor: pointer;
      border-bottom: 2px solid rgba(78,84,200,0.1); transition: 0.2s;
    }
    #${rootId} .jp-term:hover { background: rgba(78,84,200,0.05); border-bottom-color: var(--primary); }
    #${rootId} .jp-toggle-en {
      font-size: 0.8rem; font-weight: 700; color: var(--text-sub);
      background: #f1f2f6; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-bottom: 15px;
    }

    /* Flip Cards */
    #${rootId} .jp-kanji-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
    #${rootId} .jp-flip-container { perspective: 1000px; cursor: pointer; height: 180px; }
    #${rootId} .jp-flip-inner {
      position: relative; width: 100%; height: 100%; text-align: center;
      transition: transform 0.6s; transform-style: preserve-3d;
      border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    #${rootId} .jp-flip-container.flipped .jp-flip-inner { transform: rotateY(180deg); }
    #${rootId} .jp-flip-front, #${rootId} .jp-flip-back {
      position: absolute; width: 100%; height: 100%;
      -webkit-backface-visibility: hidden; backface-visibility: hidden;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);
    }
    #${rootId} .jp-flip-front { z-index: 2; }
    #${rootId} .jp-flip-back { transform: rotateY(180deg); background: #fdfdfd; padding: 10px; }
    #${rootId} .jp-k-char { font-size: 3.5rem; font-weight: 900; color: var(--text-main); line-height: 1; }
    #${rootId} .jp-k-sub { font-size: 0.9rem; color: var(--text-sub); margin-top: 8px; font-weight: 600; }
    #${rootId} .jp-k-readings { font-size: 0.85rem; color: var(--text-main); margin-bottom: 5px; }
    #${rootId} .jp-k-meaning { font-size: 0.95rem; font-weight: 800; color: var(--primary); }

    /* Modal */
    .jp-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      z-index: 999999; display: none; align-items: center; justify-content: center;
    }
    .jp-modal {
      background: #fff; width: 90%; max-width: 500px; border-radius: 20px; padding: 25px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25); position: relative;
    }
    .jp-close-btn { position: absolute; top: 15px; right: 15px; background: #f1f2f6; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; }

    /* MCQ */
    #${rootId} .jp-mcq-opt {
      display: block; width: 100%; text-align: left; padding: 12px 15px; margin-bottom: 8px;
      background: #fff; border: 2px solid #eee; border-radius: 12px; cursor: pointer; font-weight: 600;
    }
    #${rootId} .jp-mcq-opt.correct { background: #d4edda; border-color: #c3e6cb; }
    #${rootId} .jp-mcq-opt.wrong { background: #f8d7da; border-color: #f5c6cb; }
  `;
  document.head.appendChild(style);

  // --- Helpers ---
  function el(tag, cls, inner) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (inner !== undefined) {
      if(typeof inner === 'string') e.innerHTML = inner;
      else e.appendChild(inner);
    }
    return e;
  }
  function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function escAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }


  // --- Conjugation Logic ---
  const GODAN_MAPS = {
      u_to_i: { 'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち', 'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り' },
      u_to_a: { 'う': 'わ', 'く': 'か', 'ぐ': 'が', 'す': 'さ', 'つ': 'た', 'ぬ': 'な', 'ぶ': 'ば', 'む': 'ま', 'る': 'ら' },
      u_to_e: { 'う': 'え', 'く': 'け', 'ぐ': 'げ', 'す': 'せ', 'つ': 'て', 'ぬ': 'ね', 'ぶ': 'べ', 'む': 'め', 'る': 'れ' },
      ta_form: { 'う': 'った', 'つ': 'った', 'る': 'った', 'む': 'んだ', 'ぶ': 'んだ', 'ぬ': 'んだ', 'く': 'いた', 'ぐ': 'いだ', 'す': 'した' },
      te_form: { 'う': 'って', 'つ': 'って', 'る': 'って', 'む': 'んで', 'ぶ': 'んで', 'ぬ': 'んで', 'く': 'いて', 'ぐ': 'いで', 'す': 'して' }
  };

  function conjugate(term, ruleKey) {
      if (!term || !window.CONJUGATION_RULES) return term;

      const formDef = window.CONJUGATION_RULES[ruleKey];
      if (!formDef) return term;

      // --- ROBUST CLASS DETECTION (UPDATED) ---
      // 1. Get the raw class from glossary
      let vClass = term.verb_class || term.gtype;

      // 2. Normalize common variations
      if (vClass === 'u') vClass = 'godan';
      if (vClass === 'ru') vClass = 'ichidan';
      if (vClass === 'verb') vClass = 'godan'; // Fallback for verbs without explicit class
      if (vClass === 'adjective' || vClass === 'i-adjective') vClass = 'i_adj';
      if (vClass === 'na-adjective') vClass = 'na_adj';
      if (!vClass) vClass = 'godan'; // Ultimate fallback

      const rule = formDef.rules[vClass];
      if (!rule) return term; // If no rule matches, return original

      let newSurface = term.surface;
      let newReading = term.reading || "";

      // 1. Irregular / Complete Replacement
      if (rule.type === 'replace') {
        newSurface = rule.surface;
        newReading = rule.reading;
      }
      // 2. Suffix (Remove + Add, or just Add)
      else if (rule.type === 'suffix') {
        if (rule.remove && newSurface.endsWith(rule.remove)) {
           newSurface = newSurface.slice(0, -rule.remove.length) + rule.add;
           // Attempt to remove from reading too if possible, else just append
           if (newReading.endsWith(rule.remove)) {
             newReading = newReading.slice(0, -rule.remove.length) + rule.add;
           } else {
             newReading += rule.add;
           }
        } else {
           newSurface += rule.add;
           newReading += rule.add;
        }
      }
      // 3. Godan Vowel Change (u -> i, u -> a, etc.)
      else if (rule.type === 'godan_change') {
        const lastChar = newSurface.slice(-1);
        const lastRead = newReading.slice(-1);
        const map = GODAN_MAPS[rule.map];

        if (map && map[lastChar]) {
          newSurface = newSurface.slice(0, -1) + map[lastChar] + rule.add;
          newReading = newReading.slice(0, -1) + (map[lastRead] || lastRead) + rule.add;
        }
      }
      // 4. Godan Euphonic Changes (Te/Ta forms)
      else if (rule.type === 'godan_euphonic') {
        // Special Exception: Iku (To Go)
        if (term.id === 'v_iku' || term.surface === '行く') {
           const suffix = (rule.map === 'te_form') ? 'って' : 'った'; // itte/itta
           newSurface = '行' + suffix;
           newReading = 'い' + suffix;
        } else {
           const lastChar = newSurface.slice(-1);
           const lastRead = (newReading && newReading.slice(-1)) || lastChar;
           const suffixMap = GODAN_MAPS[rule.map];
           const suffix = (suffixMap && suffixMap[lastRead])
                          ? suffixMap[lastRead]
                          : (rule.map === 'te_form' ? 'て' : 'た'); // Default fallback

           newSurface = newSurface.slice(0, -1) + suffix;
           newReading = newReading.slice(0, -1) + suffix;
        }
      }

      return {
        ...term,
        id: `${term.id}_${ruleKey}`,
        surface: newSurface,
        reading: newReading,
        meaning: `${term.meaning} <br><small style="color:#666; font-weight:400">${formDef.label}</small>`,
        notes: `Original: ${term.surface}. ${formDef.description || ""}`,
        original_id: term.id
      };
  }

    // --- Text Processing ---
  function processText(text, termRefs) {
    if (!text) return "";
    let html = esc(text);
    if (!termRefs || termRefs.length === 0) return html;

    // Resolve terms (strings => glossary term, objects => conjugated term)
    const activeTerms = termRefs.map(ref => {
      if (typeof ref === "string") {
        return termMapData[ref];
      }
      if (ref && typeof ref === "object" && ref.id && ref.form) {
        const root = termMapData[ref.id];
        if (!root) {
          console.warn("Missing root term in glossary for conjugation:", ref);
          return null;
        }
        return conjugate(root, ref.form);
      }
      return null;
    }).filter(Boolean);

    // Pick the spelling that actually appears in the line (surface OR reading)
    const pickMatch = (h, t) => {
      const candidates = [];
      if (t.surface) candidates.push(t.surface);
      if (t.reading && t.reading !== t.surface) candidates.push(t.reading);

      let best = null;
      for (const c of candidates) {
        if (h.includes(c) && (!best || c.length > best.length)) best = c;
      }
      return best;
    };

    // Replace only in text nodes (avoid wrapping inside previously inserted tags)
    const replaceOutsideTags = (h, needle, replacementHtml) => {
      if (!needle) return h;
      return h
        .split(/(<[^>]+>)/g)
        .map(part => part.startsWith("<") ? part : part.split(needle).join(replacementHtml))
        .join("");
    };

    // Longest-first prevents partial replacements (e.g., 悪い vs 悪いです)
    activeTerms.sort((a, b) => {
      const aLen = Math.max((a.surface || "").length, (a.reading || "").length);
      const bLen = Math.max((b.surface || "").length, (b.reading || "").length);
      return bLen - aLen;
    });

    activeTerms.forEach(t => {
      const matchStr = pickMatch(html, t);
      if (!matchStr) {
        console.warn("No match in line for term:", t.id, {
          surface: t.surface,
          reading: t.reading,
          line: text
        });
        return;
      }

      const termId = escAttr(t.base_id || t.id);
      const conjSurface = escAttr(t.surface || "");
      const conjReading = escAttr(t.reading || "");
      const conjLabel = escAttr(t.conj_label || "");

      const wrapped =
        `<span class="jp-term" data-term-id="${termId}"` +
        ` data-conj-surface="${conjSurface}" data-conj-reading="${conjReading}" data-conj-label="${conjLabel}"` +
        ` onclick="window.JP_OPEN_TERM(this)">${matchStr}</span>`;

      html = replaceOutsideTags(html, matchStr, wrapped);
    });

    return html;
  }

  // --- Modal ---
  let modalOverlay = document.querySelector('.jp-modal-overlay');
  if (!modalOverlay) {
    modalOverlay = el("div", "jp-modal-overlay");
    modalOverlay.innerHTML = `
      <div class="jp-modal">
        <button class="jp-close-btn">✕</button>
        <h2 id="jp-m-title" style="margin:0 0 5px 0; color:#4e54c8; font-family:'Noto Sans JP'"></h2>
        <div id="jp-m-meta" style="color:#747d8c; font-weight:700; margin-bottom:15px;"></div>
        <div id="jp-m-notes" style="line-height:1.5;"></div>
      </div>`;
    document.body.appendChild(modalOverlay);
    const close = () => modalOverlay.style.display = 'none';
    modalOverlay.onclick = (e) => { if(e.target === modalOverlay) close(); };
    modalOverlay.querySelector('.jp-close-btn').onclick = close;
  }
  window.JP_OPEN_TERM = function(arg) {
    let id = null;
    let conjSurface = "";
    let conjReading = "";
    let conjLabel = "";

    if (typeof arg === "string") {
      id = arg;
    } else if (arg && arg.dataset) {
      id = arg.dataset.termId;
      conjSurface = arg.dataset.conjSurface || "";
      conjReading = arg.dataset.conjReading || "";
      conjLabel = arg.dataset.conjLabel || "";
    }

    const t = termMapData[id];
    if (!t) return;

    const title = conjSurface || t.surface;
    const reading = conjReading || t.reading || "";
    const meaning = (t.meaning || "").replace(/<[^>]*>/g, "");
    const dict = t.surface;

    // Title can contain kanji; keep it as HTML-safe text
    document.getElementById("jp-m-title").innerHTML = esc(title);

    let meta = reading;
    if (meaning) meta += (meta ? " • " : "") + meaning;
    if (conjLabel) meta += (meta ? " • " : "") + conjLabel;
    if (conjSurface && dict && conjSurface !== dict) meta += (meta ? " • " : "") + ("dict: " + dict);

    document.getElementById("jp-m-meta").innerText = meta;
    document.getElementById("jp-m-notes").innerText = t.notes || "";
    modalOverlay.style.display = "flex";
  };

  // --- Renderers ---

  function createToggle() {
    const btn = el("button", "jp-toggle-en", showEN ? "Hide English" : "Show English");
    btn.onclick = function() {
       showEN = !showEN;
       renderCurrentStep();
    };
    return btn;
  }

  function renderIntro(data) {
    const div = el("div", "jp-card jp-intro-card");
    div.appendChild(el("div", "jp-intro-title", data.title));

    if (data.meta && data.meta.focus) {
      div.appendChild(el("div", "jp-intro-focus", `<strong>Focus:</strong> ${data.meta.focus}`));
    }

    if (data.meta && data.meta.kanji) {
        const row = el("div", "jp-intro-kanji-row");
        data.meta.kanji.forEach((char, idx) => {
            let termId = null;
            for (const [key, val] of Object.entries(termMapData)) {
                if (val.surface === char && val.type === 'kanji') {
                    termId = key;
                    break;
                }
            }
            if (termId) {
                const span = el("span", "jp-term", char);
                span.onclick = () => window.JP_OPEN_TERM(termId);
                row.appendChild(span);
            } else {
                row.appendChild(el("span", "", char));
            }
            if (idx < data.meta.kanji.length - 1) {
                row.appendChild(el("span", "jp-intro-dot", "•"));
            }
        });
        div.appendChild(row);
    }
    return div;
  }

  function renderKanjiFlip(sec) {
    const grid = el("div", "jp-kanji-grid");
    (sec.items || []).forEach(k => {
      const card = el("div", "jp-flip-container");
      card.onclick = function() { this.classList.toggle('flipped'); };
      card.innerHTML = `
        <div class="jp-flip-inner">
          <div class="jp-flip-front">
            <div class="jp-k-char">${k.kanji}</div>
            <div class="jp-k-sub">Tap to Flip</div>
          </div>
          <div class="jp-flip-back">
            <div class="jp-k-readings">${k.on ? `ON: ${k.on}` : ''}<br>${k.kun ? `KUN: ${k.kun}` : ''}</div>
            <div class="jp-k-meaning">${k.meaning}</div>
          </div>
        </div>`;
      grid.appendChild(card);
    });
    return grid;
  }

  function renderConversation(sec) {
    const div = el("div", "");
    div.appendChild(createToggle());
    (sec.lines || []).forEach(line => {
      const row = el("div", "jp-row");
      row.innerHTML = `
        <div class="jp-spk">${line.spk}</div>
        <div style="flex:1">
          <div class="jp-jp">${processText(line.jp, line.terms)}</div>
          <div class="jp-en" style="display:${showEN?'block':'none'}">${esc(line.en)}</div>
        </div>`;
      div.appendChild(row);
    });
    return div;
  }

  function renderWarmup(sec) {
    const div = el("div", "");
    div.appendChild(createToggle());
    (sec.items || []).forEach((item, idx) => {
      const row = el("div", "jp-row");
      row.innerHTML = `
        <div class="jp-spk">${idx+1}</div>
        <div style="flex:1">
          <div class="jp-jp">${processText(item.jp, item.terms)}</div>
          <div class="jp-en" style="display:${showEN?'block':'none'}">${esc(item.en)}</div>
        </div>`;
      div.appendChild(row);
    });
    return div;
  }

  function renderReading(sec) {
    const div = el("div", "");
    div.appendChild(createToggle());

    const pCard = el("div", "jp-card");
    (sec.passage || []).forEach(p => {
       const row = el("div", "", `
         <div class="jp-jp" style="margin-bottom:8px;">${processText(p.jp, p.terms)}</div>
         <div class="jp-en" style="display:${showEN?'block':'none'}; margin-bottom:15px; color:#888;">${esc(p.en)}</div>
       `);
       pCard.appendChild(row);
    });
    div.appendChild(pCard);

    if (sec.questions) {
      const qCard = el("div", "jp-card");
      qCard.innerHTML = `<h3 style="margin-top:0;">Questions</h3>`;
      sec.questions.forEach((q, i) => {
         const row = el("div", "jp-row");
         row.innerHTML = `
           <div class="jp-spk">Q${i+1}</div>
           <div>
             <div class="jp-jp">${processText(q.q, q.terms)}</div>
             <div class="jp-en" style="display:${showEN?'block':'none'}">Ans: ${esc(q.a)}</div>
           </div>`;
         qCard.appendChild(row);
      });
      div.appendChild(qCard);
    }
    return div;
  }

  function renderVocab(sec) {
    const div = el("div", "");
    (sec.groups || []).forEach(g => {
        const group = el("div", "jp-card");
        group.innerHTML = `<div style="font-weight:700; color:#888; margin-bottom:10px;">${g.label}</div>`;
        const chips = el("div", "", "");
        chips.style.display = "flex"; chips.style.flexWrap = "wrap"; chips.style.gap = "8px";
        (g.items || []).forEach(ref => {
          let t;
          if(typeof ref === 'string') t = termMapData[ref];
          else if(ref.id && ref.form) t = conjugate(termMapData[ref.id], ref.form);

          if(t) {
             if(!termMapData[t.id]) termMapData[t.id] = t;

             const chip = el("div", "", t.surface);
             chip.style.cssText = "background:#f1f2f6; padding:8px 12px; border-radius:20px; font-weight:bold; cursor:pointer;";
             chip.onclick = () => JP_OPEN_TERM(t.id);
             chips.appendChild(chip);
          }
        });
        group.appendChild(chips);
        div.appendChild(group);
    });
    return div;
  }

  function renderDrills(sec) {
     const div = el("div", "");
     (sec.items || []).forEach(item => {
       if (item.kind === 'mcq') {
         const card = el("div", "jp-card");
         card.innerHTML = `<div class="jp-jp" style="margin-bottom:10px; font-weight:bold;">${processText(item.q, item.terms)}</div>`;
         const optsDiv = el("div");
         let solved = false;
         item.choices.forEach(choice => {
           const btn = el("button", "jp-mcq-opt", choice);
           btn.onclick = () => {
             if(solved) return;
             solved = true;
             if(choice === item.answer) {
                btn.classList.add("correct");
             } else {
                btn.classList.add("wrong");
                Array.from(optsDiv.children).forEach(c => { if(c.innerText === item.answer) c.classList.add("correct"); });
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

  // --- Main ---
  function renderCurrentStep() {
    const body = root.querySelector('.jp-body');
    const title = root.querySelector('.jp-title');
    const bar = root.querySelector('.jp-progress-bar');
    const prevBtn = root.querySelector('.jp-nav-btn.prev');
    const nextBtn = root.querySelector('.jp-nav-btn.next');

    body.innerHTML = "";
    bar.style.width = (((currentStep + 1) / totalSteps) * 100) + "%";

    if (currentStep >= lessonData.sections.length) {
       title.innerText = "Summary";
       body.innerHTML = `<div class="jp-card" style="text-align:center;"><h2>🎉 Lesson Complete!</h2></div>`;
       nextBtn.innerText = "Done";
       nextBtn.disabled = true;
       return;
    }

    const sec = lessonData.sections[currentStep];

    if (sec.type === 'intro') {
      title.innerText = lessonData.title;
    } else {
      title.innerText = sec.title;
    }

    const wrap = el("div");
    if(sec.instructions) wrap.appendChild(el("div", "", `<div style="margin-bottom:20px; color:#747d8c;">${sec.instructions}</div>`));

    let content = null;
    if (sec.type === "intro") content = renderIntro(lessonData);
    else if (sec.type === "kanjiGrid") content = renderKanjiFlip(sec);
    else if (sec.type === "conversation") content = renderConversation(sec);
    else if (sec.type === "vocabList") content = renderVocab(sec);
    else if (sec.type === "drills") content = renderDrills(sec);
    else if (sec.type === "warmup") content = renderWarmup(sec);
    else if (sec.type === "reading") content = renderReading(sec);

    if(content) wrap.appendChild(content);
    body.appendChild(wrap);

    prevBtn.disabled = (currentStep === 0);
    nextBtn.disabled = false;
    nextBtn.innerText = (currentStep === totalSteps - 1) ? "Finish" : "Next";
  }

  async function init() {
     try {
       const rulesUrl = inferredRulesUrl;

       const [lRes, gRes, rRes] = await Promise.all([
          fetch(lessonUrl,   { cache: "no-store" }),
          fetch(glossaryUrl, { cache: "no-store" }),
          fetch(rulesUrl,    { cache: "no-store" })
       ]);

       if (!lRes.ok) throw new Error(`Lesson fetch failed ${lRes.status} @ ${resolveUrl(lessonUrl)}`);
       if (!gRes.ok) throw new Error(`Glossary fetch failed ${gRes.status} @ ${resolveUrl(glossaryUrl)}`);
       if (!rRes.ok) throw new Error(`Rules fetch failed ${rRes.status} @ ${resolveUrl(rulesUrl)}`);

       lessonData = await lRes.json();
       const gloss = await gRes.json();
       const rulesText = await rRes.text();
       let rules;
       try {
         rules = JSON.parse(rulesText);
       } catch (e) {
         throw new Error(`Rules not valid JSON @ ${resolveUrl(rulesUrl)}: ${e.message}. First chars: ${rulesText.slice(0, 120)}`);
       }

       if (!rules || typeof rules !== "object" || Array.isArray(rules) || Object.keys(rules).length === 0) {
         throw new Error(`Rules loaded empty/invalid @ ${resolveUrl(rulesUrl)}. Check the deployed file path and that it's not an HTML fallback.`);
       }

       window.CONJUGATION_RULES = rules;
       console.log("[JP Lesson] Loaded conjugation rules:", Object.keys(rules));

       gloss.forEach(i => termMapData[i.id] = i);

       lessonData.sections.unshift({
           type: 'intro',
           title: lessonData.title
       });

       totalSteps = lessonData.sections.length;

       root.innerHTML = `
        <div class="jp-header"><div class="jp-title">Loading...</div></div>
        <div class="jp-progress-container"><div class="jp-progress-bar"></div></div>
        <div class="jp-body"></div>
        <div class="jp-footer">
            <button class="jp-nav-btn prev">Previous</button>
            <button class="jp-nav-btn next">Next</button>
        </div>`;

       root.querySelector('.jp-nav-btn.prev').onclick = () => { if(currentStep>0) { currentStep--; renderCurrentStep(); }};
       root.querySelector('.jp-nav-btn.next').onclick = () => { if(currentStep < totalSteps) { currentStep++; renderCurrentStep(); }};

       renderCurrentStep();
     } catch (err) {
       root.innerHTML = `<div style="padding:20px; color:red;">Error: ${err.message}</div>`;
     }
  }

  init();
})();