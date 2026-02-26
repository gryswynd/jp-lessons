(function() {
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

  window.ReviewModule = {
    container: null,
    onExit: null,

    // --- PUBLIC START METHOD ---
    start: function(container, config, onExit) {
      this.container = container;
      this.onExit = onExit;

      // Override config if provided
      if (config) {
        // Merge config, but preserve default path if incoming path is empty
        const { path, ...restConfig } = config;
        this.config = { ...this.config, ...restConfig };
        if (path) {
          this.config.path = path;
        }
      }

      // Inject styles early so menu renders correctly
      this.injectStyles();

      // Show review selection list (like Lesson.js)
      this.fetchReviewList();
    },

    // --- REVIEW LIST (reads from manifest.json) ---
    fetchReviewList: async function() {
      this.container.innerHTML = `
        <div id="jp-test-wrapper">
          <div id="jp-test-embed">
            <div class="jp-header">
              <div class="jp-title">Select Review</div>
              <div class="jp-badge jp-exit-link-header" id="jp-exit-list">Exit</div>
            </div>
            <div id="jp-stage" style="padding: 20px;">
              <div style="text-align:center; color:#888; padding:40px;">Loading reviews...</div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('jp-exit-list').onclick = () => {
        if (this.onExit) this.onExit();
      };

      try {
        const manifest = await window.getManifest(this.config);
        const reviews = [];
        (manifest.levels || []).forEach(level => {
          const levelData = manifest.data && manifest.data[level];
          if (!levelData || !levelData.reviews) return;
          levelData.reviews.forEach(review => {
            reviews.push({ id: review.id, title: review.title, file: review.file });
          });
        });

        // Sort newest first; non-numeric IDs (e.g. Master) go to end
        reviews.sort((a, b) => {
          const partsA = a.id.match(/N(\d+)\.Review\.(\d+)/);
          const partsB = b.id.match(/N(\d+)\.Review\.(\d+)/);
          if (!partsA && !partsB) return 0;
          if (!partsA) return 1;
          if (!partsB) return -1;
          const levelA = parseInt(partsA[1]), numA = parseInt(partsA[2]);
          const levelB = parseInt(partsB[1]), numB = parseInt(partsB[2]);
          if (levelA !== levelB) return levelB - levelA;
          return numB - numA;
        });

        console.log('[Review] Found', reviews.length, 'reviews from manifest');
        this.renderReviewMenu(reviews);
      } catch (err) {
        document.getElementById('jp-stage').innerHTML = `
          <div style="text-align:center; color:#d63031; padding:20px;">
            <h3>Error</h3><p>${err.message}</p>
            <button class="jp-btn jp-btn-main" id="jp-err-back">Back to Menu</button>
          </div>`;
        document.getElementById('jp-err-back').onclick = () => {
          if (this.onExit) this.onExit();
        };
      }
    },

    renderReviewMenu: function(reviews) {
      const stage = document.getElementById('jp-stage');

      let html = '<div class="jp-review-menu-grid">';
      reviews.forEach(review => {
        const topScore = window.JPShared.progress.getReviewScore(review.id);
        const scoreDisplay = topScore !== undefined
          ? `<div class="jp-review-score">Best: ${topScore}%</div>`
          : `<div class="jp-review-score jp-no-score">Not attempted</div>`;

        html += `
          <div class="jp-review-menu-item" data-file="${review.file}" data-id="${review.id}">
            <div>
              <div class="jp-review-menu-id">${review.id}</div>
            </div>
            <div style="text-align:right;">
              ${scoreDisplay}
              <div class="jp-review-menu-arrow">Start →</div>
            </div>
          </div>
        `;
      });
      html += '</div>';

      stage.innerHTML = html;

      stage.querySelectorAll('.jp-review-menu-item').forEach(item => {
        item.onclick = () => this.loadReview(item.dataset.file, item.dataset.id);
      });
    },

    loadReview: function(filePath, reviewId) {
      this.config.path = filePath;
      this.config._reviewId = reviewId;
      this.buildUI();
      this.init();
    },

    buildUI: function() {
      this.container.innerHTML = `
        <div id="jp-test-wrapper">
            <div id="jp-test-embed">
              <div class="jp-header">
                <div style="display:flex; align-items:center;">
                  <button class="jp-review-back-btn" id="jp-back-to-list">← List</button>
                  <div class="jp-title" id="jp-header-title">Loading...</div>
                </div>
                <div class="jp-badge">Score: <span id="jp-score">0</span></div>
              </div>

              <div class="jp-progress-track">
                <div class="jp-progress-fill" id="jp-progress"></div>
              </div>

              <div id="jp-stage">
                <div class="jp-intro">
                  <div class="jp-emoji">🇯🇵</div>
                  <h2 id="jp-intro-title" style="margin: 0 0 10px 0; color: #2d3436;">Loading Lesson...</h2>
                  <p id="jp-intro-desc" style="color:#666; margin-bottom: 25px; line-height: 1.6;">
                    Please wait while we fetch the lesson content.
                  </p>
                  <button id="jp-start-btn" class="jp-btn jp-btn-main" style="opacity:0.5; pointer-events:none;">Start</button>
                </div>
              </div>
            </div>
            <div class="jp-exit-link" id="jp-exit-review">Exit Review</div>
        </div>
      `;

      // Attach exit handler
      document.getElementById('jp-exit-review').onclick = () => {
        if (this.onExit) this.onExit();
      };

      // Attach back-to-list handler
      document.getElementById('jp-back-to-list').onclick = () => this.fetchReviewList();

      // Attach start button handler (will be enabled after data loads)
      document.getElementById('jp-start-btn').onclick = () => this.startQuiz();
    },

    // REPO CONFIG
    config: {
      owner: "gryswynd",
      repo: "jp-lessons",
      branch: "main",
      path: "N4.Review.6.json" // Default, can be overridden
    },
    state: {
      questions: [],
      idx: 0,
      score: 0,
      maxScore: 0,
      termMap: {},
      conjugations: null,
      counterRules: null
    },

    // Helpers
    el: (id) => document.getElementById(id),
    getUrl: function(filepath) {
       return window.getAssetUrl(this.config, filepath || this.config.path);
    },

    // --- INITIALIZATION ---
    init: async function() {
      console.log('[Review] Initializing...');
      console.log('[Review] Current DOM state:');
      console.log('  - jp-stage exists:', !!document.getElementById('jp-stage'));
      console.log('  - jp-header-title exists:', !!document.getElementById('jp-header-title'));
      console.log('  - jp-start-btn exists:', !!document.getElementById('jp-start-btn'));

      try {
        const manifest = await window.getManifest(this.config);
        const quizUrl = this.getUrl();
        const conjUrl     = this.getUrl(manifest.globalFiles.conjugationRules);
        const counterUrl  = this.getUrl(manifest.globalFiles.counterRules);
        const particleUrl = this.getUrl(manifest.shared.particles);
        const glossaryUrls = manifest.levels.map(lvl => this.getUrl(manifest.data[lvl].glossary));

        console.log('[Review] Quiz URL:', quizUrl);
        console.log('[Review] Conjugation URL:', conjUrl);
        console.log('[Review] Counter URL:', counterUrl);

        // 1. Fetch Quiz Data + Glossary + Conjugations + Counter Rules in parallel
        const [quizRes, conjRes, counterRes, particleRes, ...glossResponses] = await Promise.all([
            fetch(quizUrl),
            fetch(conjUrl),
            fetch(counterUrl),
            fetch(particleUrl),
            ...glossaryUrls.map(u => fetch(u))
        ]);

        const glossOk = glossResponses.every(r => r.ok);
        console.log('[Review] Fetch responses:', {
          quiz: quizRes.ok,
          glossary: glossOk,
          conjugations: conjRes.ok,
          counters: counterRes.ok,
          particles: particleRes.ok
        });

        if (!quizRes.ok || !glossOk || !conjRes.ok || !counterRes.ok || !particleRes.ok) {
          throw new Error(`Failed to fetch resources: Quiz(${quizRes.status}) Glossary(${glossResponses.map(r => r.status)}) Conjugations(${conjRes.status}) Counters(${counterRes.status}) Particles(${particleRes.status})`);
        }

        console.log('[Review] Parsing JSON...');
        const quizData = await quizRes.json();
        const glossParts = await Promise.all(glossResponses.map(r => r.json()));
        this.state.conjugations = await conjRes.json();
        this.state.counterRules = await counterRes.json();
        const particleData = await particleRes.json();

        const glossData = { entries: glossParts.flatMap(g => g.entries) };
        console.log('[Review] Quiz title:', quizData.title);
        console.log('[Review] Glossary entries:', glossData.entries.length);

        // 2. Map Glossary + Particles
        this.state.termMap = {};
        glossData.entries.forEach(i => { this.state.termMap[i.id] = i; });
        (particleData.particles || []).forEach(p => {
            this.state.termMap[p.id] = { id: p.id, surface: p.particle, reading: p.reading, meaning: p.role, notes: p.explanation, type: 'particle' };
        });

        // 3. Inject Styles & Modal
        console.log('[Review] Injecting styles...');
        this.injectStyles();
        console.log('[Review] Injecting modal...');
        window.JPShared.termModal.setTermMap(this.state.termMap);
        window.JPShared.termModal.inject();
        // Wire JP_OPEN_TERM to Review's flagTerm so quiz auto-flagging and
        // modal flagging use the same method (getRootTerm-aware, returns bool).
        const self = this;
        window.JP_OPEN_TERM = function(id, enableFlag) {
            window.JPShared.termModal.open(id, {
                enableFlag: enableFlag !== false,
                onFlag: function(termId, msgBox) {
                    self.flagTerm(termId);
                    if (msgBox) msgBox.style.display = 'inline-block';
                }
            });
        };

        // 4. Process Quiz
        console.log('[Review] Processing quiz data...');
        this.processData(quizData);
        console.log('[Review] Initialization complete!');

      } catch (e) {
        console.error('[Review] Error during initialization:', e);
        console.error('[Review] Error stack:', e.stack);
        const stage = this.el('jp-stage');
        if (stage) {
          stage.innerHTML = `<div style="text-align:center;color:#d63031;padding:20px;">Unable to load test resources.<br><small>${e.message}</small><br><br><button class="jp-btn" onclick="location.reload()" style="background:#4e54c8;color:white;padding:12px 24px;border:none;border-radius:8px;cursor:pointer;">Reload Page</button></div>`;
        } else {
          console.error('[Review] Cannot display error: jp-stage element not found!');
          alert('Error loading review: ' + e.message);
        }
      }
    },

    injectStyles: function() {
        if(document.getElementById('jp-review-styles')) return;
        const style = document.createElement('style');
        style.id = 'jp-review-styles';
        style.innerHTML = `
            /* CSS Variables */
            :root {
                --jp-primary: #4e54c8;
                --jp-success: #00b894;
                --jp-error: #d63031;
            }

            /* Main Container */
            #jp-test-wrapper {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            #jp-test-embed {
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                overflow: hidden;
            }

            /* Header */
            .jp-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 25px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .jp-title { font-size: 1.1rem; font-weight: 900; }
            .jp-badge {
                background: rgba(255,255,255,0.2);
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 700;
                font-size: 0.95rem;
            }

            /* Progress Bar */
            .jp-progress-track {
                height: 6px;
                background: #e8e8e8;
                position: relative;
            }
            .jp-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #00b894, #00cec9);
                width: 0%;
                transition: width 0.3s ease;
            }

            /* Stage */
            #jp-stage { padding: 30px 25px; min-height: 300px; }

            /* Intro Screen */
            .jp-intro { text-align: center; padding: 20px 0; }
            .jp-emoji { font-size: 4rem; margin-bottom: 20px; }

            /* Buttons */
            .jp-btn {
                background: #f1f2f6;
                border: none;
                padding: 15px 30px;
                border-radius: 12px;
                font-weight: 700;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
                margin: 5px;
            }
            .jp-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .jp-btn:active { transform: scale(0.98); }
            .jp-btn-main {
                background: var(--jp-primary);
                color: white;
                padding: 18px 40px;
                font-size: 1.1rem;
            }
            .jp-btn.correct { background: var(--jp-success) !important; color: white; }
            .jp-btn.wrong { background: var(--jp-error) !important; color: white; }

            /* Question Styles */
            .jp-q-label {
                font-size: 0.85rem;
                color: #999;
                font-weight: 700;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .jp-q-text {
                font-size: 1.2rem;
                font-weight: 700;
                margin: 25px 0;
                color: #2d3436;
                line-height: 1.6;
            }
            .jp-highlight {
                background: rgba(78,84,200,0.1);
                padding: 2px 6px;
                border-radius: 4px;
                color: var(--jp-primary);
            }

            /* Passage / Conversation */
            .jp-passage {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                margin: 20px 0;
                line-height: 1.8;
            }
            .jp-convo-line {
                margin: 15px 0;
                padding: 12px;
                background: white;
                border-radius: 8px;
            }
            .jp-convo-spk {
                font-weight: 900;
                color: var(--jp-primary);
                margin-bottom: 5px;
                font-size: 0.9rem;
            }
            .jp-convo-text { font-size: 1.1rem; }

            /* Feedback */
            .jp-feedback {
                display: none;
                margin-top: 20px;
                padding: 20px;
                border-radius: 12px;
                animation: jpFadeIn 0.3s;
            }
            .jp-feedback.correct { background: rgba(0,184,148,0.1); border: 2px solid var(--jp-success); }
            .jp-feedback.wrong { background: rgba(214,48,49,0.1); border: 2px solid var(--jp-error); }

            /* Scramble */
            .jp-scramble-box {
                min-height: 60px;
                padding: 15px;
                border: 2px dashed #ddd;
                border-radius: 12px;
                margin-bottom: 12px;
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                align-items: center;
            }
            .jp-scramble-box.correct { border-color: var(--jp-success); background: rgba(0,184,148,0.05); }
            .jp-scramble-box.wrong { border-color: var(--jp-error); background: rgba(214,48,49,0.05); }
            .jp-chip-pool { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
            .jp-chip {
                background: white;
                padding: 10px 16px;
                border-radius: 8px;
                border: 2px solid #e8e8e8;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 600;
            }
            .jp-chip:hover { border-color: var(--jp-primary); transform: translateY(-2px); }
            .jp-chip.used { opacity: 0.3; pointer-events: none; }
            .jp-scramble-placeholder { color: #aaa; font-style: italic; }
            .jp-scramble-submit { margin-top: 12px; }
            .jp-scramble-submit:disabled { opacity: 0.35; pointer-events: none; }
            .jp-clear-btn {
                display: none;
                margin-top: 8px;
                background: transparent;
                border: 1px dashed #ccc;
                color: #999;
                font-size: 0.8rem;
                padding: 6px 14px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .jp-clear-btn:hover { border-color: #aaa; color: #666; }
            .jp-pts-badge {
                display: inline-block;
                font-size: 0.85rem;
                font-weight: 700;
                margin-left: 10px;
                padding: 2px 8px;
                border-radius: 6px;
                background: rgba(0,184,148,0.12);
                color: var(--jp-success);
            }

            /* In-answer-box chips */
            .jp-in-chip { padding: 8px 14px; }

            /* Scramble color feedback */
            .jp-chip-correct   { background: rgba(46,213,115,0.12) !important; border-color: #2ed573 !important; color: #1a8a45 !important; }
            .jp-chip-misplaced { background: rgba(255,165,2,0.12)  !important; border-color: #ffa502 !important; color: #7d5200 !important; }
            .jp-chip-wrong     { background: rgba(255,71,87,0.12)  !important; border-color: #ff4757 !important; color: #c0392b !important; }

            /* Interaction Area */
            #jp-interaction {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin: 20px 0;
            }

            /* Term Styling */
            .jp-term { color: #4e54c8; font-weight: 700; cursor: pointer; border-bottom: 2px solid rgba(78,84,200,0.1); transition: 0.2s; }
            .jp-term:hover { background: rgba(78,84,200,0.05); border-bottom-color: #4e54c8; }

            /* Animations */
            @keyframes jpFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* RANK CELEBRATION - HANABI */
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

            /* Exit Link */
            .jp-exit-link {
                display: block;
                text-align: center;
                margin-top: 20px;
                color: #b2bec3;
                text-decoration: none;
                font-weight: 700;
                cursor: pointer;
            }
            .jp-exit-link:hover { color: var(--jp-primary); }

            /* Exit in header (for list screen) */
            .jp-exit-link-header { cursor: pointer; }
            .jp-exit-link-header:hover { background: rgba(255,255,255,0.35); }

            /* Back Button in Quiz Header */
            .jp-review-back-btn {
                background: transparent; color: rgba(255,255,255,0.8);
                border: none; cursor: pointer; font-weight: bold;
                font-size: 0.9rem; margin-right: 10px; padding: 4px 8px;
                border-radius: 6px;
            }
            .jp-review-back-btn:hover { color: white; background: rgba(255,255,255,0.1); }

            /* Review Menu Grid */
            .jp-review-menu-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
            .jp-review-menu-item {
                background: #fff; padding: 20px; border-radius: 16px; cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;
                border: 1px solid rgba(0,0,0,0.02); text-align: left;
                display: flex; justify-content: space-between; align-items: center;
            }
            .jp-review-menu-item:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(78,84,200,0.15); border-color: var(--jp-primary); }
            .jp-review-menu-id { font-weight: 900; color: var(--jp-primary); font-size: 1.1rem; }
            .jp-review-score { font-size: 0.85rem; color: var(--jp-success); font-weight: 700; }
            .jp-review-score.jp-no-score { color: #b2bec3; }
            .jp-review-menu-arrow { font-size: 0.8rem; color: #a4b0be; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
        `;
        document.head.appendChild(style);
    },

    // --- TERM & FLAGGING LOGIC ---

    flagTerm: function(termId) {
        const rootTerm = window.JPShared.textProcessor.getRootTerm(termId, this.state.termMap);
        if (!rootTerm) return false;
        window.JPShared.progress.flagTerm(rootTerm.surface);
        return true;
    },

    // --- QUIZ LOGIC ---

    processData: function(data) {
      console.log('[Review] Processing data...');
      if(data.title) {
        const headerTitle = this.el('jp-header-title');
        const introTitle = this.el('jp-intro-title');
        if (headerTitle) headerTitle.innerText = data.title;
        if (introTitle) introTitle.innerText = data.title;
      }
      if(data.meta && data.meta.focus) {
        const introDesc = this.el('jp-intro-desc');
        if (introDesc) introDesc.innerText = data.meta.focus;
      }
      const btn = this.el('jp-start-btn');
      if (btn) {
        btn.style.opacity = "1";
        btn.style.pointerEvents = "all";
        btn.innerText = "Start Review";
        console.log('[Review] Start button enabled');
      }

      this.state.questions = [];
      data.sections.forEach(sec => {
        if (sec.type === 'drills') {
          sec.items.forEach(item => this.state.questions.push({
            ...item, type: item.kind, section: sec.title, isScorable: true
          }));
        } else if (sec.type === 'reading') {
          sec.questions.forEach(q => {
            this.state.questions.push({
              type: 'reading_mcq', q: q.q, choices: q.choices,
              answer: q.a.replace(/。$/, '').trim(), fullAnswer: q.a,
              explanation: q.explanation, passage: sec.passage, section: sec.title, isScorable: true,
              terms: q.terms // Pass terms for context
            });
          });
        } else if (sec.type === 'conversation') {
           sec.items.forEach(item => {
              this.state.questions.push({
                type: 'conversation_quiz',
                title: item.title,
                context: item.context,
                lines: item.lines,
                q: item.question,
                choices: item.choices,
                answer: item.answer,
                explanation: item.explanation,
                section: sec.title,
                isScorable: true,
                terms: item.terms
              });
           });
        }
      });
    },

    startQuiz: function() {
      if(this.state.questions.length === 0) return;
      this.state.idx = 0;
      this.state.score = 0;
      this.state.maxScore = this.state.questions.reduce((sum, q) => sum + (q.type === 'scramble' ? 2 : 1), 0);
      this.updateUI();
      this.renderQ();
    },

    renderQ: function() {
      if (this.state.idx >= this.state.questions.length) return this.renderEnd();
      const q = this.state.questions[this.state.idx];
      const stage = this.el('jp-stage');

      const pct = (this.state.idx / this.state.questions.length) * 100;
      this.el('jp-progress').style.width = pct + "%";

      let html = `<div style="animation: jpFadeIn 0.4s ease;">`;
      html += `<div class="jp-q-label">${q.section} • ${this.state.idx + 1}/${this.state.questions.length}</div>`;

      // Conversation Render
      if (q.type === 'conversation_quiz') {
        html += `<div class="jp-passage">`;
        if(q.context) html += `<div style="font-style:italic; color:#666; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">Context: ${q.context}</div>`;
        q.lines.forEach(line => {
          html += `
            <div class="jp-convo-line">
              <div class="jp-convo-spk">${line.spk}</div>
              <div class="jp-convo-text">${window.JPShared.textProcessor.processText(line.jp, line.terms, this.state.termMap, this.state.conjugations, this.state.counterRules)}</div>
              </div>
          `;
        });
        html += `</div>`;
      }
      // Reading Passage Render
      else if (q.type === 'reading_mcq') {
        html += `<div class="jp-passage">`;
        q.passage.forEach(p => {
            html += `<div style="margin-bottom:12px; font-size:1.1rem; line-height:1.6;">${window.JPShared.textProcessor.processText(p.jp, p.terms, this.state.termMap, this.state.conjugations, this.state.counterRules)}</div>`;
        });
        html += `</div>`;
      }

      // Question Text (Processed for highlighting)
      const qText = window.JPShared.textProcessor.processText(q.q, q.terms, this.state.termMap, this.state.conjugations, this.state.counterRules).replace(/\[(.*?)\]/g, '<span class="jp-highlight">$1</span>');
      html += `<div class="jp-q-text">${qText}</div>`;

      html += `<div id="jp-interaction"></div>`;
      html += `<div id="jp-fb" class="jp-feedback">
                <div id="jp-fb-head" style="font-weight:900;margin-bottom:5px;"></div>
                <div style="font-size:0.95rem;color:#555;">${q.explanation || ''}</div>
              </div>`;
      html += `<button id="jp-next" class="jp-btn jp-btn-main" style="display:none;" onclick="ReviewModule.next()">Next ➜</button>`;
      html += `</div>`;

      stage.innerHTML = html;

      if(q.type === 'mcq' || q.type === 'reading_mcq' || q.type === 'conversation_quiz') {
        this.renderMCQ(q);
      } else if(q.type === 'scramble') {
        this.renderScramble(q);
      }
    },

    renderMCQ: function(q) {
      const box = this.el('jp-interaction');
      const correctVal = q.answer.includes('(') ? q.answer.split('(')[0].trim() : q.answer;

      // Randomize choices
      const choices = [...q.choices].sort(() => Math.random() - 0.5);

      choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'jp-btn';
        btn.innerText = c;
        btn.onclick = () => {
          // Lock all
          Array.from(box.children).forEach(b => b.style.pointerEvents = 'none');
          const cleanSel = c.includes('(') ? c.split('(')[0].trim() : c;
          const isCorrect = cleanSel === correctVal;

          if(isCorrect) {
            btn.classList.add('correct');
            this.showFeedback(true);
          } else {
            btn.classList.add('wrong');
            // Highlight correct one
            Array.from(box.children).forEach(b => {
               const bText = b.innerText.includes('(') ? b.innerText.split('(')[0].trim() : b.innerText;
               if(bText === correctVal) b.classList.add('correct');
            });
            this.showFeedback(false);

            // --- AUTO FLAGGING ON WRONG ANSWER ---
            // Condition: Must contain terms AND NOT be a grammar/particle drill
            const isGrammar = /grammar|particle/i.test(q.section);

            if (!isGrammar && q.terms && q.terms.length > 0) {
                let flaggedCount = 0;
                q.terms.forEach(termId => {
                    if (this.flagTerm(termId)) flaggedCount++;
                });

                // Optional: visual indicator that terms were flagged
                if (flaggedCount > 0) {
                    const fb = this.el('jp-fb');
                    const note = document.createElement('div');
                    note.style.marginTop = "10px";
                    note.style.fontSize = "0.85rem";
                    note.style.color = "#d63031";
                    note.innerHTML = `<strong>Study Alert:</strong> Related terms have been flagged for review. 🚩`;
                    fb.appendChild(note);
                }
            }
          }
        };
        box.appendChild(btn);
      });
    },

    renderScramble: function(q) {
      const box = this.el('jp-interaction');
      const segments = q.segments;
      const distractorWords = q.distractors || [];
      const full = segments.join('');

      let order = [];
      let attempts = 0;
      let cleared = false;
      // Map inChip el → pool chip el so we can re-enable chips when clearing the answer box
      const inChipToPoolChip = new Map();

      // --- Answer box ---
      const ansBox = document.createElement('div');
      ansBox.className = 'jp-scramble-box';

      const setPlaceholder = () => {
        ansBox.innerHTML = '';
        const ph = document.createElement('span');
        ph.className = 'jp-scramble-placeholder';
        ph.innerText = 'Tap words below…';
        ansBox.appendChild(ph);
      };
      setPlaceholder();

      // --- Chip pool ---
      const pool = document.createElement('div');
      pool.className = 'jp-chip-pool';

      const allChipMeta = []; // { chip, isDistractor }

      const shuffled = [...segments, ...distractorWords].sort(() => Math.random() - 0.5);
      shuffled.forEach(word => {
        const isDistractor = distractorWords.includes(word);
        const chip = document.createElement('div');
        chip.className = 'jp-chip';
        chip.innerText = word;
        allChipMeta.push({ chip, isDistractor });

        chip.onclick = () => {
          if (chip.classList.contains('used')) return;
          const ph = ansBox.querySelector('.jp-scramble-placeholder');
          if (ph) ph.remove();

          const inChip = document.createElement('div');
          inChip.className = 'jp-chip jp-in-chip';
          inChip.innerText = word;
          inChipToPoolChip.set(inChip, chip);

          inChip.onclick = () => {
            inChip.remove();
            chip.classList.remove('used');
            const i = order.lastIndexOf(word);
            if (i !== -1) order.splice(i, 1);
            if (order.length === 0) setPlaceholder();
            ansBox.classList.remove('wrong', 'correct');
            clearColors();
            updateSubmitState();
          };

          ansBox.appendChild(inChip);
          order.push(word);
          chip.classList.add('used');
          clearColors();
          ansBox.classList.remove('wrong', 'correct');
          updateSubmitState();
        };

        pool.appendChild(chip);
      });

      // --- Helpers ---
      const updateSubmitState = () => {
        const ready = order.length === segments.length;
        submitBtn.disabled = !ready;
        submitBtn.style.opacity = ready ? '1' : '0.35';
      };

      const clearAnswerBox = () => {
        ansBox.querySelectorAll('.jp-in-chip').forEach(ic => {
          const poolChip = inChipToPoolChip.get(ic);
          if (poolChip) poolChip.classList.remove('used');
        });
        order = [];
        setPlaceholder();
        ansBox.classList.remove('wrong', 'correct');
        updateSubmitState();
      };

      // --- Color helpers ---
      const clearColors = () => {
        ansBox.querySelectorAll('.jp-in-chip').forEach(c =>
          c.classList.remove('jp-chip-correct', 'jp-chip-misplaced', 'jp-chip-wrong')
        );
      };

      const applyColors = () => {
        const inChips = Array.from(ansBox.querySelectorAll('.jp-in-chip'));
        const usedSeg = new Array(segments.length).fill(false);
        const result = new Array(order.length).fill('wrong');
        // First pass: exact position matches → green
        for (let i = 0; i < order.length; i++) {
          if (i < segments.length && order[i] === segments[i]) {
            result[i] = 'correct'; usedSeg[i] = true;
          }
        }
        // Second pass: right word, wrong spot → yellow
        for (let i = 0; i < order.length; i++) {
          if (result[i] !== 'wrong') continue;
          for (let j = 0; j < segments.length; j++) {
            if (!usedSeg[j] && order[i] === segments[j]) {
              result[i] = 'misplaced'; usedSeg[j] = true; break;
            }
          }
        }
        inChips.forEach((chip, i) => {
          chip.classList.remove('jp-chip-correct', 'jp-chip-misplaced', 'jp-chip-wrong');
          chip.classList.add('jp-chip-' + result[i]);
        });
      };

      // --- Submit button ---
      const submitBtn = document.createElement('button');
      submitBtn.className = 'jp-btn jp-btn-main jp-scramble-submit';
      submitBtn.innerText = 'Check ✓';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.35';

      submitBtn.onclick = () => {
        if (order.length !== segments.length) return;
        const isCorrect = order.join('') === full;
        attempts++;

        if (isCorrect) {
          const pts = cleared ? 0 : attempts === 1 ? 2 : attempts === 2 ? 1 : 0;
          ansBox.classList.add('correct');
          ansBox.classList.remove('wrong');
          // Lock all interaction
          allChipMeta.forEach(({ chip }) => chip.style.pointerEvents = 'none');
          ansBox.querySelectorAll('.jp-in-chip').forEach(c => c.style.pointerEvents = 'none');
          submitBtn.style.display = 'none';
          clearBtn.style.display = 'none';
          this.showScrambleFeedback(true, pts, null, q.explanation);
        } else {
          ansBox.classList.add('wrong');
          applyColors();
          if (distractorWords.length > 0) clearBtn.style.display = 'block';
        }
      };

      // --- Clear distractors button ---
      const clearBtn = document.createElement('button');
      clearBtn.className = 'jp-clear-btn';
      clearBtn.innerHTML = '🧹 Remove extra words';

      clearBtn.onclick = () => {
        cleared = true;
        clearBtn.style.display = 'none';
        clearAnswerBox();
        // Remove distractor chips from the pool entirely
        allChipMeta.forEach(({ chip, isDistractor }) => {
          if (isDistractor) chip.remove();
        });
        // Hide feedback and let them try clean
        const fb = this.el('jp-fb');
        fb.style.display = 'none';
        fb.className = 'jp-feedback';
        // Show a small notice below the pool
        const notice = document.createElement('div');
        notice.style.cssText = 'font-size:0.78rem; color:#aaa; margin-top:6px; font-style:italic;';
        notice.innerText = 'Extra words removed — max score for this question is now 0 pts.';
        clearBtn.after(notice);
      };

      box.appendChild(ansBox);
      box.appendChild(pool);
      box.appendChild(submitBtn);
      box.appendChild(clearBtn);
    },

    showScrambleFeedback: function(isCorrect, pts, errorMsg, explanation) {
      this.state.score += pts;
      this.updateUI();

      const fb = this.el('jp-fb');
      const hd = this.el('jp-fb-head');
      // The second child of jp-fb is the pre-rendered explanation div
      const exDiv = fb.children[1];

      fb.style.display = 'block';

      if (isCorrect) {
        fb.className = 'jp-feedback correct';
        const star = pts === 2 ? '⭐⭐' : pts === 1 ? '⭐' : '';
        const ptLabel = pts === 1 ? 'point' : 'points';
        hd.innerHTML = `Correct! 🎉 <span class="jp-pts-badge">${star} +${pts} ${ptLabel}</span>`;
        hd.style.color = 'var(--jp-success)';
        if (exDiv) exDiv.innerText = explanation || '';
        this.el('jp-next').style.display = 'flex';
      } else {
        fb.className = 'jp-feedback wrong';
        hd.innerText = 'Not quite — try again!';
        hd.style.color = 'var(--jp-error)';
        if (exDiv) exDiv.innerHTML = `<strong>${errorMsg || ''}</strong>`;
        // Do NOT show the Next button — student must keep trying
      }
    },

    showFeedback: function(isCorrect) {
      if(isCorrect) this.state.score++;
      this.updateUI();
      const fb = this.el('jp-fb');
      const hd = this.el('jp-fb-head');
      fb.style.display = 'block';
      fb.className = `jp-feedback ${isCorrect ? 'correct' : 'wrong'}`;
      hd.innerText = isCorrect ? "Correct! 🎉" : "Not quite...";
      hd.style.color = isCorrect ? "var(--jp-success)" : "var(--jp-error)";
      this.el('jp-next').style.display = 'flex';
    },

    next: function() {
      this.state.idx++;
      this.renderQ();
    },

    renderEnd: function() {
      this.el('jp-progress').style.width = "100%";
      const maxScore = this.state.maxScore || this.state.questions.filter(q => q.isScorable).length;
      const pct = maxScore > 0 ? Math.round((this.state.score / maxScore) * 100) : 100;
      const rank = [...SCORE_RANKS].reverse().find(r => pct >= r.min) || SCORE_RANKS[0];

      // Save top score to localStorage
      const reviewName = this.config._reviewId || this.config.path.replace(/.*\//, '').replace('.json', '');
      const prevBest = window.JPShared.progress.getReviewScore(reviewName);
      const isNewBest = prevBest === undefined || pct > prevBest;
      if (isNewBest) {
        window.JPShared.progress.setReviewScore(reviewName, pct);
      }

      let bestHtml = '';
      if (isNewBest && prevBest !== undefined) {
        bestHtml = `<div style="color:var(--jp-success); font-weight:700; margin:10px 0;">New Personal Best! (Previous: ${prevBest}%)</div>`;
      } else if (isNewBest) {
        bestHtml = `<div style="color:var(--jp-success); font-weight:700; margin:10px 0;">Score Recorded!</div>`;
      } else {
        bestHtml = `<div style="color:#888; margin:10px 0;">Personal Best: ${prevBest}%</div>`;
      }

      const stage = this.el('jp-stage');
      stage.innerHTML = `
        <div style="text-align:center; padding:30px 0 20px; animation: jpFadeIn 0.5s; position:relative;">
          <div style="font-size:0.8rem; font-weight:700; color:#aaa; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">Your Rank</div>
          <div style="font-size:3rem; font-weight:900; color:${rank.colors[0]}; line-height:1.1;">${rank.msg}</div>
          <div style="font-size:1rem; color:#747d8c; font-weight:600; margin:6px 0 14px;">${rank.sub}</div>
          <div style="font-size:4rem; font-weight:900; color:var(--jp-primary);">${pct}%</div>
          ${bestHtml}
          <p>You scored ${this.state.score} / ${maxScore} points</p>
          <button class="jp-btn jp-btn-main" onclick="ReviewModule.startQuiz()">Try Again</button>
          <br>
          <button class="jp-btn" onclick="ReviewModule.fetchReviewList()" style="margin-top:10px;">Back to Reviews</button>
        </div>
      `;
      launchHanabi(rank, stage);
    },

    updateUI: function() {
      this.el('jp-score').innerText = this.state.score;
    }
  };
})();
