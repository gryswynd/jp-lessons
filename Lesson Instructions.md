## Kanji Prerequisites
- Before using any kanji in a lesson, confirm it has been introduced in this lesson or an earlier one.
- Source of truth: manifest.json — every lesson entry has a kanji array listing the characters introduced in that lesson, including lessons whose .json files have not been built yet. Do not rely on grepping newKanji across lesson files, as early lessons may not have files yet.
- To check: Read manifest.json, collect the kanji arrays for all lessons with a lesson number ≤ the current lesson, and flatten into a taught-kanji set. Any kanji not in that set has not been taught.
- Never assume a kanji is taught just because a compound word is natural Japanese.

## Terms Arrays — Verb and Adjective Forms
In every `terms` array (passage sentences, conversation lines,
reading questions, drill items):
- Nouns, adverbs, particles, question words → bare string ID: `"v_foo"`
- Verbs and い/な adjectives → object with form: `{ "id": "v_foo", "form": "te_form" }`
  Use the form that matches the surface text of that specific sentence.
  If the same verb appears in both a question and its answer in different
  forms, use the form from the answer (what the student must produce).
  Also add any verb that appears in the text even if only in a supporting
  role (e.g. なる in なりましたか).

## Drill Authoring Rules by Type
- **Drill 1 (Vocabulary MCQ)**: reading/meaning recognition only.
  No `terms` array on items — the tested word is self-evident from `q`.
- **Drill 2+ (Fill in the Blank, etc.)**: include `terms` covering
  the blanked word and any key context words in the prompt.
