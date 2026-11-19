# UI coverage: what the kit has, and everything still missing

Audit date: 18 Nov 2026. **Group A was built the same day** (see the status column in A). Compared: the kit (`kit/`, 62 components at the time, 6 screens, 7 states), the real app (`web/`, 9 routes, 46 API endpoints), the desktop shell (`desktop/`), and what a paid Mac app needs before someone can buy it and use it without help.

**Short answer: no.** The kit covers the six screens in the brief. That was roughly a third of the UI the product needs. With group A built, every building block exists; the flows, screens and product shell in B to F are still to do.

| Group | Items missing | Exists in the app today? |
|---|---|---|
| A. Building blocks | 0 of 27 (all built in `kit/`) | Done, except a virtual list |
| B. Flows behind buttons the kit already shows | 9 flows | Partly (posting, rendering, logs) |
| C. Screens the app has that the kit never drew | 9 screens and panels | Yes, in the old dark look |
| D. Product shell needed to sell it | 10 areas | Almost none (auto-update and two error boxes only) |
| E. States every screen needs | 8 kinds | Patchy |
| F. Outside the app, same brand | 9 things | No |

The largest single gap is not a component: **the real app does not use this kit yet.** `web/` still runs on its own older dark kit (`web/src/ui`). Until the screens in C are rebuilt on `kit/`, the kit is a gallery.

Legend: **app** = works in `web/` today in the old look. **new** = not built anywhere.

---

## A. Building blocks (built)

Everything in B to D is assembled from these. All 27 are now in `kit/src/ui`, shown in the gallery under More inputs, Pickers and tags, Navigation and content, and Overlays, with tests. The "Status" column says where each stood before.

Not built: a virtual list (row 22). `Pagination` and `LoadMore` cover long lists for now.

| # | Component | Needed for | Status |
|---|---|---|---|
| 1 | **Dialog** (general modal: title, body, actions, sizes) | Edit clip, Make a variant, Find the facecam, Post, Paste link. The kit only has the shortcut sheet. | app |
| 2 | **ConfirmDialog** (destructive: delete project, delete clip, disconnect account, quit while rendering) | Every delete | app |
| 3 | **Popover** | Filters, colour picker, date picker, account switcher | app |
| 4 | **ContextMenu** (right-click) | Clips, projects, moments, queue rows | new |
| 5 | **Drawer / side panel** | Logs, clip details, run history | new |
| 6 | **Tabs with panels** (page level, with counts) | Inbox: To review, Kept, Posted, Submitted | app |
| 7 | **Slider** on a light surface | Gameplay pan, caption size, outline width, caption height. The kit only has the video scrubber. | app |
| 8 | **NumberField** with unit and steppers | Clips to find, clip length, gap, check interval, minutes of stream | app |
| 9 | **TimecodeField** (typed time) | Scan from, scan until, exact trim | app |
| 10 | **ColorField** with swatches | Caption text, highlight, background colours | app |
| 11 | **FontPicker** (each font shown in itself) | Caption style | app |
| 12 | **SecretField** (masked key, reveal, paste, test, remove) | Claude API key, posting service key | app |
| 13 | **TagInput** (chips you type) | Hashtags, required tag, discovery tags | new |
| 14 | **TemplateField** (text with variables such as streamer or game) | Caption template, YouTube title | new |
| 15 | **SearchField** | Search projects, search transcript | app |
| 16 | **Command palette** (⌘K: jump to a project, clip, channel or action) | Keyboard-first rule | new |
| 17 | **FileField** (image or video with preview, replace, remove) | Campaign overlay image, sample video | app |
| 18 | **Accordion / Disclosure** | Workflow steps, "More" sections | app |
| 19 | **PipelineSteps** (queued, downloading, finding, rendering, done, with the current step's progress) | Find moments, render, project status | app |
| 20 | **CopyButton** (copies, then confirms) | Caption, post link, error detail | app |
| 21 | **InlineEdit** (rename in place) | Project name, workflow name, moment title | app |
| 22 | **Pagination / Load more / virtual list** | Long project and clip lists | new |
| 23 | **Breadcrumb / back** | Projects › project › clip | app |
| 24 | **ClipCard and card grid** (thumb, score, length, platforms, estimate, actions, multi-select) | Inbox, project clips | app |
| 25 | **BulkBar** (appears when several things are selected: keep, skip, post, delete) | Inbox, projects, moments | new |
| 26 | **LogViewer** (follows the tail, copy, save) | Failed runs, support | app |
| 27 | **DatePicker / date range** | Scheduled posts, earnings period, filters | new |

Small additions to existing components, all done: Table has sortable headers and row selection. Toast has a progress variant and an error variant. Chip has a removable variant. Select can search. **X** is a posting platform (`PostPlatform`), with a row in Settings. ⌘K opens the command palette on every screen.

---

## B. Flows behind buttons the kit already shows

These buttons exist on the kit's screens and currently lead nowhere.

| # | Button | What has to exist behind it | Status |
|---|---|---|---|
| 1 | **Find moments** (New clips) | Progress screen: downloading with percent, reading chat, transcribing, finding, scoring. Cancel. Failed with reason, retry and logs. Done, with "Found 12 moments. 8 strong." | app |
| 2 | **Render 10 clips** (Moments) | Render queue: one row per clip with progress, time left, cancel one or all, failed clip with "Render again". Done, with a link to Review. | app |
| 3 | **Post 2 clips** (Home, Review) | Post dialog: which accounts, which platforms, caption per platform with length limits, TikTok visibility, YouTube title, #ad check, post now or schedule. Then per-platform upload status: uploading, posted with link, failed with reason and retry. | app, no scheduling |
| 4 | **Paste post link** (Home) | Dialog: paste the link, check it is a real post link for that platform, attach it to the clip, start the 30 min window. | app |
| 5 | **Submit link**, **Submit late**, **Dismiss** | Submit steps: copy the link, open the campaign brief, mark submitted. Late: warning that it may not pay. Dismiss: confirm. | app, partly |
| 6 | **Watch channel**, **Choose** (Live) | Add or edit a channel: channel, workflow, check interval, live or VODs, clip only when a certain game is on. Run history. "Check now". Paused because the streamer is on another game. Failed check. | app |
| 7 | **Edit this workflow**, workflow cards | The whole workflow editor (see C5). | app |
| 8 | **Sign in again**, **Connect** (Settings) | Connect flow: opens the browser, waiting, connected, failed, expired. Several accounts per platform. | app, one profile |
| 9 | **Run again**, **Run system checks** | Checks running one by one, each with a fix action: install, download model, free space, open settings. | app, read-only |

---

## C. Screens the app has that the kit never drew

| # | Screen | What it contains | Kit today |
|---|---|---|---|
| 1 | **Inbox** | Four tabs by state, project filter, sort, clip card grid, keep and skip on a card, submit timers on posted clips, "mark submitted" | Home shows counts and four job rows only |
| 2 | **Posted and Submitted history** | Every posted clip with its links, when it was posted, whether it was submitted in time | Nothing |
| 3 | **Projects** | Grouped list, search, filter, status and progress per project, rename, open folder, delete | Nothing |
| 4 | **Project page** | Status pipeline, hype timeline, moments list with skipped ones, moment inspector with the AI reason and transcript, clips workspace, clip inspector, logs | Moments and Review cover the middle of it |
| 5 | **Workflow editor** | Sections: find moments, layout and facecam, captions, overlays, campaign, post copy. Includes the caption style editor (presets drawn as they burn in, font, size, colours, outline, box, caps, words at a time, pop, censor), the facecam finder, and the overlay image | Three radio cards |
| 6 | **Workflows list** | Cards with mode, campaign, pay; duplicate, delete, run on a video | Nothing |
| 7 | **Clip editor** | Crop box on the source, layout, pan, trim timeline, text layer, overlay placement, vertical preview. Built today in `web/src/ui/editor.tsx`, not in the kit | SourcePreview and TimelineDetail only |
| 8 | **Clip variants** | "Make a variant": new hook, shifted start and end, versions of one clip side by side | Nothing |
| 9 | **Setup: AI and posting cards** | Key entry and test, model choice, cap, spent today, posting profile | Settings has the cap and account rows, no key entry |

Also in the backend with no UI anywhere:
- **Taste learning** (`app/services/taste.py`): the app learns from keeps and skips. It needs a place that says so, shows what it has learned from, and lets the person reset it.
- **Transcript fixes**: the AI corrects misheard words. There is nowhere to see or edit the words of a caption.

---

## D. Product shell needed to sell it

| # | Area | What is needed | Status |
|---|---|---|---|
| 1 | **First run** | Welcome, licence, downloading the speech model and video tools with progress, connect an account, optional AI key, first clip. Skippable steps, resume later. | new |
| 2 | **Licence and trial** | Enter key, trial days left, expired and locked state, this Mac's activation, move licence, buy link | new |
| 3 | **Updates** | Update available, downloading, restart to install, what's new, update failed. `electron-updater` runs silently today. | new |
| 4 | **Engine and crash states** | Starting splash, "Can't reach the clipping engine" with restart, "Hemreel stopped working" with send logs. Two native error boxes exist. | app, partly |
| 5 | **Activity centre** | Every running job in one place (downloads, detection, renders, uploads, watchers) with progress and cancel, reachable from any screen | new |
| 6 | **Notifications** | In-app list plus native ones: clips ready, link due in 5 min, post failed, channel went live. Dock badge. Preferences for each. | new |
| 7 | **Menu bar item** | Small panel: live channels, links due, running jobs, open the app | new |
| 8 | **Storage** | Space used per project, clean up sources, low disk warning, where the workspace lives, move it | app, cleanup only |
| 9 | **Preferences** | Export quality and frame rate, launch at login, shortcuts, notifications, language, appearance. The app is dark today and the kit is light: one has to win, or the kit needs a dark set of tokens. | new |
| 10 | **About, help, legal** | Version, licences (`THIRD_PARTY_NOTICES.md`), terms, privacy, data sent to Claude and to the posting service, contact support with logs attached, tips for new users | new |

Also: quit while rendering (confirm), drag a file anywhere onto the window, offline, platform rate limits, and the campaign rules check before posting (minimum length, #ad, "no AI content" warning).

---

## E. States every screen needs

The kit has these for Home and Review only. Each screen in C and D needs all that apply.

1. Empty, with the one next action
2. Loading (skeletons shaped like the content)
3. Failed to load, with retry
4. Partly done (3 of 10 rendered, 1 of 3 platforms posted)
5. Offline or engine down
6. Success confirmation that does not block
7. Destructive confirm, with undo where it can be undone
8. Limits: very long names, 200 clips, 1200 px wide window, 200% zoom

---

## F. Outside the app, same brand

Not kit components, but they need the same tokens, logo and voice: app icon set, installer window, marketing site, pricing and checkout, licence email, account and licence page, help site, changelog, social images.

---

## Suggested order

1. ~~**Building blocks** (A).~~ Done.
2. **The money path** (B1 to B5, C1, C2): find, render, review, post, paste link, submit, history. This is the clipper's night from the brief, end to end.
3. **The rest of the app** (C3 to C9, B6 to B9), rebuilt on the kit.
4. **Product shell** (D).
5. **Move `web/` onto the kit** and delete `web/src/ui`.
6. **Earnings**: record real views and payouts per clip and campaign. Today "Could earn" is only an estimate and nothing tracks what was paid. This needs backend work first.

Open decisions that block parts of this: light or dark (D9), how licences are sold and checked (D2), whether posts can be scheduled (B3), and whether several accounts per platform are supported (B8).
