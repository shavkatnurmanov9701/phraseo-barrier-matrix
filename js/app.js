// Phrasebar — sahifalar va marshrutlash (hash router).
// Dizayn: oq fon, ingichka katta sarlavhalar, binafsha/pushti/sariq/to‘q sariq kartochkalar (Wollo uslubi).
import { LESSONS, KINDS, ACTIVITY_TYPES, OBJECTIVES, allEntries } from './data/lessons.js';
import { BOOK, HERO_IDIOMS, STATEMENT, FAQ } from './data/book.js';
import { t, pick, getLang, setLang } from './i18n.js';
import { icon } from './icons.js';
import { heroScene, cakeIcon, planeIcon, puzzleIcon, bookIcon, sticker } from './art.js';
import { PRACTICE } from './data/practice/index.js';
import { renderExercise, bindExercise, idiomMatcher, progressCount, clearLesson } from './practice.js';

const main = document.getElementById('main');
const ENTRIES = allEntries();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Yordamchilar ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lessonUrl = (n) => `#/dars/${n}`;
const kindLabel = (k) => pick(KINDS[k]);
const pad2 = (n) => String(n).padStart(2, '0');
// Interaktiv darslarda mashqlar soni amaldagi mashqlardan olinadi
const actCount = (l) => (PRACTICE[l.n] ? PRACTICE[l.n].exercises.length : l.activities.length);
const TOTAL_ACTS = LESSONS.reduce((n, l) => n + actCount(l), 0);

const ACT_ICONS = {
  gap: 'text-cursor-input', mcq: 'list-checks', tf: 'square-check-big', match: 'shuffle', order: 'arrow-up-down',
  rewrite: 'repeat', open: 'circle-help', discuss: 'message-circle', write: 'pen-line', video: 'video',
  crossword: 'grid-2x2', riddle: 'puzzle', roleplay: 'users', hunt: 'search',
};

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

// Hikoya matnida lug‘atdagi iboralarni belgilash (taxminiy moslik) — matnli hikoyalar uchun
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

function filtersHtml(scope, kinds = ['idiom', 'phrasal', 'phrase'], active = 'all') {
  return `<div class="seg" role="group" aria-label="Filter" data-filter-scope="${scope}">
    <button type="button" data-filter="all" aria-pressed="${active === 'all'}">${t('filter.all')}</button>
    ${kinds.map((k) => `<button type="button" data-filter="${k}" data-kind="${k}" aria-pressed="${active === k}"><span class="dot"></span>${kindLabel(k)}</button>`).join('')}
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

function pageHead(title, sub, extra = '') {
  return `<header class="page-head reveal">
    <h1 class="display">${title}</h1>
    ${sub ? `<p class="lede">${sub}</p>` : ''}${extra}
  </header>`;
}

/* ---------- Dars kartochkasi ---------- */
function lessonCard(l) {
  return `<a class="lcard" href="${lessonUrl(l.n)}" data-kind="${l.kind}">
    <div class="lcard-top">
      <span class="lnum tnum">${pad2(l.n)}</span>
      <span class="kpill">${esc(kindLabel(l.kind))}</span>
    </div>
    <h3 lang="en">${esc(l.title)}</h3>
    <p class="desc">${esc(pick(l.about))}</p>
    ${cardProgress(l.n)}
    <div class="lcard-foot">
      <span class="muted">${t('lessons.count', l.glossary.length)} · ${t('lessons.acts', actCount(l))}</span>
      <span class="round-arrow" aria-hidden="true">${icon('arrow-right', 16)}</span>
    </div>
  </a>`;
}

function cardProgress(n) {
  const pr = PRACTICE[n];
  if (!pr) return '';
  const { done, total } = progressCount(n, pr);
  const pct = Math.round((done / total) * 100);
  return `<div class="cprog"><div class="cprog-row"><span class="live">${icon('sparkles', 12)} ${getLang() === 'en' ? 'Interactive' : 'Interaktiv'}</span><span class="tnum">${t('lessons.progress', done, total)}</span></div><div class="bar"><span style="width:${pct}%"></span></div></div>`;
}

function cardsHtml(filter, limit = 0) {
  let list = LESSONS.filter((l) => filter === 'all' || l.kind === filter);
  if (limit) list = list.slice(0, limit);
  if (!list.length) return `<p class="empty-card">${t('lessons.empty')}</p>`;
  return list.map(lessonCard).join('');
}

/* ---------- Bosh sahifa ---------- */
// 3D kitob: muqova (oldi — kitob muqovasi, orqasi — kitob haqida), o‘ng sahifa — mundarija
function bookHtml() {
  const toc = LESSONS.map((l) => `<li data-kind="${l.kind}"><a href="${lessonUrl(l.n)}">
      <span class="toc-n tnum">${pad2(l.n)}</span><span class="toc-t" lang="en">${esc(l.title)}</span><span class="toc-dots" aria-hidden="true"></span><span class="toc-p tnum">${l.page}</span>
    </a></li>`).join('');
  return `<div class="book" id="book" data-open="false" data-leaf="0">
    <div class="book-page right">
      <div class="page-inner">
        <p class="page-kicker">${t('w.contents')}</p>
        <ol class="toc">${toc}</ol>
      </div>
    </div>
    <div class="book-leaf info-leaf" data-leaf-turn>
      <div class="page-inner">
          <p class="page-kicker">${t('w.studyGuide')}</p>
          <h3 class="inner-title">Phraseo-Barrier Matrix</h3>
          <p class="inner-sub" lang="en">${esc(BOOK.subtitle)}</p>
          <dl class="inner-facts">
            <div><dt>${t('about.author')}</dt><dd>${esc(BOOK.author)}</dd></div>
            <div><dt>${t('about.reviewers')}</dt><dd>${BOOK.reviewers.map((r) => esc(r.name)).join('<br>')}</dd></div>
            <div><dt>OTM</dt><dd>${esc(pick(BOOK.university))}</dd></div>
            <div><dt>${t('w.edition')}</dt><dd>${esc(pick(BOOK.city))}</dd></div>
          </dl>
          <a class="link" href="#/kitob">${t('w.aboutBook')} ${icon('arrow-right', 14)}</a>
        <span class="turn-hint">${t('w.contents')} ${icon('arrow-right', 14)}</span>
      </div>
      <div class="leaf-back" aria-hidden="true"></div>
    </div>
    <div class="book-cover" role="button" tabindex="0" aria-controls="book" aria-label="${esc(t('w.openBook'))}" data-book-toggle>
      <div class="face front"><img src="img/cover.webp" width="800" height="1132" alt="“Phraseo-Barrier Matrix” — ${esc(BOOK.author)}"><span class="open-hint">${icon('book-open', 15)} ${t('w.openBook')}</span></div>
      <div class="face back">
        <div class="page-inner">
          <p class="page-kicker">${t('w.studyGuide')}</p>
          <h3 class="inner-title">Phraseo-Barrier Matrix</h3>
          <p class="inner-sub" lang="en">${esc(BOOK.subtitle)}</p>
          <dl class="inner-facts">
            <div><dt>${t('about.author')}</dt><dd>${esc(BOOK.author)}</dd></div>
            <div><dt>${t('about.reviewers')}</dt><dd>${BOOK.reviewers.map((r) => esc(r.name)).join('<br>')}</dd></div>
            <div><dt>OTM</dt><dd>${esc(pick(BOOK.university))}</dd></div>
            <div><dt>${t('w.edition')}</dt><dd>${esc(pick(BOOK.city))}</dd></div>
          </dl>
          <a class="link" href="#/kitob">${t('w.aboutBook')} ${icon('arrow-right', 14)}</a>
        </div>
      </div>
    </div>
  </div>`;
}

function viewHome() {
  const kindStats = ['idiom', 'phrasal', 'phrase'].map((k) => ({ k, lessons: LESSONS.filter((l) => l.kind === k).length, entries: MERGED.filter((e) => e.kind === k).length }));
  const maxEntries = Math.max(...kindStats.map((x) => x.entries));
  const typeCards = [
    { k: 'idiom', cls: 'c-orange', art: cakeIcon('ci'), ex: ['A piece of cake', 'Break the ice', 'Over the moon', 'Under the weather'] },
    { k: 'phrasal', cls: 'c-pink', art: planeIcon('pi'), ex: ['Set off', 'Put off', 'Come up with', 'Hold back'] },
    { k: 'phrase', cls: 'c-violet', art: puzzleIcon('zi'), ex: ['Spend quality time', 'Make fun of', 'Stay united', 'Take a deep breath'] },
  ];
  const statement = pick(STATEMENT).split(/(\{\w+\})/).map((part, i) => {
    const m = part.match(/^\{(\w+)\}$/);
    if (m) return `<span class="inline-sticker" aria-hidden="true">${sticker(m[1], `st${i}`)}</span>`;
    return part.split(/(\s+)/).map((w) => (w.trim() ? `<span class="w">${esc(w)}</span>` : w)).join('');
  }).join('');
  const stats = [
    { n: LESSONS.length, k: 1, s: 'cake', bg: '#FFE8DC' },
    { n: MERGED.length, k: 2, s: 'heart', bg: '#FFE3F0' },
    { n: TOTAL_ACTS, k: 3, s: 'ice', bg: '#E2F6FC' },
    { n: 3, k: 4, s: 'moon', bg: '#FFF4D1' },
  ];

  return `
  <section class="hero wrap">
    <p class="hero-badge reveal"><img src="img/cover-sm.webp" width="400" height="566" alt=""> ${t('w.studyGuide')} · ${esc(BOOK.authorShort)}</p>
    <h1 class="display hero-title reveal">Phraseo-Barrier Matrix</h1>
    <p class="lede reveal">${t('w.bookLede')}</p>
    <div class="hero-actions reveal">
      <button class="btn violet" type="button" data-open-book>${icon('book-open', 16)} ${t('w.openBook')}</button>
      <a class="btn ghost" href="#/dars/1">${t('w.startFirst')}</a>
    </div>
  </section>

  <section class="stack-wrap" id="stack" aria-label="Phraseo-Barrier Matrix">
    <div class="stack">
      <div class="layer y" aria-hidden="true"></div>
      <div class="layer p" aria-hidden="true"></div>
      <div class="layer v book-stage">
        <span class="float f1" aria-hidden="true">${sticker('moon', 'fm')}</span>
        <span class="float f2" aria-hidden="true">${sticker('heart', 'fh')}</span>
        <span class="float f3" aria-hidden="true">${sticker('cake', 'fc')}</span>
        <span class="float f4" aria-hidden="true">${sticker('ice', 'fi')}</span>
        <span class="float f5" aria-hidden="true">${sticker('cow', 'fw')}</span>
        <div class="book-fit" id="book-fit">${bookHtml()}</div>
        <div class="book-nav" role="group" aria-label="${esc(t('w.openBook'))}">
          <button type="button" data-goto="0" aria-pressed="true">${t('w.cover')}</button>
          <button type="button" data-goto="1" aria-pressed="false">${t('nav.about')}</button>
          <button type="button" data-goto="2" aria-pressed="false">${t('w.contents')}</button>
        </div>
        <p class="stage-hint" aria-hidden="true">${t('w.scrollHint')}</p>
      </div>
    </div>
  </section>

  <section class="section wrap" id="lessons" aria-labelledby="h-lessons">
    <h2 class="display h2 center reveal" id="h-lessons">${t('w.lessonsTitle')}</h2>
    <p class="lede reveal">${t('w.lessonsLede')}</p>
    <div class="types">
      ${typeCards.map((c, i) => {
        const st = kindStats.find((x) => x.k === c.k);
        return `<button class="type reveal" type="button" data-type="${c.k}" aria-pressed="false" style="--i:${i}">
          <span class="type-label">${esc(kindLabel(c.k))}<br><span class="muted">${t('w.lessonsOf', st.lessons)} · ${t('w.entriesN', st.entries)}</span></span>
          <span class="type-card ${c.cls}">
            <span class="type-pill">${esc(kindLabel(c.k))}</span>
            <span class="type-art">${c.art}</span>
            <span class="type-ex" lang="en">${c.ex.map((x) => `<span>${esc(x)}</span>`).join('')}</span>
            <span class="type-num">${pad2(i + 1)}</span>
            <span class="type-go" aria-hidden="true">${icon('arrow-right', 16)}</span>
          </span>
        </button>`;
      }).join('')}
    </div>
    <div class="center filters-row">${filtersHtml('home')}</div>
    <div class="grid-cards" id="cards">${cardsHtml('all', 6)}</div>
    <p class="center" style="margin-top:28px"><a class="btn dark" href="#/darslar">${t('w.allLessons')}</a></p>
  </section>

  <section class="section wrap">
    <h2 class="display h2 center reveal">${t('w.dayTitle')}</h2>
    <div class="duo">
      <div class="panel reveal">
        <p class="panel-title">${t('w.dayCard')}</p>
        <div class="flash" id="flash" data-open="false" aria-live="polite"></div>
      </div>
      <div class="panel reveal">
        <p class="panel-title">${t('w.mixCard')}</p>
        <div class="mix">
          <div class="mix-tiles">
            <div class="tile-y"><small>${t('stat.entries')}</small><b class="tnum">+${MERGED.length}</b></div>
            <div class="tile-p"><small>${t('stat.lessons')}</small><b class="tnum">+${LESSONS.length}</b></div>
          </div>
          <ul class="bars">
            ${kindStats.map((x) => `<li data-kind="${x.k}"><span class="bar-fill" style="--w:${Math.round((x.entries / maxEntries) * 100)}%"><b class="tnum">${x.entries}</b></span><span class="bar-label">${kindLabel(x.k)}</span></li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section wrap learn">
    <p class="display learn-line reveal">${t('w.learn')} <span class="chip-roll" id="roll" aria-live="polite"><span lang="en">${esc(HERO_IDIOMS[0].en.toLowerCase())}</span></span></p>
    <p class="center"><a class="btn ghost" href="#/lugat">${t('w.glossary')}</a></p>
  </section>

  <section class="section wrap">
    <p class="statement" id="statement">${statement}</p>
  </section>

  <section class="section wrap">
    <ul class="stats">
      ${stats.map((s) => `<li class="stat reveal">
        <span class="stat-thumb" style="background:${s.bg}">${sticker(s.s, `sx${s.k}`)}</span>
        <span class="stat-num tnum">${s.n}<span class="stat-pill p${s.k}">${t(`w.statsPill${s.k}`)}</span></span>
        <span class="stat-desc">${t(`w.statsDesc${s.k}`)}</span>
      </li>`).join('')}
    </ul>
  </section>

  <section class="section wrap narrow">
    <h2 class="display h2 center reveal">${t('w.faqTitle')}</h2>
    <div class="faq">
      ${FAQ.map((f) => `<details class="reveal"><summary>${esc(pick(f.q))}<span class="plus" aria-hidden="true"></span></summary><p>${esc(pick(f.a))}</p></details>`).join('')}
    </div>
  </section>

  <section class="section wrap">
    <div class="cta reveal">
      <div class="cta-text">
        <h2 class="display">${t('w.ctaTitle')}</h2>
        <a class="btn light" href="#/dars/1">${t('w.startFirst')}</a>
      </div>
      <div class="cta-art">${bookIcon('cta')}</div>
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
      <span class="kpill" data-kind="idiom">${esc(t('lesson.label', h.lesson))}</span>
      <span class="muted tnum">${heroIndex + 1} / ${HERO_IDIOMS.length}</span>
    </div>
    <p class="flash-idiom" lang="en">${esc(h.en)}</p>
    <p class="flash-literal">${t('card.literal')}: <i lang="uz">${esc(h.literal)}</i></p>
    <div class="flash-meaning">
      <div class="tile-y small"><small>${open ? t('card.meaning') : t('card.hidden')}</small>
        ${open ? `<b class="reveal-in" lang="uz">${esc(h.uz)}</b>` : '<b aria-hidden="true">? ? ?</b>'}
      </div>
      <div class="tile-p small"><small>English</small>${open ? `<b class="reveal-in" lang="en">${esc(h.meaning)}</b>` : '<b aria-hidden="true">? ? ?</b>'}</div>
    </div>
    <div class="flash-foot">
      <button class="btn violet sm" type="button" data-act="toggle" aria-expanded="${open}">${icon(open ? 'x' : 'eye', 15)} ${open ? t('card.hide') : t('card.reveal')}</button>
      <button class="btn ghost sm" type="button" data-act="next">${icon('shuffle', 14)} ${t('card.next')}</button>
      <a class="link" href="${lessonUrl(h.lesson)}">${t('card.lesson')} ${icon('arrow-right', 14)}</a>
    </div>`;
}

/* ---------- Scroll effektlari ---------- */
let cleanup = [];
function onScrollFx(fn) {
  let raf = 0;
  const run = () => { raf = 0; fn(); };
  const handler = () => { if (!raf) raf = requestAnimationFrame(run); };
  window.addEventListener('scroll', handler, { passive: true });
  window.addEventListener('resize', handler);
  fn();
  cleanup.push(() => { window.removeEventListener('scroll', handler); window.removeEventListener('resize', handler); cancelAnimationFrame(raf); });
}

function revealOnView() {
  const els = main.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((e) => io.observe(e));
  cleanup.push(() => io.disconnect());
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

  // Aylanib turuvchi sariq "chip"
  const roll = document.getElementById('roll');
  let ri = 0;
  if (!reduceMotion) {
    const id = setInterval(() => {
      ri = (ri + 1) % HERO_IDIOMS.length;
      roll.innerHTML = `<span lang="en" class="roll-in">${esc(HERO_IDIOMS[ri].en.toLowerCase())}</span>`;
    }, 2200);
    cleanup.push(() => clearInterval(id));
  }

  // Dars turlari kartochkalari darslarni filtrlaydi
  const typeBtns = [...document.querySelectorAll('[data-type]')];
  const segBtns = [...document.querySelectorAll('[data-filter-scope="home"] [data-filter]')];
  const setFilter = (f) => {
    typeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === f)));
    segBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
    document.getElementById('cards').innerHTML = cardsHtml(f, f === 'all' ? 6 : 0);
  };
  typeBtns.forEach((b) => b.addEventListener('click', () => {
    setFilter(b.getAttribute('aria-pressed') === 'true' ? 'all' : b.dataset.type);
    document.getElementById('cards').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }));
  segBtns.forEach((b) => b.addEventListener('click', () => setFilter(b.dataset.filter)));

  // 3D kitob: scroll bilan ochiladi; muqovani bosish yoki "Kitobni ochish" tugmasi ham ochadi
  const stack = document.getElementById('stack');
  const book = document.getElementById('book');
  let forced = null; // null — scrollga bog‘liq, 0/1 — foydalanuvchi tanlovi
  const navBtns = [...document.querySelectorAll('[data-goto]')];
  const syncNav = () => {
    const step = book.dataset.open !== 'true' ? 0 : book.dataset.leaf === '2' ? 2 : 1;
    navBtns.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.goto) === step)));
  };
  const setOpen = (o) => {
    book.style.setProperty('--o', o.toFixed(3));
    book.dataset.open = String(o > 0.5);
    if (o <= 0.5) book.dataset.leaf = '0';
    syncNav();
  };
  const animate = () => { book.classList.add('animating'); clearTimeout(animate.t); animate.t = setTimeout(() => book.classList.remove('animating'), 900); };
  // Telefonda: 0 — muqova, 1 — kitob haqida, 2 — mundarija (sahifalar varaqlanadi)
  const goTo = (step) => {
    animate();
    forced = step === 0 ? 0 : 1;
    setOpen(forced);
    book.dataset.leaf = step === 2 ? '2' : '0';
    syncNav();
  };
  navBtns.forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.goto))));
  book.querySelector('[data-leaf-turn]').addEventListener('click', (e) => { if (!e.target.closest('a')) goTo(2); });
  const toggle = () => {
    const now = book.dataset.open === 'true';
    forced = now ? 0 : 1;
    book.classList.add('animating');
    setOpen(forced);
    setTimeout(() => book.classList.remove('animating'), 900);
  };
  book.querySelector('[data-book-toggle]').addEventListener('click', (e) => { if (!e.target.closest('a')) toggle(); });
  book.querySelector('[data-book-toggle]').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  document.querySelector('[data-open-book]').addEventListener('click', () => {
    stack.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    forced = 1; book.classList.add('animating'); setOpen(1);
    setTimeout(() => book.classList.remove('animating'), 900);
  });

  // Telefonda kitobni ekranga sig‘diradigan masshtab
  const fit = document.getElementById('book-fit');
  const fitBook = () => {
    const stage = fit.parentElement;
    const avail = stage.clientWidth - 20;
    fit.style.setProperty('--bk', Math.min(1, avail / 600).toFixed(4));
  };
  fitBook();
  window.addEventListener('resize', fitBook);
  cleanup.push(() => window.removeEventListener('resize', fitBook));

  const words = [...document.querySelectorAll('#statement .w, #statement .inline-sticker')];
  onScrollFx(() => {
    const vh = window.innerHeight;
    const r = stack.getBoundingClientRect();
    const p = reduceMotion ? 1 : Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (vh * 0.6)));
    stack.style.setProperty('--p', p.toFixed(3));
    if (forced === null) {
      // kartochka ekranga chiqqach muqova asta ochiladi
      const narrow = window.innerWidth <= 760;
      const o = reduceMotion ? 1 : narrow
        ? Math.min(1, Math.max(0, (vh * 0.42 - r.top) / (vh * 0.3)))
        : Math.min(1, Math.max(0, (vh * 0.62 - r.top) / (vh * 0.42)));
      setOpen(o);
    }
    // Katta jumla: so‘zlar scroll bilan qorayadi
    const st = document.getElementById('statement');
    if (!st) return;
    const sr = st.getBoundingClientRect();
    const q = reduceMotion ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - sr.top) / (sr.height + vh * 0.35)));
    const lit = Math.round(q * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < lit));
  });
}

/* ---------- Darslar ro‘yxati ---------- */
function viewLessons(params) {
  const tur = ['idiom', 'phrasal', 'phrase'].includes(params.get('tur')) ? params.get('tur') : 'all';
  return `<section class="wrap page">
    ${pageHead(t('lessons.title'), t('lessons.lead'))}
    <div class="center filters-row">${filtersHtml('lessons', undefined, tur)}</div>
    <div class="grid-cards" id="cards">${cardsHtml(tur)}</div>
  </section>`;
}
function bindLessons() {
  bindFilters('lessons', (f) => { document.getElementById('cards').innerHTML = cardsHtml(f); });
}

/* ---------- Bitta dars ---------- */
function viewLesson(n) {
  const l = LESSONS.find((x) => x.n === n);
  if (!l) return `<section class="wrap page notfound"><h1 class="display h2">${t('lesson.notFound')}</h1><a class="btn violet" href="#/darslar">${t('all.lessons')}</a></section>`;
  const prev = LESSONS.find((x) => x.n === n - 1);
  const next = LESSONS.find((x) => x.n === n + 1);
  const vid = youTubeId(l.video);
  const isShort = l.video?.includes('/shorts/');
  const mark = highlighter(l.glossary);
  const lang = getLang() === 'en' ? 'en' : 'uz';
  const pr = PRACTICE[l.n];

  // Hikoya: kitobdagi sahifa (rasm) bo‘lsa, o‘sha ko‘rsatiladi (egasi shuni tanladi)
  const storyBlock = l.poster
    ? `<button class="poster" type="button" data-zoom="${l.poster}" aria-label="${esc(t('lesson.open'))}: ${esc(l.title)}">
         <img src="${l.poster}" alt="${esc(l.title)} — kitobdagi hikoya sahifasi" loading="lazy">
         <span class="enlarge">${icon('maximize-2', 15)} ${t('lesson.open')}</span>
       </button>
       <p class="note">${t('lesson.storyPoster')}</p>`
    : `${l.warmup ? `<img class="warmup-img" src="${l.warmup}" alt="" loading="lazy">` : ''}
       <p class="note">${t('lesson.storyText')}</p>
       <div class="story-text" lang="en">${l.story.map((p) => p.startsWith('§')
          ? `<p class="verse">${esc(p.slice(1))}</p>`
          : `<p>${mark(p)}</p>`).join('')}</div>`;

  const block = (title, body, id = '') => `<section class="panel"${id ? ` id="${id}"` : ''}>
      <h2 class="panel-h">${title}</h2>
      ${body}
    </section>`;

  return `<div class="wrap page lesson" data-kind="${l.kind}">
  <nav class="crumbs" aria-label="breadcrumb"><a href="#/darslar">${t('nav.lessons')}</a><span aria-hidden="true">/</span><span>${t('lesson.label', l.n)}</span></nav>

  <header class="lesson-head reveal">
    <div class="pills"><span class="kpill">${esc(kindLabel(l.kind))}</span><span class="kpill plain">${t('lesson.inBook', l.book, l.page)}</span></div>
    <h1 class="display" lang="en"><span class="lnum-big tnum">${pad2(l.n)}</span> ${esc(l.title)}</h1>
    <p class="lede">${esc(pick(l.about))}</p>
    <p class="lesson-meta muted">${t('lessons.count', l.glossary.length)} · ${t('lessons.acts', actCount(l))}${vid ? ' · Video' : ''}</p>
  </header>

  <div class="lesson-layout">
    <div class="lesson-main">
      ${block(t('lesson.objectives'), `<p class="note">${t('lesson.objectivesLead')}</p>
        <ul class="checks" ${lang === 'en' ? 'lang="en"' : ''}>${OBJECTIVES[lang].map((o) => `<li><span class="ok">${icon('check', 13)}</span><span>${esc(o)}</span></li>`).join('')}</ul>`)}

      ${pr?.warmup ? renderExercise(pr.warmup, null, l.n) : ''}

      ${block(t('lesson.story'), storyBlock)}

      ${pr ? practiceHtml(l, pr) : block(t('lesson.activities'), `<p class="note">${t('lesson.activitiesNote')}</p>
        <ol class="acts">${l.activities.map(([title, type]) => `<li>
          <span class="act-ic">${icon(ACT_ICONS[type] || 'list-checks', 17)}</span>
          <span class="txt"><b lang="en">${esc(title)}</b><small>${esc(pick(ACTIVITY_TYPES[type]))}</small></span>
          <span class="soon">${t('lesson.soon')}</span>
        </li>`).join('')}</ol>`)}

      ${vid ? block(t('lesson.video'), `<div class="video${isShort ? ' short' : ''}">
          <button type="button" data-video="${vid}" aria-label="${esc(t('lesson.videoPlay'))}">
            <img src="https://i.ytimg.com/vi/${vid}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()">
            <span class="playbtn"><span class="c">${icon('play', 16)}</span>${t('lesson.videoPlay')}</span>
          </button>
        </div>
        <a class="link" href="${esc(l.video)}" target="_blank" rel="noopener">${t('lesson.videoOpen')} ${icon('arrow-right', 14)}</a>`) : ''}

      ${pr ? '' : block(t('lesson.homework'), `<ul class="hw" lang="en">${l.homework.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`)}
    </div>

    <aside class="panel aside">
      <details class="gloss" id="gloss" open>
        <summary><h2 class="panel-h">${t('lesson.glossary')}</h2><span class="cnt tnum">${l.glossary.length}</span><span class="chev">${icon('chevron-down', 18)}</span></summary>
        <dl lang="en">
          ${l.glossary.map(([term, meaning, k]) => `<div class="entry" data-kind="${k || l.kind}"><dt>${esc(term)}</dt><dd>${esc(meaning)}</dd></div>`).join('')}
        </dl>
      </details>
    </aside>
  </div>

  <nav class="pager" aria-label="${esc(t('nav.lessons'))}">
    ${prev ? `<a class="pg" href="${lessonUrl(prev.n)}"><span class="round-arrow">${icon('arrow-left', 16)}</span><span><small>${t('lesson.prev')}</small><b>${pad2(prev.n)} · ${esc(prev.title)}</b></span></a>` : '<span></span>'}
    ${next ? `<a class="pg next" href="${lessonUrl(next.n)}"><span class="round-arrow">${icon('arrow-right', 16)}</span><span><small>${t('lesson.next')}</small><b>${pad2(next.n)} · ${esc(next.title)}</b></span></a>`
      : `<a class="pg next" href="#/darslar"><span class="round-arrow">${icon('layout-grid', 16)}</span><span><small>${t('all.lessons')}</small><b>${t('nav.lessons')}</b></span></a>`}
  </nav></div>`;
}

function practiceHtml(l, pr) {
  const { done, total } = progressCount(l.n, pr);
  return `<section class="panel practice-top" id="practice">
      <h2 class="panel-h">${t('ex.practiceTitle')}</h2>
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
  return `<section class="wrap page">
    ${pageHead(t('glossary.title'), t('glossary.lead', MERGED.length))}
    <div class="gl-tools">
      <label class="search-box">${icon('search', 19)}<input id="gl-q" type="search" autocomplete="off" placeholder="${esc(t('glossary.search'))}" aria-label="${esc(t('glossary.search'))}" value="${esc(params.get('q') || '')}"></label>
      <select class="select" id="gl-lesson" aria-label="${esc(t('glossary.lesson'))}">
        <option value="">${t('glossary.allLessons')}</option>
        ${LESSONS.map((l) => `<option value="${l.n}" ${params.get('dars') == l.n ? 'selected' : ''}>${pad2(l.n)} · ${esc(l.title)}</option>`).join('')}
      </select>
    </div>
    <div class="center filters-row">${filtersHtml('glossary', ['idiom', 'phrasal', 'phrase', 'vocab'])}</div>
    <div class="gl-status"><span id="gl-count" aria-live="polite"></span><button class="btn ghost sm" type="button" id="gl-clear">${icon('x', 14)} ${t('glossary.clear')}</button></div>
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
      <h2 class="gl-letter">${esc(L)}</h2>
      <ul class="gl-list" lang="en">${items.map((e) => `<li class="gl-item" data-kind="${e.kind}">
        <span class="gl-term">${esc(e.term)}</span>
        <div class="gl-meaning">${e.meanings.map((m) => `<p>${esc(m)}</p>`).join('')}</div>
        <span class="gl-lessons">${e.lessons.map((n) => `<a href="${lessonUrl(n)}" lang="${getLang()}">${pad2(n)}</a>`).join('')}</span>
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
  const sec = (title, body) => `<section class="panel"><h2 class="panel-h">${title}</h2>${body}</section>`;
  return `<div class="wrap page">
  ${pageHead(esc(BOOK.title), `<span lang="en">${esc(BOOK.subtitle)}</span>`)}
  <div class="about-grid">
    <aside class="about-side">
      <img class="cover-img" src="img/cover.webp" width="800" height="1132" alt="“Phraseo-Barrier Matrix” kitobi muqovasi">
      <dl class="panel">
        <div><dt>${t('about.author')}</dt><dd>${esc(BOOK.author)}</dd></div>
        <div><dt>${t('about.reviewers')}</dt>${BOOK.reviewers.map((r) => `<dd>${esc(r.name)}<span>${esc(pick(r.role))}</span></dd>`).join('')}</div>
        <div><dt>OTM</dt><dd>${esc(pick(BOOK.university))}<span>${esc(pick(BOOK.program))}. ${esc(pick(BOOK.city))}</span></dd></div>
      </dl>
    </aside>
    <div class="about-main">
      ${sec(t('about.annotation'), `<div class="seg tabs" role="tablist">
          ${[['uz', 'O‘zbekcha'], ['en', 'English'], ['ru', 'Русский']].map(([k, label]) => `<button role="tab" type="button" data-ann="${k}" aria-selected="${k === annLang}" aria-pressed="${k === annLang}">${label}</button>`).join('')}
        </div>
        <div class="prose" id="ann" lang="${annLang}"><p>${esc(BOOK.annotation[annLang])}</p></div>`)}
      ${sec(t('about.intro'), `<div class="prose" lang="en">${BOOK.introduction.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`)}
      ${sec(t('about.aims'), `<ol class="numlist" lang="en">${BOOK.aims.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>`)}
      ${sec(t('about.features'), `<div class="feat" lang="en">${BOOK.features.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>`)}
      ${sec(t('about.why'), `<div class="prose" lang="en"><p>${esc(BOOK.whyText)}</p></div>`)}
      ${sec(t('about.types'), `<ol class="numlist" lang="en">${BOOK.exerciseTypes.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>`)}
      ${sec(t('about.tips'), `<ol class="numlist" lang="en">${BOOK.tips.map((a) => `<li>${esc(a)}</li>`).join('')}</ol><p class="note" style="margin:18px 0 0">${t('about.note')}</p>`)}
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
  cleanup.forEach((fn) => fn());
  cleanup = [];
  const { parts, params } = parseHash();
  const route = parts[0] || '';
  const site = 'Phrasebar';
  let html; let bind = () => {}; let title = `${site} — ${t('w.heroTitle').toLowerCase()}`; let navKey = 'home';

  if (route === 'darslar') { html = viewLessons(params); bind = bindLessons; title = `${t('nav.lessons')} — ${site}`; navKey = 'darslar'; }
  else if (route === 'dars') {
    const n = Number(parts[1]);
    html = viewLesson(n); bind = bindLesson; navKey = 'darslar';
    const l = LESSONS.find((x) => x.n === n);
    if (l) title = `${pad2(l.n)} · ${l.title} — ${site}`;
  }
  else if (route === 'lugat') { html = viewGlossary(params); bind = bindGlossary; title = `${t('nav.glossary')} — ${site}`; navKey = 'lugat'; }
  else if (route === 'kitob') { html = viewAbout(); bind = bindAbout; title = `${t('nav.about')} — ${site}`; navKey = 'kitob'; }
  else { html = viewHome(); bind = bindHome; }

  main.innerHTML = html;
  document.body.dataset.page = navKey;
  document.title = title;
  document.querySelectorAll('[data-route]').forEach((a) => {
    if (a.dataset.route === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  closeMenu();
  bind();
  revealOnView();
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

// Header: sahifa pastga tushganda soya paydo bo‘ladi
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 8), { passive: true });

document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.lang === getLang()) return;
  setLang(b.dataset.lang);
  applyStaticI18n();
  render();
}));

window.addEventListener('hashchange', onNavigate);
applyStaticI18n();
render();
