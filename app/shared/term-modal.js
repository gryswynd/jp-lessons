/**
 * app/shared/term-modal.js
 * Shared term-detail modal: one DOM overlay reused across all feature modules.
 *
 * Modules that currently duplicate this logic:
 *   - Lesson.js  — inline modal creation + population (lines ~297-363)
 *   - Review.js  — injectModal() + populateModal logic (lines ~496-567)
 *   - Story.js   — setupTermModal() function (lines ~375-480)
 *
 * Load this file before any feature module scripts.
 */

(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  window.JPShared.termModal = {

    /**
     * Inject the shared .jp-modal-overlay into the DOM (idempotent — safe to
     * call multiple times; only inserts once).
     * TODO: implement
     *   - Create .jp-modal-overlay > .jp-modal > [.jp-close-btn, #jp-modal-content]
     *   - Inject shared CSS if not already present (id='jp-modal-style')
     *   - Wire close button and overlay-click-outside to hide()
     */
    init: function () {
      // TODO: guard — if '.jp-modal-overlay' already in DOM, return early
      // TODO: create overlay element and inner .jp-modal markup
      // TODO: inject CSS (position:fixed, backdrop-filter:blur, z-index:999999, etc.)
      // TODO: attach close handlers (close button + click-outside)
      // TODO: append to document.body
    },

    /**
     * Populate and display the modal for a given glossary term.
     * @param {Object} term - glossary entry
     * @param {string} term.surface - the Japanese word or phrase
     * @param {string} term.reading - furigana / romaji reading
     * @param {string} term.meaning - English definition
     * @param {string} [term.pos]   - part of speech (optional)
     * @param {string} [term.notes] - additional notes (optional)
     * TODO: implement (consolidate from Lesson.js + Review.js + Story.js modal population)
     */
    show: function (term) {
      // TODO: call this.init() to ensure overlay exists
      // TODO: build inner HTML from term fields
      // TODO: include a 🔊 speak button wired to JPShared.tts.speak(term.surface)
      // TODO: set overlay display to 'flex'
    },

    /**
     * Hide the modal.
     * TODO: implement
     */
    hide: function () {
      // TODO: set .jp-modal-overlay display to 'none'
    }

  };

})();
