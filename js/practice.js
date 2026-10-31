// Interaktiv mashqlar — EnNote mashqlari bilan bir xil ishlaydi:
// javob tanlanadi → "Tekshirish" → yashil/qizil belgilar, natija va "Qayta urinish".
// Natijalar va yozuvlar foydalanuvchining qurilmasida (localStorage) saqlanadi.
import { t, pick } from './i18n.js';
import { icon } from './icons.js';
import { ACTIVITY_TYPES } from './data/lessons.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const norm = (s) => String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/\s+/g, ' ').replace(/[.!?,;:]+$/, '').trim();
const wordsOf = (s) => (s.trim().match(/[A-Za-z0-9’'-]+/g) || []);

/* ---------- Saqlash ---------- */
const KEY = 'pbm-progress';
function readAll() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
function writeAll(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage unavailable */ } }
export function lessonProgress(n) { return readAll()[n] || {}; }
function saveResult(n, id, data) { const all = readAll(); all[n] = { ...(all[n] || {}), [id]: data }; writeAll(all); }
function readDraft(n, id) { try { return JSON.parse(localStorage.getItem(`pbm-w-${n}-${id}`) || 'null'); } catch { return null; } }
function writeDraft(n, id, v) { try { localStorage.setItem(`pbm-w-${n}-${id}`, JSON.stringify(v)); } catch { /* ignore */ } }
function clearLesson(n) {
  const all = readAll(); delete all[n]; writeAll(all);
  try { Object.keys(localStorage).filter((k) => k.startsWith(`pbm-w-${n}-`)).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
}

/* ---------- Aralashtirish (har safar bir xil tartib) ---------- */
function seededShuffle(arr, seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.length > 1 && out.every((v, i) => v === arr[i])) out.push(out.shift());
  return out;
}

/* ---------- Matndagi idiomalarni aniqlash ---------- */
const IRREG = {
  bite: ['bit', 'bitten'], win: ['won'], keep: ['kept'], burn: ['burnt'], go: ['went', 'gone', 'goes'], come: ['came'],
  take: ['took', 'taken'], break: ['broke', 'broken'], find: ['found'], give: ['gave', 'given'], get: ['got', 'gotten'],
  make: ['made'], feel: ['felt'], spin: ['spun'], fly: ['flew', 'flown', 'flies'], hold: ['held'], catch: ['caught'],
  fall: ['fell', 'fallen'], lose: ['lost'], put: ['put'], set: ['set'], hit: ['hit'], beat: ['beaten'], bring: ['brought'],
  stick: ['stuck'], think: ['thought'], drive: ['drove', 'driven'], rob: ['robbed'], creep: ['crept'], strike: ['struck'],
  run: ['ran'], say: ['said'], speak: ['spoke', 'spoken'], steal: ['stole', 'stolen'], wipe: ['wiped'], land: ['landed'],
};
function verbForms(w) {
  let base = w;
  if (/ing$/.test(w) && w.length > 5) { base = w.replace(/(.)\1ing$/, '$1').replace(/ing$/, ''); }
  const forms = new Set([w, base, base + 's', base + 'es', base + 'ed', base + 'd', base.replace(/e$/, '') + 'ing', base + base.slice(-1) + 'ing', base + base.slice(-1) + 'ed', base.replace(/y$/, 'ied'), base.replace(/y$/, 'ies')]);
  (IRREG[base] || []).forEach((f) => forms.add(f));
  if (base === 'burn') forms.add('burning');
  return [...forms].filter(Boolean).map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}
const PRON = '(?:your|my|his|her|their|our|its|one’s|one\'s)';
const SELF = '(?:yourself|myself|himself|herself|themselves|ourselves|oneself)';
export function idiomMatcher(terms) {
  const list = terms.map((term) => {
    const ws = term.toLowerCase().replace(/[“”"]/g, '').split(/\s+/).map((w) => w.replace(/[^a-z’'-]/g, '')).filter(Boolean);
    if (!ws.length) return null;
    const rx = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]");
    const parts = ws.map((w, i) => {
      if (w === 'your' || w === 'my') return PRON;
      if (w === 'yourself') return SELF;
      if (w === 'someone' || w === 'something' || w === 'someone’s') return "[\\w’']+";
      return i === 0 ? `(?:${verbForms(w).map((f) => f.replace(/['’]/g, "['’]")).join('|')})` : rx(w);
    });
    // "A fish out of water" → maqola ixtiyoriy
    let src = parts.join('[\\s,]+');
    if (/^(a|an|the)$/.test(ws[0])) src = `(?:${ws[0]}\\s+)?` + parts.slice(1).join('[\\s,]+');
    return { term, re: new RegExp(`\\b${src}\\b`, 'i') };
  }).filter(Boolean);
  return (text) => list.filter((x) => x.re.test(text)).map((x) => x.term);
}

/* ---------- Umumiy qobiq ---------- */
const KIND_TYPE = { match: 'match', gap: 'gap', tf: 'tf', mcq: 'mcq', hunt: 'hunt', sentences: 'write', essay: 'write' };
const KIND_ICON = { match: 'shuffle', gap: 'text-cursor-input', tf: 'square-check-big', mcq: 'list-checks', hunt: 'search', sentences: 'pen-line', essay: 'file-text' };
const CHECKABLE = new Set(['match', 'gap', 'tf', 'mcq', 'hunt']);

function shell(ex, num, body, color) {
  const checkable = CHECKABLE.has(ex.kind);
  return `<section class="card ex" id="ex-${ex.id}" data-ex="${ex.id}" style="--k:${color}">
    <div class="ex-head">
      <span class="tile sm soft">${icon(KIND_ICON[ex.kind], 19)}</span>
      <div class="ex-title">
        <p class="eyebrow ex-eyebrow">${num ? `${num} · ` : ''}${esc(pick(ACTIVITY_TYPES[KIND_TYPE[ex.kind]]))}</p>
        <h3 lang="en">${esc(ex.title)}</h3>
      </div>
      <span class="ex-badge" data-badge></span>
    </div>
    <p class="ex-instr">${esc(pick(ex.instructions))}</p>
    <div class="ex-body">${body}</div>
    ${checkable ? `<div class="ex-foot">
      <button class="btn primary" type="button" data-check disabled>${icon('check', 17)} ${t('ex.check')}</button>
      <button class="btn secondary" type="button" data-retry hidden>${icon('repeat', 16)} ${t('ex.retry')}</button>
      <p class="fb" role="status" data-fb hidden></p>
    </div>` : ''}
  </section>`;
}

const markIcon = (ok) => `<span class="mk ${ok ? 'ok' : 'no'}" aria-label="${ok ? 'Correct' : 'Incorrect'}">${icon(ok ? 'check' : 'x', 14)}</span>`;

/* ---------- Har bir mashq turi: HTML ---------- */
function bodyMatch(ex, seed) {
  const opts = seededShuffle(ex.pairs.map((p) => p[1]), seed);
  return `<ul class="ex-list">${ex.pairs.map(([left], i) => `<li class="match-row" data-i="${i}">
      <span class="match-left" lang="en">${esc(left)}</span>
      <span class="match-arrow" aria-hidden="true">${icon('arrow-right', 16)}</span>
      <span class="match-pick"><select class="ex-select" aria-label="${esc(left)}" data-sel><option value="">${t('ex.choose')}</option>${opts.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select><span data-mk></span></span>
      <span class="fix" data-fix hidden></span>
    </li>`).join('')}</ul>`;
}

function bodyGap(ex, seed) {
  const opts = seededShuffle(ex.bank, seed);
  return `<div class="bank" lang="en" aria-label="Word bank">${opts.map((o) => `<span class="bank-chip">${esc(o)}</span>`).join('')}</div>
    <ol class="ex-list numbered">${ex.items.map(([text], i) => {
      const [a, b] = text.split('___');
      return `<li class="gap-row" data-i="${i}" lang="en"><span>${esc(a)}</span><select class="ex-select gap" aria-label="Gap ${i + 1}" data-sel><option value="">${t('ex.choose')}</option>${opts.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select><span>${esc(b)}</span><span data-mk></span><span class="fix" data-fix hidden></span></li>`;
    }).join('')}</ol>`;
}

function bodyTF(ex) {
  return `<ol class="ex-list numbered">${ex.items.map(([text], i) => `<li class="tf-row" data-i="${i}">
      <span class="tf-text" lang="en">${esc(text)}</span>
      <span class="tf-btns" role="radiogroup" aria-label="${i + 1}">
        <button type="button" class="opt" role="radio" aria-checked="false" data-v="true">${t('ex.true')}</button>
        <button type="button" class="opt" role="radio" aria-checked="false" data-v="false">${t('ex.false')}</button>
        <span data-mk></span>
      </span>
      <span class="fix" data-fix hidden></span>
    </li>`).join('')}</ol>`;
}

function bodyMCQ(ex) {
  return `<ol class="ex-list numbered">${ex.items.map(([q, options], i) => `<li class="mcq-row" data-i="${i}">
      <p class="q" lang="en">${esc(q)}</p>
      <div class="opts" role="radiogroup" aria-label="${i + 1}" lang="en">${options.map((o, k) => `<button type="button" class="opt" role="radio" aria-checked="false" data-v="${k}"><b>${'ABCD'[k]}</b> ${esc(o)}</button>`).join('')}</div>
    </li>`).join('')}</ol>`;
}

function huntTarget(text, idiom) {
  const toks = text.split(/\s+/);
  const nt = toks.map((w) => norm(w.replace(/[,.!?;:]+$/, '')));
  const it = idiom.split(/\s+/).map((w) => norm(w));
  for (let s = 0; s + it.length <= nt.length; s++) if (it.every((w, k) => nt[s + k] === w)) return it.map((_, k) => s + k);
  return [];
}
function bodyHunt(ex, seed) {
  const meanings = seededShuffle(ex.items.map((x) => x[2]), seed);
  return `<ol class="ex-list numbered">${ex.items.map(([text], i) => `<li class="hunt-row" data-i="${i}">
      <p class="tokens" lang="en" aria-label="${t('ex.tapWords')}">${text.split(/\s+/).map((w, k) => `<button type="button" class="tok" aria-pressed="false" data-k="${k}">${esc(w)}</button>`).join(' ')}</p>
      <label class="hunt-meaning"><span>${t('ex.meaning')}:</span><select class="ex-select" data-sel><option value="">${t('ex.choose')}</option>${meanings.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join('')}</select><span data-mk></span></label>
      <span class="fix" data-fix hidden></span>
    </li>`).join('')}</ol>`;
}

function bodySentences(ex, n) {
  const saved = readDraft(n, ex.id) || [];
  return `<ol class="ex-list">${ex.items.map(([idiom, example], i) => `<li class="sent-row" data-i="${i}">
      <div class="sent-top"><b lang="en">${esc(idiom)}</b><span data-mk></span>${example ? `<button type="button" class="link-btn" data-example>${icon('lightbulb', 14)} ${t('ex.example')}</button>` : ''}</div>
      <textarea class="ex-text" rows="2" lang="en" placeholder="${esc(t('ex.yourSentence'))}" aria-label="${esc(idiom)}" data-text>${esc(saved[i] || '')}</textarea>
      ${example ? `<p class="example" lang="en" hidden>${esc(example)}</p>` : ''}
    </li>`).join('')}</ol>
    <div class="write-foot"><span class="muted" data-status></span><span class="spacer"></span>
      <button class="btn secondary sm" type="button" data-copy>${icon('file-text', 14)} ${t('ex.copy')}</button></div>
    <p class="hint">${t('ex.autosave')}</p>`;
}

function bodyEssay(ex, n) {
  const saved = readDraft(n, ex.id) || '';
  return `${ex.image ? `<img class="ex-img" src="${ex.image}" alt="" loading="lazy">` : ''}
    <blockquote class="prompt" lang="en">${icon('message-circle', 18)} <span>${esc(ex.prompt)}</span></blockquote>
    <textarea class="ex-text essay" rows="9" lang="en" placeholder="${esc(t('ex.yourText'))}" aria-label="${esc(ex.prompt)}" data-text>${esc(saved)}</textarea>
    <div class="meter">
      <div class="meter-row"><b data-wc></b><span class="muted">${t('ex.target', ex.min, ex.max)}</span></div>
      <div class="bar"><span data-bar></span></div>
    </div>
    <div class="found"><span class="muted">${t('ex.idiomsFound')} <span data-need></span>:</span> <span class="found-list" data-found></span></div>
    <div class="write-foot"><span class="spacer"></span>
      <button class="btn secondary sm" type="button" data-clear>${icon('x', 14)} ${t('ex.clear')}</button>
      <button class="btn secondary sm" type="button" data-copy>${icon('file-text', 14)} ${t('ex.copy')}</button></div>
    <p class="hint">${t('ex.autosave')}</p>`;
}

const COLORS = { match: '#7C3AED', gap: '#2563EB', tf: '#0EA5B7', mcq: '#4F46E5', hunt: '#D97706', sentences: '#059669', essay: '#DB2777' };

export function renderExercise(ex, num, lessonN) {
  const seed = `${lessonN}-${ex.id}`;
  const body = {
    match: () => bodyMatch(ex, seed), gap: () => bodyGap(ex, seed), tf: () => bodyTF(ex), mcq: () => bodyMCQ(ex),
    hunt: () => bodyHunt(ex, seed), sentences: () => bodySentences(ex, lessonN), essay: () => bodyEssay(ex, lessonN),
  }[ex.kind]();
  return shell(ex, num, body, COLORS[ex.kind]);
}

/* ---------- Har bir mashq turi: xatti-harakat ---------- */
function feedback(card, c, total) {
  const pct = total ? c / total : 0;
  const tone = pct === 1 ? 'good' : pct >= 0.6 ? 'ok' : 'bad';
  const fb = card.querySelector('[data-fb]');
  fb.hidden = false;
  fb.className = `fb ${tone}`;
  fb.innerHTML = `${icon(tone === 'good' ? 'check' : 'x', 16)} <b class="tnum">${c}/${total}</b> · ${t(`ex.fb.${tone}`)}`;
}
function badge(card, data) {
  const b = card.querySelector('[data-badge]');
  if (!b) return;
  if (data && data.done) {
    b.className = 'ex-badge on';
    b.innerHTML = data.t ? `${icon('check', 13)} ${data.c}/${data.t}` : icon('check', 13);
  } else { b.className = 'ex-badge'; b.innerHTML = ''; }
}

function bindCheckable(card, ex, n, onChange) {
  const rows = [...card.querySelectorAll('[data-i]')];
  const checkBtn = card.querySelector('[data-check]');
  const retryBtn = card.querySelector('[data-retry]');
  let checked = false;

  const answered = () => rows.every((row) => {
    if (ex.kind === 'tf' || ex.kind === 'mcq') return row.querySelector('.opt[aria-checked="true"]');
    if (ex.kind === 'hunt') return row.querySelector('.tok[aria-pressed="true"]') && row.querySelector('[data-sel]').value;
    return row.querySelector('[data-sel]').value;
  });
  const refresh = () => { checkBtn.disabled = !answered(); };

  card.addEventListener('change', (e) => { if (e.target.matches('[data-sel]')) refresh(); });
  card.addEventListener('click', (e) => {
    if (checked) return;
    const opt = e.target.closest('.opt');
    if (opt) {
      opt.parentElement.querySelectorAll('.opt').forEach((o) => o.setAttribute('aria-checked', String(o === opt)));
      refresh();
    }
    const tok = e.target.closest('.tok');
    if (tok) { tok.setAttribute('aria-pressed', String(tok.getAttribute('aria-pressed') !== 'true')); refresh(); }
  });

  const isRight = (row, i) => {
    if (ex.kind === 'match') return row.querySelector('[data-sel]').value === ex.pairs[i][1];
    if (ex.kind === 'gap') return norm(row.querySelector('[data-sel]').value) === norm(ex.items[i][1]);
    if (ex.kind === 'tf') return row.querySelector('.opt[aria-checked="true"]').dataset.v === String(ex.items[i][1]);
    if (ex.kind === 'mcq') return Number(row.querySelector('.opt[aria-checked="true"]').dataset.v) === ex.items[i][2];
    if (ex.kind === 'hunt') {
      const target = huntTarget(ex.items[i][0], ex.items[i][1]);
      const picked = [...row.querySelectorAll('.tok[aria-pressed="true"]')].map((x) => Number(x.dataset.k));
      const tokOk = picked.length === target.length && target.every((k) => picked.includes(k));
      return tokOk && row.querySelector('[data-sel]').value === ex.items[i][2];
    }
    return false;
  };
  const correctText = (i) => {
    if (ex.kind === 'match') return ex.pairs[i][1];
    if (ex.kind === 'gap') return ex.items[i][1];
    if (ex.kind === 'tf') return `${ex.items[i][1] ? t('ex.true') : t('ex.false')}${ex.items[i][2] ? ` — ${ex.items[i][2]}` : ''}`;
    if (ex.kind === 'mcq') return `${'ABCD'[ex.items[i][2]]}. ${ex.items[i][1][ex.items[i][2]]}`;
    if (ex.kind === 'hunt') return `${ex.items[i][1]} — ${ex.items[i][2]}`;
    return '';
  };

  const check = () => {
    checked = true;
    let c = 0;
    rows.forEach((row, i) => {
      const ok = isRight(row, i);
      if (ok) c++;
      row.classList.add(ok ? 'is-ok' : 'is-bad');
      const mk = row.querySelector('[data-mk]');
      if (mk) mk.innerHTML = markIcon(ok);
      row.querySelectorAll('[data-sel]').forEach((s) => { s.disabled = true; });
      row.querySelectorAll('.opt').forEach((o) => {
        o.disabled = true;
        const v = o.dataset.v;
        const right = ex.kind === 'tf' ? v === String(ex.items[i][1]) : Number(v) === ex.items[i][2];
        if (right) o.classList.add('right');
        else if (o.getAttribute('aria-checked') === 'true') o.classList.add('wrong');
      });
      if (ex.kind === 'hunt') {
        const target = huntTarget(ex.items[i][0], ex.items[i][1]);
        row.querySelectorAll('.tok').forEach((tk) => {
          tk.disabled = true;
          const k = Number(tk.dataset.k);
          if (target.includes(k)) tk.classList.add('right');
          else if (tk.getAttribute('aria-pressed') === 'true') tk.classList.add('wrong');
        });
      }
      const fix = row.querySelector('[data-fix]');
      if (fix && (!ok || ex.kind === 'tf')) {
        fix.hidden = false;
        fix.innerHTML = ok ? `<span lang="en">${esc(ex.items[i][2] || '')}</span>` : `${t('ex.answer')}: <b lang="en">${esc(correctText(i))}</b>`;
        if (ok && !ex.items[i][2]) fix.hidden = true;
      }
    });
    feedback(card, c, rows.length);
    checkBtn.hidden = true; retryBtn.hidden = false;
    const data = { done: true, c, t: rows.length };
    saveResult(n, ex.id, data); badge(card, data); onChange();
  };

  const retry = () => {
    checked = false;
    rows.forEach((row) => {
      row.classList.remove('is-ok', 'is-bad');
      row.querySelectorAll('[data-mk]').forEach((m) => { m.innerHTML = ''; });
      row.querySelectorAll('[data-sel]').forEach((s) => { s.disabled = false; s.value = ''; });
      row.querySelectorAll('.opt').forEach((o) => { o.disabled = false; o.classList.remove('right', 'wrong'); o.setAttribute('aria-checked', 'false'); });
      row.querySelectorAll('.tok').forEach((o) => { o.disabled = false; o.classList.remove('right', 'wrong'); o.setAttribute('aria-pressed', 'false'); });
      const fix = row.querySelector('[data-fix]'); if (fix) fix.hidden = true;
    });
    card.querySelector('[data-fb]').hidden = true;
    checkBtn.hidden = false; retryBtn.hidden = true; refresh();
    checkBtn.focus();
  };

  checkBtn.addEventListener('click', check);
  retryBtn.addEventListener('click', retry);
  badge(card, lessonProgress(n)[ex.id]);
}

function copyText(btn, text) {
  const done = () => { const old = btn.innerHTML; btn.innerHTML = `${icon('check', 14)} ${t('ex.copied')}`; setTimeout(() => { btn.innerHTML = old; }, 1600); };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => {});
  else { const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select(); try { document.execCommand('copy'); done(); } catch { /* ignore */ } ta.remove(); }
}

function bindSentences(card, ex, n, detect, onChange) {
  const rows = [...card.querySelectorAll('[data-i]')];
  const status = card.querySelector('[data-status]');
  const single = ex.items.map(([idiom]) => idiomMatcher([idiom]));
  const update = (save = true) => {
    const vals = rows.map((r) => r.querySelector('[data-text]').value);
    let ok = 0;
    rows.forEach((row, i) => {
      const v = vals[i];
      const good = wordsOf(v).length >= 4 && single[i](v).length > 0;
      if (good) ok++;
      row.querySelector('[data-mk]').innerHTML = good ? markIcon(true) : '';
      row.classList.toggle('is-ok', good);
    });
    status.textContent = t('ex.sentDone', ok, rows.length);
    if (save) writeDraft(n, ex.id, vals);
    const data = ok === rows.length ? { done: true, c: ok, t: rows.length } : null;
    saveResult(n, ex.id, data); badge(card, data); onChange();
  };
  card.addEventListener('input', (e) => { if (e.target.matches('[data-text]')) update(); });
  card.addEventListener('click', (e) => {
    const b = e.target.closest('[data-example]');
    if (b) { const p = b.closest('[data-i]').querySelector('.example'); p.hidden = !p.hidden; }
    const c = e.target.closest('[data-copy]');
    if (c) copyText(c, rows.map((r, i) => `${i + 1}. ${r.querySelector('[data-text]').value.trim()}`).join('\n'));
  });
  update(false);
}

function bindEssay(card, ex, n, detect, onChange) {
  const ta = card.querySelector('[data-text]');
  const wc = card.querySelector('[data-wc]');
  const bar = card.querySelector('[data-bar]');
  const found = card.querySelector('[data-found]');
  const need = card.querySelector('[data-need]');
  const update = (save = true) => {
    const v = ta.value;
    const count = wordsOf(v).length;
    const used = detect(v);
    wc.textContent = t('ex.words', count);
    const pct = Math.min(100, Math.round((count / ex.min) * 100));
    bar.style.width = `${pct}%`;
    bar.className = count > ex.max ? 'over' : count >= ex.min ? 'ok' : '';
    need.textContent = `(${t('ex.idiomsNeed', ex.idioms)})`;
    found.innerHTML = used.length ? used.map((u) => `<span class="pill plain" lang="en">${icon('check', 12)} ${esc(u)}</span>`).join('') : `<span class="muted">${t('ex.noIdioms')}</span>`;
    if (save) writeDraft(n, ex.id, v);
    const done = count >= ex.min && used.length >= ex.idioms;
    const data = done ? { done: true } : null;
    saveResult(n, ex.id, data); badge(card, data); onChange();
  };
  ta.addEventListener('input', () => update());
  card.addEventListener('click', (e) => {
    const c = e.target.closest('[data-copy]');
    if (c) copyText(c, `${ex.prompt}\n\n${ta.value.trim()}`);
    if (e.target.closest('[data-clear]')) { ta.value = ''; update(); ta.focus(); }
  });
  update(false);
}

export function bindExercise(card, ex, n, detect, onChange) {
  if (CHECKABLE.has(ex.kind)) bindCheckable(card, ex, n, onChange);
  else if (ex.kind === 'sentences') bindSentences(card, ex, n, detect, onChange);
  else if (ex.kind === 'essay') bindEssay(card, ex, n, detect, onChange);
}

/* ---------- Dars bo‘yicha umumiy natija ---------- */
export function progressCount(n, practice) {
  const ids = [practice.warmup, ...practice.exercises, ...(practice.homework || [])].filter(Boolean).map((e) => e.id);
  const p = lessonProgress(n);
  return { done: ids.filter((id) => p[id]?.done).length, total: ids.length };
}
export { clearLesson };
