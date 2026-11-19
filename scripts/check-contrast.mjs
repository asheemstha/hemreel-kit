// Recomputes every text and control-edge pair from tokens.css (WCAG 2.x relative luminance).
// Fails under 4.5:1 for text and 3:1 for edges, or when a ratio written in a token comment drifts from the computed one.
import { readFileSync } from 'node:fs';

const file = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
// The default theme is the first :root block. Direction and accent previews are checked separately below.
const css = file.match(/:root\s*\{([\s\S]*?)\n\}/)[1];
const tokens = {};
for (const m of css.matchAll(/--([\w-]+):\s*([^;]+);/g)) tokens[m[1]] = m[2].trim();

function parse(v) {
  v = v.trim();
  if (v.startsWith('var(')) return parse(tokens[v.slice(6, -1)]);
  if (v.startsWith('#')) {
    const h = v.slice(1);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1);
  }
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(',').map((s) => parseFloat(s));
    return [p[0], p[1], p[2], p[3] ?? 1];
  }
  throw new Error(`Cannot parse colour ${v}`);
}
const color = (name) => {
  if (!(name in tokens)) throw new Error(`Unknown token --${name}`);
  return parse(tokens[name]);
};
const over = (fg, bg) => {
  const a = fg[3];
  return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)).concat(1);
};
const lum = ([r, g, b]) => {
  const c = [r, g, b].map((x) => {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export function ratio(fgName, bgName, under) {
  let bg = color(bgName);
  if (bg[3] < 1) bg = over(bg, color(under ?? 'surface'));
  let fg = color(fgName);
  if (fg[3] < 1) fg = over(fg, bg);
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

// [foreground, background, kind, ratio stated in the token comments (or null), background base when the background is translucent]
const PAIRS = [
  ['edge', 'surface', 'edge', 3.31], ['edge', 'bg', 'edge', 3.23],
  ['ink', 'bg', 'text', 17.3], ['ink', 'surface', 'text', null], ['ink', 'side', 'text', null], ['ink', 'nav-selected', 'text', null],
  ['ink-2', 'bg', 'text', 8.11], ['ink-2', 'accent-tint', 'text', 7.64], ['ink-2', 'surface', 'text', null], ['ink-2', 'side', 'text', null], ['ink-2', 'sunk', 'text', null],
  ['ink-3', 'bg', 'text', 5.87], ['ink-3', 'sunk', 'text', 5.43], ['ink-3', 'nav-selected', 'text', 5.19], ['ink-3', 'surface', 'text', null], ['ink-3', 'side', 'text', null], ['ink-3', 'accent-tint', 'text', null], ['ink-3', 'due-tint', 'text', null],
  ['ink', 'accent', 'text', 12.24], ['ink', 'accent-hover', 'text', null], ['ink', 'accent-active', 'text', null], ['ink', 'accent-tint', 'text', null],
  ['accent-edge', 'surface', 'edge', 3.82], ['accent-edge', 'accent-tint', 'edge', 3.51],
  ['stage-edge', 'stage', 'edge', 4.42], ['stage-edge', 'stage-2', 'edge', 3.9],
  ['stage-text', 'stage', 'text', 16.82], ['stage-text', 'stage-2', 'text', null], ['stage-text', 'stage-track', 'text', null],
  ['stage-muted', 'stage', 'text', 7.83], ['stage-muted', 'stage-2', 'text', null],
  ['ok', 'surface', 'text', 5.36], ['ok', 'ok-tint', 'text', 4.73],
  ['due', 'surface', 'text', 5.92], ['due', 'due-tint', 'text', 5.1],
  ['fail', 'surface', 'text', 6.57], ['fail', 'fail-tint', 'text', 5.59], ['fail', 'surface', 'edge', null],
  ['on-ink', 'live', 'text', 5.01],
  ['audio', 'sunk', 'text', 4.98], ['chat', 'sunk', 'text', 4.82],
  ['on-ink', 'ink', 'text', null], ['on-ink-2', 'ink', 'text', null], ['on-ink-edge', 'ink', 'edge', 6.56], ['on-ink', 'ink-2', 'text', null],
  ['stage-fail-fg', 'stage-fail-bg', 'edge', 8.04], ['chat', 'surface', 'text', null], ['ink-2', 'due-tint', 'text', null], ['ink-2', 'fail-tint', 'text', null],
  ['on-ink', 'stage-label-bg', 'text', null],
  ['ink', 'accent', 'edge', null], // focus outline (ink) against the accent halo
  // filled controls (no outlines): text on the fills
  ['ink', 'field-bg', 'text', null], ['ink-3', 'field-bg', 'text', null], ['ink', 'btn2-bg', 'text', null], ['ink-2', 'btn2-hover', 'text', null],
  ['ink', 'control-off', 'text', null], ['ink-2', 'control-off', 'text', null], ['on-accent', 'accent', 'text', null], ['ink-3', 'card-bg', 'text', null],
  ['fail', 'fail-tint', 'text', null], ['due', 'due-tint-hover', 'text', null],
  // banner actions: ink on the white pill, the tone colour on hover
  ['ink', 'surface', 'text', null], ['fail', 'bg', 'text', null], ['due', 'bg', 'text', null], ['ink-2', 'sunk', 'text', null],
  // building blocks: the error icon on the ink toast, status words in the light log panel, text on the selection tint
  ['on-ink-fail', 'ink', 'edge', 8.94], ['ok', 'bg', 'text', null], ['ink-2', 'nav-selected', 'text', null], ['ink', 'fail-tint', 'text', null], ['ink', 'on-ink-edge', 'text', null], ['ink-3', 'btn2-bg', 'text', null], ['fail', 'sunk', 'text', null], ['due', 'sunk', 'text', null], ['ok', 'sunk', 'text', null], ['ink', 'sunk', 'text', null], ['ink-3', 'accent-tint', 'text', null], ['on-ink-2', 'ink', 'text', null],
];

let failed = 0;
const rows = [];
for (const [fg, bg, kind, stated, under] of PAIRS) {
  const r = ratio(fg, bg, under);
  const min = kind === 'text' ? 4.5 : 3;
  const drift = stated !== null && Math.abs(r - stated) > 0.015;
  const bad = r < min || drift;
  if (bad) failed++;
  rows.push(`${bad ? 'FAIL' : 'ok  '}  ${kind.padEnd(4)}  --${fg} on --${bg}`.padEnd(52) + `${r.toFixed(2)}:1` + (stated !== null ? `  (comment ${stated.toFixed(2)})` : '') + (r < min ? `  needs ${min}:1` : '') + (drift ? '  comment drift' : ''));
}
console.log(rows.join('\n'));
console.log(`\n${PAIRS.length} pairs checked, ${failed} failed.`);
process.exit(failed ? 1 : 0);
