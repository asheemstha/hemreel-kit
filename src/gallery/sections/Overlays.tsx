import { Clapperboard, Copy, FolderOpen, House, Link, ListFilter, Pencil, Plus, Radio, RefreshCw, Scissors, Send, Settings, SplitSquareHorizontal, Trash2, Unplug, UserRound, Video } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { CLIPS, FEATURED } from '@/data/fixtures';
import { stillFor } from '@/data/stills';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Checkbox } from '@/ui/Checkbox';
import { CheckRow } from '@/ui/CheckRow';
import { CommandPalette, useCommandPaletteHotkey, type CommandGroup } from '@/ui/CommandPalette';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { ContextMenu } from '@/ui/ContextMenu';
import { Dialog, DialogClose, type DialogSize } from '@/ui/Dialog';
import { Drawer, DrawerClose } from '@/ui/Drawer';
import { Field } from '@/ui/Field';
import { Menu, type MenuItem } from '@/ui/Menu';
import { Popover, PopoverClose } from '@/ui/Popover';
import { RadioCard, RadioCardGroup } from '@/ui/RadioCard';
import { ScoreBadge } from '@/ui/ScoreBadge';
import { SettingsRow } from '@/ui/SettingsRow';
import { Textarea } from '@/ui/Textarea';
import { Thumb } from '@/ui/Thumb';
import { GalleryGroup, GallerySection, Row, Specimen, Stack } from '../Specimen';

// Gallery-only text styles for the example content inside the overlays.
const strong: CSSProperties = { font: '600 14px/20px var(--font-ui)', color: 'var(--ink)' };
const quiet: CSSProperties = { font: '400 13px/18px var(--font-ui)', color: 'var(--ink-3)' };
const line: CSSProperties = { font: '400 13px/20px var(--font-ui)', color: 'var(--ink-2)' };

/* ---- Dialog ---- */

function PasteLinkDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon={<Link />} onClick={() => setOpen(true)}>Paste post link</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        size="sm"
        title="Paste the post link"
        description="For Ran out of road on TikTok. The 30 minute submit window starts when you save."
        footer={
          <>
            <DialogClose render={<Button>Cancel</Button>} />
            <Button kind="primary" onClick={() => setOpen(false)}>Save link</Button>
          </>
        }
      >
        <Field label="Post link" type="url" icon={<Link />} placeholder="Paste the link from TikTok" help="Open the post, tap Share, then Copy link." />
      </Dialog>
    </>
  );
}

function EditClipDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon={<Pencil />} onClick={() => setOpen(true)}>Edit clip</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Edit clip"
        description={`${FEATURED.hook} · ${FEATURED.length}`}
        footer={
          <>
            <DialogClose render={<Button>Cancel</Button>} />
            <Button kind="primary" onClick={() => setOpen(false)}>Save changes</Button>
          </>
        }
      >
        <Field label="Hook text" defaultValue={FEATURED.hook} help="Shown in the first 3 seconds." />
        <Textarea label="Caption" defaultValue={FEATURED.caption} rows={3} />
      </Dialog>
    </>
  );
}

const POST_CLIPS = [
  { id: 'c9', title: 'Missed the jump', caption: 'HE MISSED THE JUMP. Tomo in GTA 6 #ad #gta6 #tomo #fyp' },
  { id: 'c10', title: 'Wrong boat', caption: 'WRONG BOAT. Dom in GTA 6 #ad #gta6 #dom #fyp' },
];

function PostDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon={<Send />} onClick={() => setOpen(true)}>Post 2 clips</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        size="lg"
        title="Post 2 clips"
        description="Each clip goes to TikTok, Reels and Shorts. Check the captions before they go out."
        footer={
          <>
            <DialogClose render={<Button>Cancel</Button>} />
            <Button kind="primary" icon={<Send />} onClick={() => setOpen(false)}>Post 2 clips</Button>
          </>
        }
      >
        {POST_CLIPS.map((clip) => (
          <Stack key={clip.id} gap={12}>
            <Row gap={12}>
              <Thumb src={stillFor(clip.id)} width={36} />
              <span style={strong}>{clip.title}</span>
            </Row>
            <Textarea label="TikTok caption" defaultValue={clip.caption} />
            <Textarea label="Reels caption" defaultValue={clip.caption} />
            <Textarea label="Shorts caption" defaultValue={clip.caption} />
            <Field label="Shorts title" defaultValue={clip.title} />
          </Stack>
        ))}
      </Dialog>
    </>
  );
}

function ChooseWorkflowDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Choose a workflow</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        dismissible={false}
        title="Choose a workflow for Clix"
        description="Clix is live. Clips can't be made until this channel has a workflow."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Stop watching Clix</Button>
            <Button kind="primary" onClick={() => setOpen(false)}>Use this workflow</Button>
          </>
        }
      >
        <RadioCardGroup label="Workflow" defaultValue="tomo" layout="stack">
          <RadioCard value="tomo" title="Tomo launch night" meta="$1.50 per 1K views" />
          <RadioCard value="lacy" title="Lacy pool" meta="$12,500 pool" />
          <RadioCard value="dom" title="Dom heist practice" meta="$1 per 1K views" />
        </RadioCardGroup>
      </Dialog>
    </>
  );
}

function SizeDialog({ size, px }: { size: DialogSize; px: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{`Open ${px} px`}</Button>
      <Dialog open={open} onOpenChange={setOpen} size={size} title={`A ${px} px dialog`} description="Title, one quiet line, then the body. This one has no footer, so Close and Esc are the way out.">
        <p style={line}>Use the small size for one field, the medium size for a short form and the large size for side by side content.</p>
      </Dialog>
    </>
  );
}

/* ---- ConfirmDialog ---- */

const SLOW_MS = 1600;

interface ConfirmCase {
  trigger: string;
  title: string;
  body: string;
  detail?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'neutral';
  icon?: ReactNode;
  slow?: boolean;
}

function ConfirmCaseButton({ c }: { c: ConfirmCase }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{c.trigger}</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={c.title}
        detail={c.detail}
        confirmLabel={c.confirmLabel}
        cancelLabel={c.cancelLabel}
        tone={c.tone}
        icon={c.icon}
        onConfirm={c.slow ? () => new Promise<void>((done) => { window.setTimeout(done, SLOW_MS); }) : () => undefined}
      >
        {c.body}
      </ConfirmDialog>
    </>
  );
}

const CONFIRM_PROJECT: ConfirmCase = {
  trigger: 'Delete project',
  title: 'Delete Tomo · GTA VI launch night?',
  body: 'The source video, its moments and every clip that has not been posted are deleted from this Mac. Posted clips stay on TikTok, Reels and Shorts. This cannot be undone.',
  detail: '12 clips · 3.2 GB',
  confirmLabel: 'Delete project',
};
const CONFIRM_CLIP: ConfirmCase = {
  trigger: 'Delete clip',
  title: 'Delete “Slow drive across the bay”?',
  body: 'The rendered clip is deleted. The moment stays in the project, so you can render it again.',
  confirmLabel: 'Delete clip',
};
const CONFIRM_ACCOUNT: ConfirmCase = {
  trigger: 'Disconnect account',
  title: 'Disconnect TikTok?',
  body: 'hemreel will stop posting to [YOUR HANDLE]. Clips already posted stay up, and 2 kept clips will wait until you connect again.',
  confirmLabel: 'Disconnect',
  icon: <Unplug />,
};
const CONFIRM_QUIT: ConfirmCase = {
  trigger: 'Quit hemreel',
  title: 'Quit while clips are rendering?',
  body: 'Rendering stops when hemreel quits. Finished clips are kept and the rest start again next time.',
  detail: '6 of 10 clips still rendering',
  confirmLabel: 'Quit anyway',
  cancelLabel: 'Keep rendering',
  tone: 'neutral',
};
const CONFIRM_SLOW: ConfirmCase = { ...CONFIRM_PROJECT, trigger: 'Delete slowly', slow: true };

/* ---- Popover ---- */

function FilterPopover() {
  const [bands, setBands] = useState({ strong: true, maybe: true, weak: false });
  const shown = Object.values(bands).filter(Boolean).length;
  return (
    <Popover title="Show clips" width={220} trigger={<Button icon={<ListFilter />}>{`Filter clips · ${shown} of 3`}</Button>}>
      <Stack gap={8}>
        <div>
          <Checkbox row label="Strong · 4" checked={bands.strong} onCheckedChange={(v) => setBands((b) => ({ ...b, strong: v }))} />
          <Checkbox row label="Maybe · 3" checked={bands.maybe} onCheckedChange={(v) => setBands((b) => ({ ...b, maybe: v }))} />
          <Checkbox row label="Weak · 1" checked={bands.weak} onCheckedChange={(v) => setBands((b) => ({ ...b, weak: v }))} />
        </div>
        <PopoverClose render={<Button kind="dark" size="sm" block>Done</Button>} />
      </Stack>
    </Popover>
  );
}

const ACCOUNTS = ['TikTok · [YOUR HANDLE]', 'Reels · [YOUR HANDLE]', 'Shorts · [YOUR HANDLE]'];

function AccountPopover() {
  const [account, setAccount] = useState(ACCOUNTS[0] ?? '');
  const rowStyle: CSSProperties = { justifyContent: 'flex-start' };
  return (
    <Popover title="Post from" width={260} trigger={<Button icon={<UserRound />}>{account}</Button>}>
      <Stack gap={8}>
        <div>
          {ACCOUNTS.map((a) => (
            <PopoverClose key={a} render={<Button kind={a === account ? 'secondary' : 'ghost'} block style={rowStyle} aria-pressed={a === account} onClick={() => setAccount(a)}>{a}</Button>} />
          ))}
        </div>
        <Button kind="ghost" size="sm" icon={<Plus />}>Connect another account</Button>
      </Stack>
    </Popover>
  );
}

function ChecksPopover() {
  return (
    <Popover title="System checks" hideTitle flush width={420} side="top" align="center" trigger={<Button>System checks</Button>}>
      <div style={{ padding: '6px 0' }}>
        <CheckRow name="Video tools" value="Installed" status="ok" />
        <CheckRow name="Chat replay access" value="All 3 sites" status="ok" />
        <CheckRow name="Posting service" value="No answer" status="failed" />
      </div>
    </Popover>
  );
}

/* ---- ContextMenu ---- */

function ContextMenuDemos() {
  const [last, setLast] = useState('Nothing picked yet');
  const pick = (what: string) => () => setLast(`Picked: ${what}`);
  const clipItems: Array<MenuItem | 'separator'> = [
    { id: 'open', label: 'Open clip', icon: <Video />, shortcut: '↵', onSelect: pick('Open clip') },
    { id: 'edit', label: 'Edit clip', icon: <Pencil />, onSelect: pick('Edit clip') },
    { id: 'variant', label: 'Make a variant', icon: <SplitSquareHorizontal />, onSelect: pick('Make a variant') },
    { id: 'copy', label: 'Copy caption', icon: <Copy />, onSelect: pick('Copy caption') },
    'separator',
    { id: 'folder', label: 'Show in Finder', icon: <FolderOpen />, onSelect: pick('Show in Finder') },
    'separator',
    { id: 'delete', label: 'Delete clip', icon: <Trash2 />, danger: true, onSelect: pick('Delete clip') },
  ];
  const projectItems: Array<MenuItem | 'separator'> = [
    { id: 'open', label: 'Open project', icon: <Clapperboard />, shortcut: '↵', onSelect: pick('Open project') },
    { id: 'rename', label: 'Rename', icon: <Pencil />, onSelect: pick('Rename') },
    { id: 'again', label: 'Find moments again', icon: <RefreshCw />, onSelect: pick('Find moments again') },
    { id: 'folder', label: 'Show in Finder', icon: <FolderOpen />, onSelect: pick('Show in Finder') },
    'separator',
    { id: 'delete', label: 'Delete project', icon: <Trash2 />, danger: true, onSelect: pick('Delete project') },
  ];
  return (
    <>
      <Specimen label="clip row · right-click it, or focus More and press Shift+F10" surface="bg" wide>
        <ContextMenu items={clipItems} label="Clip actions">
          <Card data-ctx="clip">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Thumb src={stillFor('c11')} width={36} />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={strong}>Ran out of road</span>
                <span style={quiet}>Posted to TikTok 17 min ago</span>
              </div>
              <ScoreBadge score={81} />
              <Menu triggerLabel="More" kind="ghost" size="sm" align="end" items={clipItems} />
            </div>
          </Card>
        </ContextMenu>
      </Specimen>
      <Specimen label="project row" surface="bg">
        <ContextMenu items={projectItems} label="Project actions">
          <Card padded={false} data-ctx="project">
            <SettingsRow title="Tomo · GTA VI launch night" note="12 clips · 3.2 GB" action={<Button size="sm">Open</Button>} />
          </Card>
        </ContextMenu>
      </Specimen>
      <Specimen label="what the menus report">
        <p style={line} role="status">{last}</p>
      </Specimen>
    </>
  );
}

/* ---- Drawer ---- */

const LOG = [
  '19:40:02  Downloading the stream',
  '19:41:10  Reading the chat replay',
  '19:44:31  Transcribing 2:04:11 of audio',
  '19:52:07  Finding moments',
  '19:52:40  Error: the captions model ran out of memory',
  '19:52:40  Stopped. Nothing was rendered.',
];

function LogDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show run log</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="Run log"
        description="Dom · Heist practice · stopped at 19:52"
        footer={
          <>
            <DrawerClose render={<Button>Close</Button>} />
            <Button kind="primary" icon={<RefreshCw />} onClick={() => setOpen(false)}>Find moments again</Button>
          </>
        }
      >
        <Stack gap={8}>
          {LOG.map((l) => <p key={l} className="hr-tnum" style={line}>{l}</p>)}
        </Stack>
      </Drawer>
    </>
  );
}

const DETAILS: Array<[string, string]> = [
  ['Stream', 'Tomo · GTA VI launch night'],
  ['Length', '24 s'],
  ['Posted', 'TikTok, 17 min ago'],
  ['Could earn', '≈ $15 at 10K views'],
];

function DetailsDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button aria-pressed={open} onClick={() => setOpen((o) => !o)}>Show clip details</Button>
      <Drawer open={open} onOpenChange={setOpen} modal={false} width={360} title="Ran out of road" description="The page behind stays usable.">
        <Row gap={12} align="start">
          <Thumb src={stillFor('c11')} width={48} />
          <ScoreBadge score={81} showWord />
        </Row>
        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 8, margin: 0 }}>
          {DETAILS.map(([k, v]) => (
            <div key={k} style={{ display: 'contents' }}>
              <dt style={quiet}>{k}</dt>
              <dd className="hr-tnum" style={{ ...line, margin: 0 }}>{v}</dd>
            </div>
          ))}
        </dl>
      </Drawer>
    </>
  );
}

function HistoryDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show run history</Button>
      <Drawer open={open} onOpenChange={setOpen} side="left" width={640} title="Run history" description="Lacy · checked every 60 s">
        <Card padded={false}>
          <div style={{ padding: '6px 0' }}>
            <CheckRow name="19:41" value="Checking now" status="running" />
            <CheckRow name="19:40" value="Live. Found 3 moments" status="ok" statusLabel="Done" />
            <CheckRow name="19:39" value="Live. Nothing new" status="ok" statusLabel="Done" />
            <CheckRow name="19:38" value="Twitch did not answer" status="failed" />
            <CheckRow name="18:12" value="Offline" status="ok" statusLabel="Done" />
          </div>
        </Card>
      </Drawer>
    </>
  );
}

/* ---- CommandPalette ---- */

function PaletteDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState('Nothing picked yet');
  useCommandPaletteHotkey(() => setOpen(true));
  const pick = (what: string) => () => setLast(`Picked: ${what}`);
  const groups: CommandGroup[] = [
    {
      heading: 'Go to',
      items: [
        { id: 'go-home', label: 'Home', icon: <House />, shortcut: '⌘1', onSelect: pick('Home') },
        { id: 'go-review', label: 'Review', icon: <Clapperboard />, shortcut: '⌘2', onSelect: pick('Review') },
        { id: 'go-moments', label: 'Moments', icon: <Scissors />, shortcut: '⌘3', onSelect: pick('Moments') },
        { id: 'go-new', label: 'New clips', icon: <Plus />, onSelect: pick('New clips') },
        { id: 'go-live', label: 'Live', icon: <Radio />, shortcut: '⌘4', onSelect: pick('Live') },
        { id: 'go-settings', label: 'Settings', icon: <Settings />, shortcut: '⌘,', keywords: ['preferences', 'accounts'], onSelect: pick('Settings') },
      ],
    },
    {
      heading: 'Projects',
      items: [
        { id: 'p-tomo', label: 'Tomo · GTA VI launch night', icon: <Video />, note: '3:12:40', onSelect: pick('Tomo · GTA VI launch night') },
        { id: 'p-lacy', label: 'Lacy · Live 19:40', icon: <Video />, note: 'Live', onSelect: pick('Lacy · Live 19:40') },
        { id: 'p-dom', label: 'Dom · Heist practice', icon: <Video />, note: '2:04:11', onSelect: pick('Dom · Heist practice') },
      ],
    },
    {
      heading: 'Clips',
      items: CLIPS.slice(0, 4).map((c) => ({ id: `clip-${c.id}`, label: c.title, icon: <Clapperboard />, note: `Score ${c.score}`, keywords: [c.streamId], onSelect: pick(c.title) })),
    },
    {
      heading: 'Actions',
      items: [
        { id: 'a-new', label: 'Start new clips from a link', icon: <Plus />, shortcut: '⌘N', keywords: ['add', 'stream', 'vod'], onSelect: pick('Start new clips from a link') },
        { id: 'a-paste', label: 'Paste post link', icon: <Link />, keywords: ['submit', 'tiktok'], onSelect: pick('Paste post link') },
        { id: 'a-check', label: 'Check channels now', icon: <RefreshCw />, keywords: ['live', 'watch'], onSelect: pick('Check channels now') },
      ],
    },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <Button shortcut="⌘K" ariaKeyShortcuts="Meta+K" onClick={() => setOpen(true)}>Open command palette</Button>
      <p style={line} role="status">{last}</p>
      <CommandPalette open={open} onOpenChange={setOpen} groups={groups} />
    </div>
  );
}

export function OverlaysSection() {
  return (
    <GalleryGroup id="overlays" title="Overlays">
      <GallerySection id="dialog" title="Dialog" note="A task that needs an answer. Focus moves in, Tab stays inside, Esc closes and focus returns to the button.">
        <Specimen label="sm 400 · one field" center><PasteLinkDialog /></Specimen>
        <Specimen label="md 560 · short form" center><EditClipDialog /></Specimen>
        <Specimen label="lg 720 · long body scrolls, title and actions stay put" center><PostDialog /></Specimen>
        <Specimen label="not dismissible · no close, Esc and outside clicks do nothing" center><ChooseWorkflowDialog /></Specimen>
        <Specimen label="sizes, no footer" center>
          <Row gap={8}>
            <SizeDialog size="sm" px={400} />
            <SizeDialog size="md" px={560} />
            <SizeDialog size="lg" px={720} />
          </Row>
        </Specimen>
      </GallerySection>

      <GallerySection id="confirm-dialog" title="ConfirmDialog" note="Asks before anything that deletes or disconnects. Focus starts on Cancel. A click outside does nothing.">
        <Specimen label="danger · with what will be lost" center><ConfirmCaseButton c={CONFIRM_PROJECT} /></Specimen>
        <Specimen label="danger · no detail" center><ConfirmCaseButton c={CONFIRM_CLIP} /></Specimen>
        <Specimen label="danger · own icon" center><ConfirmCaseButton c={CONFIRM_ACCOUNT} /></Specimen>
        <Specimen label="neutral · quit while rendering" center><ConfirmCaseButton c={CONFIRM_QUIT} /></Specimen>
        <Specimen label="busy · confirm takes a moment, then the dialog closes" center><ConfirmCaseButton c={CONFIRM_SLOW} /></Specimen>
      </GallerySection>

      <GallerySection id="popover" title="Popover" note="A small panel on a button. Not modal: Esc or a click outside closes it.">
        <Specimen label="filter · checkboxes and Done" center tall><FilterPopover /></Specimen>
        <Specimen label="account switcher · picking one closes it" center tall><AccountPopover /></Specimen>
        <Specimen label="hidden title · flush content · opens upward" center tall><ChecksPopover /></Specimen>
      </GallerySection>

      <GallerySection id="context-menu" title="ContextMenu" note="A shortcut to actions that are also in a visible More menu.">
        <ContextMenuDemos />
      </GallerySection>

      <GallerySection id="drawer" title="Drawer" note="A side panel for things you read next to the page.">
        <Specimen label="right · 480 · modal · footer" center><LogDrawer /></Specimen>
        <Specimen label="right · 360 · not modal: no scrim, the page stays usable" center><DetailsDrawer /></Specimen>
        <Specimen label="left · 640 · modal" center><HistoryDrawer /></Specimen>
      </GallerySection>

      <GallerySection id="command-palette" title="CommandPalette" note="Press ⌘K anywhere on this page, or use the button. Type to filter, arrows to move, Enter to open.">
        <Specimen label="projects, clips, channels and actions" center><PaletteDemo /></Specimen>
      </GallerySection>
    </GalleryGroup>
  );
}
