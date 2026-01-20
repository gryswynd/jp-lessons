window.StoryModule = (function() {
  'use strict';

  let container = null;
  let config = null;
  let onExit = null;
  let currentStory = null;
  let storyList = [];
  let currentIndex = 0;

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
        }
        .jp-story-content ruby {
          font-size: 1.2rem;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .jp-story-content rt {
          font-size: 0.6em;
          color: #666;
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
        .jp-story-list {
          background: white;
          padding: 20px;
          margin: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .jp-story-list h2 {
          color: #667eea;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .jp-story-item {
          background: #f5f5f5;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }
        .jp-story-item:hover {
          background: #e8eaf6;
          border-color: #667eea;
          transform: translateX(5px);
        }
        .jp-story-item-title {
          font-weight: 700;
          color: #667eea;
          font-size: 1.1rem;
          margin-bottom: 5px;
        }
        .jp-story-item-subtitle {
          color: #666;
          font-size: 0.9rem;
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
            <button class="jp-story-nav-btn" id="jp-story-prev">← Previous</button>
            <button class="jp-story-nav-btn" id="jp-story-next">Next →</button>
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

    // Load marked.js from CDN
    loadMarkedJS().then(() => {
      loadStoryList();
    }).catch(err => {
      showError('Failed to load markdown parser: ' + err.message);
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

  function loadStoryList() {
    // Define available stories
    // Users can add more .md files to their repo and add them here
    storyList = [
      { filename: 'library-book.md', title: '図書館の本', subtitle: 'The Library Book' }
      // Add more stories here as they're created
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

    // Update navigation buttons
    updateNavButtons();

    try {
      const url = getCdnUrl(storyInfo.filename);
      const response = await fetch(url + '?t=' + Date.now()); // Cache-busting

      if (!response.ok) {
        throw new Error(`Failed to load story: ${response.status} ${response.statusText}`);
      }

      const markdown = await response.text();

      // Parse markdown to HTML using marked
      const html = marked.parse(markdown);

      // Replace loading with content
      const loading = storyContainer.querySelector('.jp-story-loading');
      if (loading) {
        loading.outerHTML = `
          <div class="jp-story-content">
            ${html}
          </div>
        `;
      }

      currentStory = storyInfo;

      // Scroll to top
      const contentDiv = storyContainer.querySelector('.jp-story-content');
      if (contentDiv) {
        contentDiv.scrollTop = 0;
      }

    } catch (err) {
      showError(`Failed to load story: ${err.message}`);
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
