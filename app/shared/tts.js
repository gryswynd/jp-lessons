/**
 * app/shared/tts.js
 * Shared text-to-speech helper for Japanese audio playback.
 *
 * Features:
 *   - Voice discovery and selection (filtered to ja-JP)
 *   - User-configurable speed (rate) and voice preference
 *   - Sequential chunking for long text (passages, conversations)
 *   - localStorage persistence of voice/speed preferences
 *   - Mobile-optimized with retry logic and timeout protection
 *
 * Load this file before any feature module scripts.
 */

(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  // --- localStorage key ---
  var PREFS_KEY = 'jp-tts-prefs';

  // --- Internal state ---
  var cachedVoices = [];
  var selectedVoiceURI = null;
  var selectedRate = 0.9;
  var chunkQueue = [];
  var isChunking = false;

  // --- Load saved preferences ---
  function loadPrefs() {
    try {
      var raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        var prefs = JSON.parse(raw);
        if (prefs.voiceURI) selectedVoiceURI = prefs.voiceURI;
        if (prefs.rate !== undefined) selectedRate = prefs.rate;
      }
    } catch (e) {
      console.warn('TTS: Could not load preferences', e);
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        voiceURI: selectedVoiceURI,
        rate: selectedRate
      }));
    } catch (e) {
      console.warn('TTS: Could not save preferences', e);
    }
  }

  // --- Voice discovery ---
  function refreshVoices() {
    if (!window.speechSynthesis) return;
    var allVoices = window.speechSynthesis.getVoices();
    cachedVoices = allVoices.filter(function (v) {
      return v.lang && v.lang.replace('_', '-').indexOf('ja') === 0;
    });
    // Sort: prioritise voices with "Google" or "Enhanced" or "Premium" in name
    cachedVoices.sort(function (a, b) {
      var aQ = /google|enhanced|premium|compact/i.test(a.name) ? 0 : 1;
      var bQ = /google|enhanced|premium|compact/i.test(b.name) ? 0 : 1;
      if (aQ !== bQ) return aQ - bQ;
      // Then local voices before remote
      if (a.localService !== b.localService) return a.localService ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  function findVoice() {
    if (cachedVoices.length === 0) refreshVoices();
    // Try user's saved preference first
    if (selectedVoiceURI) {
      for (var i = 0; i < cachedVoices.length; i++) {
        if (cachedVoices[i].voiceURI === selectedVoiceURI) return cachedVoices[i];
      }
    }
    // Fall back to first available Japanese voice
    return cachedVoices.length > 0 ? cachedVoices[0] : null;
  }

  // Listen for voiceschanged (Chrome loads voices asynchronously)
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = function () {
      refreshVoices();
    };
    // Eager load on init
    refreshVoices();
  }

  // Load saved preferences on init
  loadPrefs();

  // --- Core speak function ---
  function speakOne(text, options, onDone) {
    var opts = options || {};
    var lang   = opts.lang   || 'ja-JP';
    var rate   = (opts.rate   !== undefined) ? opts.rate   : selectedRate;
    var volume = (opts.volume !== undefined) ? opts.volume : 1.0;

    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      if (onDone) onDone();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      setTimeout(function () {
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang   = lang;
        utterance.rate   = rate;
        utterance.volume = volume;

        // Apply selected voice
        var voice = findVoice();
        if (voice) utterance.voice = voice;

        // Error handling with retry logic
        utterance.onerror = function (event) {
          console.error('Speech synthesis error:', event.error);
          if ((event.error === 'not-allowed' || event.error === 'interrupted') && !utterance._retried) {
            utterance._retried = true;
            setTimeout(function () {
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(utterance);
            }, 100);
          } else {
            if (onDone) onDone();
          }
        };

        // iOS Safari fix: resume if paused
        utterance.onstart = function () {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        };

        // Timeout protection: cancel if still speaking after 15 seconds
        var timeoutId = setTimeout(function () {
          window.speechSynthesis.cancel();
          if (onDone) onDone();
        }, 15000);

        utterance.onend = function () {
          clearTimeout(timeoutId);
          if (onDone) onDone();
        };

        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (error) {
      console.error('TTS Error:', error);
      if (onDone) onDone();
    }
  }

  // --- Chunking for long text ---
  // Splits on Japanese sentence boundaries and plays sequentially
  function splitIntoChunks(text) {
    // Split on 。！？ and keep the delimiter attached
    var parts = text.split(/(。|！|？|！|\!|\?)/);
    var chunks = [];
    for (var i = 0; i < parts.length; i += 2) {
      var sentence = parts[i];
      var delim = (i + 1 < parts.length) ? parts[i + 1] : '';
      var chunk = (sentence + delim).trim();
      if (chunk) chunks.push(chunk);
    }
    return chunks;
  }

  function playChunkQueue(options) {
    if (chunkQueue.length === 0) {
      isChunking = false;
      return;
    }
    var chunk = chunkQueue.shift();
    speakOne(chunk, options, function () {
      // Small pause between sentences for natural rhythm
      setTimeout(function () {
        playChunkQueue(options);
      }, 200);
    });
  }

  // --- Public API ---
  window.JPShared.tts = {

    /**
     * Speak a Japanese string. For short text (single words/sentences),
     * plays directly. For long text, automatically chunks on sentence boundaries.
     *
     * @param {string} text
     * @param {Object} [options]
     * @param {string} [options.lang='ja-JP']
     * @param {number} [options.rate]   - Overrides user preference if set
     * @param {number} [options.volume=1.0]
     */
    speak: function (text, options) {
      // Cancel any ongoing speech/chunking
      this.cancel();

      if (!text || !text.trim()) return;

      var trimmed = text.trim();

      // If text is short enough, speak directly
      if (trimmed.length <= 200) {
        speakOne(trimmed, options);
      } else {
        // Chunk and play sequentially
        chunkQueue = splitIntoChunks(trimmed);
        isChunking = true;
        playChunkQueue(options);
      }
    },

    /**
     * Speak multiple lines sequentially (for conversations).
     * Each line is spoken one after another with a pause between.
     *
     * @param {string[]} lines - Array of Japanese text strings
     * @param {Object} [options]
     */
    speakLines: function (lines, options) {
      this.cancel();

      if (!lines || lines.length === 0) return;

      chunkQueue = lines.filter(function (l) { return l && l.trim(); });
      isChunking = true;
      playChunkQueue(options);
    },

    /**
     * Cancel any currently playing utterance or queued chunks.
     */
    cancel: function () {
      chunkQueue = [];
      isChunking = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    },

    /**
     * Return whether TTS is currently playing (including chunk queue).
     * @returns {boolean}
     */
    isSpeaking: function () {
      return isChunking || (window.speechSynthesis && window.speechSynthesis.speaking);
    },

    // --- Voice management ---

    /**
     * Get all available Japanese voices.
     * @returns {SpeechSynthesisVoice[]}
     */
    getVoices: function () {
      refreshVoices();
      return cachedVoices.slice();
    },

    /**
     * Get the currently selected voice (or null).
     * @returns {SpeechSynthesisVoice|null}
     */
    getSelectedVoice: function () {
      return findVoice();
    },

    /**
     * Set voice by voiceURI string. Persists to localStorage.
     * @param {string} voiceURI
     */
    setVoice: function (voiceURI) {
      selectedVoiceURI = voiceURI;
      savePrefs();
    },

    /**
     * Get the current speech rate.
     * @returns {number}
     */
    getRate: function () {
      return selectedRate;
    },

    /**
     * Set speech rate (0.5–2.0). Persists to localStorage.
     * @param {number} rate
     */
    setRate: function (rate) {
      selectedRate = Math.max(0.5, Math.min(2.0, rate));
      savePrefs();
    },

    /**
     * Check if speech synthesis is supported.
     * @returns {boolean}
     */
    isSupported: function () {
      return !!window.speechSynthesis;
    }

  };

})();
