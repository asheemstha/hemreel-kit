# hemreel UI kit: build brief for a Claude Code session

Paste this whole file as the first message of the code session, or save it in the repo as `docs/ui-kit-brief.md` and say "read docs/ui-kit-brief.md and carry it out".

---

## 1. Your job

Build the complete hemreel UI kit in code: design tokens, every component with every state, a gallery app that shows all of it, and the six product screens composed from the kit as proof that the kit is complete.

You are done when all of this is true:

1. `npm run dev` opens a gallery with a Foundations page, a Components page (every component in section 7, every variant and state), and one route per screen and state listed in section 10.
2. `npm run typecheck`, `npm run lint` and `npm run test` pass with zero errors.
3. No raw colour (hex, `rgb()`, `rgba()`), radius, shadow or duration exists in any component file. They live in `src/styles/tokens.css` (keyframes in `base.css` are the one exception). A script (`npm run check:tokens`) proves it and fails otherwise.
4. Every interactive component works from the keyboard, shows the focus ring, and passes axe with zero violations in the gallery (`npm run test:a11y`).
5. A contrast script (`npm run check:contrast`) recomputes every text and control-edge pair in section 5 and fails under 4.5:1 for text or 3:1 for edges.
6. You have looked at the result: take Playwright screenshots of each gallery route at 1440×900, read them, and fix what looks wrong before you report.

Work through the whole brief without stopping to ask. If something is ambiguous, pick the option that best fits the rules in section 3, write the decision in `docs/decisions.md`, and continue. Stop and ask only if a decision cannot be undone.

Start by inspecting the repository. If it already has a React app, follow its structure, package manager and lint setup, and add the kit under `src/ui/`. If it is empty, scaffold Vite + React + TypeScript (strict) and use the structure in section 4.

---

## 2. Product context

hemreel (always lowercase) is a paid Mac desktop app for "clippers": people who get paid by streamers and brands to cut short vertical clips out of long Twitch, YouTube and Kick streams and post them on TikTok, Instagram Reels and YouTube Shorts. Launch is tied to the biggest game release of the year, so thousands of streams go live at once and speed matters.

A clipper's night, in order:

1. Paste a stream link or drop a video file, or let the app watch a channel while it is live.
2. The app finds hype moments (chat spikes, loud audio, facecam reactions), crops them to 9:16 with the facecam on top, burns in captions, and scores each one 0 to 100.
3. The clipper reviews clips fast: watch, keep or skip, maybe trim the start or end, maybe change the hook text. Dozens per session, mostly with the keyboard.
4. Kept clips get posted to TikTok, Reels and Shorts with a caption and hashtags.
5. After posting, the post link must be submitted to the campaign within about 30 minutes, or the clipper does not get paid.
6. Pay is per view (for example "$1.50 per 1K views, $3.50 min, $150 max per clip") or from a shared pool ("$12,500 pool by share of views").

The Home screen answers two questions at a glance: what needs me right now, and what could it earn me.

The kit is the visual and interaction layer only. Do not build video processing, downloading, posting, or any network calls. Everything renders from the fixtures in section 9.

---

## 3. Design direction and rules

Direction: a light, calm SaaS workspace with a dark video stage. Think of a well made B2B video tool: grey sidebar, white cards with hairline borders, one yellow primary action per screen, and footage always shown on neutral black. It has to feel fast and confident and stay comfortable for hours.

Hard rules. Treat each as a test:

- **The video is the hero.** Anywhere a clip plays or previews large, it sits on `--stage` with no brand colour touching it. Controls on the stage are neutral greys and white. The focus ring on the stage is white.
- **Scores read as guesses.** Always show the band (Strong, Maybe, Weak) with the number, the reason in plain words where there is room, and the note "AI guess, not a promise of views." Bands are drawn in ink, grey and a dashed outline with a signal-bars icon. They never use status colours.
- **Status colour only means status** and always comes with an icon or a word: `--ok` (submitted, connected, passed), `--due` (submit countdown), `--fail` (past window, failed render, failed load).
- **Live has its own treatment.** `--live` is used only for the LIVE pill, the ring around a live channel's avatar, and the dot on the Live rail icon.
- **Selection is never a coloured stripe on one side of a rounded card or row.** Use a filled background, a ring around the thumbnail, a chip, a dot or a badge.
- **Yellow is for the primary action and selection tint.** `--accent` is never text on a light surface, and every accent fill carries an `--accent-edge` border so its edge passes 3:1.
- **Contrast:** text 4.5:1, control edges 3:1, visible focus ring on everything focusable.
- **Targets:** default control height 36 px, row actions 44 px, Keep and Skip 56 px. Nothing interactive under 28 px tall.
- **Keyboard first.** Shortcuts are visible as quiet keycaps next to the action they trigger. A "?" sheet lists every key and renders from the keymap in section 9.
- **Earnings estimates** appear only where the campaign pays per view: "≈ $15 at 10K views". Pool campaigns show no estimate.
- **Voice:** calm, fast, numbers first. "Found 12 moments. 8 strong." "Skipped." Never hype such as "INSANE viral clips". No emoji anywhere in the UI. No em dashes in UI copy. Sentence case everywhere except the LIVE pill.

Avoid:

- Purple, purple-to-blue gradients, sparkles, glassy gradients, gradient washes.
- Anything resembling GTA or Rockstar branding: display fonts in that style, pink-and-teal sunsets, palm trees, stars, "VI" numerals.
- Pure orange-red `#FF4500`, Kick green, TikTok cyan and pink.
- A dark graphite "developer tool" look, cramped rows, tiny type.
- Platform logos and any other company's brand marks. Platform names are plain text.

Brand:

- Wordmark: "hemreel" in Stack Sans Notch, weight 600, letter-spacing -0.01em.
- Mark "Notch": a sheet a bit taller than wide with the top-right corner folded down, showing the accent colour underneath. SVG, 20×30 viewBox:

```html
<svg viewBox="0 0 20 30" role="img" aria-label="hemreel">
  <path d="M13 0h7v7z" fill="var(--accent)"/>
  <path d="M2.5 0H13l7 7v20.5A2.5 2.5 0 0 1 17.5 30h-15A2.5 2.5 0 0 1 0 27.5v-25A2.5 2.5 0 0 1 2.5 0z" fill="var(--ink)"/>
  <path d="M13 0v5a2 2 0 0 0 2 2h5z" fill="var(--mark-fold)"/>
</svg>
```

On a dark background the sheet is `--on-ink` and the fold is `--mark-fold-on-ink`.

---

## 4. Stack and libraries

- React + TypeScript (strict). Plain CSS files with CSS variables. **No Tailwind, no CSS-in-JS runtime, no utility framework.** One `.css` file per component, class names prefixed `hr-`, variants through `data-` attributes (see the reference code in section 8).
- Unstyled accessible primitives: **Base UI**, package `@base-ui/react` (MIT, 1.9.0 on npm when this brief was written). Use it for Dialog, Menu, Select, Tabs, Switch, Radio Group, Checkbox, Tooltip, Popover, Toast if suitable. Style every part yourself with the tokens. Read its current docs before using each part, since the API may have moved.
- Icons: **Lucide**, package `lucide-react` (ISC, 1.75.0 when written). 24 px grid, stroke 2, drawn at 14 to 20 px. Add Lucide's copyright notice to `THIRD_PARTY_NOTICES.md`.
- Fonts, self-hosted so the desktop app works offline: `@fontsource-variable/inter`, `@fontsource-variable/geist-mono`, `@fontsource-variable/stack-sans-notch` (all 5.3.0 when written, all SIL Open Font License). Check the exact `font-family` name each package registers and make `--font-ui`, `--font-mono`, `--font-logo` match.
- Tests: Vitest + Testing Library for behaviour, `vitest-axe` or `@axe-core/playwright` for accessibility, Playwright for the screenshots.
- Optional, only if you need them, and only after reading each licence: a toast library, a hotkey helper, a virtual list. Prefer the small hand-written versions in section 8 and 9 where they are enough.

Verify every package name, version and licence with `npm view` before installing. Do not trust the versions above blindly.

Suggested structure when the repo is empty:

```
src/
  styles/        tokens.css, base.css, fonts.css
  ui/            one folder or file pair per component: Button.tsx + button.css
  ui/index.ts    public exports
  data/          fixtures.ts, keymap.ts
  hooks/         useHotkeys.ts, useCountdown.ts
  gallery/       Foundations.tsx, Components.tsx, routes for screens and states
  screens/       Home, Review, Moments, NewClips, Live, Settings
scripts/         check-tokens.mjs, check-contrast.mjs, screenshots.mjs
docs/            decisions.md, ui-kit-brief.md
```

---

## 5. Tokens

Use this file as written. The comments carry the measured contrast ratios; the contrast script must reproduce them.

`src/styles/tokens.css`

```css
/* hemreel design tokens. Direction A, SaaS build. The only file allowed to contain raw hex values. */
:root {
  /* surfaces */
  --bg: #FAFAFB;            /* app background */
  --side: #F4F4F6;          /* sidebar and icon rail */
  --surface: #FFFFFF;       /* cards, inputs, top bar */
  --sunk: #F1F1F4;          /* neutral chips, timeline lanes, segmented track */
  --nav-selected: #E6E6EB;  /* filled background of the current nav item */
  --line: #E4E4E9;          /* dividers, card outlines. Decorative only */
  --edge: #8A8D98;          /* borders of buttons, inputs, toggles. 3.31:1 on surface, 3.17:1 on bg */

  /* text */
  --ink: #17181C;           /* 17.01:1 on bg */
  --ink-2: #4B4E57;         /* 7.97:1 on bg, 7.64:1 on accent-tint */
  --ink-3: #5F636D;         /* 5.76:1 on bg, 5.33:1 on sunk, 4.83:1 on nav-selected. Lightest text allowed */

  /* accent: marker yellow. Never used as text on a light surface */
  --accent: #FFD21F;        /* ink on accent 12.24:1 */
  --accent-hover: #F7C600;
  --accent-active: #EBBB00;
  --accent-edge: #A67C00;   /* border of every accent fill. 3.82:1 on surface, 3.51:1 on accent-tint */
  --accent-tint: #FFF6CC;   /* selected row, most urgent row */

  /* video stage: neutral, no brand colour may touch footage */
  --stage: #0B0B0C;
  --stage-2: #1A1A1D;       /* controls on the stage */
  --stage-edge: #77777C;    /* 4.42:1 on stage, 3.90:1 on stage-2 */
  --stage-text: #EDEDEE;    /* 16.82:1 on stage */
  --stage-muted: #A3A3A8;   /* 7.83:1 on stage */
  --stage-track: #3A3A3D;   /* scrubber track */

  /* status: colour only means status and always comes with an icon or a word */
  --ok: #157A4A;            /* 5.36:1 on surface, 4.73:1 on ok-tint */
  --ok-tint: #E3F5EA;
  --due: #A14C00;           /* 5.92:1 on surface, 5.10:1 on due-tint */
  --due-tint: #FFEBD6;
  --due-track: rgba(161, 76, 0, .22);
  --fail: #B42318;          /* 6.57:1 on surface, 5.59:1 on fail-tint */
  --fail-tint: #FDE8E6;
  --live: #D42A38;          /* white on live 5.01:1. Reserved for on-air only */

  /* timeline data lanes (not status colours) */
  --audio: #4F6B8A;         /* 4.90:1 on sunk */
  --chat: #8A6426;          /* 4.74:1 on sunk */

  /* on dark ink surfaces (toast, code, dark button) */
  --on-ink: #FFFFFF;
  --on-ink-2: #C9CCD3;
  --on-ink-edge: #9A9DA8;   /* 6.56:1 on ink */
  --on-ink-wash: rgba(255, 255, 255, .12);   /* hover and keycap fill on ink */
  --on-accent-wash: rgba(255, 255, 255, .45); /* keycap fill on accent */
  --scrim: rgba(16, 18, 24, .5);
  --mark-fold: #6B6F7A;        /* logo fold on light */
  --mark-fold-on-ink: #9DA1AB; /* logo fold on dark */

  /* type */
  --font-ui: "Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "Geist Mono Variable", "Geist Mono", ui-monospace, "SF Mono", monospace;
  --font-logo: "Stack Sans Notch Variable", "Stack Sans Notch", "Inter", sans-serif;
  --text-display: 600 32px/38px var(--font-ui);   /* letter-spacing -0.02em */
  --text-title: 600 24px/30px var(--font-ui);     /* letter-spacing -0.02em */
  --text-heading: 600 17px/24px var(--font-ui);   /* letter-spacing -0.01em */
  --text-body-lg: 400 16px/24px var(--font-ui);
  --text-body: 400 14px/20px var(--font-ui);
  --text-label: 500 13px/18px var(--font-ui);
  --text-caption: 500 12px/16px var(--font-ui);
  --text-number: 600 26px/30px var(--font-ui);    /* tabular-nums, letter-spacing -0.02em */
  --text-timecode: 500 13px/18px var(--font-mono);

  /* space */
  --space-1: 2px;  --space-2: 4px;  --space-3: 6px;  --space-4: 8px;
  --space-5: 12px; --space-6: 16px; --space-7: 20px; --space-8: 24px;
  --space-9: 28px; --space-10: 32px; --space-11: 40px; --space-12: 48px;

  /* shape */
  --r-key: 5px; --r-chip: 6px; --r-control: 8px; --r-control-lg: 10px; --r-card: 12px; --r-stage: 16px; --r-full: 999px;

  /* control heights */
  --h-sm: 32px; --h-md: 36px; --h-lg: 44px; --h-xl: 56px;

  /* elevation */
  --shadow-xs: 0 1px 2px rgba(16, 18, 24, .06);
  --shadow-md: 0 8px 24px rgba(16, 18, 24, .14), 0 1px 2px rgba(16, 18, 24, .08);
  --shadow-primary: inset 0 1px 0 rgba(255, 255, 255, .55), 0 1px 2px rgba(16, 18, 24, .10);

  /* focus */
  --focus-outline: 2px solid var(--ink);
  --focus-halo: 0 0 0 5px var(--accent);
  --focus-outline-stage: 2px solid var(--on-ink);
  --focus-halo-stage: 0 0 0 5px rgba(255, 255, 255, .32);

  /* motion */
  --dur-press: 80ms;   /* button and key press */
  --dur-fast: 140ms;   /* hover, toggle, chip change */
  --dur-base: 200ms;   /* toast in, panel and sheet open */
  --dur-clip: 320ms;   /* next clip slides in after Keep or Skip */
  --dur-live: 1.6s;    /* dot inside the LIVE pill */
  --dur-spin: .9s;     /* spinner turn */
  --dur-pulse: 1.4s;   /* skeleton pulse */
  --ease-out: cubic-bezier(.2, .8, .2, 1);    /* things arriving */
  --ease-in: cubic-bezier(.4, 0, 1, 1);       /* things leaving */
  --ease-in-out: cubic-bezier(.4, 0, .2, 1);  /* things moving in place */

  /* layout */
  --sidebar-w: 232px; --rail-w: 56px; --topbar-h: 56px;
}
```

Type usage: Inter at 400, 500 and 600 only (700 only inside the LIVE pill). Every number that can change (scores, money, counts, percentages) uses `font-variant-numeric: tabular-nums`. Timecodes, countdowns and keycaps use `--font-mono`.

---

## 6. Base styles

`src/styles/base.css`

```css
*, *::before, *::after { box-sizing: border-box; }
html { font: var(--text-body); color: var(--ink); background: var(--bg); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
body { margin: 0; }
:where(button, input, textarea, select) { font: inherit; color: inherit; }
:where(button) { cursor: pointer; }
:where(button:disabled) { cursor: default; }
:where(a) { color: inherit; }
:where(h1, h2, h3, p, dl, dd, ol, ul) { margin: 0; }

/* one focus ring everywhere; a white one on the video stage so no brand colour touches footage */
:focus-visible { outline: var(--focus-outline); outline-offset: 2px; box-shadow: var(--focus-halo); }
[data-surface="stage"] :focus-visible { outline: var(--focus-outline-stage); box-shadow: var(--focus-halo-stage); }

.hr-tnum { font-variant-numeric: tabular-nums; }
.hr-mono { font-family: var(--font-mono); }
.hr-sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

@keyframes hr-live { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, .75); } 70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
@keyframes hr-spin { to { transform: rotate(360deg); } }
@keyframes hr-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

---

## 7. Component inventory

Build every item. "States" lists what the gallery must show for it. Every interactive item also needs hover, focus-visible, active and disabled unless noted.

### Primitives

| Component | Spec | States and variants |
|---|---|---|
| **Button** | Reference code in section 8. Heights 32, 36, 44, 56. Icon 16 px (18 in xl). Optional trailing keycap. | Kinds: primary, secondary, ghost, dark, danger, stage. Sizes sm, md, lg, xl. With icon, with keycap, loading, disabled. Also renders as a link. |
| **IconButton** | Square 32, 36, 40 or 44. Radius `--r-control`, or round on the stage. Requires `aria-label`. Tooltip with the label and shortcut. | ghost, secondary, stage, accent (the rail's New clips button). |
| **Kbd** | Reference code. Mono 11.5 px, 20 px tall, radius 5. | Tones light, accent, ink, stage. Single key and combo ("⌘Z", "Space"). |
| **Chip** | 22 px tall, radius 6, 12 px / 600, optional 13 px icon with stroke 2.4. Padding 0 8, or 6 on the left when it has an icon. | neutral (`--sunk` / `--ink-2`), ink (`--ink` / white), ok, due, fail, accent (`--accent-tint` / `--ink`). |
| **ScoreBadge, BandBars** | Reference code. Strong 65 to 100, Maybe 40 to 64, Weak 0 to 39. | Three bands, number only, number with word, word only. |
| **LivePill** | Reference code. | Sizes 18, 20, 24. Labels "LIVE", "2 LIVE". Reduced motion: dot stays still. |
| **Avatar** | Circle with an initial, weight 600, font 43% of size. Sizes 20, 22, 26, 28, 34, 40. | Default, live (ring: 2 px gap in the parent's background, then 2 px `--live`). |
| **Thumb** | 9:16 image, `object-fit: cover`, background `--stage`. Radius 4 up to 27 px wide, 5 or 6 above. | Widths 27, 36, 48. Selected (ring: 2 px `--surface` gap, then 2 px `--ink`). Dim (opacity .6) for weak or skipped. With a ScoreBadge under it. Empty and loading. |
| **Meter** | Track `--line`, fill `--ink`, radius half the height. `role="progressbar"` with value attributes and a label. | Heights 5, 6, 8. Variants default, due (`--due` on `--due-track`), stage (white on `--stage-track`). Indeterminate. |
| **Card** | `--surface`, 1 px `--line`, radius 12, `--shadow-xs`. | Plain, with header, with divided rows, tinted (`--due-tint`, `--accent-tint`). |
| **Divider, SectionHeader** | SectionHeader: 14 px / 600 title plus optional 13 px `--ink-3` note on the same baseline. | With and without note, with a trailing action. |
| **Skeleton** | Block in `--line` with `hr-pulse` 1.4 s. `aria-hidden`. The region that is loading carries `role="status"` and a text label. | Text line, thumb, button, avatar, card. |
| **Spinner** | Lucide `loader-circle`, `hr-spin` .9 s linear. | 16, 20, 30 px. On light and on stage. |
| **Tooltip** | Base UI Tooltip. `--ink` background, white 12.5 px text, radius 6, shows label plus keycap. Delay 400 ms. | Top, bottom, right (for the rail). |
| **Logo** | Mark and wordmark from section 3. | Mark only, mark plus wordmark at 21 and 32 px, on light and on ink. |

### Form controls

| Component | Spec | States and variants |
|---|---|---|
| **Field** | Label above (13 px / 600), input 40 px tall (44 and 48 variants), radius 8, 1 px `--edge`, 14 px text, padding 0 12. Optional leading 16 px icon at left 11 in `--ink-3` (then padding-left 36). Optional trailing keycap. Help or error text below, 12.5 px. | Empty with placeholder, filled, focused, invalid (`--fail` border plus icon plus message), disabled, read-only. Types text, url, money. |
| **Textarea** | Same edge and radius, padding 10 12, 14.5 px / 1.5, no resize handle. Footer row for character count and checks. | Two lines (66 px), with count, with "#ad is in" check, invalid. |
| **Toggle** | Base UI Switch. 40×24, radius 12. On: `--ink` fill and border, white 18 px knob at left 18. Off: `--surface` fill, `--edge` border, `--edge` knob at left 2. | On, off, disabled, with label and description. |
| **Segmented** | Base UI Tabs or Radio Group depending on use. Track: padding 2, gap 2, radius 8, `--sunk`, 1 px `--line`. Item: 28 px tall, padding 0 11, radius 6, 13 px. Selected: `--surface`, `--ink`, 600, `--shadow-xs`. Others: transparent, `--ink-2`, 500. Arrow keys move, Home and End jump. | 3 and 4 items, with counts ("All 8", "Strong 4"), stage variant (track `--stage-2` with `--stage-edge` border, selected item `--stage-text` fill with `--stage` text). |
| **Checkbox** | Base UI Checkbox. 16 px, radius 4. Checked: `--ink` fill, white check with stroke 3. Unchecked: `--surface`, 1 px `--edge`. | Checked, unchecked, indeterminate, disabled, as a whole-row label. |
| **RadioCard** | Base UI Radio Group. Card radius 10, padding 12 14. Selected: `--accent-tint` fill, 1.5 px `--ink` border, radio dot drawn as an 18 px circle with a 5.5 px `--ink` border. Unselected: `--surface`, 1 px `--edge`. | Row of three (workflows), stacked pair (cap behaviour). |
| **Stepper** | Group 40 px tall, radius 8, 1 px `--edge`: minus button, a two-line readout (10.5 px label, 12.5 px mono value), plus button. Each button 34 px wide with its own `aria-label`. Holding repeats. | Start, End, with trailing keycap, at limit. |
| **Select / Menu** | Base UI Select and Menu. Trigger looks like a secondary button with `chevron-down`. Popup: `--surface`, radius 10, `--shadow-md`, items 32 px tall, selected item has a check and `--sunk` fill. | Stream picker, "Edit this workflow" menu, with separators and keycaps. |
| **DropZone** | 76 px tall, radius 10, 1.5 px dashed `--edge`, background `--bg`. Icon `file-video` 26 px, title 14 px / 600, hint 12.5 px, secondary button "Choose file". | Idle, drag-over (`--accent-tint` fill, solid `--ink` border), file chosen, wrong type. |

### Navigation and shell

| Component | Spec | States and variants |
|---|---|---|
| **AppShell** | Fixed window 1440×900 in the gallery; in the app it fills the window, minimum 1200×760. Sidebar or rail on the left, top bar, then content. macOS traffic lights are drawn only in the gallery mock. | With sidebar, with rail. |
| **Sidebar** | 232 px, `--side`, right border `--line`, padding 16 12 12. Logo row, "New clips" primary button (full width, plus icon, ⌘N), nav list, "Streams" list, then Settings and Shortcuts pinned to the bottom. | With counts and streams, bare (empty and loading states). |
| **NavItem** | 36 px tall, padding 0 10, radius 8, 14 px, icon 17 px. Default `--ink-2` / 500. Current: `--nav-selected` fill, `--ink`, 600, `aria-current="page"`. Trailing slot for a count, an accent badge, a LivePill or a keycap. | Default, hover (`--sunk`), current, with each trailing type. |
| **Rail** | 56 px, same colours. Items 40×40, radius 9, icon 19 px, tooltip on the right. Live item carries an 8 px `--live` dot. | Used on Review and Moments. |
| **TopBar** | 56 px, `--surface`, bottom border `--line`, title 17 px / 600. Slots: left (filters, pickers, note), right (progress, counts, actions). The DueChip and the help button sit at the far right on every screen. | With note, with segmented filter, with stream picker and primary action. |
| **DueChip** | 32 px tall, radius 8, `--due-tint` fill, `--due` text 13 px / 600, clock icon 15 px, mono time. Links to Home. Hidden when nothing is due. Under 5 minutes the time is announced politely once per minute to screen readers. | "1 link due 13:02", "2 links due 04:10", hidden. |
| **StreamRow** | Sidebar row: Avatar 22, name 13.5 px / 500, subtitle 12 px `--ink-3`, trailing count or LivePill. | Offline with count, live. |

### Clip and review pieces

| Component | Spec | States and variants |
|---|---|---|
| **StatCard** | Card padding 14 16. Label 12.5 px / 500 `--ink-3` with a 14 px icon. Value 26 px / 600 tabular. Note 12.5 px `--ink-3`, one line with ellipsis. | Default, due (tinted, value in mono and `--due`), zero ("None", "0", "$0"), not loaded. |
| **JobRow** | The rows of the Home "Needs you" list. Padding 14 16, gap 16: thumb or thumbs, a text block (chip, 15 px / 600 title, 13 px `--ink-2` meta), an optional right slot, then actions. | Submit link (`--accent-tint` fill, thumb ring, Countdown, primary lg "Paste post link" with ↵), Past submit window, Post, Review (with ThumbStrip). |
| **Countdown** | Clock icon 18 px, mono 26 px / 600 time in `--due`, due Meter under it, caption "left of the 30 min window". Ticks every second from a deadline timestamp. At zero it flips the row to Past submit window. | 13:02, under 5 min, under 1 min, expired. |
| **ThumbStrip** | Thumbs 36 px wide, gap 7, each with a ScoreBadge under it, hairline dividers between bands. | 8 clips in bands 4, 3, 1. |
| **QueueRow** | Padding 7 10 7 8, radius 10, gap 12. Thumb 36. Title 13.5 px (600 when current, 500 otherwise), then ScoreBadge and "Strong · Tomo · 24 s" in 12 px `--ink-2`. Current: `--accent-tint` fill, 1 px `--accent-edge` border, thumb ring. Rows are a listbox; J and K move. | Current, strong, maybe, weak (thumb dim), decided kept, decided skipped. |
| **ProgressPips** | One pill per clip, 6 px tall. Current 24 px wide `--ink`. To do 12 px with a 1.5 px `--edge` outline. Kept 12 px `--ink`. Skipped 12 px `--edge`. Text beside it: "Clip 1 of 8". | Start, mid-session, all decided. |
| **ScoreCard** | Card padding 16 18. Left: score at 56 px / 600 with a "Strong" badge under it. Right: "Why this score" label and the reason at 16 px. Then BandTrack, then signal chips (26 px tall, `--sunk`, value in 600), then the info line "AI guess, not a promise of views." | Strong, maybe, weak, unscored ("Not scored. Daily cap reached."). |
| **BandTrack** | Three segments with 3 px gaps: Weak 39% `--line`, Maybe 25% `--edge`, Strong the rest `--ink`. Marker 4×22 `--ink` with a 2.5 px `--accent` halo at left = score%. Labels under each segment in 11.5 px. | Any score. |
| **EarnBox** | `--sunk` box, radius 10: "≈ $15" at 20 px / 600, "at 10K views", then the pay terms in 11 px. | Per view, pool ("Pool campaign. No estimate."). |
| **CaptionEditor** | Label, Segmented for TikTok, Reels, Shorts, Textarea, footer with "62 characters", the "#ad is in" check in `--ok`, and "Same caption on all three". | Same on all, edited per platform, missing #ad (`--fail` with icon and "Add #ad before posting"). |
| **TrimRow** | "Trim" label, Start Stepper with I, End Stepper with O, length in mono at the right. | Default, shorter than the campaign minimum if one exists. |
| **DecisionBar** | Skip (secondary xl, keycap X, flex 1) and Keep (primary xl, keycap P, flex 1.5). Under it the note "After a decision the next unreviewed clip loads." and "⌘Z undo". | Default, Keep disabled with the `--fail` note "Keep is off until this clip renders.", both disabled while loading. |
| **Toast** | Reference code. `--ink` pill at bottom centre. | "Skipped." with Undo, "Kept." with Undo, plain message, stacked (newest replaces). |
| **ShortcutSheet** | Base UI Dialog. Scrim `--scrim`. Panel 960 px, radius 16, `--shadow-md`, padding 22 28 24. Three columns from the keymap: Clip review, Moments editor, Anywhere. Rows 34 px with a hairline. Opens with "?", closes with Esc, traps focus, returns focus on close. | Open. |
| **Banner** | Radius 12, padding 14 16, 20 px icon, title 15 px / 600, body 13.5 px, optional mono detail line, actions at the right. `role="alert"` for failures. | fail (`--fail-tint` fill, 1 px `--fail` border), due, neutral. |
| **EmptyState** | Centred: 56 px rounded square in `--sunk` with a 26 px icon, 24 px / 600 title, 15 px body up to 460 px wide, one primary and one secondary action, a row of three small hints. | Home empty, review queue clear. |

### Video stage and timeline

| Component | Spec | States and variants |
|---|---|---|
| **VideoStage** | Panel `--stage`, radius 16, `data-surface="stage"`. Top row: mono format note at the left ("9:16 · 1080 × 1920 · facecam top"), SafeZone button at the right. Then the 9:16 player (radius 10), then Transport. | Playing, paused, loading (spinner, "Loading clip 1 of 8", stage Meter), error (icon in a dark red circle, "This clip didn't render.", reason, mono detail, "Render again" and "Skip" stage buttons), queue clear (check icon, "Queue is clear.", counts). |
| **Player** | Wraps a `<video>` element; in the gallery it shows a still. Burned-in hook and captions are part of the footage, so the kit does not draw them, except in the gallery stills. | 9:16 at 387×688 (review), 191×340 (moments result), 174×310 (small preview). |
| **SafeZoneOverlay** | Absolutely positioned over the player, `pointer-events: none`. Three hatched zones from `SAFE_ZONES`: top bar, right rail, bottom block. Hatch: `repeating-linear-gradient(135deg, rgba(255,255,255,.26) 0 5px, rgba(0,0,0,.34) 5px 10px)`. Inner edges 1.5 px dashed white. Labels are white mono 10.5 px on black, radius 4. Z cycles TikTok, Reels, Shorts, off. | Off, TikTok, Reels, Shorts. |
| **Transport** | Round 44 px stage IconButton (play or pause), mono time "0:07.4 / 0:24.2", Scrubber, "Space" keycap. | Playing, paused. |
| **Scrubber** | `role="slider"`. Track 4 px `--stage-track`, played part `--stage-text`, 16 px white thumb with a 3 px `rgba(255,255,255,.22)` halo. Optional marker ticks with a label ("chat peak"). Arrow keys move 1 s, Shift plus arrow 5 s. | With and without markers, dragging. |
| **SourcePreview** | 16:9 source frame on the stage with two outlined regions: "Facecam" (solid 1.5 px white) and "Gameplay crop" (dashed 1.5 px white), the rest dimmed with `rgba(0,0,0,.5)`. Both regions can be dragged and resized; arrow keys nudge. | Facecam on top, at the bottom, off. |
| **FacecamLayout** | Stage Segmented: "On top", "At the bottom", "Off". | Three options. |
| **MomentList** | Card titled "Found 12 moments. 8 strong." with "10 selected". Rows 30 px: Checkbox, mono time, title, length, ScoreBadge. Current row has the `--accent-tint` fill. | Selected, unselected (text `--ink-3`), current. |
| **TimelineOverview** | Whole stream. Lanes on `--sunk`, radius 4: Moments (22 px), Audio (26 px, bars in `--audio`), Chat (26 px, bars in `--chat`). Ruler above in mono 10.5 px. Moment pins 6×22, radius 3: strong `--ink`, maybe `--edge`, unselected dashed outline, current 10×28 `--accent` with a 1.5 px `--ink` border. Clicking the overview moves the detail window. | 12 moments over 3:12:40. |
| **TimelineDetail** | Zoomed window (60 s). Lanes: Video filmstrip (28 px), Audio (32 px), Chat (32 px). Outside the in and out points a `rgba(255,255,255,.7)` veil. In and out handles: 3 px `--ink` line with a 12×30 `--accent` grip that has a 1.5 px `--ink` border. Playhead: 2 px `--ink` line with a 12×10 cap. Peak label in mono `--chat`. Handles and playhead are sliders with arrow-key steps of 0.1 s. | Idle, dragging in, dragging out, playhead moving. |
| **Lane bars** | Draw with one `<svg>` per lane, `preserveAspectRatio="none"`, one rect per bucket. Do not create one DOM node per bar. | Audio, chat. |

### Data display

| Component | Spec | States and variants |
|---|---|---|
| **Table** | Header row 40 px on `--bg`, 12.5 px / 600 `--ink-3`. Body rows 76 px with hairlines. Real `<table>` semantics. | The Live table. Row variants: live, offline, watching off (text `--ink-3`). |
| **ChannelCell** | Avatar 40 (live ring when live), name 15 px / 600, note 12.5 px `--ink-2`. | Live, offline. |
| **SettingsRow** | 60 px row inside a Card: title, note, status Chip, action. | Connected, needs sign-in (`--due` chip with icon), disconnected. |
| **CheckRow** | 46 px row: status icon, name, value, Chip. | OK, warning, failed, running (Spinner). |
| **SpendMeter** | Money Field "Daily spending cap" beside an 8 px Meter with "$1.20 used today" and "$3.80 left · resets at midnight". | Under cap, near cap (`--due`), at cap (`--fail` with "Scoring is paused."). |
| **StepList** | Numbered list for "What will happen": number in `--ink-3`, 14 px / 500 title, 12.5 px note, hairlines between. | Five steps. |
| **PayTerms** | Stream name with clip count, the rate in 14 px / 600, terms in 12.5 px, stage counts in 12 px `--ink-3`. | Per view, pool. |

---

## 8. Reference implementations

Follow these patterns for every other component: typed props, `forwardRef` where a ref is useful, variants through `data-` attributes, one CSS file per component, tokens only, no inline colours.

`src/ui/Kbd.tsx`

```tsx
import type { ReactNode } from 'react';
import './kbd.css';

export type KbdTone = 'light' | 'accent' | 'ink' | 'stage';

/** A keycap hint. Quiet by design. Inside a button it is hidden from screen readers; the button carries aria-keyshortcuts. */
export function Kbd({ children, tone = 'light', decorative = false }: { children: ReactNode; tone?: KbdTone; decorative?: boolean }) {
  return (
    <kbd className="hr-kbd" data-tone={tone} aria-hidden={decorative || undefined}>
      {children}
    </kbd>
  );
}
```

`src/ui/kbd.css`

```css
.hr-kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 5px;
  border-radius: var(--r-key); border: 1px solid var(--edge); background: var(--surface); color: var(--ink-2);
  font: 500 11.5px/1 var(--font-mono); white-space: nowrap; }
.hr-kbd[data-tone="accent"] { color: var(--ink); background: var(--on-accent-wash); border-color: var(--accent-edge); }
.hr-kbd[data-tone="ink"] { color: var(--on-ink); background: var(--on-ink-wash); border-color: var(--on-ink-edge); }
.hr-kbd[data-tone="stage"] { color: var(--stage-text); background: var(--stage-2); border-color: var(--stage-edge); }
```

`src/ui/Button.tsx`

```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Kbd, type KbdTone } from './Kbd';
import './button.css';

export type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger' | 'stage';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
  size?: ButtonSize;
  /** A lucide-react icon element, already sized by CSS. */
  icon?: ReactNode;
  /** Keycap shown after the label, for example "P" or "⌘N". */
  shortcut?: string;
  /** Machine form of the shortcut for assistive tech, for example "P" or "Meta+N". */
  ariaKeyShortcuts?: string;
  loading?: boolean;
}

const KBD_TONE: Record<ButtonKind, KbdTone> = { primary: 'accent', secondary: 'light', ghost: 'light', dark: 'ink', danger: 'light', stage: 'stage' };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { kind = 'secondary', size = 'md', icon, shortcut, ariaKeyShortcuts, loading = false, disabled, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={['hr-btn', className].filter(Boolean).join(' ')}
      data-kind={kind}
      data-size={size}
      data-loading={loading || undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-keyshortcuts={ariaKeyShortcuts ?? shortcut}
      {...rest}
    >
      {icon ? <span className="hr-btn__icon" aria-hidden="true">{icon}</span> : null}
      <span className="hr-btn__label">{children}</span>
      {shortcut ? <Kbd tone={KBD_TONE[kind]} decorative>{shortcut}</Kbd> : null}
    </button>
  );
});
```

`src/ui/button.css`

```css
.hr-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: var(--h-md); padding: 0 12px;
  border: 1px solid transparent; border-radius: var(--r-control); font: 500 14px/1 var(--font-ui); white-space: nowrap; text-decoration: none;
  transition: background-color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-press) var(--ease-out); }
.hr-btn:active:not(:disabled) { transform: translateY(1px); }
.hr-btn:disabled { opacity: .45; }
.hr-btn__icon { display: inline-flex; flex: none; }
.hr-btn__icon > svg { width: 16px; height: 16px; }

.hr-btn[data-size="sm"] { height: var(--h-sm); padding: 0 10px; font-size: 13px; }
.hr-btn[data-size="lg"] { height: var(--h-lg); padding: 0 16px; font-size: 15px; border-radius: var(--r-control-lg); }
.hr-btn[data-size="xl"] { height: var(--h-xl); padding: 0 20px; font-size: 17px; border-radius: var(--r-card); }
.hr-btn[data-size="xl"] .hr-btn__icon > svg { width: 18px; height: 18px; }

.hr-btn[data-kind="primary"] { background: var(--accent); color: var(--ink); border-color: var(--accent-edge); font-weight: 600;
  box-shadow: var(--shadow-primary); }
.hr-btn[data-kind="primary"]:hover:not(:disabled) { background: var(--accent-hover); }
.hr-btn[data-kind="primary"]:active:not(:disabled) { background: var(--accent-active); }

.hr-btn[data-kind="secondary"] { background: var(--surface); color: var(--ink); border-color: var(--edge); box-shadow: var(--shadow-xs); }
.hr-btn[data-kind="secondary"]:hover:not(:disabled) { background: var(--sunk); }

.hr-btn[data-kind="ghost"] { background: transparent; color: var(--ink-2); }
.hr-btn[data-kind="ghost"]:hover:not(:disabled) { background: var(--sunk); color: var(--ink); }

.hr-btn[data-kind="dark"] { background: var(--ink); color: var(--on-ink); border-color: var(--ink); font-weight: 600; }
.hr-btn[data-kind="dark"]:hover:not(:disabled) { background: var(--ink-2); border-color: var(--ink-2); }

.hr-btn[data-kind="danger"] { background: var(--surface); color: var(--fail); border-color: var(--fail); }
.hr-btn[data-kind="danger"]:hover:not(:disabled) { background: var(--fail-tint); }

.hr-btn[data-kind="stage"] { background: var(--stage-2); color: var(--stage-text); border-color: var(--stage-edge); }
.hr-btn[data-kind="stage"]:hover:not(:disabled) { background: var(--stage-track); }

.hr-btn[data-loading] .hr-btn__icon > svg { animation: hr-spin var(--dur-spin) linear infinite; }
```

`src/ui/ScoreBadge.tsx`

```tsx
import './score-badge.css';

export type Band = 'strong' | 'maybe' | 'weak';
export const BAND_LABEL: Record<Band, string> = { strong: 'Strong', maybe: 'Maybe', weak: 'Weak' };

/** Strong 65 to 100, Maybe 40 to 64, Weak 0 to 39. A score is an AI guess, so bands never use status colours. */
export function scoreBand(score: number): Band {
  return score >= 65 ? 'strong' : score >= 40 ? 'maybe' : 'weak';
}

const BARS: Record<Band, number> = { strong: 3, maybe: 2, weak: 1 };

export function BandBars({ band, size = 12 }: { band: Band; size?: number }) {
  const n = BARS[band];
  return (
    <svg className="hr-bars" width={size} height={Math.round((size * 11) / 12)} viewBox="0 0 12 11" fill="currentColor" aria-hidden="true">
      <rect x="0" y="7" width="3" height="4" rx=".8" />
      <rect x="4.5" y="3.5" width="3" height="7.5" rx=".8" opacity={n >= 2 ? 1 : 0.28} />
      <rect x="9" y="0" width="3" height="11" rx=".8" opacity={n >= 3 ? 1 : 0.28} />
    </svg>
  );
}

export function ScoreBadge({ score, showWord = false, showNumber = true }: { score: number; showWord?: boolean; showNumber?: boolean }) {
  const band = scoreBand(score);
  return (
    <span className="hr-score hr-tnum" data-band={band} aria-label={`Score ${score}, ${BAND_LABEL[band]}`}>
      <BandBars band={band} />
      {showNumber ? <span aria-hidden="true">{score}</span> : null}
      {showWord ? <span className="hr-score__word" aria-hidden="true">{BAND_LABEL[band]}</span> : null}
    </span>
  );
}
```

`src/ui/score-badge.css`

```css
.hr-score { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 7px 0 6px; border-radius: var(--r-chip);
  border: 1px solid var(--ink); font: 600 12px/1 var(--font-ui); white-space: nowrap; }
.hr-score__word { font-weight: 500; }
.hr-bars { flex: none; }
.hr-score[data-band="strong"] { background: var(--ink); color: var(--on-ink); }
.hr-score[data-band="maybe"] { background: var(--surface); color: var(--ink); border-color: var(--ink-2); }
.hr-score[data-band="weak"] { background: var(--sunk); color: var(--ink-2); border: 1px dashed var(--edge); }
```

`src/ui/LivePill.tsx`

```tsx
import './live-pill.css';

/** The only place --live is used besides the avatar ring and the rail dot. Never reuse this shape or colour for anything else. */
export function LivePill({ label = 'LIVE', size = 20 }: { label?: string; size?: 18 | 20 | 24 }) {
  return (
    <span className="hr-live" data-size={size}>
      <span className="hr-live__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
```

`src/ui/live-pill.css`

```css
.hr-live { display: inline-flex; align-items: center; gap: 6px; height: 20px; padding: 0 7px 0 6px; border-radius: var(--r-chip);
  background: var(--live); color: var(--on-ink); font: 700 10.5px/1 var(--font-ui); letter-spacing: .07em; white-space: nowrap; }
.hr-live[data-size="18"] { height: 18px; padding: 0 6px 0 5px; border-radius: var(--r-key); }
.hr-live[data-size="24"] { height: 24px; padding: 0 9px 0 7px; font-size: 12px; }
.hr-live__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--on-ink); animation: hr-live var(--dur-live) ease-out infinite; }
```

`src/ui/Toast.tsx`

```tsx
import { useEffect, useRef } from 'react';
import { Kbd } from './Kbd';
import './toast.css';

export interface ToastProps {
  message: string;            // "Skipped."
  actionLabel?: string;       // "Undo"
  actionShortcut?: string;    // "⌘Z"
  onAction?: () => void;
  onDismiss: () => void;
  /** Auto dismiss delay. The timer pauses while the toast is hovered or holds focus. */
  durationMs?: number;
}

export function Toast({ message, actionLabel, actionShortcut, onAction, onDismiss, durationMs = 5000 }: ToastProps) {
  const paused = useRef(false);
  const remaining = useRef(durationMs);

  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      if (!paused.current) remaining.current -= now - last;
      last = now;
      if (remaining.current <= 0) onDismiss();
    }, 100);
    return () => window.clearInterval(id);
  }, [onDismiss]);

  const hold = (v: boolean) => () => { paused.current = v; };

  return (
    <div className="hr-toast" role="status" aria-live="polite" onMouseEnter={hold(true)} onMouseLeave={hold(false)} onFocus={hold(true)} onBlur={hold(false)}>
      <span>{message}</span>
      {actionLabel && onAction ? (
        <button type="button" className="hr-toast__action" onClick={onAction} aria-keyshortcuts={actionShortcut === '⌘Z' ? 'Meta+Z' : undefined}>
          {actionLabel}
          {actionShortcut ? <Kbd tone="ink" decorative>{actionShortcut}</Kbd> : null}
        </button>
      ) : null}
    </div>
  );
}
```

`src/ui/toast.css`

```css
.hr-toast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 50; display: flex; align-items: center; gap: 14px;
  height: 48px; padding: 0 8px 0 16px; border-radius: var(--r-card); background: var(--ink); color: var(--on-ink); box-shadow: var(--shadow-md);
  font: 500 14px/1 var(--font-ui); animation: hr-toast-in var(--dur-base) var(--ease-out); }
.hr-toast__action { display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 8px 0 12px; border-radius: var(--r-control);
  border: 1px solid var(--on-ink-edge); background: transparent; color: var(--on-ink); font: 600 14px/1 var(--font-ui); }
.hr-toast__action:hover { background: var(--on-ink-wash); }
.hr-toast :focus-visible { outline: 2px solid var(--on-ink); box-shadow: var(--focus-halo); }
@keyframes hr-toast-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
```

These files typecheck under `strict` with `jsx: react-jsx`. Adjust import paths to your structure.

---

## 9. Fixtures and keymap

`src/data/fixtures.ts`

```ts
// Real content from the design. Do not replace with lorem ipsum. Items marked placeholder were invented for the mockups.

export type Platform = 'tiktok' | 'reels' | 'shorts';
export type ClipStage = 'review' | 'kept' | 'posted' | 'past-window' | 'submitted';

export type Pay =
  | { kind: 'per-view'; per1k: number; min: number; max: number }
  | { kind: 'pool'; pool: number };

export interface Stream { id: string; channel: string; title: string; pay: Pay; live: boolean }
export interface Clip { id: string; streamId: string; title: string; score: number; seconds: number; stage: ClipStage; placeholder?: boolean }

export const STREAMS: Stream[] = [
  { id: 'tomo', channel: 'Tomo', title: 'GTA VI launch night', pay: { kind: 'per-view', per1k: 1.5, min: 3.5, max: 150 }, live: false },
  { id: 'lacy', channel: 'Lacy', title: 'Live 19:40', pay: { kind: 'pool', pool: 12500 }, live: true },
  { id: 'dom', channel: 'Dom', title: 'Heist practice', pay: { kind: 'per-view', per1k: 1, min: 10, max: 100 }, live: false },
];

/** Channels being watched. Clix and Lacy are live right now. */
export const WATCHED = [
  { channel: 'Clix', live: true, note: 'Watching', nextCheck: '0:40', workflow: null },
  { channel: 'Lacy', live: true, note: 'Rendering clips', renderPct: 41, workflow: 'Lacy pool' },
  { channel: 'Tomo', live: false, note: 'Offline', workflow: 'Tomo launch night' },
  { channel: 'Dom', live: false, note: 'Not watching', workflow: 'Dom heist practice' },
] as const;

export const CLIPS: Clip[] = [
  { id: 'c1', streamId: 'tomo', title: 'He did not see that coming', score: 91, seconds: 24, stage: 'review' },
  { id: 'c2', streamId: 'tomo', title: 'The cops gave up', score: 84, seconds: 26, stage: 'review' },
  { id: 'c3', streamId: 'tomo', title: 'Chat called it', score: 72, seconds: 23, stage: 'review' },
  { id: 'c4', streamId: 'tomo', title: 'Wait for it', score: 66, seconds: 25, stage: 'review' },
  { id: 'c5', streamId: 'dom', title: 'Bro panicked', score: 63, seconds: 22, stage: 'review' },
  { id: 'c6', streamId: 'dom', title: 'No way', score: 58, seconds: 24, stage: 'review' },
  { id: 'c7', streamId: 'tomo', title: 'Talking about the map size', score: 47, seconds: 26, stage: 'review' },
  { id: 'c8', streamId: 'tomo', title: 'Slow drive across the bay', score: 22, seconds: 25, stage: 'review' },
  { id: 'c9', streamId: 'tomo', title: 'Missed the jump', score: 78, seconds: 25, stage: 'kept', placeholder: true },
  { id: 'c10', streamId: 'dom', title: 'Wrong boat', score: 69, seconds: 22, stage: 'kept', placeholder: true },
  { id: 'c11', streamId: 'tomo', title: 'Ran out of road', score: 81, seconds: 24, stage: 'posted', placeholder: true },
  { id: 'c12', streamId: 'dom', title: 'The long way round', score: 70, seconds: 23, stage: 'past-window', placeholder: true },
  { id: 'c13', streamId: 'tomo', title: 'Clean landing', score: 88, seconds: 25, stage: 'submitted', placeholder: true },
  { id: 'c14', streamId: 'tomo', title: 'Chat picked the car', score: 76, seconds: 23, stage: 'submitted', placeholder: true },
];

/** The clip shown in Clip review. */
export const FEATURED = {
  clipId: 'c1',
  reason: 'Chat jumps 6× in four seconds and his face reacts inside the first 3 s.',
  signals: { chat: '6×', reactionAt: '1.2 s', peakAt: '1:27:16', captionWordsFixed: 2 },
  hook: 'He did not see that coming',
  caption: 'HE DID NOT SEE THAT COMING. Tomo in GTA 6 #ad #gta6 #tomo #fyp',
  start: '1:27:09.2', end: '1:27:33.4', length: '24.2 s',
  scoreNote: 'AI guess, not a promise of views.',
};

export const HOME_COUNTS = { toReview: 8, strong: 4, maybe: 3, weak: 1, kept: 2, postedDue: 1, minutesLeft: 13, pastWindow: 1, submitted: 2, renderingPct: 41, submitWindowMin: 30 };

/** Estimate shown only where the campaign pays per view. Pool campaigns return null. */
export function estimateAt10k(pay: Pay): number | null {
  if (pay.kind === 'pool') return null;
  return Math.min(pay.max, Math.max(pay.min, pay.per1k * 10));
}

export function formatEstimate(pay: Pay): string | null {
  const v = estimateAt10k(pay);
  return v === null ? null : `≈ $${Number.isInteger(v) ? v : v.toFixed(2)} at 10K views`;
}

/** Safe zone overlays, as percentages of the 9:16 frame. Approximate: verify against each platform's current guidance before shipping. */
export const SAFE_ZONES: Record<Platform, { top: number; bottom: number; railWidth: number; railTop: number; topLabel: string; bottomLabel: string }> = {
  tiktok: { top: 10, bottom: 21, railWidth: 14, railTop: 40, topLabel: 'TikTok · top tabs', bottomLabel: 'Name, caption, sound' },
  reels: { top: 12, bottom: 26, railWidth: 13, railTop: 46, topLabel: 'Reels · top bar', bottomLabel: 'Name, caption, audio' },
  shorts: { top: 9, bottom: 24, railWidth: 15, railTop: 42, topLabel: 'Shorts · top bar', bottomLabel: 'Channel, title, subscribe' },
};
```

`src/data/keymap.ts`

```ts
// Every key in hemreel. The "?" sheet renders from this list, so the sheet can never drift from the real bindings.
// source: 'brief' keys are fixed requirements. 'proposed' keys were added during design and may change.

export type KeyScope = 'review' | 'moments' | 'global';
export interface KeyBinding { id: string; scope: KeyScope; keys: string; aria: string; label: string; source: 'brief' | 'proposed' }

export const KEYMAP: KeyBinding[] = [
  { id: 'review.keep', scope: 'review', keys: 'P', aria: 'P', label: 'Keep the clip', source: 'brief' },
  { id: 'review.skip', scope: 'review', keys: 'X', aria: 'X', label: 'Skip the clip', source: 'brief' },
  { id: 'review.next', scope: 'review', keys: 'J', aria: 'J', label: 'Next clip', source: 'brief' },
  { id: 'review.prev', scope: 'review', keys: 'K', aria: 'K', label: 'Previous clip', source: 'brief' },
  { id: 'review.play', scope: 'review', keys: 'Space', aria: 'Space', label: 'Play or pause', source: 'brief' },
  { id: 'review.zone', scope: 'review', keys: 'Z', aria: 'Z', label: 'Cycle the safe zone overlay', source: 'brief' },
  { id: 'review.hook', scope: 'review', keys: 'E', aria: 'E', label: 'Edit the hook text', source: 'proposed' },
  { id: 'review.caption', scope: 'review', keys: 'C', aria: 'C', label: 'Edit the caption', source: 'proposed' },
  { id: 'review.in', scope: 'review', keys: 'I', aria: 'I', label: 'Set start at the playhead', source: 'proposed' },
  { id: 'review.out', scope: 'review', keys: 'O', aria: 'O', label: 'Set end at the playhead', source: 'proposed' },
  { id: 'review.undo', scope: 'review', keys: '⌘Z', aria: 'Meta+Z', label: 'Undo the last decision', source: 'proposed' },
  { id: 'moments.play', scope: 'moments', keys: 'Space', aria: 'Space', label: 'Play or pause', source: 'proposed' },
  { id: 'moments.add', scope: 'moments', keys: 'M', aria: 'M', label: 'Add a moment at the playhead', source: 'proposed' },
  { id: 'moments.in', scope: 'moments', keys: 'I', aria: 'I', label: 'Set in point', source: 'proposed' },
  { id: 'moments.out', scope: 'moments', keys: 'O', aria: 'O', label: 'Set out point', source: 'proposed' },
  { id: 'moments.nudge', scope: 'moments', keys: '← →', aria: 'ArrowLeft ArrowRight', label: 'Move the playhead one second', source: 'proposed' },
  { id: 'moments.remove', scope: 'moments', keys: '⌫', aria: 'Backspace', label: 'Remove the selected moment', source: 'proposed' },
  { id: 'moments.render', scope: 'moments', keys: '↵', aria: 'Enter', label: 'Render the selected moments', source: 'proposed' },
  { id: 'global.new', scope: 'global', keys: '⌘N', aria: 'Meta+N', label: 'New clips', source: 'proposed' },
  { id: 'global.goto', scope: 'global', keys: '⌘1 to ⌘4', aria: 'Meta+1 Meta+2 Meta+3 Meta+4', label: 'Home, Review, Moments, Live', source: 'proposed' },
  { id: 'global.settings', scope: 'global', keys: '⌘,', aria: 'Meta+Comma', label: 'Settings', source: 'proposed' },
  { id: 'global.default', scope: 'global', keys: '↵', aria: 'Enter', label: 'Do the highlighted action', source: 'proposed' },
  { id: 'global.back', scope: 'global', keys: 'Esc', aria: 'Escape', label: 'Close or go back', source: 'proposed' },
  { id: 'global.help', scope: 'global', keys: '?', aria: 'Shift+Slash', label: 'Show this sheet', source: 'brief' },
];

/** Single-letter keys must not fire while the user is typing in a field. */
export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
}
```

Hotkey rules for `useHotkeys`:

- One listener on `window`, scoped by the current screen.
- Single-letter keys never fire while `isTypingTarget` is true, while a dialog is open, or with a modifier held.
- Esc inside a field blurs it first. A second Esc goes back.
- After Keep or Skip: mark the clip, show the toast, move to the next unreviewed clip, and move focus to the new current QueueRow. ⌘Z restores the clip and returns to it.

Footage stills: there is no real footage in the repo. Draw neutral stand-in stills as local SVG files (a facecam area on the top 36.7% of a 9:16 frame, gameplay below, muted greys and blues, no logos, no real people, nothing resembling a specific game). Make at least six variants so lists do not look cloned, plus one 16:9 source frame with a facecam inset in the bottom-left corner.

---

## 10. Gallery routes and screen compositions

Gallery:

- `/` index with links to everything.
- `/foundations`: colour swatches with name, variable, hex, use and the measured ratio; the type scale; space; radii; shadows; focus ring; motion with a "play" button per duration; control heights.
- `/components`: every component from section 7, each with every listed state, each state labelled. Interactive ones are live. Include a toggle that forces `prefers-reduced-motion`.

Screens, each rendered inside a 1440×900 mock window (traffic lights, radius 12) and built only from kit components:

1. `/home`. Sidebar. Top bar "Home" with the note "Wed 18 Nov · 3 streams · 14 clips". Left column: four StatCards (Link due 13:02, To post 2, To review 8 with "4 strong · 3 maybe · 1 weak", Could earn "≈ $60" with "4 strong at 10K views each. A guess."), then "Needs you" with the note "4 jobs, most urgent first" and four JobRows in this order: Submit link ("Ran out of road", posted to TikTok 17 min ago, 13:02 left), Past submit window ("The long way round", closed 11 min ago, actions "Submit late" and "Dismiss"), Post ("2 kept clips, ready to post", "≈ $25 at 10K views each", "Post 2 clips"), Review ("8 clips to review. 4 strong.", ThumbStrip, "Start review"). Then "Running without you": Lacy rendering 41% with a LivePill, and "2 links submitted · in time". Right column 320 px: "Live now" (Clix watching, next check 0:40; Lacy rendering 41%) and "What each stream pays" (three PayTerms).
2. `/review`. Rail. Top bar "Review" with the band filter (All 8, Strong 4, Maybe 3, Weak 1), ProgressPips, "0 kept · 0 skipped". Three columns: queue 296 px, VideoStage column 536 px, details filling the rest (stream line, 24 px title, mono "24.2 s · 1:27:09 to 1:27:33", EarnBox, ScoreCard, hook Field with E, CaptionEditor, TrimRow, DecisionBar). All keys from the keymap work.
3. `/moments`. Rail. Top bar "Moments" with the stream picker, "3:12:40 · workflow: Tomo launch night", "10 of 12 selected · ≈ 4 min of clips", primary "Render 10 clips" with ↵. Upper area 500 px: stage panel 884 px wide (SourcePreview 604×340, arrow, result Player 191×340, play button, FacecamLayout) and the MomentList. Lower area: timeline toolbar (mono timecode, moment title, In and Out with I and O, length, "Add moment at playhead" with M), TimelineOverview, TimelineDetail.
4. `/new`. Sidebar with New clips shown as current (dark button). Step 1 "Source": link Field with a detected-source row ("Dom · Heist practice", "Twitch VOD · 2:04:11 · chat replay found", ok Chip "Link works"), an "or" divider, DropZone, and a link to Live. Step 2 "Workflow": three RadioCards (Tomo launch night, Lacy pool, Dom heist practice selected), each with pay terms and "Facecam on top · captions burned in / TikTok, Reels, Shorts · #ad added". Right column 372 px: "What will happen" StepList, Pays line, AI scoring line, primary xl "Find moments" with ↵, and the note "Nothing is posted until you keep a clip."
5. `/live`. Sidebar. Heading "2 channels are live" with a LivePill, an add-channel Field and "Watch channel". Table columns: Channel, Status, Last check, Next check, Workflow, Tonight, Watch. Rows: Clix (live, no workflow yet with a `--due` warning and "Choose"), Lacy (live, rendering 41%), Tomo (offline, 10 clips), Dom (offline, watching off). Two explainer cards under the table.
6. `/settings`. Sidebar. Left column: Posting accounts (TikTok, Instagram Reels, YouTube Shorts as SettingsRows, plus a default hashtags Field "#ad #fyp") and System checks (five CheckRows, "Run again"). Right column: AI scoring (Toggle, SpendMeter, "When the cap is reached" RadioCards, Score bands legend).

States:

- `/home/empty`: StatCards at zero, EmptyState "Nothing needs you yet." with "New clips" (⌘N) and "Watch a channel", bare sidebar, DueChip hidden.
- `/home/loading`: skeleton StatCards and rows, status line "Loading tonight's clips" with a Spinner.
- `/home/error`: fail Banner "Couldn't load your clips." with "Try again" and "Run system checks", StatCards showing "Not loaded", a quiet placeholder where the list would be. The DueChip stays visible, because the submit window keeps running.
- `/review/empty`: queue shows decided rows, stage shows "Queue is clear.", details show "6 kept. 2 skipped.", "≈ $80 at 10K views each" (4 Tomo × ≈ $15, 2 Dom × ≈ $10), "8 kept clips are ready to post", actions "Back to Home" and "Post 8 kept clips". The toast "Skipped." with Undo and ⌘Z is visible.
- `/review/loading`: stage loading state, skeleton details, DecisionBar disabled.
- `/review/error`: stage error state, DecisionBar with Keep disabled and the `--fail` note.
- `/review/keys`: review with the ShortcutSheet open.

---

## 11. Accessibility and quality gates

- Real elements: `<button>`, `<a href>`, `<input>` with `<label>`, `<table>`, headings in order. No click handlers on divs.
- Every icon-only control has an `aria-label`. Decorative SVG is `aria-hidden`.
- Focus is always visible and never trapped except inside the dialog. Focus order follows reading order.
- Status is never colour alone: each status chip, banner and row has an icon or a word.
- Live regions: toast `role="status"`, failures `role="alert"`, loading regions `role="status"` with text.
- `prefers-reduced-motion`: slides become cuts, the LIVE dot and skeletons stop moving.
- Works at 200% zoom without clipped controls at a 1440×900 window.
- Tests to write at minimum: Button fires once and exposes `aria-keyshortcuts`; Segmented arrow keys; Toggle; Checkbox; RadioCard group; Stepper limits and hold-repeat; Countdown expiry; Toast auto-dismiss, pause on hover and Undo; ShortcutSheet focus trap and Esc; Review flow (P, X, J, K, Space, Z, ⌘Z, letters ignored while typing); `scoreBand` boundaries at 39, 40, 64, 65; `estimateAt10k` for both pay kinds including the min and max clamps.

---

## 12. Order of work

1. Inspect the repo, scaffold if needed, install and verify packages, add fonts.
2. Tokens, base styles, the two check scripts, lint and test setup.
3. Primitives, then form controls, then shell, then clip pieces, then stage and timeline, then data display. Add each to `/components` as you finish it.
4. `/foundations`.
5. The six screens, then the seven state routes.
6. Hotkeys and the review flow.
7. Tests and the accessibility run.
8. Screenshots of every route. Look at them. Fix spacing, overflow, truncation and contrast problems you can see. Repeat until clean.
9. Write `README.md` (how to run, how to add a component, the rules from section 3 in short) and `THIRD_PARTY_NOTICES.md`.

Final report: what was built, what you could not verify, every entry in `docs/decisions.md`, and anything from section 13 that still needs an answer.

---

## 13. Known gaps. Do not invent answers for these

- Six clips in the fixtures are marked `placeholder: true`. Their titles and scores were made up for the mockups.
- Safe zone percentages are approximate.
- Keymap entries with `source: 'proposed'` are suggestions.
- The $5.00 daily cap, "$1.20 used today", the 60 s and 5 min check intervals, the 5 s toast duration and the error detail strings are placeholders.
- Posting account handles and free disk space are shown as `[YOUR HANDLE]` and `[FREE SPACE]`.
- The app shell technology (Tauri, Electron or other) is not decided here. Keep the kit free of any desktop runtime API.
- Dark mode is out of scope. Keep every colour in tokens so a second theme can be added later.
