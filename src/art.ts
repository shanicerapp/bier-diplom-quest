/**
 * Hand-drawn style illustrations as inline SVG strings.
 * Colours are fixed per illustration; animation hooks are CSS classes (door__leaf, smoke, flame …).
 */
import type { Building } from './config';

export const INK = '#33241a';
export const GOLD = '#c9a24a';
const GOLD_LIGHT = '#ecd08a';
const GOLD_DARK = '#8f6d27';
const AMBER = '#e8a13c';

const n = (value: number): string => String(Math.round(value * 100) / 100);

const svg = (viewBox: string, inner: string, className = ''): string =>
  `<svg viewBox="${viewBox}" class="${className}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

function archPath(x: number, bottom: number, width: number, height: number): string {
  const r = width / 2;
  const top = bottom - height;
  return `M${n(x)} ${n(bottom)}V${n(top + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + width)} ${n(top + r)}V${n(bottom)}Z`;
}

/** A single arched wooden door; the leaf swings open via CSS. */
function door(cx: number, bottom: number, width: number, height: number): string {
  const x = cx - width / 2;
  const top = bottom - height;
  const d = archPath(x, bottom, width, height);
  return `
    <g class="door">
      <path class="door__glow" d="${d}"/>
      <g class="door__leaf">
        <path d="${d}" fill="#6b3f22" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M${n(x + width / 3)} ${n(top + width * 0.2)}V${n(bottom)}M${n(x + (2 * width) / 3)} ${n(top + width * 0.2)}V${n(bottom)}" stroke="#4a2a15" stroke-width="1.1"/>
        <path d="M${n(x + 1)} ${n(bottom - height * 0.28)}H${n(x + width - 1)}M${n(x + 1)} ${n(top + height * 0.5)}H${n(x + width - 1)}" stroke="#2c1a0e" stroke-width="2"/>
        <circle cx="${n(x + width * 0.78)}" cy="${n(bottom - height * 0.4)}" r="1.7" fill="${GOLD}"/>
      </g>
    </g>`;
}

export function hopCone(cx: number, cy: number, s: number, fill = '#a9c566', stroke = '#4d6b2a'): string {
  const d = `M${n(cx)} ${n(cy - 12 * s)}C${n(cx + 8 * s)} ${n(cy - 9 * s)} ${n(cx + 8.5 * s)} ${n(cy + 5 * s)} ${n(cx)} ${n(cy + 12 * s)}C${n(cx - 8.5 * s)} ${n(cy + 5 * s)} ${n(cx - 8 * s)} ${n(cy - 9 * s)} ${n(cx)} ${n(cy - 12 * s)}Z`;
  const scales = [-6, -1, 4]
    .map((dy) => `M${n(cx - 6 * s)} ${n(cy + (dy - 2) * s)}Q${n(cx)} ${n(cy + (dy + 3) * s)} ${n(cx + 6 * s)} ${n(cy + (dy - 2) * s)}`)
    .join('');
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/><path d="${scales}" fill="none" stroke="${stroke}" stroke-width=".9" opacity=".8"/>`;
}

const shadow = (cx: number, cy: number, rx: number): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5.5" fill="#33241a" opacity=".18"/>`;

const stroke = `stroke="${INK}" stroke-width="2" stroke-linejoin="round"`;

function tower(): string {
  return `
    ${shadow(60, 106, 32)}
    <path d="M41 46H79L83 104H37Z" fill="#cdbb95" ${stroke}/>
    <path d="M45 58h8M65 57h9M41 73h7M70 72h9M46 88h8M71 90h8M53 80h6" stroke="#9c8862" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M33 48L60 13L87 48Z" fill="#7d3d2b" ${stroke}/>
    <path d="M60 13L52 48M60 13L68 48M60 13L44 48M60 13L76 48" stroke="#5a2a1d" stroke-width="1" opacity=".7"/>
    <path d="M60 13V2" stroke="${INK}" stroke-width="1.6"/>
    <path class="flag" d="M60 2.5L74 6L60 9.5Z" fill="${GOLD}" stroke="${INK}" stroke-width="1"/>
    <circle cx="60" cy="62" r="7.5" fill="#f3e6c6" stroke="${INK}" stroke-width="1.8"/>
    <path d="M60 62V57.2M60 62L63.8 64.2" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
    ${door(60, 104, 20, 26)}`;
}

function lab(): string {
  return `
    ${shadow(60, 106, 44)}
    <g class="smoke" fill="#f1e7cf" opacity=".75"><circle cx="89" cy="20" r="4"/><circle cx="92" cy="12" r="5"/><circle cx="88" cy="4" r="3.5"/></g>
    <rect x="84" y="28" width="10" height="26" fill="#8b4a33" ${stroke}/>
    <rect x="18" y="56" width="84" height="48" fill="#d4c098" ${stroke}/>
    <path d="M12 58L60 26L108 58Z" fill="#4d6b4f" ${stroke}/>
    <path d="M24 50H96M36 42H84M48 34H72" stroke="#36503a" stroke-width="1.2"/>
    <circle class="window-glow" cx="60" cy="45" r="5.5" fill="${AMBER}" stroke="${INK}" stroke-width="1.6"/>
    <rect x="31" y="63" width="6" height="10" fill="#f3e6c6" stroke="${INK}" stroke-width="1.4"/>
    <path d="M31 73L24 90H44L37 73Z" fill="#f3e6c6" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M27.4 82L24.6 89H43.4L40.6 82Z" fill="${AMBER}"/>
    <circle cx="32" cy="85" r="1.2" fill="#fff6dc"/><circle cx="36" cy="83.5" r=".9" fill="#fff6dc"/>
    <rect class="window-glow" x="76" y="66" width="16" height="16" fill="${AMBER}" stroke="${INK}" stroke-width="1.6"/>
    <path d="M84 66v16M76 74h16" stroke="${INK}" stroke-width="1.4"/>
    ${door(60, 104, 18, 28)}`;
}

function greenhouse(): string {
  return `
    ${shadow(60, 106, 44)}
    <path d="M20 94C20 44 100 44 100 94Z" fill="#bcd6b2" fill-opacity=".8" ${stroke}/>
    <path d="M60 57V94M40 61C34 72 33 84 33 94M80 61C86 72 87 84 87 94M24 78C45 72 75 72 96 78" stroke="${INK}" stroke-width="1.2" fill="none" opacity=".7"/>
    <path d="M34 68C38 60 45 56 51 55" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".6" fill="none"/>
    <path d="M60 56.5V49" stroke="${INK}" stroke-width="1.6"/><circle cx="60" cy="47" r="3" fill="${GOLD}" stroke="${INK}" stroke-width="1"/>
    <rect x="16" y="92" width="88" height="12" fill="#b8a27a" ${stroke}/>
    <path d="M22 92C14 80 27 72 18 62C12 54 22 47 21 38" stroke="#4d7a3a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M98 92C106 82 94 76 101 66" stroke="#4d7a3a" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${hopCone(17, 57, 0.42)}${hopCone(24, 74, 0.4)}${hopCone(22, 41, 0.36)}${hopCone(103, 72, 0.4)}
    <path d="M14 66c-5-1-7 3-6 6c4 0 6-2 6-6zM26 52c5-2 8 1 8 4c-4 1-7-1-8-4z" fill="#5f8f45" stroke="#33552a" stroke-width=".8"/>
    ${door(60, 104, 18, 24)}`;
}

function city(): string {
  const rays = Array.from({ length: 9 }, (_, i) => {
    const angle = ((200 + (140 / 8) * i) * Math.PI) / 180;
    return `M60 74L${n(60 + 50 * Math.cos(angle))} ${n(74 + 50 * Math.sin(angle))}`;
  }).join('');
  const battlements = (x: number, y: number) =>
    `M${x} ${y}v-6h5v6h4.5v-6h5v6h4.5v-6h5v6`;
  return `
    ${shadow(60, 106, 46)}
    <path d="${rays}" stroke="${GOLD}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>
    <rect x="42" y="60" width="36" height="44" fill="#cbb894" ${stroke}/>
    <path d="M42 60v-5h6v5h6v-5h6v5h6v-5h6v5h6v-5" fill="none" ${stroke}/>
    <rect x="18" y="44" width="24" height="60" fill="#d6c4a0" ${stroke}/>
    <rect x="78" y="44" width="24" height="60" fill="#d6c4a0" ${stroke}/>
    <path d="${battlements(18, 44)}" fill="none" ${stroke}/>
    <path d="${battlements(78, 44)}" fill="none" ${stroke}/>
    <rect x="28" y="56" width="4" height="10" rx="2" fill="${INK}"/><rect x="88" y="56" width="4" height="10" rx="2" fill="${INK}"/>
    <path d="M22 80h6M33 90h5M83 82h7M92 94h5M47 70h6M68 68h5" stroke="#9c8862" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="60" cy="66" r="3" fill="${GOLD}" stroke="${INK}" stroke-width="1"/>
    ${door(60, 104, 22, 30)}`;
}

const BUILDINGS: Record<Building, () => string> = { tower, lab, greenhouse, city };

export function buildingArt(building: Building, className = ''): string {
  return svg('0 0 120 112', BUILDINGS[building](), `building building--${building} ${className}`);
}

/** The final vault, carved into the rock, with a double door. */
export function vaultArt(className = ''): string {
  const studs = [88, 100, 112]
    .flatMap((y) => [58, 72, 88, 102].map((x) => `<circle cx="${x}" cy="${y}" r="1.5" fill="${GOLD}"/>`))
    .join('');
  return svg(
    '0 0 160 130',
    `
    <ellipse cx="80" cy="123" rx="64" ry="6" fill="#33241a" opacity=".2"/>
    <path d="M6 124L20 74L38 60L50 32L72 18L92 26L110 20L128 46L142 62L154 124Z" fill="#8a7f6c" ${stroke}/>
    <path d="M50 32L58 50M110 20L106 40M128 46L120 58M20 74L32 78M142 62L134 72M72 18L74 30" stroke="${INK}" stroke-width="1.2" opacity=".55" fill="none"/>
    <path d="M38 60L44 66M92 26L96 34" stroke="${INK}" stroke-width="1" opacity=".4"/>
    <path d="${archPath(44, 124, 72, 92)}" fill="#3a322a" stroke="${INK}" stroke-width="2"/>
    <path d="M44 124V68A36 36 0 0 1 116 68V124" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
    <path class="door__glow" d="${archPath(52, 124, 56, 82)}"/>
    <g class="door__leaf door__leaf--l">
      <path d="M52 124V70A28 28 0 0 1 80 42V124Z" fill="#5e3820" stroke="${INK}" stroke-width="1.6"/>
      <path d="M80 81A7 7 0 0 0 80 95Z" fill="${GOLD}"/>
    </g>
    <g class="door__leaf door__leaf--r">
      <path d="M80 42A28 28 0 0 1 108 70V124H80Z" fill="#5e3820" stroke="${INK}" stroke-width="1.6"/>
      <path d="M80 81A7 7 0 0 1 80 95Z" fill="${GOLD_DARK}"/>
    </g>
    <g class="vault-studs">${studs}</g>
    <path d="M70 26H90L86 42H74Z" fill="${GOLD}" stroke="${INK}" stroke-width="1.4"/>
    ${hopCone(80, 33, 0.38, GOLD_LIGHT, GOLD_DARK)}`,
    `vault-art ${className}`,
  );
}

export function padlock(): string {
  return svg(
    '0 0 32 32',
    `<path d="M10 15V10.5a6 6 0 0 1 12 0V15" fill="none" stroke="#4a4a46" stroke-width="3.2" class="padlock__shackle"/>
     <rect x="6" y="14" width="20" height="15" rx="3" fill="#b88a3a" stroke="${INK}" stroke-width="2"/>
     <circle cx="16" cy="20.3" r="2.3" fill="${INK}"/><path d="M16 21.5v3.8" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`,
    'padlock',
  );
}

function starPoints(cx: number, cy: number, outer: number, inner: number, points: number): string {
  return Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    return `${n(cx + r * Math.cos(a))},${n(cy + r * Math.sin(a))}`;
  }).join(' ');
}

export function sealCheck(): string {
  return svg(
    '0 0 32 32',
    `<polygon points="${starPoints(16, 16, 15.5, 13, 16)}" fill="${GOLD}" stroke="${GOLD_DARK}" stroke-width="1"/>
     <circle cx="16" cy="16" r="10.5" fill="#dcb85e" stroke="${GOLD_DARK}" stroke-width="1.2"/>
     <path d="M11 16.5l3.4 3.4L21.5 12.3" stroke="#3b2a12" stroke-width="2.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    'seal-check',
  );
}

export function successStamp(): string {
  return svg(
    '0 0 120 120',
    `<polygon points="${starPoints(60, 60, 56, 50, 24)}" fill="${GOLD}" stroke="${GOLD_DARK}" stroke-width="2"/>
     <circle cx="60" cy="60" r="42" fill="#dcb85e" stroke="${GOLD_DARK}" stroke-width="2"/>
     <circle cx="60" cy="60" r="36" fill="none" stroke="${GOLD_DARK}" stroke-width="1" stroke-dasharray="2 3"/>
     <path d="M42 61l12 12L79 46" stroke="#3b2a12" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    'success-stamp',
  );
}

function laurel(cx: number, cy: number, r: number, from: number, to: number, count: number, color: string): string {
  let out = '';
  for (let k = 0; k < count; k++) {
    const a = ((from + ((to - from) * k) / (count - 1)) * Math.PI) / 180;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    const tangent = (a * 180) / Math.PI + (to > from ? 90 : -90);
    out += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="6.5" ry="2.6" fill="${color}" transform="rotate(${n(tangent - 32)} ${n(x)} ${n(y)}) translate(4 0)"/>`;
    out += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="6.5" ry="2.6" fill="${color}" transform="rotate(${n(tangent + 32)} ${n(x)} ${n(y)}) translate(4 0)"/>`;
  }
  return out;
}

/** Circular academy crest with ring inscription, shield, hop cone, key and laurels. */
export function crest(id: string, ringText: string, light = false): string {
  const ring = light ? GOLD_DARK : GOLD;
  const shieldFill = light ? '#24432f' : '#1c3527';
  return svg(
    '0 0 200 200',
    `<defs><path id="${id}-ring" d="M100 183A83 83 0 1 1 100 17A83 83 0 1 1 100 183"/></defs>
     <circle cx="100" cy="100" r="97" fill="none" stroke="${ring}" stroke-width="2"/>
     <circle cx="100" cy="100" r="71" fill="none" stroke="${ring}" stroke-width="1.2"/>
     <text font-size="11.5" letter-spacing="1.6" fill="${ring}" text-anchor="middle" class="crest__text"><textPath href="#${id}-ring" startOffset="50%">${ringText}</textPath></text>
     <path d="M30 128l4 2.5M170 128l-4 2.5" stroke="${ring}" stroke-width="1.5"/>
     <text x="100" y="186" font-size="11" letter-spacing="3" fill="${ring}" text-anchor="middle" class="crest__text">· MMXXVI ·</text>
     ${laurel(100, 104, 60, 100, 200, 8, light ? '#6f7f45' : '#7d8f4e')}
     ${laurel(100, 104, 60, 80, -20, 8, light ? '#6f7f45' : '#7d8f4e')}
     <path d="M100 46C88 52 76 53 66 51V98C66 124 82 140 100 150C118 140 134 124 134 98V51C124 53 112 52 100 46Z" fill="${shieldFill}" stroke="${ring}" stroke-width="3"/>
     ${hopCone(100, 84, 1.25, GOLD_LIGHT, GOLD_DARK)}
     <path d="M100 66.5V61" stroke="${GOLD_LIGHT}" stroke-width="1.6"/>
     <circle cx="82" cy="122" r="5.5" fill="none" stroke="${GOLD_LIGHT}" stroke-width="2.6"/>
     <path d="M87.5 122H120M114 122v5.5M119 122v4.5" stroke="${GOLD_LIGHT}" stroke-width="2.6" stroke-linecap="round"/>`,
    'crest',
  );
}

/** Red wax seal with ribbon tails. */
export function waxSeal(): string {
  const blob = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const r = 44 + 2.6 * Math.sin(a * 9) + 1.4 * Math.sin(a * 23);
    return `${i === 0 ? 'M' : 'L'}${n(60 + r * Math.cos(a))} ${n(56 + r * Math.sin(a))}`;
  }).join('') + 'Z';
  return svg(
    '0 0 120 140',
    `<path d="M46 80L34 136L46 127L55 138L60 84Z" fill="#7a221a"/>
     <path d="M74 80L86 136L74 127L65 138L60 84Z" fill="#8f2d22"/>
     <path d="${blob}" fill="#9b2f24" stroke="#6e1e17" stroke-width="2"/>
     <circle cx="60" cy="56" r="33" fill="none" stroke="#c4574a" stroke-width="2"/>
     <circle cx="60" cy="56" r="28" fill="none" stroke="#c4574a" stroke-width=".8" stroke-dasharray="1.5 2.5"/>
     ${hopCone(60, 48, 0.8, '#b8463a', '#ef9a88')}
     <text x="60" y="78" font-size="11" letter-spacing="2.5" text-anchor="middle" fill="#f3b3a3" class="seal__text">A·H·B</text>`,
    'wax-seal',
  );
}

export function cornerFlourish(): string {
  return svg(
    '0 0 60 60',
    `<path d="M4 58V22C4 11 11 4 22 4H58" fill="none" stroke="currentColor" stroke-width="1.6"/>
     <path d="M10 58V24C10 16 16 10 24 10H58" fill="none" stroke="currentColor" stroke-width=".8"/>
     <path d="M14 30C14 20 20 14 30 14C24 18 22 22 22 28C22 24 18 22 14 30Z" fill="currentColor"/>
     <circle cx="22" cy="22" r="2.6" fill="currentColor"/>`,
    'flourish',
  );
}

export function signatureScribble(): string {
  return svg(
    '0 0 160 44',
    `<path d="M6 32C14 10 24 6 22 28C21 38 30 36 38 22C44 12 50 14 46 30C44 38 56 30 62 20C66 14 70 18 68 28C67 34 76 30 84 22C92 14 96 22 104 24C114 27 126 16 154 14" fill="none" stroke="#2c3d6b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    'signature',
  );
}

/** Decorative half of the vault door (the right half is mirrored with CSS). */
export function vaultLeafArt(): string {
  const studs = (y: number) => [10, 30, 50, 70].map((x) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${GOLD}"/>`).join('');
  return `<svg viewBox="0 0 96 282" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M24 0V282M48 0V282M72 0V282" stroke="#000" stroke-opacity=".22" stroke-width="1.5"/>
    <rect y="104" width="96" height="11" fill="#2b241f"/>${studs(109.5)}
    <rect y="236" width="96" height="11" fill="#2b241f"/>${studs(241.5)}
    <rect x="12" y="126" width="62" height="96" rx="3" fill="#000" fill-opacity=".12" stroke="${GOLD_DARK}" stroke-width="2"/>
    <rect x="18" y="132" width="50" height="84" rx="2" fill="none" stroke="${GOLD_DARK}" stroke-width=".8"/>
    ${hopCone(48, 64, 1.3, GOLD_DARK, '#5e4518')}
    <circle cx="80" cy="212" r="8" fill="none" stroke="${GOLD}" stroke-width="3"/>
    <circle cx="80" cy="203" r="3.4" fill="${GOLD}"/>
    <circle cx="96" cy="170" r="21" fill="${GOLD_DARK}" stroke="${GOLD}" stroke-width="2.5"/>
    <circle cx="96" cy="170" r="14" fill="none" stroke="${GOLD_LIGHT}" stroke-width="1"/>
    <circle cx="96" cy="166" r="4.2" fill="#1a120c"/><path d="M96 167L91.5 181H96Z" fill="#1a120c"/>
    <path d="M95 0V282" stroke="#000" stroke-opacity=".5" stroke-width="2"/>
  </svg>`;
}

/** Stone portal around the vault door, with torches and the inscription. */
export function vaultFrameArt(): string {
  const joints = Array.from({ length: 11 }, (_, i) => {
    const a = Math.PI + (Math.PI / 12) * (i + 1);
    return `M${n(150 + 104 * Math.cos(a))} ${n(166 + 104 * Math.sin(a))}L${n(150 + 140 * Math.cos(a))} ${n(166 + 140 * Math.sin(a))}`;
  }).join('');
  const torch = (x: number) => `
    <path d="M${x - 5} 196h10l-3 16h-4z" fill="#3a2a1c" stroke="#1a120c" stroke-width="1"/>
    <path class="flame" d="M${x} 170c6 8 7 14 5 19c-1 4-4 6-5 6s-4-2-5-6c-2-5 0-11 5-19z" fill="${AMBER}"/>
    <path class="flame flame--inner" d="M${x} 180c3 4 3.5 8 2.5 10.5c-.6 1.6-1.8 2.5-2.5 2.5s-1.9-.9-2.5-2.5c-1-2.5-.5-6.5 2.5-10.5z" fill="#fff0b8"/>`;
  return `<svg viewBox="0 0 300 360" class="vault__frame" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="vf-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f675a"/><stop offset="1" stop-color="#433c33"/></linearGradient>
      <path id="vf-inscription" d="M30 166A120 120 0 0 1 270 166"/>
    </defs>
    <path d="M8 360V166A142 142 0 0 1 292 166V360Z" fill="url(#vf-stone)" stroke="#221d18" stroke-width="3"/>
    <path d="${joints}" stroke="#2b251f" stroke-width="2" opacity=".7"/>
    <path d="M8 250H40M8 300H40M260 230H292M260 290H292M20 200H44M256 200H280" stroke="#2b251f" stroke-width="1.6" opacity=".5"/>
    <text font-size="12" letter-spacing="2.4" fill="${GOLD_LIGHT}" text-anchor="middle" class="vault__inscription"><textPath href="#vf-inscription" startOffset="50%">PER ASPERA AD CEREVISIAM</textPath></text>
    <path d="M46 352V166A104 104 0 0 1 254 166V352" fill="none" stroke="${GOLD_DARK}" stroke-width="2"/>
    <path d="M54 352V166A96 96 0 0 1 246 166V352" fill="none" stroke="${GOLD}" stroke-width="5"/>
    <path d="M134 50H166L160 80H140Z" fill="${GOLD}" stroke="#221d18" stroke-width="1.5"/>
    ${hopCone(150, 64, 0.55, GOLD_LIGHT, GOLD_DARK)}
    ${torch(26)}${torch(274)}
    <rect y="350" width="300" height="10" fill="#2e2822"/>
  </svg>`;
}

export const icons = {
  back: `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  lamp: `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  backspace: `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon"><path d="M8.5 5H20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8.5L3 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 9l6 6M17 9l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  print: `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon"><path d="M7 9V3h10v6M7 17H4v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7h-3M7 14h10v7H7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  scroll: `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon"><path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V4zM6 4a2 2 0 0 0-2 2v2h2M10 9h6M10 13h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  reset: `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  marker: `<svg viewBox="0 0 24 32" aria-hidden="true" class="marker"><path d="M12 31C12 31 2 18 2 11a10 10 0 0 1 20 0c0 7-10 20-10 20z" fill="${GOLD_LIGHT}" stroke="${GOLD_DARK}" stroke-width="1.5"/><circle cx="12" cy="11" r="4" fill="${GOLD_DARK}"/></svg>`,
};
