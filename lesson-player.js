/**
 * Lesson Player (mobile-friendly) for Webflow embeds
 * - Fetches a lesson JSON + glossary CSV/JSON
 * - Highlights terms with tap/hover popovers (bottom-sheet modal)
 * - Supports MCQ drills with instant feedback
 *
 * Usage:
 * <div id="jp-lesson-root"></div>
 * <script>
 *   window.JP_LESSON_CONFIG = {
 *     lessonUrl: "https://.../N4.7.json",
 *     glossaryUrl: "https://.../glossary.N4.7.csv"
 *   };
 * </script>
 * <script>/* paste this file contents here OR load it via external host */</script>
 */

(function () {
  const cfg = window.JP_LESSON_CONFIG || {};
  const lessonUrl = cfg.lessonUrl || "N4.7.json";
  const glossaryUrl = cfg.glossaryUrl || "glossary.N4.7.json";
  const rootId = cfg.rootId || "jp-lesson-root";

  const root = document.getElementById(rootId);
  if (!root) {
    console.error("[LessonPlayer] Missing root element:", rootId);
    return;
  }

  // ---------- Styles ----------
  const style = document.createElement("style");
  style.textContent = `
    #${rootId}{
      --primary:#4e54c8; --primary-dark:#3f44a5; --accent:#ff4757;
      --bg-grad:linear-gradient(135deg,#fdfbfb 0%,#ebedee 100%);
      --card-bg:#fff; --text-main:#2f3542; --text-sub:#747d8c;
      --success:#2ed573; --error:#ff4757;
      font-family: 'Poppins','Noto Sans JP',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
      color: var(--text-main);
      background: var(--bg-grad);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 18px;
      overflow: hidden;
      max-width: 820px;
      margin: 0 auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
    }
    #${rootId} .jp-header{
      padding: 16px 18px;
      background: rgba(78,84,200,0.95);
      color:#fff;
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      position: sticky; top: 0; z-index: 5;
      backdrop-filter: blur(6px);
      box-shadow: 0 6px 18px rgba(78,84,200,0.25);
    }
    #${rootId} .jp-title{ font-weight: 900; letter-spacing: 0.02em; font-size: 1.05rem; line-height:1.2; }
    #${rootId} .jp-subtitle{ font-size: 0.85rem; opacity: 0.85; font-weight: 600; }
    #${rootId} .jp-body{ padding: 16px; }
    #${rootId} .jp-card{
      background: var(--card-bg);
      border-radius: 16px;
      padding: 16px;
      border: 1px solid rgba(0,0,0,0.04);
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      margin-bottom: 14px;
    }
    #${rootId} .jp-card h3{
      margin: 0 0 10px 0;
      font-size: 1rem;
      font-weight: 900;
      color: var(--text-main);
    }
    #${rootId} .jp-muted{ color: var(--text-sub); font-weight: 600; }
    #${rootId} .jp-row{ display:flex; gap:10px; align-items:flex-start; padding: 8px 0; border-bottom: 1px solid #f1f2f6; }
    #${rootId} .jp-row:last-child{ border-bottom:none; }
    #${rootId} .jp-spk{
      width: 34px; height: 34px; border-radius: 10px;
      display:flex; align-items:center; justify-content:center;
      font-weight: 900;
      background: #f3f4ff;
      color: var(--primary);
      flex: 0 0 auto;
    }
    #${rootId} .jp-jp{ font-family: 'Noto Sans JP', sans-serif; font-size: 1.1rem; line-height: 1.55; }
    #${rootId} .jp-en{ margin-top: 6px; font-size: 0.95rem; color: var(--text-sub); font-weight: 600; display:none; }
    #${rootId} .jp-toggle{
      border: 2px solid rgba(255,255,255,0.35);
      color:#fff;
      background: transparent;
      padding: 8px 10px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.85rem;
      cursor:pointer;
    }
    #${rootId} .jp-btn{
      background: linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%);
      border:none; color:#fff;
      padding: 12px 14px; border-radius: 12px;
      font-weight: 900; cursor:pointer;
      width: 100%;
      box-shadow: 0 6px 14px rgba(78,84,200,0.22);
    }
    #${rootId} .jp-btn.sec{
      background: #fff;
      color: var(--text-sub);
      border: 2px solid #dfe4ea;
      box-shadow: none;
    }
    #${rootId} .jp-term{
      background: #f8f9fe;
      border: 1px solid rgba(78,84,200,0.2);
      padding: 0 6px;
      border-radius: 9px;
      cursor: pointer;
      font-weight: 800;
      color: var(--primary-dark);
      display: inline-block;
      margin: 0 1px;
    }
    #${rootId} .jp-chips{ display:flex; flex-wrap:wrap; gap: 8px; }
    #${rootId} .jp-chip{
      padding: 9px 10px;
      border-radius: 999px;
      border: 1px solid rgba(0,0,0,0.08);
      background:#fff;
      cursor:pointer;
      font-weight: 900;
      color: var(--text-main);
      font-family: 'Noto Sans JP', sans-serif;
    }
    #${rootId} .jp-kanji-grid{ display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    @media (min-width: 720px){
      #${rootId} .jp-kanji-grid{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    #${rootId} .jp-kanji-card{
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 16px;
      padding: 12px;
      background:#fff;
    }
    #${rootId} .jp-kanji-big{ font-family:'Noto Sans JP',sans-serif; font-size: 2.4rem; font-weight: 900; }
    #${rootId} .jp-q{
      font-family:'Noto Sans JP',sans-serif; font-size: 1.05rem; font-weight: 900;
      margin-bottom: 10px;
    }
    #${rootId} .jp-opts{ display:grid; gap: 10px; }
    #${rootId} .jp-opt{
      border: 2px solid #dfe4ea;
      background:#fff;
      border-radius: 14px;
      padding: 14px;
      font-weight: 900;
      cursor:pointer;
      text-align:center;
      font-family:'Noto Sans JP',sans-serif;
    }
    #${rootId} .jp-opt.correct{ background: var(--success); border-color: var(--success); color:#fff; }
    #${rootId} .jp-opt.wrong{ background: var(--error); border-color: var(--error); color:#fff; }
    #${rootId} .jp-msg{ margin-top: 10px; padding: 12px; border-radius: 14px; font-weight: 900; display:none; }
    #${rootId} .jp-msg.ok{ background:#d4edda; color:#155724; display:block; }
    #${rootId} .jp-msg.no{ background:#f8d7da; color:#721c24; display:block; }
    /* Bottom-sheet modal */
    #${rootId} .jp-modal-overlay{
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.25);
      display:none; z-index: 9999;
    }
    #${rootId} .jp-modal{
      position: fixed;
      left: 50%; transform: translateX(-50%);
      bottom: 12px;
      width: min(680px, calc(100vw - 24px));
      background:#fff;
      border-radius: 18px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.22);
      padding: 14px 14px 16px 14px;
      z-index: 10000;
      display:none;
      border: 1px solid rgba(0,0,0,0.08);
    }
    #${rootId} .jp-modal-head{ display:flex; justify-content:space-between; align-items:flex-start; gap: 10px; }
    #${rootId} .jp-modal-title{ font-family:'Noto Sans JP',sans-serif; font-size: 1.4rem; font-weight: 900; line-height: 1.2; }
    #${rootId} .jp-close{
      border: 2px solid #dfe4ea;
      background:#fff;
      border-radius: 12px;
      padding: 6px 10px;
      font-weight: 900;
      cursor: pointer;
      color: var(--text-sub);
    }
    #${rootId} .jp-modal-meta{ margin-top: 8px; color: var(--text-sub); font-weight: 800; }
    #${rootId} .jp-modal-notes{ margin-top: 10px; color: var(--text-main); font-weight: 650; line-height: 1.45; }
    #${rootId} .jp-badge{
      display:inline-block; padding: 4px 9px; border-radius: 999px;
      background:#f1f2f6; color: var(--text-sub);
      font-weight: 900; font-size: 0.78rem; letter-spacing: .04em;
      text-transform: uppercase;
      margin-top: 6px;
    }
  `;
  document.head.appendChild(style);

  // ---------- Helpers ----------
  function esc(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function parseCSV(text) {
    // Simple CSV parser (handles quotes)
    const lines = text.replace(/\r\n/g, "\n").split("\n").filter(Boolean);
    if (!lines.length) return [];
    const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^\uFEFF/, ""));
    return lines.slice(1).map(line => {
      const cols = splitCSVLine(line);
      const row = {};
      headers.forEach((h, i) => row[h] = (cols[i] ?? "").trim());
      return row;
    });
  }

  function splitCSVLine(line) {
    const out = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i+1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (c === "," && !inQ) {
        out.push(cur); cur = "";
      } else cur += c;
    }
    out.push(cur);
    return out;
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function byId(id){ return document.getElementById(id); }

  // Modal
  const overlay = el("div", "jp-modal-overlay");
  const modal = el("div", "jp-modal");
  modal.innerHTML = `
    <div class="jp-modal-head">
      <div>
        <div class="jp-modal-title" id="jp-modal-title"></div>
        <div class="jp-badge" id="jp-modal-badge"></div>
      </div>
      <button class="jp-close" id="jp-modal-close">Close</button>
    </div>
    <div class="jp-modal-meta" id="jp-modal-meta"></div>
    <div class="jp-modal-notes" id="jp-modal-notes"></div>
  `;
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  function closeModal(){
    overlay.style.display = "none";
    modal.style.display = "none";
  }
  overlay.addEventListener("click", closeModal);
  modal.querySelector("#jp-modal-close").addEventListener("click", closeModal);

  function openTerm(t){
    byId("jp-modal-title").innerText = t.surface || "";
    byId("jp-modal-badge").innerText = (t.type || "term").toUpperCase();
    byId("jp-modal-meta").innerText = [t.reading, t.meaning].filter(Boolean).join("  •  ");
    byId("jp-modal-notes").innerText = t.notes || "";
    overlay.style.display = "block";
    modal.style.display = "block";
  }

  // Highlight terms within Japanese string, based on term IDs present for the sentence
  function highlightText(jp, termIds, termMap){
    if (!termIds || !termIds.length) return esc(jp);
    let html = esc(jp);

    // Replace longer surfaces first to avoid partial overlaps
    const terms = termIds
      .map(id => termMap[id])
      .filter(Boolean)
      .sort((a,b) => (b.surface||"").length - (a.surface||"").length);

    terms.forEach(t => {
      const surf = esc(t.surface);
      if (!surf) return;

      // Replace all occurrences (safe enough for distinct kanji/kana surfaces)
      html = html.split(surf).join(
        `<span class="jp-term" data-term="${esc(t.id)}">${surf}</span>`
      );
    });

    return html;
  }

  function attachTermHandlers(container, termMap){
    container.querySelectorAll(".jp-term").forEach(span => {
      span.addEventListener("click", () => {
        const id = span.getAttribute("data-term");
        if (id && termMap[id]) openTerm(termMap[id]);
      });
    });
    container.querySelectorAll(".jp-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const id = chip.getAttribute("data-term");
        if (id && termMap[id]) openTerm(termMap[id]);
      });
    });
  }

  // MCQ
  function renderMCQ(item, termMap){
    const wrap = el("div", "jp-card");
    wrap.appendChild(el("div", "jp-q", highlightText(item.q, item.terms, termMap)));

    const opts = el("div", "jp-opts");
    const msg = el("div", "jp-msg");

    let locked = false;

    item.choices.forEach(choice => {
      const b = el("div", "jp-opt", esc(choice));
      b.addEventListener("click", () => {
        if (locked) return;
        locked = true;

        if (choice === item.answer) {
          b.classList.add("correct");
          msg.className = "jp-msg ok";
          msg.innerText = "Correct!";
        } else {
          b.classList.add("wrong");
          msg.className = "jp-msg no";
          msg.innerText = `Wrong — answer: ${item.answer}`;
          // Mark correct option
          [...opts.children].forEach(x => {
            if (x.innerText === item.answer) x.classList.add("correct");
          });
        }
      });
      opts.appendChild(b);
    });

    wrap.appendChild(opts);
    wrap.appendChild(msg);

    attachTermHandlers(wrap, termMap);
    return wrap;
  }

  function renderReading(sec, termMap, showEN){
    const card = el("div", "jp-card");
    card.appendChild(el("h3", "", esc(sec.title)));

    sec.passage.forEach(p => {
      const row = el("div", "");
      row.innerHTML = `
        <div class="jp-jp">${highlightText(p.jp, p.terms, termMap)}</div>
        <div class="jp-en" style="${showEN ? "display:block" : ""}">${esc(p.en || "")}</div>
        <div style="height:10px"></div>
      `;
      card.appendChild(row);
    });

    if (sec.questions && sec.questions.length) {
      const qCard = el("div", "jp-card");
      qCard.appendChild(el("h3", "", "Comprehension"));
      sec.questions.forEach((qa, idx) => {
        const line = el("div", "jp-row");
        line.innerHTML = `
          <div class="jp-spk">Q</div>
          <div style="flex:1">
            <div class="jp-jp">${highlightText(qa.q, qa.terms, termMap)}</div>
            <div class="jp-en" style="${showEN ? "display:block" : ""}">${esc(qa.a || "")}</div>
          </div>
        `;
        qCard.appendChild(line);
      });
      card.appendChild(qCard);
    }

    attachTermHandlers(card, termMap);
    return card;
  }

  function renderConversation(sec, termMap, showEN){
    const card = el("div", "jp-card");
    card.appendChild(el("h3", "", esc(sec.title)));
    if (sec.context) card.appendChild(el("div", "jp-muted", esc(sec.context)));

    // Optional callouts
    if (sec.callouts && sec.callouts.length){
      const c = el("div", "jp-card");
      c.appendChild(el("h3", "", "Grammar Callout"));
      sec.callouts.forEach(x => {
        const t = termMap[x.term];
        const chip = el("div", "jp-chip", esc(t ? t.surface : x.title));
        chip.setAttribute("data-term", esc(x.term));
        c.appendChild(chip);
        c.appendChild(el("div", "jp-muted", esc(x.note || "")));
      });
      card.appendChild(c);
    }

    // Roleplay controls
    const controls = el("div", "");
    controls.style.display = "flex";
    controls.style.gap = "10px";
    controls.style.margin = "10px 0 12px 0";
    const hideA = el("button", "jp-btn sec", "Hide A");
    const hideB = el("button", "jp-btn sec", "Hide B");
    hideA.style.width = "auto";
    hideB.style.width = "auto";
    controls.appendChild(hideA);
    controls.appendChild(hideB);
    card.appendChild(controls);

    let hidden = {A:false, B:false};
    function rerender(){
      list.innerHTML = "";
      sec.lines.forEach(line => {
        const row = el("div", "jp-row");
        const spk = esc(line.spk || "");
        const isHidden = (spk === "A" && hidden.A) || (spk === "B" && hidden.B);
        row.innerHTML = `
          <div class="jp-spk">${spk}</div>
          <div style="flex:1">
            <div class="jp-jp">${isHidden ? "••••••" : highlightText(line.jp, line.terms, termMap)}</div>
            <div class="jp-en" style="${showEN ? "display:block" : ""}">${esc(line.en || "")}</div>
          </div>
        `;
        list.appendChild(row);
      });
      attachTermHandlers(list, termMap);
    }

    const list = el("div", "");
    card.appendChild(list);

    hideA.addEventListener("click", () => { hidden.A = !hidden.A; hideA.innerText = hidden.A ? "Show A" : "Hide A"; rerender(); });
    hideB.addEventListener("click", () => { hidden.B = !hidden.B; hideB.innerText = hidden.B ? "Show B" : "Hide B"; rerender(); });

    rerender();
    return card;
  }

  function renderVocab(sec, termMap){
    const card = el("div", "jp-card");
    card.appendChild(el("h3", "", esc(sec.title)));

    sec.groups.forEach(g => {
      card.appendChild(el("div", "jp-muted", esc(g.label)));
      const chips = el("div", "jp-chips");
      g.items.forEach(id => {
        const t = termMap[id];
        if (!t) return;
        const chip = el("div", "jp-chip", esc(t.surface));
        chip.setAttribute("data-term", esc(t.id));
        chips.appendChild(chip);
      });
      card.appendChild(chips);
      card.appendChild(el("div", "", `<div style="height:10px"></div>`));
    });

    attachTermHandlers(card, termMap);
    return card;
  }

  function renderKanjiGrid(sec, termMap){
    const card = el("div", "jp-card");
    card.appendChild(el("h3", "", esc(sec.title)));

    const grid = el("div", "jp-kanji-grid");
    sec.items.forEach(k => {
      const c = el("div", "jp-kanji-card");
      c.innerHTML = `
        <div class="jp-kanji-big">${esc(k.kanji)}</div>
        <div class="jp-muted" style="margin-top:6px">${esc(k.reading || "")}</div>
        <div style="margin-top:6px; font-weight:900">${esc(k.meaning || "")}</div>
      `;
      // Make kanji clickable to open details if term exists
      const termId = (k.terms && k.terms[0]) ? k.terms[0] : null;
      if (termId && termMap[termId]) {
        c.style.cursor = "pointer";
        c.addEventListener("click", () => openTerm(termMap[termId]));
      }
      grid.appendChild(c);
    });
    card.appendChild(grid);
    return card;
  }

  function renderWarmup(sec, termMap, showEN){
    const card = el("div", "jp-card");
    card.appendChild(el("h3", "", esc(sec.title)));
    if (sec.instructions) card.appendChild(el("div", "jp-muted", esc(sec.instructions)));

    sec.items.forEach((it, idx) => {
      const row = el("div", "jp-row");
      row.innerHTML = `
        <div class="jp-spk">${idx+1}</div>
        <div style="flex:1">
          <div class="jp-jp">${highlightText(it.jp, it.terms, termMap)}</div>
          <div class="jp-en" style="${showEN ? "display:block" : ""}">${esc(it.en || "")}</div>
        </div>
      `;
      card.appendChild(row);
    });

    attachTermHandlers(card, termMap);
    return card;
  }

  function renderDrills(sec, termMap){
    const card = el("div", "jp-card");
    card.appendChild(el("h3", "", esc(sec.title)));
    if (sec.instructions) card.appendChild(el("div", "jp-muted", esc(sec.instructions)));

    sec.items.forEach(item => {
      if (item.kind === "mcq") card.appendChild(renderMCQ(item, termMap));
    });
    return card;
  }

  function renderLesson(lesson, termMap){
    root.innerHTML = "";

    // Header
    const header = el("div", "jp-header");
    header.innerHTML = `
      <div>
        <div class="jp-title">${esc(lesson.title || "")}</div>
        <div class="jp-subtitle">${esc(lesson.meta?.focus || "")} • ${esc(lesson.id || "")}</div>
      </div>
      <button class="jp-toggle" id="jp-toggle-en">Show EN</button>
    `;
    root.appendChild(header);

    const body = el("div", "jp-body");
    root.appendChild(body);

    let showEN = false;
    header.querySelector("#jp-toggle-en").addEventListener("click", (e) => {
      showEN = !showEN;
      e.target.innerText = showEN ? "Hide EN" : "Show EN";
      // Toggle all EN blocks
      body.querySelectorAll(".jp-en").forEach(x => x.style.display = showEN ? "block" : "none");
    });

    // Practice button (optional)
    if (lesson.practiceLinks?.kanjiPracticeUrl) {
      const p = el("div", "jp-card");
      p.appendChild(el("h3", "", "Practice"));
      const url = new URL(lesson.practiceLinks.kanjiPracticeUrl);
      const params = lesson.practiceLinks.suggestedParams || {};
      Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));
      const a = el("a", "jp-btn", "Open Kanji Practice for this Lesson");
      a.href = url.toString();
      a.target = "_blank";
      a.style.display = "inline-block";
      a.style.textDecoration = "none";
      p.appendChild(a);
      body.appendChild(p);
    }

    // Sections
    (lesson.sections || []).forEach(sec => {
      let node = null;
      if (sec.type === "warmup") node = renderWarmup(sec, termMap, showEN);
      else if (sec.type === "kanjiGrid") node = renderKanjiGrid(sec, termMap);
      else if (sec.type === "vocabList") node = renderVocab(sec, termMap);
      else if (sec.type === "conversation") node = renderConversation(sec, termMap, showEN);
      else if (sec.type === "reading") node = renderReading(sec, termMap, showEN);
      else if (sec.type === "drills") node = renderDrills(sec, termMap);
      if (node) body.appendChild(node);
    });
  }

  async function load(){
    // Loading screen
    root.innerHTML = `
      <div class="jp-header">
        <div>
          <div class="jp-title">Loading lesson…</div>
          <div class="jp-subtitle">Please wait</div>
        </div>
      </div>
      <div class="jp-body">
        <div class="jp-card"><div class="jp-muted">Fetching content…</div></div>
      </div>
    `;

    const [lessonRes, glossRes] = await Promise.all([
      fetch(lessonUrl, { cache: "no-store" }),
      fetch(glossaryUrl, { cache: "no-store" })
    ]);

    if (!lessonRes.ok) throw new Error("Failed to load lesson JSON: " + lessonRes.status);
    if (!glossRes.ok) throw new Error("Failed to load glossary: " + glossRes.status);

    const lesson = await lessonRes.json();
    const glossText = await glossRes.text();

    let termRows = [];
    if (glossaryUrl.toLowerCase().endsWith(".json")) {
      termRows = JSON.parse(glossText);
    } else {
      termRows = parseCSV(glossText);
    }

    // Map
    const termMap = {};
    termRows.forEach(r => {
      const id = (r.id || "").trim();
      if (!id) return;
      termMap[id] = {
        id,
        surface: (r.surface || "").replace(/^"|"$/g,""),
        reading: (r.reading || "").replace(/^"|"$/g,""),
        meaning: (r.meaning || "").replace(/^"|"$/g,""),
        type: (r.type || "term").replace(/^"|"$/g,""),
        notes: (r.notes || "").replace(/^"|"$/g,"")
      };
    });

    renderLesson(lesson, termMap);
  }

  load().catch(err => {
    console.error(err);
    root.innerHTML = `
      <div class="jp-header">
        <div>
          <div class="jp-title">Lesson failed to load</div>
          <div class="jp-subtitle">${esc(err.message || "Unknown error")}</div>
        </div>
      </div>
      <div class="jp-body">
        <div class="jp-card">
          <div class="jp-muted">
            Check that <b>lessonUrl</b> and <b>glossaryUrl</b> are correct and publicly accessible.
          </div>
        </div>
      </div>
    `;
  });

})();
