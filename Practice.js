window.PracticeModule = {
  start: function(container, sharedConfig, exitCallback) {
    // --- 1. SETUP & STYLES ---

    window.KanjiApp = {};

    // Inject Fonts
    if (!document.getElementById('kanji-fonts')) {
        const link = document.createElement('link');
        link.id = 'kanji-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Poppins:wght@400;500;600;700&display=swap';
        document.head.appendChild(link);
    }

    // Inject CSS
    if (!document.getElementById('jp-practice-style')) {
        const style = document.createElement("style");
        style.id = 'jp-practice-style';
        style.textContent = `
            #kanji-app-root {
                --primary: #4e54c8; --primary-dark: #3f44a5;
                --bg-grad: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
                --text-main: #2f3542; --text-sub: #747d8c;
                --success: #2ed573; --error: #ff4757;

                font-family: 'Poppins', 'Noto Sans JP', sans-serif;
                background: var(--bg-grad); color: var(--text-main);
                display: flex; flex-direction: column;
                width: 100%; max-width: 600px; margin: 0 auto;
                height: 800px; border-radius: 20px;
                border: 1px solid rgba(0,0,0,0.05); overflow: hidden; position: relative;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            #kanji-app-root * { box-sizing: border-box; }

            #kanji-app-root header {
                background: rgba(78, 84, 200, 0.95); color: white; padding: 1.2rem;
                text-align: center; font-weight: 900; letter-spacing: 0.05em; font-size: 1.2rem;
                cursor: pointer; user-select: none; z-index: 10;
                box-shadow: 0 4px 15px rgba(78, 84, 200, 0.3); backdrop-filter: blur(5px);
                display: flex; justify-content: space-between; align-items: center;
            }
            .k-exit-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.8rem; }

            #k-app-container { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; width: 100%; position: relative; z-index: 1; }
            .k-card { background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); padding: 2rem; width: 100%; text-align: center; margin-bottom: 1.5rem; border: 1px solid rgba(0,0,0,0.02); }
            .k-btn { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; border: none; padding: 16px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; margin: 8px 0; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(78, 84, 200, 0.2); }
            .k-btn:active { transform: scale(0.98); }
            .k-btn-sec { background: white; color: var(--text-sub); border: 2px solid #dfe4ea; background: none; box-shadow: none; }
            .k-grid-btns { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 8px 0; }
            .k-grid-btns .k-btn { font-size: 0.9rem; padding: 12px; margin: 0; }
            .k-hidden { display: none !important; }

            .k-big { font-family: 'Noto Sans JP', sans-serif; font-size: 5rem; margin: 0.2rem 0; color: var(--text-main); font-weight: 900; line-height: 1.1; }
            .k-sub { font-size: 1.4rem; color: var(--text-sub); font-weight: 500; margin-bottom: 0.5rem; }
            .k-lbl { font-size: 0.8rem; text-transform: uppercase; color: #a4b0be; font-weight: 700; letter-spacing: 0.1em; margin-top: 5px; }

            /* FLIP CARD */
            .k-scene { width: 100%; height: 400px; perspective: 1000px; margin-bottom: 20px; cursor: pointer; }
            .k-card-obj { width: 100%; height: 100%; position: relative; transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); transform-style: preserve-3d; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
            .k-card-obj.is-flipped { transform: rotateY(180deg); }
            .k-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 20px; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto; overflow-x: hidden; }
            .k-face-front { z-index: 2; transform: rotateY(0deg); }
            .k-face-back { transform: rotateY(180deg); background: #fdfbfb; border: 4px solid var(--primary); justify-content: flex-start; padding-top: 3rem; }
            .k-tap-hint { position: absolute; bottom: 15px; width: 100%; text-align: center; font-size: 0.75rem; color: #b2bec3; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; pointer-events: none; }

            .k-tbl { width: 100%; text-align: left; font-size: 0.95rem; margin-top: 1rem; border-collapse: collapse; }
            .k-tbl td { padding: 8px; border-bottom: 1px solid #f1f2f6; vertical-align: top; }
            .k-tbl th { padding: 8px; color: #a4b0be; font-weight: 600; font-size: 0.75rem; width: 30%; border-bottom: 1px solid #f1f2f6; text-transform: uppercase; }

            .k-opt { background: white; border: 2px solid #dfe4ea; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 10px; cursor: pointer; font-weight: 600; font-size: 1.1rem; transition: 0.15s; }
            .k-opt:hover { border-color: var(--primary); color: var(--primary); background: #f8f9fe; }
            .k-opt.correct { background: var(--success); border-color: var(--success); color: white; }
            .k-opt.wrong { background: var(--error); border-color: var(--error); color: white; }

            /* LESSON SELECTOR STYLES */
            .k-lvl-group { margin-bottom: 10px; background: white; border-radius: 12px; border: 1px solid #dfe4ea; overflow: hidden; }
            .k-lvl-header { padding: 12px 15px; background: #f8f9fa; display: flex; align-items: center; cursor: pointer; }
            .k-lvl-header:hover { background: #f1f2f6; }
            .k-lvl-title { flex: 1; font-weight: 700; color: var(--text-main); font-size: 1.1rem; margin-left: 10px; }
            .k-lvl-arrow { transition: transform 0.3s; color: #a4b0be; font-size: 0.8rem; }
            .k-lvl-header.open .k-lvl-arrow { transform: rotate(180deg); }
            .k-lvl-list { display: none; padding: 5px 0; max-height: 250px; overflow-y: auto; }
            .k-lvl-list.open { display: block; }
            .k-chk { width: 18px; height: 18px; margin-right: 12px; accent-color: var(--primary); }
            .k-lesson-row { display: flex; padding: 10px 15px; border-bottom: 1px solid #f1f2f6; font-size: 0.9rem; }

            .k-flag-stamp { position: absolute; top: 15px; right: 15px; color: #ff4757; border: 3px solid #ff4757; padding: 5px 12px; border-radius: 8px; font-weight: 900; text-transform: uppercase; transform: rotate(15deg); font-size: 1rem; letter-spacing: 0.1em; opacity: 0.8; z-index: 5; }
        `;
        document.head.appendChild(style);
    }

    // Create App Container
    container.innerHTML = '';
    const appRoot = document.createElement('div');
    appRoot.id = "kanji-app-root";
    container.appendChild(appRoot);

    // HTML Structure
    appRoot.innerHTML = `
        <div id="k-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.98); z-index: 50; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 3rem; margin-bottom: 15px;">🇯🇵</div>
            <div style="font-weight:800; color:#4e54c8; font-size:1.2rem">Loading Library...</div>
            <div id="k-error-box" class="k-hidden" style="color:#ff4757; margin-top:10px; padding:10px; max-width:80%; font-size:0.9rem"></div>
        </div>

        <header>
           <span onclick="KanjiApp.showMenu()">Kanji Master 先生</span>
           <button class="k-exit-btn">Exit</button>
        </header>

        <div id="k-app-container">
            <div id="k-view-menu" style="width:100%">

                <div class="k-card" style="padding: 1.5rem; margin-bottom: 25px;">
                    <div style="display:flex; justify-content:space-around; align-items:center;">
                        <div><div class="k-big" style="font-size:1.8rem; color:var(--primary)" id="k-cnt-k">0</div><div class="k-lbl">Kanji</div></div>
                        <div style="width:1px; height:40px; background:#eee;"></div>
                        <div><div class="k-big" style="font-size:1.8rem; color:#16a085" id="k-cnt-vocab">0</div><div class="k-lbl">Vocab</div></div>
                        <div style="width:1px; height:40px; background:#eee;"></div>
                        <div><div class="k-big" style="font-size:1.8rem; color:#8e44ad" id="k-cnt-v">0</div><div class="k-lbl">Verbs</div></div>
                        <div style="width:1px; height:40px; background:#eee;"></div>
                        <div><div class="k-big" style="font-size:1.8rem; color:#f39c12" id="k-cnt-flags">0</div><div class="k-lbl">Flags</div></div>
                    </div>
                </div>

                <div class="k-lbl" style="margin-bottom:12px; color: var(--primary);">SELECT LESSONS</div>
                <div class="k-filters" id="k-lesson-container"></div>

                <div class="k-lbl" style="margin-top:1rem">KANJI PRACTICE</div>
                <button class="k-btn" onclick="KanjiApp.start('kanji', 'flash')">🎴 Flashcards</button>

                <div class="k-lbl" style="margin-top:8px">MEANING QUIZ</div>
                <div class="k-grid-btns">
                    <button class="k-btn" onclick="KanjiApp.start('kanji', 'quiz-meaning', 'normal')">Kanji ➔ Eng</button>
                    <button class="k-btn" onclick="KanjiApp.start('kanji', 'quiz-meaning', 'reverse')">Eng ➔ Kanji</button>
                    <button class="k-btn" onclick="KanjiApp.start('kanji', 'quiz-meaning', 'mix')">🔄 Mix</button>
                </div>

                <div class="k-lbl" style="margin-top:8px">READING QUIZ</div>
                <div class="k-grid-btns">
                    <button class="k-btn" onclick="KanjiApp.start('kanji', 'quiz-reading', 'normal')">Kanji ➔ Read</button>
                    <button class="k-btn" onclick="KanjiApp.start('kanji', 'quiz-reading', 'reverse')">Read ➔ Kanji</button>
                    <button class="k-btn" onclick="KanjiApp.start('kanji', 'quiz-reading', 'mix')">🔄 Mix</button>
                </div>

                <div class="k-lbl" style="margin-top:2rem; color: #16a085;">VOCAB PRACTICE</div>
                <button class="k-btn" style="background: linear-gradient(135deg, #16a085 0%, #1abc9c 100%);" onclick="KanjiApp.start('vocab', 'flash')">🗂️ Vocab Flashcards</button>
                <button class="k-btn" style="background: linear-gradient(135deg, #16a085 0%, #1abc9c 100%);" onclick="KanjiApp.start('vocab', 'quiz-vocab')">📝 Vocab Quiz</button>

                <div class="k-lbl" style="margin-top:2rem; color:#f39c12;">FLAGGED ITEMS</div>
                <button class="k-btn" style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);" onclick="KanjiApp.start('mixed', 'flag-review')">🚩 Review Flagged</button>

                <div class="k-lbl" style="margin-top:2rem; color:#8e44ad;">VERB PRACTICE</div>
                <button class="k-btn" style="background: linear-gradient(135deg, #8e44ad 0%, #6c3483 100%);" onclick="KanjiApp.start('verb', 'flash')">🏃 Verb Flashcards</button>
                <button class="k-btn" style="background: linear-gradient(135deg, #8e44ad 0%, #6c3483 100%);" onclick="KanjiApp.start('verb', 'quiz-conj')">⚡ Conjugation Quiz</button>
            </div>

            <div id="k-view-flash" class="k-hidden" style="width:100%">
                <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px; color:#a4b0be; font-weight:800; font-size:0.9rem;">
                     <span id="k-fc-progress">Card 1 / 100</span>
                </div>
                <div class="k-scene" onclick="KanjiApp.flipCard()">
                    <div class="k-card-obj" id="k-fc-card-obj">
                        <div class="k-face k-face-front">
                            <div class="k-flag-stamp k-hidden" id="k-fc-flagged-icon">AGAIN</div>
                            <div class="k-lbl" id="k-fc-lbl" style="color:var(--primary)"></div>
                            <div class="k-big" id="k-fc-main"></div>
                            <div class="k-sub" id="k-fc-sub"></div>
                            <div class="k-tap-hint">Tap to Flip</div>
                        </div>
                        <div class="k-face k-face-back" id="k-fc-back-content"></div>
                    </div>
                </div>

                <div id="k-fc-nav-container" style="width:100%; margin-top:15px;">
                   </div>

                <button class="k-btn k-btn-sec" onclick="KanjiApp.showMenu()" style="margin-top:10px; border:none; color:#a4b0be; font-size:0.9rem">Return to Menu</button>
            </div>

            <div id="k-view-quiz" class="k-hidden" style="width:100%; display:flex; flex-direction:column; height:100%">
                <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:15px; font-weight:800; color:#a4b0be;">
                    <span>🏆 BEST: <span id="k-best">0</span></span>
                    <span style="color:#ffa502">🔥 STREAK: <span id="k-streak">0</span></span>
                </div>
                <div class="k-card">
                    <div class="k-lbl" style="margin-bottom:10px;" id="k-q-lbl">QUESTION</div>
                    <div class="k-big" id="k-q-main"></div>
                    <div id="k-q-read-reveal" class="k-hidden" style="color:#8e44ad; font-weight:700; font-size:1.5rem; margin-top:5px;"></div>
                    <div class="k-sub" id="k-q-ask" style="margin-top:10px; color:var(--primary)"></div>
                </div>
                <div id="k-q-opts"></div>
                <div id="k-q-msg" class="k-hidden" style="margin:10px 0; font-weight:bold; padding:15px; border-radius:12px; text-align:center;"></div>
                <div style="margin-top:auto; width:100%">
                    <button class="k-btn k-hidden" id="k-q-next" onclick="KanjiApp.nextQ()">Next Question ➜</button>
                    <button class="k-btn k-btn-sec" onclick="KanjiApp.showMenu()">Exit Quiz</button>
                </div>
            </div>
        </div>
    `;

    // Exit Button Logic
    appRoot.querySelector('.k-exit-btn').onclick = exitCallback;

    // --- 2. LOGIC ---
    const REPO_CONFIG = sharedConfig;

    const DB = { kanji: [], verb: [], lessons: [], vocabMap: new Map() };
    const activeLessons = new Set();
    let curSet=[], curIdx=0, curStreak=0, curBest=0, curMode='', curAns='', curType='', curSubMode='normal', curQItem=null, curCategory='';
    let quizPhase = 1;

    let flagCounts = window.JPShared.progress.getAllFlags();
    let activeFlags = window.JPShared.progress.getAllActiveFlags();

    const bestScores = {
        meaning: window.JPShared.progress.getBestScore('meaning'),
        reading: window.JPShared.progress.getBestScore('reading'),
        vocab: window.JPShared.progress.getBestScore('vocab'),
        verb: window.JPShared.progress.getBestScore('verb')
    };

    // --- 3. HELPER FUNCTIONS ---
    function setTxt(id, txt) {
        const el = document.getElementById(id);
        if(el) el.innerText = txt;
    }

    // --- 4. EXPOSED FUNCTIONS ---
    KanjiApp.showMenu = function() {
        kUpdateStats();
        ['k-view-menu','k-view-flash','k-view-quiz'].forEach(i => {
            const el = document.getElementById(i);
            if(el) el.classList.add('k-hidden');
        });
        const menu = document.getElementById('k-view-menu');
        if(menu) menu.classList.remove('k-hidden');
    };

    KanjiApp.start = function(type, mode, subMode='normal') {
        curType = type; curMode = mode; curSubMode = subMode; curIdx = 0; curStreak = 0; quizPhase = 1;
        setTxt('k-streak', 0);

        if (mode === 'quiz-meaning') curCategory = 'meaning';
        else if (mode === 'quiz-reading') curCategory = 'reading';
        else if (mode === 'quiz-vocab') curCategory = 'vocab';
        else if (mode === 'quiz-conj') curCategory = 'verb';
        else curCategory = '';

        curBest = bestScores[curCategory] || 0;
        setTxt('k-best', curBest);

        if(type==='kanji') curSet = DB.kanji.filter(k => activeLessons.has(k.lesson));
        else if(type==='verb') curSet = [...DB.verb];
        else if(type==='vocab') {
            const tempMap = new Map();
            const activeK = DB.kanji.filter(k => activeLessons.has(k.lesson));
            activeK.forEach(k => {
                const cs = (k.compounds||'').split(';');
                cs.forEach((c) => {
                    const vObj = DB.vocabMap.get(c);
                    if(vObj && !tempMap.has(c)) {
                        tempMap.set(c, {
                            word: c, reading: vObj.reading, meaning: vObj.meaning,
                            lesson: k.lesson, gtype: vObj.gtype, notes: vObj.notes
                        });
                    }
                });
            });
            curSet = Array.from(tempMap.values());
        } else if (type === 'mixed' && mode === 'flag-review') {
            curSet = [];
            Object.keys(activeFlags).forEach(key => {
                if(activeFlags[key]) {
                    let item = DB.kanji.find(k => k.kanji === key);
                    if(item) { curSet.push({...item, _type:'kanji'}); return; }
                    item = DB.vocabMap.get(key);
                    if(item) { curSet.push({...item, word: item.surface, _type:'vocab'}); return; }
                    item = DB.verb.find(v => (v.kanji === key || v.dict === key));
                    if(item) { curSet.push({...item, _type:'verb'}); return; }
                }
            });
        }

        if(curSet.length === 0) return alert(mode === 'flag-review' ? "No active flagged items found!" : "Please select at least one lesson.");
        curSet.sort(() => Math.random() - 0.5);

        ['k-view-menu','k-view-flash','k-view-quiz'].forEach(i => {
            const el = document.getElementById(i);
            if(el) el.classList.add('k-hidden');
        });

        if(mode === 'flash' || mode === 'flag-review') {
            kRenderFC();
            const fv = document.getElementById('k-view-flash');
            if(fv) fv.classList.remove('k-hidden');
        } else {
            KanjiApp.nextQ();
            const qv = document.getElementById('k-view-quiz');
            if(qv) qv.classList.remove('k-hidden');
        }
    };

    KanjiApp.flipCard = function() {
        const c = document.getElementById('k-fc-card-obj');
        if(c) c.classList.toggle('is-flipped');
    };

    // ANTI-CHEAT MOVE
    KanjiApp.move = function(n) {
        const c = document.getElementById('k-fc-card-obj');
        const wasFlipped = c && c.classList.contains('is-flipped');

        if (wasFlipped) {
            c.classList.remove('is-flipped');
            // Wait for flip to reach 90deg (hide back) before changing text
            setTimeout(() => {
                curIdx = (curIdx+n+curSet.length)%curSet.length;
                kRenderFC();
            }, 300);
        } else {
            curIdx = (curIdx+n+curSet.length)%curSet.length;
            kRenderFC();
        }
    };

    KanjiApp.flag = function(btn) {
        const currentItem = curSet[curIdx];
        const kKey = currentItem.kanji || currentItem.word || currentItem.dict;

        flagCounts[kKey] = (flagCounts[kKey] || 0) + 1;
        activeFlags[kKey] = true;
        window.JPShared.progress.flagTerm(kKey);

        curSet.push({ ...currentItem, isRequeued: true });

        const originalText = btn.innerText;
        btn.innerText = "Marked & Re-queued! ↺"; btn.style.backgroundColor = "#fff3cd";
        setTimeout(() => {
            btn.innerText = originalText; btn.style.backgroundColor = "";
            KanjiApp.move(1); // Auto move to next
        }, 800);
    };

    KanjiApp.clearFlag = function(btn) {
        const currentItem = curSet[curIdx];
        const kKey = currentItem.kanji || currentItem.word || currentItem.dict;

        delete activeFlags[kKey];
        window.JPShared.progress.clearFlag(kKey);

        btn.innerText = "Cleared! ✨";

        setTimeout(() => {
            if(curSet.length > 1) {
                curSet.splice(curIdx, 1);
                if(curIdx >= curSet.length) curIdx = 0;
                kRenderFC(); // Render new card
            } else {
                alert("All active flags cleared! Returning to menu.");
                KanjiApp.showMenu();
            }
        }, 600);
    };

    KanjiApp.toggleAccordion = function(h) { h.classList.toggle('open'); h.nextElementSibling.classList.toggle('open'); };
    KanjiApp.toggleAll = function(cls, p) {
        document.querySelectorAll(`.k-chk-${cls}`).forEach(b => {
            b.checked = p.checked;
            if(p.checked) activeLessons.add(b.value); else activeLessons.delete(b.value);
        });
        kUpdateStats();
    };
    KanjiApp.updateLesson = function(id, cls) {
        if(activeLessons.has(id)) activeLessons.delete(id); else activeLessons.add(id);
        const all = document.querySelectorAll(`.k-chk-${cls}`);
        const checked = document.querySelectorAll(`.k-chk-${cls}:checked`);
        const p = all[0].closest('.k-lvl-group').querySelector('.k-lvl-header input');
        p.checked = (all.length === checked.length);
        p.indeterminate = (checked.length > 0 && checked.length < all.length);
        kUpdateStats();
    };

    KanjiApp.nextQ = function() {
        const msg = document.getElementById('k-q-msg'); if(msg) msg.classList.add('k-hidden');
        const nxt = document.getElementById('k-q-next'); if(nxt) nxt.classList.add('k-hidden');
        const opts = document.getElementById('k-q-opts'); if(opts) opts.innerHTML = '';
        const rev = document.getElementById('k-q-read-reveal'); if(rev) rev.classList.add('k-hidden');
        quizPhase = 1;

        let q='', a='', m='', dists=[];
        curQItem = curSet[Math.floor(Math.random()*curSet.length)];
        let effectiveSubMode = curSubMode === 'mix' ? (Math.random() < 0.5 ? 'normal' : 'reverse') : curSubMode;
        curQItem.activeMode = effectiveSubMode;

        if(curMode==='quiz-meaning') {
            if(effectiveSubMode === 'normal') { q='What does this mean?'; m=curQItem.kanji; a=curQItem.meaning; dists = kRand(curSet, 'meaning', a); }
            else { q='Which Kanji means...'; m=curQItem.meaning; a=curQItem.kanji; dists = kRand(curSet, 'kanji', a); }
        } else if(curMode==='quiz-reading') {
            if(effectiveSubMode === 'normal') {
                q='Select readings'; m=curQItem.kanji; a=[curQItem.on,curQItem.kun].filter(x=>x).join(' / ');
                let safe=0; while(dists.length<3 && safe++<50) { let r=curSet[Math.floor(Math.random()*curSet.length)]; let x=[r.on,r.kun].filter(y=>y).join(' / '); if(x!==a && !dists.includes(x)) dists.push(x); }
            } else {
                q='Which Kanji reads...'; m=[curQItem.on,curQItem.kun].filter(x=>x).join(' / '); a=curQItem.kanji; dists = kRand(curSet, 'kanji', a);
            }
        } else if(curMode==='quiz-vocab') {
            q = 'What is the meaning?'; m = curQItem.word; a = curQItem.meaning;
            let safe=0; while(dists.length<3 && safe++<50) { let r=curSet[Math.floor(Math.random()*curSet.length)]; if(r.meaning && r.meaning!==a && !dists.includes(r.meaning)) dists.push(r.meaning); }
        } else if(curMode==='quiz-conj') {
            const forms=['masu','te','nai','ta','potential']; const f=forms[Math.floor(Math.random()*forms.length)];
            const lbls={'masu':'Polite','te':'Te-Form','nai':'Negative','ta':'Past','potential':'Potential'};
            q=`What is the ${lbls[f]} form?`; m=`${curQItem.meaning} (${curQItem.dict})`; a=curQItem[f];
            let safe=0; while(dists.length<3 && safe++<50) { let r=curSet[Math.floor(Math.random()*curSet.length)]; if(r[f]!==a && !dists.includes(r[f])) dists.push(r[f]); }
        }

        curAns = a;
        setTxt('k-q-ask', q);
        setTxt('k-q-main', m);
        const isBig = (curMode.includes('quiz-meaning') && effectiveSubMode==='normal') || (curMode.includes('quiz-reading') && effectiveSubMode==='normal') || curMode==='quiz-vocab';
        const mainEl = document.getElementById('k-q-main');
        if(mainEl) mainEl.style.fontSize = isBig ? '5rem' : '2.5rem';
        kRenderOpts(a, dists);
    };

    KanjiApp.check = function(sel, btn) {
        const nextBtn = document.getElementById('k-q-next');
        if(nextBtn && !nextBtn.classList.contains('k-hidden')) return;

        const msg = document.getElementById('k-q-msg');
        if(sel===curAns) {
            btn.classList.add('correct'); curStreak++;
            const readEl = document.getElementById('k-q-read-reveal');
            if(readEl) {
                if(curMode === 'quiz-meaning') { readEl.innerText = [curQItem.on, curQItem.kun].filter(x => x).join(' / '); readEl.classList.remove('k-hidden'); }
                else if (curMode === 'quiz-reading') { readEl.innerText = curQItem.meaning; readEl.classList.remove('k-hidden'); }
            }

            if(curMode === 'quiz-vocab' && quizPhase === 1) {
                if(msg) {
                    msg.innerText = "Correct! BONUS: Select the Reading"; msg.style.color="#155724"; msg.style.background="#d4edda"; msg.classList.remove('k-hidden');
                }
                setTimeout(() => {
                    quizPhase = 2;
                    setTxt('k-q-ask', "What is the reading?");
                    let dists = []; let safe=0;
                    while(dists.length<3 && safe++<50) { let r=curSet[Math.floor(Math.random()*curSet.length)]; if(r.reading && r.reading!==curQItem.reading && !dists.includes(r.reading)) dists.push(r.reading); }
                    curAns = curQItem.reading;
                    if(msg) msg.classList.add('k-hidden');
                    kRenderOpts(curAns, dists);
                }, 800);
                return;
            }
            if(curStreak > curBest) { curBest = curStreak; if(curCategory) { bestScores[curCategory] = curBest; window.JPShared.progress.setBestScore(curCategory, curBest); } }
            if(msg) { msg.innerText=`Correct! Streak: ${curStreak} 🔥`; msg.style.color="#155724"; msg.style.background="#d4edda"; }
        } else {
            btn.classList.add('wrong'); curStreak = 0;
            if(msg) { msg.innerText=`Wrong! It was: ${curAns}`; msg.style.color="#721c24"; msg.style.background="#f8d7da"; }
            document.querySelectorAll('.k-opt').forEach(b=>{if(b.innerText===curAns)b.classList.add('correct')});
        }
        setTxt('k-streak', curStreak);
        setTxt('k-best', curBest);
        if(msg) msg.classList.remove('k-hidden');
        if(nextBtn) nextBtn.classList.remove('k-hidden');
    };

    function kRand(set, key, exc) {
        let res=[]; let s=0;
        while(res.length<3 && s++<100) { let r=set[Math.floor(Math.random()*set.length)][key]; if(r!==exc && !res.includes(r)) res.push(r); }
        return res;
    }

    function kRenderOpts(ans, dists) {
        let opts = [ans, ...dists].sort(()=>Math.random()-0.5);
        const c = document.getElementById('k-q-opts');
        if(!c) return;
        c.innerHTML = '';
        opts.forEach(o => {
            let b = document.createElement('div'); b.className='k-opt'; b.innerText=o;
            b.onclick = ()=>KanjiApp.check(o, b);
            c.appendChild(b);
        });
    }

    // UPDATED kRenderFC with SPEAKER BUTTON
    function kRenderFC() {
        const d = curSet[curIdx];
        setTxt('k-fc-progress', `Card ${curIdx+1} / ${curSet.length}`);

        const cardObj = document.getElementById('k-fc-card-obj');
        if(cardObj) cardObj.classList.remove('is-flipped');

        const stamp = document.getElementById('k-fc-flagged-icon');
        if(stamp) {
            const kKey = d.kanji || d.word || d.dict;
            if((d.isRequeued || activeFlags[kKey]) && curMode !== 'flag-review') stamp.classList.remove('k-hidden');
            else stamp.classList.add('k-hidden');
        }

        const navContainer = document.getElementById('k-fc-nav-container');
        if (navContainer) {
            navContainer.innerHTML = ''; // Clear existing

            if(curMode === 'flag-review') {
                navContainer.innerHTML = `
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                            <button class="k-btn k-btn-sec" style="color:#f39c12; border-color:#f39c12; font-weight:900; min-height: 70px; padding: 10px;" onclick="KanjiApp.flag(this)">Keep Flag (+1)</button>
                            <button class="k-btn k-btn-sec" style="color:#2ed573; border-color:#2ed573; font-weight:900; min-height: 70px; padding: 10px;" onclick="KanjiApp.clearFlag(this)">Clear Flag</button>
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                            <button class="k-btn k-btn-sec" style="min-height: 70px; padding: 10px;" onclick="KanjiApp.move(-1)">Prev</button>
                            <button class="k-btn k-btn-sec" style="min-height: 70px; padding: 10px;" onclick="KanjiApp.move(1)">Next</button>
                        </div>
                    </div>
                `;
            } else {
                navContainer.innerHTML = `
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <button class="k-btn k-btn-sec" onclick="KanjiApp.move(-1)">Prev</button>
                        <button class="k-btn k-btn-sec" style="color:#f39c12; border-color:#f39c12;" onclick="KanjiApp.flag(this)">Flag 🚩</button>
                        <button class="k-btn k-btn-sec" onclick="KanjiApp.move(1)">Next</button>
                    </div>
                `;
            }
        }

        const backEl = document.getElementById('k-fc-back-content');

        let renderType = curType;
        if(curType === 'mixed' && d._type) renderType = d._type;

        // SPEECH TEXT DETERMINATION - Using data attribute to prevent injection
        const speakText = d.reading || d.kanji || d.word || d.surface;
        const escapedText = speakText.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const speakBtnHtml = `<span class="jp-speak-btn" data-speak-text="${escapedText}" style="cursor:pointer; font-size:0.6em; margin-left:10px; opacity:0.7;">🔊</span>`;

        if(renderType==='kanji') {
            setTxt('k-fc-lbl', d.lesson);
            if(curMode === 'flag-review') setTxt('k-fc-lbl', `🚩 Flags: ${flagCounts[d.kanji]||0}`);

            document.getElementById('k-fc-main').innerHTML = d.kanji + speakBtnHtml;
            // Attach click handler to speaker button
            const speakBtn = document.querySelector('#k-fc-main .jp-speak-btn');
            if (speakBtn) {
                speakBtn.onclick = function(e) {
                    e.stopPropagation();
                    window.JPShared.tts.speak(speakText);
                };
            }
            setTxt('k-fc-sub', "");

            let h = `<div style="text-align:center; font-weight:700; font-size:2rem; margin-bottom:15px; color:var(--primary); line-height:1.2;">${d.meaning}</div>`;
            const flags = flagCounts[d.kanji] || 0;
            if(flags > 0) h += `<div style="text-align:center; color:#ff4757; font-weight:700; margin-bottom:15px; font-size:0.8rem;">🚩 Flagged: ${flags} times</div>`;
            h += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px; width:100%">
                    <div style="background:#f8f9fa; padding:10px; border-radius:8px; text-align:center"><div style="font-size:0.7rem; color:#aaa; font-weight:700;">ON-YOMI</div><div style="font-size:1.2rem; font-weight:600;">${d.on||'-'}</div></div>
                    <div style="background:#f8f9fa; padding:10px; border-radius:8px; text-align:center"><div style="font-size:0.7rem; color:#aaa; font-weight:700;">KUN-YOMI</div><div style="font-size:1.2rem; font-weight:600;">${d.kun||'-'}</div></div>
                  </div>`;
            h += `<div class="k-lbl" style="text-align:left;margin-top:10px;border-bottom:1px solid #eee;">Compounds</div><table class="k-tbl">`;
            const cs=(d.compounds||'').split(';'), rs=(d.comp_readings||'').split(';'), ms=(d.comp_meanings||'').split(';');
            cs.forEach((c,i)=>{ if(c) h+=`<tr><td style="font-weight:bold; font-size:1.2rem">${c}</td><td><div style="font-size:1rem">${rs[i]||''}</div><div style="color:#747d8c; font-size:0.9rem">${ms[i]||''}</div></td></tr>`; });
            if(backEl) backEl.innerHTML = h+'</table>';

        } else if(renderType==='vocab') {
            setTxt('k-fc-lbl', "Vocabulary");
            if(curMode === 'flag-review') setTxt('k-fc-lbl', `🚩 Flags: ${flagCounts[d.word]||0}`);

            document.getElementById('k-fc-main').innerHTML = d.word + speakBtnHtml;
            // Attach click handler to speaker button
            const speakBtn = document.querySelector('#k-fc-main .jp-speak-btn');
            if (speakBtn) {
                speakBtn.onclick = function(e) {
                    e.stopPropagation();
                    window.JPShared.tts.speak(speakText);
                };
            }
            setTxt('k-fc-sub', "");

            let h = `<div style="text-align:center; font-weight:700; font-size:2rem; margin-bottom:10px; color:var(--primary); line-height:1.2;">${d.meaning}</div>`;
            h += `<div style="text-align:center; font-size:1.5rem; color:#555; font-family:'Noto Sans JP'; margin-bottom:15px;">${d.reading}</div>`;
            if(d.gtype) h += `<div style="display:inline-block; background:#eee; color:#555; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:12px; text-transform:uppercase; margin-bottom:15px;">${d.gtype}</div>`;
            if(d.notes) h += `<div style="margin-top:10px; padding:12px; background:#fff8e1; border-left:4px solid #ffca28; color:#5d4037; font-size:0.9rem; text-align:left; border-radius:4px; line-height:1.4;"><strong>Note:</strong> ${d.notes}</div>`;
            const flags = flagCounts[d.word] || 0;
            if(flags > 0) h += `<div style="text-align:center; color:#ff4757; font-weight:700; margin-top:15px; font-size:0.8rem;">🚩 Flagged: ${flags} times</div>`;
            if(backEl) backEl.innerHTML = h;

        } else { // Verb
            setTxt('k-fc-lbl', 'Verb');
            if(curMode === 'flag-review') setTxt('k-fc-lbl', `🚩 Flags: ${flagCounts[d.kanji||d.dict]||0}`);

            const vText = d.kanji==='-'?d.dict:d.kanji;
            document.getElementById('k-fc-main').innerHTML = vText + speakBtnHtml;
            // Attach click handler to speaker button
            const speakBtn = document.querySelector('#k-fc-main .jp-speak-btn');
            if (speakBtn) {
                speakBtn.onclick = function(e) {
                    e.stopPropagation();
                    window.JPShared.tts.speak(speakText);
                };
            }
            setTxt('k-fc-sub', "");

            let h = `<div style="text-align:center; font-weight:700; font-size:2rem; margin-bottom:15px; color:var(--primary);">${d.meaning}</div>`;
            h += `<div style="text-align:center; margin-bottom:10px; color:#555;">${d.reading}</div>`;
            h += `<table class="k-tbl"><tr><th>Masu</th><td>${d.masu}</td></tr><tr><th>Te</th><td>${d.te}</td></tr><tr><th>Nai</th><td>${d.nai}</td></tr><tr><th>Ta</th><td>${d.ta}</td></tr><tr><th>Potential</th><td>${d.potential}</td></tr></table>`;
            if(backEl) backEl.innerHTML = h;
        }
    }

    function kUpdateStats() {
        setTxt('k-cnt-k', DB.kanji.filter(k => activeLessons.has(k.lesson)).length);
        setTxt('k-cnt-v', DB.verb.length);
        setTxt('k-hs-meaning', bestScores.meaning);
        setTxt('k-hs-reading', bestScores.reading);
        setTxt('k-hs-vocab', bestScores.vocab);
        setTxt('k-cnt-flags', Object.keys(activeFlags).length);

        let vocabCount = 0;
        const activeK = DB.kanji.filter(k => activeLessons.has(k.lesson));
        const uniqueVocab = new Set();
        activeK.forEach(k => {
            const cs = (k.compounds||'').split(';');
            cs.forEach(c => { if(c) uniqueVocab.add(c); });
        });
        setTxt('k-cnt-vocab', uniqueVocab.size);
    }

    // --- 5. INIT & DATA FETCH ---
    (async function() {
        try {
            await new Promise(r => setTimeout(r, 50));
            const manifest = await window.getManifest(REPO_CONFIG);
            const glossParts = await Promise.all(
                manifest.levels.map(lvl => fetch(window.getAssetUrl(REPO_CONFIG, manifest.data[lvl].glossary) + "?t=" + Date.now()).then(r => r.json()))
            );
            const raw = glossParts.flatMap(g => g.entries);

            const allVocab = raw.filter(i => i.type === 'vocab');
            allVocab.forEach(v => {
                DB.vocabMap.set(v.surface, v);
            });

            DB.kanji = raw.filter(i => i.type === 'kanji').map(k => {
                const compounds=[], comp_readings=[], comp_meanings=[];
                allVocab.forEach(v => {
                    if (v.surface.includes(k.surface) && compounds.length < 5) {
                        compounds.push(v.surface); comp_readings.push(v.reading); comp_meanings.push(v.meaning);
                    }
                });
                return {
                    class: k.lesson||"General", lesson: k.lesson||"Other", kanji: k.surface,
                    on: k.on||"", kun: k.kun||"", meaning: k.meaning,
                    compounds: compounds.join(';'), comp_readings: comp_readings.join(';'), comp_meanings: comp_meanings.join(';')
                };
            });

            const baseVerbs = raw.filter(i => i.type === 'vocab' && i.gtype === 'verb' && !i.id.includes('__'));
            DB.verb = baseVerbs.map(base => {
                const getForm = (suffix) => { const f = raw.find(i => i.id === base.id + suffix); return f ? f.surface : '-'; };
                return {
                    kanji: base.surface, dict: base.surface, reading: base.reading, meaning: base.meaning,
                    masu: getForm('__polite'), te: getForm('__te'), nai: getForm('__negative'), ta: getForm('__past'), potential: getForm('__potential')
                };
            });

            const lessonMap = {};
            DB.kanji.forEach(k => {
                if(!k.lesson) return;
                if(!lessonMap[k.lesson]) lessonMap[k.lesson] = { id: k.lesson, topic: `Lesson ${k.lesson}`, kanji: [] };
                lessonMap[k.lesson].kanji.push(k.kanji);
            });
            DB.lessons = Object.values(lessonMap).map(l => ({ id: l.id, topic: l.topic, kanji_list: l.kanji.join(', ') }));
            DB.lessons.sort((a,b) => {
                const pa = a.id.replace('N','').split('.').map(Number); const pb = b.id.replace('N','').split('.').map(Number);
                if(pa[0]!==pb[0]) return pa[0]-pb[0]; return (pa[1]||0) - (pb[1]||0);
            });

            const container = document.getElementById('k-lesson-container');
            if(container) {
                container.innerHTML = '';
                const groups = {};
                DB.lessons.forEach(l => {
                    const cls = l.id.split('.')[0] || "Other";
                    if(!groups[cls]) groups[cls] = [];
                    groups[cls].push(l);
                    activeLessons.add(l.id);
                });

                Object.keys(groups).sort().forEach(cls => {
                    const div = document.createElement('div'); div.className = 'k-lvl-group';
                    div.innerHTML = `
                        <div class="k-lvl-header" onclick="KanjiApp.toggleAccordion(this)">
                            <input type="checkbox" class="k-chk" checked onclick="event.stopPropagation(); KanjiApp.toggleAll('${cls}', this)">
                            <div class="k-lvl-title">${cls}</div><div class="k-lvl-arrow">▼</div>
                        </div>
                        <div class="k-lvl-list">${groups[cls].map(l => `<div class="k-lesson-row"><input type="checkbox" class="k-chk k-chk-${cls}" value="${l.id}" checked onchange="KanjiApp.updateLesson('${l.id}', '${cls}')"><div class="k-l-info" onclick="this.previousElementSibling.click()"><div class="k-l-topic">${l.topic}</div><div class="k-l-kanji">${l.kanji_list}</div></div></div>`).join('')}</div>`;
                    container.appendChild(div);
                });
            }

            kUpdateStats();
            const loader = document.getElementById('k-loader');
            if(loader) loader.classList.add('k-hidden');

        } catch(e) {
            console.error(e);
            const errBox = document.getElementById('k-error-box');
            if(errBox) {
                errBox.innerText = "Error: " + (e.message || "Unknown error");
                errBox.classList.remove('k-hidden');
            }
        }
    })();
  }
};
