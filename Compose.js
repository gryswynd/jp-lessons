window.ComposeModule = {
  start: function(container, sharedConfig, exitCallback) {

    // --- NAMESPACE ---
    window.ComposeApp = {};

    // --- FONTS ---
    if (!document.getElementById('compose-fonts')) {
        const link = document.createElement('link');
        link.id = 'compose-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Poppins:wght@400;500;600;700&display=swap';
        document.head.appendChild(link);
    }

    // --- CSS ---
    if (!document.getElementById('jp-compose-style')) {
        const style = document.createElement('style');
        style.id = 'jp-compose-style';
        style.textContent = `
            #compose-app-root {
                --c-primary: #00897B; --c-primary-dark: #00695C;
                --c-primary-light: #e0f2f1;
                --c-bg-grad: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
                --c-text-main: #2f3542; --c-text-sub: #747d8c;
                --c-success: #2ed573; --c-error: #ff4757;
                --c-gold: #f39c12;

                font-family: 'Poppins', 'Noto Sans JP', sans-serif;
                background: var(--c-bg-grad); color: var(--c-text-main);
                display: flex; flex-direction: column;
                width: 100%; max-width: 600px; margin: 0 auto;
                height: 800px; border-radius: 20px;
                border: 1px solid rgba(0,0,0,0.05); overflow: hidden; position: relative;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            #compose-app-root * { box-sizing: border-box; }

            #compose-app-root header {
                background: rgba(0, 137, 123, 0.95); color: white; padding: 1.2rem;
                text-align: center; font-weight: 900; letter-spacing: 0.05em; font-size: 1.2rem;
                cursor: pointer; user-select: none; z-index: 10;
                box-shadow: 0 4px 15px rgba(0, 137, 123, 0.3); backdrop-filter: blur(5px);
                display: flex; justify-content: space-between; align-items: center;
            }
            .c-exit-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.8rem; }

            #c-app-container { flex: 1; overflow-y: auto; padding: 1.2rem; display: flex; flex-direction: column; align-items: center; width: 100%; position: relative; z-index: 1; }
            .c-card { background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); padding: 1.5rem; width: 100%; text-align: center; margin-bottom: 1rem; border: 1px solid rgba(0,0,0,0.02); }
            .c-btn { background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%); color: white; border: none; padding: 14px; border-radius: 12px; font-size: 1rem; font-weight: 700; width: 100%; margin: 6px 0; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0, 137, 123, 0.2); }
            .c-btn:active { transform: scale(0.98); }
            .c-btn-sec { background: white; color: var(--c-text-sub); border: 2px solid #dfe4ea; box-shadow: none; }
            .c-btn-sm { padding: 8px 14px; font-size: 0.85rem; width: auto; margin: 4px; display: inline-block; }
            .c-hidden { display: none !important; }
            .c-lbl { font-size: 0.8rem; text-transform: uppercase; color: #a4b0be; font-weight: 700; letter-spacing: 0.1em; margin-top: 8px; margin-bottom: 8px; }

            /* LESSON CHECKBOXES */
            .c-lesson-row { display: flex; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f1f2f6; text-align: left; cursor: pointer; transition: background 0.15s; }
            .c-lesson-row:hover { background: #f8f9fa; }
            .c-lesson-row:last-child { border-bottom: none; }
            .c-lesson-chk { width: 18px; height: 18px; margin-right: 12px; accent-color: var(--c-primary); cursor: pointer; }
            .c-lesson-info { flex: 1; }
            .c-lesson-name { font-weight: 700; font-size: 0.95rem; color: var(--c-text-main); }
            .c-lesson-kanji { font-size: 0.85rem; color: var(--c-text-sub); margin-top: 2px; }

            /* PROMPT CARDS */
            .c-prompt-card { background: white; border-radius: 14px; padding: 1.2rem; margin-bottom: 12px; border: 2px solid #e0f2f1; text-align: left; cursor: pointer; transition: all 0.2s; }
            .c-prompt-card:hover { border-color: var(--c-primary); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 137, 123, 0.1); }
            .c-prompt-title { font-weight: 800; font-size: 1.05rem; color: var(--c-primary-dark); margin-bottom: 4px; }
            .c-prompt-desc { font-size: 0.88rem; color: var(--c-text-sub); line-height: 1.4; }
            .c-prompt-meta { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
            .c-prompt-tag { font-size: 0.72rem; padding: 3px 8px; border-radius: 6px; font-weight: 700; }
            .c-prompt-tag-lesson { background: #e0f2f1; color: #00695C; }
            .c-prompt-tag-count { background: #fff3e0; color: #e65100; }
            .c-prompt-saved { font-size: 0.75rem; color: var(--c-success); font-weight: 600; }

            /* COMPOSE VIEW */
            .c-prompt-banner { background: linear-gradient(135deg, #e0f2f1, #b2dfdb); border-radius: 14px; padding: 1rem 1.2rem; margin-bottom: 12px; text-align: left; border-left: 5px solid var(--c-primary); }
            .c-prompt-banner-title { font-weight: 800; font-size: 1rem; color: var(--c-primary-dark); margin-bottom: 4px; }
            .c-prompt-banner-text { font-size: 0.88rem; color: #37474F; line-height: 1.5; }
            .c-prompt-banner-hint { font-size: 0.92rem; color: var(--c-primary-dark); font-weight: 600; margin-top: 8px; font-family: 'Noto Sans JP', sans-serif; }

            /* PROGRESS BAR */
            .c-progress-wrap { width: 100%; margin-bottom: 12px; }
            .c-progress-bar-outer { width: 100%; height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden; }
            .c-progress-bar-inner { height: 100%; background: linear-gradient(90deg, var(--c-primary), var(--c-success)); border-radius: 5px; transition: width 0.4s ease; }
            .c-progress-text { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: var(--c-text-sub); margin-top: 4px; }

            /* TEXTAREA */
            .c-textarea { width: 100%; min-height: 120px; max-height: 200px; border: 2px solid #dfe4ea; border-radius: 12px; padding: 12px; font-size: 1.1rem; font-family: 'Noto Sans JP', 'Poppins', sans-serif; line-height: 1.8; resize: vertical; outline: none; transition: border-color 0.2s; color: var(--c-text-main); }
            .c-textarea:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1); }
            .c-textarea::placeholder { color: #b0bec5; font-size: 0.95rem; }
            .c-char-count { text-align: right; font-size: 0.75rem; color: #a4b0be; font-weight: 600; margin-top: 4px; }

            /* WORD TARGETS */
            .c-target-list { text-align: left; margin-bottom: 8px; }
            .c-target-item { display: flex; align-items: center; padding: 8px 10px; border-radius: 8px; margin-bottom: 4px; transition: all 0.3s; border: 1px solid #f1f2f6; }
            .c-target-item.done { background: #e8f5e9; border-color: #c8e6c9; }
            .c-target-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #dfe4ea; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 0.8rem; flex-shrink: 0; transition: all 0.3s; }
            .c-target-item.done .c-target-check { background: var(--c-success); border-color: var(--c-success); color: white; }
            .c-target-surface { font-family: 'Noto Sans JP', sans-serif; font-size: 1.1rem; font-weight: 700; margin-right: 6px; cursor: pointer; }
            .c-target-surface:hover { color: var(--c-primary); }
            .c-target-reading { font-size: 0.85rem; color: #78909C; margin-right: 8px; }
            .c-target-meaning { font-size: 0.82rem; color: var(--c-text-sub); flex: 1; }
            .c-target-count { font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 10px; background: #f5f5f5; color: #78909C; min-width: 36px; text-align: center; }
            .c-target-item.done .c-target-count { background: var(--c-success); color: white; }

            /* ACCORDION SECTIONS */
            .c-section { margin-bottom: 8px; border-radius: 10px; overflow: hidden; border: 1px solid #e0e0e0; }
            .c-section-hdr { padding: 10px 14px; background: #fafafa; cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none; }
            .c-section-hdr:hover { background: #f5f5f5; }
            .c-section-title { font-weight: 700; font-size: 0.88rem; color: var(--c-text-main); }
            .c-section-arrow { font-size: 0.75rem; color: #a4b0be; transition: transform 0.3s; }
            .c-section-hdr.open .c-section-arrow { transform: rotate(180deg); }
            .c-section-body { display: none; padding: 10px 12px; background: white; }
            .c-section-body.open { display: block; }

            /* WORD CHIPS */
            .c-chip-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
            .c-chip { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 8px; font-size: 0.82rem; cursor: pointer; transition: all 0.15s; border: 1px solid #e0e0e0; background: white; user-select: none; }
            .c-chip:hover { background: var(--c-primary-light); border-color: var(--c-primary); }
            .c-chip:active { transform: scale(0.95); }
            .c-chip-jp { font-family: 'Noto Sans JP', sans-serif; font-weight: 700; font-size: 0.9rem; }
            .c-chip-en { color: var(--c-text-sub); font-size: 0.75rem; }
            .c-chip-cat { background: var(--c-primary-light); color: var(--c-primary-dark); font-weight: 800; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; }

            /* PARTICLE REFERENCE */
            .c-particle-ref { font-size: 0.82rem; color: #78909C; line-height: 1.8; text-align: left; padding: 8px 0; }
            .c-particle-ref span { font-family: 'Noto Sans JP', sans-serif; background: #f5f5f5; padding: 2px 6px; border-radius: 4px; margin: 2px; display: inline-block; font-weight: 600; font-size: 0.85rem; }

            /* COMPLETE BANNER */
            .c-complete-banner { background: linear-gradient(135deg, #2ed573, #26de81); color: white; border-radius: 14px; padding: 1.2rem; text-align: center; margin-bottom: 12px; animation: c-celebrate 0.5s ease; }
            .c-complete-banner h3 { margin: 0 0 4px 0; font-size: 1.3rem; }
            .c-complete-banner p { margin: 0; font-size: 0.9rem; opacity: 0.9; }
            @keyframes c-celebrate { 0% { transform: scale(0.9); opacity: 0; } 50% { transform: scale(1.03); } 100% { transform: scale(1); opacity: 1; } }

            /* ACTION BAR */
            .c-action-bar { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }

            /* SCORE BUTTON */
            .c-btn-score { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); box-shadow: 0 4px 6px rgba(243, 156, 18, 0.25); }

            /* SCORE OVERLAY */
            .c-score-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 40; display: flex; align-items: center; justify-content: center; animation: c-fade-in 0.2s ease; }
            @keyframes c-fade-in { from { opacity: 0; } to { opacity: 1; } }
            .c-score-card { background: white; border-radius: 20px; padding: 1.8rem 1.5rem; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2); animation: c-score-pop 0.35s ease; }
            @keyframes c-score-pop { 0% { transform: scale(0.85); opacity: 0; } 60% { transform: scale(1.03); } 100% { transform: scale(1); opacity: 1; } }
            .c-score-total { font-size: 3rem; font-weight: 900; color: var(--c-primary-dark); margin: 8px 0; }
            .c-score-label { font-size: 0.85rem; color: var(--c-text-sub); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
            .c-score-grade { font-size: 1.4rem; font-weight: 800; margin: 4px 0 12px 0; }
            .c-score-breakdown { text-align: left; margin: 12px 0; }
            .c-score-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-bottom: 1px solid #f1f2f6; }
            .c-score-row:last-child { border-bottom: none; }
            .c-score-row-label { font-size: 0.85rem; font-weight: 600; color: var(--c-text-main); }
            .c-score-row-detail { font-size: 0.75rem; color: var(--c-text-sub); }
            .c-score-row-pts { font-size: 0.95rem; font-weight: 800; color: var(--c-primary); }
            .c-score-bar { height: 6px; background: #e0e0e0; border-radius: 3px; margin-top: 4px; overflow: hidden; }
            .c-score-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
        `;
        document.head.appendChild(style);
    }

    // --- APP CONTAINER ---
    container.innerHTML = '';
    const appRoot = document.createElement('div');
    appRoot.id = 'compose-app-root';
    container.appendChild(appRoot);

    appRoot.innerHTML = `
        <div id="c-loader" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.98);z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-size:3rem;margin-bottom:15px;">✏️</div>
            <div style="font-weight:800;color:#00897B;font-size:1.2rem">Loading Vocabulary...</div>
            <div id="c-error-box" class="c-hidden" style="color:#ff4757;margin-top:10px;padding:10px;max-width:80%;font-size:0.9rem"></div>
        </div>
        <header>
            <span onclick="ComposeApp.showMenu()">Compose 作文</span>
            <button class="c-exit-btn">Exit</button>
        </header>
        <div id="c-app-container">
            <div id="c-view-menu" style="width:100%"></div>
            <div id="c-view-compose" class="c-hidden" style="width:100%"></div>
        </div>
    `;

    appRoot.querySelector('.c-exit-btn').onclick = exitCallback;

    // --- DATA ---
    const REPO_CONFIG = sharedConfig;

    const LESSON_META = {
        'N4.28': { title: 'Places & Parts', kanji: '池 林 門 村', focus: 'Ponds, groves, gates, and villages' },
        'N4.29': { title: 'Measurement & Knowledge', kanji: '台 知 計 以', focus: 'Measuring, knowing, and amounts' },
        'N4.30': { title: 'Thoughts & Answers', kanji: '思 特 集 答', focus: 'Thinking, special occasions, gathering' },
        'N4.31': { title: 'Times & Openings', kanji: '代 森 堂 開', focus: 'Eras, forests, halls, and opening things' },
        'N4.32': { title: 'Use, Learn, & The City', kanji: '引 用 習 市', focus: 'Pulling, usage, learning skills, and city life' },
        'N4.33': { title: 'Places, Factories, & Buildings', kanji: '場 工 広 建', focus: 'Places, construction, width, and buildings' }
    };

    let PROMPTS = [];
    let HELPER_VOCAB = [];
    let PARTICLES = [];

    // --- STATE ---
    const selectedLessons = new Set(['N4.28', 'N4.29', 'N4.30', 'N4.31', 'N4.32', 'N4.33']);
    let currentPrompt = null;
    let lessonVocab = []; // vocab items from glossary for selected lessons
    let allVocab = [];    // all vocab from glossary

    // --- HELPER FUNCTIONS ---
    function countOccurrences(text, matches) {
        let total = 0;
        for (const m of matches) {
            let idx = 0;
            while ((idx = text.indexOf(m, idx)) !== -1) {
                total++;
                idx += m.length;
            }
        }
        return total;
    }

    function escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --- MENU VIEW ---
    ComposeApp.showMenu = function() {
        currentPrompt = null;
        const menuEl = document.getElementById('c-view-menu');
        const compEl = document.getElementById('c-view-compose');
        if (compEl) compEl.classList.add('c-hidden');
        if (!menuEl) return;
        menuEl.classList.remove('c-hidden');

        // Build lesson checkboxes
        let lessonHtml = '';
        Object.keys(LESSON_META).forEach(id => {
            const m = LESSON_META[id];
            const checked = selectedLessons.has(id) ? 'checked' : '';
            lessonHtml += `<div class="c-lesson-row" onclick="this.querySelector('input').click()">
                <input type="checkbox" class="c-lesson-chk" value="${id}" ${checked}
                    onclick="event.stopPropagation(); ComposeApp.toggleLesson('${id}', this)">
                <div class="c-lesson-info">
                    <div class="c-lesson-name">${id}: ${escHtml(m.title)}</div>
                    <div class="c-lesson-kanji">${escHtml(m.kanji)} &mdash; ${escHtml(m.focus)}</div>
                </div>
            </div>`;
        });

        // Filter prompts by selected lessons
        const available = PROMPTS.filter(p => p.lessons.every(l => selectedLessons.has(l)));

        let promptHtml = '';
        if (available.length === 0) {
            promptHtml = '<div style="padding:20px;text-align:center;color:#a4b0be;font-weight:600;">Select at least one lesson to see prompts.</div>';
        } else {
            available.forEach(p => {
                const saved = window.JPShared.progress.getDraft(p.id);
                const savedBadge = saved ? '<span class="c-prompt-saved">draft saved</span>' : '';
                const lessonTags = p.lessons.map(l => `<span class="c-prompt-tag c-prompt-tag-lesson">${l}</span>`).join('');
                promptHtml += `<div class="c-prompt-card" onclick="ComposeApp.startCompose('${p.id}')">
                    <div class="c-prompt-title">${p.emoji} ${escHtml(p.title)} <span style="font-family:'Noto Sans JP';font-weight:500;font-size:0.9rem;color:#78909C">${escHtml(p.titleJp)}</span></div>
                    <div class="c-prompt-desc">${escHtml(p.scenario)}</div>
                    <div class="c-prompt-meta">
                        ${lessonTags}
                        <span class="c-prompt-tag c-prompt-tag-count">${p.targets.length} words</span>
                        ${savedBadge}
                    </div>
                </div>`;
            });
        }

        menuEl.innerHTML = `
            <div class="c-card" style="padding:1.2rem;">
                <div class="c-lbl" style="color:var(--c-primary);margin-top:0;">SELECT LESSONS</div>
                ${lessonHtml}
            </div>
            <div class="c-lbl" style="color:var(--c-primary);">CHOOSE A PROMPT</div>
            <div id="c-prompt-list">${promptHtml}</div>
        `;
    };

    ComposeApp.toggleLesson = function(id, chk) {
        if (chk.checked) selectedLessons.add(id);
        else selectedLessons.delete(id);
        // Refresh prompt list only (keep checkboxes as-is)
        ComposeApp.refreshPrompts();
    };

    ComposeApp.refreshPrompts = function() {
        const available = PROMPTS.filter(p => p.lessons.every(l => selectedLessons.has(l)));
        const listEl = document.getElementById('c-prompt-list');
        if (!listEl) return;

        if (available.length === 0) {
            listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#a4b0be;font-weight:600;">Select at least one lesson to see prompts.</div>';
            return;
        }

        let html = '';
        available.forEach(p => {
            const saved = window.JPShared.progress.getDraft(p.id);
            const savedBadge = saved ? '<span class="c-prompt-saved">draft saved</span>' : '';
            const lessonTags = p.lessons.map(l => `<span class="c-prompt-tag c-prompt-tag-lesson">${l}</span>`).join('');
            html += `<div class="c-prompt-card" onclick="ComposeApp.startCompose('${p.id}')">
                <div class="c-prompt-title">${p.emoji} ${escHtml(p.title)} <span style="font-family:'Noto Sans JP';font-weight:500;font-size:0.9rem;color:#78909C">${escHtml(p.titleJp)}</span></div>
                <div class="c-prompt-desc">${escHtml(p.scenario)}</div>
                <div class="c-prompt-meta">
                    ${lessonTags}
                    <span class="c-prompt-tag c-prompt-tag-count">${p.targets.length} words</span>
                    ${savedBadge}
                </div>
            </div>`;
        });
        listEl.innerHTML = html;
    };

    // --- COMPOSE VIEW ---
    ComposeApp.startCompose = function(promptId) {
        const prompt = PROMPTS.find(p => p.id === promptId);
        if (!prompt) return;
        currentPrompt = prompt;

        const menuEl = document.getElementById('c-view-menu');
        const compEl = document.getElementById('c-view-compose');
        if (menuEl) menuEl.classList.add('c-hidden');
        if (!compEl) return;
        compEl.classList.remove('c-hidden');

        // Build lesson vocab for display
        const promptLessonVocab = allVocab.filter(v => {
            const lessons = (v.lesson_ids || v.lesson || '').split(',').map(s => s.trim());
            return lessons.some(l => prompt.lessons.includes(l));
        });
        // Remove duplicates and entries that are conjugated forms
        const vocabSeen = new Set();
        const filteredVocab = promptLessonVocab.filter(v => {
            if (v.id && v.id.includes('__')) return false; // skip conjugated forms
            if (vocabSeen.has(v.surface)) return false;
            vocabSeen.add(v.surface);
            return true;
        });

        // Build target tracking HTML
        let targetHtml = '';
        prompt.targets.forEach((t, i) => {
            targetHtml += `<div class="c-target-item" id="c-tgt-${i}">
                <div class="c-target-check" id="c-tgt-chk-${i}"></div>
                <span class="c-target-surface" onclick="ComposeApp.insertWord('${escHtml(t.surface)}')" title="Click to insert">${escHtml(t.surface)}</span>
                <span class="c-target-reading">${escHtml(t.reading)}</span>
                <span class="c-target-meaning">${escHtml(t.meaning)}</span>
                <span class="c-target-count" id="c-tgt-cnt-${i}">0/${t.count}</span>
            </div>`;
        });

        // Build lesson vocab chips
        let vocabChipHtml = '';
        filteredVocab.forEach(v => {
            const meaning = (v.meaning || '').substring(0, 25);
            vocabChipHtml += `<div class="c-chip" onclick="ComposeApp.insertWord('${escHtml(v.surface)}')" title="${escHtml(v.meaning)}">
                <span class="c-chip-jp">${escHtml(v.surface)}</span>
                <span class="c-chip-en">${escHtml(meaning)}</span>
            </div>`;
        });

        // Build helper vocab chips by category
        let helperHtml = '';
        HELPER_VOCAB.forEach(cat => {
            helperHtml += `<div style="margin-bottom:8px;"><span class="c-chip-cat">${escHtml(cat.cat)}</span></div><div class="c-chip-wrap" style="margin-bottom:10px;">`;
            cat.words.forEach(w => {
                helperHtml += `<div class="c-chip" onclick="ComposeApp.insertWord('${escHtml(w.surface)}')" title="${escHtml(w.meaning)}">
                    <span class="c-chip-jp">${escHtml(w.surface)}</span>
                    <span class="c-chip-en">${escHtml(w.meaning)}</span>
                </div>`;
            });
            helperHtml += '</div>';
        });

        // Particle reference
        const particleHtml = PARTICLES.map(p => `<span>${escHtml(p.particle + ' (' + p.role + ')')}</span>`).join(' ');

        // Load draft if exists
        const draft = window.JPShared.progress.getDraft(prompt.id);

        compEl.innerHTML = `
            <div class="c-prompt-banner">
                <div class="c-prompt-banner-title">${prompt.emoji} ${escHtml(prompt.title)}</div>
                <div class="c-prompt-banner-text">${escHtml(prompt.scenario)}</div>
                <div class="c-prompt-banner-hint">${escHtml(prompt.hint)}</div>
            </div>

            <div id="c-complete-box" class="c-hidden"></div>

            <div class="c-progress-wrap">
                <div class="c-progress-bar-outer">
                    <div class="c-progress-bar-inner" id="c-progress-fill" style="width:0%"></div>
                </div>
                <div class="c-progress-text">
                    <span id="c-progress-lbl">0 / ${prompt.targets.length} target words used</span>
                    <span id="c-progress-pct">0%</span>
                </div>
            </div>

            <textarea class="c-textarea" id="c-compose-input" placeholder="ここに日本語を書いてください... (Write Japanese here)">${escHtml(draft)}</textarea>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div class="c-char-count" id="c-char-count">${draft.length} characters</div>
                <div class="c-action-bar">
                    <button class="c-btn c-btn-sm c-btn-score" onclick="ComposeApp.showScore()" title="Score your composition">📊 Score</button>
                    <button class="c-btn c-btn-sm c-btn-sec" onclick="ComposeApp.speakComposition()" title="Listen to your composition">🔊 Listen</button>
                    <button class="c-btn c-btn-sm c-btn-sec" onclick="ComposeApp.clearDraft()" title="Clear composition">🗑️ Clear</button>
                </div>
            </div>

            <div class="c-section" style="margin-top:8px;">
                <div class="c-section-hdr open" onclick="ComposeApp.toggleSection(this)">
                    <span class="c-section-title">🎯 Target Words</span>
                    <span class="c-section-arrow">▼</span>
                </div>
                <div class="c-section-body open">
                    <div class="c-target-list" id="c-target-list">${targetHtml}</div>
                </div>
            </div>

            <div class="c-section">
                <div class="c-section-hdr" onclick="ComposeApp.toggleSection(this)">
                    <span class="c-section-title">📖 Lesson Vocabulary (${filteredVocab.length} words)</span>
                    <span class="c-section-arrow">▼</span>
                </div>
                <div class="c-section-body">
                    <div class="c-chip-wrap">${vocabChipHtml}</div>
                </div>
            </div>

            <div class="c-section">
                <div class="c-section-hdr" onclick="ComposeApp.toggleSection(this)">
                    <span class="c-section-title">🔧 Helper Words</span>
                    <span class="c-section-arrow">▼</span>
                </div>
                <div class="c-section-body">
                    ${helperHtml}
                </div>
            </div>

            <div class="c-section">
                <div class="c-section-hdr" onclick="ComposeApp.toggleSection(this)">
                    <span class="c-section-title">📌 Particle Reference</span>
                    <span class="c-section-arrow">▼</span>
                </div>
                <div class="c-section-body">
                    <div class="c-particle-ref">${particleHtml}</div>
                </div>
            </div>

            <button class="c-btn c-btn-sec" onclick="ComposeApp.showMenu()" style="margin-top:10px;border:none;color:#a4b0be;font-size:0.9rem">Back to Menu</button>
        `;

        // Setup input listener
        const input = document.getElementById('c-compose-input');
        if (input) {
            input.addEventListener('input', function() {
                ComposeApp.updateTracking();
                window.JPShared.progress.saveDraft(currentPrompt.id, input.value);
                const cc = document.getElementById('c-char-count');
                if (cc) cc.textContent = input.value.length + ' characters';
            });
            // Initial tracking if there's a draft
            if (draft) {
                setTimeout(() => ComposeApp.updateTracking(), 100);
            }
        }
    };

    ComposeApp.toggleSection = function(hdr) {
        hdr.classList.toggle('open');
        const body = hdr.nextElementSibling;
        if (body) body.classList.toggle('open');
    };

    ComposeApp.insertWord = function(word) {
        const input = document.getElementById('c-compose-input');
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;

        input.value = text.substring(0, start) + word + text.substring(end);
        input.selectionStart = input.selectionEnd = start + word.length;
        input.focus();

        // Trigger input event for tracking
        input.dispatchEvent(new Event('input'));
    };

    ComposeApp.updateTracking = function() {
        if (!currentPrompt) return;
        const input = document.getElementById('c-compose-input');
        if (!input) return;
        const text = input.value;

        let totalMet = 0;
        const totalTargets = currentPrompt.targets.length;

        currentPrompt.targets.forEach((t, i) => {
            const count = countOccurrences(text, t.matches);
            const met = count >= t.count;
            if (met) totalMet++;

            const item = document.getElementById('c-tgt-' + i);
            const chk = document.getElementById('c-tgt-chk-' + i);
            const cnt = document.getElementById('c-tgt-cnt-' + i);

            if (item) {
                if (met) item.classList.add('done');
                else item.classList.remove('done');
            }
            if (chk) chk.textContent = met ? '✓' : '';
            if (cnt) cnt.textContent = `${Math.min(count, t.count)}/${t.count}`;
        });

        // Update progress bar
        const pct = totalTargets > 0 ? Math.round((totalMet / totalTargets) * 100) : 0;
        const fill = document.getElementById('c-progress-fill');
        const lbl = document.getElementById('c-progress-lbl');
        const pctEl = document.getElementById('c-progress-pct');
        if (fill) fill.style.width = pct + '%';
        if (lbl) lbl.textContent = `${totalMet} / ${totalTargets} target words used`;
        if (pctEl) pctEl.textContent = pct + '%';

        // Complete banner
        const box = document.getElementById('c-complete-box');
        if (box) {
            if (totalMet === totalTargets && totalTargets > 0 && text.length > 0) {
                box.className = 'c-complete-banner';
                box.innerHTML = `<h3>All targets used!</h3><p>Great work! Keep writing to practice more, or try another prompt.</p>`;
            } else {
                box.className = 'c-hidden';
                box.innerHTML = '';
            }
        }
    };

    ComposeApp.speakComposition = function() {
        const input = document.getElementById('c-compose-input');
        if (!input || !input.value.trim()) return;
        window.JPShared.tts.speak(input.value.trim());
    };

    ComposeApp.clearDraft = function() {
        if (!currentPrompt) return;
        const input = document.getElementById('c-compose-input');
        if (!input) return;
        if (!confirm('Clear your composition? This cannot be undone.')) return;
        input.value = '';
        window.JPShared.progress.clearDraft(currentPrompt.id);
        input.dispatchEvent(new Event('input'));
    };

    // --- SCORING ---
    ComposeApp.showScore = function() {
        if (!currentPrompt) return;
        const input = document.getElementById('c-compose-input');
        if (!input || !input.value.trim()) return;
        const text = input.value;

        // 1. Vocab Score (0-40): unique lesson vocab words found in composition
        const promptLessonVocab = allVocab.filter(v => {
            const lessons = (v.lesson_ids || v.lesson || '').split(',').map(s => s.trim());
            return lessons.some(l => currentPrompt.lessons.includes(l));
        });
        const vocabSeen = new Set();
        const uniqueLessonVocab = promptLessonVocab.filter(v => {
            if (v.id && v.id.includes('__')) return false;
            if (vocabSeen.has(v.surface)) return false;
            vocabSeen.add(v.surface);
            return true;
        });
        let vocabUsed = 0;
        const vocabMatches = [];
        uniqueLessonVocab.forEach(v => {
            if (text.includes(v.surface)) {
                vocabUsed++;
                vocabMatches.push(v.surface);
            }
        });
        const vocabTotal = uniqueLessonVocab.length;
        const vocabRatio = vocabTotal > 0 ? vocabUsed / Math.min(vocabTotal, 15) : 0;
        const vocabScore = Math.min(40, Math.round(vocabRatio * 40));

        // 2. Length Score (0-30): based on character count
        const charCount = text.length;
        let lengthScore = 0;
        if (charCount >= 200) lengthScore = 30;
        else if (charCount >= 150) lengthScore = 25;
        else if (charCount >= 100) lengthScore = 20;
        else if (charCount >= 60) lengthScore = 15;
        else if (charCount >= 30) lengthScore = 10;
        else if (charCount >= 10) lengthScore = 5;

        // 3. Conjugation Tense Consistency (0-30)
        // Count polite (ます/ました/ません/ませんでした) vs plain (る/た/ない) verb endings
        const politePatterns = ['ます', 'ました', 'ません', 'ませんでした', 'ましょう', 'ですか', 'でした'];
        const plainPatterns = ['だった', 'ない', 'なかった'];
        let politeCount = 0;
        let plainCount = 0;
        politePatterns.forEach(p => {
            let idx = 0;
            while ((idx = text.indexOf(p, idx)) !== -1) { politeCount++; idx += p.length; }
        });
        plainPatterns.forEach(p => {
            let idx = 0;
            while ((idx = text.indexOf(p, idx)) !== -1) { plainCount++; idx += p.length; }
        });
        const totalVerbs = politeCount + plainCount;
        let tenseScore = 0;
        let tenseLabel = '';
        if (totalVerbs === 0) {
            tenseScore = 15;
            tenseLabel = 'No verb forms detected';
        } else {
            const dominant = Math.max(politeCount, plainCount);
            const consistency = dominant / totalVerbs;
            tenseScore = Math.round(consistency * 30);
            if (politeCount >= plainCount) {
                tenseLabel = `Polite form: ${politeCount}/${totalVerbs} endings`;
            } else {
                tenseLabel = `Plain form: ${plainCount}/${totalVerbs} endings`;
            }
        }

        // Total
        const total = vocabScore + lengthScore + tenseScore;
        let grade = '';
        let gradeColor = '';
        if (total >= 90) { grade = 'S  Excellent!'; gradeColor = '#f39c12'; }
        else if (total >= 75) { grade = 'A  Great Work!'; gradeColor = '#2ed573'; }
        else if (total >= 60) { grade = 'B  Good Job!'; gradeColor = '#00897B'; }
        else if (total >= 40) { grade = 'C  Keep Going!'; gradeColor = '#3498db'; }
        else { grade = 'D  Keep Practicing!'; gradeColor = '#78909C'; }

        // Build overlay
        const overlay = document.createElement('div');
        overlay.className = 'c-score-overlay';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="c-score-card">
                <div class="c-score-label">YOUR SCORE</div>
                <div class="c-score-total">${total}<span style="font-size:1rem;color:#a4b0be">/100</span></div>
                <div class="c-score-grade" style="color:${gradeColor}">${grade}</div>
                <div class="c-score-breakdown">
                    <div class="c-score-row">
                        <div>
                            <div class="c-score-row-label">Vocabulary Used</div>
                            <div class="c-score-row-detail">${vocabUsed} of ${vocabTotal} lesson words${vocabMatches.length > 0 ? ' (' + vocabMatches.slice(0, 5).join(', ') + (vocabMatches.length > 5 ? '...' : '') + ')' : ''}</div>
                            <div class="c-score-bar"><div class="c-score-bar-fill" style="width:${Math.round(vocabScore/40*100)}%;background:var(--c-primary)"></div></div>
                        </div>
                        <div class="c-score-row-pts">${vocabScore}/40</div>
                    </div>
                    <div class="c-score-row">
                        <div>
                            <div class="c-score-row-label">Composition Length</div>
                            <div class="c-score-row-detail">${charCount} characters</div>
                            <div class="c-score-bar"><div class="c-score-bar-fill" style="width:${Math.round(lengthScore/30*100)}%;background:var(--c-success)"></div></div>
                        </div>
                        <div class="c-score-row-pts">${lengthScore}/30</div>
                    </div>
                    <div class="c-score-row">
                        <div>
                            <div class="c-score-row-label">Tense Consistency</div>
                            <div class="c-score-row-detail">${tenseLabel}</div>
                            <div class="c-score-bar"><div class="c-score-bar-fill" style="width:${Math.round(tenseScore/30*100)}%;background:var(--c-gold)"></div></div>
                        </div>
                        <div class="c-score-row-pts">${tenseScore}/30</div>
                    </div>
                </div>
                <button class="c-btn" onclick="this.closest('.c-score-overlay').remove()" style="margin-top:8px;">Close</button>
            </div>
        `;
        document.getElementById('compose-app-root').appendChild(overlay);
    };

    // --- INIT & DATA FETCH ---
    (async function() {
        try {
            await new Promise(r => setTimeout(r, 50));
            const cacheBust = '?t=' + Date.now();

            // Load manifest to discover file paths
            const manifest = await window.getManifest(REPO_CONFIG);
            const n4 = manifest.data.N4;

            const glossaryUrl = window.getAssetUrl(REPO_CONFIG, n4.glossary);
            const composeUrl = window.getAssetUrl(REPO_CONFIG, n4.compose);
            const helperUrl = window.getAssetUrl(REPO_CONFIG, manifest.shared.helperVocab);
            const particleUrl = window.getAssetUrl(REPO_CONFIG, manifest.shared.particles);
            console.log('[Compose] Glossary URL:', glossaryUrl);
            console.log('[Compose] Compose data URL:', composeUrl);
            console.log('[Compose] Helper vocab URL:', helperUrl);
            console.log('[Compose] Particles URL:', particleUrl);

            // Fetch glossary, compose prompts, helper vocab, and particles in parallel
            const [glossary, composeData, helperData, particleData] = await Promise.all([
                fetch(glossaryUrl + cacheBust).then(r => r.json()),
                fetch(composeUrl + cacheBust).then(r => r.json()),
                fetch(helperUrl + cacheBust).then(r => r.json()),
                fetch(particleUrl + cacheBust).then(r => r.json())
            ]);

            PROMPTS = composeData.prompts;
            HELPER_VOCAB = helperData;
            PARTICLES = particleData;

            allVocab = glossary.filter(i => i.type === 'vocab');
            lessonVocab = allVocab.filter(v => {
                const lessons = (v.lesson_ids || v.lesson || '').split(',').map(s => s.trim());
                return lessons.some(l => Object.keys(LESSON_META).includes(l));
            });

            const loader = document.getElementById('c-loader');
            if (loader) loader.classList.add('c-hidden');

            ComposeApp.showMenu();
        } catch(e) {
            console.error(e);
            const errBox = document.getElementById('c-error-box');
            if (errBox) {
                errBox.innerText = 'Error: ' + (e.message || 'Unknown error');
                errBox.classList.remove('c-hidden');
            }
        }
    })();
  }
};
