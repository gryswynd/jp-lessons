window.StoryModule = (function() {
  'use strict';

  let container = null;
  let config = null;
  let onExit = null;
  let currentStory = null;
  let storyList = [];
  let currentIndex = 0;
  let termMapData = {};
  let autoSurfaceMap = {}; // glossary surface → { id } for automatic matching
  let CONJUGATION_RULES = null;

  function getCdnUrl(filepath) {
    return window.getAssetUrl(config, filepath);
  }

  function start(containerElement, repoConfig, exitCallback) {
    container = containerElement;
    config = repoConfig;
    onExit = exitCallback;

    initializeStoryModule();
  }

  function initializeStoryModule() {
    // --- Styles ---
    const styleId = 'jp-story-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .jp-story-container {
          font-family: 'Poppins', 'Noto Sans JP', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          overflow: hidden;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          position: relative;
          min-height: 600px;
        }
        .jp-story-header {
          background: rgba(0,0,0,0.5);
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .jp-story-title {
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .jp-story-nav {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .jp-story-nav-btn, .jp-story-back-btn {
          background: rgba(255,255,255,0.1);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
          font-size: 14px;
        }
        .jp-story-nav-btn:hover, .jp-story-back-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .jp-story-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .jp-story-content {
          background: white;
          padding: 40px;
          margin: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }
        .jp-story-content h1 {
          color: #667eea;
          font-size: 2rem;
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }
        .jp-story-content h2 {
          color: #764ba2;
          font-size: 1.4rem;
          margin-top: 0;
          margin-bottom: 2rem;
          font-weight: 600;
        }
        .jp-story-content h3 {
          color: #667eea;
          font-size: 1.2rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
          border-bottom: 2px solid #667eea;
          padding-bottom: 0.5rem;
        }
        .jp-story-content hr {
          border: none;
          border-top: 2px solid #e0e0e0;
          margin: 2rem 0;
        }
        .jp-story-content p {
          font-size: 1.1rem;
          line-height: 2;
          margin-bottom: 1rem;
          color: #333;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .jp-story-content ul, .jp-story-content ol {
          line-height: 1.8;
          margin-bottom: 1rem;
          padding-left: 2rem;
        }
        .jp-story-content li {
          margin-bottom: 0.5rem;
          color: #333;
        }
        .jp-story-content strong {
          color: #667eea;
          font-weight: 700;
        }
        .jp-story-content em {
          color: #764ba2;
          font-style: italic;
        }
        .jp-story-content code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.9em;
        }
        .jp-story-content pre {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 6px;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .jp-story-content pre code {
          background: none;
          padding: 0;
        }
        .jp-term {
          color: #667eea;
          font-weight: 700;
          cursor: pointer;
          border-bottom: 2px solid rgba(102,126,234,0.2);
          transition: 0.2s;
        }
        .jp-term:hover {
          background: rgba(102,126,234,0.1);
          border-bottom-color: #667eea;
        }
        .jp-story-loading {
          text-align: center;
          padding: 60px 20px;
          color: white;
        }
        .jp-story-loading-spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .jp-story-error {
          background: #ff5252;
          color: white;
          padding: 20px;
          margin: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .jp-story-selector {
          background: white;
          padding: 30px;
          margin: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .jp-story-selector h2 {
          color: #667eea;
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0 0 5px 0;
        }
        .jp-story-selector > p {
          color: #888;
          font-size: 0.9rem;
          margin: 0 0 20px 0;
        }
        .jp-story-selector-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .jp-story-card {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
          padding: 24px 16px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid transparent;
          text-align: center;
        }
        .jp-story-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          border-color: #667eea;
        }
        .jp-story-level-badge {
          display: inline-block;
          background: #667eea;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 10px;
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }
        .jp-story-card-jp {
          font-size: 1.3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 6px;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .jp-story-card-en {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 16px;
        }
        .jp-story-card-read-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          pointer-events: none;
          transition: background 0.2s;
        }
        .jp-story-card:hover .jp-story-card-read-btn {
          background: #5a6fd6;
        }
        @media (max-width: 600px) {
          .jp-story-content {
            padding: 20px;
            margin: 10px;
          }
          .jp-story-content h1 {
            font-size: 1.5rem;
          }
          .jp-story-content h2 {
            font-size: 1.2rem;
          }
          .jp-story-header {
            flex-direction: column;
            align-items: stretch;
          }
          .jp-story-nav {
            justify-content: center;
          }
          .jp-story-selector {
            padding: 20px;
            margin: 10px;
          }
          .jp-story-selector-grid {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // --- HTML Structure ---
    container.innerHTML = `
      <div class="jp-story-container">
        <div class="jp-story-header">
          <div class="jp-story-title">📖 Stories</div>
          <div class="jp-story-nav">
            <button class="jp-story-nav-btn" id="jp-story-list" style="display:none;">☰ All Stories</button>
            <button class="jp-story-nav-btn" id="jp-story-prev" style="display:none;">← Previous</button>
            <button class="jp-story-nav-btn" id="jp-story-next" style="display:none;">Next →</button>
            <button class="jp-story-back-btn" id="jp-story-exit">← Back to Menu</button>
          </div>
        </div>
        <div class="jp-story-loading">
          <div class="jp-story-loading-spinner"></div>
          <div>Loading stories...</div>
        </div>
      </div>
    `;

    document.getElementById('jp-story-exit').addEventListener('click', () => {
      if (onExit) onExit();
    });

    document.getElementById('jp-story-prev').addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        loadStory(storyList[currentIndex]);
      }
    });

    document.getElementById('jp-story-next').addEventListener('click', () => {
      if (currentIndex < storyList.length - 1) {
        currentIndex++;
        loadStory(storyList[currentIndex]);
      }
    });

    document.getElementById('jp-story-list').addEventListener('click', () => {
      showStorySelector();
    });

    // Load resources
    Promise.all([
      loadMarkedJS(),
      loadResources()
    ]).then(() => {
      loadStoryList();
    }).catch(err => {
      showError('Failed to load resources: ' + err.message);
    });
  }

  function loadMarkedJS() {
    return new Promise((resolve, reject) => {
      if (window.marked) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js';
      script.onload = () => {
        if (window.marked) {
          marked.setOptions({
            gfm: true,
            breaks: true
          });
          resolve();
        } else {
          reject(new Error('marked library not available'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load marked.js'));
      document.head.appendChild(script);
    });
  }

  async function loadResources() {
    try {
      const manifest = await window.getManifest(config);
      const glossaryUrl = getCdnUrl(manifest.globalFiles.glossaryMaster);
      const conjUrl = getCdnUrl(manifest.globalFiles.conjugationRules);
      console.log('[Story] Glossary URL:', glossaryUrl);
      console.log('[Story] Conjugation URL:', conjUrl);
      const [glossary, conjugationRules] = await Promise.all([
        fetch(glossaryUrl).then(r => r.json()),
        fetch(conjUrl).then(r => r.json())
      ]);

      // Build term map (id → term, for modal lookups)
      termMapData = {};
      autoSurfaceMap = {};
      glossary.entries.forEach(term => {
        termMapData[term.id] = term;
        // Auto-surface map: surface form → id (for automatic highlighting)
        if (term.surface) {
          autoSurfaceMap[term.surface] = { id: term.id, form: null };
        }
      });

      CONJUGATION_RULES = conjugationRules;

      // Setup term modal
      window.JPShared.termModal.setTermMap(termMapData);
      window.JPShared.termModal.inject();
      // Story.js flags by term ID (boolean, flag-once) rather than the
      // default count-based surface flagging used by Lesson/Review.
      // The message auto-hides after 2s and is suppressed if already flagged.
      window.JP_OPEN_TERM = function(id, enableFlag) {
        window.JPShared.termModal.open(id, {
          enableFlag: !!enableFlag,
          onFlag: function(termId, msgBox) {
            if (!window.JPShared.progress.getFlagCount(termId)) {
              window.JPShared.progress.flagTerm(termId);
              if (msgBox) {
                msgBox.style.display = 'block';
                setTimeout(function() { msgBox.style.display = 'none'; }, 2000);
              }
            } else if (msgBox) {
              msgBox.style.display = 'none'; // already flagged — suppress
            }
          }
        });
      };
    } catch (err) {
      console.warn('Could not load glossary/conjugation:', err);
    }
  }

  async function loadStoryList() {
    try {
      const manifest = await window.getManifest(config);

      storyList = [];
      const levels = manifest.levels || [];
      levels.forEach(level => {
        const levelData = manifest.data && manifest.data[level];
        if (!levelData || !levelData.stories) return;
        levelData.stories.forEach(story => {
          storyList.push({
            dir: story.dir,
            mdFile: story.dir + '/story.md',
            jsonFile: story.dir + '/terms.json',
            title: story.titleJp || story.title,
            subtitle: story.title,
            level: level
          });
        });
      });

      console.log('[Story] Found', storyList.length, 'stories from manifest');
      if (storyList.length > 0) {
        showStorySelector();
      } else {
        showError('No stories available');
      }
    } catch (err) {
      showError('Failed to load story list: ' + err.message);
    }
  }

  function showStorySelector() {
    const storyContainer = container.querySelector('.jp-story-container');
    const contentArea = storyContainer.querySelector('.jp-story-loading') ||
                        storyContainer.querySelector('.jp-story-content') ||
                        storyContainer.querySelector('.jp-story-selector') ||
                        storyContainer.querySelector('.jp-story-error');

    const titleEl = storyContainer.querySelector('.jp-story-title');
    if (titleEl) titleEl.textContent = '📖 Stories';

    const listBtn = document.getElementById('jp-story-list');
    const prevBtn = document.getElementById('jp-story-prev');
    const nextBtn = document.getElementById('jp-story-next');
    if (listBtn) listBtn.style.display = 'none';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';

    const storyCount = storyList.length;
    const countLabel = storyCount === 1 ? '1 story available' : `${storyCount} stories available`;

    const cardsHtml = storyList.map((story, index) => `
      <div class="jp-story-card" data-story-index="${index}">
        <div class="jp-story-level-badge">${story.level}</div>
        <div class="jp-story-card-jp">${story.title}</div>
        <div class="jp-story-card-en">${story.subtitle}</div>
        <button class="jp-story-card-read-btn">Read →</button>
      </div>
    `).join('');

    if (contentArea) {
      contentArea.outerHTML = `
        <div class="jp-story-selector">
          <h2>Choose a Story</h2>
          <p>${countLabel}</p>
          <div class="jp-story-selector-grid">
            ${cardsHtml}
          </div>
        </div>
      `;
    }

    storyContainer.querySelectorAll('.jp-story-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.storyIndex, 10);
        currentIndex = index;
        loadStory(storyList[index]);
      });
    });
  }

  async function loadStory(storyInfo) {
    const storyContainer = container.querySelector('.jp-story-container');

    const contentArea = storyContainer.querySelector('.jp-story-loading') ||
                        storyContainer.querySelector('.jp-story-content') ||
                        storyContainer.querySelector('.jp-story-selector') ||
                        storyContainer.querySelector('.jp-story-error');

    if (contentArea) {
      contentArea.outerHTML = `
        <div class="jp-story-loading">
          <div class="jp-story-loading-spinner"></div>
          <div>Loading ${storyInfo.title}...</div>
        </div>
      `;
    }

    // Update header title and reveal nav buttons (may be hidden when coming from selector)
    const titleEl = storyContainer.querySelector('.jp-story-title');
    if (titleEl) titleEl.textContent = storyInfo.title;

    const listBtn = document.getElementById('jp-story-list');
    const prevBtn = document.getElementById('jp-story-prev');
    const nextBtn = document.getElementById('jp-story-next');
    if (listBtn) listBtn.style.display = '';
    if (prevBtn) prevBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = '';

    updateNavButtons();

    try {
      // Load both markdown and companion JSON
      const mdUrl = getCdnUrl(storyInfo.mdFile);
      const jsonUrl = getCdnUrl(storyInfo.jsonFile);
      console.log('[Story] Markdown URL:', mdUrl);
      console.log('[Story] Terms URL:', jsonUrl);
      const [mdResponse, jsonResponse] = await Promise.all([
        fetch(mdUrl + '?t=' + Date.now()),
        fetch(jsonUrl + '?t=' + Date.now())
      ]);

      if (!mdResponse.ok) {
        throw new Error(`Failed to load story markdown: ${mdResponse.status}`);
      }
      if (!jsonResponse.ok) {
        throw new Error(`Failed to load story data: ${jsonResponse.status}`);
      }

      const markdown = await mdResponse.text();
      const storyData = await jsonResponse.json();

      // Parse markdown to HTML
      let html = marked.parse(markdown);

      // Process HTML with term mappings from JSON
      html = processStoryHTML(html, storyData.terms);

      const loading = storyContainer.querySelector('.jp-story-loading');
      if (loading) {
        loading.outerHTML = `
          <div class="jp-story-content">
            ${html}
          </div>
        `;
      }

      currentStory = storyInfo;

      const contentDiv = storyContainer.querySelector('.jp-story-content');
      if (contentDiv) {
        contentDiv.scrollTop = 0;
      }

    } catch (err) {
      showError(`Failed to load story: ${err.message}`);
    }
  }

  function processStoryHTML(html, termMappings) {
    // termMappings = { "行きました": { id: "v.iku", form: "polite_past" }, ... }
    // Merge once: auto-map from glossary surfaces + explicit overrides (terms.json wins)
    const mergedMappings = Object.assign({}, autoSurfaceMap, termMappings);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const nodesToReplace = [];
    let node;

    while (node = walker.nextNode()) {
      // Skip if already inside a term span or code block
      if (node.parentElement.classList.contains('jp-term') ||
          node.parentElement.tagName === 'CODE' ||
          node.parentElement.tagName === 'PRE') {
        continue;
      }

      const text = node.textContent;
      if (!text.trim()) continue;

      const matches = findTermsInText(text, mergedMappings);
      if (matches.length > 0) {
        nodesToReplace.push({ node, matches });
      }
    }

    // Replace text nodes with clickable terms
    nodesToReplace.forEach(({ node, matches }) => {
      const span = document.createElement('span');
      let lastIndex = 0;
      let html = '';

      matches.forEach(match => {
        // Add text before match
        html += escapeHtml(node.textContent.substring(lastIndex, match.index));
        // Add clickable term
        html += `<span class="jp-term" onclick="window.JP_OPEN_TERM('${match.termId}', ${JSON.stringify(match.form)}, true)">${escapeHtml(match.text)}</span>`;
        lastIndex = match.index + match.text.length;
      });

      // Add remaining text
      html += escapeHtml(node.textContent.substring(lastIndex));

      span.innerHTML = html;
      node.parentElement.replaceChild(span, node);
    });

    return tempDiv.innerHTML;
  }

  function findTermsInText(text, termMappings) {
    const matches = [];
    const processedPositions = new Set();

    // Get all surface forms from termMappings, sorted by length (longest first)
    const surfaceForms = Object.keys(termMappings).sort((a, b) => b.length - a.length);

    surfaceForms.forEach(surface => {
      const termDef = termMappings[surface]; // { id: "v.iku", form: "polite_past" }

      let index = text.indexOf(surface);
      while (index !== -1) {
        // Check if this position overlaps with existing match
        let overlaps = false;
        for (let i = index; i < index + surface.length; i++) {
          if (processedPositions.has(i)) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          matches.push({
            index,
            text: surface,
            termId: termDef.id,
            form: termDef.form || null
          });

          // Mark positions as processed
          for (let i = index; i < index + surface.length; i++) {
            processedPositions.add(i);
          }
        }

        index = text.indexOf(surface, index + 1);
      }
    });

    return matches.sort((a, b) => a.index - b.index);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function updateNavButtons() {
    const prevBtn = document.getElementById('jp-story-prev');
    const nextBtn = document.getElementById('jp-story-next');

    if (prevBtn) {
      prevBtn.disabled = currentIndex === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = currentIndex === storyList.length - 1 || storyList.length === 0;
    }
  }

  function showError(message) {
    const storyContainer = container.querySelector('.jp-story-container');
    const contentArea = storyContainer.querySelector('.jp-story-loading') ||
                        storyContainer.querySelector('.jp-story-content') ||
                        storyContainer.querySelector('.jp-story-selector') ||
                        storyContainer.querySelector('.jp-story-error');

    if (contentArea) {
      contentArea.outerHTML = `
        <div class="jp-story-error">
          <h2>⚠️ Error</h2>
          <p>${message}</p>
        </div>
      `;
    }
  }

  return {
    start: start
  };
})();
