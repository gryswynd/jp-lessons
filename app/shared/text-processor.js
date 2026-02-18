/**
 * app/shared/text-processor.js
 * Shared Japanese text annotation: wraps recognised terms in clickable spans
 * and injects ruby markup for furigana readings.
 *
 * Modules that currently duplicate this logic:
 *   - Lesson.js  — local processText(text, termRefs) function (lines ~271-295)
 *   - Review.js  — ReviewModule.processText(text, termRefs) method (lines ~615-650)
 *
 * Load this file before any feature module scripts.
 */

(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  window.JPShared.textProcessor = {

    /**
     * Annotate a Japanese string: wrap known terms in clickable spans and
     * add <ruby> furigana markup where readings are provided.
     *
     * @param {string}   text      - raw Japanese text
     * @param {Array}    termRefs  - array of term objects from the lesson data,
     *                               each with at minimum { surface, reading, meaning }
     * @param {Function} [onClick] - callback(term) invoked when a span is clicked;
     *                               defaults to JPShared.termModal.show(term)
     * @returns {string} HTML string safe to set as innerHTML
     * TODO: implement (consolidate from Lesson.js processText + Review.js processText)
     *   - Scan text for each term's surface form
     *   - Wrap matched spans with onclick → onClick(term)
     *   - Optionally wrap in <ruby>/<rt> if reading differs from surface
     *   - HTML-escape non-term segments to prevent XSS
     */
    process: function (text, termRefs, onClick) {
      // TODO: default onClick to JPShared.termModal.show
      // TODO: iterate termRefs, locate each surface in text
      // TODO: build HTML with clickable <span class="jp-term"> wrappers
      // TODO: add <ruby>surface<rt>reading</rt></ruby> where appropriate
      // TODO: return assembled HTML string
    },

    /**
     * HTML-escape a plain string (for safe embedding in innerHTML).
     * @param {string} str
     * @returns {string}
     * TODO: implement
     */
    escape: function (str) {
      // TODO: replace &, <, >, ", ' with their HTML entities
    }

  };

})();
