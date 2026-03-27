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
                --primary: #5C3A21; --primary-dark: #3E2515;
                --bg-grad: linear-gradient(135deg, #FAF6F0 0%, #EDE4D8 100%);
                --text-main: #2f3542; --text-sub: #747d8c;
                --success: #2ed573; --error: #ff4757;

                font-family: 'Poppins', 'Noto Sans JP', sans-serif;
                background:
                  var(--bg-grad),
                  repeating-linear-gradient(
                    0deg,
                    rgba(92,58,33,0.03) 0px,
                    rgba(92,58,33,0.03) 1px,
                    transparent 1px,
                    transparent 12px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    rgba(92,58,33,0.02) 0px,
                    rgba(92,58,33,0.02) 1px,
                    transparent 1px,
                    transparent 60px
                  ),
                  linear-gradient(180deg, #EDE4D8 0%, #E5D9C9 100%);
                color: var(--text-main);
                display: flex; flex-direction: column;
                width: 100%; max-width: 600px; margin: 0 auto;
                height: 800px; border-radius: 20px;
                border: 1px solid rgba(0,0,0,0.05); overflow: hidden; position: relative;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            #kanji-app-root * { box-sizing: border-box; }

            #kanji-app-root header {
                background: rgba(92, 58, 33, 0.95); color: white; padding: 1.2rem;
                text-align: center; font-weight: 900; letter-spacing: 0.05em; font-size: 1.2rem;
                cursor: pointer; user-select: none; z-index: 10;
                box-shadow: 0 4px 15px rgba(62, 37, 21, 0.3); backdrop-filter: blur(5px);
                display: flex; justify-content: space-between; align-items: center;
            }
            .k-exit-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.8rem; }

            #k-app-container { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; width: 100%; position: relative; z-index: 1; }
            .k-card { background: #FFFCF8; border-radius: 16px; box-shadow: 0 10px 25px rgba(62,37,21,0.08); padding: 2rem; width: 100%; text-align: center; margin-bottom: 1.5rem; border: 1px solid rgba(92,58,33,0.06); }
            .k-btn { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; border: none; padding: 16px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; margin: 8px 0; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(62, 37, 21, 0.2); }
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
            .k-face-back { transform: rotateY(180deg); background: #FFFCF8; border: 4px solid var(--primary); justify-content: flex-start; padding-top: 3rem; }
            .k-tap-hint { position: absolute; bottom: 15px; width: 100%; text-align: center; font-size: 0.75rem; color: #b2bec3; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; pointer-events: none; }

            .k-tbl { width: 100%; text-align: left; font-size: 0.95rem; margin-top: 1rem; border-collapse: collapse; }
            .k-tbl td { padding: 8px; border-bottom: 1px solid #f1f2f6; vertical-align: top; }
            .k-tbl th { padding: 8px; color: #a4b0be; font-weight: 600; font-size: 0.75rem; width: 30%; border-bottom: 1px solid #f1f2f6; text-transform: uppercase; }

            .k-opt { background: white; border: 2px solid #dfe4ea; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 10px; cursor: pointer; font-weight: 600; font-size: 1.1rem; transition: 0.15s; }
            @media (hover: hover) { .k-opt:hover { border-color: var(--primary); color: var(--primary); background: #FFF8F0; } }
            .k-opt.correct { background: var(--success); border-color: var(--success); color: white; }
            .k-opt.wrong { background: var(--error); border-color: var(--error); color: white; }

            /* LESSON SELECTOR STYLES */
            .k-lvl-group { margin-bottom: 10px; background: white; border-radius: 12px; border: 1px solid #dfe4ea; overflow: hidden; }
            .k-lvl-header { padding: 12px 15px; background: #f8f9fa; display: flex; align-items: center; cursor: pointer; }
            @media (hover: hover) { .k-lvl-header:hover { background: #f1f2f6; } }
            .k-lvl-title { flex: 1; font-weight: 700; color: var(--text-main); font-size: 1.1rem; margin-left: 10px; }
            .k-lvl-arrow { transition: transform 0.3s; color: #a4b0be; font-size: 0.8rem; }
            .k-lvl-header.open .k-lvl-arrow { transform: rotate(180deg); }
            .k-lvl-list { display: none; padding: 5px 0; max-height: 250px; overflow-y: auto; }
            .k-lvl-list.open { display: block; }
            .k-chk { width: 18px; height: 18px; margin-right: 12px; accent-color: var(--primary); }
            .k-lesson-row { display: flex; padding: 10px 15px; border-bottom: 1px solid #f1f2f6; font-size: 0.9rem; }

            /* STREAK CELEBRATION - HANABI */
            .k-hanabi-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100; overflow: hidden; }
            .k-hanabi-particle { position: absolute; border-radius: 50%; }
            .k-hanabi-msg { position: absolute; top: 35%; left: 50%; transform: translate(-50%, -50%) scale(0); text-align: center; font-family: 'Noto Sans JP', sans-serif; animation: k-hanabi-pop 1.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; white-space: nowrap; }
            .k-hanabi-jp { font-size: 3rem; font-weight: 900; text-shadow: 0 2px 10px rgba(0,0,0,0.15); }
            .k-hanabi-en { font-size: 1rem; color: #747d8c; font-weight: 600; margin-top: 5px; }
            @keyframes k-hanabi-pop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                20% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
                40% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0; }
            }
            #k-view-quiz .k-card { transition: box-shadow 0.5s ease, border-color 0.5s ease; }
            #k-fc-card-obj { transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1), box-shadow 0.5s ease; }

            .k-flag-stamp { position: absolute; top: 15px; right: 15px; color: #ff4757; border: 3px solid #ff4757; padding: 5px 12px; border-radius: 8px; font-weight: 900; text-transform: uppercase; transform: rotate(15deg); font-size: 1rem; letter-spacing: 0.1em; opacity: 0.8; z-index: 5; }

            /* Under Construction Sticker */
            .k-construction-wrap { position: relative; width: 100%; }
            .k-construction-wrap .k-btn { pointer-events: none; opacity: 0.45; filter: grayscale(0.3); }
            .k-construction-sticker {
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-8deg);
                background: repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #1a1a1a 10px, #1a1a1a 20px);
                color: white; font-weight: 900; font-size: 0.7rem; letter-spacing: 0.15em;
                text-transform: uppercase; padding: 6px 18px; border-radius: 6px; z-index: 10;
                white-space: nowrap; pointer-events: none;
                text-shadow: 0 1px 2px rgba(0,0,0,0.6);
                box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            }
            .k-construction-sticker span {
                background: #1a1a1a; padding: 3px 10px; border-radius: 4px; display: inline-block;
            }

            /* CONNECTIONS (Link Up) */
            .k-conn-bank { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 20px; }
            .k-conn-word {
                padding: 10px 18px; border-radius: 12px; border: 2px solid #dfe4ea;
                background: white; cursor: pointer; font-size: 1.15rem; font-weight: 700;
                font-family: 'Noto Sans JP', sans-serif; transition: all 0.15s; user-select: none;
            }
            @media (hover: hover) { .k-conn-word:hover { border-color: var(--primary); } }
            .k-conn-word.selected { border-color: var(--primary); background: #FFF8F0; box-shadow: 0 0 8px rgba(92,58,33,0.15); }
            .k-conn-word.placed { opacity: 0.3; pointer-events: none; }
            .k-conn-slots { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
            .k-conn-group {
                background: white; border-radius: 12px; border: 2px solid #dfe4ea;
                padding: 10px; text-align: center; min-height: 120px; cursor: pointer; transition: all 0.2s;
            }
            @media (hover: hover) { .k-conn-group:hover { border-color: #b2bec3; } }
            .k-conn-group-title { font-weight: 800; font-size: 0.9rem; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #eee; }
            .k-conn-group.correct { border-color: var(--success); background: #f0fff4; }
            .k-conn-group.wrong { border-color: var(--error); background: #fff5f5; }
            .k-conn-placed-word {
                display: inline-block; padding: 4px 10px; border-radius: 8px; background: #f8f9fa;
                margin: 3px; font-size: 0.95rem; font-weight: 600; cursor: pointer;
                font-family: 'Noto Sans JP', sans-serif; border: 1px solid #eee; transition: all 0.15s;
            }
            @media (hover: hover) { .k-conn-placed-word:hover { background: #ffe0e0; border-color: var(--error); } }
            .k-conn-info { text-align: center; font-weight: 700; color: var(--text-sub); margin-bottom: 12px; }
            @media (max-width: 500px) { .k-conn-slots { grid-template-columns: 1fr; } }

            /* CONNECTIONS N4 (Link Up: Hidden) — NYT-style */
            .k-conn4-grid {
                display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
                margin-bottom: 16px; max-width: 480px; margin-left: auto; margin-right: auto;
            }
            .k-conn4-tile {
                aspect-ratio: 1; border-radius: 12px; border: 2px solid #dfe4ea;
                background: white; cursor: pointer; font-size: 1.2rem; font-weight: 800;
                font-family: 'Noto Sans JP', sans-serif; transition: all 0.18s; user-select: none;
                display: flex; align-items: center; justify-content: center; text-align: center;
                padding: 6px;
            }
            @media (hover: hover) { .k-conn4-tile:hover:not(.solved) { border-color: var(--primary); transform: scale(1.04); } }
            .k-conn4-tile.selected { border-color: var(--primary); background: #FFF8F0; box-shadow: 0 0 10px rgba(92,58,33,0.18); }
            .k-conn4-tile.solved { pointer-events: none; border-color: transparent; color: white; font-size: 1rem; }
            .k-conn4-tile.shake { animation: conn4shake 0.4s ease; }
            @keyframes conn4shake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-6px); }
                40% { transform: translateX(6px); }
                60% { transform: translateX(-4px); }
                80% { transform: translateX(4px); }
            }
            .k-conn4-solved-row {
                border-radius: 12px; padding: 12px; margin-bottom: 8px; text-align: center;
                color: white; font-weight: 800; max-width: 480px; margin-left: auto; margin-right: auto;
            }
            .k-conn4-solved-row .label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
            .k-conn4-solved-row .words { font-size: 1.1rem; font-family: 'Noto Sans JP', sans-serif; }
            .k-conn4-lives { display: flex; gap: 6px; justify-content: center; margin-bottom: 12px; }
            .k-conn4-life { width: 14px; height: 14px; border-radius: 50%; background: var(--primary); transition: all 0.3s; }
            .k-conn4-life.lost { background: #dfe4ea; transform: scale(0.7); }
            .k-conn4-actions { display: flex; gap: 8px; justify-content: center; margin-top: 12px; }
            .k-conn4-actions .k-btn { max-width: 160px; }
            @media (max-width: 400px) {
                .k-conn4-grid { gap: 6px; }
                .k-conn4-tile { font-size: 1rem; }
            }

            /* Link Up sub-menu */
            .k-linkup-menu { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
            .k-linkup-btn {
                padding: 12px 16px; border-radius: 12px; border: 2px solid #dfe4ea;
                background: white; cursor: pointer; font-weight: 700; font-size: 0.95rem;
                text-align: left; transition: all 0.15s; display: flex; align-items: center; gap: 10px;
            }
            @media (hover: hover) { .k-linkup-btn:hover { border-color: var(--primary); background: #FFF8F0; } }
            .k-linkup-btn .icon { font-size: 1.3rem; }
            .k-linkup-btn .info { color: var(--text-sub); font-size: 0.8rem; font-weight: 600; }

            /* Scramble */
            .k-scr-prompt { font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 16px; text-align: center; line-height: 1.4; }
            .k-scr-answer { min-height: 56px; border: 2px dashed #dfe4ea; border-radius: 14px; padding: 10px; display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; align-items: center; justify-content: center; transition: border-color 0.2s; }
            .k-scr-answer.has-chips { border-color: var(--primary); border-style: solid; }
            .k-scr-answer.correct { border-color: var(--success); background: rgba(46,213,115,0.06); }
            .k-scr-answer.wrong { border-color: var(--error); background: rgba(255,71,87,0.06); }
            .k-scr-pool { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 16px; }
            .k-scr-chip { font-family: 'Noto Sans JP', sans-serif; font-size: 1.15rem; font-weight: 700; padding: 10px 16px; border-radius: 10px; border: 2px solid #dfe4ea; background: white; cursor: pointer; transition: all 0.15s; user-select: none; }
            @media (hover: hover) { .k-scr-chip:hover { border-color: var(--primary); background: #FFF8F0; } }
            .k-scr-chip.placed { opacity: 0.25; pointer-events: none; }
            .k-scr-chip.in-answer { border-color: var(--primary); background: #FFF8F0; }
            .k-scr-chip.correct-chip { border-color: var(--success); background: rgba(46,213,115,0.15); }
            .k-scr-chip.wrong-chip { border-color: var(--error); background: rgba(255,71,87,0.15); }
            .k-scr-explain { margin-top: 12px; padding: 12px; border-radius: 10px; background: #f8f9fa; font-size: 0.9rem; color: var(--text-sub); line-height: 1.5; display: none; }
            .k-scr-explain.show { display: block; }
            .k-scr-hint { color: #a4b0be; font-size: 0.8rem; text-align: center; margin-bottom: 8px; }
            .k-scr-correct-line { margin-top: 8px; font-family: 'Noto Sans JP', sans-serif; font-size: 1.05rem; font-weight: 700; color: var(--success); text-align: center; }

            /* Result stamps */
            .k-result-stamp { display: flex; align-items: center; justify-content: center; margin-top: 10px; }
            .k-result-stamp img { width: 48px; height: 48px; object-fit: contain; animation: kStampPop 0.35s ease; }
            @keyframes kStampPop { 0% { transform: scale(2.5) rotate(-15deg); opacity: 0; } 50% { transform: scale(0.85) rotate(5deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }

            /* Conn4 puzzle stamp overlay */
            .k-conn4-stamp-overlay { display: flex; align-items: center; justify-content: center; margin-top: 12px; gap: 8px; }
            .k-conn4-stamp-overlay img { width: 56px; height: 56px; object-fit: contain; animation: kStampPop 0.35s ease; }
            .k-conn4-stamp-label { font-weight: 800; font-size: 0.9rem; }

            /* Lesson Picker Overlay */
            .k-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; transition: opacity 0.25s ease; }
            .k-overlay.k-hidden { opacity: 0; pointer-events: none; }
            .k-overlay-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); }
            .k-overlay-panel {
                position: absolute; top: 0; right: 0; width: min(380px, 85vw); height: 100%;
                background: #fff; box-shadow: -4px 0 20px rgba(0,0,0,0.15);
                display: flex; flex-direction: column;
                transform: translateX(0); transition: transform 0.25s ease;
            }
            .k-overlay.k-hidden .k-overlay-panel { transform: translateX(100%); }
            .k-overlay-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 16px 20px; border-bottom: 1px solid #eee; font-weight: 800; font-size: 1.1rem; color: var(--primary);
            }
            .k-overlay-close { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #999; padding: 4px 8px; }
            .k-overlay-close:hover { color: #333; }
            .k-overlay-stats {
                display: flex; justify-content: space-around; padding: 12px 16px;
                border-bottom: 1px solid #eee; text-align: center;
            }
            .k-overlay-stats .k-big { font-size: 1.4rem; font-weight: 800; }
            .k-overlay-stats .k-lbl { font-size: 0.7rem; text-transform: uppercase; color: #999; font-weight: 700; }
            .k-overlay-body { flex: 1; overflow-y: auto; padding: 12px 16px; }
            .k-filter-btn {
                background: none; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px;
                padding: 4px 8px; font-size: 1rem; cursor: pointer; color: #fff; transition: background 0.15s;
            }
            .k-filter-btn:hover { background: rgba(255,255,255,0.15); }
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
            <div style="font-weight:800; color:#5C3A21; font-size:1.2rem">Loading Library...</div>
            <div id="k-error-box" class="k-hidden" style="color:#ff4757; margin-top:10px; padding:10px; max-width:80%; font-size:0.9rem"></div>
        </div>

        <header>
           <span onclick="KanjiApp.showMenu()">Kanji Master 先生</span>
           <div style="display:flex;gap:8px;align-items:center;"><button class="k-filter-btn" onclick="KanjiApp.toggleLessonOverlay()" title="Select Lessons">&#x1F3AF;</button><button class="jp-settings-gear" onclick="window.JPShared.ttsSettings.open()" title="Voice Settings">\u2699</button><button class="k-exit-btn">Exit</button></div>
        </header>

        <div id="k-lesson-overlay" class="k-overlay k-hidden">
            <div class="k-overlay-backdrop" onclick="KanjiApp.toggleLessonOverlay()"></div>
            <div class="k-overlay-panel">
                <div class="k-overlay-header">
                    <span>Select Lessons</span>
                    <button class="k-overlay-close" onclick="KanjiApp.toggleLessonOverlay()">\u2715</button>
                </div>
                <div class="k-overlay-stats">
                    <div><div class="k-big" style="color:var(--primary)" id="k-cnt-k">0</div><div class="k-lbl">Kanji</div></div>
                    <div><div class="k-big" style="color:#16a085" id="k-cnt-vocab">0</div><div class="k-lbl">Vocab</div></div>
                    <div><div class="k-big" style="color:#8e44ad" id="k-cnt-v">0</div><div class="k-lbl">Verbs</div></div>
                    <div><div class="k-big" style="color:#f39c12" id="k-cnt-flags">0</div><div class="k-lbl">Flags</div></div>
                </div>
                <div class="k-overlay-body">
                    <div class="k-filters" id="k-lesson-container"></div>
                </div>
            </div>
        </div>

        <div id="k-app-container">
            <div id="k-view-menu" style="width:100%">

                <div class="k-lbl" style="margin-top:0.5rem">KANJI PRACTICE</div>
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
                <button class="k-btn" style="background: linear-gradient(135deg, #8e44ad 0%, #6c3483 100%);" onclick="KanjiApp.start('dojo','dojo')">⚡ Conjugation Station</button>

                <div class="k-lbl" style="margin-top:2rem; color:#5C3A21;">SENTENCE PRACTICE</div>
                <button class="k-btn" style="background: linear-gradient(135deg, #6B4226 0%, #4A2E18 100%);" onclick="KanjiApp.toggleScrMenu()">🔀 Scramble</button>
                <div id="k-scr-submenu" class="k-linkup-menu k-hidden">
                    <div class="k-linkup-btn" onclick="KanjiApp.start('scramble','scramble')">
                        <span class="icon">🔀</span>
                        <span><div>Practice</div><div class="info">N5 sentences — shuffled order</div></span>
                    </div>
                    <div class="k-linkup-btn" onclick="KanjiApp.start('marathon','marathon')">
                        <span class="icon">🏔️</span>
                        <span><div>Marathon</div><div class="info">N4 progressive — warm-up → challenge</div></span>
                    </div>
                </div>
                <button class="k-btn" style="background: linear-gradient(135deg, #6B4226 0%, #4A2E18 100%);" onclick="KanjiApp.toggleLinkUpMenu()">🔗 Link Up</button>
                <div id="k-linkup-submenu" class="k-linkup-menu k-hidden">
                    <div class="k-linkup-btn" onclick="KanjiApp.start('connections','connections')">
                        <span class="icon">🔗</span>
                        <span><div>Sorted</div><div class="info">Categories shown — sort the words</div></span>
                    </div>
                    <div class="k-linkup-btn" onclick="KanjiApp.start('connections4','connections4')">
                        <span class="icon">🧩</span>
                        <span><div>Hidden</div><div class="info">NYT-style — guess the groups, 4 lives</div></span>
                    </div>
                </div>
            </div>

            <div id="k-view-flash" class="k-hidden" style="width:100%">
                <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px; color:#a4b0be; font-weight:800; font-size:0.9rem;">
                     <span id="k-fc-progress">Card 1 / 100</span>
                     <span>🏆 <span id="k-fc-best">0</span></span>
                     <span style="color:#ffa502">🔥 <span id="k-fc-streak">0</span></span>
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

            <div id="k-view-conn" class="k-hidden" style="width:100%">
                <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px; color:#a4b0be; font-weight:800; font-size:0.9rem;">
                    <span id="k-conn-progress">Puzzle 1 / 1</span>
                    <span>🏆 <span id="k-conn-best">0</span></span>
                    <span style="color:#ffa502">🔥 <span id="k-conn-streak">0</span></span>
                </div>
                <div class="k-card" id="k-conn-stage" style="padding:1.5rem;"></div>
                <div style="display:flex; gap:8px; width:100%; margin-top:10px;">
                    <button class="k-btn k-btn-sec" style="flex:1" onclick="KanjiApp.connSkip()">Skip →</button>
                    <button class="k-btn k-btn-sec" onclick="KanjiApp.showMenu()">Exit</button>
                </div>
            </div>

            <div id="k-view-conn4" class="k-hidden" style="width:100%">
                <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px; color:#a4b0be; font-weight:800; font-size:0.9rem;">
                    <span id="k-conn4-progress">Puzzle 1 / 1</span>
                    <span>🏆 <span id="k-conn4-best">0</span></span>
                    <span style="color:#ffa502">🔥 <span id="k-conn4-streak">0</span></span>
                </div>
                <div class="k-card" id="k-conn4-stage" style="padding:1.5rem;"></div>
                <div style="display:flex; gap:8px; width:100%; margin-top:10px;">
                    <button class="k-btn k-btn-sec" style="flex:1" onclick="KanjiApp.conn4Skip()">Skip →</button>
                    <button class="k-btn k-btn-sec" onclick="KanjiApp.showMenu()">Exit</button>
                </div>
            </div>

            <div id="k-view-scr" class="k-hidden" style="width:100%">
                <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px; color:#a4b0be; font-weight:800; font-size:0.9rem;">
                    <span id="k-scr-progress">1 / 5</span>
                    <span>🏆 <span id="k-scr-best">0</span></span>
                    <span style="color:#ffa502">🔥 <span id="k-scr-streak">0</span></span>
                </div>
                <div class="k-card" id="k-scr-stage" style="padding:1.5rem;"></div>
                <div style="display:flex; gap:8px; width:100%; margin-top:10px;">
                    <button class="k-btn k-btn-sec" style="flex:1" onclick="KanjiApp.scrSkip()">Skip →</button>
                    <button class="k-btn k-btn-sec" onclick="KanjiApp.showMenu()">Exit</button>
                </div>
            </div>

            <div id="k-view-dojo" class="k-hidden" style="width:100%">
                <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px; color:#a4b0be; font-weight:800; font-size:0.9rem;">
                    <span id="k-dojo-progress">0 / 0</span>
                    <span>🏆 <span id="k-dojo-best">0</span></span>
                    <span style="color:#ffa502">🔥 <span id="k-dojo-streak">0</span></span>
                </div>
                <div id="k-dojo-stage"></div>
                <button class="k-btn k-btn-sec" onclick="KanjiApp.showMenu()" style="margin-top:10px">Exit Station</button>
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

    // Set repo config for stamp settings
    if (window.JPShared.stampSettings) {
      window.JPShared.stampSettings.setConfig(REPO_CONFIG);
    }

    const ALL_VIEWS = ['k-view-menu','k-view-flash','k-view-quiz','k-view-conn','k-view-conn4','k-view-scr','k-view-dojo'];
    const DB = { kanji: [], verb: [], lessons: [], vocabMap: new Map() };
    const activeLessons = new Set();
    let curSet=[], curIdx=0, curStreak=0, curBest=0, curMode='', curAns='', curType='', curSubMode='normal', curQItem=null, curCategory='';
    let quizPhase = 1;
    let skipNextStreak = false;

    let flagCounts = window.JPShared.progress.getAllFlags();
    let activeFlags = window.JPShared.progress.getAllActiveFlags();

    const bestScores = {
        meaning: window.JPShared.progress.getBestScore('meaning'),
        reading: window.JPShared.progress.getBestScore('reading'),
        vocab: window.JPShared.progress.getBestScore('vocab'),
        verb: window.JPShared.progress.getBestScore('verb'),
        flash: window.JPShared.progress.getBestScore('flash'),
        connections: window.JPShared.progress.getBestScore('connections'),
        scramble: window.JPShared.progress.getBestScore('scramble'),
        marathon: window.JPShared.progress.getBestScore('marathon'),
        dojo: window.JPShared.progress.getBestScore('dojo')
    };

    // --- 3. HELPER FUNCTIONS ---
    function setTxt(id, txt) {
        const el = document.getElementById(id);
        if(el) el.innerText = txt;
    }

    // --- STREAK CELEBRATION (HANABI) ---
    const STREAK_TIERS = [
        { at: 5,  msg: 'いいね！',     sub: 'Nice!',       colors: ['#FFD700','#FFA500','#FFE066'], particles: 15 },
        { at: 10, msg: 'すごい！',     sub: 'Amazing!',     colors: ['#FF6B35','#FF4500','#FF8C00'], particles: 24 },
        { at: 15, msg: 'さすが！',     sub: 'Impressive!',  colors: ['#FF1493','#FF69B4','#FF85C8'], particles: 35 },
        { at: 20, msg: 'すばらしい！', sub: 'Wonderful!',   colors: ['#00E5FF','#00BCD4','#4DD0E1'], particles: 45 },
        { at: 25, msg: '天才！',       sub: 'Genius!',      colors: ['#8B5CF6','#A78BFA','#7C3AED'], particles: 55 },
        { at: 30, msg: '神！',         sub: 'Godlike!',     colors: ['#FF1493','#FFD700','#00E5FF','#8B5CF6','#2ED573','#FF6B35'], particles: 70 }
    ];

    const STREAK_GLOW = [
        { min: 1,  color: 'rgba(255,215,0,0.15)',  spread: 8 },
        { min: 5,  color: 'rgba(255,215,0,0.3)',   spread: 15 },
        { min: 10, color: 'rgba(255,107,53,0.35)',  spread: 20 },
        { min: 15, color: 'rgba(255,20,147,0.35)',  spread: 25 },
        { min: 20, color: 'rgba(0,229,255,0.4)',    spread: 30 },
        { min: 25, color: 'rgba(139,92,246,0.45)',  spread: 35 },
        { min: 30, color: 'rgba(255,20,147,0.5)',   spread: 40 }
    ];

    function updateStreakVisuals(streak) {
        var isFlash = (curMode === 'flash');
        var card = isFlash ? document.getElementById('k-fc-card-obj') : document.querySelector('#k-view-quiz .k-card');
        if (card) {
            if (streak === 0) {
                card.style.boxShadow = '';
                card.style.borderColor = '';
            } else {
                var glow = STREAK_GLOW[0];
                for (var i = STREAK_GLOW.length - 1; i >= 0; i--) {
                    if (streak >= STREAK_GLOW[i].min) { glow = STREAK_GLOW[i]; break; }
                }
                var baseShadow = isFlash ? '0 15px 35px rgba(0,0,0,0.1)' : '0 10px 25px rgba(0,0,0,0.05)';
                card.style.boxShadow = '0 0 ' + glow.spread + 'px ' + glow.color + ', ' + baseShadow;
                card.style.borderColor = glow.color;
            }
        }
        setTxt('k-fc-streak', streak);
        setTxt('k-fc-best', curBest);
        if (streak >= 5 && streak % 5 === 0) launchHanabi(streak);
    }

    function launchHanabi(streak) {
        var tier = STREAK_TIERS[0];
        for (var i = STREAK_TIERS.length - 1; i >= 0; i--) {
            if (streak >= STREAK_TIERS[i].at) { tier = STREAK_TIERS[i]; break; }
        }

        var targetView = document.getElementById(curMode === 'flash' ? 'k-view-flash' : curMode === 'connections' ? 'k-view-conn' : curMode === 'connections4' ? 'k-view-conn4' : curMode === 'scramble' ? 'k-view-scr' : curMode === 'dojo' ? 'k-view-dojo' : 'k-view-quiz');
        if (!targetView) return;
        targetView.style.position = 'relative';

        var container = document.createElement('div');
        container.className = 'k-hanabi-container';
        targetView.appendChild(container);

        var rect = targetView.getBoundingClientRect();
        var burstPoints = streak >= 25 ? [
            { x: rect.width * 0.3, y: rect.height * 0.25 },
            { x: rect.width * 0.7, y: rect.height * 0.3 },
            { x: rect.width * 0.5, y: rect.height * 0.15 }
        ] : streak >= 15 ? [
            { x: rect.width * 0.35, y: rect.height * 0.25 },
            { x: rect.width * 0.65, y: rect.height * 0.25 }
        ] : [
            { x: rect.width / 2, y: rect.height * 0.25 }
        ];

        let perBurst = Math.ceil(tier.particles / burstPoints.length);
        burstPoints.forEach(function(bp, bIdx) {
            for (let i = 0; i < perBurst; i++) {
                let p = document.createElement('div');
                p.className = 'k-hanabi-particle';
                let angle = (Math.PI * 2 * i / perBurst) + (Math.random() * 0.4 - 0.2);
                let dist = 50 + Math.random() * 100;
                let color = tier.colors[Math.floor(Math.random() * tier.colors.length)];
                let size = 3 + Math.random() * 5;
                let delay = bIdx * 150 + Math.random() * 100;
                let dx = Math.cos(angle) * dist;
                let dy = Math.sin(angle) * dist + 40;

                p.style.cssText = 'left:' + bp.x + 'px;top:' + bp.y + 'px;width:' + size + 'px;height:' + size + 'px;background:' + color + ';box-shadow:0 0 ' + size + 'px ' + color + ';transition:transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94),opacity 0.9s ease-out;transition-delay:' + delay + 'ms;';
                container.appendChild(p);

                requestAnimationFrame(function() { requestAnimationFrame(function() {
                    p.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
                    p.style.opacity = '0';
                }); });
            }
        });

        var msgEl = document.createElement('div');
        msgEl.className = 'k-hanabi-msg';
        msgEl.innerHTML = '<div class="k-hanabi-jp" style="color:' + tier.colors[0] + '">' + tier.msg + '</div><div class="k-hanabi-en">' + tier.sub + '</div>';
        container.appendChild(msgEl);

        setTimeout(function() { container.remove(); }, 2500);
    }

    function resetStreakVisuals() {
        var quizCard = document.querySelector('#k-view-quiz .k-card');
        if (quizCard) { quizCard.style.boxShadow = ''; quizCard.style.borderColor = ''; }
        var flashCard = document.getElementById('k-fc-card-obj');
        if (flashCard) { flashCard.style.boxShadow = ''; flashCard.style.borderColor = ''; }
        document.querySelectorAll('.k-hanabi-container').forEach(function(c) { c.remove(); });
        setTxt('k-fc-streak', 0);
    }

    // --- 4. EXPOSED FUNCTIONS ---
    KanjiApp.toggleLessonOverlay = function() {
        const overlay = document.getElementById('k-lesson-overlay');
        if (overlay) overlay.classList.toggle('k-hidden');
    };

    KanjiApp.showMenu = function() {
        kUpdateStats();
        ALL_VIEWS.forEach(i => {
            const el = document.getElementById(i);
            if(el) el.classList.add('k-hidden');
        });
        const menu = document.getElementById('k-view-menu');
        if(menu) menu.classList.remove('k-hidden');
    };

    KanjiApp.start = function(type, mode, subMode='normal') {
        // Record streak activity on practice session start (flash/quiz have no end screen)
        if (window.JPShared && window.JPShared.streak) window.JPShared.streak.recordActivity();
        curType = type; curMode = mode; curSubMode = subMode; curIdx = 0; curStreak = 0; quizPhase = 1; skipNextStreak = false; resetStreakVisuals();
        setTxt('k-streak', 0); setTxt('k-fc-streak', 0);

        if (mode === 'quiz-meaning') curCategory = 'meaning';
        else if (mode === 'quiz-reading') curCategory = 'reading';
        else if (mode === 'quiz-vocab') curCategory = 'vocab';
        else if (mode === 'quiz-conj') curCategory = 'verb';
        else if (mode === 'flash') curCategory = 'flash';
        else curCategory = '';

        curBest = bestScores[curCategory] || 0;
        setTxt('k-best', curBest);
        setTxt('k-fc-best', curBest);

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
        } else if (type === 'connections') {
            connStart();
            return;
        } else if (type === 'connections4') {
            conn4Start();
            return;
        } else if (type === 'scramble') {
            scrStart();
            return;
        } else if (type === 'marathon') {
            marathonStart();
            return;
        } else if (type === 'dojo') {
            dojoStart();
            return;
        }

        if(curSet.length === 0) return alert(mode === 'flag-review' ? "No active flagged items found!" : "Please select at least one lesson.");
        curSet.sort(() => Math.random() - 0.5);

        ALL_VIEWS.forEach(i => {
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

    // --- CONNECTIONS (LINK UP: SORTED) — plugin module ---
    let connScriptLoaded = false;

    async function connLoadScript() {
        if (connScriptLoaded) return true;
        try {
            const url = window.getAssetUrl(REPO_CONFIG, 'app/games/connections.js') + '?t=' + Date.now();
            const res = await fetch(url);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const code = await res.text();
            const script = document.createElement('script');
            script.textContent = code;
            document.body.appendChild(script);
            connScriptLoaded = true;
            return true;
        } catch(e) {
            console.error('[Practice] Failed to load connections.js:', e);
            alert('Could not load Link Up.');
            return false;
        }
    }

    async function connStart() {
        if (window.JPShared && window.JPShared.streak) window.JPShared.streak.recordActivity();
        if (!await connLoadScript()) return;

        curMode = 'connections'; curCategory = 'connections';

        ALL_VIEWS.forEach(i => {
            const el = document.getElementById(i);
            if(el) el.classList.add('k-hidden');
        });
        const cv = document.getElementById('k-view-conn');
        if(cv) cv.classList.remove('k-hidden');

        let connStreak = 0;
        let connBest = bestScores.connections || 0;
        setTxt('k-conn-best', connBest);
        setTxt('k-conn-streak', 0);
        setTxt('k-conn-progress', 'Loading…');

        window.JPShared.connectionsGame.init(document.getElementById('k-conn-stage'), {
            level: 'N5',
            activeLessons: activeLessons,
            config: REPO_CONFIG,
            onCorrect: function() {
                connStreak++;
                if (connStreak > connBest) {
                    connBest = connStreak;
                    bestScores.connections = connBest;
                    window.JPShared.progress.setBestScore('connections', connBest);
                    setTxt('k-conn-best', connBest);
                }
                setTxt('k-conn-streak', connStreak);
                if (connStreak >= 5 && connStreak % 5 === 0) {
                    const saved = curMode; curMode = 'connections';
                    launchHanabi(connStreak);
                    curMode = saved;
                }
            },
            onWrong: function() {
                connStreak = 0;
                setTxt('k-conn-streak', 0);
            },
            onExit: function() { KanjiApp.showMenu(); },
            onProgress: function(current, total) {
                setTxt('k-conn-progress', current + ' / ' + total);
            },
            getStreakInfo: function() { return { streak: connStreak, best: connBest }; }
        });
    }

    KanjiApp.connSkip = function() {
        if (window.JPShared.connectionsGame) window.JPShared.connectionsGame.skip();
    };

    KanjiApp.toggleLinkUpMenu = function() {
        const sub = document.getElementById('k-linkup-submenu');
        if (sub) sub.classList.toggle('k-hidden');
    };

    // --- CONNECTIONS N4 (LINK UP: HIDDEN) — NYT-style ---
    const CONN4_COLORS = ['#f9df6d','#a0c35a','#b0c4ef','#ba81c5'];
    const CONN4_LABELS = ['yellow','green','blue','purple'];
    let conn4Puzzles = [], conn4Idx = 0, conn4Score = 0, conn4Total = 0, conn4Streak = 0, conn4Best = 0;
    let conn4DataCache = null;

    async function conn4Start() {
        curMode = 'connections4'; curCategory = 'connections4';
        conn4Streak = 0; conn4Score = 0; conn4Total = 0; conn4Idx = 0;
        conn4Best = bestScores.connections4 || 0;

        if (!conn4DataCache) {
            try {
                const url = window.getAssetUrl(REPO_CONFIG, 'data/N4/connections/connections.N4.json') + '?t=' + Date.now();
                const res = await fetch(url);
                conn4DataCache = await res.json();
            } catch(e) {
                alert('Could not load Link Up: Hidden puzzles.');
                return;
            }
        }

        const available = conn4DataCache.puzzles.filter(p =>
            p.requires.every(req => activeLessons.has(req))
        );

        if (available.length === 0) {
            alert('Select more lessons to unlock Link Up: Hidden! These puzzles use N4 vocabulary.');
            return;
        }

        conn4Puzzles = available.sort(() => Math.random() - 0.5);

        ALL_VIEWS.forEach(i => {
            const el = document.getElementById(i);
            if(el) el.classList.add('k-hidden');
        });
        const cv = document.getElementById('k-view-conn4');
        if(cv) cv.classList.remove('k-hidden');

        setTxt('k-conn4-best', conn4Best);
        setTxt('k-conn4-streak', 0);
        conn4RenderPuzzle();
    }

    function conn4RenderPuzzle() {
        if (conn4Idx >= conn4Puzzles.length) {
            conn4ShowSummary();
            return;
        }

        const puzzle = conn4Puzzles[conn4Idx];
        const solved = []; // indices of solved groups
        let lives = 4;
        let selected = new Set();
        const remaining = puzzle.groups.flatMap(g => [...g.words]).sort(() => Math.random() - 0.5);

        conn4Total += 16;
        setTxt('k-conn4-progress', `Puzzle ${conn4Idx + 1} / ${conn4Puzzles.length}`);

        const stage = document.getElementById('k-conn4-stage');

        function render() {
            const solvedHtml = solved.map(si => {
                const g = puzzle.groups[si];
                return `<div class="k-conn4-solved-row" style="background:${CONN4_COLORS[si]}; color:#1a1a1a;">
                    <div class="label">${g.label}</div>
                    <div class="words">${g.words.join('  ·  ')}</div>
                </div>`;
            }).join('');

            const unsolved = remaining.filter(w => !solved.some(si => puzzle.groups[si].words.includes(w)));
            const gridHtml = unsolved.map(w =>
                `<div class="k-conn4-tile${selected.has(w) ? ' selected' : ''}" data-word="${w}">${w}</div>`
            ).join('');

            const livesHtml = Array.from({length: 4}, (_, i) =>
                `<div class="k-conn4-life${i >= lives ? ' lost' : ''}"></div>`
            ).join('');

            stage.innerHTML = `
                <div class="k-conn-info">Find 4 words that belong together!</div>
                ${solvedHtml}
                <div class="k-conn4-grid" id="k-conn4-grid">${gridHtml}</div>
                <div class="k-conn4-lives">${livesHtml}<span style="margin-left:6px; font-weight:700; font-size:0.85rem; color:var(--text-sub);">${lives} remaining</span></div>
                <div class="k-conn4-actions">
                    <button class="k-btn k-btn-sec" id="k-conn4-deselect" style="opacity:0.4" disabled>Deselect All</button>
                    <button class="k-btn" id="k-conn4-submit" style="opacity:0.4; max-width:160px;" disabled>Submit</button>
                </div>
            `;

            // Tile selection
            stage.querySelectorAll('.k-conn4-tile').forEach(tile => {
                tile.onclick = () => {
                    const w = tile.dataset.word;
                    if (selected.has(w)) {
                        selected.delete(w);
                    } else if (selected.size < 4) {
                        selected.add(w);
                    }
                    render();
                };
            });

            // Deselect all
            const deselBtn = document.getElementById('k-conn4-deselect');
            if (deselBtn) {
                deselBtn.disabled = selected.size === 0;
                deselBtn.style.opacity = selected.size === 0 ? '0.4' : '1';
                deselBtn.onclick = () => { selected.clear(); render(); };
            }

            // Submit
            const subBtn = document.getElementById('k-conn4-submit');
            if (subBtn) {
                subBtn.disabled = selected.size !== 4;
                subBtn.style.opacity = selected.size !== 4 ? '0.4' : '1';
                subBtn.onclick = () => trySubmit();
            }
        }

        function trySubmit() {
            const guess = [...selected];

            // Check each group
            for (let gi = 0; gi < puzzle.groups.length; gi++) {
                if (solved.includes(gi)) continue;
                const groupWords = puzzle.groups[gi].words;
                if (guess.length === 4 && guess.every(w => groupWords.includes(w)) && groupWords.every(w => guess.includes(w))) {
                    // Correct!
                    solved.push(gi);
                    conn4Score += 4;
                    selected.clear();

                    if (solved.length === 4) {
                        // Puzzle complete!
                        conn4Streak++;
                        setTxt('k-conn4-streak', conn4Streak);
                        if (conn4Streak > conn4Best) {
                            conn4Best = conn4Streak;
                            bestScores.connections4 = conn4Best;
                            window.JPShared.progress.setBestScore('connections4', conn4Best);
                            setTxt('k-conn4-best', conn4Best);
                        }
                        if (conn4Streak >= 3 && conn4Streak % 3 === 0) {
                            const targetView = document.getElementById('k-view-conn4');
                            if (targetView) {
                                targetView.style.position = 'relative';
                                const savedMode = curMode;
                                curMode = 'connections4';
                                launchHanabi(conn4Streak);
                                curMode = savedMode;
                            }
                        }
                        render();
                        // Show character stamp for completed puzzle
                        const c4StampApi = window.JPShared.stampSettings;
                        const c4StampUrl = c4StampApi ? c4StampApi.getStampUrl() : '';
                        if (c4StampUrl) {
                            const stampOv = document.createElement('div');
                            stampOv.className = 'k-conn4-stamp-overlay';
                            stampOv.innerHTML = '<img src="' + c4StampUrl + '" alt="stamp"><span class="k-conn4-stamp-label" style="color:var(--success)">Complete!</span>';
                            stage.appendChild(stampOv);
                        }
                        conn4Idx++;
                        setTimeout(conn4RenderPuzzle, 2000);
                    } else {
                        render();
                    }
                    return;
                }

                // Check for "one away" (3 of 4 correct)
                const overlap = guess.filter(w => groupWords.includes(w)).length;
                if (overlap === 3) {
                    shakeTiles();
                    lives--;
                    selected.clear();
                    showOneAway();
                    if (lives <= 0) { gameOver(); return; }
                    setTimeout(render, 1200);
                    return;
                }
            }

            // Wrong guess
            shakeTiles();
            lives--;
            selected.clear();
            if (lives <= 0) { gameOver(); return; }
            setTimeout(render, 600);
        }

        function shakeTiles() {
            stage.querySelectorAll('.k-conn4-tile.selected').forEach(t => {
                t.classList.add('shake');
            });
        }

        function showOneAway() {
            const info = stage.querySelector('.k-conn-info');
            if (info) {
                info.textContent = 'One away!';
                info.style.color = '#e67e22';
                setTimeout(() => { info.textContent = 'Find 4 words that belong together!'; info.style.color = ''; }, 1200);
            }
        }

        function gameOver() {
            if (window.JPShared && window.JPShared.streak) window.JPShared.streak.recordActivity();
            // Reveal all remaining groups
            puzzle.groups.forEach((_, gi) => { if (!solved.includes(gi)) solved.push(gi); });
            conn4Streak = 0;
            setTxt('k-conn4-streak', 0);

            const solvedHtml = puzzle.groups.map((g, si) => {
                return `<div class="k-conn4-solved-row" style="background:${CONN4_COLORS[si]}; color:#1a1a1a;">
                    <div class="label">${g.label}</div>
                    <div class="words">${g.words.join('  ·  ')}</div>
                </div>`;
            }).join('');

            const goPooApi = window.JPShared.stampSettings;
            const goPooUrl = goPooApi ? goPooApi.getPooUrl() : '';
            const goPooHtml = goPooUrl ? '<div class="k-conn4-stamp-overlay"><img src="' + goPooUrl + '" alt="poo"><span class="k-conn4-stamp-label" style="color:var(--error)">Try again!</span></div>' : '';

            stage.innerHTML = `
                <div class="k-conn-info" style="color:var(--error);">Game Over — no lives remaining</div>
                ${solvedHtml}
                ${goPooHtml}
                <div class="k-conn4-actions" style="margin-top:16px;">
                    <button class="k-btn k-btn-sec" onclick="KanjiApp.conn4Skip()">Next Puzzle →</button>
                </div>
            `;
        }

        render();
    }

    function conn4ShowSummary() {
        if (window.JPShared && window.JPShared.streak) window.JPShared.streak.recordActivity();
        const stage = document.getElementById('k-conn4-stage');
        const pct = conn4Total > 0 ? Math.round(conn4Score / conn4Total * 100) : 0;
        stage.innerHTML = `
            <div style="text-align:center; padding: 1rem;">
                <div style="font-size:2.5rem; margin-bottom:10px;">🧩</div>
                <div style="font-size:1.4rem; font-weight:900; color:var(--primary); margin-bottom:8px;">Link Up: Hidden Complete!</div>
                <div style="font-size:3rem; font-weight:900; color:var(--text-main); margin-bottom:5px;">${conn4Score} / ${conn4Total}</div>
                <div style="color:var(--text-sub); font-weight:600; margin-bottom:15px;">${pct}% correct</div>
                <div style="display:flex; justify-content:center; gap:20px; margin-bottom:20px;">
                    <div><div style="font-size:1.5rem; font-weight:900; color:#ffa502;">🔥 ${conn4Streak}</div><div class="k-lbl">Final Streak</div></div>
                    <div><div style="font-size:1.5rem; font-weight:900; color:var(--primary);">🏆 ${conn4Best}</div><div class="k-lbl">Best Streak</div></div>
                </div>
                <button class="k-btn" onclick="conn4Start()" style="max-width:250px; margin:5px auto;">Play Again</button>
                <button class="k-btn k-btn-sec" onclick="KanjiApp.showMenu()" style="max-width:250px; margin:5px auto;">Back to Menu</button>
            </div>
        `;
        setTxt('k-conn4-progress', 'Complete!');
    }

    KanjiApp.conn4Skip = function() {
        conn4Idx++;
        conn4Streak = 0;
        setTxt('k-conn4-streak', 0);
        conn4RenderPuzzle();
    };

    // --- SCRAMBLE PRACTICE ---
    let scrSets = [], scrSetIdx = 0, scrItemIdx = 0, scrStreak = 0, scrBest = 0, scrScore = 0, scrTotal = 0;
    let scrDataCache = null;

    async function scrStart() {
        curMode = 'scramble'; curCategory = 'scramble';
        scrStreak = 0; scrScore = 0; scrTotal = 0; scrSetIdx = 0; scrItemIdx = 0;
        scrBest = bestScores.scramble || 0;

        if (!scrDataCache) {
            try {
                const url = window.getAssetUrl(REPO_CONFIG, 'data/N5/scramble/scramble.N5.json') + '?t=' + Date.now();
                const res = await fetch(url);
                scrDataCache = await res.json();
            } catch(e) {
                alert('Could not load Scramble data.');
                return;
            }
        }

        const available = scrDataCache.sets.filter(s =>
            s.requires.every(req => activeLessons.has(req))
        );

        if (available.length === 0) {
            alert('Select more lessons to unlock Scramble sets! The first set unlocks after N5.1 and N5.2.');
            return;
        }

        // Flatten all items from available sets, shuffle
        const allItems = [];
        available.forEach(s => {
            s.items.forEach(item => allItems.push({ ...item, setTitle: s.title }));
        });
        scrSets = allItems.sort(() => Math.random() - 0.5);
        scrTotal = scrSets.length;

        ALL_VIEWS.forEach(i => {
            const el = document.getElementById(i);
            if(el) el.classList.add('k-hidden');
        });
        const sv = document.getElementById('k-view-scr');
        if(sv) sv.classList.remove('k-hidden');

        setTxt('k-scr-best', scrBest);
        setTxt('k-scr-streak', 0);
        scrItemIdx = 0;
        scrRenderItem();
    }

    function scrRenderItem() {
        if (scrItemIdx >= scrSets.length) {
            scrShowSummary();
            return;
        }

        const item = scrSets[scrItemIdx];
        const allChips = item.segments.concat(item.distractors).sort(() => Math.random() - 0.5);
        const answerSlots = [];
        let answered = false;
        let firstAttempt = true;

        setTxt('k-scr-progress', `${scrItemIdx + 1} / ${scrTotal}`);

        const stage = document.getElementById('k-scr-stage');
        stage.innerHTML = `
            <div class="k-scr-prompt">${item.q}</div>
            <div class="k-scr-hint">Tap words to build the sentence</div>
            <div class="k-scr-answer" id="k-scr-answer"></div>
            <div class="k-scr-pool" id="k-scr-pool">
                ${allChips.map((c, i) => `<div class="k-scr-chip" data-idx="${i}" data-text="${c}">${c}</div>`).join('')}
            </div>
            <div style="display:flex; gap:8px; justify-content:center;">
                <button class="k-btn" id="k-scr-check" disabled style="opacity:0.4; max-width:200px;">Check</button>
                <button class="k-btn k-btn-sec" id="k-scr-clear" style="max-width:120px;">Clear</button>
            </div>
            <div class="k-scr-explain" id="k-scr-explain"></div>
        `;

        const pool = document.getElementById('k-scr-pool');
        const answerBox = document.getElementById('k-scr-answer');

        // Tap chip in pool → move to answer
        pool.querySelectorAll('.k-scr-chip').forEach(chip => {
            chip.onclick = () => {
                if (answered || chip.classList.contains('placed')) return;
                chip.classList.add('placed');
                const ansChip = document.createElement('div');
                ansChip.className = 'k-scr-chip in-answer';
                ansChip.textContent = chip.dataset.text;
                ansChip.dataset.poolIdx = chip.dataset.idx;
                ansChip.onclick = () => {
                    if (answered) return;
                    chip.classList.remove('placed');
                    ansChip.remove();
                    answerSlots.splice(answerSlots.indexOf(chip.dataset.text), 1);
                    scrUpdateCheck();
                };
                answerBox.appendChild(ansChip);
                answerSlots.push(chip.dataset.text);
                scrUpdateCheck();
            };
        });

        function scrUpdateCheck() {
            const needed = item.segments.length;
            const btn = document.getElementById('k-scr-check');
            const hasEnough = answerSlots.length === needed;
            if (btn) { btn.disabled = !hasEnough; btn.style.opacity = hasEnough ? '1' : '0.4'; }
            const ab = document.getElementById('k-scr-answer');
            if (ab) ab.classList.toggle('has-chips', answerSlots.length > 0);
        }

        // Clear button
        document.getElementById('k-scr-clear').onclick = () => {
            if (answered) return;
            answerSlots.length = 0;
            answerBox.querySelectorAll('.k-scr-chip').forEach(c => c.remove());
            pool.querySelectorAll('.k-scr-chip').forEach(c => c.classList.remove('placed'));
            scrUpdateCheck();
        };

        // Check button
        document.getElementById('k-scr-check').onclick = () => {
            if (answered) return;

            // Check if answer matches segments or any alt
            const userAnswer = answerSlots.join('');
            const correctAnswer = item.segments.join('');
            const altAnswers = (item.alts || []).map(a => a.join(''));
            const isCorrect = userAnswer === correctAnswer || altAnswers.includes(userAnswer);

            answered = true;
            const ab = document.getElementById('k-scr-answer');

            // Get stamp URLs
            const stampApi = window.JPShared.stampSettings;
            const stampUrl = stampApi ? stampApi.getStampUrl() : '';
            const pooUrl = stampApi ? stampApi.getPooUrl() : '';

            if (isCorrect) {
                ab.classList.add('correct');
                ab.querySelectorAll('.k-scr-chip').forEach(c => c.classList.add('correct-chip'));
                scrScore++;
                if (firstAttempt) scrScore++; // bonus point
                scrStreak++;
                setTxt('k-scr-streak', scrStreak);
                if (scrStreak > scrBest) {
                    scrBest = scrStreak;
                    bestScores.scramble = scrBest;
                    window.JPShared.progress.setBestScore('scramble', scrBest);
                    setTxt('k-scr-best', scrBest);
                }
                if (scrStreak >= 5 && scrStreak % 5 === 0) {
                    const targetView = document.getElementById('k-view-scr');
                    if (targetView) {
                        targetView.style.position = 'relative';
                        const savedMode = curMode;
                        curMode = 'scramble';
                        launchHanabi(scrStreak);
                        curMode = savedMode;
                    }
                }
                // Show character stamp
                if (stampUrl) {
                    const stampDiv = document.createElement('div');
                    stampDiv.className = 'k-result-stamp';
                    stampDiv.innerHTML = '<img src="' + stampUrl + '" alt="stamp">';
                    ab.parentNode.insertBefore(stampDiv, ab.nextSibling);
                }
            } else {
                ab.classList.add('wrong');
                ab.querySelectorAll('.k-scr-chip').forEach(c => c.classList.add('wrong-chip'));
                scrStreak = 0;
                setTxt('k-scr-streak', 0);

                // Show poo stamp
                if (pooUrl) {
                    const stampDiv = document.createElement('div');
                    stampDiv.className = 'k-result-stamp';
                    stampDiv.innerHTML = '<img src="' + pooUrl + '" alt="poo">';
                    ab.parentNode.insertBefore(stampDiv, ab.nextSibling);
                }

                // Show correct answer
                const correctLine = document.createElement('div');
                correctLine.className = 'k-scr-correct-line';
                correctLine.textContent = item.segments.join('');
                ab.parentNode.insertBefore(correctLine, ab.nextSibling);
            }

            // Show explanation
            const explainEl = document.getElementById('k-scr-explain');
            if (explainEl) {
                explainEl.innerHTML = item.explanation;
                explainEl.classList.add('show');
            }

            // Replace check button with next
            const checkBtn = document.getElementById('k-scr-check');
            if (checkBtn) {
                checkBtn.textContent = 'Next →';
                checkBtn.disabled = false;
                checkBtn.style.opacity = '1';
                checkBtn.onclick = () => {
                    scrItemIdx++;
                    scrRenderItem();
                };
            }
            const clearBtn = document.getElementById('k-scr-clear');
            if (clearBtn) clearBtn.style.display = 'none';
        };
    }

    function scrShowSummary() {
        if (window.JPShared && window.JPShared.streak) window.JPShared.streak.recordActivity();
        const stage = document.getElementById('k-scr-stage');
        const maxPossible = scrTotal * 2;
        const pct = maxPossible > 0 ? Math.round(scrScore / maxPossible * 100) : 0;
        stage.innerHTML = `
            <div style="text-align:center; padding: 1rem;">
                <div style="font-size:2.5rem; margin-bottom:10px;">🔀</div>
                <div style="font-size:1.4rem; font-weight:900; color:var(--primary); margin-bottom:8px;">Scramble Complete!</div>
                <div style="font-size:3rem; font-weight:900; color:var(--text-main); margin-bottom:5px;">${scrScore} / ${maxPossible}</div>
                <div style="color:var(--text-sub); font-weight:600; margin-bottom:15px;">${pct}% · ${scrTotal} sentences</div>
                <div style="display:flex; justify-content:center; gap:20px; margin-bottom:20px;">
                    <div><div style="font-size:1.5rem; font-weight:900; color:#ffa502;">🔥 ${scrStreak}</div><div class="k-lbl">Final Streak</div></div>
                    <div><div style="font-size:1.5rem; font-weight:900; color:var(--primary);">🏆 ${scrBest}</div><div class="k-lbl">Best Streak</div></div>
                </div>
                <button class="k-btn" onclick="scrStart()" style="max-width:250px; margin:5px auto;">Play Again</button>
                <button class="k-btn k-btn-sec" onclick="KanjiApp.showMenu()" style="max-width:250px; margin:5px auto;">Back to Menu</button>
            </div>
        `;
        setTxt('k-scr-progress', 'Complete!');
    }

    KanjiApp.scrSkip = function() {
        scrItemIdx++;
        scrStreak = 0;
        setTxt('k-scr-streak', 0);
        scrRenderItem();
    };

    KanjiApp.toggleScrMenu = function() {
        const sub = document.getElementById('k-scr-submenu');
        if (sub) sub.classList.toggle('k-hidden');
    };

    // --- SCRAMBLE MARATHON (N4 Progressive) ---
    const MARATHON_TIERS = [
        { difficulty: 1, label: 'Warm-up', color: '#2ed573', icon: '🟢' },
        { difficulty: 2, label: 'Build-up', color: '#ffa502', icon: '🟡' },
        { difficulty: 3, label: 'Challenge', color: '#ff4757', icon: '🔴' }
    ];
    let marItems = [], marIdx = 0, marStreak = 0, marBest = 0, marScore = 0, marTotal = 0, marCurrentTier = 0, marTitle = '';
    let marDataCache = null;

    async function marathonStart() {
        curMode = 'scramble'; curCategory = 'scramble';
        marStreak = 0; marScore = 0; marTotal = 0; marIdx = 0; marCurrentTier = 0;
        marBest = bestScores.marathon || 0;

        if (!marDataCache) {
            try {
                const url = window.getAssetUrl(REPO_CONFIG, 'data/N4/scramble/scramble.N4.json') + '?t=' + Date.now();
                const res = await fetch(url);
                marDataCache = await res.json();
            } catch(e) {
                alert('Could not load Marathon data.');
                return;
            }
        }

        const available = marDataCache.marathons.filter(m =>
            m.requires.every(req => activeLessons.has(req))
        );

        if (available.length === 0) {
            alert('Select N4 lessons to unlock Marathon sets! The first marathon unlocks after N4.2.');
            return;
        }

        // Pick one marathon at random
        const marathon = available[Math.floor(Math.random() * available.length)];
        marTitle = marathon.title;

        // Build items: warmup → buildup → challenge, each shuffled internally
        marItems = [];
        marathon.warmup.sort(() => Math.random() - 0.5).forEach(item =>
            marItems.push({ ...item, difficulty: 1 }));
        marathon.buildup.sort(() => Math.random() - 0.5).forEach(item =>
            marItems.push({ ...item, difficulty: 2 }));
        marathon.challenge.sort(() => Math.random() - 0.5).forEach(item =>
            marItems.push({ ...item, difficulty: 3 }));
        marTotal = marItems.length;

        ALL_VIEWS.forEach(i => {
            const el = document.getElementById(i);
            if(el) el.classList.add('k-hidden');
        });
        const sv = document.getElementById('k-view-scr');
        if(sv) sv.classList.remove('k-hidden');

        setTxt('k-scr-best', marBest);
        setTxt('k-scr-streak', 0);
        marCurrentTier = 0;
        marRenderItem();
    }

    function marRenderItem() {
        if (marIdx >= marItems.length) {
            marShowSummary();
            return;
        }

        const item = marItems[marIdx];
        const tierInfo = MARATHON_TIERS.find(t => t.difficulty === item.difficulty) || MARATHON_TIERS[0];

        // Show tier transition banner
        if (item.difficulty !== marCurrentTier) {
            marCurrentTier = item.difficulty;
            const stage = document.getElementById('k-scr-stage');
            stage.innerHTML = `
                <div style="text-align:center; padding:2rem;">
                    ${item.difficulty === 1 ? '<div style="font-size:0.85rem; font-weight:800; color:var(--text-sub); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">' + marTitle + '</div>' : ''}
                    <div style="font-size:3rem; margin-bottom:10px;">${tierInfo.icon}</div>
                    <div style="font-size:1.6rem; font-weight:900; color:${tierInfo.color}; margin-bottom:6px;">Round ${item.difficulty}: ${tierInfo.label}</div>
                    <div style="color:var(--text-sub); font-weight:600; font-size:0.95rem;">
                        ${item.difficulty === 1 ? 'Short sentences, fewer distractors' : item.difficulty === 2 ? 'Longer sentences, more particles' : 'Compound sentences, tricky distractors'}
                    </div>
                </div>
            `;
            setTxt('k-scr-progress', `${tierInfo.icon} ${marIdx + 1} / ${marTotal}`);
            setTimeout(() => marRenderScramble(item, tierInfo), 1500);
            return;
        }

        marRenderScramble(item, tierInfo);
    }

    function marRenderScramble(item, tierInfo) {
        const allChips = item.segments.concat(item.distractors).sort(() => Math.random() - 0.5);
        const answerSlots = [];
        let answered = false;
        let firstAttempt = true;

        setTxt('k-scr-progress', `${tierInfo.icon} ${marIdx + 1} / ${marTotal}`);

        const stage = document.getElementById('k-scr-stage');
        stage.innerHTML = `
            <div style="text-align:center; margin-bottom:6px;">
                <span style="font-size:0.75rem; font-weight:800; color:${tierInfo.color}; text-transform:uppercase; letter-spacing:0.1em;">${tierInfo.icon} ${tierInfo.label}</span>
            </div>
            <div class="k-scr-prompt">${item.q}</div>
            <div class="k-scr-hint">Tap words to build the sentence</div>
            <div class="k-scr-answer" id="k-scr-answer"></div>
            <div class="k-scr-pool" id="k-scr-pool">
                ${allChips.map((c, i) => `<div class="k-scr-chip" data-idx="${i}" data-text="${c}">${c}</div>`).join('')}
            </div>
            <div style="display:flex; gap:8px; justify-content:center;">
                <button class="k-btn" id="k-scr-check" disabled style="opacity:0.4; max-width:200px;">Check</button>
                <button class="k-btn k-btn-sec" id="k-scr-clear" style="max-width:120px;">Clear</button>
            </div>
            <div class="k-scr-explain" id="k-scr-explain"></div>
        `;

        const pool = document.getElementById('k-scr-pool');
        const answerBox = document.getElementById('k-scr-answer');

        pool.querySelectorAll('.k-scr-chip').forEach(chip => {
            chip.onclick = () => {
                if (answered || chip.classList.contains('placed')) return;
                chip.classList.add('placed');
                const ansChip = document.createElement('div');
                ansChip.className = 'k-scr-chip in-answer';
                ansChip.textContent = chip.dataset.text;
                ansChip.dataset.poolIdx = chip.dataset.idx;
                ansChip.onclick = () => {
                    if (answered) return;
                    chip.classList.remove('placed');
                    ansChip.remove();
                    answerSlots.splice(answerSlots.indexOf(chip.dataset.text), 1);
                    marUpdateCheck();
                };
                answerBox.appendChild(ansChip);
                answerSlots.push(chip.dataset.text);
                marUpdateCheck();
            };
        });

        function marUpdateCheck() {
            const needed = item.segments.length;
            const btn = document.getElementById('k-scr-check');
            const hasEnough = answerSlots.length === needed;
            if (btn) { btn.disabled = !hasEnough; btn.style.opacity = hasEnough ? '1' : '0.4'; }
            const ab = document.getElementById('k-scr-answer');
            if (ab) ab.classList.toggle('has-chips', answerSlots.length > 0);
        }

        document.getElementById('k-scr-clear').onclick = () => {
            if (answered) return;
            answerSlots.length = 0;
            answerBox.querySelectorAll('.k-scr-chip').forEach(c => c.remove());
            pool.querySelectorAll('.k-scr-chip').forEach(c => c.classList.remove('placed'));
            marUpdateCheck();
        };

        document.getElementById('k-scr-check').onclick = () => {
            if (answered) return;

            const userAnswer = answerSlots.join('');
            const correctAnswer = item.segments.join('');
            const altAnswers = (item.alts || []).map(a => a.join(''));
            const isCorrect = userAnswer === correctAnswer || altAnswers.includes(userAnswer);

            answered = true;
            const ab = document.getElementById('k-scr-answer');

            // Get stamp URLs
            const marStampApi = window.JPShared.stampSettings;
            const marStampUrl = marStampApi ? marStampApi.getStampUrl() : '';
            const marPooUrl = marStampApi ? marStampApi.getPooUrl() : '';

            if (isCorrect) {
                ab.classList.add('correct');
                ab.querySelectorAll('.k-scr-chip').forEach(c => c.classList.add('correct-chip'));
                marScore++;
                if (firstAttempt) marScore++;
                marStreak++;
                setTxt('k-scr-streak', marStreak);
                if (marStreak > marBest) {
                    marBest = marStreak;
                    bestScores.marathon = marBest;
                    window.JPShared.progress.setBestScore('marathon', marBest);
                    setTxt('k-scr-best', marBest);
                }
                if (marStreak >= 5 && marStreak % 5 === 0) {
                    const targetView = document.getElementById('k-view-scr');
                    if (targetView) {
                        targetView.style.position = 'relative';
                        const savedMode = curMode;
                        curMode = 'scramble';
                        launchHanabi(marStreak);
                        curMode = savedMode;
                    }
                }
                // Show character stamp
                if (marStampUrl) {
                    const stampDiv = document.createElement('div');
                    stampDiv.className = 'k-result-stamp';
                    stampDiv.innerHTML = '<img src="' + marStampUrl + '" alt="stamp">';
                    ab.parentNode.insertBefore(stampDiv, ab.nextSibling);
                }
            } else {
                ab.classList.add('wrong');
                ab.querySelectorAll('.k-scr-chip').forEach(c => c.classList.add('wrong-chip'));
                marStreak = 0;
                setTxt('k-scr-streak', 0);

                // Show poo stamp
                if (marPooUrl) {
                    const stampDiv = document.createElement('div');
                    stampDiv.className = 'k-result-stamp';
                    stampDiv.innerHTML = '<img src="' + marPooUrl + '" alt="poo">';
                    ab.parentNode.insertBefore(stampDiv, ab.nextSibling);
                }

                const correctLine = document.createElement('div');
                correctLine.className = 'k-scr-correct-line';
                correctLine.textContent = item.segments.join('');
                ab.parentNode.insertBefore(correctLine, ab.nextSibling);
            }

            const explainEl = document.getElementById('k-scr-explain');
            if (explainEl) {
                explainEl.innerHTML = item.explanation;
                explainEl.classList.add('show');
            }

            const checkBtn = document.getElementById('k-scr-check');
            if (checkBtn) {
                checkBtn.textContent = 'Next →';
                checkBtn.disabled = false;
                checkBtn.style.opacity = '1';
                checkBtn.onclick = () => {
                    marIdx++;
                    marRenderItem();
                };
            }
            const clearBtn = document.getElementById('k-scr-clear');
            if (clearBtn) clearBtn.style.display = 'none';
        };
    }

    function marShowSummary() {
        if (window.JPShared && window.JPShared.streak) window.JPShared.streak.recordActivity();
        const stage = document.getElementById('k-scr-stage');
        const maxPossible = marTotal * 2;
        const pct = maxPossible > 0 ? Math.round(marScore / maxPossible * 100) : 0;
        const tierCounts = {};
        marItems.forEach(it => { tierCounts[it.difficulty] = (tierCounts[it.difficulty] || 0) + 1; });
        stage.innerHTML = `
            <div style="text-align:center; padding: 1rem;">
                <div style="font-size:2.5rem; margin-bottom:10px;">🏔️</div>
                <div style="font-size:1.4rem; font-weight:900; color:var(--primary); margin-bottom:4px;">Marathon Complete!</div>
                <div style="color:var(--text-sub); font-weight:700; font-size:0.9rem; margin-bottom:8px;">${marTitle}</div>
                <div style="font-size:3rem; font-weight:900; color:var(--text-main); margin-bottom:5px;">${marScore} / ${maxPossible}</div>
                <div style="color:var(--text-sub); font-weight:600; margin-bottom:15px;">${pct}% · ${marTotal} sentences</div>
                <div style="display:flex; justify-content:center; gap:12px; margin-bottom:8px; font-size:0.85rem; font-weight:700;">
                    ${tierCounts[1] ? '<span style="color:#2ed573">🟢 ' + tierCounts[1] + ' warm-up</span>' : ''}
                    ${tierCounts[2] ? '<span style="color:#ffa502">🟡 ' + tierCounts[2] + ' build-up</span>' : ''}
                    ${tierCounts[3] ? '<span style="color:#ff4757">🔴 ' + tierCounts[3] + ' challenge</span>' : ''}
                </div>
                <div style="display:flex; justify-content:center; gap:20px; margin-bottom:20px;">
                    <div><div style="font-size:1.5rem; font-weight:900; color:#ffa502;">🔥 ${marStreak}</div><div class="k-lbl">Final Streak</div></div>
                    <div><div style="font-size:1.5rem; font-weight:900; color:var(--primary);">🏆 ${marBest}</div><div class="k-lbl">Best Streak</div></div>
                </div>
                <button class="k-btn" onclick="marathonStart()" style="max-width:250px; margin:5px auto;">Play Again</button>
                <button class="k-btn k-btn-sec" onclick="KanjiApp.showMenu()" style="max-width:250px; margin:5px auto;">Back to Menu</button>
            </div>
        `;
        setTxt('k-scr-progress', 'Complete!');
    }

    // ---- Conjugation Station ----
    let dojoConjRules = null;
    let dojoScriptLoaded = false;

    async function dojoLoadScript() {
        if (dojoScriptLoaded) return true;
        try {
            const url = window.getAssetUrl(REPO_CONFIG, 'app/games/conjugation-dojo.js') + '?t=' + Date.now();
            const res = await fetch(url);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const code = await res.text();
            const script = document.createElement('script');
            script.textContent = code;
            document.body.appendChild(script);
            dojoScriptLoaded = true;
            return true;
        } catch(e) {
            console.error('[Practice] Failed to load conjugation-dojo.js:', e);
            alert('Could not load Conjugation Station.');
            return false;
        }
    }

    async function dojoStart() {
        if (window.JPShared && window.JPShared.streak) window.JPShared.streak.recordActivity();

        // Load the dojo game module script
        if (!await dojoLoadScript()) return;

        // Load conjugation_rules.json once
        if (!dojoConjRules) {
            try {
                const url = window.getAssetUrl(REPO_CONFIG, 'conjugation_rules.json') + '?t=' + Date.now();
                dojoConjRules = await (await fetch(url)).json();
            } catch(e) {
                alert('Could not load conjugation rules.');
                return;
            }
        }

        // Switch views
        ALL_VIEWS.forEach(i => {
            const el = document.getElementById(i);
            if(el) el.classList.add('k-hidden');
        });
        const dv = document.getElementById('k-view-dojo');
        if(dv) dv.classList.remove('k-hidden');

        let dojoStreak = 0;
        let dojoBest = bestScores.dojo || 0;
        setTxt('k-dojo-streak', 0);
        setTxt('k-dojo-best', dojoBest);

        window.JPShared.conjugationDojo.init(document.getElementById('k-dojo-stage'), {
            activeLessons: activeLessons,
            vocabMap: DB.vocabMap,
            conjugationRules: dojoConjRules,
            textProcessor: window.JPShared.textProcessor,
            unlock: window.JPShared.unlock || null,
            onCorrect: function() {
                dojoStreak++;
                if (dojoStreak > dojoBest) {
                    dojoBest = dojoStreak;
                    bestScores.dojo = dojoBest;
                    window.JPShared.progress.setBestScore('dojo', dojoBest);
                }
                setTxt('k-dojo-streak', dojoStreak);
                setTxt('k-dojo-best', dojoBest);
                if (dojoStreak >= 5 && dojoStreak % 5 === 0) {
                    var saved = curMode; curMode = 'dojo';
                    launchHanabi(dojoStreak);
                    curMode = saved;
                }
            },
            onWrong: function() {
                dojoStreak = 0;
                setTxt('k-dojo-streak', 0);
            },
            onExit: function() { KanjiApp.showMenu(); },
            onProgress: function(current, total) {
                setTxt('k-dojo-progress', current + ' / ' + total);
            },
            getStreakInfo: function() { return { streak: dojoStreak, best: dojoBest }; }
        });
    }

    KanjiApp.flipCard = function() {
        const c = document.getElementById('k-fc-card-obj');
        if(c) c.classList.toggle('is-flipped');
    };

    // ANTI-CHEAT MOVE
    KanjiApp.move = function(n) {
        const c = document.getElementById('k-fc-card-obj');
        const wasFlipped = c && c.classList.contains('is-flipped');

        if (curMode === 'flash' && n === 1) {
            if (skipNextStreak) {
                skipNextStreak = false;
            } else {
                curStreak++;
                if (curStreak > curBest) {
                    curBest = curStreak;
                    bestScores.flash = curBest;
                    window.JPShared.progress.setBestScore('flash', curBest);
                    setTxt('k-fc-best', curBest);
                }
                updateStreakVisuals(curStreak);
            }
        }

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

        if (curMode === 'flash') { curStreak = 0; skipNextStreak = true; resetStreakVisuals(); }

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
            btn.classList.add('correct'); curStreak++; updateStreakVisuals(curStreak);
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
            btn.classList.add('wrong'); curStreak = 0; resetStreakVisuals();
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

            // Build a lookup: lessonId → manifest entry (carries unlocksAfter)
            const manifestLessonMap = {};
            (manifest.levels || ['N5','N4']).forEach(lvl => {
                ((manifest.data[lvl] || {}).lessons || []).forEach(entry => {
                    manifestLessonMap[entry.id] = entry;
                });
            });

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
                const unlock = window.JPShared && window.JPShared.unlock;
                DB.lessons.forEach(l => {
                    // Skip lessons that are locked in gated mode
                    if (unlock && !unlock.isFree()) {
                        const entry = manifestLessonMap[l.id] || { id: l.id };
                        if (!unlock.isLessonUnlocked(entry)) return;
                    }
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
