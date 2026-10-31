# Phraseo-Barrier Matrix — notes for Claude

Companion website for the study guide “Phraseo-Barrier Matrix” (Jumayeva S.M., UzSWLU, 2026): English idioms,
phrasal verbs and collocations taught through 19 stories. Static site (vanilla HTML/CSS/JS, hash router), no build step.
Hosting: GitHub Pages from `main` / root → https://shavkatnurmanov9701.github.io/phraseo-barrier-matrix/
Every push to `main` goes live in 1–2 minutes, so test locally first (`python3 -m http.server`).

## Talking with the owner
- Reply in **Uzbek (Latin)**, short (owner reads on a phone). Use `‘` in o‘, g‘ and `’` for the tutuq belgisi.
- The owner checks changes on the live site.

## Design
- Same design system as EnNote (ennote.uz, repo shavkatnurmanov9701/EnNote): navy hero panel with dot grid,
  white rounded cards (24px) with soft shadows, colored icon tiles, pill nav, Bricolage Grotesque + Figtree + JetBrains Mono.
- Fonts are self-hosted in `fonts/`; icons are Lucide paths in `js/icons.js` (add new ones from `lucide-static`).
- Lesson kinds: idiom (violet), phrasal (blue), phrase (teal), vocab (amber).

## Content
- `js/data/lessons.js`: 19 lessons. Site numbers 1–19; the book skips Story 15, so each lesson keeps `book` + `page`.
- 17 story texts are images in the book (`img/posters/NN.webp`); stories 5 and 7 are text in `lessons.js`.
- `js/data/book.js`: annotation (uz/en/ru), introduction, methodology, hero idioms (Uzbek literal + meaning).

## Interactive lessons
- Exercise kinds: `match`, `gap` (word bank + select), `tf`, `mcq`, `hunt` (tap idiom words + meaning),
  `sentences` / `essay` (writing; idioms detected with `idiomMatcher`, autosaved in localStorage).
- Story text uses `[[shown|Glossary term]]` markup → tappable idioms with their meaning.
- Progress: localStorage `pbm-progress` (per lesson), drafts `pbm-w-<lesson>-<id>`.
- The owner postponed voice-over/karaoke reading for stories (asked 2026-11-01): don't build it until asked.

## Domain
- phrasebar.uz (registrar PS Cloud, DNS zone on ns1/ns2.pscloud.uz): 4 A records → GitHub Pages IPs, www CNAME → shavkatnurmanov9701.github.io.
  `CNAME` file in the repo was created by GitHub — keep it.

## Stages
1. ✅ Structure and design (EnNote style)
2. ✅ Pilot lesson 1: interactive exercises (`js/practice.js`, data in `js/data/practice/l01.js`, registry `index.js`)
3. ⏳ Remaining lessons, story texts from the posters
4. ⏳ Uzbek equivalents in the glossary, flashcards, quizzes
