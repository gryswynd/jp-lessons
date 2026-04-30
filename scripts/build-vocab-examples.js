#!/usr/bin/env node
/*
 * scripts/build-vocab-examples.js
 *
 * Writes an `example` field onto each vocab entry in the N5 and N4
 * glossaries, using the same heuristic as scripts/audit-example-picker.js:
 *   home-lesson first; section priority warmup > reading > conversation;
 *   tie-break shortest jp.
 *
 * Sentences are extracted from every lesson's warmup.items[],
 * reading.passage[], and conversation.lines[] — only items with a jp
 * string and a non-empty terms[] array.
 *
 * Fields written to each vocab entry (auto-generated):
 *   example: {
 *     jp: string,
 *     en: string,
 *     lessonId: string,
 *     sectionType: 'warmup' | 'reading' | 'conversation'
 *   }
 *
 * Hand-written fallback examples may be present on entries that have no
 * lesson sentence covering them. They look like:
 *   example: {
 *     jp: string,
 *     en: string,
 *     manual: true,
 *     terms: [...]   // for Phase B clickable chips
 *   }
 * These are preserved across rebuilds. An auto-match (when one becomes
 * available) overwrites the manual fallback.
 *
 * Run: node scripts/build-vocab-examples.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'manifest.json');
const SECTION_PRIORITY = { warmup: 1, reading: 2, conversation: 3 };

function termId(term) {
  if (typeof term === 'string') return term;
  if (term && typeof term === 'object' && term.id) return term.id;
  return null;
}

function extractSentences(lessonJson) {
  const lessonId = lessonJson.id || '?';
  const out = [];
  for (const section of (lessonJson.sections || [])) {
    const type = section.type;
    if (type === 'warmup') {
      for (const item of (section.items || [])) {
        if (item && item.jp && Array.isArray(item.terms)) {
          out.push({ jp: item.jp, en: item.en || '', terms: item.terms, lessonId, sectionType: 'warmup' });
        }
      }
    } else if (type === 'reading') {
      const passage = Array.isArray(section.passage) ? section.passage : [];
      for (const item of passage) {
        if (item && item.jp && Array.isArray(item.terms)) {
          out.push({ jp: item.jp, en: item.en || '', terms: item.terms, lessonId, sectionType: 'reading' });
        }
      }
    } else if (type === 'conversation') {
      for (const line of (section.lines || [])) {
        if (line && line.jp && Array.isArray(line.terms)) {
          out.push({ jp: line.jp, en: line.en || '', terms: line.terms, lessonId, sectionType: 'conversation' });
        }
      }
    }
  }
  return out;
}

function buildIndex(allSentences) {
  const idx = {};
  for (const sent of allSentences) {
    const seen = new Set();
    for (const term of sent.terms) {
      const id = termId(term);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      if (!idx[id]) idx[id] = [];
      idx[id].push(sent);
    }
  }
  return idx;
}

function pickExample(vocabId, homeLessonId, index) {
  const pool = index[vocabId];
  if (!pool || pool.length === 0) return null;
  const scored = pool.map((s, i) => ({
    sent: s,
    home: homeLessonId && s.lessonId === homeLessonId ? 0 : 1,
    sectionRank: SECTION_PRIORITY[s.sectionType] || 9,
    jpLen: s.jp.length,
    origIdx: i
  }));
  scored.sort((a, b) => {
    if (a.home !== b.home) return a.home - b.home;
    if (a.sectionRank !== b.sectionRank) return a.sectionRank - b.sectionRank;
    if (a.jpLen !== b.jpLen) return a.jpLen - b.jpLen;
    return a.origIdx - b.origIdx;
  });
  return scored[0].sent;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const levels = manifest.levels || ['N5', 'N4'];

  const allSentences = [];
  const glossaryFiles = [];

  for (const lvl of levels) {
    const levelData = manifest.data[lvl] || {};
    const glossaryPath = path.join(ROOT, levelData.glossary);
    glossaryFiles.push({ level: lvl, path: glossaryPath });

    for (const lessonEntry of (levelData.lessons || [])) {
      const lessonPath = path.join(ROOT, lessonEntry.file);
      if (!fs.existsSync(lessonPath)) {
        console.warn('missing lesson file:', lessonPath);
        continue;
      }
      try {
        const lessonJson = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
        allSentences.push(...extractSentences(lessonJson));
      } catch (e) {
        console.warn('failed to parse', lessonPath, e.message);
      }
    }
  }

  const index = buildIndex(allSentences);

  const summary = { total: 0, written: 0, noMatch: 0, perLevel: {} };

  for (const gf of glossaryFiles) {
    const glossary = JSON.parse(fs.readFileSync(gf.path, 'utf8'));
    let levelWritten = 0;
    let levelNoMatch = 0;

    for (const entry of glossary.entries) {
      if (entry.type !== 'vocab') continue;
      summary.total++;

      const picked = pickExample(entry.id, entry.lesson_ids || '', index);
      if (!picked) {
        summary.noMatch++;
        levelNoMatch++;
        // Preserve hand-written examples marked manual:true; otherwise drop.
        if (entry.example && !entry.example.manual) delete entry.example;
        continue;
      }

      entry.example = {
        jp: picked.jp,
        en: picked.en,
        lessonId: picked.lessonId,
        sectionType: picked.sectionType
      };
      summary.written++;
      levelWritten++;
    }

    fs.writeFileSync(gf.path, JSON.stringify(glossary, null, 2) + '\n', 'utf8');
    summary.perLevel[gf.level] = { written: levelWritten, noMatch: levelNoMatch };
    console.log(`wrote ${gf.path}: ${levelWritten} examples, ${levelNoMatch} no-match`);
  }

  console.log('\nTotal:', summary);
}

main();
