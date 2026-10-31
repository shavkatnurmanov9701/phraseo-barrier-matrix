// Phrasebar illyustratsiyalari — qo‘lda chizilgan SVG, "yaltiroq 3D" uslubida.
// Mavzu: idiomalarning so‘zma-so‘z ma’nosi (over the moon, a piece of cake, break the ice, spill the beans...).
// Har bir funksiya SVG matnini qaytaradi; `p` — gradient id’lari to‘qnashmasligi uchun prefiks.

const defs = (p) => `
  <radialGradient id="${p}moon" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".55" stop-color="#FFD23F"/><stop offset="1" stop-color="#F59E0B"/></radialGradient>
  <radialGradient id="${p}heart" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#FFC2DD"/><stop offset=".45" stop-color="#FF5FA2"/><stop offset="1" stop-color="#C21767"/></radialGradient>
  <linearGradient id="${p}ice1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E6FBFF"/><stop offset="1" stop-color="#8EE3F5"/></linearGradient>
  <linearGradient id="${p}ice2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9BE7F7"/><stop offset="1" stop-color="#3FB7DB"/></linearGradient>
  <linearGradient id="${p}ice3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5CC9E6"/><stop offset="1" stop-color="#2A8FBF"/></linearGradient>
  <linearGradient id="${p}cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFE6F0"/></linearGradient>
  <linearGradient id="${p}sponge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#F7B733"/></linearGradient>
  <linearGradient id="${p}jam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF8CC0"/><stop offset="1" stop-color="#E23C86"/></linearGradient>
  <radialGradient id="${p}cherry" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#FF9A9A"/><stop offset=".5" stop-color="#F0263C"/><stop offset="1" stop-color="#A30F22"/></radialGradient>
  <linearGradient id="${p}can" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C7CBE0"/><stop offset=".35" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#B9BEDA"/><stop offset="1" stop-color="#8A90B8"/></linearGradient>
  <radialGradient id="${p}bean" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#FFE7A3"/><stop offset=".6" stop-color="#FFB627"/><stop offset="1" stop-color="#E07B00"/></radialGradient>
  <linearGradient id="${p}plane1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9E4FF"/></linearGradient>
  <linearGradient id="${p}plane2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D7D0FF"/><stop offset="1" stop-color="#A89BFF"/></linearGradient>
  <linearGradient id="${p}pz1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE58A"/><stop offset="1" stop-color="#F5A70B"/></linearGradient>
  <linearGradient id="${p}pz2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3D4"/><stop offset="1" stop-color="#EC3C8A"/></linearGradient>
  <linearGradient id="${p}page" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8EAFF"/></linearGradient>
  <linearGradient id="${p}cover" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B5CFF"/><stop offset="1" stop-color="#3B1FD1"/></linearGradient>
  <filter id="${p}sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#1B0B6B" flood-opacity=".35"/></filter>
  <filter id="${p}grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .07 0"/></filter>
`;

const sparkle = (x, y, s = 1, c = '#FFD23F') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-14 C2-4 4-2 14 0 C4 2 2 4 0 14 C-2 4-4 2-14 0 C-4-2-2-4 0-14Z" fill="${c}"/>`;

/* ---------- Bo‘laklar ---------- */
function moon(p, x, y, r) {
  return `<g filter="url(#${p}sh)">
    <mask id="${p}mm"><rect x="${x - r - 10}" y="${y - r - 10}" width="${2 * r + 20}" height="${2 * r + 20}" fill="#fff"/><circle cx="${x + r * .55}" cy="${y - r * .35}" r="${r * .9}" fill="#000"/></mask>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${p}moon)" mask="url(#${p}mm)"/>
  </g>
  <g mask="url(#${p}mm)">
    <ellipse cx="${x - r * .55}" cy="${y - r * .1}" rx="${r * .09}" ry="${r * .13}" fill="#5B3A06"/>
    <ellipse cx="${x - r * .2}" cy="${y + r * .35}" rx="${r * .07}" ry="${r * .1}" fill="#5B3A06"/>
    <path d="M${x - r * .7} ${y + r * .35} q ${r * .12} ${r * .28} ${r * .42} ${r * .22}" stroke="#5B3A06" stroke-width="${r * .05}" fill="none" stroke-linecap="round"/>
    <ellipse cx="${x - r * .62}" cy="${y + r * .12}" rx="${r * .1}" ry="${r * .06}" fill="#FF8FB1" opacity=".7"/>
    <ellipse cx="${x - r * .55}" cy="${y - r * .55}" rx="${r * .18}" ry="${r * .08}" fill="#fff" opacity=".55" transform="rotate(-35 ${x - r * .55} ${y - r * .55})"/>
  </g>`;
}

function cow(x, y, s = 1, rot = -14) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M-52 18 l-14 30 M-30 22 l-6 32 M30 20 l14 30 M48 14 l20 26" stroke="#2B1C5C" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="0" cy="0" rx="62" ry="34" fill="#fff"/>
    <path d="M-30-24 c14 6 16 22 2 30 c-14 6-26-6-20-18 z" fill="#2B1C5C"/>
    <path d="M18 8 c10-10 26-6 26 6 c0 12-18 16-26 6 z" fill="#2B1C5C"/>
    <path d="M-62-6 c-14-6-22 4-18 12" stroke="#2B1C5C" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g transform="translate(70 -22)">
      <ellipse cx="0" cy="0" rx="26" ry="22" fill="#fff"/>
      <ellipse cx="14" cy="10" rx="16" ry="11" fill="#FF9EC4"/>
      <circle cx="10" cy="9" r="2.4" fill="#7A2350"/><circle cx="19" cy="10" r="2.4" fill="#7A2350"/>
      <circle cx="-4" cy="-6" r="3.6" fill="#2B1C5C"/>
      <path d="M-14-18 l-8-10 M6-20 l4-12" stroke="#FFD23F" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="-22" cy="-8" rx="9" ry="5" fill="#fff" transform="rotate(-30 -22 -8)"/>
    </g>
    <ellipse cx="-10" cy="-18" rx="26" ry="7" fill="#fff" opacity=".8"/>
  </g>`;
}

function heart(p, x, y, s = 1, rot = 12) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" filter="url(#${p}sh)">
    <path d="M0 70 C-70 25 -95 -20 -62 -52 C-38 -74 -10 -62 0 -40 C10 -62 38 -74 62 -52 C95 -20 70 25 0 70Z" fill="url(#${p}heart)"/>
    <path d="M-52 -40 C-40 -56 -22 -54 -14 -42" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none" opacity=".7"/>
    <ellipse cx="34" cy="-36" rx="10" ry="6" fill="#fff" opacity=".45" transform="rotate(30 34 -36)"/>
  </g>`;
}

function cake(p, x, y, s = 1, rot = -6) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" filter="url(#${p}sh)">
    <path d="M-90 10 L60 -40 L90 -20 L-60 30 Z" fill="url(#${p}cream)"/>
    <path d="M-60 30 L90 -20 L90 50 L-60 100 Z" fill="url(#${p}sponge)"/>
    <path d="M-60 52 L90 2 L90 16 L-60 66 Z" fill="url(#${p}jam)"/>
    <path d="M-60 80 L90 30 L90 40 L-60 90 Z" fill="url(#${p}jam)" opacity=".85"/>
    <path d="M-90 10 L-60 30 L-60 100 L-90 80 Z" fill="#F2A21C"/>
    <path d="M-90 10 L-60 30 L-60 40 L-90 22 Z" fill="#FFF0F6"/>
    <path d="M-88 12 C-70 0 -40 -4 -20 -10" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/>
    <circle cx="40" cy="-48" r="20" fill="url(#${p}cherry)"/>
    <path d="M40 -66 C42 -86 54 -96 66 -100" stroke="#3E7B2C" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="33" cy="-55" rx="6" ry="4" fill="#fff" opacity=".7"/>
  </g>`;
}

function iceCube(p, x, y, s = 1, rot = -10) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" filter="url(#${p}sh)">
    <path d="M0 -60 L60 -30 L0 0 L-60 -30 Z" fill="url(#${p}ice1)"/>
    <path d="M-60 -30 L0 0 L0 66 L-60 36 Z" fill="url(#${p}ice2)"/>
    <path d="M0 0 L60 -30 L60 36 L0 66 Z" fill="url(#${p}ice3)"/>
    <path d="M-20 -46 L-4 -30 L-14 -18 L4 -8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 -6 L28 14 L18 26 L32 44" stroke="#E6FBFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-44 -26 L-10 -42" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    <path d="M-48 -8 L-48 24" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/>
  </g>`;
}

function beanCan(p, x, y, s = 1) {
  const beans = [[60, 40], [92, 52], [128, 46], [80, 74], [116, 80], [150, 70], [44, 66], [170, 92], [102, 102]];
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <g transform="rotate(-62)" filter="url(#${p}sh)">
      <rect x="-40" y="-60" width="80" height="110" rx="10" fill="url(#${p}can)"/>
      <rect x="-40" y="-26" width="80" height="44" fill="#FF6A2B"/>
      <rect x="-40" y="-26" width="80" height="8" fill="#fff" opacity=".35"/>
      <ellipse cx="0" cy="-60" rx="40" ry="12" fill="#DADCF0"/>
      <ellipse cx="0" cy="-60" rx="32" ry="8" fill="#8A6A2B"/>
    </g>
    ${beans.map(([bx, by], i) => `<ellipse cx="${bx}" cy="${by}" rx="13" ry="9" fill="url(#${p}bean)" transform="rotate(${(i * 37) % 80 - 40} ${bx} ${by})"/>`).join('')}
  </g>`;
}

function bubble(x, y, s = 1, fill = '#fff', dots = '#5B2EFF') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-50 -30 h100 a20 20 0 0 1 20 20 v30 a20 20 0 0 1 -20 20 h-58 l-22 22 v-22 h-20 a20 20 0 0 1 -20 -20 v-30 a20 20 0 0 1 20 -20z" fill="${fill}"/>
    <circle cx="-22" cy="5" r="7" fill="${dots}"/><circle cx="0" cy="5" r="7" fill="${dots}" opacity=".7"/><circle cx="22" cy="5" r="7" fill="${dots}" opacity=".45"/>
  </g>`;
}

/* ---------- Tayyor kompozitsiyalar ---------- */
export function heroScene(p = 'h') {
  return `<svg class="art-svg" viewBox="0 0 1200 640" role="img" aria-label="Idiomalar: over the moon, a piece of cake, break the ice, spill the beans" preserveAspectRatio="xMidYMid slice">
    <defs>${defs(p)}</defs>
    <g fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2">
      <ellipse cx="560" cy="330" rx="430" ry="190"/>
      <ellipse cx="560" cy="330" rx="300" ry="120" transform="rotate(-12 560 330)"/>
      <path d="M90 560 C 300 470, 520 600, 760 500 S 1100 470, 1180 520"/>
    </g>
    <circle cx="1040" cy="120" r="70" fill="#7A5CFF" opacity=".55"/>
    <circle cx="160" cy="560" r="110" fill="#3A17D6" opacity=".6"/>
    ${moon(p, 520, 330, 160)}
    ${cow(560, 128, 1, -16)}
    ${heart(p, 930, 230, .95, 14)}
    ${cake(p, 1000, 470, .95, -8)}
    ${iceCube(p, 210, 420, 1.05, -8)}
    ${beanCan(p, 760, 486, .8)}
    ${bubble(200, 150, .9)}
    ${sparkle(760, 110, 1.3)}${sparkle(380, 560, 1)}${sparkle(1110, 330, .9, '#FF8FC0')}${sparkle(90, 300, .8, '#fff')}${sparkle(840, 600, .8, '#fff')}
    <rect width="1200" height="640" filter="url(#${p}grain)" opacity=".9"/>
  </svg>`;
}

export function cakeIcon(p = 'c') {
  return `<svg viewBox="-120 -120 240 240" class="icon-svg" aria-hidden="true"><defs>${defs(p)}</defs>${cake(p, 0, -6, 1.05, -10)}${sparkle(-80, -70, .9, '#fff')}</svg>`;
}

export function planeIcon(p = 'pl') {
  return `<svg viewBox="-120 -120 240 240" class="icon-svg" aria-hidden="true"><defs>${defs(p)}</defs>
    <path d="M-100 80 C-60 60 -40 70 -20 40" stroke="#fff" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round" fill="none" opacity=".8"/>
    <g transform="rotate(-24) translate(10 -10)" filter="url(#${p}sh)">
      <path d="M-80 10 L90 -50 L-20 40 Z" fill="url(#${p}plane1)"/>
      <path d="M-20 40 L90 -50 L0 60 Z" fill="url(#${p}plane2)"/>
      <path d="M-20 40 L-6 76 L10 46 Z" fill="#8E7BFF"/>
      <path d="M-70 10 L60 -38" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    </g>
    ${sparkle(70, -80, 1.1)}${sparkle(-70, -60, .7, '#fff')}</svg>`;
}

export function puzzleIcon(p = 'pz') {
  const piece = (fill) => `<path d="M-50 -50 h34 a16 16 0 1 1 32 0 h34 v34 a16 16 0 1 0 0 32 v34 h-34 a16 16 0 1 1 -32 0 h-34 z" fill="url(#${fill})"/>`;
  return `<svg viewBox="-120 -120 240 240" class="icon-svg" aria-hidden="true"><defs>${defs(p)}</defs>
    <g transform="translate(-34 -18) rotate(-10)" filter="url(#${p}sh)">${piece(`${p}pz1`)}<path d="M-40 -40 h26" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/></g>
    <g transform="translate(44 30) rotate(8)" filter="url(#${p}sh)">${piece(`${p}pz2`)}<path d="M-40 -40 h26" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/></g>
    ${sparkle(80, -78, 1)}${sparkle(-86, 74, .7, '#fff')}</svg>`;
}

export function bookIcon(p = 'bk') {
  return `<svg viewBox="-150 -150 300 300" class="icon-svg" aria-hidden="true"><defs>${defs(p)}</defs>
    <g filter="url(#${p}sh)">
      <path d="M-110 30 L0 70 L110 30 L110 50 L0 92 L-110 50 Z" fill="url(#${p}cover)"/>
      <path d="M-104 28 C-60 0 -20 10 0 40 L0 74 C-30 46 -70 46 -104 56 Z" fill="url(#${p}page)"/>
      <path d="M104 28 C60 0 20 10 0 40 L0 74 C30 46 70 46 104 56 Z" fill="#DCDFFF"/>
      <path d="M-84 30 C-56 18 -30 22 -14 38 M-84 44 C-56 32 -30 36 -14 52" stroke="#B7BCF5" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
    ${bubble(-60, -70, .85, '#fff', '#5B2EFF')}
    ${bubble(70, -96, .7, '#FFD23F', '#fff')}
    <g transform="translate(40 -10) scale(.42)">${`<path d="M0 70 C-70 25 -95 -20 -62 -52 C-38 -74 -10 -62 0 -40 C10 -62 38 -74 62 -52 C95 -20 70 25 0 70Z" fill="url(#${p}heart)"/>`}</g>
    ${sparkle(-120, -10, 1)}${sparkle(124, -40, .8, '#fff')}${sparkle(0, -130, .9, '#FF8FC0')}</svg>`;
}

// Kichik "stiker"lar: matn ichida va statistik qatorlarda
export function sticker(kind, p) {
  const v = { moon: `<svg viewBox="300 140 360 360">`, heart: `<svg viewBox="-110 -100 220 200">`, ice: `<svg viewBox="-90 -90 180 180">`, cake: `<svg viewBox="-120 -120 240 240">`, beans: `<svg viewBox="-70 -100 280 260">` }[kind];
  const body = {
    moon: moon(p, 480, 320, 160),
    heart: heart(p, 0, 0, 1, 0),
    ice: iceCube(p, 0, 0, 1, -8),
    cake: cake(p, 0, 0, 1, -10),
    beans: beanCan(p, 20, 60, 1),
  }[kind];
  return `${v.replace('<svg', '<svg class="sticker-svg" aria-hidden="true"')}<defs>${defs(p)}</defs>${body}</svg>`;
}
