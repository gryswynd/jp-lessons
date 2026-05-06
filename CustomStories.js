window.CustomStoriesModule = (function() {
  'use strict';

  let container = null;
  let config = null;
  let onExit = null;
  let currentStory = null;
  let storyList = [];
  let currentIndex = 0;
  let termMapData = {};
  let autoSurfaceMap = {};
  let CONJUGATION_RULES = null;

  function getCdnUrl(filepath) {
    return window.getAssetUrl(config, filepath);
  }

  function start(containerElement, repoConfig, exitCallback) {
    container = containerElement;
    config = repoConfig;
    onExit = exitCallback;

    initializeModule();
  }

  function initializeModule() {
    const styleId = 'jp-custom-story-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .jp-cs-container {
          font-family: 'Poppins', 'Noto Sans JP', sans-serif;
          background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
          border-radius: 12px;
          overflow: hidden;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          position: relative;
          min-height: 600px;
        }
        .jp-cs-header {
          background: rgba(0,0,0,0.5);
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .jp-cs-title {
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .jp-cs-nav {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .jp-cs-nav-btn, .jp-cs-back-btn {
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
        @media (hover: hover) {
          .jp-cs-nav-btn:hover, .jp-cs-back-btn:hover {
            background: rgba(255,255,255,0.2);
          }
        }
        .jp-cs-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .jp-cs-content {
          background: white;
          padding: 40px;
          margin: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }
        .jp-cs-content h1 { color: #7C3AED; font-size: 2rem; margin-top: 0; margin-bottom: 0.5rem; font-weight: 700; }
        .jp-cs-content h2 { color: #5B21B6; font-size: 1.4rem; margin-top: 0; margin-bottom: 2rem; font-weight: 600; }
        .jp-cs-content h3 { color: #7C3AED; font-size: 1.2rem; margin-top: 2rem; margin-bottom: 1rem; font-weight: 600; border-bottom: 2px solid #7C3AED; padding-bottom: 0.5rem; }
        .jp-cs-content hr { border: none; border-top: 2px solid #e0e0e0; margin: 2rem 0; }
        .jp-cs-content p { font-size: 1.1rem; line-height: 2; margin-bottom: 1rem; color: #333; font-family: 'Noto Sans JP', sans-serif; }
        .jp-cs-content ul, .jp-cs-content ol { line-height: 1.8; margin-bottom: 1rem; padding-left: 2rem; }
        .jp-cs-content li { margin-bottom: 0.5rem; color: #333; }
        .jp-cs-content strong { color: #7C3AED; font-weight: 700; }
        .jp-cs-content em { color: #5B21B6; font-style: italic; }
        .jp-cs-content code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
        .jp-cs-content pre { background: #f5f5f5; padding: 15px; border-radius: 6px; overflow-x: auto; margin-bottom: 1rem; }
        .jp-cs-content pre code { background: none; padding: 0; }
        .jp-term {
          color: #4e54c8;
          font-weight: 700;
          cursor: pointer;
          border-bottom: 2px solid rgba(78,84,200,0.2);
          margin-right: 1px;
          transition: 0.2s;
        }
        @media (hover: hover) {
          .jp-term:hover { background: rgba(78,84,200,0.08); border-bottom-color: #4e54c8; }
        }
        .jp-cs-loading {
          text-align: center;
          padding: 60px 20px;
          color: white;
        }
        .jp-cs-loading-spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: cs-spin 1s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes cs-spin { to { transform: rotate(360deg); } }
        .jp-cs-error {
          background: #ff5252;
          color: white;
          padding: 20px;
          margin: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .jp-cs-selector {
          background: white;
          padding: 30px;
          margin: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .jp-cs-selector h2 { color: #7C3AED; font-size: 1.3rem; font-weight: 700; margin: 0 0 5px 0; }
        .jp-cs-selector > p { color: #888; font-size: 0.9rem; margin: 0 0 20px 0; }
        .jp-cs-selector-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .jp-cs-card {
          background: linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%);
          border-radius: 12px;
          padding: 24px 16px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid transparent;
          text-align: center;
        }
        @media (hover: hover) {
          .jp-cs-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            border-color: #7C3AED;
          }
        }
        .jp-cs-card-badge {
          display: inline-block;
          background: #7C3AED;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 10px;
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }
        .jp-cs-card-jp { font-size: 1.3rem; font-weight: 700; color: #333; margin-bottom: 6px; font-family: 'Noto Sans JP', sans-serif; }
        .jp-cs-card-en { font-size: 0.85rem; color: #666; margin-bottom: 16px; }
        .jp-cs-card-read-btn {
          background: #7C3AED;
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
        @media (hover: hover) {
          .jp-cs-card:hover .jp-cs-card-read-btn { background: #6D28D9; }
        }
        @media (max-width: 600px) {
          .jp-cs-content { padding: 20px; margin: 10px; }
          .jp-cs-content h1 { font-size: 1.5rem; }
          .jp-cs-content h2 { font-size: 1.2rem; }
          .jp-cs-header { flex-direction: column; align-items: stretch; }
          .jp-cs-nav { justify-content: center; }
          .jp-cs-selector { padding: 20px; margin: 10px; }
          .jp-cs-selector-grid { grid-template-columns: 1fr; }
        }
      `;
      document.head.appendChild(style);
    }

    container.innerHTML = `
      <div class="jp-cs-container">
        <div class="jp-cs-header">
          <div class="jp-cs-title">⭐ Custom Stories</div>
          <div class="jp-cs-nav">
            <button class="jp-settings-gear" onclick="window.JPShared.ttsSettings.open()" title="Voice Settings" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.3);">⚙</button>
            <button class="jp-cs-nav-btn" id="jp-cs-list" style="display:none;">☰ All Stories</button>
            <button class="jp-cs-nav-btn" id="jp-cs-prev" style="display:none;">← Previous</button>
            <button class="jp-cs-nav-btn" id="jp-cs-next" style="display:none;">Next →</button>
            <button class="jp-cs-back-btn" id="jp-cs-exit">← Back to Menu</button>
          </div>
        </div>
        <div class="jp-cs-loading">
          <div class="jp-cs-loading-spinner"></div>
          <div>Loading stories...</div>
        </div>
      </div>
    `;

    document.getElementById('jp-cs-exit').addEventListener('click', () => {
      if (onExit) onExit();
    });
    document.getElementById('jp-cs-prev').addEventListener('click', () => {
      if (currentIndex > 0) { currentIndex--; loadStory(storyList[currentIndex]); }
    });
    document.getElementById('jp-cs-next').addEventListener('click', () => {
      if (currentIndex < storyList.length - 1) { currentIndex++; loadStory(storyList[currentIndex]); }
    });
    document.getElementById('jp-cs-list').addEventListener('click', () => {
      showSelector();
    });

    Promise.all([loadMarkedJS(), loadResources()]).then(() => {
      loadStoryList();
    }).catch(err => {
      showError('Failed to load resources: ' + err.message);
    });
  }

  function loadMarkedJS() {
    return new Promise((resolve, reject) => {
      if (window.marked) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js';
      script.onload = () => {
        if (window.marked) {
          marked.setOptions({ gfm: true, breaks: true });
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
      const conjUrl      = getCdnUrl(manifest.globalFiles.conjugationRules);
      const particleUrl  = getCdnUrl(manifest.shared.particles);
      const characterUrl = getCdnUrl(manifest.shared.characters);
      const [conjugationRules, particleData, characterData, ...glossParts] = await Promise.all([
        fetch(conjUrl).then(r => r.json()),
        fetch(particleUrl).then(r => r.json()),
        fetch(characterUrl).then(r => r.json()),
        ...manifest.levels.map(lvl => fetch(getCdnUrl(manifest.data[lvl].glossary)).then(r => r.json()))
      ]);
      const allEntries = glossParts.flatMap(g => g.entries);

      termMapData = {};
      autoSurfaceMap = {};
      allEntries.forEach(term => {
        termMapData[term.id] = term;
        if (term.surface) autoSurfaceMap[term.surface] = { id: term.id, form: null };
      });
      (particleData.particles || []).forEach(p => {
        termMapData[p.id] = { id: p.id, surface: p.particle, reading: p.reading, meaning: p.role, notes: p.explanation, type: 'particle', matches: p.matches || [] };
      });
      (characterData.characters || []).forEach(c => {
        termMapData[c.id] = Object.assign({}, c, { portraitUrl: getCdnUrl(c.portrait) });
      });
      if (window.JPShared && window.JPShared.assets && window.JPShared.assets.preloadImages) {
        window.JPShared.assets.preloadImages(
          (characterData.characters || []).map(c => getCdnUrl(c.portrait)).filter(Boolean)
        );
      }

      CONJUGATION_RULES = conjugationRules;
      window.JPShared.termModal.setTermMap(termMapData);
      window.JPShared.termModal.inject();

      window.JP_OPEN_TERM = function(id, form, enableFlag) {
        if (typeof form === 'boolean') { enableFlag = form; form = null; }
        var termId = id;
        if (form && CONJUGATION_RULES) {
          var conjugatedId = id + '_' + form;
          if (!termMapData[conjugatedId]) {
            var rootTerm = termMapData[id];
            if (rootTerm) {
              var conjugated = window.JPShared.textProcessor.conjugate(rootTerm, form, CONJUGATION_RULES);
              if (conjugated) termMapData[conjugated.id] = conjugated;
            }
          }
          termId = termMapData[conjugatedId] ? conjugatedId : id;
        }
        window.JPShared.termModal.open(termId, {
          enableFlag: !!enableFlag,
          onFlag: function(flaggedId, msgBox) {
            if (!window.JPShared.progress.getFlagCount(id)) {
              window.JPShared.progress.flagTerm(id);
              if (msgBox) { msgBox.style.display = 'block'; setTimeout(function() { msgBox.style.display = 'none'; }, 2000); }
            } else if (msgBox) { msgBox.style.display = 'none'; }
          }
        });
      };
    } catch (err) {
      console.warn('[CustomStories] Could not load glossary/conjugation:', err);
    }
  }

  async function loadStoryList() {
    try {
      const manifest = await window.getManifest(config);
      const customData = manifest.data && manifest.data.custom;
      const stories = (customData && customData.stories) || [];

      storyList = stories.map(story => ({
        id: story.id,
        dir: story.dir,
        mdFile: story.dir + '/story.md',
        jsonFile: story.dir + '/terms.json',
        title: story.titleJp || story.title,
        subtitle: story.title,
        unlocksAfter: story.unlocksAfter
      }));

      if (storyList.length > 0) {
        showSelector();
      } else {
        showError('No custom stories available yet.');
      }
    } catch (err) {
      showError('Failed to load story list: ' + err.message);
    }
  }

  function showSelector() {
    const wrap = container.querySelector('.jp-cs-container');
    const area = wrap.querySelector('.jp-cs-loading') || wrap.querySelector('.jp-cs-content') ||
                 wrap.querySelector('.jp-cs-selector') || wrap.querySelector('.jp-cs-error');

    const titleEl = wrap.querySelector('.jp-cs-title');
    if (titleEl) titleEl.textContent = '⭐ Custom Stories';

    const listBtn = document.getElementById('jp-cs-list');
    const prevBtn = document.getElementById('jp-cs-prev');
    const nextBtn = document.getElementById('jp-cs-next');
    if (listBtn) listBtn.style.display = 'none';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';

    const cardsHtml = storyList.map((story, i) => `
      <div class="jp-cs-card" data-story-index="${i}">
        <div class="jp-cs-card-badge">Custom</div>
        <div class="jp-cs-card-jp">${story.title}</div>
        <div class="jp-cs-card-en">${story.subtitle}</div>
        <button class="jp-cs-card-read-btn">Read →</button>
      </div>
    `).join('');

    if (area) {
      area.outerHTML = `
        <div class="jp-cs-selector">
          <h2>Choose a Story</h2>
          <p>${storyList.length} stor${storyList.length !== 1 ? 'ies' : 'y'} available</p>
          <div class="jp-cs-selector-grid">
            ${cardsHtml}
          </div>
        </div>
      `;
    }

    wrap.querySelectorAll('.jp-cs-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.storyIndex, 10);
        currentIndex = index;
        loadStory(storyList[index]);
      });
    });
  }

  async function loadStory(storyInfo) {
    if (window.JPShared && window.JPShared.streak) window.JPShared.streak.recordActivity();
    const wrap = container.querySelector('.jp-cs-container');
    const area = wrap.querySelector('.jp-cs-loading') || wrap.querySelector('.jp-cs-content') ||
                 wrap.querySelector('.jp-cs-selector') || wrap.querySelector('.jp-cs-error');

    if (area) {
      area.outerHTML = `
        <div class="jp-cs-loading">
          <div class="jp-cs-loading-spinner"></div>
          <div>Loading ${storyInfo.title}...</div>
        </div>
      `;
    }

    const titleEl = wrap.querySelector('.jp-cs-title');
    if (titleEl) titleEl.textContent = storyInfo.title;

    const listBtn = document.getElementById('jp-cs-list');
    const prevBtn = document.getElementById('jp-cs-prev');
    const nextBtn = document.getElementById('jp-cs-next');
    if (listBtn) listBtn.style.display = '';
    if (prevBtn) prevBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = '';
    updateNavButtons();

    try {
      const mdUrl   = getCdnUrl(storyInfo.mdFile);
      const jsonUrl = getCdnUrl(storyInfo.jsonFile);
      const [mdResponse, jsonResponse] = await Promise.all([
        fetch(mdUrl + '?t=' + Date.now()),
        fetch(jsonUrl + '?t=' + Date.now())
      ]);
      if (!mdResponse.ok) throw new Error('Failed to load story markdown: ' + mdResponse.status);
      if (!jsonResponse.ok) throw new Error('Failed to load story data: ' + jsonResponse.status);

      const markdown  = await mdResponse.text();
      const storyData = await jsonResponse.json();
      let html = marked.parse(markdown);
      html = processStoryHTML(html, storyData.terms);

      const loading = wrap.querySelector('.jp-cs-loading');
      if (loading) loading.outerHTML = `<div class="jp-cs-content">${html}</div>`;

      currentStory = storyInfo;
      const contentDiv = wrap.querySelector('.jp-cs-content');
      if (contentDiv) {
        contentDiv.scrollTop = 0;
        addSpeakerButtons(contentDiv);
      }
    } catch (err) {
      showError('Failed to load story: ' + err.message);
    }
  }

  function addSpeakerButtons(contentDiv) {
    var paragraphs = contentDiv.querySelectorAll('p');
    var storyTexts = [];
    var hitEnglishSection = false;
    paragraphs.forEach(function(p) {
      if (hitEnglishSection) return;
      var plainText = p.textContent.trim();
      if (!plainText) return;
      var prev = p.previousElementSibling;
      while (prev) {
        var txt = prev.textContent.trim().toLowerCase();
        if (prev.tagName && /^H[1-6]$/.test(prev.tagName) &&
            (txt.indexOf('english') !== -1 || txt.indexOf('vocabulary used') !== -1 || txt.indexOf('grammar points') !== -1)) {
          hitEnglishSection = true;
          return;
        }
        if (prev.tagName === 'HR') break;
        prev = prev.previousElementSibling;
      }
      if (hitEnglishSection) return;
      if (!/[぀-ゟ゠-ヿ一-鿿]/.test(plainText)) return;
      storyTexts.push(plainText);
      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;align-items:flex-start;gap:2px;';
      var textDiv = document.createElement('div');
      textDiv.style.flex = '1';
      while (p.firstChild) textDiv.appendChild(p.firstChild);
      var btn = document.createElement('button');
      btn.className = 'jp-speak-sentence';
      btn.title = 'Listen';
      btn.textContent = '🔊';
      btn.onclick = function() { window.JPShared.tts.speak(plainText); };
      wrapper.appendChild(textDiv);
      wrapper.appendChild(btn);
      p.appendChild(wrapper);
    });
    if (storyTexts.length > 0) {
      var playBtn = document.createElement('button');
      playBtn.className = 'jp-speak-all-btn';
      playBtn.innerHTML = '🔊 Play Story';
      playBtn.style.marginTop = '10px';
      function setPlaying(playing) {
        playBtn.textContent = playing ? '⏹ Stop' : '🔊 Play Story';
        playBtn.classList.toggle('jp-speak-all-active', playing);
      }
      playBtn.onclick = function() {
        if (window.JPShared.tts.isSpeaking()) {
          window.JPShared.tts.cancel();
          setPlaying(false);
        } else {
          setPlaying(true);
          window.JPShared.tts.speakLines(storyTexts, { onFinish: function() { setPlaying(false); } });
        }
      };
      contentDiv.insertBefore(playBtn, contentDiv.firstChild);
    }
  }

  function processStoryHTML(html, termMappings) {
    const mergedMappings = Object.assign({}, autoSurfaceMap, termMappings);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.parentElement.classList.contains('jp-term') ||
          node.parentElement.tagName === 'CODE' ||
          node.parentElement.tagName === 'PRE') continue;
      const text = node.textContent;
      if (!text.trim()) continue;
      const matches = findTermsInText(text, mergedMappings);
      if (matches.length > 0) nodesToReplace.push({ node, matches });
    }

    nodesToReplace.forEach(({ node, matches }) => {
      const span = document.createElement('span');
      let lastIndex = 0;
      let html = '';
      matches.forEach(match => {
        html += escapeHtml(node.textContent.substring(lastIndex, match.index));
        const formStr = match.form ? `'${match.form}'` : 'null';
        const matchedTerm = termMapData[match.termId];
        const termCls = (matchedTerm && matchedTerm.type === 'character') ? 'jp-term jp-term-name' : 'jp-term';
        html += `<span class="${termCls}" onclick="window.JP_OPEN_TERM('${match.termId}', ${formStr}, true)">${escapeHtml(match.text)}</span>`;
        lastIndex = match.index + match.text.length;
      });
      html += escapeHtml(node.textContent.substring(lastIndex));
      span.innerHTML = html;
      node.parentElement.replaceChild(span, node);
    });

    return tempDiv.innerHTML;
  }

  function findTermsInText(text, termMappings) {
    const matches = [];
    const processedPositions = new Set();
    const surfaceForms = Object.keys(termMappings).sort((a, b) => b.length - a.length);
    surfaceForms.forEach(surface => {
      const termDef = termMappings[surface];
      let index = text.indexOf(surface);
      while (index !== -1) {
        let overlaps = false;
        for (let i = index; i < index + surface.length; i++) {
          if (processedPositions.has(i)) { overlaps = true; break; }
        }
        if (!overlaps) {
          matches.push({ index, text: surface, termId: termDef.id, form: termDef.form || null });
          for (let i = index; i < index + surface.length; i++) processedPositions.add(i);
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
    const prevBtn = document.getElementById('jp-cs-prev');
    const nextBtn = document.getElementById('jp-cs-next');
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === storyList.length - 1 || storyList.length === 0;
  }

  function showError(message) {
    const wrap = container.querySelector('.jp-cs-container');
    const area = wrap.querySelector('.jp-cs-loading') || wrap.querySelector('.jp-cs-content') ||
                 wrap.querySelector('.jp-cs-selector') || wrap.querySelector('.jp-cs-error');
    if (area) {
      area.outerHTML = `
        <div class="jp-cs-error">
          <h2>⚠️ Error</h2>
          <p>${message}</p>
        </div>
      `;
    }
  }

  return { start: start };
})();
