/**
 * app/shared/progress.js
 * Shared progress persistence: flags, streaks, best scores, and draft storage
 * via localStorage, with a consistent key schema.
 *
 * Modules that currently duplicate this logic:
 *   - Practice.js — flag counts, active flags, streak & best-score tracking
 *                   (localStorage keys: k-flags, k-active-flags, k-best-*)
 *   - Lesson.js   — flag get/set for individual terms (k-flags, k-active-flags)
 *   - Compose.js  — draft saving per prompt (compose-draft-<id>)
 *   - Review.js   — review scores (k-review-scores)
 *
 * localStorage key schema (all keys are module-prefixed):
 *   jp.flags              — { [termId]: number }   flag counts per term
 *   jp.activeFlags        — { [termId]: boolean }  which terms are currently flagged
 *   jp.bestScores         — { [category]: number } best streak per practice category
 *   jp.reviewScores       — { [lessonId]: Object } review results
 *   jp.composeDraft.<id>  — string                 in-progress compose draft
 *
 * Load this file before any feature module scripts.
 */

(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  window.JPShared.progress = {

    // --- Flags ---

    /**
     * Return the flags map { termId → count }.
     * TODO: implement — JSON.parse from localStorage key 'jp.flags'
     */
    getFlags: function () {
      // TODO: return JSON.parse(localStorage.getItem('jp.flags') || '{}')
    },

    /**
     * Persist the flags map.
     * @param {Object} flags - { [termId]: number }
     * TODO: implement — JSON.stringify to 'jp.flags'
     */
    setFlags: function (flags) {
      // TODO: localStorage.setItem('jp.flags', JSON.stringify(flags))
    },

    /**
     * Return the active-flags map { termId → boolean }.
     * TODO: implement — read from 'jp.activeFlags'
     */
    getActiveFlags: function () {
      // TODO: return JSON.parse(localStorage.getItem('jp.activeFlags') || '{}')
    },

    /**
     * Persist the active-flags map.
     * @param {Object} active - { [termId]: boolean }
     * TODO: implement
     */
    setActiveFlags: function (active) {
      // TODO: localStorage.setItem('jp.activeFlags', JSON.stringify(active))
    },

    // --- Streaks & best scores ---

    /**
     * Get best score for a practice category ('meaning', 'reading', 'vocab', 'verb').
     * @param {string} category
     * @returns {number}
     * TODO: implement — read from 'jp.bestScores' map
     */
    getBestScore: function (category) {
      // TODO: return bestScores[category] || 0
    },

    /**
     * Persist best score for a category if it exceeds the stored value.
     * @param {string} category
     * @param {number} score
     * TODO: implement
     */
    setBestScore: function (category, score) {
      // TODO: read bestScores, update if score > current, write back
    },

    // --- Review scores ---

    /**
     * Get all stored review scores.
     * @returns {Object} { [lessonId]: Object }
     * TODO: implement — read from 'jp.reviewScores'
     */
    getReviewScores: function () {
      // TODO: return JSON.parse(localStorage.getItem('jp.reviewScores') || '{}')
    },

    /**
     * Persist review result for a lesson.
     * @param {string} lessonId
     * @param {Object} result
     * TODO: implement
     */
    setReviewScore: function (lessonId, result) {
      // TODO: read map, set lessonId key, write back
    },

    // --- Compose drafts ---

    /**
     * Get a saved compose draft for a prompt.
     * @param {string} promptId
     * @returns {string} draft text, or empty string
     * TODO: implement
     */
    getComposeDraft: function (promptId) {
      // TODO: return localStorage.getItem('jp.composeDraft.' + promptId) || ''
    },

    /**
     * Save a compose draft.
     * @param {string} promptId
     * @param {string} text
     * TODO: implement
     */
    setComposeDraft: function (promptId, text) {
      // TODO: localStorage.setItem('jp.composeDraft.' + promptId, text)
    },

    /**
     * Clear a compose draft on successful submission.
     * @param {string} promptId
     * TODO: implement
     */
    clearComposeDraft: function (promptId) {
      // TODO: localStorage.removeItem('jp.composeDraft.' + promptId)
    }

  };

})();
