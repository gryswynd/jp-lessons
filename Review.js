(function() {
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
      const scores = JSON.parse(localStorage.getItem('k-review-scores') || '{}');
      const stage = document.getElementById('jp-stage');

      let html = '<div class="jp-review-menu-grid">';
      reviews.forEach(review => {
        const topScore = scores[review.id];
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
      termMap: {},
      conjugations: null
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
        const glossaryUrl = this.getUrl(manifest.globalFiles.glossaryMaster);
        const conjUrl = this.getUrl(manifest.globalFiles.conjugationRules);

        console.log('[Review] Quiz URL:', quizUrl);
        console.log('[Review] Glossary URL:', glossaryUrl);
        console.log('[Review] Conjugation URL:', conjUrl);

        // 1. Fetch Quiz Data + Glossary + Conjugations in parallel
        const [quizRes, glossRes, conjRes] = await Promise.all([
            fetch(quizUrl),
            fetch(glossaryUrl),
            fetch(conjUrl)
        ]);

        console.log('[Review] Fetch responses:', {
          quiz: quizRes.ok,
          glossary: glossRes.ok,
          conjugations: conjRes.ok
        });

        if (!quizRes.ok || !glossRes.ok || !conjRes.ok) {
          throw new Error(`Failed to fetch resources: Quiz(${quizRes.status}) Glossary(${glossRes.status}) Conjugations(${conjRes.status})`);
        }

        console.log('[Review] Parsing JSON...');
        const quizData = await quizRes.json();
        const glossData = await glossRes.json();
        this.state.conjugations = await conjRes.json();

        console.log('[Review] Quiz title:', quizData.title);
        console.log('[Review] Glossary entries:', glossData.length);

        // 2. Map Glossary
        this.state.termMap = {};
        glossData.forEach(i => { this.state.termMap[i.id] = i; });

        // 3. Inject Styles & Modal
        console.log('[Review] Injecting styles...');
        this.injectStyles();
        console.log('[Review] Injecting modal...');
        this.injectModal();

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
                margin-bottom: 20px;
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                align-items: center;
            }
            .jp-scramble-box.correct { border-color: var(--jp-success); background: rgba(0,184,148,0.05); }
            .jp-scramble-box.wrong { border-color: var(--jp-error); background: rgba(214,48,49,0.05); }
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

            /* Modal Styling */
            .jp-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 999999; display: none; align-items: center; justify-content: center; }
            .jp-modal { background: #fff; width: 85%; max-width: 400px; border-radius: 20px; padding: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); position: relative; text-align: center; font-family: 'Poppins', sans-serif; }
            .jp-close-btn { position: absolute; top: 15px; right: 15px; background: #f1f2f6; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; }
            .jp-auto-flag-msg { margin-top: 15px; background: #d4edda; color: #155724; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; display: inline-block; }

            /* Animations */
            @keyframes jpFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
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

    injectModal: function() {
        if(document.querySelector('.jp-modal-overlay')) return;
        const div = document.createElement('div');
        div.className = 'jp-modal-overlay';
        div.innerHTML = `
          <div class="jp-modal">
            <button class="jp-close-btn" onclick="document.querySelector('.jp-modal-overlay').style.display='none'">✕</button>
            <h2 id="jp-m-title" style="margin:0 0 5px 0; color:#4e54c8; font-size:2rem;"></h2>
            <div id="jp-m-meta" style="color:#747d8c; font-weight:700; margin-bottom:15px;"></div>
            <div id="jp-m-notes" style="line-height:1.5; margin-bottom:15px; font-size:0.95rem; color:#2d3436;"></div>
            <div class="jp-auto-flag-msg">✅ Added to Practice Queue</div>
          </div>
        `;
        document.body.appendChild(div);
        div.onclick = (e) => { if(e.target === div) div.style.display = 'none'; };

        // Expose global opener
        window.JP_OPEN_TERM = (id, enableFlag = true) => this.openTerm(id, enableFlag);
    },

    // --- TERM & FLAGGING LOGIC ---

    flagTerm: function(termId) {
        const rootTerm = window.JPShared.textProcessor.getRootTerm(termId, this.state.termMap);
        if (!rootTerm) return false;

        const flags = JSON.parse(localStorage.getItem('k-flags') || '{}');
        const active = JSON.parse(localStorage.getItem('k-active-flags') || '{}');
        const key = rootTerm.surface; // Flag by Kanji/Surface

        flags[key] = (flags[key] || 0) + 1;
        active[key] = true;

        localStorage.setItem('k-flags', JSON.stringify(flags));
        localStorage.setItem('k-active-flags', JSON.stringify(active));
        return true;
    },

    openTerm: function(id, enableFlag) {
        const t = this.state.termMap[id];
        if (!t) return;

        // Populate Modal
        document.getElementById('jp-m-title').innerHTML = t.surface;
        document.getElementById('jp-m-meta').innerText = t.reading + (t.meaning ? ` • ${t.meaning.replace(/<[^>]*>/g, '')}` : "");
        document.getElementById('jp-m-notes').innerText = t.notes || "";

        // Handle Flagging
        const msgBox = document.querySelector('.jp-auto-flag-msg');
        if (enableFlag) {
            this.flagTerm(id);
            if(msgBox) msgBox.style.display = 'inline-block';
        } else {
            if(msgBox) msgBox.style.display = 'none';
        }

        document.querySelector('.jp-modal-overlay').style.display = 'flex';
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
              <div class="jp-convo-text">${window.JPShared.textProcessor.processText(line.jp, line.terms, this.state.termMap, this.state.conjugations)}</div>
              </div>
          `;
        });
        html += `</div>`;
      }
      // Reading Passage Render
      else if (q.type === 'reading_mcq') {
        html += `<div class="jp-passage">`;
        q.passage.forEach(p => {
            html += `<div style="margin-bottom:12px; font-size:1.1rem; line-height:1.6;">${window.JPShared.textProcessor.processText(p.jp, p.terms, this.state.termMap, this.state.conjugations)}</div>`;
        });
        html += `</div>`;
      }

      // Question Text (Processed for highlighting)
      const qText = window.JPShared.textProcessor.processText(q.q, q.terms, this.state.termMap, this.state.conjugations).replace(/\[(.*?)\]/g, '<span class="jp-highlight">$1</span>');
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
      // (Scramble Logic - Keeping strict logic, flagging hard to determine here so omitted for simplicity)
      const box = this.el('jp-interaction');
      const ansBox = document.createElement('div');
      ansBox.className = 'jp-scramble-box';
      ansBox.innerText = "Tap words below...";
      ansBox.style.color = "#aaa";

      const pool = document.createElement('div');
      pool.style.display = 'flex'; pool.style.gap = '8px'; pool.style.flexWrap = 'wrap';

      let order = [];
      const full = q.segments.join('');
      const chips = [...q.segments].sort(() => Math.random() - 0.5);

      chips.forEach(word => {
        const chip = document.createElement('div');
        chip.className = 'jp-chip';
        chip.innerText = word;
        chip.onclick = () => {
          if(chip.classList.contains('used')) return;
          if(order.length === 0) { ansBox.innerText = ""; ansBox.style.color = "inherit"; }

          const inChip = document.createElement('div');
          inChip.className = 'jp-chip'; inChip.innerText = word;
          inChip.style.border = "none"; inChip.style.background="transparent"; inChip.style.padding="0";
          inChip.onclick = () => {
             inChip.remove(); chip.classList.remove('used');
             order.splice(order.indexOf(word), 1);
             if(order.length===0) { ansBox.innerText="Tap words below..."; ansBox.style.color="#aaa"; }
             ansBox.classList.remove('wrong');
          };

          ansBox.appendChild(inChip);
          order.push(word);
          chip.classList.add('used');

          if(order.join('') === full) {
            ansBox.classList.add('correct');
            ansBox.classList.remove('wrong');
            Array.from(pool.children).forEach(c => c.style.pointerEvents = 'none');
            Array.from(ansBox.children).forEach(c => c.style.pointerEvents = 'none');
            this.showFeedback(true);
          } else if (order.length === q.segments.length) {
            ansBox.classList.add('wrong');
          }
        };
        pool.appendChild(chip);
      });

      box.appendChild(ansBox);
      box.appendChild(pool);
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
      const scorableCount = this.state.questions.filter(q => q.isScorable).length;
      const pct = scorableCount > 0 ? Math.round((this.state.score / scorableCount) * 100) : 100;
      let msg = pct > 80 ? "Excellent Work! 🏆" : "Keep Practicing! 💪";

      // Save top score to localStorage
      const reviewName = this.config._reviewId || this.config.path.replace(/.*\//, '').replace('.json', '');
      const scores = JSON.parse(localStorage.getItem('k-review-scores') || '{}');
      const prevBest = scores[reviewName];
      const isNewBest = prevBest === undefined || pct > prevBest;
      if (isNewBest) {
        scores[reviewName] = pct;
        localStorage.setItem('k-review-scores', JSON.stringify(scores));
      }

      let bestHtml = '';
      if (isNewBest && prevBest !== undefined) {
        bestHtml = `<div style="color:var(--jp-success); font-weight:700; margin:10px 0;">New Personal Best! (Previous: ${prevBest}%)</div>`;
      } else if (isNewBest) {
        bestHtml = `<div style="color:var(--jp-success); font-weight:700; margin:10px 0;">Score Recorded!</div>`;
      } else {
        bestHtml = `<div style="color:#888; margin:10px 0;">Personal Best: ${prevBest}%</div>`;
      }

      this.el('jp-stage').innerHTML = `
        <div style="text-align:center; padding:40px 0; animation: jpFadeIn 0.5s;">
          <div style="font-size:4rem; font-weight:900; color:var(--jp-primary);">${pct}%</div>
          <div style="font-size:1.2rem; color:#666; margin-bottom:5px;">${msg}</div>
          ${bestHtml}
          <p>You scored ${this.state.score} / ${scorableCount}</p>
          <button class="jp-btn jp-btn-main" onclick="ReviewModule.startQuiz()">Try Again</button>
          <br>
          <button class="jp-btn" onclick="ReviewModule.fetchReviewList()" style="margin-top:10px;">Back to Reviews</button>
        </div>
      `;
    },

    updateUI: function() {
      this.el('jp-score').innerText = this.state.score;
    }
  };
})();
