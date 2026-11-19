# Decisions

Choices made while building the kit. The brief (`docs/brief.md`) says to pick the option that fits its rules and write it down. Entries D9 onward record changes the owner asked for after seeing the first build.

## Setup

**D1. The kit lives in `kit/`, a new app next to `web/`.** The brief says to add the kit under the existing app's `src/ui/`. But `web/src/ui/` already holds a different, uncommitted kit (the dark "Marker" rebuild) that the live app imports. Overwriting it could not be undone. `kit/` follows the same tooling: npm, Vite, React 19, strict TypeScript and oxlint. The real app can move onto it screen by screen.

**D2. Linting uses oxlint, with the jsx-a11y plugin turned on.** It matches `web/`, and `npm run lint` runs it with `--deny-warnings`. `jsx-a11y/prefer-tag-over-role` is off, because listbox, option, progressbar and status are ARIA widget roles with no native tag.

**D3. Tokens added beyond the brief's file:**
- `--r-xs` (3 px), `--r-sm` (4 px) and `--r-rail` (9 px), for radii the spec gives in pixels;
- ring shadows built from tokens;
- the stage overlay colours: `--stage-dim`, `--zone-light`, `--zone-dark`, `--stage-label-bg`, `--veil`, and `--stage-fail-bg` / `--stage-fail-fg` (8.04:1);
- the semantic surface tokens described in D9.

JavaScript timings live in `src/styles/timing.ts`.

**D4. Rules for `check:tokens`:**
- No raw colour, radius, shadow or duration outside `tokens.css`.
- `base.css` may hold raw values inside `@keyframes` only.
- Ring shadows are allowed when every colour comes from a token.
- `50%` is allowed as a radius for drawing a circle.
- Footage stills in `src/assets/` are pictures, not components, so they are skipped.

**D5. The contrast script checks the default theme only** (the first `:root` block). It also fails when a ratio written in a token comment drifts from the computed one.

**D6. Playwright uses its own Chromium when installed.** Otherwise it falls back to `PW_CHROMIUM_PATH` or any Chromium already in Playwright's cache, so the checks run offline. Set `PW_USE_BUNDLED=1` to force the bundled browser.

**D7. Countdowns can be frozen.** Fixture deadlines are set relative to page load. `?freeze` on any route stops every countdown, so screenshots always show 13:02.

**D8. Footage stand-ins.** Seven 9:16 stills and one 16:9 source frame are drawn as SVG. They show abstract shapes: no people, no logos, nothing from a real game. Only stills 1, 3 and 5 carry burned-in hooks, and they match clips c1, c2 and c3.

## Look (owner feedback, 18 Nov 2026)

**D9. Blend direction with marker yellow.** The owner compared the brief's look with HeroUI and Content Rewards and picked a blend of the two:
- a near-white page;
- a sidebar and top bar with no dividers;
- white cards with a soft shadow;
- 18 px card radius and 12 px controls;
- pill buttons and pill segmented controls;
- filled fields;
- marker yellow `#FFD21F` as the one accent.

Components read semantic tokens (`--card-bg`, `--card-shadow`, `--btn2-*`, `--field-*`, `--r-button`, `--chrome-edge`, and so on), so the look can change again from `tokens.css` alone.

**D10. Flat, not embossed.**
- The primary button lost its inset highlight and its darker yellow outline.
- Secondary buttons are a flat grey fill.
- Keycaps are a soft fill, not a bordered key.
- Stage buttons, the toast's Undo and accent chips have no outline.

This drops the brief's rule that every accent fill carries an `--accent-edge` border. The button text still passes contrast: ink on yellow is 12.24:1.

**D11. No solid borders.** Surfaces separate by fill, shadow and space:
- cards, inputs, chips, banners, popups, the dialog and the window frame have no outline;
- lists and tables use spacing, a filled header band and a hover fill instead of hairlines;
- checkboxes, switches and radios use a `--control-off` fill when off.

What stays:
- Dashed outlines keep their meaning: the Weak score band, unselected timeline pins and the drop zone.
- Tiny data marks keep a thin ink edge (the current pin and the in and out grips), and so do the crop frames drawn over footage.

**Accessibility trade-off.** The brief asked for control edges at 3:1. Filled controls with no edge don't meet that. Each control is still labelled in text, shows its state by fill, and has a strong focus ring. Revisit this if the app has to meet WCAG 1.4.11 strictly.

**D12. No monospace font.** Timecodes, countdowns, money and keycaps use Inter with tabular figures, so columns of numbers still line up. Geist Mono was uninstalled.

**D13. One icon weight.** Every Lucide icon is drawn at 1.4 px on screen, whatever its size (`vector-effect: non-scaling-stroke`, token `--icon-stroke`).

**D14. Keycaps only where they matter.** Inline keycaps show on Keep, Skip, each screen's main action and the Undo toast. Every other shortcut still works, is exposed through `aria-keyshortcuts`, and appears in tooltips and the ? sheet. `<html data-keycaps="all">` shows them all again.

**D15. Components hug or fill on purpose.**
- These hug their content and never grow wider than the parent: Button (unless `block`), Segmented, Chip, ScoreBadge, Kbd, LivePill, DueChip, ProgressPips, Toggle, Stepper and Select.
- Containers fill the width.
- Each component's doc comment starts its layout needs with "Layout:", and the README sums them up.

**D16. The LIVE pill is smaller:** 16, 18 (the default) and 20 px tall, down from 18, 20 and 24.

**D17a. Micro-interactions, only where they give feedback.**
- **Segmented:** one pill slides and resizes to the chosen item, rather than each item swapping its background. The chosen label keeps weight 500, so the pill never chases a width change.
- **Press feedback:** buttons squeeze to 97% and icon buttons to 92% while pressed.
- **Toggle:** the knob keeps its shape and slides, with the track colour fading in step. (A press-stretch was tried and removed: it read as a shape change and a jolt.)
- **Things appearing pop in:** checkbox marks, radio dots, the Kept and Skipped badges, and the "#ad is in" check.
- **Movement:** the band marker glides to a new score, a new still fades in, and the next clip's details slide in after Keep or Skip (`--dur-clip`). The drop zone gives a little when a file is dragged over it.

Nothing loops or moves on its own except the LIVE dot and the loading states. Reduced motion turns all of this into instant changes.

**D17b. Banner actions are white pills.** A grey secondary button on a tinted banner had 1.04:1 against the banner, so it vanished. Inside a banner, secondary and ghost buttons get a white fill, and the neutral banner gets a soft grey fill so it reads as a banner on white cards.

**D17c. Audio is drawn as a waveform.** Thin 2 px rounded bars, 2 px apart, mirrored around the centre line and drawn in real pixels, so spacing never stretches. Bars fade outside the selected range and turn ink (yellow in the dark `web/` editor) once played. Chat keeps bars that grow from the bottom, so the two lanes read differently.

## Components

**D17. Segmented takes `as="tabs" | "radio"`.** oxlint rejects a prop named `role` with the value "tabs". Home and End were added by hand, because Base UI's radio group only handles the arrow keys.

**D18. Stepper's group is a `<fieldset>`.** Holding a button repeats after 400 ms, then every 90 ms. Enter or Space steps once.

**D19. Select and Menu popups use `modal={false}`.** Select doesn't lay its popup over the trigger.

**D20. CaptionEditor.** The platform switcher is a set of tabs, and edited platforms show "· edited". Unticking "Same caption on all three" allows a caption per platform. Ticking it again copies the current platform's caption to all three.

**D21. SpendMeter** turns "near cap" at 80% of the cap. That threshold is a placeholder.

**D22. QueueRow.** A decided clip shows "Kept" or "Skipped" in its meta line, so the title keeps its full width. Focus is roving: only the current row is in the tab order, and J, K and the arrow keys move it.

**D23. JobRow.** A submit row turns into a past-window row on the client when its countdown reaches zero. Only the submit row's action is primary, keeping one yellow action per screen.

**D24. Safe zone button.** It shows visible text ("Safe zone: TikTok"), so its accessible name matches what is on screen.

**D25. VideoStage.** It is a `role="group"`, not a landmark, so several stages on one page don't clash. The transport stays in place, disabled, during loading, error and clear states, so the stage height doesn't jump.

**D26. SourcePreview.** Each region is a real button:
- the arrow keys move it 1%, and Shift moves it 5%;
- Alt with an arrow resizes it, keeping its shape;
- the pointer-only corner handle is hidden from assistive tech.

**D27. Timeline.**
- Unselected pins use a dashed `--ink-3` outline, because `--edge` on `--sunk` is only 2.98:1.
- Both timelines have a lane-label column.
- The overview's detail window is a translucent fill.

**D28. Tooltips are excluded from axe's page-region rule.** Open tooltips portal to `<body>`, outside the page landmarks. Their trigger carries the same name, so nothing is lost.

**D29. The ShortcutSheet's Tab loop is checked in Playwright, not jsdom.** jsdom can't run Base UI's focus guards.

**D30. Hotkeys come through one window listener per screen.** A screen registers its keys with `useScreenKeys`. A dialog that is animating closed no longer blocks keys, so pressing P right after Esc works.

**D31. Traffic lights in the mock window are grey.** That's the unfocused-window look, and it avoids red, yellow and green tokens.

## Building blocks (docs/ui-coverage.md group A)

**D32. One frame for every labelled control.** `FieldFrame` (in `Field.tsx`) draws the label, an optional value at the right of the label row, and the help or error line. `Field` uses it, and so does every new input, so labels and errors look and read the same everywhere. `useFieldIds` hands out the ids that tie them together.

**D33. Controls inside a field.** `Field` takes `trailing`: buttons or a unit that sit inside the right edge (clear, reveal). The text is padded by their measured width, so nothing overlaps at any size.

**D34. A stacking order, in tokens.** `--z-drawer` 55, `--z-overlay` 70 (modal scrim, panel one above), `--z-popup` 80, `--z-toast` 90, `--z-tooltip` 100. Before this, menus sat at 60 and dialogs at 70, so a Select opened inside a dialog would have appeared behind it.

**D35. Popover, Menu and Dialog have separate jobs.**
- Menu: a list of actions.
- Popover: a small panel that leaves the page usable (filters, palette, calendar).
- Dialog: a question that needs an answer. ConfirmDialog is the destructive kind, and it puts focus on Cancel.
- Drawer: a side panel. With `modal={false}` the page keeps working and page hotkeys still fire.

**D36. Toast grew two variants.**
- `tone="error"` is announced at once, carries an icon, and stays until dismissed or retried. The icon uses `--on-ink-fail` (8.94:1 on ink), since `--fail` is too dark on the ink pill.
- `progress` shows a short meter and the percent, and keeps the toast up until it reaches 100.
- `useToast().update()` changes the toast in place, so a job's progress does not replay the entrance each time.
- A long message now wraps instead of squeezing the buttons.

**D37. Select can search.** `searchable` swaps the list for Base UI's Combobox with a search box on top. The trigger and the list look the same as the plain Select. Use it once a list passes about eight items.

**D38. Table sorts and selects.** `SortHeader` is a button inside the header cell and reports `aria-sort`. `SelectAllHeader` and `SelectCell` add a checkbox column, and `useSelection` holds the state. A selected row gets the selection tint, never a stripe. The select-all cell is a `<td>`, because a header cell must hold visible text. Sorting the rows is left to the screen.

**D39. X is a posting platform, not a safe-zone platform.** `PostPlatform` adds `x` to TikTok, Reels and Shorts for posting, accounts and clip cards. The safe-zone overlay keeps the three it has guidance for.

**D40. ⌘K is registered as a proposed key** (`global.palette`), so it appears in the ? sheet.

**D41. Overlays.**
- Drawer is built on the dialog part, not Base UI's swipe drawer: dragging to select log text must not dismiss the panel.
- Dialog and Drawer put the close button last in the markup, so focus starts on the first field or action.
- `ConfirmDialog.onConfirm` may return a promise. The dialog then stays open and busy until it settles.
- A neutral confirm ("Quit anyway") uses the ink button, not yellow, so it does not read as the encouraged choice.
- ContextMenu also opens with Shift+F10, handled by hand, because macOS browsers have no context-menu key. Every action in a context menu must also be reachable from a visible menu.
- The command palette's search box has no focus ring. Focus never leaves it, the caret shows where typing goes, and the active result is filled.

**D42. Inputs.**
- Slider uses the Toggle's white knob on an ink fill. The live value sits at the right of the label row.
- NumberField hugs its content and steps with minus and plus inside the field.
- SecretField shows its test result on its own line under the buttons, and marks a rejected key with the fail tint.
- SearchField's shortcut keycap follows D14: it only shows when all keycaps are on.
- FileField is 56 px tall both empty and full, so a form does not jump when a file is picked.

**D43. Pickers.**
- ColorField never opens the system colour picker: twelve caption swatches and a hex field. Swatches carry a hairline ring so white shows on white (a data mark, allowed by D11).
- Caption colours, fonts and template variables are content, not tokens. They live in `src/data/captionStyle.ts`.
- DatePicker has no date library. Dates are `YYYY-MM-DD` strings in local time. `Calendar` is exported for inline use.
- TagInput says so in a visible line when the limit is reached; a duplicate is only announced.

**D44. Navigation and content.**
- Tabs are text with one soft pill that slides to the chosen tab. There is no underline: an underline is a one-sided mark.
- Segmented is for a small filter in a toolbar; Tabs are for the sections of a page and own their panels.
- ClipCard: the title and the still open the clip; the checkbox and the actions are separate targets. A selected card gets a ring around the still.
- BulkBar is an ink pill at the bottom centre. A toast that arrives while it is up sits above it.
- LogViewer is a light panel in Inter, not a dark terminal. Warnings and errors carry the word as well as the colour.
- There is no virtual list yet. `Pagination` and `LoadMore` cover long lists; revisit if a list passes a few hundred rows.

**D45. Checks.** `test:a11y` also runs `tests/overlays.spec.ts`, which opens each overlay and scans it, since the page-wide scan only sees them closed.

## Placeholders (brief section 13, not invented further)

- Six fixture clips, six of the twelve moments, and the placeholder reasons for clips other than c1.
- Check times on Live.
- The $5.00 cap and "$1.20 used today".
- Error detail strings.
- `[YOUR HANDLE]` and `[FREE SPACE]`.
- The system check names and the cap-behaviour card copy.
- The DropZone hints.
- The invalid-link message.
