import { ACADEMY_NAME, LEVELS, LOCKED_MESSAGE, VAULT_LOCKED_MESSAGE } from '../config';
import { GOLD, INK, buildingArt, hopCone, icons, padlock, sealCheck, vaultArt } from '../art';
import { navigate } from '../router';
import * as game from '../state';
import { confirmDialog, esc, prefersReducedMotion, restartAnimation, session, showToast, wait } from '../ui';

interface Pt {
  x: number;
  y: number;
}

type PropKind = 'compass' | 'mountains' | 'pond' | 'barrels' | 'hops' | 'marsh' | 'keys' | 'seal' | 'scale' | 'cartouche';

interface Prop extends Pt {
  kind: PropKind;
  s?: number;
  /** Radius kept free of trees. */
  r: number;
}

interface MapLabel extends Pt {
  text: string;
}

interface Layout {
  w: number;
  h: number;
  start: Pt;
  /** Four levels followed by the vault. */
  nodes: Pt[];
  nodeSize: number;
  vaultSize: number;
  wiggle: number;
  trees: number;
  props: Prop[];
  labels: MapLabel[];
}

const PORTRAIT: Layout = {
  w: 400,
  h: 940,
  start: { x: 200, y: 892 },
  nodes: [
    { x: 112, y: 770 },
    { x: 288, y: 615 },
    { x: 112, y: 460 },
    { x: 288, y: 305 },
    { x: 200, y: 128 },
  ],
  nodeSize: 118,
  vaultSize: 160,
  wiggle: 34,
  trees: 70,
  props: [
    { kind: 'compass', x: 46, y: 54, r: 38 },
    { kind: 'keys', x: 352, y: 72, r: 24 },
    { kind: 'mountains', x: 58, y: 222, r: 42 },
    { kind: 'mountains', x: 350, y: 212, s: 1.1, r: 46 },
    { kind: 'marsh', x: 96, y: 302, r: 46 },
    { kind: 'hops', x: 300, y: 462, r: 36 },
    { kind: 'barrels', x: 74, y: 618, r: 36 },
    { kind: 'pond', x: 312, y: 800, r: 60 },
    { kind: 'seal', x: 46, y: 884, r: 32 },
    { kind: 'scale', x: 336, y: 912, r: 30 },
  ],
  labels: [
    { text: 'Sümpfe der Prokrastination', x: 100, y: 346 },
    { text: 'Fotosynthesiert', x: 300, y: 516 },
    { text: 'Hier gärt es', x: 74, y: 664 },
    { text: 'Teich der Erkenntnis', x: 312, y: 846 },
    { text: 'Immatrikulation', x: 200, y: 928 },
  ],
};

const LANDSCAPE: Layout = {
  w: 1000,
  h: 560,
  start: { x: 78, y: 500 },
  nodes: [
    { x: 182, y: 380 },
    { x: 360, y: 196 },
    { x: 530, y: 388 },
    { x: 700, y: 196 },
    { x: 868, y: 356 },
  ],
  nodeSize: 128,
  vaultSize: 172,
  wiggle: 40,
  trees: 85,
  props: [
    { kind: 'cartouche', x: 150, y: 68, r: 112 },
    { kind: 'compass', x: 948, y: 62, r: 40 },
    { kind: 'barrels', x: 478, y: 104, r: 36 },
    { kind: 'keys', x: 572, y: 64, r: 26 },
    { kind: 'marsh', x: 196, y: 218, r: 48 },
    { kind: 'mountains', x: 846, y: 178, s: 1.1, r: 46 },
    { kind: 'mountains', x: 944, y: 216, r: 40 },
    { kind: 'pond', x: 334, y: 470, r: 62 },
    { kind: 'hops', x: 650, y: 448, r: 38 },
    { kind: 'seal', x: 950, y: 508, r: 32 },
    { kind: 'scale', x: 740, y: 532, r: 30 },
  ],
  labels: [
    { text: 'Hier gärt es', x: 478, y: 148 },
    { text: 'Sümpfe der Prokrastination', x: 196, y: 262 },
    { text: 'Teich der Erkenntnis', x: 334, y: 518 },
    { text: 'Fotosynthesiert', x: 650, y: 500 },
    { text: 'Immatrikulation', x: 84, y: 540 },
  ],
};

type NodeStatus = 'locked' | 'current' | 'done';

const VAULT_INDEX = LEVELS.length;

function nodeStatus(index: number): NodeStatus {
  if (index === VAULT_INDEX) {
    if (game.isVaultOpen()) return 'done';
    return game.allLevelsCompleted() ? 'current' : 'locked';
  }
  const { id } = LEVELS[index];
  if (game.isLevelCompleted(id)) return 'done';
  return game.isLevelUnlocked(id) ? 'current' : 'locked';
}

// ---------------------------------------------------------------------------
// Path geometry
// ---------------------------------------------------------------------------

interface Bezier {
  p0: Pt;
  c1: Pt;
  c2: Pt;
  p1: Pt;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Inserts a sideways-offset waypoint between stops, then smooths everything with Catmull-Rom. */
function buildPath(layout: Layout): Bezier[][] {
  const stops = [layout.start, ...layout.nodes];
  const points: Pt[] = [stops[0]];
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const side = i % 2 === 0 ? 1 : -1;
    points.push({ x: (a.x + b.x) / 2 + (-dy / len) * layout.wiggle * side, y: (a.y + b.y) / 2 + (dx / len) * layout.wiggle * side });
    points.push(b);
  }
  const pieces: Bezier[] = [];
  for (let k = 0; k < points.length - 1; k++) {
    const p0 = points[k];
    const p1 = points[k + 1];
    const prev = points[k - 1] ?? p0;
    const next = points[k + 2] ?? p1;
    pieces.push({
      p0,
      c1: { x: p0.x + (p1.x - prev.x) / 6, y: p0.y + (p1.y - prev.y) / 6 },
      c2: { x: p1.x - (next.x - p0.x) / 6, y: p1.y - (next.y - p0.y) / 6 },
      p1,
    });
  }
  // Each segment (stop → stop) consists of two pieces.
  return layout.nodes.map((_, i) => [pieces[2 * i], pieces[2 * i + 1]]);
}

const bezierD = (pieces: Bezier[]): string =>
  `M${r1(pieces[0].p0.x)} ${r1(pieces[0].p0.y)}` +
  pieces.map((b) => `C${r1(b.c1.x)} ${r1(b.c1.y)} ${r1(b.c2.x)} ${r1(b.c2.y)} ${r1(b.p1.x)} ${r1(b.p1.y)}`).join('');

function sampleBezier(b: Bezier, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * b.p0.x + 3 * u * u * t * b.c1.x + 3 * u * t * t * b.c2.x + t * t * t * b.p1.x,
    y: u * u * u * b.p0.y + 3 * u * u * t * b.c1.y + 3 * u * t * t * b.c2.y + t * t * t * b.p1.y,
  };
}

// ---------------------------------------------------------------------------
// Background illustration
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Scatters trees deterministically, keeping clear of the path, the locations and the props. */
function placeTrees(layout: Layout, segments: Bezier[][]): string {
  const random = mulberry32(layout.w * 7 + layout.h);
  const blocked: { x: number; y: number; r: number }[] = [];
  for (const piece of segments.flat()) {
    for (let t = 0; t <= 1; t += 0.08) blocked.push({ ...sampleBezier(piece, t), r: 22 });
  }
  layout.nodes.forEach((p, i) => {
    const size = i === VAULT_INDEX ? layout.vaultSize : layout.nodeSize;
    blocked.push({ x: p.x, y: p.y, r: size * 0.58 });
    blocked.push({ x: p.x, y: p.y + size * 0.6, r: size * 0.45 });
  });
  blocked.push({ ...layout.start, r: 34 });
  layout.props.forEach((prop) => blocked.push(prop));
  layout.labels.forEach((label) => blocked.push({ x: label.x, y: label.y - 4, r: label.text.length * 3.6 }));

  const trees: { x: number; y: number; s: number; kind: string }[] = [];
  for (let attempt = 0; attempt < 1500 && trees.length < layout.trees; attempt++) {
    const x = 18 + random() * (layout.w - 36);
    const y = 34 + random() * (layout.h - 52);
    const s = 0.75 + random() * 0.6;
    const clear =
      blocked.every((b) => Math.hypot(b.x - x, b.y - y) > b.r + 8 * s) &&
      trees.every((t) => Math.hypot(t.x - x, t.y - y) > 15);
    if (clear) trees.push({ x, y, s, kind: random() < 0.62 ? 'm-pine' : 'm-oak' });
  }
  return trees
    .sort((a, b) => a.y - b.y)
    .map((t) => `<use href="#${t.kind}" transform="translate(${r1(t.x)} ${r1(t.y)}) scale(${t.s.toFixed(2)})"/>`)
    .join('');
}

const DEFS = `
  <radialGradient id="m-paper" cx="50%" cy="45%" r="75%">
    <stop offset="0" stop-color="#f3e7c9"/><stop offset=".65" stop-color="#e8d6ac"/><stop offset="1" stop-color="#c9ad76"/>
  </radialGradient>
  <radialGradient id="m-burn" cx="50%" cy="50%" r="72%">
    <stop offset=".72" stop-color="#6b4a26" stop-opacity="0"/><stop offset="1" stop-color="#5a3a1a" stop-opacity=".55"/>
  </radialGradient>
  <g id="m-pine">
    <path d="M0 0V5" stroke="#5b3d24" stroke-width="2.4"/>
    <path d="M0-24L8-10H4L10 0H-10L-4-10H-8Z" fill="#4c6b45" stroke="#2a3b26" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M0-20L-3-11M1-8L-4 0" stroke="#33502f" stroke-width=".8"/>
  </g>
  <g id="m-oak">
    <path d="M0 0V6" stroke="#5b3d24" stroke-width="2.6"/>
    <path d="M-10 0C-15 0-15-8-9-9C-10-16-2-19 1-15C5-20 13-15 10-9C15-7 14 0 9 0Z" fill="#62804b" stroke="#2a3b26" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M-4-7c2 1 4 1 6-1" stroke="#3d5a31" stroke-width=".8" fill="none"/>
  </g>
  <g id="m-barrel">
    <rect x="-9" y="-12" width="18" height="22" rx="5" fill="#9a6235" stroke="${INK}" stroke-width="1.4"/>
    <path d="M-9-5.5H9M-9 3.5H9" stroke="#3a2a1c" stroke-width="1.8"/>
    <ellipse cx="0" cy="-11.5" rx="7.5" ry="2" fill="#b5784a" stroke="${INK}" stroke-width="1"/>
  </g>
  <g id="m-tuft"><path d="M-5 0Q-4-6-7-10M0 0Q0-8 1-13M5 0Q4-6 8-9" stroke="#5e6f3e" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>
  <g id="m-mount">
    <path d="M-34 0L-9-38L4-22L13-31L36 0Z" fill="#d2bf94" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M-9-38L-2-12M13-31L18-10M-16-22l5 7M24-14l3 5M-24-8l4 4" stroke="${INK}" stroke-width="1" opacity=".5" fill="none"/>
    <path d="M-9-38L-15-28L-10-29L-6-25L-3-30Z" fill="#faf3e2"/>
  </g>`;

function propSvg(prop: Prop): string {
  const { x, y } = prop;
  const s = prop.s ?? 1;
  const at = `transform="translate(${x} ${y}) scale(${s})"`;
  switch (prop.kind) {
    case 'compass':
      return `<g ${at} class="map-compass">
        <circle r="24" fill="none" stroke="${INK}" stroke-width="1" opacity=".6"/><circle r="18" fill="none" stroke="${INK}" stroke-width=".6" opacity=".5"/>
        <path d="M0-30L4.5-4.5L0 0L-4.5-4.5Z" fill="${INK}"/><path d="M0 30L4.5 4.5L0 0L-4.5 4.5Z" fill="${GOLD}" stroke="${INK}" stroke-width=".8"/>
        <path d="M-30 0L-4.5-4.5L0 0L-4.5 4.5Z" fill="${GOLD}" stroke="${INK}" stroke-width=".8"/><path d="M30 0L4.5-4.5L0 0L4.5 4.5Z" fill="${INK}"/>
        <text y="-33" text-anchor="middle" font-size="10" class="map-text map-text--caps">N</text></g>`;
    case 'mountains':
      return `<g ${at}><use href="#m-mount" transform="translate(-14 4) scale(.8)"/><use href="#m-mount" transform="translate(12 8)"/></g>`;
    case 'pond':
      return `<g ${at}>
        <path d="M-50 0C-48-20-14-26 8-24C34-22 52-12 50 4C48 20 20 26-6 24C-32 22-52 16-50 0Z" fill="#a9c0ae" stroke="${INK}" stroke-width="1.4"/>
        <path d="M-30-4q5-3 10 0t10 0M4 8q5-3 10 0t10 0M-12-14q4-2 8 0t8 0" stroke="#5f7d6c" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <use href="#m-tuft" transform="translate(-48 6)"/><use href="#m-tuft" transform="translate(46 10) scale(.8)"/></g>`;
    case 'barrels':
      return `<g ${at}><use href="#m-barrel" transform="translate(-12 4)"/><use href="#m-barrel" transform="translate(10 6)"/><use href="#m-barrel" transform="translate(-1 -14) scale(.9)"/></g>`;
    case 'hops':
      return `<g ${at}>
        <path d="M-10 18V-28M10 18V-24" stroke="#7a5a3a" stroke-width="1.8"/><path d="M-10-28L10-24" stroke="#7a5a3a" stroke-width="1.2"/>
        <path d="M-10 16C-16 8-4 2-10-6C-16-14-4-18-10-26M10 16C16 8 4 2 10-6C16-14 4-18 10-22" stroke="#4d7a3a" stroke-width="1.6" fill="none"/>
        ${hopCone(-14, -2, 0.42)}${hopCone(-6, -16, 0.4)}${hopCone(14, -10, 0.42)}${hopCone(6, 6, 0.38)}</g>`;
    case 'marsh':
      return `<g ${at}>
        <path d="M-40 4h16M-14 10h20M14 2h22M-30 -8h14M4 -6h16" stroke="#6f7f5a" stroke-width="1.3" stroke-linecap="round"/>
        <use href="#m-tuft" transform="translate(-34 2)"/><use href="#m-tuft" transform="translate(-4 8) scale(1.1)"/><use href="#m-tuft" transform="translate(26 0)"/><use href="#m-tuft" transform="translate(-18 -10) scale(.8)"/><use href="#m-tuft" transform="translate(14 -8) scale(.8)"/></g>`;
    case 'keys':
      return `<g ${at} stroke="#a07a2c" stroke-width="2.4" stroke-linecap="round" fill="none">
        <g transform="rotate(-18)"><circle cx="-12" r="5.5"/><path d="M-6.5 0H12M8 0v5M12 0v4"/></g>
        <g transform="translate(2 10) rotate(14)" opacity=".8"><circle cx="-10" r="4.5"/><path d="M-5.5 0H10M7 0v4"/></g></g>`;
    case 'seal':
      return `<g ${at}>
        <circle r="24" fill="#8f2d22" opacity=".85"/><circle r="19" fill="none" stroke="#e8a99c" stroke-width="1" opacity=".8"/>
        <text y="4" text-anchor="middle" font-size="11" fill="#f3d0c6" class="map-text map-text--caps">A·h·W</text></g>`;
    case 'scale':
      return `<g ${at}>
        <path d="M-40 0H40M-40-4V4M0-3V3M40-4V4" stroke="${INK}" stroke-width="1.4"/>
        <path d="M-40 0H0" stroke="${INK}" stroke-width="4"/>
        <text y="-8" text-anchor="middle" font-size="10" class="map-text">1 Maß = 1 Meile</text></g>`;
    case 'cartouche':
      return `<g ${at}>
        <path d="M-118-30H118C126-30 130-22 124-16C130-10 130 18 124 24C130 30 126 38 118 38H-118C-126 38-130 30-124 24C-130 18-130-10-124-16C-130-22-126-30-118-30Z" fill="#f3e7c9" stroke="${INK}" stroke-width="1.6"/>
        <path d="M-110-22H110M-110 30H110" stroke="${GOLD}" stroke-width="1"/>
        <text y="-1" text-anchor="middle" font-size="21" class="map-text map-text--title">Karte der Akademie</text>
        <text y="21" text-anchor="middle" font-size="12" class="map-text map-text--caps">der höheren Wissenschaft</text></g>`;
  }
}

function backgroundSvg(layout: Layout, segments: Bezier[][], statuses: NodeStatus[]): string {
  const { w, h } = layout;
  const trail = segments.map((pieces) => bezierD(pieces));
  const paths = trail
    .map((d, i) => {
      const status = statuses[i];
      const cls = status === 'done' ? 'path--done' : status === 'current' ? 'path--active' : 'path--locked';
      return `<path d="${d}" class="path ${cls}"/>`;
    })
    .join('');
  const labels = layout.labels
    .map((l) => `<text x="${l.x}" y="${l.y}" text-anchor="middle" font-size="${w > 600 ? 15 : 13}" class="map-text map-text--label">${esc(l.text)}</text>`)
    .join('');
  const s = layout.start;
  return `
    <svg class="map__bg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>${DEFS}</defs>
      <rect width="${w}" height="${h}" fill="url(#m-paper)"/>
      <ellipse cx="${w * 0.72}" cy="${h * 0.22}" rx="${w * 0.12}" ry="${h * 0.05}" fill="#b08d55" opacity=".08"/>
      <ellipse cx="${w * 0.2}" cy="${h * 0.7}" rx="${w * 0.16}" ry="${h * 0.05}" fill="#8a6a3a" opacity=".07"/>
      ${placeTrees(layout, segments)}
      ${layout.props.map(propSvg).join('')}
      ${labels}
      <g class="trail">${trail.map((d) => `<path d="${d}" class="trail__bed"/>`).join('')}${paths}</g>
      <g transform="translate(${s.x} ${s.y})">
        <path d="M0 0V-34" stroke="#6b4a2c" stroke-width="3"/>
        <path d="M-2-33H34L41-27L34-21H-2Z" fill="#c9a26a" stroke="${INK}" stroke-width="1.2"/>
        <text x="16" y="-23.5" text-anchor="middle" font-size="9" class="map-text map-text--caps">Start</text>
      </g>
      <rect width="${w}" height="${h}" fill="url(#m-burn)"/>
      <rect x="9" y="9" width="${w - 18}" height="${h - 18}" rx="10" fill="none" stroke="${INK}" stroke-width="1.6" opacity=".55"/>
      <rect x="15" y="15" width="${w - 30}" height="${h - 30}" rx="7" fill="none" stroke="${INK}" stroke-width=".7" opacity=".45"/>
    </svg>`;
}

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

const STATUS_TEXT: Record<NodeStatus, string> = {
  locked: 'verschlossen',
  current: 'jetzt verfügbar',
  done: 'bestanden',
};

function nodeButton(layout: Layout, index: number, status: NodeStatus): string {
  const isVault = index === VAULT_INDEX;
  const p = layout.nodes[index];
  const size = isVault ? layout.vaultSize : layout.nodeSize;
  const label = isVault ? 'Das letzte Tor' : LEVELS[index].mapLabel;
  const numeral = isVault ? 'V' : LEVELS[index].numeral;
  const art = isVault ? vaultArt() : buildingArt(LEVELS[index].building);

  const unlocking = session.justUnlocked === index && status === 'current';
  const stamping = session.justCompleted === index && status === 'done';
  let badge = '';
  if (status === 'locked') badge = `<span class="node__badge">${padlock()}</span>`;
  else if (unlocking) badge = `<span class="node__badge node__badge--breaking">${padlock()}</span>`;
  else if (status === 'done') badge = `<span class="node__badge${stamping ? ' node__badge--stamping' : ''}">${sealCheck()}</span>`;

  const classes = ['node', `node--${status}`, isVault ? 'node--vault' : '', unlocking ? 'node--unlocking' : '']
    .filter(Boolean)
    .join(' ');
  return `
    <button type="button" class="${classes}" data-index="${index}" data-status="${status}"
      style="left:${((p.x / layout.w) * 100).toFixed(3)}%;top:${((p.y / layout.h) * 100).toFixed(3)}%;width:${((size / layout.w) * 100).toFixed(3)}%"
      aria-label="${esc(`Prüfung ${numeral}: ${label} – ${STATUS_TEXT[status]}`)}">
      <span class="node__halo" aria-hidden="true"></span>
      ${status === 'current' ? `<span class="node__marker" aria-hidden="true">${icons.marker}</span>` : ''}
      <span class="node__art">${art}</span>
      ${badge}
      <span class="node__label" aria-hidden="true"><span class="node__numeral">${numeral}</span>${esc(label)}</span>
    </button>`;
}

function instruction(): string {
  if (game.isVaultOpen()) return 'Alle Prüfungen bestanden. Die Urkunde wartet hinter dem letzten Tor.';
  if (game.allLevelsCompleted()) return 'Alle vier Prüfungen bestanden. Nur noch das letzte Tor trennt dich von der Auszeichnung.';
  if (game.getState().completed.length === 0) return 'Tippe auf den leuchtenden Ort, um mit der ersten Prüfung zu beginnen.';
  return 'Tippe auf den leuchtenden Ort, um die nächste Prüfung zu beginnen.';
}

const landscapeQuery = () => window.matchMedia('(min-width: 860px) and (min-aspect-ratio: 1/1)');

export function renderMap(root: HTMLElement): () => void {
  const query = landscapeQuery();
  let busy = false;

  const draw = () => {
    const layout = query.matches ? LANDSCAPE : PORTRAIT;
    const statuses = layout.nodes.map((_, i) => nodeStatus(i));
    const segments = buildPath(layout);
    const done = game.completedStages();
    const total = game.TOTAL_STAGES;

    root.innerHTML = `
      <div class="screen map-screen">
        <header class="map-header">
          <div class="map-header__title">
            <p class="kicker">${esc(ACADEMY_NAME)}</p>
            <h1 tabindex="-1">Prüfungsgelände</h1>
          </div>
          <div class="progress" role="group" aria-label="Fortschritt">
            <p class="progress__text"><strong>${done} von ${total}</strong> Prüfungen bestanden</p>
            <div class="progress__bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-label="${done} von ${total} Prüfungen bestanden">
              <i style="width:${(done / total) * 100}%"></i>
            </div>
          </div>
        </header>
        <p class="map-instruction">${instruction()}</p>
        <div class="map-wrap">
          <div class="map ${query.matches ? 'map--landscape' : 'map--portrait'}" style="aspect-ratio:${layout.w} / ${layout.h}">
            ${backgroundSvg(layout, segments, statuses)}
            ${layout.nodes.map((_, i) => nodeButton(layout, i, statuses[i])).join('')}
          </div>
        </div>
        <ul class="legend" aria-label="Legende">
          <li><span class="legend__icon">${padlock()}</span>Verschlossen</li>
          <li><span class="legend__icon legend__icon--glow"></span>Verfügbar</li>
          <li><span class="legend__icon">${sealCheck()}</span>Bestanden</li>
        </ul>
        <footer class="map-footer">
          ${game.isVaultOpen() ? `<a class="btn btn--primary" href="#/urkunde">${icons.scroll}Zur Urkunde</a>` : ''}
          <button type="button" class="btn btn--quiet" data-action="reset">${icons.reset}Prüfung zurücksetzen</button>
        </footer>
      </div>`;

    const current = root.querySelector<HTMLElement>('.node--current');
    if (current && !query.matches) {
      window.setTimeout(() => current.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' }), 120);
    }
  };

  const onClick = async (event: Event) => {
    const target = event.target as Element;
    if (target.closest('[data-action="reset"]')) {
      const confirmed = await confirmDialog({
        title: 'Prüfung zurücksetzen?',
        body: 'Der gesamte Fortschritt geht verloren und alle Prüfungen müssen erneut abgelegt werden.',
        confirmLabel: 'Ja, zurücksetzen',
        cancelLabel: 'Abbrechen',
      });
      if (confirmed) {
        game.resetGame();
        navigate({ name: 'start' });
      }
      return;
    }

    const node = target.closest<HTMLButtonElement>('.node');
    if (!node || busy) return;
    const index = Number(node.dataset.index);
    if (node.dataset.status === 'locked') {
      restartAnimation(node, 'is-rattling');
      showToast(index === VAULT_INDEX ? VAULT_LOCKED_MESSAGE : LOCKED_MESSAGE);
      return;
    }
    busy = true;
    node.classList.add('is-opening');
    await wait(index === VAULT_INDEX ? 800 : 650);
    if (index === VAULT_INDEX) navigate(game.isVaultOpen() ? { name: 'diploma' } : { name: 'vault' });
    else navigate({ name: 'level', id: LEVELS[index].id });
  };

  draw();
  session.justCompleted = null;
  session.justUnlocked = null;

  root.addEventListener('click', onClick);
  query.addEventListener('change', draw);
  return () => {
    root.removeEventListener('click', onClick);
    query.removeEventListener('change', draw);
  };
}
