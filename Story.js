window.StoryModule = (function() {
  'use strict';

  let container = null;
  let config = null;
  let onExit = null;
  let currentStory = null;
  let storyList = [];
  let currentIndex = 0;
  let termMapData = {};
  let showFurigana = false; // Initially OFF

  function getCdnUrl(filename) {
    return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.path ? config.path + '/' : ''}${filename}`;
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
        .jp-story-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .jp-story-nav {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .jp-story-nav-btn, .jp-story-back-btn, .jp-story-toggle-btn {
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
        .jp-story-nav-btn:hover, .jp-story-back-btn:hover, .jp-story-toggle-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .jp-story-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .jp-story-toggle-btn.active {
          background: rgba(255,255,255,0.3);
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
        }
        .jp-story-content ruby {
          font-size: 1.2rem;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .jp-story-content rt {
          font-size: 0.6em;
          color: #666;
          display: none; /* Initially hidden */
        }
        .jp-story-content.show-furigana rt {
          display: inline; /* Show when toggle is on */
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
          .jp-story-controls {
            justify-content: center;
          }
          .jp-story-nav {
            justify-content: center;
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
          <div class="jp-story-controls">
            <button class="jp-story-toggle-btn" id="jp-story-furigana-toggle">ふりがな OFF</button>
            <div class="jp-story-nav">
              <button class="jp-story-nav-btn" id="jp-story-prev">← Previous</button>
              <button class="jp-story-nav-btn" id="jp-story-next">Next →</button>
              <button class="jp-story-back-btn" id="jp-story-exit">← Back to Menu</button>
            </div>
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

    document.getElementById('jp-story-furigana-toggle').addEventListener('click', () => {
      showFurigana = !showFurigana;
      updateFuriganaToggle();
    });

    // Load marked.js and glossary from CDN
    Promise.all([
      loadMarkedJS(),
      loadGlossary()
    ]).then(() => {
      loadStoryList();
    }).catch(err => {
      showError('Failed to load resources: ' + err.message);
    });
  }

  function loadMarkedJS() {
    return new Promise((resolve, reject) => {
      // Check if marked is already loaded
      if (window.marked) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js';
      script.onload = () => {
        if (window.marked) {
          // Configure marked for better compatibility
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

  async function loadGlossary() {
    try {
      const url = getCdnUrl('glossary.master.json');
      const response = await fetch(url + '?t=' + Date.now());
      if (!response.ok) throw new Error('Failed to load glossary');
      const glossary = await response.json();

      // Build term map
      termMapData = {};
      glossary.forEach(term => {
        termMapData[term.id] = term;
      });

      // Setup term modal if not already setup
      setupTermModal();
    } catch (err) {
      console.warn('Could not load glossary:', err);
      // Continue without glossary
    }
  }

  function setupTermModal() {
    // Check if modal already exists
    if (window.JP_OPEN_TERM) return;

    // Create modal overlay
    let modalOverlay = document.querySelector('.jp-modal-overlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.className = 'jp-modal-overlay';
      modalOverlay.innerHTML = `
        <div class="jp-modal">
          <button class="jp-close-btn">✕</button>
          <div id="jp-modal-content"></div>
        </div>
      `;
      document.body.appendChild(modalOverlay);

      // Add modal styles if not present
      if (!document.getElementById('jp-modal-style')) {
        const style = document.createElement('style');
        style.id = 'jp-modal-style';
        style.textContent = `
          .jp-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(4px);
            z-index: 999999;
            display: none;
            align-items: center;
            justify-content: center;
          }
          .jp-modal {
            background: #fff;
            width: 85%;
            max-width: 400px;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.25);
            position: relative;
            text-align: center;
          }
          .jp-close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            background: #f1f2f6;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
          }
          .jp-auto-flag-msg {
            margin-top: 15px;
            background: #d4edda;
            color: #155724;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.85rem;
            display: none;
          }
        `;
        document.head.appendChild(style);
      }

      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          modalOverlay.style.display = 'none';
        }
      });

      modalOverlay.querySelector('.jp-close-btn').addEventListener('click', () => {
        modalOverlay.style.display = 'none';
      });
    }

    // Setup global term opening function
    window.JP_OPEN_TERM = function(id, enableFlag = true) {
      const t = termMapData[id];
      if (!t) return;

      const textToSpeak = t.reading || t.surface;

      const titleHtml = `
        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
          <span>${t.surface}</span>
          <button id="jp-m-speak-btn" style="background:none; border:none; cursor:pointer; font-size:1.5rem; opacity:0.8;">🔊</button>
        </div>
      `;

      const meaningHtml = `<div style="color:#667eea; font-size:0.9rem; margin-bottom:10px;">${t.reading || ''}</div>
        <div style="color:#333; font-weight:600; font-size:1.1rem;">${t.meaning || ''}</div>`;

      const notesHtml = t.notes ? `<div style="margin-top:15px; background:#f8f9fa; padding:12px; border-radius:10px; font-size:0.85rem; color:#555; text-align:left;">${t.notes}</div>` : '';

      const modalContent = document.getElementById('jp-modal-content');
      modalContent.innerHTML = `
        ${titleHtml}
        ${meaningHtml}
        ${notesHtml}
        <div class="jp-auto-flag-msg" id="jp-flag-msg">✓ Added to Review</div>
      `;

      modalOverlay.style.display = 'flex';

      // Speaker button
      const speakerBtn = document.getElementById('jp-m-speak-btn');
      if (speakerBtn) {
        speakerBtn.onclick = () => speak(textToSpeak);
      }

      // Auto-flag
      if (enableFlag) {
        const flags = JSON.parse(localStorage.getItem('k-flags') || '{}');
        if (!flags[id]) {
          flags[id] = true;
          localStorage.setItem('k-flags', JSON.stringify(flags));
          const activeFlags = JSON.parse(localStorage.getItem('k-active-flags') || '{}');
          activeFlags[id] = true;
          localStorage.setItem('k-active-flags', JSON.stringify(activeFlags));

          const flagMsg = document.getElementById('jp-flag-msg');
          if (flagMsg) {
            flagMsg.style.display = 'block';
            setTimeout(() => { flagMsg.style.display = 'none'; }, 2000);
          }
        }
      }
    };
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
  }

  function loadStoryList() {
    // Define available stories
    storyList = [
      { filename: 'library-book.md', title: '図書館の本', subtitle: 'The Library Book' }
    ];

    if (storyList.length > 0) {
      loadStory(storyList[0]);
    } else {
      showError('No stories available');
    }
  }

  async function loadStory(storyInfo) {
    const storyContainer = container.querySelector('.jp-story-container');

    // Show loading state
    const contentArea = storyContainer.querySelector('.jp-story-loading') ||
                        storyContainer.querySelector('.jp-story-content') ||
                        storyContainer.querySelector('.jp-story-error');

    if (contentArea) {
      contentArea.outerHTML = `
        <div class="jp-story-loading">
          <div class="jp-story-loading-spinner"></div>
          <div>Loading ${storyInfo.title}...</div>
        </div>
      `;
    }

    updateNavButtons();

    try {
      const url = getCdnUrl(storyInfo.filename);
      const response = await fetch(url + '?t=' + Date.now());

      if (!response.ok) {
        throw new Error(`Failed to load story: ${response.status} ${response.statusText}`);
      }

      const markdown = await response.text();
      let html = marked.parse(markdown);

      // Process HTML to make Japanese terms clickable
      html = processStoryHTML(html);

      const loading = storyContainer.querySelector('.jp-story-loading');
      if (loading) {
        loading.outerHTML = `
          <div class="jp-story-content ${showFurigana ? 'show-furigana' : ''}">
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

  function processStoryHTML(html) {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Find all text nodes and make Japanese terms clickable
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const nodesToReplace = [];
    let node;

    while (node = walker.nextNode()) {
      // Skip if parent is already a term span or is inside a ruby tag
      if (node.parentElement.classList.contains('jp-term') ||
          node.parentElement.tagName === 'RT' ||
          node.parentElement.tagName === 'CODE' ||
          node.parentElement.tagName === 'PRE') {
        continue;
      }

      const text = node.textContent;
      if (!text.trim()) continue;

      // Try to find terms in this text
      const matches = findTermsInText(text);
      if (matches.length > 0) {
        nodesToReplace.push({ node, matches });
      }
    }

    // Replace nodes with clickable terms
    nodesToReplace.forEach(({ node, matches }) => {
      const span = document.createElement('span');
      let lastIndex = 0;
      let html = '';

      matches.forEach(match => {
        // Add text before match
        html += escapeHtml(node.textContent.substring(lastIndex, match.index));
        // Add clickable term
        html += `<span class="jp-term" onclick="window.JP_OPEN_TERM('${match.termId}', true)">${escapeHtml(match.text)}</span>`;
        lastIndex = match.index + match.text.length;
      });

      // Add remaining text
      html += escapeHtml(node.textContent.substring(lastIndex));

      span.innerHTML = html;
      node.parentElement.replaceChild(span, node);
    });

    return tempDiv.innerHTML;
  }

  function findTermsInText(text) {
    const matches = [];

    // Sort terms by surface length (longest first) to match longer terms first
    const sortedTerms = Object.values(termMapData).sort((a, b) =>
      (b.surface || '').length - (a.surface || '').length
    );

    sortedTerms.forEach(term => {
      if (!term.surface) return;

      let index = text.indexOf(term.surface);
      while (index !== -1) {
        // Check if this position is already matched
        const overlaps = matches.some(m =>
          (index >= m.index && index < m.index + m.text.length) ||
          (index + term.surface.length > m.index && index + term.surface.length <= m.index + m.text.length)
        );

        if (!overlaps) {
          matches.push({
            index,
            text: term.surface,
            termId: term.id
          });
        }

        index = text.indexOf(term.surface, index + 1);
      }
    });

    // Sort matches by index
    return matches.sort((a, b) => a.index - b.index);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function updateFuriganaToggle() {
    const toggleBtn = document.getElementById('jp-story-furigana-toggle');
    const contentDiv = container.querySelector('.jp-story-content');

    if (toggleBtn) {
      toggleBtn.textContent = showFurigana ? 'ふりがな ON' : 'ふりがな OFF';
      toggleBtn.classList.toggle('active', showFurigana);
    }

    if (contentDiv) {
      if (showFurigana) {
        contentDiv.classList.add('show-furigana');
      } else {
        contentDiv.classList.remove('show-furigana');
      }
    }
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
