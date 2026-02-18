/**
 * app/shared/tts.js
 * Shared text-to-speech helper for Japanese audio playback.
 *
 * Modules that currently duplicate this logic:
 *   - Lesson.js    — local speak() function (lines ~149-199)
 *   - Practice.js  — KanjiApp.speak() method (lines ~8-48)
 *   - Compose.js   — ComposeApp.speak() method (lines ~8-25)
 *   - Game.js      — inline speechSynthesis calls during NPC dialogue
 *
 * Load this file before any feature module scripts.
 */

(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  window.JPShared.tts = {

    /**
     * Speak a Japanese string using the Web Speech API.
     * Handles mobile resume quirks and retries on 'not-allowed'/'interrupted'.
     * @param {string} text - Japanese text to speak
     * TODO: implement (consolidate logic from Lesson.js speak() + Practice.js KanjiApp.speak())
     */
    speak: function (text) {
      // TODO: cancel any in-progress utterance
      // TODO: create SpeechSynthesisUtterance with lang='ja-JP', rate=0.9, volume=1.0
      // TODO: handle onerror — retry once on 'not-allowed' or 'interrupted'
      // TODO: handle onstart — resume if paused (mobile Safari quirk)
      // TODO: call window.speechSynthesis.speak(utterance)
      // TODO: guard with try/catch, log errors to console
    },

    /**
     * Cancel any currently playing utterance.
     * TODO: implement
     */
    cancel: function () {
      // TODO: call window.speechSynthesis.cancel()
    }

  };

})();
