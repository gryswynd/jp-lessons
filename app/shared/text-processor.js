/**
 * app/shared/text-processor.js
 * Shared conjugation engine and text annotation for Japanese lesson content.
 *
 * Replaces duplicated implementations in:
 *   - Lesson.js  — GODAN_MAPS, conjugate(), processText(), getRootTerm()
 *   - Review.js  — GODAN_MAPS (3/5 maps), conjugate() method (missing reading &
 *                  meaning updates), processText() method, getRootTerm() method
 *   - Story.js   — GODAN_MAPS, conjugate() (dead code, never called at runtime;
 *                  processStoryHTML / findTermsInText kept in Story.js because
 *                  they use a TreeWalker on already-rendered marked.js HTML and
 *                  take a surface→{id,form} dict rather than term-ref arrays)
 *
 * Load this file before any feature module scripts.
 */

(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  // ---------------------------------------------------------------------------
  // Godan verb stem-change tables (canonical 5-map set from Lesson.js)
  // ---------------------------------------------------------------------------
  var GODAN_MAPS = {
    u_to_i: { 'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち', 'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り' },
    u_to_a: { 'う': 'わ', 'く': 'か', 'ぐ': 'が', 'す': 'さ', 'つ': 'た', 'ぬ': 'な', 'ぶ': 'ば', 'む': 'ま', 'る': 'ら' },
    u_to_e: { 'う': 'え', 'く': 'け', 'ぐ': 'げ', 'す': 'せ', 'つ': 'て', 'ぬ': 'ね', 'ぶ': 'べ', 'む': 'め', 'る': 'れ' },
    ta_form: { 'う': 'った', 'つ': 'った', 'る': 'った', 'む': 'んだ', 'ぶ': 'んだ', 'ぬ': 'んだ', 'く': 'いた', 'ぐ': 'いだ', 'す': 'した' },
    te_form: { 'う': 'って', 'つ': 'って', 'る': 'って', 'む': 'んで', 'ぶ': 'んで', 'ぬ': 'んで', 'く': 'いて', 'ぐ': 'いで', 'す': 'して' }
  };

  window.JPShared.textProcessor = {

    // Expose maps in case callers need direct access
    GODAN_MAPS: GODAN_MAPS,

    // -------------------------------------------------------------------------
    // conjugate(term, ruleKey, conjugationRules)
    //
    // Applies a conjugation rule to a glossary term object.
    // Canonical implementation from Lesson.js — handles all 4 rule types and
    // correctly updates both surface AND reading (Review.js only updated surface).
    //
    // Supported rule.type values:
    //   replace        — substitute fixed surface + reading from rule
    //   suffix         — remove optional tail, append rule.add to surface+reading
    //   godan_change   — map last kana via GODAN_MAPS, append rule.add
    //   godan_euphonic — map last kana via GODAN_MAPS (no suffix appended)
    //
    // @param {Object} term              - glossary entry (surface, reading, meaning, …)
    // @param {string} ruleKey           - key in conjugationRules (e.g. 'polite_past')
    // @param {Object} conjugationRules  - parsed conjugation_rules.json
    // @returns {Object} new term with updated id / surface / reading / meaning /
    //                   original_id; or the original term if rule not found
    // -------------------------------------------------------------------------
    conjugate: function (term, ruleKey, conjugationRules) {
      if (!term || !conjugationRules) return term;
      var formDef = conjugationRules[ruleKey];
      if (!formDef) return term;

      // Normalise verb class labels used across different data sources
      var vClass = term.verb_class || term.gtype;
      if (vClass === 'u')    vClass = 'godan';
      if (vClass === 'ru')   vClass = 'ichidan';
      if (vClass === 'verb') vClass = 'godan';
      if (!vClass)           vClass = 'godan';

      var rule = formDef.rules[vClass];
      if (!rule) return term;

      var newSurface = term.surface;
      var newReading = term.reading || '';

      if (rule.type === 'replace') {
        newSurface = rule.surface;
        newReading = rule.reading;

      } else if (rule.type === 'suffix') {
        if (rule.remove && newSurface.endsWith(rule.remove)) {
          newSurface = newSurface.slice(0, -rule.remove.length) + rule.add;
          newReading = newReading.slice(0, -rule.remove.length) + rule.add;
        } else {
          newSurface += rule.add;
          newReading += rule.add;
        }

      } else if (rule.type === 'godan_change') {
        var lastChar = newSurface.slice(-1);
        var map = GODAN_MAPS[rule.map];
        if (map && map[lastChar]) {
          newSurface = newSurface.slice(0, -1) + map[lastChar] + rule.add;
          // Reading tail may differ from surface tail (e.g. kanji surface, kana reading)
          newReading = newReading.slice(0, -1) + (map[newReading.slice(-1)] || newReading.slice(-1)) + rule.add;
        }

      } else if (rule.type === 'godan_euphonic') {
        var lastChar = newSurface.slice(-1);
        var lastReadingChar = newReading.slice(-1);
        var map = GODAN_MAPS[rule.map];
        if (map && map[lastChar]) {
          newSurface = newSurface.slice(0, -1) + map[lastChar];
          newReading = newReading.slice(0, -1) + (map[lastReadingChar] || map[lastChar]);
        }
      }

      return Object.assign({}, term, {
        id:          term.id + '_' + ruleKey,
        surface:     newSurface,
        reading:     newReading,
        meaning:     term.meaning + ' (' + formDef.label + ')',
        original_id: term.id
      });
    },

    // -------------------------------------------------------------------------
    // processText(text, termRefs, termMap, conjugationRules, counterRules)
    //
    // HTML-escapes text, then wraps each recognised term in a clickable span
    // that fires window.JP_OPEN_TERM(id, true).
    //
    // termRefs entries can be:
    //   string            — direct term ID looked up in termMap
    //   {id, form}        — term ID + conjugation form; conjugated result is
    //                       cached back into termMap so openTerm() can find it
    //   {counter, n}      — counter engine call; synthetic term is generated
    //                       via JPShared.counterEngine and cached in termMap
    //                       e.g. { "counter": "ji", "n": 8 } → 八時/はちじ
    //
    // Terms are matched longest-surface-first to prevent partial overlaps.
    // Falls back to t.reading when t.surface isn't found in the escaped HTML.
    //
    // @param {string}   text              - raw Japanese text
    // @param {Array}    termRefs          - array of string IDs or {id,form}/{counter,n} objects
    // @param {Object}   termMap           - mutable { id → term } lookup; generated
    //                                       terms are written back here
    // @param {Object}   conjugationRules  - parsed conjugation_rules.json
    // @param {Object}   counterRules      - parsed counter_rules.json (optional)
    // @returns {string} HTML string safe for innerHTML
    // -------------------------------------------------------------------------
    processText: function (text, termRefs, termMap, conjugationRules, counterRules) {
      if (!text) return '';
      var html = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (!termRefs || termRefs.length === 0) return html;

      var self = this;
      var terms = termRefs.map(function (ref) {
        if (typeof ref === 'string') {
          return termMap[ref] || null;
        }
        if (typeof ref === 'object' && ref.id && ref.form) {
          var rootTerm = termMap[ref.id];
          if (!rootTerm) return null;
          var conjugated = self.conjugate(rootTerm, ref.form, conjugationRules);
          if (conjugated) termMap[conjugated.id] = conjugated; // cache for openTerm()
          return conjugated;
        }
        if (typeof ref === 'object' && ref.counter !== undefined) {
          if (!counterRules || !window.JPShared.counterEngine) return null;
          var counterTerm = window.JPShared.counterEngine.buildCounterTerm(
            ref.counter, ref.n, counterRules
          );
          if (counterTerm) termMap[counterTerm.id] = counterTerm; // cache for openTerm()
          return counterTerm;
        }
        return null;
      }).filter(Boolean).sort(function (a, b) {
        return b.surface.length - a.surface.length; // longest first → no partial matches
      });

      terms.forEach(function (t) {
        var matchedForm = null;
        if (html.indexOf(t.surface) !== -1) {
          matchedForm = t.surface;
        } else if (t.reading && html.indexOf(t.reading) !== -1) {
          matchedForm = t.reading; // fallback: match hiragana reading
        }
        if (matchedForm) {
          var span = '<span class="jp-term" onclick="window.JP_OPEN_TERM(\'' + t.id + '\', true)">' + matchedForm + '</span>';
          html = html.split(matchedForm).join(span);
        }
      });

      return html;
    },

    // -------------------------------------------------------------------------
    // getRootTerm(termId, termMap)
    //
    // Resolves a potentially-conjugated term ID to its base glossary entry.
    // Used by auto-flagging logic when a learner answers incorrectly — flags
    // the root term, not the conjugated form.
    //
    // Strategy:
    //   1. Direct lookup in termMap; if found and has original_id, follow it.
    //   2. Progressively strip '_'-delimited suffixes (conjugation form keys are
    //      appended as `${termId}_${ruleKey}`) until a base term is found.
    //
    // @param {string} termId   - term ID (may be base or conjugated form)
    // @param {Object} termMap  - { id → term } lookup
    // @returns {Object|null}   - base term object, or null if not found
    // -------------------------------------------------------------------------
    getRootTerm: function (termId, termMap) {
      var term = termMap[termId];
      if (term) {
        return term.original_id ? termMap[term.original_id] : term;
      }

      // Term not found — likely a conjugated form not yet generated.
      // Progressively strip trailing _-delimited segments to find the base.
      var parts = termId.split('_');
      while (parts.length > 1) {
        parts.pop();
        var candidateId = parts.join('_');
        term = termMap[candidateId];
        if (term) {
          return term.original_id ? termMap[term.original_id] : term;
        }
      }

      return null;
    }

  };

})();
