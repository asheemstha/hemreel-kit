# hemreel UI kit

The visual and interaction layer for hemreel: design tokens, every component in every state, and the product screens and flows built only from the kit. Everything renders from fixtures. There is no video processing and there are no network calls.

**What is still missing for the whole product is listed in `docs/ui-coverage.md`.** The kit covers the brief's six screens, the general building blocks (dialogs, menus, inputs, pickers, cards, lists) and the money path (find, render, post, paste the link, submit, history). It does not cover the whole app yet.

The spec is `docs/brief.md`. Every place this kit departs from it, and why, is in `docs/decisions.md`.

## Run it

```bash
npm install
```

```bash
npm run dev
```

This opens http://localhost:5180:

- `/` is the index.
- `/foundations` shows the colours, type, spacing, radii, shadows, focus ring, motion and control heights.
- `/components` shows every component and state. Use the "Reduce motion" switch at the top right to check reduced motion. Press ⌘K there, or on any screen, for the command palette.
- `/home`, `/review`, `/moments`, `/new`, `/live` and `/settings` are the brief's six screens.
- `/clips` (every clip by where it is in the job), `/history` (every post and its link) and `/render` (the render queue) came with the money path.
- `/home/empty`, `/home/loading`, `/home/error`, `/review/empty`, `/review/loading`, `/review/error` and `/review/keys` are the states.
- The money path has a route for each state. The index page lists them all:
  - Find: `/new/finding`, `/new/failed`, `/new/done`.
  - Render: `/render`, `/render/done`, `/render/empty`.
  - Post: `/home/post`, `/home/post-all`, `/home/posting`, `/home/post-failed`.
  - Link and submit: `/home/link`, `/home/submit`, `/home/late`, `/home/dismiss`.
  - Clips and History: `/clips/kept`, `/clips/posted`, `/clips/submitted`, and `empty`, `loading` and `error` under both `/clips` and `/history`.

The screens share one night of clips, so the path works end to end: find moments on New clips, render them from Moments, keep clips in Review, post them from Home, hand in the link, and see it in Clips and History. Reload to start the night again.

Add `?freeze` to any route to stop the countdowns and the simulated jobs (finding, rendering, uploading).

| Command | What it proves |
|---|---|
| `npm run typecheck` | Strict TypeScript, for the app and for the test and config files |
| `npm run lint` | oxlint with React, TypeScript and jsx-a11y rules; warnings fail |
| `npm run test` | Vitest and Testing Library: components, review flow, `scoreBand`, `estimateAt10k` |
| `npm run test:a11y` | Playwright and axe on every route and on each open overlay, keyboard checks, and a check for clipped text |
| `npm run check:tokens` | No raw colour, radius, shadow or duration outside `src/styles/tokens.css` |
| `npm run check:contrast` | Text pairs reach 4.5:1 and edges 3:1; token comments match the computed ratios |
| `npm run screenshots` | 1440×900 shots of every route in `screenshots/` |

The Playwright commands build the app and serve it on port 5181.

## Add a component

1. Create `src/ui/Name.tsx` and `src/ui/name.css`.
   - Use typed props, and `forwardRef` when a ref is useful.
   - Use class names that start with `hr-`.
   - Express variants as `data-` attributes.
2. Use tokens only. If a value is missing, add a token to `src/styles/tokens.css` with a comment, and add any text or edge pair to `scripts/check-contrast.mjs`.
3. Start the doc comment with what the component is for, then a `Layout:` line that says whether it hugs or fills, and what it needs from its parent (see the table below).
4. Export it from `src/ui/index.ts`.
5. Add every state to a section in `src/gallery/sections/`, with each state labelled. Add its id to the list in `src/gallery/Components.tsx`.
6. Write a behaviour test in `tests/` if it is interactive.

For accessible behaviour, use Base UI (`@base-ui/react`) for dialog, menu, select, tabs, switch, radio, checkbox and tooltip. Style every part yourself.

Shared pieces to build on:

- **A new input:** wrap it in `FieldFrame` (from `Field.tsx`) for the label, help and error, and take its ids from `useFieldIds`. Put buttons that belong inside a text field in `Field`'s `trailing`.
- **Something that pops up:** `Popover` for a small panel, `Menu` or `ContextMenu` for actions, `Dialog` for a question, `ConfirmDialog` before anything is deleted, `Drawer` for a side panel. Use the `--z-*` tokens, never a raw `z-index`.
- **A list people select from:** `useSelection` holds the chosen ids; `BulkBar` shows what can be done to them.

## Clips, flows and states

- **The clip store** (`src/state/clips.ts`) holds tonight's clips and what has happened to each: kept or skipped, uploading, posted, submitted. Read it with `useClips()`, `useSummary()` or `useDue()`, and change it through `useClipStore()` (`decide`, `startPost`, `addLink`, `submit`, `dismiss`). No provider is needed.
- **A designed state** gets a store of its own: pass `scenario` to `ScreenFrame` (`'posting'`, `'post-failed'`, `'linked'`, `'review-done'`, `'empty'`). A state route then never changes what the other screens show.
- **Flows** (`src/flows/`) are dialogs used by more than one screen: `PostDialog`, `SubmitLinkDialog`, `DismissDialog`. They take an id and read the store. `UploadRunner` stands in for the posting service.
- **Simulated jobs** stand still while the clock is frozen (`useFrozen()`), so screenshots always show the designed moment.
- **A new state** is a new route in `src/gallery/routes.tsx` and in `tests/routes.ts`. The browser checks and the screenshots then cover it.

## Rules (short form of brief section 3, as changed by the owner)

- **The look is Blend with marker yellow.** The page is near-white. Cards are white with a soft shadow. Buttons and segmented controls are pills, fields are filled, and the sidebar and top bar have no dividers.
- **No solid borders, nothing embossed.** Separate things with fill, shadow and space. Dashed outlines are only for meaning: the Weak score band, unselected timeline pins and the drop zone.
- **No monospace font.** Numbers that change use Inter with `tabular-nums` (the `.hr-tnum` class).
- **One icon weight.** Lucide icons are drawn at 1.4 px at every size. Don't set `stroke-width` per component.
- **The video is the hero.** Footage sits on `--stage`, with neutral controls and a white focus ring. No brand colour touches it.
- **Scores read as guesses.** Show the band and the number, plus "AI guess, not a promise of views." Never use status colours for scores.
- **Status colour only means status, and always comes with an icon or a word.** `--live` is only for the LIVE pill, the live avatar ring and the rail dot.
- **Selection is never a stripe on one side.** Use a fill, a ring around the thumbnail, a chip or a dot.
- **Yellow is for the one primary action per screen** and for selection tint. It is never text on a light background.
- **Keyboard first.** Inline keycaps only appear on Keep, Skip, a screen's main action and Undo. Every key is in `src/data/keymap.ts`, and the ? sheet renders from that file.
- **Earnings estimates only for per-view campaigns.** Pool campaigns show none.
- **Voice is calm and numbers-first.** Sentence case, no emoji and no em dashes. Only the LIVE pill is in capitals.

## Layout contract

| Hugs its content (never wider than the parent) | Fills the parent's width | Needs something from its parent |
|---|---|---|
| Button (`block` fills), Segmented, Chip, ScoreBadge, Kbd, LivePill, DueChip, ProgressPips, Toggle, Stepper, Select, NumberField (`block` fills), ColorField, FontPicker, DatePicker, CopyButton, Tabs (the tab row), Breadcrumb, Pagination, BulkBar | Field, Textarea, Meter, Card, Banner, DropZone, StatCard, ScoreCard, CaptionEditor, JobList, Table, TopBar, VideoStage, TimelineOverview, TimelineDetail, Slider, TimecodeField, SecretField, SearchField, FileField, TagInput, TemplateField, Accordion, PipelineSteps, InlineEdit, ClipGrid, LogViewer | **SafeZoneOverlay:** a `position: relative` parent sized to the frame (Player does this).<br>**MomentList and QueueList:** a parent with a definite height, if they should scroll.<br>**AppShell `fill`:** a sized parent.<br>**Thumb (selected) and Avatar (live):** 4 px of room, with no `overflow: hidden` on the parent.<br>**Meter:** a parent with a width.<br>**Tooltip and Popover:** one focusable child or trigger that accepts a ref.<br>**ContextMenu:** pass `asChild` inside tables and lists, and keep something focusable inside the target.<br>**ClipCard:** a `ClipGrid` (or any grid) that gives it at least 168 px.<br>**Dialog, ConfirmDialog, Drawer, CommandPalette, BulkBar, Toast:** nothing. They portal or fix themselves to the window. |

Each component's own doc comment has the details.

## Structure

```
src/styles/   tokens.css (the only file with raw values), base.css, fonts.css, timing.ts
src/ui/       one Name.tsx + name.css per component, index.ts
src/data/     fixtures.ts, posts.ts, postLinks.ts, runs.ts, history.ts, words.ts, keymap.ts, timeline.ts, deadlines.ts, stills.ts, captionStyle.ts
src/state/    clips.ts (the clip store)
src/flows/    PostDialog, SubmitLinkDialog, DismissDialog, UploadRunner
src/hooks/    useHotkeys.ts, useCountdown.ts, useSelection.ts, clock.tsx
src/gallery/  App, Index, Foundations, Components, routes, sections/
src/screens/  Home, Review, Moments, NewClips, Finding, RenderQueue, Clips, History, Live, Settings, Frame
scripts/      check-tokens.mjs, check-contrast.mjs
tests/        Vitest *.test.tsx, Playwright *.spec.ts
```

Licences are in `THIRD_PARTY_NOTICES.md`.
