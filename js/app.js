// Phraseo-Barrier Matrix — sahifalar va marshrutlash (hash router).
// Dizayn EnNote (ennote.uz) uslubida.
import { LESSONS, KINDS, ACTIVITY_TYPES, OBJECTIVES, allEntries } from './data/lessons.js';
import { BOOK, HERO_IDIOMS, LESSON_FLOW } from './data/book.js';
import { t, pick, getLang, setLang } from './i18n.js';
import { icon } from './icons.js';
import { PRACTICE } from './data/practice/index.js';
import { renderExercise, bindExercise, idiomMatcher, progressCount, clearLesson } from './practice.js';

const main = document.getElementById('main');
const ENTRIES = allEntries();

/* ---------- Yordamchilar ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lessonUrl = (n) => `#/dars/${n}`;
const kindLabel = (k) => pick(KINDS[k]);
const TOTAL_ACTS = LESSONS.reduce((n, l) => n + l.activities.length, 0);

// Har bir dars mavzusiga mos ikonka
const LESSON_ICONS = {
  1: 'sun', 2: 'map', 3: 'hand-coins', 4: 'users', 5: 'star', 6: 'croissant', 7: 'tent', 8: 'mail',
  9: 'palette', 10: 'door-open', 11: 'plane', 12: 'clock', 13: 'camera', 14: 'calendar-x', 15: 'piggy-bank',
  16: 'bird', 17: 'key-round', 18: 'frame', 19: 'library',
};
const ACT_ICONS = {
  gap: 'text-cursor-input', mcq: 'list-checks', tf: 'square-check-big', match: 'shuffle', order: 'arrow-up-down',
  rewrite: 'repeat', open: 'circle-help', discuss: 'message-circle', write: 'pen-line', video: 'video',
  crossword: 'grid-2x2', riddle: 'puzzle', roleplay: 'users', hunt: 'search',
};
const STEP_ICONS = { warmup: 'lightbulb', story: 'book-open', glossary: 'book-marked', practice: 'list-checks', video: 'video', wrapup: 'message-circle', homework: 'pen-line' };
const STEP_COLORS = { warmup: '#D97706', story: '#2563EB', glossary: '#7C3AED', practice: '#0EA5B7', video: '#DB2777', wrapup: '#4F46E5', homework: '#059669' };

// Lug‘at: bir xil iboralarni birlashtiramiz (bir nechta darsda uchrasa)
const sortKey = (s) => s.replace(/^(a|an|the)\s+/i, '').toLowerCase();
function mergedEntries() {
  const map = new Map();
  for (const e of ENTRIES) {
    const key = e.term.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
    if (!map.has(key)) map.set(key, { term: e.term, kind: e.kind, meanings: [], lessons: [] });
    const m = map.get(key);
    if (!m.meanings.some((x) => x.toLowerCase() === e.meaning.toLowerCase())) m.meanings.push(e.meaning);
    if (!m.lessons.includes(e.lesson)) m.lessons.push(e.lesson);
  }
  return [...map.values()].sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)));
}
const MERGED = mergedEntries();

function youTubeId(url) {
  if (!url) return null;
  const m = url.match(/[?&]v=([\w-]{11})/) || url.match(/shorts\/([\w-]{11})/) || url.match(/youtu\.be\/([\w-]{11})/);
  return m ? m[1] : null;
}

// Hikoya matnida lug‘atdagi iboralarni belgilash (taxminiy moslik)
function highlighter(glossary) {
  const pron = '(?:your|her|his|my|their|our|its)';
  const self = '(?:yourself|herself|himself|myself|themselves|ourselves)';
  const patterns = glossary.map(([term]) => {
    const words = term.replace(/[“”"]/g, '').split(/\s+/).filter(Boolean);
    if (words.length < 2) return null;
    return words.map((w, i) => {
      const lw = w.toLowerCase().replace(/[^a-z’'-]/g, '');
      if (lw === 'your') return pron;
      if (lw === 'yourself') return self;
      if (lw === 'someone' || lw === 'someone’s' || lw === 'something') return '[\\w’\']+';
      const clean = lw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return i === 0 ? `${clean.replace(/e$/, '')}\\w*` : clean;
    }).join('\\s+');
  }).filter(Boolean);
  if (!patterns.length) return (s) => esc(s);
  const re = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');
  return (text) => esc(text).replace(re, '<mark class="hl">$1</mark>');
}

function sectionHead(eyebrow, title, sub, right = '') {
  return `<div class="section-head">
    <div>
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
      <h2 class="h2">${esc(title)}</h2>
      ${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
    </div>${right}
  </div>`;
}

function filtersHtml(scope, kinds = ['idiom', 'phrasal', 'phrase']) {
  return `<div class="seg" role="group" aria-label="Filter" data-filter-scope="${scope}">
    <button type="button" data-filter="all" aria-pressed="true">${t('filter.all')}</button>
    ${kinds.map((k) => `<button type="button" data-filter="${k}" data-kind="${k}" aria-pressed="false"><span class="dot"></span>${kindLabel(k)}</button>`).join('')}
  </div>`;
}

function bindFilters(scope, onChange) {
  const group = document.querySelector(`[data-filter-scope="${scope}"]`);
  group?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    group.querySelectorAll('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    onChange(b.dataset.filter);
  });
}

/* ---------- Dars kartochkasi ---------- */
function lessonCard(l) {
  return `<a class="card lcard" href="${lessonUrl(l.n)}" data-kind="${l.kind}">
    <span class="glow" aria-hidden="true"></span>
    <div class="lcard-top">
      <span class="tile">${icon(LESSON_ICONS[l.n], 22)}</span>
      <span class="pill">${esc(t('lesson.label', l.n).toUpperCase())}</span>
    </div>
    <h3 lang="en">${esc(l.title)}</h3>
    <p class="desc">${esc(pick(l.about))}</p>
    <div class="meta">
      <span>${icon('layers', 14)} ${t('lessons.count', l.glossary.length)}</span>
      <span>${icon('list-checks', 14)} ${t('lessons.acts', l.activities.length)}</span>
    </div>
    ${cardProgress(l.n)}
    <span class="lcard-cta"><span>${t('lessons.open')}</span>${icon('arrow-right', 16)}</span>
  </a>`;
}

function cardProgress(n) {
  const pr = PRACTICE[n];
  if (!pr) return '';
  const { done, total } = progressCount(n, pr);
  const pct = Math.round((done / total) * 100);
  return `<div class="cprog"><div class="cprog-row"><span class="pill soon live">${icon('sparkles', 12)} ${getLang() === 'en' ? 'Interactive' : 'Interaktiv'}</span><span class="tnum">${t('lessons.progress', done, total)}</span></div><div class="bar"><span style="width:${pct}%"></span></div></div>`;
}

// [[ko'rinish|lug'atdagi shakli]] belgilarini bosiladigan iboraga aylantiradi
function storyHtml(paras, glossary) {
  const meaning = new Map(glossary.map(([term, m]) => [term.toLowerCase(), m]));
  return paras.map((p) => `<p>${esc(p).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, shown, term) => {
    const m = meaning.get((term || shown).toLowerCase()) || '';
    return `<button type="button" class="idi" aria-expanded="false" data-m="${esc(m)}">${shown}</button>`;
  })}</p>`).join('');
}

function cardsHtml(filter) {
  const list = LESSONS.filter((l) => filter === 'all' || l.kind === filter);
  if (!list.length) return `<p class="empty-card">${t('lessons.empty')}</p>`;
  return list.map(lessonCard).join('');
}

/* ---------- Bosh sahifa ---------- */
function viewHome() {
  return `
  <section class="hero rise">
    <div class="dotgrid" aria-hidden="true"></div>
    <div class="blob v" aria-hidden="true"></div>
    <div class="blob b" aria-hidden="true"></div>
    <div class="hero-grid">
      <div>
        <span class="hero-pill">${icon('sparkles', 14)} ${t('hero.pill')}</span>
        <h1>${t('hero.title1')} <span class="grad-text">${t('hero.title2')}</span></h1>
        <p class="hero-sub">${t('hero.sub')}</p>
        <div class="hero-actions">
          <a class="btn light lg" href="#/darslar">${t('hero.start')} ${icon('arrow-right', 18)}</a>
          <a class="btn outline-light lg" href="#/lugat">${icon('book-marked', 17)} ${t('hero.glossary')}</a>
        </div>
        <dl class="hero-stats">
          <div><dt class="sr">${t('stat.lessons')}</dt><dd><b class="tnum">${LESSONS.length}</b><span>${t('stat.lessons')}</span></dd></div>
          <div><dt class="sr">${t('stat.entries')}</dt><dd><b class="tnum">${MERGED.length}</b><span>${t('stat.entries')}</span></dd></div>
          <div><dt class="sr">${t('stat.activities')}</dt><dd><b class="tnum">${TOTAL_ACTS}</b><span>${t('stat.activities')}</span></dd></div>
        </dl>
      </div>
      <div class="art">
        <div class="art-glow" aria-hidden="true"></div>
        <span class="chip-float bubble" aria-hidden="true" lang="en">Break the ice!</span>
        <span class="chip-float count" aria-hidden="true"><span class="ib">${icon('flame', 15)}</span>${MERGED.length} ${getLang() === 'en' ? 'idioms' : 'ta ibora'}</span>
        <div class="flash" id="flash" data-open="false" aria-live="polite"></div>
        <span class="chip-float ok" aria-hidden="true">${icon('sparkles', 15)} ${t('chip.literal')}</span>
        <a class="mini-cover" href="#/kitob" aria-label="${esc(t('nav.about'))}"><img src="img/cover-sm.webp" width="400" height="566" alt=""></a>
      </div>
    </div>
  </section>

  <section aria-labelledby="h-lessons">
    ${sectionHead(t('home.lessonsEyebrow'), t('home.lessonsTitle'), t('home.lessonsSub'), `<a class="btn secondary" href="#/darslar">${t('all.lessons')} ${icon('arrow-right', 16)}</a>`)}
    <div class="filters-row">${filtersHtml('home')}</div>
    <div class="grid-cards" id="cards">${cardsHtml('all')}</div>
  </section>

  <section>
    ${sectionHead(t('home.flowEyebrow'), t('home.flowTitle'), t('home.flowSub'))}
    <div class="grid-cards">
      ${LESSON_FLOW.map((s, i) => `<div class="card step" style="--k:${STEP_COLORS[s.key]}">
        <span class="tile-wrap"><span class="tile soft">${icon(STEP_ICONS[s.key], 22)}</span><span class="badge">${i + 1}</span></span>
        <h3>${esc(pick(s))}</h3>
        <p>${esc(pick(s.note))}</p>
      </div>`).join('')}
      <div class="promo">
        <div><small>${t('home.flowCardTop')}</small><p>${t('home.flowCard')}</p></div>
        <a href="#/dars/1">${t('lesson.label', 1)}: A Day in the Life ${icon('arrow-right', 16)}</a>
      </div>
    </div>
  </section>

  <section class="card pad">
    <div class="search-card">
      ${sectionHead(t('home.searchEyebrow'), t('home.searchTitle'), t('home.searchSub'))}
      <form id="home-search" role="search">
        <div class="search-box">
          ${icon('search', 20)}
          <input name="q" type="search" autocomplete="off" placeholder="${esc(t('home.searchPh'))}" aria-label="${esc(t('home.searchTitle'))}">
          <button class="btn primary" type="submit">${t('home.searchBtn')}</button>
        </div>
      </form>
    </div>
  </section>

  <section class="card pad">
    <div class="about-teaser">
      <img src="img/cover-sm.webp" width="400" height="566" alt="“Phraseo-Barrier Matrix” kitobi muqovasi" loading="lazy">
      <div>
        <p class="eyebrow">${t('home.aboutEyebrow')}</p>
        <h2 class="h2" style="margin-top:6px" lang="en">${esc(BOOK.title)}</h2>
        <div class="facts">
          <span>${icon('pen-line', 15)} ${esc(BOOK.author)}</span>
          <span>${icon('graduation-cap', 15)} ${esc(pick(BOOK.university))}</span>
          <span>${icon('map', 15)} ${esc(pick(BOOK.city))}</span>
        </div>
        <p class="prose" style="color:rgb(var(--muted))">${esc(pick(BOOK.annotation))}</p>
        <p style="margin-top:20px"><a class="btn secondary" href="#/kitob">${t('home.aboutMore')} ${icon('arrow-right', 16)}</a></p>
      </div>
    </div>
  </section>`;
}

let heroIndex = 0;
function renderFlash(open = false) {
  const el = document.getElementById('flash');
  if (!el) return;
  const h = HERO_IDIOMS[heroIndex];
  el.dataset.open = String(open);
  el.innerHTML = `
    <div class="flash-top">
      <span class="flash-tag">${esc(t('card.tag', h.lesson))}</span>
      <span class="flash-count tnum">${heroIndex + 1} / ${HERO_IDIOMS.length}</span>
    </div>
    <p class="flash-idiom" lang="en">${esc(h.en)}</p>
    <p class="flash-literal">${t('card.literal')}: <i lang="uz">${esc(h.literal)}</i></p>
    <button class="flash-reveal" type="button" data-act="toggle" aria-expanded="${open}">
      <span class="play">${icon(open ? 'x' : 'eye', 18)}</span>
      <span class="lbl">${open ? t('card.hide') : t('card.reveal')}</span>
    </button>
    <div class="flash-meaning">
      <small>${open ? t('card.meaning') : t('card.hidden')}</small>
      ${open
        ? `<div class="reveal-in"><p class="uz" lang="uz">${esc(h.uz)}</p><p class="en" lang="en">${esc(h.meaning)}</p></div>`
        : `<div class="q" aria-hidden="true"><span style="width:44%"></span><span style="width:26%"></span></div><div class="q" aria-hidden="true"><span style="width:60%"></span></div>`}
    </div>
    <div class="flash-foot">
      <a href="${lessonUrl(h.lesson)}">${t('card.lesson')} ${icon('arrow-right', 14)}</a>
      <button class="flash-next" type="button" data-act="next">${icon('shuffle', 14)} ${t('card.next')}</button>
    </div>`;
}

function bindHome() {
  renderFlash(false);
  const flash = document.getElementById('flash');
  flash.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'toggle') {
      renderFlash(flash.dataset.open !== 'true');
      flash.querySelector('[data-act="toggle"]').focus();
    } else if (act === 'next') {
      heroIndex = (heroIndex + 1) % HERO_IDIOMS.length;
      renderFlash(false);
      flash.querySelector('[data-act="next"]').focus();
    }
  });
  bindFilters('home', (f) => { document.getElementById('cards').innerHTML = cardsHtml(f); });
  document.getElementById('home-search').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = new FormData(e.target).get('q').trim();
    location.hash = q ? `#/lugat?q=${encodeURIComponent(q)}` : '#/lugat';
  });
}

/* ---------- Darslar ro‘yxati ---------- */
function viewLessons() {
  return `<section>
    <div class="page-head">
      <p class="eyebrow">${t('lessons.eyebrow')}</p>
      <h1 class="h1">${t('lessons.title')}</h1>
      <p class="sub">${t('lessons.lead')}</p>
    </div>
    <div class="filters-row">${filtersHtml('lessons')}</div>
    <div class="grid-cards" id="cards">${cardsHtml('all')}</div>
  </section>`;
}
function bindLessons() {
  bindFilters('lessons', (f) => { document.getElementById('cards').innerHTML = cardsHtml(f); });
}

/* ---------- Bitta dars ---------- */
function viewLesson(n) {
  const l = LESSONS.find((x) => x.n === n);
  if (!l) return `<section class="notfound"><h1 class="h2">${t('lesson.notFound')}</h1><a class="btn primary" href="#/darslar">${t('all.lessons')}</a></section>`;
  const prev = LESSONS.find((x) => x.n === n - 1);
  const next = LESSONS.find((x) => x.n === n + 1);
  const vid = youTubeId(l.video);
  const isShort = l.video?.includes('/shorts/');
  const mark = highlighter(l.glossary);
  const lang = getLang() === 'en' ? 'en' : 'uz';

  const pr = PRACTICE[l.n];
  // Hikoya: kitobdagi sahifa (rasm) bo‘lsa, o‘sha ko‘rsatiladi (egasi shuni tanladi)
  const storyBlock = pr?.story && !l.poster
    ? `<p class="note">${t('lesson.tapIdiom')}</p>
       <div class="story-text" lang="en">${storyHtml(pr.story, l.glossary)}</div>
       ${l.poster ? `<button class="btn secondary sm" type="button" data-zoom="${l.poster}" data-alt="${esc(l.title)}" style="margin-top:20px">${icon('book-open', 15)} ${t('lesson.showPoster')}</button>` : ''}`
    : l.poster
    ? `<button class="poster" type="button" data-zoom="${l.poster}" aria-label="${esc(t('lesson.open'))}: ${esc(l.title)}">
         <img src="${l.poster}" alt="${esc(l.title)} — kitobdagi hikoya sahifasi" loading="lazy">
         <span class="enlarge">${icon('maximize-2', 15)} ${t('lesson.open')}</span>
       </button>
       <p class="poster-note">${t('lesson.storyPoster')}</p>`
    : `${l.warmup ? `<img class="warmup-img" src="${l.warmup}" alt="" loading="lazy">` : ''}
       <p class="note">${t('lesson.storyText')}</p>
       <div class="story-text" lang="en">${l.story.map((p) => p.startsWith('§')
          ? `<p class="verse">${esc(p.slice(1))}</p>`
          : `<p>${mark(p)}</p>`).join('')}</div>`;

  const block = (ic, title, body, color) => `<section class="card pad"${color ? ` style="--k:${color}"` : ''}>
      <div class="block-head"><span class="tile sm soft">${icon(ic, 20)}</span><h2 class="h3">${title}</h2></div>
      ${body}
    </section>`;

  return `<div class="stack">
  <nav class="crumbs" aria-label="breadcrumb">
    <a href="#/darslar">${t('nav.lessons')}</a>${icon('arrow-right', 14)}<span>${t('lesson.label', l.n)}</span>
  </nav>

  <section class="card lesson-hero" data-kind="${l.kind}">
    <span class="glow" aria-hidden="true"></span>
    <div class="lesson-hero-row">
      <span class="tile">${icon(LESSON_ICONS[l.n], 30)}</span>
      <div style="flex:1;min-width:240px">
        <div class="pills">
          <span class="pill">${esc(t('lesson.label', l.n).toUpperCase())}</span>
          <span class="pill">${esc(kindLabel(l.kind))}</span>
        </div>
        <h1 lang="en">${esc(l.title)}</h1>
        <p class="sub">${esc(pick(l.about))}</p>
        <div class="meta">
          <span>${icon('layers', 15)} ${t('lessons.count', l.glossary.length)}</span>
          <span>${icon('list-checks', 15)} ${t('lessons.acts', l.activities.length)}</span>
          ${vid ? `<span>${icon('video', 15)} Video</span>` : ''}
          <span>${icon('book-open', 15)} ${t('lesson.inBook', l.book, l.page)}</span>
        </div>
      </div>
    </div>
  </section>

  <div class="lesson-layout" data-kind="${l.kind}">
    <div class="lesson-main">
      ${block('target', t('lesson.objectives'), `<p class="note">${t('lesson.objectivesLead')}</p>
        <ul class="checks" ${lang === 'en' ? 'lang="en"' : ''}>${OBJECTIVES[lang].map((o) => `<li><span class="ok">${icon('check', 14)}</span><span>${esc(o)}</span></li>`).join('')}</ul>`, '#059669')}

      ${pr?.warmup ? renderExercise(pr.warmup, null, l.n) : ''}

      ${block('book-open', t('lesson.story'), storyBlock, '#2563EB')}

      ${pr ? practiceHtml(l, pr) : block('list-checks', t('lesson.activities'), `<p class="note">${t('lesson.activitiesNote')}</p>
        <ol class="acts">${l.activities.map(([title, type]) => `<li>
          <span class="tile sm soft" style="--k:${type === 'video' ? '#DB2777' : 'var(--k-phrase)'}">${icon(ACT_ICONS[type] || 'list-checks', 18)}</span>
          <span class="txt"><b lang="en">${esc(title)}</b><small>${esc(pick(ACTIVITY_TYPES[type]))}</small></span>
          <span class="pill soon">${t('lesson.soon')}</span>
        </li>`).join('')}</ol>`, '#0EA5B7')}

      ${block('video', t('lesson.video'), vid ? `<div class="video${isShort ? ' short' : ''}">
          <button type="button" data-video="${vid}" aria-label="${esc(t('lesson.videoPlay'))}">
            <img src="https://i.ytimg.com/vi/${vid}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()">
            <span class="playbtn"><span class="c">${icon('play', 16)}</span>${t('lesson.videoPlay')}</span>
          </button>
        </div>
        <a class="link" href="${esc(l.video)}" target="_blank" rel="noopener">${t('lesson.videoOpen')} ${icon('arrow-right', 14)}</a>`
        : `<p class="note" style="margin:0">${t('lesson.noVideo')}</p>`, '#DB2777')}

      ${pr?.homework ? `<div class="practice-head"><span class="tile sm soft" style="--k:#7C3AED">${icon('pen-line', 20)}</span><h2 class="h3">${t('lesson.homework')}</h2></div>
        ${pr.homework.map((ex) => renderExercise(ex, null, l.n)).join('')}`
      : block('pen-line', t('lesson.homework'), `<ul class="hw" lang="en">${l.homework.map((h) => `<li><span class="ic-wrap">${icon('pen-line', 15)}</span><span>${esc(h)}</span></li>`).join('')}</ul>`, '#7C3AED')}
    </div>

    <aside class="card aside">
      <details class="gloss" id="gloss" open>
        <summary><span class="tile sm soft">${icon('book-marked', 20)}</span><h2 class="h3">${t('lesson.glossary')}</h2><span class="cnt">${l.glossary.length}</span><span class="chev">${icon('chevron-down', 18)}</span></summary>
        <dl lang="en">
          ${l.glossary.map(([term, meaning, k]) => `<div class="entry" data-kind="${k || l.kind}"><dt>${esc(term)}</dt><dd>${esc(meaning)}</dd></div>`).join('')}
        </dl>
      </details>
    </aside>
  </div>

  <nav class="pager" aria-label="${esc(t('nav.lessons'))}">
    ${prev ? `<a class="card" href="${lessonUrl(prev.n)}"><span class="arrow">${icon('arrow-left', 18)}</span><span><small>${t('lesson.prev')}</small><b>${prev.n}. ${esc(prev.title)}</b></span></a>` : '<span></span>'}
    ${next ? `<a class="card next" href="${lessonUrl(next.n)}"><span class="arrow">${icon('arrow-right', 18)}</span><span><small>${t('lesson.next')}</small><b>${next.n}. ${esc(next.title)}</b></span></a>`
      : `<a class="card next" href="#/darslar"><span class="arrow">${icon('layout-grid', 18)}</span><span><small>${t('all.lessons')}</small><b>${t('nav.lessons')}</b></span></a>`}
  </nav></div>`;
}

function practiceHtml(l, pr) {
  const { done, total } = progressCount(l.n, pr);
  return `<section class="card pad practice-top" id="practice">
      <div class="block-head"><span class="tile sm soft" style="--k:#0EA5B7">${icon('list-checks', 20)}</span><h2 class="h3">${t('ex.practiceTitle')}</h2></div>
      <p class="note">${t('ex.practiceSub')}</p>
      <div class="lprog"><div class="lprog-row"><b data-prog-text>${t('ex.progress', done, total)}</b><button class="link-btn" type="button" data-reset>${icon('repeat', 14)} ${t('ex.resetAll')}</button></div>
      <div class="bar big"><span data-prog-bar style="width:${Math.round((done / total) * 100)}%"></span></div></div>
    </section>
    ${pr.exercises.map((ex, i) => renderExercise(ex, i + 1, l.n)).join('')}`;
}

function bindLesson() {
  const n = Number(parseHash().parts[1]);
  const l = LESSONS.find((x) => x.n === n);
  const pr = l && PRACTICE[n];
  if (pr) {
    const detect = idiomMatcher(l.glossary.map((g) => g[0]));
    const updateProg = () => {
      const { done, total } = progressCount(n, pr);
      const txt = document.querySelector('[data-prog-text]');
      if (txt) txt.textContent = t('ex.progress', done, total);
      const bar = document.querySelector('[data-prog-bar]');
      if (bar) bar.style.width = `${Math.round((done / total) * 100)}%`;
    };
    [pr.warmup, ...pr.exercises, ...(pr.homework || [])].filter(Boolean).forEach((ex) => {
      const card = document.getElementById(`ex-${ex.id}`);
      if (card) bindExercise(card, ex, n, detect, updateProg);
    });
    document.querySelector('[data-reset]')?.addEventListener('click', () => {
      if (window.confirm(t('ex.resetConfirm'))) { clearLesson(n); render(); }
    });
    main.querySelectorAll('.idi').forEach((b) => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
      const next = b.nextElementSibling;
      if (open && next?.classList.contains('idi-tip')) next.remove();
      if (!open) b.insertAdjacentHTML('afterend', `<span class="idi-tip" role="note">${esc(b.dataset.m)}</span>`);
    }));
  }
  const gloss = document.getElementById('gloss');
  if (gloss && window.matchMedia('(max-width: 999px)').matches) gloss.open = false;
  gloss?.addEventListener('toggle', () => { if (window.matchMedia('(min-width: 1000px)').matches) gloss.open = true; });
  main.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => openViewer(b.dataset.zoom, b.dataset.alt || b.querySelector('img')?.alt)));
  const vb = main.querySelector('[data-video]');
  vb?.addEventListener('click', () => {
    vb.parentElement.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${vb.dataset.video}?autoplay=1&rel=0" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  });
}

function openViewer(src, alt) {
  const dlg = document.getElementById('viewer');
  const img = dlg.querySelector('img');
  img.src = src; img.alt = alt || '';
  if (typeof dlg.showModal === 'function') dlg.showModal(); else window.open(src, '_blank');
}

/* ---------- Lug‘at ---------- */
function viewGlossary(params) {
  return `<section>
    <div class="page-head">
      <p class="eyebrow">${t('glossary.eyebrow')}</p>
      <h1 class="h1">${t('glossary.title')}</h1>
      <p class="sub">${t('glossary.lead', MERGED.length)}</p>
    </div>
    <div class="gl-tools">
      <label class="search-box">${icon('search', 20)}<input id="gl-q" type="search" autocomplete="off" placeholder="${esc(t('glossary.search'))}" aria-label="${esc(t('glossary.search'))}" value="${esc(params.get('q') || '')}"></label>
      <select class="select" id="gl-lesson" aria-label="${esc(t('glossary.lesson'))}">
        <option value="">${t('glossary.allLessons')}</option>
        ${LESSONS.map((l) => `<option value="${l.n}" ${params.get('dars') == l.n ? 'selected' : ''}>${l.n}. ${esc(l.title)}</option>`).join('')}
      </select>
    </div>
    <div class="filters-row">${filtersHtml('glossary', ['idiom', 'phrasal', 'phrase', 'vocab'])}</div>
    <div class="gl-status"><span id="gl-count" aria-live="polite"></span><button class="btn secondary sm" type="button" id="gl-clear">${icon('x', 14)} ${t('glossary.clear')}</button></div>
    <div id="gl-results"></div>
  </section>`;
}

function bindGlossary() {
  const q = document.getElementById('gl-q');
  const sel = document.getElementById('gl-lesson');
  const out = document.getElementById('gl-results');
  const count = document.getElementById('gl-count');
  let kind = 'all';

  const run = () => {
    const query = q.value.trim().toLowerCase();
    const lesson = Number(sel.value) || null;
    const list = MERGED.filter((e) =>
      (kind === 'all' || e.kind === kind) &&
      (!lesson || e.lessons.includes(lesson)) &&
      (!query || e.term.toLowerCase().includes(query) || e.meanings.some((m) => m.toLowerCase().includes(query))));
    count.textContent = t('glossary.found', list.length);
    if (!list.length) { out.innerHTML = `<p class="empty-card">${t('glossary.empty')}</p>`; return; }
    const groups = new Map();
    for (const e of list) {
      const L = sortKey(e.term).charAt(0).toUpperCase();
      if (!groups.has(L)) groups.set(L, []);
      groups.get(L).push(e);
    }
    out.innerHTML = [...groups].map(([L, items]) => `<div class="gl-group">
      <h2 class="gl-letter"><b>${esc(L)}</b></h2>
      <ul class="gl-list" lang="en">${items.map((e) => `<li class="card gl-item" data-kind="${e.kind}">
        <span class="gl-term">${esc(e.term)}</span>
        <div class="gl-meaning">${e.meanings.map((m) => `<p>${esc(m)}</p>`).join('')}</div>
        <span class="gl-lessons">${e.lessons.map((n) => `<a href="${lessonUrl(n)}" lang="${getLang()}">${t('lesson.label', n)}</a>`).join('')}</span>
      </li>`).join('')}</ul>
    </div>`).join('');
  };
  q.addEventListener('input', run);
  sel.addEventListener('change', run);
  bindFilters('glossary', (f) => { kind = f; run(); });
  document.getElementById('gl-clear').addEventListener('click', () => {
    q.value = ''; sel.value = ''; kind = 'all';
    document.querySelectorAll('[data-filter-scope="glossary"] [data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.filter === 'all')));
    run(); q.focus();
  });
  run();
}

/* ---------- Kitob haqida ---------- */
function viewAbout() {
  const annLang = getLang() === 'en' ? 'en' : 'uz';
  const sec = (ic, title, body, color) => `<section class="card pad" style="--k:${color}">
      <div class="block-head"><span class="tile sm soft">${icon(ic, 20)}</span><h2 class="h3">${title}</h2></div>${body}</section>`;
  return `<div class="stack"><section>
    <div class="page-head">
      <p class="eyebrow">${t('about.eyebrow')}</p>
      <h1 class="h1" lang="en">${esc(BOOK.title)}</h1>
      <p class="sub" lang="en">${esc(BOOK.subtitle)}</p>
    </div>
  </section>
  <div class="about-grid">
    <aside class="about-side">
      <img class="cover-img" src="img/cover.webp" width="800" height="1132" alt="“Phraseo-Barrier Matrix” kitobi muqovasi">
      <dl class="card pad">
        <div><dt>${t('about.author')}</dt><dd>${esc(BOOK.author)}</dd></div>
        <div><dt>${t('about.reviewers')}</dt>${BOOK.reviewers.map((r) => `<dd>${esc(r.name)}<span>${esc(pick(r.role))}</span></dd>`).join('')}</div>
        <div><dt>OTM</dt><dd>${esc(pick(BOOK.university))}<span>${esc(pick(BOOK.program))}. ${esc(pick(BOOK.city))}</span></dd></div>
      </dl>
    </aside>
    <div class="about-main">
      ${sec('file-text', t('about.annotation'), `<div class="seg tabs" role="tablist">
          ${[['uz', 'O‘zbekcha'], ['en', 'English'], ['ru', 'Русский']].map(([k, label]) => `<button role="tab" type="button" data-ann="${k}" aria-selected="${k === annLang}" aria-pressed="${k === annLang}">${label}</button>`).join('')}
        </div>
        <div class="prose" id="ann" lang="${annLang}"><p>${esc(BOOK.annotation[annLang])}</p></div>`, '#2563EB')}
      ${sec('book-open', t('about.intro'), `<div class="prose" lang="en">${BOOK.introduction.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`, '#4F46E5')}
      ${sec('target', t('about.aims'), `<ol class="numlist" lang="en">${BOOK.aims.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>`, '#059669')}
      ${sec('layers', t('about.features'), `<div class="feat" lang="en">${BOOK.features.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>`, '#7C3AED')}
      ${sec('lightbulb', t('about.why'), `<div class="prose" lang="en"><p>${esc(BOOK.whyText)}</p></div>`, '#D97706')}
      ${sec('list-checks', t('about.types'), `<ol class="numlist" lang="en">${BOOK.exerciseTypes.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>`, '#0EA5B7')}
      ${sec('graduation-cap', t('about.tips'), `<ol class="numlist" lang="en">${BOOK.tips.map((a) => `<li>${esc(a)}</li>`).join('')}</ol><p class="note" style="margin:18px 0 0">${t('about.note')}</p>`, '#DB2777')}
    </div>
  </div></div>`;
}
function bindAbout() {
  const ann = document.getElementById('ann');
  document.querySelectorAll('[data-ann]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-ann]').forEach((x) => { const on = x === b; x.setAttribute('aria-selected', on); x.setAttribute('aria-pressed', on); });
    ann.lang = b.dataset.ann;
    ann.innerHTML = `<p>${esc(BOOK.annotation[b.dataset.ann])}</p>`;
  }));
}

/* ---------- Marshrutlash ---------- */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(query) };
}

function render() {
  const { parts, params } = parseHash();
  const route = parts[0] || '';
  let html; let bind = () => {}; let title = 'Phraseo-Barrier Matrix — ingliz idiomalari'; let navKey = 'home';

  if (route === 'darslar') { html = viewLessons(); bind = bindLessons; title = `${t('nav.lessons')} — Phraseo-Barrier Matrix`; navKey = 'darslar'; }
  else if (route === 'dars') {
    const n = Number(parts[1]);
    html = viewLesson(n); bind = bindLesson; navKey = 'darslar';
    const l = LESSONS.find((x) => x.n === n);
    if (l) title = `${l.n}. ${l.title} — Phraseo-Barrier Matrix`;
  }
  else if (route === 'lugat') { html = viewGlossary(params); bind = bindGlossary; title = `${t('nav.glossary')} — Phraseo-Barrier Matrix`; navKey = 'lugat'; }
  else if (route === 'kitob') { html = viewAbout(); bind = bindAbout; title = `${t('nav.about')} — Phraseo-Barrier Matrix`; navKey = 'kitob'; }
  else { html = viewHome(); bind = bindHome; }

  main.innerHTML = html;
  document.title = title;
  document.querySelectorAll('[data-route]').forEach((a) => {
    if (a.dataset.route === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  closeMenu();
  bind();
}

function onNavigate() {
  render();
  window.scrollTo(0, 0);
  if (location.hash && location.hash !== '#/') main.focus({ preventScroll: true });
}

/* ---------- Umumiy interfeys ---------- */
function applyStaticI18n() {
  document.documentElement.lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nLabel)));
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === getLang())));
  const uni = document.querySelector('[data-footer="university"]');
  if (uni) uni.textContent = pick(BOOK.university);
}

document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon, 18); });

const menuBtn = document.querySelector('.menu-btn');
const mnav = document.getElementById('mobile-nav');
function closeMenu() { mnav.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.innerHTML = icon('menu', 18); }
menuBtn.addEventListener('click', () => {
  const open = mnav.hidden;
  mnav.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.innerHTML = icon(open ? 'x' : 'menu', 18);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.lang === getLang()) return;
  setLang(b.dataset.lang);
  applyStaticI18n();
  render();
}));

window.addEventListener('hashchange', onNavigate);
applyStaticI18n();
render();
