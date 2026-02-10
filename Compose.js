window.ComposeModule = {
  start: function(container, sharedConfig, exitCallback) {

    // --- NAMESPACE ---
    window.ComposeApp = {};

    // TTS Helper
    ComposeApp.speak = function(text) {
        if (!window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            setTimeout(() => {
                const u = new SpeechSynthesisUtterance(text);
                u.lang = 'ja-JP'; u.rate = 0.85; u.volume = 1.0;
                u.onerror = (e) => {
                    if ((e.error === 'not-allowed' || e.error === 'interrupted') && !u._retried) {
                        u._retried = true;
                        setTimeout(() => { window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); }, 100);
                    }
                };
                const tid = setTimeout(() => window.speechSynthesis.cancel(), 10000);
                u.onend = () => clearTimeout(tid);
                window.speechSynthesis.speak(u);
            }, 50);
        } catch(err) { console.error('TTS Error:', err); }
    };

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
    const MASTER_URL = `https://raw.githubusercontent.com/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/${REPO_CONFIG.branch}/glossary.master.json`;

    const LESSON_META = {
        'N4.28': { title: 'Places & Parts', kanji: '池 林 門 村', focus: 'Ponds, groves, gates, and villages' },
        'N4.29': { title: 'Measurement & Knowledge', kanji: '台 知 計 以', focus: 'Measuring, knowing, and amounts' },
        'N4.30': { title: 'Thoughts & Answers', kanji: '思 特 集 答', focus: 'Thinking, special occasions, gathering' },
        'N4.31': { title: 'Times & Openings', kanji: '代 森 堂 開', focus: 'Eras, forests, halls, and opening things' }
    };

    const PROMPTS = [
        {
            id: 'village-gate', title: 'The Village Gate', titleJp: '村の門', emoji: '🏘️',
            lessons: ['N4.28'],
            scenario: 'Describe arriving at a small village. You walk through a gate and discover a beautiful pond near a grove of trees.',
            hint: '小さい村に来ました。大きい門が...',
            targets: [
                { surface: '村', reading: 'むら', meaning: 'village', count: 1, matches: ['村', 'むら'] },
                { surface: '門', reading: 'もん', meaning: 'gate', count: 1, matches: ['門', 'もん'] },
                { surface: '池', reading: 'いけ', meaning: 'pond', count: 1, matches: ['池', 'いけ'] },
                { surface: '林', reading: 'はやし', meaning: 'grove', count: 1, matches: ['林', 'はやし'] }
            ]
        },
        {
            id: 'battery-hunt', title: 'Buying Batteries', titleJp: '電池を買う', emoji: '🔋',
            lessons: ['N4.28'],
            scenario: 'You need batteries for your flashlight. Ask a villager near the school gate where you can buy them.',
            hint: '電池がほしいです。校門の近くで...',
            targets: [
                { surface: '電池', reading: 'でんち', meaning: 'battery', count: 1, matches: ['電池', 'でんち'] },
                { surface: '校門', reading: 'こうもん', meaning: 'school gate', count: 1, matches: ['校門', 'こうもん'] },
                { surface: '村人', reading: 'むらびと', meaning: 'villager', count: 1, matches: ['村人', 'むらびと'] }
            ]
        },
        {
            id: 'typhoon-plan', title: 'Typhoon Preparation', titleJp: '台風の計画', emoji: '🌀',
            lessons: ['N4.29'],
            scenario: 'A typhoon is approaching! Write about your preparation plan. Check the time and make sure the kitchen is ready.',
            hint: '台風が来ます。計画を...',
            targets: [
                { surface: '台風', reading: 'たいふう', meaning: 'typhoon', count: 1, matches: ['台風', 'たいふう'] },
                { surface: '計画', reading: 'けいかく', meaning: 'plan', count: 1, matches: ['計画', 'けいかく'] },
                { surface: '時計', reading: 'とけい', meaning: 'clock', count: 1, matches: ['時計', 'とけい'] },
                { surface: '台所', reading: 'だいどころ', meaning: 'kitchen', count: 1, matches: ['台所', 'だいどころ'] }
            ]
        },
        {
            id: 'did-you-know', title: 'What Do You Know?', titleJp: '知っていますか', emoji: '🤔',
            lessons: ['N4.29'],
            scenario: 'Tell a friend about something interesting you recently learned. Was it more or less surprising than you expected?',
            hint: '知っていますか。...',
            targets: [
                { surface: '知る', reading: 'しる', meaning: 'to know', count: 1, matches: ['知', 'しって', 'しり', 'しる'] },
                { surface: '以上', reading: 'いじょう', meaning: 'more than', count: 1, matches: ['以上', 'いじょう'] },
                { surface: '以下', reading: 'いか', meaning: 'less than', count: 1, matches: ['以下', 'いか'] }
            ]
        },
        {
            id: 'special-gathering', title: 'A Special Gathering', titleJp: '特別な集まり', emoji: '🎉',
            lessons: ['N4.30'],
            scenario: 'Write about a special day when friends gathered together. Someone asked a difficult question. What do you think the answer was?',
            hint: '特別な日でした。友だちが集まりました...',
            targets: [
                { surface: '特別', reading: 'とくべつ', meaning: 'special', count: 1, matches: ['特別', 'とくべつ'] },
                { surface: '集まる', reading: 'あつまる', meaning: 'to gather', count: 1, matches: ['集ま', 'あつま'] },
                { surface: '答え', reading: 'こたえ', meaning: 'answer', count: 1, matches: ['答', 'こたえ'] },
                { surface: '思う', reading: 'おもう', meaning: 'to think', count: 1, matches: ['思', 'おもう', 'おもい', 'おもって'] }
            ]
        },
        {
            id: 'my-collection', title: 'My Collection', titleJp: 'わたしの集め物', emoji: '📦',
            lessons: ['N4.30'],
            scenario: 'Write about something you like to collect. What do you especially treasure? What memories come to mind when you look at your collection?',
            hint: 'わたしのしゅみは集めることです...',
            targets: [
                { surface: '集める', reading: 'あつめる', meaning: 'to collect', count: 1, matches: ['集め', 'あつめ'] },
                { surface: '特に', reading: 'とくに', meaning: 'especially', count: 1, matches: ['特に', 'とくに'] },
                { surface: '思い出す', reading: 'おもいだす', meaning: 'to recall', count: 1, matches: ['思い出', 'おもいだ'] }
            ]
        },
        {
            id: 'forest-cafeteria', title: 'Forest Cafeteria', titleJp: '森の食堂', emoji: '🌲',
            lessons: ['N4.31'],
            scenario: 'A new cafeteria opened near the forest! Describe visiting it for the first time. Does it feel like stepping into a different era?',
            hint: '森の近くに新しい食堂が...',
            targets: [
                { surface: '森', reading: 'もり', meaning: 'forest', count: 1, matches: ['森', 'もり'] },
                { surface: '食堂', reading: 'しょくどう', meaning: 'cafeteria', count: 1, matches: ['食堂', 'しょくどう'] },
                { surface: '開店', reading: 'かいてん', meaning: 'shop opening', count: 1, matches: ['開店', 'かいてん'] },
                { surface: '時代', reading: 'じだい', meaning: 'era', count: 1, matches: ['時代', 'じだい'] }
            ]
        },
        {
            id: 'grand-hall', title: 'The Grand Hall', titleJp: '堂々とした会堂', emoji: '🏛️',
            lessons: ['N4.31'],
            scenario: 'Describe visiting a grand assembly hall in the forest. An important event is about to start. Write about what you see and feel.',
            hint: '森の中に堂々とした会堂が...',
            targets: [
                { surface: '堂々', reading: 'どうどう', meaning: 'magnificent', count: 1, matches: ['堂々', 'どうどう'] },
                { surface: '会堂', reading: 'かいどう', meaning: 'assembly hall', count: 1, matches: ['会堂', 'かいどう'] },
                { surface: '開始', reading: 'かいし', meaning: 'start', count: 1, matches: ['開始', 'かいし'] },
                { surface: '森', reading: 'もり', meaning: 'forest', count: 1, matches: ['森', 'もり'] }
            ]
        },
        {
            id: 'village-festival', title: 'Village Festival', titleJp: '村のお祭り', emoji: '🎊',
            lessons: ['N4.28', 'N4.30'],
            scenario: 'A special festival is held in the village! People gather at the gate. Write about the celebration and what you think about it.',
            hint: '村で特別なお祭りがありました...',
            targets: [
                { surface: '村', reading: 'むら', meaning: 'village', count: 1, matches: ['村', 'むら'] },
                { surface: '門', reading: 'もん', meaning: 'gate', count: 1, matches: ['門', 'もん'] },
                { surface: '特別', reading: 'とくべつ', meaning: 'special', count: 1, matches: ['特別', 'とくべつ'] },
                { surface: '集まる', reading: 'あつまる', meaning: 'to gather', count: 1, matches: ['集ま', 'あつま'] },
                { surface: '思う', reading: 'おもう', meaning: 'to think', count: 1, matches: ['思', 'おもう', 'おもい'] }
            ]
        },
        {
            id: 'forest-adventure', title: 'Forest Adventure', titleJp: '森の冒険', emoji: '🗺️',
            lessons: ['N4.28', 'N4.31'],
            scenario: 'Walk through a grove into a deep forest. You find a pond and then discover a hidden cafeteria. Open the door and describe what is inside.',
            hint: '林を通って森に入りました...',
            targets: [
                { surface: '林', reading: 'はやし', meaning: 'grove', count: 1, matches: ['林', 'はやし'] },
                { surface: '森', reading: 'もり', meaning: 'forest', count: 1, matches: ['森', 'もり'] },
                { surface: '池', reading: 'いけ', meaning: 'pond', count: 1, matches: ['池', 'いけ'] },
                { surface: '食堂', reading: 'しょくどう', meaning: 'cafeteria', count: 1, matches: ['食堂', 'しょくどう'] },
                { surface: '開ける', reading: 'あける', meaning: 'to open', count: 1, matches: ['開け', 'あけ'] }
            ]
        },
        {
            id: 'the-big-day', title: 'The Big Day', titleJp: 'すごい一日', emoji: '🌟',
            lessons: ['N4.28', 'N4.29', 'N4.30', 'N4.31'],
            scenario: 'After a typhoon, villagers gather at the cafeteria for a special meeting. Write about what happened, what you think about these changing times, and what you learned.',
            hint: '台風のあとで、村人が食堂に集まりました...',
            targets: [
                { surface: '村', reading: 'むら', meaning: 'village', count: 1, matches: ['村', 'むら'] },
                { surface: '台風', reading: 'たいふう', meaning: 'typhoon', count: 1, matches: ['台風', 'たいふう'] },
                { surface: '特別', reading: 'とくべつ', meaning: 'special', count: 1, matches: ['特別', 'とくべつ'] },
                { surface: '集まる', reading: 'あつまる', meaning: 'to gather', count: 1, matches: ['集ま', 'あつま'] },
                { surface: '食堂', reading: 'しょくどう', meaning: 'cafeteria', count: 1, matches: ['食堂', 'しょくどう'] },
                { surface: '思う', reading: 'おもう', meaning: 'to think', count: 1, matches: ['思', 'おもう', 'おもい'] },
                { surface: '時代', reading: 'じだい', meaning: 'era', count: 1, matches: ['時代', 'じだい'] },
                { surface: '知る', reading: 'しる', meaning: 'to know', count: 1, matches: ['知', 'しって', 'しり'] }
            ]
        }
    ];

    const HELPER_VOCAB = [
        { cat: 'People', words: [
            { surface: 'わたし', meaning: 'I/me' },
            { surface: '友だち', meaning: 'friend' },
            { surface: '先生', meaning: 'teacher' },
            { surface: '人', meaning: 'person' },
        ]},
        { cat: 'Actions', words: [
            { surface: 'します', meaning: 'do' },
            { surface: '行きます', meaning: 'go' },
            { surface: '来ます', meaning: 'come' },
            { surface: '見ます', meaning: 'see' },
            { surface: '食べます', meaning: 'eat' },
            { surface: '買います', meaning: 'buy' },
            { surface: '読みます', meaning: 'read' },
            { surface: '書きます', meaning: 'write' },
            { surface: 'あります', meaning: 'exist (things)' },
            { surface: 'います', meaning: 'exist (people)' },
        ]},
        { cat: 'Describe', words: [
            { surface: '大きい', meaning: 'big' },
            { surface: '小さい', meaning: 'small' },
            { surface: 'きれいな', meaning: 'pretty' },
            { surface: '好きな', meaning: 'liked' },
            { surface: 'いい', meaning: 'good' },
            { surface: '新しい', meaning: 'new' },
            { surface: '古い', meaning: 'old' },
            { surface: 'たくさん', meaning: 'many/much' },
            { surface: 'とても', meaning: 'very' },
        ]},
        { cat: 'Connect', words: [
            { surface: 'そして', meaning: 'and then' },
            { surface: 'でも', meaning: 'but' },
            { surface: 'それから', meaning: 'after that' },
            { surface: 'だから', meaning: 'therefore' },
            { surface: 'まだ', meaning: 'still/not yet' },
        ]},
        { cat: 'Other', words: [
            { surface: 'です', meaning: 'is/am' },
            { surface: 'でした', meaning: 'was' },
            { surface: 'ました', meaning: 'did (polite past)' },
            { surface: '今日', meaning: 'today' },
            { surface: '明日', meaning: 'tomorrow' },
            { surface: '昨日', meaning: 'yesterday' },
            { surface: 'ここ', meaning: 'here' },
            { surface: 'そこ', meaning: 'there' },
        ]},
    ];

    // --- STATE ---
    const selectedLessons = new Set(['N4.28', 'N4.29', 'N4.30', 'N4.31']);
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
                const saved = localStorage.getItem('compose-draft-' + p.id);
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
            const saved = localStorage.getItem('compose-draft-' + p.id);
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
        const particles = ['は (topic)', 'が (subject)', 'を (object)', 'に (to/at)', 'で (at/by)', 'の (of)', 'も (also)', 'と (and/with)', 'から (from)', 'まで (until)', 'へ (toward)', 'か (question)', 'よ (emphasis)', 'ね (right?)'];
        const particleHtml = particles.map(p => `<span>${escHtml(p)}</span>`).join(' ');

        // Load draft if exists
        const draft = localStorage.getItem('compose-draft-' + prompt.id) || '';

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
                localStorage.setItem('compose-draft-' + currentPrompt.id, input.value);
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
        ComposeApp.speak(input.value.trim());
    };

    ComposeApp.clearDraft = function() {
        if (!currentPrompt) return;
        const input = document.getElementById('c-compose-input');
        if (!input) return;
        if (!confirm('Clear your composition? This cannot be undone.')) return;
        input.value = '';
        localStorage.removeItem('compose-draft-' + currentPrompt.id);
        input.dispatchEvent(new Event('input'));
    };

    // --- INIT & DATA FETCH ---
    (async function() {
        try {
            await new Promise(r => setTimeout(r, 50));
            const raw = await fetch(MASTER_URL + '?t=' + Date.now()).then(r => r.json());

            allVocab = raw.filter(i => i.type === 'vocab');
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
