// Phraseo-Barrier Matrix — sahifalar va marshrutlash (hash router).
import { LESSONS, KINDS, ACTIVITY_TYPES, OBJECTIVES, allEntries } from './data/lessons.js';
import { BOOK, HERO_IDIOMS, LESSON_FLOW } from './data/book.js';
import { t, pick, getLang, setLang } from './i18n.js';

const main = document.getElementById('main');
const ENTRIES = allEntries();

/* ---------- Yordamchilar ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lessonUrl = (n) => `#/dars/${n}`;
const kindLabel = (k) => pick(KINDS[k]);

// Lug'at: bir xil iboralarni birlashtiramiz (bir nechta darsda uchrasa)
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
const sortKey = (s) => s.replace(/^(a|an|the)\s+/i, '').toLowerCase();
const MERGED = mergedEntries();

function youTubeId(url) {
  if (!url) return null;
  const m = url.match(/[?&]v=([\w-]{11})/) || url.match(/shorts\/([\w-]{11})/) || url.match(/youtu\.be\/([\w-]{11})/);
  return m ? m[1] : null;
}

// Hikoya matnida lug'atdagi iboralarni belgilash (taxminiy moslik)
function highlighter(glossary) {
  const pron = '(?:your|her|his|my|their|our|its)';
  const self = '(?:yourself|herself|himself|myself|themselves|ourselves)';
  const patterns = glossary.map(([term]) => {
    const words = term.replace(/[“”"]/g, '').split(/\s+/).filter(Boolean);
    if (words.length < 2) return null;
    const parts = words.map((w, i) => {
      const lw = w.toLowerCase().replace(/[^a-z’'-]/g, '');
      if (lw === 'your') return pron;
      if (lw === 'yourself') return self;
      if (lw === 'someone' || lw === 'someone’s' || lw === 'something') return '[\\w’\']+';
      const clean = lw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return i === 0 ? `${clean.replace(/e$/, '')}\\w*` : clean;
    });
    return parts.join('\\s+');
  }).filter(Boolean);
  if (!patterns.length) return (s) => esc(s);
  const re = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');
  return (text) => esc(text).replace(re, '<mark>$1</mark>');
}

/* ---------- Bosh sahifa ---------- */
function viewHome() {
  const total = MERGED.length;
  const about = pick(BOOK.annotation);
  return `
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <p class="hero-kicker">${t('hero.kicker')}</p>
        <div class="barrier" id="barrier" data-open="false" aria-live="polite"></div>
      </div>
      <aside class="hero-side">
        <a class="cover-card" href="#/kitob" aria-label="${esc(t('nav.about'))}">
          <img src="img/cover.webp" width="800" height="1132" alt="“Phraseo-Barrier Matrix” kitobi muqovasi">
        </a>
        <div class="side-text">
          <p class="hero-lead">${t('hero.lead')}</p>
          <div class="hero-links">
            <a class="btn" href="#/darslar">${t('hero.start')}</a>
          </div>
        </div>
      </aside>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head split">
        <div class="section-head">
          <h2 class="h2">${t('home.matrixTitle')}</h2>
          <p class="lead">${t('home.matrixLead', LESSONS.length, total)}</p>
        </div>
        ${filtersHtml('home')}
      </div>
      <div class="matrix" id="matrix">${matrixHtml('all')}</div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <h2 class="h2">${t('home.flowTitle')}</h2>
        <p class="lead">${t('home.flowLead')}</p>
      </div>
      <ol class="flow">
        ${LESSON_FLOW.map((s) => `<li><div><b>${esc(pick(s))}</b><span>${esc(pick(s.note))}</span></div></li>`).join('')}
      </ol>
    </div>
  </section>

  <section class="section search-band">
    <div class="wrap search-grid">
      <div class="section-head">
        <h2 class="h2">${t('home.searchTitle')}</h2>
        <p class="lead">${t('home.searchLead')}</p>
      </div>
      <form class="search-form" id="home-search" role="search">
        <label class="sr-only" for="home-q" hidden>${t('home.searchTitle')}</label>
        <input id="home-q" name="q" type="search" autocomplete="off" placeholder="${esc(t('home.searchPh'))}" aria-label="${esc(t('home.searchTitle'))}">
        <button type="submit">${t('home.searchBtn')}</button>
      </form>
    </div>
  </section>

  <section class="section">
    <div class="wrap book-teaser">
      <img src="img/cover-sm.webp" width="400" height="566" alt="" loading="lazy">
      <div>
        <h2 class="h2">${t('home.aboutTitle')}</h2>
        <div class="book-meta">
          <span><b>${esc(BOOK.author)}</b></span>
          <span>${esc(pick(BOOK.university))}</span>
          <span>${esc(pick(BOOK.city))}</span>
        </div>
        <div class="prose"><p>${esc(about)}</p></div>
        <p style="margin-top:22px"><a class="btn ghost" href="#/kitob">${t('home.aboutMore')}</a></p>
      </div>
    </div>
  </section>`;
}

function filtersHtml(scope) {
  const kinds = ['idiom', 'phrasal', 'phrase'];
  return `<div class="filters" role="group" aria-label="Filter" data-filter-scope="${scope}">
    <button class="chip" type="button" data-filter="all" aria-pressed="true">${t('filter.all')}</button>
    ${kinds.map((k) => `<button class="chip" type="button" data-filter="${k}" data-kind="${k}" aria-pressed="false" style="--k:var(--k-${k})"><span class="dot" style="color:var(--k)"></span>${kindLabel(k)}</button>`).join('')}
  </div>`;
}

function matrixHtml(filter) {
  const list = LESSONS.filter((l) => filter === 'all' || l.kind === filter);
  if (!list.length) return `<p class="matrix-empty">${t('lessons.empty')}</p>`;
  return list.map((l) => {
    const sample = l.glossary.filter((g) => !g[2]).slice(0, 3).map((g) => g[0]).join(', ');
    return `<a class="cell" href="${lessonUrl(l.n)}" data-kind="${l.kind}">
      <div class="cell-top">
        <span class="cell-num">${l.n}</span>
        <span class="cell-bar" aria-hidden="true"></span>
      </div>
      <h3 class="cell-title">${esc(l.title)}</h3>
      <p class="cell-idioms">${esc(sample)}</p>
      <div class="cell-foot"><span class="kind-tag">${kindLabel(l.kind)}</span><span>${t('lessons.count', l.glossary.length)}</span></div>
    </a>`;
  }).join('');
}

let heroIndex = 0;
function renderBarrier(open = false) {
  const el = document.getElementById('barrier');
  if (!el) return;
  const h = HERO_IDIOMS[heroIndex];
  const lesson = LESSONS.find((l) => l.n === h.lesson);
  el.dataset.open = String(open);
  el.innerHTML = `
    <h1 class="barrier-idiom display" lang="en">${esc(h.en)}</h1>
    <p class="barrier-literal-row"><span class="barrier-label">${t('hero.literal')}:</span> <span class="barrier-literal" lang="uz">${esc(h.literal)}</span></p>
    <div class="barrier-wall" aria-hidden="true"></div>
    <div class="barrier-meaning" ${open ? '' : 'inert'}>
      <div><div class="inner">
        <p class="barrier-label">${t('hero.actual')}</p>
        <p class="barrier-uz" lang="uz">${esc(h.uz)}</p>
        <p class="barrier-en" lang="en">${esc(h.meaning)}</p>
        <p class="barrier-src"><a href="${lessonUrl(h.lesson)}">${t('hero.fromLesson', h.lesson)}: ${esc(lesson.title)}</a></p>
      </div></div>
    </div>
    <div class="barrier-actions">
      <button class="btn" type="button" data-act="toggle" aria-expanded="${open}">${open ? t('hero.hide') : t('hero.reveal')}</button>
      <button class="btn ghost" type="button" data-act="next">${t('hero.next')}</button>
    </div>`;
}

function bindHome() {
  renderBarrier(false);
  const barrier = document.getElementById('barrier');
  barrier.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'toggle') {
      const open = barrier.dataset.open !== 'true';
      barrier.dataset.open = String(open);
      const meaning = barrier.querySelector('.barrier-meaning');
      meaning.toggleAttribute('inert', !open);
      const btn = barrier.querySelector('[data-act="toggle"]');
      btn.textContent = open ? t('hero.hide') : t('hero.reveal');
      btn.setAttribute('aria-expanded', String(open));
    } else if (act === 'next') {
      heroIndex = (heroIndex + 1) % HERO_IDIOMS.length;
      renderBarrier(false);
      barrier.querySelector('[data-act="next"]').focus();
    }
  });
  bindFilters('home', (f) => { document.getElementById('matrix').innerHTML = matrixHtml(f); });
  document.getElementById('home-search').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = new FormData(e.target).get('q').trim();
    location.hash = q ? `#/lugat?q=${encodeURIComponent(q)}` : '#/lugat';
  });
}

function bindFilters(scope, onChange) {
  const group = document.querySelector(`[data-filter-scope="${scope}"]`);
  if (!group) return;
  group.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    group.querySelectorAll('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    onChange(b.dataset.filter);
  });
}

/* ---------- Darslar ro'yxati ---------- */
function viewLessons() {
  return `
  <section class="page-head">
    <div class="wrap">
      <h1 class="display">${t('lessons.title')}</h1>
      <p class="lead">${t('lessons.lead')}</p>
    </div>
  </section>
  <section class="section" style="padding-top:32px">
    <div class="wrap">
      <div style="margin-bottom:20px">${filtersHtml('lessons')}</div>
      <div class="matrix" id="matrix">${matrixHtml('all')}</div>
    </div>
  </section>`;
}
function bindLessons() {
  bindFilters('lessons', (f) => { document.getElementById('matrix').innerHTML = matrixHtml(f); });
}

/* ---------- Bitta dars ---------- */
function viewLesson(n) {
  const l = LESSONS.find((x) => x.n === n);
  if (!l) return `<section class="wrap notfound"><h1 class="h2">${t('lesson.notFound')}</h1><p style="margin-top:20px"><a class="btn" href="#/darslar">${t('lesson.all')}</a></p></section>`;
  const prev = LESSONS.find((x) => x.n === n - 1);
  const next = LESSONS.find((x) => x.n === n + 1);
  const vid = youTubeId(l.video);
  const isShort = l.video?.includes('/shorts/');
  const mark = highlighter(l.glossary);
  const lang = getLang();

  const storyBlock = l.poster
    ? `<button class="poster" type="button" data-zoom="${l.poster}" aria-label="${esc(t('lesson.open'))}: ${esc(l.title)}">
         <img src="${l.poster}" alt="${esc(l.title)} — kitobdagi hikoya sahifasi" loading="lazy">
         <span class="enlarge">${t('lesson.open')}</span>
       </button>
       <p class="poster-note">${t('lesson.storyPoster')}</p>`
    : `${l.warmup ? `<img class="warmup-img" src="${l.warmup}" alt="" loading="lazy">` : ''}
       <div class="story-text" lang="en">${l.story.map((p) => p.startsWith('§')
          ? `<p class="verse">${esc(p.slice(1))}</p>`
          : `<p>${mark(p)}</p>`).join('')}</div>`;

  return `
  <section class="lesson-head" data-kind="${l.kind}">
    <div class="wrap">
      <nav class="crumbs" aria-label="breadcrumb"><a href="#/darslar">${t('nav.lessons')}</a><span aria-hidden="true">/</span><span>${t('lesson.label', l.n)}</span></nav>
      <div class="lesson-title-row">
        <span class="lesson-num" aria-hidden="true">${l.n}</span>
        <div>
          <h1 class="display lesson-title" lang="en">${esc(l.title)}</h1>
          <div class="lesson-meta">
            <span class="kind-tag" data-kind="${l.kind}">${kindLabel(l.kind)}</span>
            <span>${t('lessons.count', l.glossary.length)}</span>
            <span>${t('lesson.inBook', l.book, l.page)}</span>
          </div>
          <p class="lead lesson-about">${esc(pick(l.about))}</p>
        </div>
      </div>
    </div>
  </section>

  <div class="wrap lesson-body" data-kind="${l.kind}">
    <div class="lesson-main">
      <section>
        <h2 class="h3">${t('lesson.objectives')}</h2>
        <p class="note" style="margin-top:8px">${t('lesson.objectivesLead')}</p>
        <ul class="objectives" ${lang === 'en' ? 'lang="en"' : ''}>${OBJECTIVES[lang === 'en' ? 'en' : 'uz'].map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
      </section>

      <section>
        <h2 class="h2">${t('lesson.story')}</h2>
        ${storyBlock}
      </section>

      <section>
        <h2 class="h2">${t('lesson.activities')}</h2>
        <p class="note">${t('lesson.activitiesNote')}</p>
        <ol class="activities">
          ${l.activities.map(([title, type]) => `<li>
            <div><span class="act-title" lang="en">${esc(title)}</span><span class="act-type">${esc(pick(ACTIVITY_TYPES[type]))}</span></div>
            <span class="soon">${t('lesson.soon')}</span>
          </li>`).join('')}
        </ol>
      </section>

      <section>
        <h2 class="h2">${t('lesson.video')}</h2>
        ${vid ? `<div class="video${isShort ? ' short' : ''}" id="video">
            <button type="button" data-video="${vid}" aria-label="${esc(t('lesson.videoPlay'))}">
              <img src="https://i.ytimg.com/vi/${vid}/hqdefault.jpg" alt="" loading="lazy">
              <span class="play">${t('lesson.videoPlay')}</span>
            </button>
          </div>
          <a class="video-link" href="${esc(l.video)}" target="_blank" rel="noopener">${t('lesson.videoOpen')}</a>`
        : `<p class="note">${t('lesson.noVideo')}</p>`}
      </section>

      <section>
        <h2 class="h2">${t('lesson.homework')}</h2>
        <ul class="homework" lang="en">${l.homework.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      </section>
    </div>

    <aside class="lesson-aside">
      <details class="gloss" id="gloss" open>
        <summary class="gloss-head"><h2 class="h3">${t('lesson.glossary')}</h2><span class="count">${l.glossary.length}</span></summary>
        <dl lang="en">
          ${l.glossary.map(([term, meaning, k]) => `<dt data-kind="${k || l.kind}">${esc(term)}</dt><dd>${esc(meaning)}</dd>`).join('')}
        </dl>
      </details>
    </aside>
  </div>

  <nav class="pager" aria-label="${esc(t('nav.lessons'))}">
    ${prev ? `<a class="prev" href="${lessonUrl(prev.n)}"><small>${t('lesson.prev')}</small><b>${prev.n}. ${esc(prev.title)}</b></a>` : `<span class="empty"></span>`}
    ${next ? `<a class="next" href="${lessonUrl(next.n)}"><small>${t('lesson.next')}</small><b>${next.n}. ${esc(next.title)}</b></a>` : `<a class="next" href="#/darslar"><small>${t('lesson.all')}</small><b>${t('nav.lessons')}</b></a>`}
  </nav>`;
}

function bindLesson() {
  // Telefonda lug'at yig'ilgan holda boshlanadi, kompyuterda doim ochiq
  const gloss = document.getElementById('gloss');
  if (gloss && window.matchMedia('(max-width: 980px)').matches) gloss.open = false;
  gloss?.addEventListener('toggle', () => { if (window.matchMedia('(min-width: 981px)').matches) gloss.open = true; });
  main.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => openViewer(b.dataset.zoom, b.querySelector('img').alt)));
  const vb = main.querySelector('[data-video]');
  vb?.addEventListener('click', () => {
    const id = vb.dataset.video;
    vb.parentElement.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  });
}

function openViewer(src, alt) {
  const dlg = document.getElementById('viewer');
  const img = dlg.querySelector('img');
  img.src = src; img.alt = alt || '';
  if (typeof dlg.showModal === 'function') dlg.showModal(); else window.open(src, '_blank');
}

/* ---------- Lug'at ---------- */
function viewGlossary(params) {
  return `
  <section class="page-head">
    <div class="wrap">
      <h1 class="display">${t('glossary.title')}</h1>
      <p class="lead">${t('glossary.lead', MERGED.length)}</p>
    </div>
  </section>
  <section class="section" style="padding-top:32px">
    <div class="wrap">
      <div class="gl-tools">
        <input class="field" id="gl-q" type="search" autocomplete="off" placeholder="${esc(t('glossary.search'))}" aria-label="${esc(t('glossary.search'))}" value="${esc(params.get('q') || '')}">
        <select class="field" id="gl-lesson" aria-label="${esc(t('glossary.lesson'))}">
          <option value="">${t('glossary.allLessons')}</option>
          ${LESSONS.map((l) => `<option value="${l.n}" ${params.get('dars') == l.n ? 'selected' : ''}>${l.n}. ${esc(l.title)}</option>`).join('')}
        </select>
      </div>
      <div class="filters" role="group" aria-label="Filter" data-filter-scope="glossary">
        <button class="chip" type="button" data-filter="all" aria-pressed="true">${t('filter.all')}</button>
        ${['idiom', 'phrasal', 'phrase', 'vocab'].map((k) => `<button class="chip" type="button" data-filter="${k}" aria-pressed="false" style="--k:var(--k-${k})"><span class="dot" style="color:var(--k)"></span>${kindLabel(k)}</button>`).join('')}
      </div>
      <div class="gl-status"><span id="gl-count" aria-live="polite"></span><button class="btn ghost small" type="button" id="gl-clear">${t('glossary.clear')}</button></div>
      <div id="gl-results"></div>
    </div>
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
    if (!list.length) { out.innerHTML = `<p class="gl-empty">${t('glossary.empty')}</p>`; return; }
    let html = ''; let letter = '';
    for (const e of list) {
      const L = sortKey(e.term).charAt(0).toUpperCase();
      if (L !== letter) { if (letter) html += '</ul>'; letter = L; html += `<h2 class="gl-letter">${esc(L)}</h2><ul class="gl-list" lang="en">`; }
      html += `<li class="gl-item" data-kind="${e.kind}">
        <span class="gl-term">${esc(e.term)}</span>
        <div class="gl-meaning">${e.meanings.map((m) => `<p>${esc(m)}</p>`).join('')}</div>
        <span class="gl-lessons">${e.lessons.map((n) => `<a href="${lessonUrl(n)}" lang="${getLang()}">${t('lesson.label', n)}</a>`).join('')}</span>
      </li>`;
    }
    out.innerHTML = html + '</ul>';
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
  const lang = getLang();
  const annLang = lang === 'en' ? 'en' : 'uz';
  return `
  <section class="page-head">
    <div class="wrap">
      <h1 class="display">${t('about.title')}</h1>
      <p class="lead" lang="en">“${esc(BOOK.title)}” — ${esc(BOOK.subtitle)}</p>
    </div>
  </section>
  <div class="wrap about-grid">
    <aside class="about-side">
      <img src="img/cover.webp" width="800" height="1132" alt="“Phraseo-Barrier Matrix” kitobi muqovasi" loading="lazy">
      <dl>
        <div><dt>${t('about.author')}</dt><dd>${esc(BOOK.author)}</dd></div>
        <div><dt>${t('about.reviewers')}</dt>${BOOK.reviewers.map((r) => `<dd>${esc(r.name)}<br><span class="muted">${esc(pick(r.role))}</span></dd>`).join('')}</div>
        <div><dt>${esc(pick(BOOK.university))}</dt><dd class="muted">${esc(pick(BOOK.program))}. ${esc(pick(BOOK.city))}</dd></div>
      </dl>
    </aside>
    <div class="about-main">
      <section>
        <h2 class="h2">${t('about.annotation')}</h2>
        <div class="tabs" role="tablist" aria-label="${esc(t('about.annotation'))}">
          ${[['uz', 'Oʻzbekcha'], ['en', 'English'], ['ru', 'Русский']].map(([k, label]) => `<button class="chip" role="tab" type="button" data-ann="${k}" aria-selected="${k === annLang}" aria-pressed="${k === annLang}">${label}</button>`).join('')}
        </div>
        <div class="prose" id="ann" lang="${annLang}"><p>${esc(BOOK.annotation[annLang])}</p></div>
      </section>
      <section>
        <h2 class="h2">${t('about.intro')}</h2>
        <div class="prose" lang="en">${BOOK.introduction.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      </section>
      <section>
        <h2 class="h2">${t('about.aims')}</h2>
        <ul class="numlist" lang="en">${BOOK.aims.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
      </section>
      <section>
        <h2 class="h2">${t('about.features')}</h2>
        <div class="features" lang="en">${BOOK.features.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>
      </section>
      <section>
        <h2 class="h2">${t('about.why')}</h2>
        <div class="prose" lang="en"><p>${esc(BOOK.whyText)}</p></div>
      </section>
      <section>
        <h2 class="h2">${t('about.types')}</h2>
        <ol class="numlist" lang="en">${BOOK.exerciseTypes.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
      </section>
      <section>
        <h2 class="h2">${t('about.tips')}</h2>
        <ol class="numlist" lang="en">${BOOK.tips.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
        <p class="note" style="margin-top:24px">${t('about.note')}</p>
      </section>
    </div>
  </div>`;
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
const TITLES = {
  home: 'Phraseo-Barrier Matrix — ingliz idiomalari',
};

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  return { parts, params: new URLSearchParams(query) };
}

function render() {
  const { parts, params } = parseHash();
  const route = parts[0] || '';
  let html; let bind = () => {}; let title = TITLES.home; let navKey = '';

  if (route === '') { html = viewHome(); bind = bindHome; }
  else if (route === 'darslar') { html = viewLessons(); bind = bindLessons; title = `${t('nav.lessons')} — Phraseo-Barrier Matrix`; navKey = 'darslar'; }
  else if (route === 'dars') {
    const n = Number(parts[1]);
    html = viewLesson(n); bind = bindLesson; navKey = 'darslar';
    const l = LESSONS.find((x) => x.n === n);
    if (l) title = `${l.n}. ${l.title} — Phraseo-Barrier Matrix`;
  }
  else if (route === 'lugat') { html = viewGlossary(params); bind = bindGlossary; title = `${t('nav.glossary')} — Phraseo-Barrier Matrix`; navKey = 'lugat'; }
  else if (route === 'kitob') { html = viewAbout(); bind = bindAbout; title = `${t('nav.about')} — Phraseo-Barrier Matrix`; navKey = 'kitob'; }
  else { html = viewHome(); bind = bindHome; }

  main.innerHTML = `<div class="view-enter">${html}</div>`;
  document.title = title;
  document.querySelectorAll('.site-nav [data-route]').forEach((a) => {
    if (a.dataset.route === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  closeMenu();
  bind();
}

function onNavigate() {
  render();
  window.scrollTo(0, 0);
  // Ekran o'quvchilar uchun fokusni asosiy qismga o'tkazamiz (bosh sahifadan tashqari)
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

const menuBtn = document.querySelector('.menu-btn');
const nav = document.getElementById('site-nav');
function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
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
