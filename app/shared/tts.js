/**
 * app/shared/tts.js
 * Shared text-to-speech helper for Japanese audio playback.
 *
 * Replaces duplicated speak() implementations in:
 *   - Lesson.js   — local speak() function
 *   - Practice.js — KanjiApp.speak() method
 *   - Compose.js  — ComposeApp.speak() method
 *   - Story.js    — local speak() function
 *
 * Load this file before any feature module scripts.
 */

(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  window.JPShared.tts = {

    /**
     * Speak a Japanese string using the Web Speech API.
     *
     * Based on the most complete implementation from Lesson.js / Practice.js:
     *   - cancel() before speaking to stop any in-progress utterance
     *   - 50ms delay to prevent race conditions on Android Chrome
     *   - retry once on 'not-allowed' / 'interrupted' errors (100ms gap)
     *   - iOS Safari fix: resume() if paused on utterance start
     *   - 10-second timeout protection, cleared on natural end
     *
     * @param {string} text
     * @param {Object} [options]
     * @param {string} [options.lang='ja-JP']
     * @param {number} [options.rate=0.9]   - Slightly slower for clarity
     * @param {number} [options.volume=1.0]
     */
    speak: function (text, options) {
      var opts = options || {};
      var lang   = opts.lang   || 'ja-JP';
      var rate   = (opts.rate   !== undefined) ? opts.rate   : 0.9;
      var volume = (opts.volume !== undefined) ? opts.volume : 1.0;

      if (!window.speechSynthesis) {
        console.warn('Speech synthesis not supported');
        return;
      }

      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Small delay to prevent race condition on mobile browsers
        setTimeout(function () {
          var utterance = new SpeechSynthesisUtterance(text);
          utterance.lang   = lang;
          utterance.rate   = rate;
          utterance.volume = volume;

          // Error handling with retry logic
          utterance.onerror = function (event) {
            console.error('Speech synthesis error:', event.error);
            // Recover from 'not-allowed' or 'interrupted' with a single retry
            if ((event.error === 'not-allowed' || event.error === 'interrupted') && !utterance._retried) {
              utterance._retried = true;
              setTimeout(function () {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
              }, 100);
            }
          };

          // iOS Safari fix: resume if paused
          utterance.onstart = function () {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          };

          // Timeout protection: cancel if still speaking after 10 seconds
          var timeoutId = setTimeout(function () {
            window.speechSynthesis.cancel();
          }, 10000);

          utterance.onend = function () {
            clearTimeout(timeoutId);
          };

          window.speechSynthesis.speak(utterance);
        }, 50); // 50ms delay prevents race conditions on Android Chrome
      } catch (error) {
        console.error('TTS Error:', error);
      }
    },

    /**
     * Cancel any currently playing utterance.
     */
    cancel: function () {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }

  };

})();
