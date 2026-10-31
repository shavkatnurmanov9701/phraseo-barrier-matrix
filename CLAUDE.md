# Phraseo-Barrier Matrix — notes for Claude

Companion website for the study guide “Phraseo-Barrier Matrix” (Jumayeva S.M., UzSWLU, 2026): English idioms,
phrasal verbs and collocations taught through 19 stories. Static site (vanilla HTML/CSS/JS, hash router), no build step.
Hosting: GitHub Pages from `main` / root → https://shavkatnurmanov9701.github.io/phraseo-barrier-matrix/
Every push to `main` goes live in 1–2 minutes, so test locally first (`python3 -m http.server`).

## Talking with the owner
- Reply in **Uzbek (Latin)**, short (owner reads on a phone). Use `‘` in o‘, g‘ and `’` for the tutuq belgisi.
- The owner checks changes on the live site.

## Design (owner's choice 2026-11-01: “Wollo”-style landing, sent as a screen recording)
- Brand name on the site: **phrasebar** (lowercase wordmark), domain phrasebar.uz. Book title stays “Phraseo-Barrier Matrix”.
- White background, light-weight big headings (Inter Tight 400, tight letter-spacing, centered), grey cards (#F4F4F7, radius 28),
  accent blocks: violet #4F2BEF, pink #F2509A, yellow #FFC93C, orange #FF6A2B, periwinkle #6470F0. Pill nav + black CTA button.
- Home (owner 2026-11-01: book + lessons must be at the top, interactive): hero = book title “Phraseo-Barrier Matrix” →
  violet card with a **3D book** whose cover opens on scroll / tap (back of cover = book info, right page = clickable
  “Mundarija” with book page numbers; on phones it stacks: cover, info, contents) → “Kitobdagi darslar”: 01/02/03 type cards
  act as filters + lesson cards → idiom of the day → rolling idiom chip → statement → big numbers → FAQ → CTA.
- Illustrations are hand-drawn SVG in `js/art.js` (literal idioms: cow over the moon, piece of cake, ice cube, spilled beans, heart).
  AI image generation was unavailable (ElevenLabs out of credits, Canva disabled, HF invoke off). Swap in real 3D renders later if provided.
- Font self-hosted in `fonts/` (Inter Tight); icons are Lucide paths in `js/icons.js`.
- Lesson kinds: idiom (orange), phrasal (pink), phrase (violet), vocab (amber).
- Previous EnNote-style design was replaced at the owner's request (“EnNote bilan bir xil bo‘lib qoldi”).

## Content
- `js/data/lessons.js`: 19 lessons. Site numbers 1–19; the book skips Story 15, so each lesson keeps `book` + `page`.
- 17 story texts are images in the book (`img/posters/NN.webp`); stories 5 and 7 are text in `lessons.js`.
- `js/data/book.js`: annotation (uz/en/ru), introduction, methodology, hero idioms (Uzbek literal + meaning).

## Interactive lessons
- Exercise kinds: `match`, `gap` (word bank + select), `tf`, `mcq`, `hunt` (tap idiom words + meaning),
  `sentences` / `essay` (writing; idioms detected with `idiomMatcher`, autosaved in localStorage).
- Stories are shown as the **book page image** (owner's choice, 2026-11-01). `story` text in practice files is kept
  only as data (markup `[[shown|Glossary term]]`), it is displayed only for lessons without a poster.
- Progress: localStorage `pbm-progress` (per lesson), drafts `pbm-w-<lesson>-<id>`.
- Owner's template (2026-11-01): warm-up + auto-checked exercises only. **No writing tasks (own sentences, essays)
  and no homework** on interactive lessons. The engine still supports `sentences`/`essay` if asked later.
- No audio / karaoke for stories (owner decided 2026-11-01). Don't build it unless asked.

## Domain
- phrasebar.uz (registrar PS Cloud, DNS zone on ns1/ns2.pscloud.uz): 4 A records → GitHub Pages IPs, www CNAME → shavkatnurmanov9701.github.io.
  Custom domain was removed from Pages on 2026-11-01 until DNS propagates; the owner re-adds it in Settings → Pages.

## Stages
1. ✅ Structure and design (EnNote style)
2. ✅ Pilot lesson 1: interactive exercises (`js/practice.js`, data in `js/data/practice/l01.js`, registry `index.js`)
3. ⏳ Remaining lessons, story texts from the posters
4. ⏳ Uzbek equivalents in the glossary, flashcards, quizzes
