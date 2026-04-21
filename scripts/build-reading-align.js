#!/usr/bin/env node
/*
 * scripts/build-reading-align.js
 *
 * Auto-populates the `readingAlign` field on every vocab entry in
 * data/N4/glossary.N4.json and data/N5/glossary.N5.json by walking each
 * vocab's surface character by character, matching each kanji against
 * its on/kun readings (from the same glossaries merged), and greedy-
 * aligning against the reading string with rendaku-aware variants.
 *
 * Output format examples:
 *   "持(も)ち帰(かえ)る"   — per-kanji split
 *   "今日{きょう}"         — jukujikun (whole kanji run, single reading)
 *
 * Entries the algorithm can't resolve are flagged to
 * scripts/output/readingAlign-review.txt with a PROPOSAL for humans to
 * confirm or edit.  Idempotent: never overwrites an existing
 * readingAlign value unless --force is passed.
 *
 * Also emits scripts/output/kanjiMeanings-review.txt listing vocab
 * where the per-kanji default glossary meanings don't obviously relate
 * to the compound meaning (heuristic: no overlap with vocab.meaning).
 *
 * Run:
 *   node scripts/build-reading-align.js           # idempotent
 *   node scripts/build-reading-align.js --force   # overwrite existing
 *   node scripts/build-reading-align.js --dry     # don't write glossaries
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'manifest.json');
const OUT_DIR = path.join(ROOT, 'scripts', 'output');
const REVIEW_ALIGN = path.join(OUT_DIR, 'readingAlign-review.txt');
const REVIEW_KANJI = path.join(OUT_DIR, 'kanjiMeanings-review.txt');

const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const DRY = args.has('--dry');

// ---- Kanji detection ----
function isKanji(ch) {
  if (!ch) return false;
  const c = ch.charCodeAt(0);
  return c >= 0x4E00 && c <= 0x9FFF;
}

// ---- Rendaku voicing map (first-consonant voicing on non-initial morpheme) ----
const RENDAKU = {
  'か':'が','き':'ぎ','く':'ぐ','け':'げ','こ':'ご',
  'さ':'ざ','し':'じ','す':'ず','せ':'ぜ','そ':'ぞ',
  'た':'だ','ち':'ぢ','つ':'づ','て':'で','と':'ど',
  'は':['ば','ぱ'],'ひ':['び','ぴ'],'ふ':['ぶ','ぷ'],'へ':['べ','ぺ'],'ほ':['ぼ','ぽ']
};

// Geminable ending chars: when followed by k/s/t/p-line kana, last char can become っ
const GEMINABLE_ENDINGS = new Set(['く','つ','ち','き']);

// ---- Parse a kanji entry's readings into candidate core strings ----
// e.g. k_chuu: on="ちゅう", kun="そそ(ぐ)" → ["ちゅう", "そそ"]
// e.g. k_bun: on="ぶん / もん", kun="ふみ" → ["ぶん", "もん", "ふみ"]
// Splits on both / and ; to handle inconsistent separators in the data.
// Also includes progressively truncated prefixes of kun verb forms so
// that entries like 洗う (kun="あらう") contribute "あら" / "あらう" and
// 止まる (kun="とめる / とまる") contributes "と" / "とめる" / "とまる".
function parseReadings(kanjiEntry) {
  if (!kanjiEntry) return [];
  const readings = new Set();
  ['on','kun','reading'].forEach(function (field) {
    const raw = (kanjiEntry[field] || '').trim();
    if (!raw) return;
    raw.split(/[\/;]/).forEach(function (piece) {
      piece = piece.trim();
      if (!piece) return;
      // Strip everything inside parentheses (okurigana hint)
      const core = piece.replace(/[（(][^）)]*[）)]/g, '').trim();
      if (!core) return;
      readings.add(core);
      // Truncation variants: add each non-empty prefix so verb kun forms
      // like "あらう" / "とめる" can match the bare stem portion.
      // (Only for kun-like readings; on readings are already minimal.)
      if (field !== 'on') {
        for (let i = 1; i < core.length; i++) {
          readings.add(core.slice(0, i));
        }
      }
    });
  });
  // Sort longer readings first (greedy prefers longer matches)
  return Array.from(readings).sort((a, b) => b.length - a.length);
}

// Pseudo-entry for the iteration mark 々: copies the previous kanji's
// readings so that 人々 (ひとびと) aligns as 人→ひと, 々→びと (rendaku).
function iterationEntry(prevKanjiEntry) {
  return prevKanjiEntry ? { on: '', kun: '', reading: '', _copiedFrom: prevKanjiEntry } : null;
}
function readingsForPseudoIteration(prevKanjiEntry) {
  return parseReadings(prevKanjiEntry);
}

// ---- Generate all plausible reading variants for a kanji at this position ----
function variantsFor(reading, nonInitial) {
  const out = [reading];
  if (nonInitial && reading.length > 0) {
    const first = reading[0];
    const rest = reading.slice(1);
    const voiced = RENDAKU[first];
    if (voiced) {
      if (Array.isArray(voiced)) voiced.forEach(v => out.push(v + rest));
      else out.push(voiced + rest);
    }
  }
  // Gemination: two modes, since either can occur depending on the reading.
  //   (1) Replace last char with っ:  いち → いっ,  がく → がっ
  //   (2) Append っ:                 き → きっ,   に → にっ
  // Produce both; the algorithm tries whichever aligns.
  if (reading.length > 0) {
    if (GEMINABLE_ENDINGS.has(reading[reading.length - 1])) {
      const replaced = reading.slice(0, -1) + 'っ';
      if (replaced.length > 0) out.push(replaced);
    }
    out.push(reading + 'っ');
  }
  return out;
}

// ---- Alignment algorithm ----
// Tries to partition the reading string into per-kanji runs; returns an
// array of {ch, kanjiReading|null} entries or null on failure.
function tryAlign(surface, reading, kanjiMap) {
  const surfaceChars = Array.from(surface);
  const readingChars = Array.from(reading);
  const memo = new Map();

  function key(si, ri) { return si + ',' + ri; }

  function walk(si, ri, firstKanjiSeen, prevKanjiEntry) {
    if (si === surfaceChars.length) {
      return ri === readingChars.length ? [] : null;
    }
    const k = key(si, ri) + ',' + (prevKanjiEntry ? prevKanjiEntry.surface : '-');
    if (memo.has(k)) return memo.get(k);

    const ch = surfaceChars[si];
    let result = null;

    if (isKanji(ch) || ch === '々') {
      let entry, readings;
      if (ch === '々') {
        entry = prevKanjiEntry;
        readings = readingsForPseudoIteration(prevKanjiEntry);
      } else {
        entry = kanjiMap[ch];
        readings = parseReadings(entry);
      }
      // Try each reading, longest first, with rendaku/gemination variants.
      for (let r of readings) {
        const variants = variantsFor(r, firstKanjiSeen || ch === '々');
        for (const v of variants) {
          if (v.length === 0) continue;
          let matches = true;
          for (let i = 0; i < v.length; i++) {
            if (readingChars[ri + i] !== v[i]) { matches = false; break; }
          }
          if (!matches) continue;
          const nextPrev = (ch === '々') ? prevKanjiEntry : entry;
          const rest = walk(si + 1, ri + v.length, true, nextPrev);
          if (rest !== null) {
            result = [{ ch: ch, kanjiReading: v }].concat(rest);
            memo.set(k, result);
            return result;
          }
        }
      }
    } else {
      // Kana — must match exactly at current position.
      if (ri < readingChars.length && readingChars[ri] === ch) {
        const rest = walk(si + 1, ri + 1, firstKanjiSeen, prevKanjiEntry);
        if (rest !== null) {
          result = [{ ch: ch, kanjiReading: null }].concat(rest);
        }
      }
    }

    memo.set(k, result);
    return result;
  }

  return walk(0, 0, false, null);
}

// ---- Format an alignment into the inline readingAlign string ----
function formatAlignment(parts) {
  let out = '';
  for (const p of parts) {
    if (p.kanjiReading) out += p.ch + '(' + p.kanjiReading + ')';
    else out += p.ch;
  }
  return out;
}

// ---- Jukujikun fallback: wrap whole kanji run with {reading} ----
// Used when per-kanji alignment fails but surface is entirely kanji.
function jukujikunWrap(surface, reading) {
  return surface + '{' + reading + '}';
}

// ---- Kanji-meaning sanity check ----
// For a multi-kanji vocab, flag if none of the per-kanji glossary meanings
// have a token that overlaps the vocab's meaning (first slash-segment of each).
function wordSet(str) {
  return new Set(
    String(str || '').toLowerCase()
      .split(/[\/,;\s\-()]+/)
      .map(s => s.trim())
      .filter(s => s.length > 2)
  );
}

function meaningOverlap(vocabEntry, kanjiMap) {
  const chars = Array.from(vocabEntry.surface || '').filter(isKanji);
  if (chars.length === 0) return { kanjiCount: 0, overlap: true };
  const vocabTokens = wordSet(vocabEntry.meaning);
  if (vocabTokens.size === 0) return { kanjiCount: chars.length, overlap: false };
  for (const ch of chars) {
    const entry = kanjiMap[ch];
    if (!entry) continue;
    const kanjiTokens = wordSet(entry.meaning);
    for (const t of kanjiTokens) {
      if (vocabTokens.has(t)) return { kanjiCount: chars.length, overlap: true };
      // also check substring match for longer vocab tokens
      for (const v of vocabTokens) {
        if (v.includes(t) || t.includes(v)) return { kanjiCount: chars.length, overlap: true };
      }
    }
  }
  return { kanjiCount: chars.length, overlap: false };
}

// ---- Main ----
function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const levels = manifest.levels || ['N5', 'N4'];

  // Load both glossaries; build a merged kanji-by-surface map (cross-level).
  const glossaries = {};
  const kanjiMap = {};
  for (const lvl of levels) {
    const p = path.join(ROOT, manifest.data[lvl].glossary);
    const g = JSON.parse(fs.readFileSync(p, 'utf8'));
    glossaries[lvl] = { path: p, json: g };
    g.entries.forEach(function (e) {
      if (e.type === 'kanji' && e.surface) kanjiMap[e.surface] = e;
    });
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const alignReview = [];
  const kanjiReview = [];
  const stats = {
    total: 0,
    pureKana: 0,
    already: 0,
    aligned: 0,
    jukujikun: 0,
    failed: 0,
    kanjiOverlapMissing: 0
  };

  for (const lvl of levels) {
    const g = glossaries[lvl].json;
    for (const entry of g.entries) {
      if (entry.type !== 'vocab') continue;
      stats.total++;

      const surface = entry.surface || '';
      const reading = entry.reading || '';
      const hasKanji = Array.from(surface).some(isKanji);

      if (!hasKanji) { stats.pureKana++; continue; }

      if (entry.readingAlign && !FORCE) { stats.already++; continue; }

      const parts = tryAlign(surface, reading, kanjiMap);
      if (parts) {
        entry.readingAlign = formatAlignment(parts);
        stats.aligned++;
      } else if (Array.from(surface).every(isKanji)) {
        entry.readingAlign = jukujikunWrap(surface, reading);
        stats.jukujikun++;
        alignReview.push({
          id: entry.id, surface, reading, proposal: entry.readingAlign,
          note: 'jukujikun fallback (no per-kanji alignment) — review if a split is possible'
        });
      } else {
        // Mixed kanji+kana where alignment failed — do NOT emit a guess.
        stats.failed++;
        alignReview.push({
          id: entry.id, surface, reading, proposal: null,
          note: 'alignment failed on mixed kanji+kana surface — please author readingAlign manually'
        });
      }

      // Kanji-meaning sanity check
      const overlap = meaningOverlap(entry, kanjiMap);
      if (overlap.kanjiCount > 0 && !overlap.overlap) {
        stats.kanjiOverlapMissing++;
        kanjiReview.push({
          id: entry.id, surface, reading, meaning: entry.meaning,
          perKanji: Array.from(surface).filter(isKanji).map(ch => ({
            kanji: ch,
            meaning: kanjiMap[ch] ? kanjiMap[ch].meaning : '(not in glossary)'
          }))
        });
      }
    }
  }

  // Write glossaries back.
  if (!DRY) {
    for (const lvl of levels) {
      const { path: p, json } = glossaries[lvl];
      fs.writeFileSync(p, JSON.stringify(json, null, 2) + '\n', 'utf8');
      console.log('Wrote', p);
    }
  } else {
    console.log('(dry run — no files written)');
  }

  // Write align review.
  {
    const lines = [
      '# readingAlign review',
      '# Generated by scripts/build-reading-align.js',
      '# Entries where the auto-aligner fell back to jukujikun or failed entirely.',
      '# Review each; edit the readingAlign field in the glossary manually if the',
      '# proposal is wrong.',
      '',
      '# Summary: ' + alignReview.length + ' entries to review',
      ''
    ];
    for (const r of alignReview) {
      lines.push(r.id + '  ' + r.surface + ' (' + r.reading + ')');
      if (r.proposal) lines.push('  proposal: ' + r.proposal);
      else lines.push('  proposal: (none — needs manual authoring)');
      lines.push('  note: ' + r.note);
      lines.push('');
    }
    fs.writeFileSync(REVIEW_ALIGN, lines.join('\n'), 'utf8');
    console.log('Wrote', REVIEW_ALIGN);
  }

  // Write kanji-meanings review.
  {
    const lines = [
      '# kanjiMeanings review',
      '# Generated by scripts/build-reading-align.js',
      '# Vocab entries where none of the per-kanji glossary meanings obviously',
      '# relate to the vocab meaning.  Consider adding a kanjiMeanings override',
      '# array (one slot per surface char; "" for kana positions).',
      '',
      '# Summary: ' + kanjiReview.length + ' entries to review',
      ''
    ];
    for (const r of kanjiReview) {
      lines.push(r.id + '  ' + r.surface + ' (' + r.reading + ') "' + r.meaning + '"');
      for (const k of r.perKanji) {
        lines.push('  ' + k.kanji + ' → ' + k.meaning);
      }
      lines.push('');
    }
    fs.writeFileSync(REVIEW_KANJI, lines.join('\n'), 'utf8');
    console.log('Wrote', REVIEW_KANJI);
  }

  console.log('\nSummary:', stats);
}

main();
