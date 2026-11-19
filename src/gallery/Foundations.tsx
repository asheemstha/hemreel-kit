import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Kbd } from '@/ui/Kbd';
import { GallerySection, Specimen } from './Specimen';
import { TOKEN_TABLE } from './tokenTable';
import './foundations.css';

const TYPE: Array<[string, string, string]> = [
  ['--text-display', 'Display · 32/38 · 600', 'Found 12 moments. 8 strong.'],
  ['--text-title', 'Title · 24/30 · 600', 'Nothing needs you yet.'],
  ['--text-heading', 'Heading · 17/24 · 600', 'Review'],
  ['--text-body-lg', 'Body large · 16/24 · 400', 'Chat jumps 6× in four seconds and his face reacts inside the first 3 s.'],
  ['--text-body', 'Body · 14/20 · 400', 'After a decision the next unreviewed clip loads.'],
  ['--text-label', 'Label · 13/18 · 500', 'Daily spending cap'],
  ['--text-caption', 'Caption · 12/16 · 500', 'left of the 30 min window'],
  ['--text-number', 'Number · 26/30 · 600 · tabular', '$60 · 13:02 · 41%'],
  ['--text-timecode', 'Timecode · 13/18 · tabular', '1:27:09.2 to 1:27:33.4'],
];
const SPACE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const SPACE_PX = [2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 40, 48];
const RADII: Array<[string, string, string]> = [
  ['--r-xs', '3', 'Timeline pins'], ['--r-sm', '4', 'Small thumbs, lanes, checkbox'], ['--r-key', '5', 'Keycaps'], ['--r-chip', '6', 'Chips, badges, tooltip'],
  ['--r-control', '8', 'Buttons, inputs'], ['--r-rail', '9', 'Rail items'], ['--r-control-lg', '10', 'Large buttons, popups, radio cards'],
  ['--r-card', '12', 'Cards, banners, xl buttons'], ['--r-stage', '16', 'Video stage, dialog'], ['--r-full', '999', 'Pills, avatars'],
];
const SHADOWS: Array<[string, string]> = [['--shadow-xs', 'Cards, secondary buttons'], ['--shadow-md', 'Popups, dialog, toast'], ['--shadow-primary', 'Primary button']];
const MOTION: Array<[string, string, string]> = [
  ['--dur-press', '80ms', 'Button and key press'], ['--dur-fast', '140ms', 'Hover, toggle, chip change'], ['--dur-base', '200ms', 'Toast in, panel and sheet open'],
  ['--dur-clip', '320ms', 'Next clip slides in after Keep or Skip'], ['--dur-live', '1.6s', 'Dot inside the LIVE pill'], ['--dur-spin', '.9s', 'Spinner turn'], ['--dur-pulse', '1.4s', 'Skeleton pulse'],
];
const HEIGHTS: Array<[string, string, string]> = [['--h-sm', '32', 'Small buttons, toolbar'], ['--h-md', '36', 'Default control'], ['--h-lg', '44', 'Row actions'], ['--h-xl', '56', 'Keep and Skip']];

/** Reads a token's value from the live stylesheet. */
function TokenValue({ token }: { token: string }) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim().toUpperCase();
  return <span className="hr-tnum f-swatch__hex">{value}</span>;
}

function MotionRow({ token, value, use }: { token: string; value: string; use: string }) {
  const [n, setN] = useState(0);
  return (
    <div className="f-motion">
      <code>{token}</code>
      <span className="hr-tnum">{value}</span>
      <span className="f-motion__use">{use}</span>
      <span className="f-motion__track" aria-hidden="true">
        <span key={n} className="f-motion__dot" data-run={n > 0 || undefined} style={{ animationDuration: `var(${token})` }} />
      </span>
      <Button size="sm" icon={<Play />} onClick={() => setN((v) => v + 1)} aria-label={`Play ${token}`}>Play</Button>
    </div>
  );
}

export function Foundations() {
  return (
    <main className="g-page" id="main">
      <h1 className="g-h1">Foundations</h1>
      <p className="g-lede">Every value lives in src/styles/tokens.css. Ratios are computed by npm run check:contrast, which fails under 4.5:1 for text and 3:1 for control edges.</p>

      <GallerySection level={2} id="colour" title="Colour" note="Name, variable, value, use and the measured ratio.">
        {TOKEN_TABLE.map((group) => (
          <Specimen key={group.group} label={group.group} wide>
            <div className="f-swatches">
              {group.items.map((t) => (
                <div key={t.token} className="f-swatch">
                  <span className="f-swatch__chip" style={{ background: `var(${t.token})` }} data-light={t.light || undefined} />
                  <span className="f-swatch__text">
                    <strong>{t.name}</strong>
                    <code>{t.token}</code>
                    <TokenValue token={t.token} />
                    <span className="f-swatch__use">{t.use}</span>
                    {t.ratio ? <span className="f-swatch__ratio hr-tnum">{t.ratio}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          </Specimen>
        ))}
      </GallerySection>

      <GallerySection level={2} id="type" title="Type" note="Inter 400, 500, 600 (700 only in the LIVE pill). No monospace font: timecodes, countdowns, money and keycaps use Inter with tabular figures. Stack Sans Notch for the wordmark.">
        <Specimen label="scale" wide>
          <div className="f-type">
            {TYPE.map(([token, meta, sample]) => (
              <div key={token} className="f-type__row">
                <code>{token}</code>
                <span className="f-type__meta">{meta}</span>
                <span className="f-type__sample" style={{ font: `var(${token})` }} data-token={token}>{sample}</span>
              </div>
            ))}
          </div>
        </Specimen>
      </GallerySection>

      <GallerySection level={2} id="space" title="Space">
        <Specimen label="--space-1 to --space-12" wide>
          <div className="f-space">
            {SPACE.map((s, i) => (
              <div key={s} className="f-space__row"><code>--space-{s}</code><span className="hr-tnum">{SPACE_PX[i]}px</span><span className="f-space__bar" style={{ width: `var(--space-${s})` }} /></div>
            ))}
          </div>
        </Specimen>
      </GallerySection>

      <GallerySection level={2} id="radii" title="Radii">
        {RADII.map(([token, px, use]) => (
          <Specimen key={token} label={`${token} · ${px}px`}>
            <span className="f-radius" data-r={token} />
            <span className="f-note">{use}</span>
          </Specimen>
        ))}
      </GallerySection>

      <GallerySection level={2} id="shadows" title="Shadows">
        {SHADOWS.map(([token, use]) => (
          <Specimen key={token} label={token} surface="bg">
            <span className="f-shadow" data-shadow={token} />
            <span className="f-note">{use}</span>
          </Specimen>
        ))}
      </GallerySection>

      <GallerySection level={2} id="focus" title="Focus ring" note="2 px ink outline with a 5 px accent halo. White on the stage. Tab to see them live.">
        <Specimen label="light surface" center><Button>Focus me</Button><span className="f-focus-demo" data-surface-kind="light">Forced</span></Specimen>
        <Specimen label="on the stage" surface="stage" center><Button kind="stage">Focus me</Button><span className="f-focus-demo" data-surface-kind="stage">Forced</span></Specimen>
      </GallerySection>

      <GallerySection level={2} id="motion" title="Motion" note="Ease out for arrivals, ease in for exits, ease in-out for things moving in place. Reduced motion turns slides into cuts.">
        <Specimen label="durations" wide>
          <div className="f-motion-list">{MOTION.map(([t, v, u]) => <MotionRow key={t} token={t} value={v} use={u} />)}</div>
        </Specimen>
      </GallerySection>

      <GallerySection level={2} id="heights" title="Control heights" note="Nothing interactive under 28 px.">
        {HEIGHTS.map(([token, px, use]) => (
          <Specimen key={token} label={`${token} · ${px}px`}>
            <span className="f-height" style={{ height: `var(${token})` }}><Kbd>{px}</Kbd></span>
            <span className="f-note">{use}</span>
          </Specimen>
        ))}
      </GallerySection>
    </main>
  );
}
