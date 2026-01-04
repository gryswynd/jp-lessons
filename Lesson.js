window.LessonModule = {
  start: function (container, sharedConfig, exitCallback) {

    // --- CONFIGURATION ---
    const REPO_CONFIG = sharedConfig;
    const root = container;

    // --- State ---
    let currentStep = 0;
    let totalSteps = 0;
    let lessonData = null;
    let termMapData = {};
    let showEN = false;
    let CONJUGATION_RULES = null;

    // --- Styles ---
    // Only add style if it doesn't exist yet
    if (!document.getElementById('jp-lesson-style')) {
        const style = document.createElement("style");
        style.id = 'jp-lesson-style';
        style.textContent = `
          /* Scoped slightly to avoid conflicts, but mostly generic */
          .jp-header {
            background: #fff; padding: 15px 20px; border-bottom: 1px solid rgba(0,0,0,0.05);
            display: flex; align-items: center; justify-content: space-between;
          }
          .jp-title { font-weight: 900; font-size: 1.1rem; color: #4e54c8; }
          .jp-progress-container { height: 6px; width: 100%; background: #eee; }
          .jp-progress-bar { height: 100%; background: #4e54c8; width: 0%; transition: width 0.3s ease; }
          .jp-body { padding: 20px; flex: 1; overflow-y: auto; background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); min-height: 500px; }
          .jp-footer {
            padding: 15px 20px; background: #fff; border-top: 1px solid rgba(0,0,0,0.05);
            display: flex; gap: 10px; justify-content: space-between;
          }
          .jp-nav-btn {
            padding: 10px 20px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer;
          }
          .jp-nav-btn.prev { background: #f1f2f6; color: #747d8c; }
          .jp-nav-btn.next { background: #4e54c8; color: #fff; box-shadow: 0 4px 10px rgba(78,84,200,0.3); }
          .jp-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }

          /* MENU STYLES */
          .jp-menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
          .jp-menu-item {
              background: #fff; padding: 20px; border-radius: 12px; cursor: pointer;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;
              border: 2px solid transparent; text-align: center;
          }
          .jp-menu-item:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(78,84,200,0.15); border-color: #4e54c8; }
          .jp-menu-id { font-weight: 900; color: #4e54c8; font-size: 1.2rem; margin-bottom: 5px; }
          .jp-menu-name { font-size: 0.9rem; color: #747d8c; }
          .jp-back-btn { background: transparent; color: #747d8c; border: none; cursor: pointer; font-weight: bold; font-size: 0.9rem; margin-right: 10px; }
          .jp-back-btn:hover { color: #4e54c8; }
          .jp-exit-btn { background: #fee; color: #e55039; border: 1px solid #fab1a0; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.8rem; }

          .jp-speaker-bubble {
            background: #f1f2f6; color: #3f44a5; font-weight: 900;
            width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
            border-radius: 8px; flex-shrink: 0;
          }

          .jp-card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); margin-bottom: 15px; }
          .jp-intro-card { text-align: center; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
          .jp-intro-title { font-size: 2rem; color: #4e54c8; margin-bottom: 20px; line-height: 1.2; }
          .jp-intro-focus { font-size: 1.1rem; color: #747d8c; margin-bottom: 40px; background: #f8f9fa; padding: 15px 25px; border-radius: 50px; display: inline-block; }
          .jp-intro-kanji-row { font-size: 2.5rem; font-weight: 900; color: #2f3542; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
          .jp-intro-dot { color: #4e54c8; opacity: 0.4; }
          .jp-row { display: flex; gap: 12px; margin-bottom: 15px; align-items: flex-start; }
          .jp-jp { font-size: 1.2rem; line-height: 1.6; font-family: 'Noto Sans JP', sans-serif; }
          .jp-en { font-size: 0.9rem; color: #747d8c; margin-top: 4px; display: none; }
          .jp-term { color: #4e54c8; font-weight: 700; cursor: pointer; border-bottom: 2px solid rgba(78,84,200,0.1); transition: 0.2s; }
          .jp-term:hover { background: rgba(78,84,200,0.05); border-bottom-color: #4e54c8; }
          .jp-toggle-en { font-size: 0.8rem; font-weight: 700; color: #747d8c; background: #f1f2f6; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-bottom: 15px; }
          .jp-kanji-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
          .jp-flip-container { perspective: 1000px; cursor: pointer; height: 180px; }
          .jp-flip-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
          .jp-flip-container.flipped .jp-flip-inner { transform: rotateY(180deg); }
          .jp-flip-front, .jp-flip-back { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); }
          .jp-flip-front { z-index: 2; }
          .jp-flip-back { transform: rotateY(180deg); background: #fdfdfd; padding: 10px; }
          .jp-k-char { font-size: 3.5rem; font-weight: 900; color: #2f3542; line-height: 1; }
          .jp-k-sub { font-size: 0.9rem; color: #747d8c; margin-top: 8px; font-weight: 600; }
          .jp-k-readings { font-size: 0.85rem; color: #2f3542; margin-bottom: 5px; }
          .jp-k-meaning { font-size: 0.95rem; font-weight: 800; color: #4e54c8; }

          .jp-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 999999; display: none; align-items: center; justify-content: center; }
          .jp-modal { background: #fff; width: 90%; max-width: 500px; border-radius: 20px; padding: 25px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); position: relative; }
          .jp-close-btn { position: absolute; top: 15px; right: 15px; background: #f1f2f6; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; }
          .jp-mcq-opt { display: block; width: 100%; text-align: left; padding: 12px 15px; margin-bottom: 8px; background: #fff; border: 2px solid #eee; border-radius: 12px; cursor: pointer; font-weight: 600; }
          .jp-mcq-opt.correct { background: #d4edda; border-color: #c3e6cb; }
          .jp-mcq-opt.wrong { background: #f8d7da; border-color: #f5c6cb; }
        `;
        document.head.appendChild(style);
    }

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
    function getCdnUrl(filename) {
        return `https://raw.githubusercontent.com/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/${REPO_CONFIG.branch}/${REPO_CONFIG.path ? REPO_CONFIG.path + '/' : ''}${filename}`;
    }

    // --- Conjugation Logic (Simplified for integration) ---
    const GODAN_MAPS = {
        u_to_i: { 'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち', 'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り' },
        u_to_a: { 'う': 'わ', 'く': 'か', 'ぐ': 'が', 'す': 'さ', 'つ': 'た', 'ぬ': 'な', 'ぶ': 'ば', 'む': 'ま', 'る': 'ら' },
        u_to_e: { 'う': 'え', 'く': 'け', 'ぐ': 'げ', 'す': 'せ', 'つ': 'て', 'ぬ': 'ね', 'ぶ': 'べ', 'む': 'め', 'る': 'れ' },
        ta_form: { 'う': 'った', 'つ': 'った', 'る': 'った', 'む': 'んだ', 'ぶ': 'んだ', 'ぬ': 'んだ', 'く': 'いた', 'ぐ': 'いだ', 'す': 'した' },
        te_form: { 'う': 'って', 'つ': 'って', 'る': 'って', 'む': 'んで', 'ぶ': 'んで', 'ぬ': 'んで', 'く': 'いて', 'ぐ': 'いで', 'す': 'して' }
    };

    async function loadResources() {
        const [gloss, conj] = await Promise.all([
             fetch(getCdnUrl("glossary.master.json")).then(r => r.json()),
             fetch(getCdnUrl("conjugation_rules.json")).then(r => r.json())
        ]);
        const map = {}; gloss.forEach(i => { map[i.id] = i; });
        return { map, conj };
    }

    function conjugate(term, ruleKey) {
        if (!term || !CONJUGATION_RULES) return term;
        const formDef = CONJUGATION_RULES[ruleKey];
        if (!formDef) return term;

        let vClass = term.verb_class || term.gtype;
        if (vClass === 'u') vClass = 'godan';
        if (vClass === 'ru') vClass = 'ichidan';
        if (vClass === 'verb') vClass = 'godan'; // Default
        if (!vClass) vClass = 'godan';

        const rule = formDef.rules[vClass];
        if (!rule) return term;

        let newSurface = term.surface;
        let newReading = term.reading || "";

        if (rule.type === 'replace') {
            newSurface = rule.surface; newReading = rule.reading;
        } else if (rule.type === 'suffix') {
            if (rule.remove && newSurface.endsWith(rule.remove)) {
               newSurface = newSurface.slice(0, -rule.remove.length) + rule.add;
               newReading = newReading.slice(0, -rule.remove.length) + rule.add; // Simplified logic
            } else {
               newSurface += rule.add; newReading += rule.add;
            }
        } else if (rule.type === 'godan_change') {
            const lastChar = newSurface.slice(-1);
            const map = GODAN_MAPS[rule.map];
            if (map && map[lastChar]) {
              newSurface = newSurface.slice(0, -1) + map[lastChar] + rule.add;
              newReading = newReading.slice(0, -1) + (GODAN_MAPS[rule.map][newReading.slice(-1)] || newReading.slice(-1)) + rule.add;
            }
        }
        // ... (Other conjugations omitted for brevity, logic remains same)
        return { ...term, id: `${term.id}_${ruleKey}`, surface: newSurface, reading: newReading, meaning: term.meaning + ` (${formDef.label})`, original_id: term.id };
    }

    // --- Text Processing ---
    function processText(text, termRefs) {
        if (!text) return "";
        let html = esc(text);
        if (!termRefs || termRefs.length === 0) return html;

        const terms = termRefs.map(ref => {
          if (typeof ref === 'string') return termMapData[ref];
          else if (typeof ref === 'object' && ref.id && ref.form) {
            const rootTerm = termMapData[ref.id];
            if (!rootTerm) return null;
            const conjugated = conjugate(rootTerm, ref.form);
            if (conjugated) termMapData[conjugated.id] = conjugated;
            return conjugated;
          }
          return null;
        }).filter(Boolean).sort((a,b) => b.surface.length - a.surface.length);

        terms.forEach(t => {
          let matchedForm = null;
          if (html.includes(t.surface)) matchedForm = t.surface;
          else if (t.reading && html.includes(t.reading)) matchedForm = t.reading;
          if (matchedForm) html = html.split(matchedForm).join(`<span class="jp-term" onclick="window.JP_OPEN_TERM('${t.id}')">${matchedForm}</span>`);
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
            <h2 id="jp-m-title" style="margin:0 0 5px 0; color:#4e54c8;"></h2>
            <div id="jp-m-meta" style="color:#747d8c; font-weight:700; margin-bottom:15px;"></div>
            <div id="jp-m-notes" style="line-height:1.5;"></div>
          </div>`;
        document.body.appendChild(modalOverlay);
        const close = () => modalOverlay.style.display = 'none';
        modalOverlay.onclick = (e) => { if(e.target === modalOverlay) close(); };
        modalOverlay.querySelector('.jp-close-btn').onclick = close;
    }
    window.JP_OPEN_TERM = function(id) {
        const t = termMapData[id];
        if (!t) return;
        document.getElementById('jp-m-title').innerHTML = t.surface;
        document.getElementById('jp-m-meta').innerText = t.reading + (t.meaning ? ` • ${t.meaning.replace(/<[^>]*>/g, '')}` : "");
        document.getElementById('jp-m-notes').innerText = t.notes || "";
        modalOverlay.style.display = 'flex';
    };

    // --- Renderers (Abbreviated to use passed root) ---
    function renderIntro(data) {
        const div = el("div", "jp-card jp-intro-card");
        div.appendChild(el("div", "jp-intro-title", data.title));
        if (data.meta && data.meta.focus) div.appendChild(el("div", "jp-intro-focus", `<strong>Focus:</strong> ${data.meta.focus}`));
        return div;
    }
    // ... [Other Renderers: renderConversation, renderDrills, etc. keep same] ...
    // Note: I'm calling them below in renderCurrentStep, ensuring they exist in scope.

    function createToggle() {
        const btn = el("button", "jp-toggle-en", showEN ? "Hide English" : "Show English");
        btn.onclick = function() { showEN = !showEN; renderCurrentStep(); };
        return btn;
    }

    function renderConversation(sec) {
        const div = el("div", ""); div.appendChild(createToggle());
        (sec.lines || []).forEach(line => {
          const row = el("div", "jp-row");
          row.innerHTML = `<div class="jp-speaker-bubble" translate="no">${line.spk}</div><div style="flex:1"><div class="jp-jp">${processText(line.jp, line.terms)}</div><div class="jp-en" style="display:${showEN?'block':'none'}">${esc(line.en)}</div></div>`;
          div.appendChild(row);
        });
        return div;
    }
    // (Include renderWarmup, renderReading, renderVocab, renderDrills, renderKanjiFlip here identical to your original file)
    // For brevity in this response, I assume you copy them back in.
    function renderKanjiFlip(sec) { /* Paste original renderKanjiFlip */
        const grid = el("div", "jp-kanji-grid");
        (sec.items || []).forEach(k => {
          const kanjiId = k.termId || (k.terms || []).find(id => termMapData[id]?.type === "kanji");
          const t = kanjiId ? termMapData[kanjiId] : null;
          const kanjiChar = t?.surface || k.kanji;
          const card = el("div", "jp-flip-container");
          card.onclick = function () { this.classList.toggle("flipped"); };
          card.innerHTML = `<div class="jp-flip-inner"><div class="jp-flip-front"><div class="jp-k-char">${kanjiChar}</div><div class="jp-k-sub">Tap to Flip</div></div><div class="jp-flip-back"><div class="jp-k-readings">${t?.on||""}<br>${t?.kun||""}</div><div class="jp-k-meaning">${t?.meaning||""}</div></div></div>`;
          grid.appendChild(card);
        });
        return grid;
    }
    function renderVocab(sec) {
        const div = el("div", "");
        (sec.groups || []).forEach(g => {
            const group = el("div", "jp-card");
            group.innerHTML = `<div style="font-weight:700; color:#888; margin-bottom:10px;">${g.label}</div>`;
            const chips = el("div", "",""); chips.style.cssText="display:flex; flex-wrap:wrap; gap:8px;";
            (g.items||[]).forEach(ref => {
                 let t = (typeof ref === 'string') ? termMapData[ref] : null;
                 if(t) {
                     const chip = el("div","",t.surface); chip.style.cssText="background:#f1f2f6; padding:8px 12px; border-radius:20px; font-weight:bold; cursor:pointer;";
                     chip.onclick = ()=>window.JP_OPEN_TERM(t.id);
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
                 if(solved) return; solved = true;
                 if(choice === item.answer) btn.classList.add("correct");
                 else btn.classList.add("wrong");
               };
               optsDiv.appendChild(btn);
             });
             card.appendChild(optsDiv);
             div.appendChild(card);
           }
         });
         return div;
    }
    function renderWarmup(sec) { return renderConversation(sec); } // Reuse
    function renderReading(sec) {
        const div = el("div", ""); div.appendChild(createToggle());
        const pCard = el("div", "jp-card");
        (sec.passage || []).forEach(p => { pCard.appendChild(el("div", "", `<div class="jp-jp" style="margin-bottom:8px;">${processText(p.jp, p.terms)}</div><div class="jp-en" style="display:${showEN?'block':'none'}">${esc(p.en)}</div>`)); });
        div.appendChild(pCard);
        return div;
    }

    // --- Logic ---
    async function fetchLessonList() {
        const apiUrl = `https://api.github.com/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/contents/${REPO_CONFIG.path}`;
        root.innerHTML = `<div class="jp-header"><div class="jp-title">Loading...</div><button class="jp-exit-btn">Exit</button></div><div class="jp-body" style="text-align:center;">Connecting to GitHub...</div>`;

        // Bind Exit Button
        root.querySelector('.jp-exit-btn').onclick = exitCallback;

        try {
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error("Failed to fetch repo");
          const files = await res.json();
          const lessonFiles = files.filter(f => f.name.match(/^N\d+\.\d+\.json$/)).map(f => f.name).sort(); // Simplified sort
          renderMenu(lessonFiles);
        } catch (err) {
          root.innerHTML = `<div class="jp-body" style="color:red; text-align:center; padding:20px;"><h3>Error</h3><p>${err.message}</p><button class="jp-nav-btn next" onclick="exitCallback()">Back to Main Menu</button></div>`;
        }
    }

    function renderMenu(files) {
        root.innerHTML = `<div class="jp-header"><div class="jp-title">Select Lesson</div><button class="jp-exit-btn">Exit</button></div><div class="jp-body"><div class="jp-menu-grid" id="jp-menu-container"></div></div>`;
        root.querySelector('.jp-exit-btn').onclick = exitCallback;
        const container = document.getElementById('jp-menu-container');
        files.forEach(fileName => {
          const btn = el("div", "jp-menu-item");
          btn.innerHTML = `<div class="jp-menu-id">${fileName.replace('.json','')}</div><div class="jp-menu-name">Start</div>`;
          btn.onclick = () => loadLesson(fileName);
          container.appendChild(btn);
        });
    }

    async function loadLesson(fileName) {
        root.innerHTML = `<div class="jp-header"><button class="jp-back-btn">← List</button><div class="jp-title">Loading...</div><button class="jp-exit-btn">Exit</button></div><div class="jp-progress-container"><div class="jp-progress-bar"></div></div><div class="jp-body"></div><div class="jp-footer"><button class="jp-nav-btn prev">Prev</button><button class="jp-nav-btn next">Next</button></div>`;
        root.querySelector('.jp-back-btn').onclick = () => fetchLessonList();
        root.querySelector('.jp-exit-btn').onclick = exitCallback;

        try {
          const [lRes, resources] = await Promise.all([
             fetch(getCdnUrl(fileName)),
             loadResources()
          ]);
          lessonData = await lRes.json();
          termMapData = resources.map;
          CONJUGATION_RULES = resources.conj;

          lessonData.sections.unshift({ type: 'intro', title: lessonData.title });
          currentStep = 0; totalSteps = lessonData.sections.length; showEN = false;

          root.querySelector('.jp-nav-btn.prev').onclick = () => { if (currentStep > 0) { currentStep--; renderCurrentStep(); } };
          root.querySelector('.jp-nav-btn.next').onclick = () => {
             if (currentStep < totalSteps) { currentStep++; renderCurrentStep(); }
             else { fetchLessonList(); }
          };
          renderCurrentStep();
        } catch (err) {
           console.error(err);
           root.querySelector('.jp-body').innerHTML = "Error loading lesson.";
        }
    }

    function renderCurrentStep() {
        const body = root.querySelector('.jp-body');
        const title = root.querySelector('.jp-title');
        const bar = root.querySelector('.jp-progress-bar');
        const nextBtn = root.querySelector('.jp-nav-btn.next');

        body.innerHTML = "";
        bar.style.width = (((currentStep + 1) / totalSteps) * 100) + "%";

        if (currentStep >= lessonData.sections.length) {
            title.innerText = "Summary";
            body.innerHTML = `<div class="jp-card" style="text-align:center;"><h2>🎉 Lesson Complete!</h2></div>`;
            nextBtn.innerText = "Finish";
            return;
        }

        const sec = lessonData.sections[currentStep];
        title.innerText = (sec.type === 'intro') ? lessonData.title : sec.title;

        const wrap = el("div");
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

        root.querySelector('.jp-nav-btn.prev').disabled = (currentStep === 0);
        nextBtn.innerText = (currentStep === totalSteps - 1) ? "Finish" : "Next";
    }

    // Initialize
    fetchLessonList();
  }
};
