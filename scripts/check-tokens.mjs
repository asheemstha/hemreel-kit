// Proves that no raw colour, radius, shadow or duration lives outside src/styles/tokens.css.
// base.css may hold raw values only inside @keyframes. Footage stills in src/assets are pictures, not components, and are skipped.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(root, 'src');
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'assets') walk(p); continue; }
    if (/\.(css|tsx?|mjs)$/.test(name)) files.push(p);
  }
})(SRC);

const COLOR = /#[0-9a-fA-F]{3,8}\b(?![\w-])|\brgba?\s*\(|\bhsla?\s*\(|\boklch\s*\(/;
const NAMED = /:\s*[^;]*\b(white|black|red|green|blue|yellow|orange|purple|gray|grey)\b/; // CSS only
const DURATION = /(?<![\w.-])\d*\.?\d+m?s\b/;
const RADIUS_DECL = /border(-[a-z]+)*-radius\s*:\s*([^;]+);?/g;
const SHADOW_DECL = /box-shadow\s*:\s*([^;]+);?/g;
const RADIUS_OK = /^(var\(--r-[\w-]+\)|0|inherit|50%)$/; // 50% only where a circle is drawn from a square
const RADIUS_OK_LIST = (v) => v.trim().split(/\s+(?![^(]*\))/).every((p) => RADIUS_OK.test(p));
const SHADOW_OK = (v) => {
  v = v.trim();
  if (v === 'none') return true;
  // every shadow must take its colour from a token; geometry-only rings are allowed (they draw selection rings, not elevation)
  return v.split(/,(?![^(]*\))/).every((s) => /var\(--[\w-]+\)/.test(s) && !/rgba?\(|#/.test(s));
};

const problems = [];
const skipLine = (l) => /^\s*(\/\/|\*|\/\*)/.test(l) || /check-tokens: allow/.test(l);

for (const file of files) {
  const rel = relative(root, file);
  if (rel === 'src/styles/tokens.css') continue;
  let text = readFileSync(file, 'utf8');
  if (rel === 'src/styles/base.css') {
    // strip @keyframes blocks, the one place base.css may hold raw values, and the reduced-motion overrides
    text = text.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
    text = text.replace(/animation-duration: 0\.01ms[^;]*;|transition-duration: 0\.01ms[^;]*;/g, '');
  }
  const isCss = file.endsWith('.css');
  text.split('\n').forEach((line, i) => {
    if (skipLine(line)) return;
    const code = line.replace(/\/\*.*?\*\//g, '');
    const at = `${rel}:${i + 1}`;
    if (COLOR.test(code)) problems.push(`${at}  raw colour: ${code.trim()}`);
    if (isCss && NAMED.test(code) && !/font|content|grid-area|--/.test(code.split(':')[0])) problems.push(`${at}  named colour: ${code.trim()}`);
    if (isCss && DURATION.test(code.replace(/var\([^)]*\)/g, ''))) problems.push(`${at}  raw duration: ${code.trim()}`);
    if (!isCss && /['"`][^'"`]*\b\d+m?s\b[^'"`]*['"`]/.test(code) && /(transition|animation|duration|delay)/i.test(code)) problems.push(`${at}  raw duration in script: ${code.trim()}`);
    for (const m of code.matchAll(RADIUS_DECL)) if (!RADIUS_OK_LIST(m[2])) problems.push(`${at}  raw radius: ${m[0].trim()}`);
    if (!isCss) for (const m of code.matchAll(/borderRadius\s*:\s*([^,}]+)/g)) problems.push(`${at}  inline radius: ${m[0].trim()}`);
    for (const m of code.matchAll(SHADOW_DECL)) if (!SHADOW_OK(m[1])) problems.push(`${at}  raw shadow: ${m[0].trim()}`);
    if (!isCss && /boxShadow\s*:/.test(code)) problems.push(`${at}  inline shadow: ${code.trim()}`);
  });
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} raw value(s) outside tokens.css.`);
  process.exit(1);
}
console.log(`check:tokens passed. ${files.length} files scanned, no raw colour, radius, shadow or duration outside tokens.css.`);
