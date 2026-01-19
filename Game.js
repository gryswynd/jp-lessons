window.GameModule = (function() {
  'use strict';

  let container = null;
  let config = null;
  let onExit = null;

  function getCdnUrl(filename) {
    return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.path ? config.path + '/' : ''}${filename}`;
  }

  function start(containerElement, repoConfig, exitCallback) {
    container = containerElement;
    config = repoConfig;
    onExit = exitCallback;

    initializeGame();
  }

  function initializeGame() {
    // --- Styles ---
    const styleId = 'jp-game-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .jp-game-container {
          font-family: 'Poppins', 'Noto Sans JP', sans-serif;
          background: #1a1a2e;
          border-radius: 12px;
          overflow: hidden;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          position: relative;
        }
        .jp-game-header {
          background: rgba(0,0,0,0.5);
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .jp-game-title {
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .jp-game-back-btn {
          background: rgba(255,255,255,0.1);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        .jp-game-back-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .jp-game-canvas-wrapper {
          position: relative;
          background: #000;
        }
        .jp-game-canvas {
          display: block;
          width: 100%;
          height: auto;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        .jp-game-ui {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
          max-width: 80%;
          display: none;
          pointer-events: none;
        }
        .jp-conversation-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          display: none;
          flex-direction: row;
          align-items: stretch;
          padding: 0;
        }
        .jp-convo-container {
          display: flex;
          flex-direction: row;
          width: 100%;
          height: 100%;
          align-items: flex-end;
          justify-content: space-between;
          padding: 30px;
          gap: 30px;
        }
        .jp-speech-bubble {
          flex: 1;
          max-width: 55%;
          background: white;
          border: 4px solid #2f3542;
          border-radius: 30px;
          padding: 30px 35px;
          position: relative;
          box-shadow: 0 8px 20px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.8);
          min-height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-bottom: 40px;
          align-self: flex-end;
        }
        .jp-speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -30px;
          right: 80px;
          width: 0;
          height: 0;
          border-left: 40px solid transparent;
          border-right: 20px solid transparent;
          border-top: 35px solid #2f3542;
        }
        .jp-speech-bubble::before {
          content: '';
          position: absolute;
          bottom: -22px;
          right: 85px;
          width: 0;
          height: 0;
          border-left: 35px solid transparent;
          border-right: 15px solid transparent;
          border-top: 28px solid white;
          z-index: 1;
        }
        .jp-speech-bubble .text {
          font-size: 18px;
          line-height: 1.7;
          color: #2f3542;
          white-space: pre-line;
          font-weight: 500;
        }
        .jp-speech-bubble .continue {
          margin-top: 15px;
          font-size: 13px;
          color: #666;
          text-align: right;
          font-style: italic;
        }
        .jp-character-portrait {
          width: auto;
          height: 90%;
          max-height: 540px;
          object-fit: contain;
          object-position: bottom right;
          align-self: flex-end;
          filter: drop-shadow(0 10px 25px rgba(0,0,0,0.5));
        }
        .jp-game-loading {
          text-align: center;
          padding: 60px 20px;
          color: white;
        }
        .jp-loading-spinner {
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
      `;
      document.head.appendChild(style);
    }

    // --- HTML Structure ---
    container.innerHTML = `
      <div class="jp-game-container">
        <div class="jp-game-header">
          <div class="jp-game-title">🎮 House Adventure</div>
          <button class="jp-game-back-btn" id="jp-game-exit">← Back to Menu</button>
        </div>
        <div class="jp-game-loading">
          <div class="jp-loading-spinner"></div>
          <div>Loading game assets...</div>
        </div>
      </div>
    `;

    document.getElementById('jp-game-exit').addEventListener('click', () => {
      if (onExit) onExit();
    });

    loadGame();
  }

  function loadGame() {
    const gameContainer = container.querySelector('.jp-game-container');

    // --- Game State ---
    const game = {
      images: {},
      player: {
        x: 200,
        y: 200,
        width: 63,
        height: 90,
        speed: 2,
        direction: 'down',
        frame: 0,
        frameTimer: 0,
        frameDelay: 8,
        moving: false
      },
      camera: { x: 0, y: 0 },
      keys: {},
      mapData: null,
      collisionData: null,
      interactiveObjects: [],
      npcs: [],
      doors: {},
      inConversation: false,
      currentConversation: null,
      conversationIndex: 0
    };

    // Interactive object definitions (left to right, top to bottom)
    const INTERACTIVE_OBJECTS = [
      { name: 'Bed', message: 'A comfortable bed. Maybe I should get some rest later.' },
      { name: 'Computer', message: 'My computer. I should study Japanese on it!' },
      { name: 'Toilet', message: 'The toilet. It\'s clean.' },
      { name: 'Fridge', message: 'The fridge is well stocked. Mom went shopping yesterday.' },
      { name: 'Bedroom Door', isDoor: true },
      { name: 'TV', message: 'The TV is off. Maybe I can watch some anime later.' },
      { name: 'Bathroom Door', isDoor: true },
      { name: 'Kitchen Door', isDoor: true },
      { name: 'Kotatsu', message: 'The kotatsu is warm and inviting. Perfect for winter!' },
      { name: 'Front Door', isDoor: true }
    ];

    // NPC conversations
    const CONVERSATIONS = {
      mom: [
        { speaker: 'mom', text: 'おはよう！朝ごはんは食べた？\n(Good morning! Did you eat breakfast?)' },
        { speaker: 'me', text: 'おはよう、お母さん。まだだよ。\n(Good morning, Mom. Not yet.)' },
        { speaker: 'mom', text: '冷蔵庫に卵があるから、食べてね。\n(There are eggs in the fridge, so please eat.)' },
        { speaker: 'me', text: 'ありがとう！\n(Thank you!)' }
      ],
      dad: [
        { speaker: 'dad', text: 'よう、元気か？\n(Hey, how are you?)' },
        { speaker: 'me', text: 'うん、元気だよ。お父さんは？\n(Yeah, I\'m good. How about you, Dad?)' },
        { speaker: 'dad', text: 'まあまあだな。今日は何するんだ？\n(Not bad. What are you doing today?)' },
        { speaker: 'me', text: '日本語を勉強するつもり。\n(I\'m planning to study Japanese.)' },
        { speaker: 'dad', text: 'いいね！頑張れよ。\n(Nice! Do your best.)' }
      ]
    };

    // --- Image Loading ---
    const imagesToLoad = {
      map: 'house_map.png',
      collision: 'house_collision.png',
      playerSheet: 'me_walk_cycle_sheet_transparent.png',
      momSprite: 'momsprite.png',
      dadSprite: 'dadsprite.png',
      convoBackground: 'house_convo.png',
      momConvo: 'mom-convo.png',
      dadConvo: 'dad-convo.png',
      meConvo: 'me-convo.png'
    };

    let loadedImages = 0;
    const totalImages = Object.keys(imagesToLoad).length;

    function loadImages() {
      Object.entries(imagesToLoad).forEach(([key, filename]) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          loadedImages++;
          if (loadedImages === totalImages) {
            initGame();
          }
        };
        img.onerror = () => {
          console.error(`Failed to load: ${filename}`);
          loadedImages++;
          if (loadedImages === totalImages) {
            initGame();
          }
        };
        img.src = getCdnUrl(filename);
        game.images[key] = img;
      });
    }

    // --- Collision Detection ---
    function getPixelColor(imageData, x, y) {
      const idx = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
      return {
        r: imageData.data[idx],
        g: imageData.data[idx + 1],
        b: imageData.data[idx + 2],
        a: imageData.data[idx + 3]
      };
    }

    function isCollision(x, y) {
      if (!game.collisionData) return false;
      if (x < 0 || y < 0 || x >= game.collisionData.width || y >= game.collisionData.height) return true;
      const color = getPixelColor(game.collisionData, x, y);
      return color.r > 200 && color.g < 50 && color.b < 50;
    }

    function getInteractiveObject(x, y) {
      if (!game.collisionData) return null;
      if (x < 0 || y < 0 || x >= game.collisionData.width || y >= game.collisionData.height) return null;
      const color = getPixelColor(game.collisionData, x, y);
      if (color.b > 200 && color.r < 50 && color.g < 50) {
        for (let obj of game.interactiveObjects) {
          const dx = x - obj.x;
          const dy = y - obj.y;
          if (dx >= 0 && dx < obj.width && dy >= 0 && dy < obj.height) {
            return obj;
          }
        }
      }
      return null;
    }

    // --- Game Initialization ---
    function initGame() {
      // Replace loading with game canvas
      gameContainer.querySelector('.jp-game-loading').remove();

      const canvasWrapper = document.createElement('div');
      canvasWrapper.className = 'jp-game-canvas-wrapper';
      canvasWrapper.innerHTML = `
        <canvas class="jp-game-canvas" id="game-canvas" width="800" height="600"></canvas>
        <div class="jp-game-ui" id="game-ui"></div>
        <div class="jp-conversation-overlay" id="conversation-overlay">
          <div class="jp-convo-container">
            <div class="jp-speech-bubble">
              <div class="text" id="convo-text"></div>
              <div class="continue">Press SPACE to continue</div>
            </div>
            <img class="jp-character-portrait" id="convo-portrait" src="" alt="">
          </div>
        </div>
      `;

      gameContainer.appendChild(canvasWrapper);

      const canvas = document.getElementById('game-canvas');
      const ctx = canvas.getContext('2d');
      const gameUI = document.getElementById('game-ui');
      const convoOverlay = document.getElementById('conversation-overlay');
      const convoText = document.getElementById('convo-text');
      const convoPortrait = document.getElementById('convo-portrait');

      // Extract collision data from collision image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = game.images.collision.width;
      tempCanvas.height = game.images.collision.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(game.images.collision, 0, 0);
      game.collisionData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

      // Scan for interactive objects (blue pixels)
      const found = [];
      for (let y = 0; y < game.collisionData.height; y++) {
        for (let x = 0; x < game.collisionData.width; x++) {
          const color = getPixelColor(game.collisionData, x, y);
          if (color.b > 200 && color.r < 50 && color.g < 50) {
            let isNew = true;
            for (let obj of found) {
              if (x >= obj.minX && x <= obj.maxX && y >= obj.minY && y <= obj.maxY) {
                isNew = false;
                break;
              }
            }
            if (isNew) {
              const bounds = { minX: x, maxX: x, minY: y, maxY: y };
              for (let sy = y; sy < Math.min(y + 100, game.collisionData.height); sy++) {
                for (let sx = x; sx < Math.min(x + 100, game.collisionData.width); sx++) {
                  const c = getPixelColor(game.collisionData, sx, sy);
                  if (c.b > 200 && c.r < 50 && c.g < 50) {
                    bounds.maxX = Math.max(bounds.maxX, sx);
                    bounds.maxY = Math.max(bounds.maxY, sy);
                  }
                }
              }
              found.push(bounds);
            }
          }
        }
      }

      found.sort((a, b) => {
        const aY = (a.minY + a.maxY) / 2;
        const bY = (b.minY + b.maxY) / 2;
        if (Math.abs(aY - bY) > 50) return aY - bY;
        return (a.minX + a.maxX) / 2 - (b.minX + b.maxX) / 2;
      });

      game.interactiveObjects = found.map((bounds, i) => {
        const def = INTERACTIVE_OBJECTS[i] || { name: `Object ${i}`, message: 'An object.' };
        return {
          x: bounds.minX,
          y: bounds.minY,
          width: bounds.maxX - bounds.minX,
          height: bounds.maxY - bounds.minY,
          centerX: (bounds.minX + bounds.maxX) / 2,
          centerY: (bounds.minY + bounds.maxY) / 2,
          ...def
        };
      });

      game.interactiveObjects.forEach(obj => {
        if (obj.isDoor) {
          game.doors[obj.name] = { open: false };
        }
      });

      // Place NPCs (calculate proper dimensions when images load)
      game.npcs = [
        {
          name: 'mom',
          x: 970,
          y: 330,
          sprite: game.images.momSprite,
          conversation: 'mom'
        },
        {
          name: 'dad',
          x: 610,
          y: 690,
          sprite: game.images.dadSprite,
          conversation: 'dad'
        }
      ];

      // Set NPC dimensions based on sprite aspect ratio
      game.npcs.forEach(npc => {
        if (npc.sprite && npc.sprite.complete) {
          const aspectRatio = npc.sprite.width / npc.sprite.height;
          npc.height = 108;
          npc.width = npc.height * aspectRatio;
        } else {
          npc.width = 72;
          npc.height = 108;
        }
      });

      // Set player start position (by the bed)
      if (game.interactiveObjects.length > 0) {
        const bed = game.interactiveObjects[0];
        game.player.x = bed.centerX;
        game.player.y = bed.centerY + 50;
      }

      // --- Input Handling ---
      function handleKeyDown(e) {
        game.keys[e.key] = true;

        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (game.inConversation) {
            advanceConversation();
          } else {
            handleInteraction();
          }
        }
      }

      function handleKeyUp(e) {
        game.keys[e.key] = false;
      }

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Store cleanup function
      game.cleanup = () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        if (game.animationFrame) {
          cancelAnimationFrame(game.animationFrame);
        }
      };

      // --- Interaction System ---
      function getNearbyInteractable() {
        const interactDistance = 50;

        // Check for NPCs
        for (let npc of game.npcs) {
          const dx = game.player.x - npc.x;
          const dy = game.player.y - npc.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < interactDistance + 20) {
            return { type: 'npc', target: npc };
          }
        }

        // Check for interactive objects in direction player is facing
        let checkX = game.player.x;
        let checkY = game.player.y;

        if (game.player.direction === 'up') checkY -= interactDistance;
        if (game.player.direction === 'down') checkY += interactDistance;
        if (game.player.direction === 'left') checkX -= interactDistance;
        if (game.player.direction === 'right') checkX += interactDistance;

        for (let obj of game.interactiveObjects) {
          const dx = checkX - obj.centerX;
          const dy = checkY - obj.centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < interactDistance) {
            return { type: 'object', target: obj };
          }
        }

        return null;
      }

      function handleInteraction() {
        const nearby = getNearbyInteractable();
        if (!nearby) return;

        if (nearby.type === 'npc') {
          startConversation(nearby.target.conversation);
        } else if (nearby.type === 'object') {
          if (nearby.target.isDoor) {
            toggleDoor(nearby.target);
          } else if (nearby.target.message) {
            showMessage(nearby.target.message);
          }
        }
      }

      function toggleDoor(doorObj) {
        if (game.doors[doorObj.name]) {
          game.doors[doorObj.name].open = !game.doors[doorObj.name].open;
          const status = game.doors[doorObj.name].open ? 'opened' : 'closed';
          showMessage(`${doorObj.name} ${status}.`);
        }
      }

      function showMessage(message) {
        gameUI.textContent = message;
        gameUI.style.display = 'block';
        setTimeout(() => {
          gameUI.style.display = 'none';
        }, 2000);
      }

      // --- Conversation System ---
      function startConversation(conversationId) {
        game.inConversation = true;
        game.currentConversation = CONVERSATIONS[conversationId];
        game.conversationIndex = 0;

        convoOverlay.style.backgroundImage = `url(${getCdnUrl('house_convo.png')})`;
        convoOverlay.style.display = 'flex';

        displayConversationLine();
      }

      function displayConversationLine() {
        if (!game.currentConversation || game.conversationIndex >= game.currentConversation.length) {
          endConversation();
          return;
        }

        const line = game.currentConversation[game.conversationIndex];
        convoText.textContent = line.text;

        let portraitSrc = '';
        if (line.speaker === 'mom') portraitSrc = getCdnUrl('mom-convo.png');
        else if (line.speaker === 'dad') portraitSrc = getCdnUrl('dad-convo.png');
        else if (line.speaker === 'me') portraitSrc = getCdnUrl('me-convo.png');

        convoPortrait.src = portraitSrc;
      }

      function advanceConversation() {
        game.conversationIndex++;
        displayConversationLine();
      }

      function endConversation() {
        game.inConversation = false;
        game.currentConversation = null;
        game.conversationIndex = 0;
        convoOverlay.style.display = 'none';
      }

      // --- Player Movement ---
      function updatePlayer() {
        if (game.inConversation) return;

        game.player.moving = false;
        let newX = game.player.x;
        let newY = game.player.y;

        if (game.keys['ArrowUp'] || game.keys['w'] || game.keys['W']) {
          newY -= game.player.speed;
          game.player.direction = 'up';
          game.player.moving = true;
        }
        if (game.keys['ArrowDown'] || game.keys['s'] || game.keys['S']) {
          newY += game.player.speed;
          game.player.direction = 'down';
          game.player.moving = true;
        }
        if (game.keys['ArrowLeft'] || game.keys['a'] || game.keys['A']) {
          newX -= game.player.speed;
          game.player.direction = 'left';
          game.player.moving = true;
        }
        if (game.keys['ArrowRight'] || game.keys['d'] || game.keys['D']) {
          newX += game.player.speed;
          game.player.direction = 'right';
          game.player.moving = true;
        }

        // Check collision with doors
        let canMove = true;
        for (let obj of game.interactiveObjects) {
          if (obj.isDoor && !game.doors[obj.name].open) {
            if (newX >= obj.x - game.player.width/2 && newX <= obj.x + obj.width + game.player.width/2 &&
                newY >= obj.y - game.player.height/2 && newY <= obj.y + obj.height + game.player.height/2) {
              canMove = false;
              break;
            }
          }
        }

        // Check collision with walls
        if (canMove) {
          const points = [
            { x: newX - 12, y: newY },
            { x: newX + 12, y: newY },
            { x: newX, y: newY - 20 },
            { x: newX, y: newY + 10 }
          ];

          for (let point of points) {
            if (isCollision(point.x, point.y)) {
              canMove = false;
              break;
            }
          }
        }

        if (canMove) {
          game.player.x = newX;
          game.player.y = newY;
        }

        // Update animation
        if (game.player.moving) {
          game.player.frameTimer++;
          if (game.player.frameTimer >= game.player.frameDelay) {
            game.player.frameTimer = 0;
            game.player.frame = (game.player.frame + 1) % 6;
          }
        } else {
          game.player.frame = 0;
          game.player.frameTimer = 0;
        }

        // Update camera
        game.camera.x = game.player.x - canvas.width / 2;
        game.camera.y = game.player.y - canvas.height / 2;
      }

      // --- Rendering ---
      function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw map
        if (game.images.map) {
          ctx.drawImage(game.images.map, -game.camera.x, -game.camera.y);
        }

        // Draw NPCs
        for (let npc of game.npcs) {
          if (npc.sprite) {
            ctx.drawImage(
              npc.sprite,
              npc.x - game.camera.x - npc.width/2,
              npc.y - game.camera.y - npc.height,
              npc.width,
              npc.height
            );
          }
        }

        // Draw player
        if (game.images.playerSheet) {
          const spriteWidth = 204;
          const spriteHeight = 293;
          let row = 0;

          if (game.player.direction === 'down') row = 0;
          else if (game.player.direction === 'left') row = 1;
          else if (game.player.direction === 'right') row = 2;
          else if (game.player.direction === 'up') row = 3;

          ctx.drawImage(
            game.images.playerSheet,
            game.player.frame * spriteWidth,
            row * spriteHeight,
            spriteWidth,
            spriteHeight,
            game.player.x - game.camera.x - game.player.width/2,
            game.player.y - game.camera.y - game.player.height,
            game.player.width,
            game.player.height
          );
        }

        // Draw interaction indicator
        if (!game.inConversation) {
          const nearby = getNearbyInteractable();
          if (nearby) {
            const targetX = nearby.type === 'npc' ? nearby.target.x : nearby.target.centerX;
            const targetY = nearby.type === 'npc' ? nearby.target.y - nearby.target.height - 10 : nearby.target.centerY - 30;

            const screenX = targetX - game.camera.x;
            const screenY = targetY - game.camera.y;

            // Draw prompt
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(screenX - 50, screenY - 20, 100, 25);

            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Press SPACE', screenX, screenY - 7.5);
          }
        }
      }

      // --- Game Loop ---
      function gameLoop() {
        updatePlayer();
        render();
        game.animationFrame = requestAnimationFrame(gameLoop);
      }

      gameLoop();
    }

    loadImages();
  }

  return {
    start: start
  };
})();
