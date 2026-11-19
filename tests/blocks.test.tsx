import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from '@/ui/Accordion';
import { Breadcrumb } from '@/ui/Breadcrumb';
import { BulkAction, BulkBar } from '@/ui/BulkBar';
import { ClipCard, ClipGrid } from '@/ui/ClipCard';
import { CopyButton } from '@/ui/CopyButton';
import { InlineEdit } from '@/ui/InlineEdit';
import { LogViewer, logText, type LogLine } from '@/ui/LogViewer';
import { LoadMore, Pagination, pageSlots } from '@/ui/Pagination';
import { PipelineSteps, type PipelineStep } from '@/ui/PipelineSteps';
import { Tabs } from '@/ui/Tabs';
import { TIMING } from '@/styles/timing';

function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('Tabs', () => {
  const TABS = [
    { value: 'review', label: 'To review', count: 8, panel: 'Eight clips to review' },
    { value: 'kept', label: 'Kept', count: 2, panel: 'Two kept clips' },
    { value: 'posted', label: 'Posted', count: 1, panel: 'One posted clip' },
    { value: 'submitted', label: 'Submitted', count: 2, panel: 'Two submitted clips' },
  ];
  it('shows one panel and switches with the arrow keys, Home and End', async () => {
    const onChange = vi.fn();
    render(<Tabs label="Inbox" tabs={TABS} onValueChange={onChange} />);
    expect(screen.getByRole('tablist', { name: 'Inbox' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name: /To review/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Eight clips to review');

    await userEvent.click(screen.getByRole('tab', { name: /To review/ }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /Kept/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Two kept clips');
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: /Submitted/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Submitted/ })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: /To review/ })).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenCalledWith('submitted');
  });
  it('keeps arrow keys away from page hotkeys', async () => {
    const seen = vi.fn();
    window.addEventListener('keydown', seen);
    render(<Tabs label="Inbox" tabs={TABS} />);
    await userEvent.click(screen.getByRole('tab', { name: /To review/ }));
    await userEvent.keyboard('{ArrowRight}{End}');
    window.removeEventListener('keydown', seen);
    expect(seen.mock.calls.filter(([e]) => ['ArrowRight', 'End'].includes((e as KeyboardEvent).key))).toHaveLength(0);
  });
  it('skips a disabled tab', async () => {
    render(<Tabs label="Project" tabs={[TABS[0]!, { ...TABS[1]!, disabled: true }, TABS[2]!]} />);
    await userEvent.click(screen.getByRole('tab', { name: /Kept/ }));
    expect(screen.getByRole('tab', { name: /To review/ })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Accordion', () => {
  const ITEMS = [
    { id: 'find', title: 'Find moments', summary: '12 clips', children: 'Looks for chat spikes.' },
    { id: 'captions', title: 'Captions', summary: 'Arial Black', children: 'Burned in at the middle.' },
  ];
  it('opens and closes a section', async () => {
    render(<Accordion items={ITEMS} />);
    const find = screen.getByRole('button', { name: /Find moments/ });
    expect(find).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(find);
    expect(find).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Looks for chat spikes.')).toBeInTheDocument();
    find.focus();
    await userEvent.keyboard('{Enter}');
    expect(find).toHaveAttribute('aria-expanded', 'false');
  });
  it('keeps several open by default and one at a time when asked', async () => {
    const onOpenChange = vi.fn();
    const { unmount } = render(<Accordion items={ITEMS} defaultOpen={['find']} onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Captions/ }));
    expect(screen.getByRole('button', { name: /Find moments/ })).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange).toHaveBeenLastCalledWith(['find', 'captions']);
    unmount();
    render(<Accordion items={ITEMS} defaultOpen={['find']} multiple={false} />);
    await userEvent.click(screen.getByRole('button', { name: /Captions/ }));
    expect(screen.getByRole('button', { name: /Find moments/ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /Captions/ })).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Breadcrumb', () => {
  it('links every crumb but the last, which is the current page', async () => {
    const onNavigate = vi.fn((_, e: { preventDefault: () => void }) => e.preventDefault());
    render(<Breadcrumb items={[{ label: 'Projects', href: '/projects' }, { label: 'Tomo · GTA VI launch night', href: '/projects/tomo' }, { label: 'He did not see that coming' }]} onNavigate={onNavigate} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getAllByRole('link')).toHaveLength(2);
    expect(within(nav).getByText('He did not see that coming')).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('link', { name: 'Projects' }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate.mock.calls[0]?.[0]).toEqual({ label: 'Projects', href: '/projects' });
  });
});

describe('Pagination', () => {
  it('works out which pages to show', () => {
    expect(pageSlots(1, 4)).toEqual([1, 2, 3, 4]);
    expect(pageSlots(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pageSlots(1, 12)).toEqual([1, 2, 3, 4, 5, 'gap-end', 12]);
    expect(pageSlots(4, 12)).toEqual([1, 2, 3, 4, 5, 'gap-end', 12]);
    expect(pageSlots(6, 12)).toEqual([1, 'gap-start', 5, 6, 7, 'gap-end', 12]);
    expect(pageSlots(9, 12)).toEqual([1, 'gap-start', 8, 9, 10, 11, 12]);
    expect(pageSlots(12, 12)).toEqual([1, 'gap-start', 8, 9, 10, 11, 12]);
    expect(pageSlots(1, 0)).toEqual([]);
  });
  it('marks the current page and reports moves', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={12} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation', { name: 'Pages' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    await userEvent.click(screen.getByRole('button', { name: 'Page 12' }));
    expect(onPageChange).toHaveBeenLastCalledWith(12);
    await userEvent.click(screen.getByRole('button', { name: 'Page 1' }));
    expect(onPageChange).toHaveBeenCalledTimes(2);
  });
  it('is not drawn for a single page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('LoadMore', () => {
  it('says how many are shown and loads the next step', async () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(<LoadMore shown={48} total={212} onLoadMore={onLoadMore} />);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 48 of 212 clips');
    await userEvent.click(screen.getByRole('button', { name: 'Show 24 more' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(<LoadMore shown={200} total={212} onLoadMore={onLoadMore} />);
    expect(screen.getByRole('button', { name: 'Show 12 more' })).toBeInTheDocument();
    rerender(<LoadMore shown={212} total={212} onLoadMore={onLoadMore} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('All 212 clips shown');
  });
  it('is busy while loading', () => {
    render(<LoadMore shown={48} total={212} onLoadMore={() => {}} loading />);
    expect(screen.getByRole('button', { name: 'Loading 24 more' })).toBeDisabled();
  });
});

describe('PipelineSteps', () => {
  const STEPS: PipelineStep[] = [
    { id: 'download', label: 'Downloading', state: 'done' },
    { id: 'transcribe', label: 'Transcribing', state: 'running', progress: 41, detail: '1:19:00 of 3:12:40' },
    { id: 'find', label: 'Finding moments', state: 'queued' },
  ];
  it('lists every step, marks the running one and shows its progress', () => {
    render(<PipelineSteps label="Finding moments in Tomo" steps={STEPS} />);
    const list = screen.getByRole('list', { name: 'Finding moments in Tomo' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('progressbar', { name: 'Transcribing progress' })).toHaveAttribute('aria-valuenow', '41');
    expect(screen.getByText('Now: Transcribing')).toHaveAttribute('aria-live', 'polite');
  });
  it('names a failed step with the word, not only the colour', () => {
    render(<PipelineSteps label="Rendering" steps={[{ id: 'find', label: 'Finding moments', state: 'done' }, { id: 'render', label: 'Rendering', state: 'failed', detail: 'No space left on the disk.' }]} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Failed at Rendering. No space left on the disk.')).toHaveAttribute('aria-live', 'polite');
  });
  it('draws a compact row that names the current step', () => {
    render(<PipelineSteps orientation="horizontal" label="Tomo · GTA VI launch night" steps={STEPS} />);
    const group = screen.getByRole('group', { name: 'Tomo · GTA VI launch night' });
    expect(within(group).getAllByRole('listitem')).toHaveLength(3);
    expect(within(group).getByText('Transcribing')).toBeInTheDocument();
    expect(within(group).getByText('41%')).toBeInTheDocument();
    expect(within(group).getByText('Downloading: Done')).toBeInTheDocument();
  });
});

describe('CopyButton', () => {
  it('copies, says so, then goes back', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(() => Promise.resolve());
    mockClipboard(writeText);
    const onCopied = vi.fn();
    render(<CopyButton text="HE DID NOT SEE THAT COMING #ad" label="Copy caption" onCopied={onCopied} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy caption' }));
    });
    expect(writeText).toHaveBeenCalledWith('HE DID NOT SEE THAT COMING #ad');
    expect(onCopied).toHaveBeenCalledWith('HE DID NOT SEE THAT COMING #ad');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
    act(() => { vi.advanceTimersByTime(TIMING.copied + 10); });
    expect(screen.getByRole('button', { name: 'Copy caption' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('says when the clipboard refuses', async () => {
    mockClipboard(() => Promise.reject(new Error('denied')));
    render(<CopyButton text="x" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(screen.getByRole('button', { name: "Couldn't copy" })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent("Couldn't copy");
  });
});

describe('InlineEdit', () => {
  function Name({ onSave }: { onSave: (v: string) => void }) {
    const [v, setV] = useState('Tomo launch night');
    return <InlineEdit value={v} label="workflow name" onSave={(n) => { setV(n); onSave(n); }} />;
  }
  it('saves with Enter and puts focus back on the name', async () => {
    const onSave = vi.fn();
    render(<Name onSave={onSave} />);
    await userEvent.click(screen.getByRole('button', { name: /Tomo launch night, edit workflow name/ }));
    const input = screen.getByRole('textbox', { name: 'workflow name' });
    expect(input).toHaveFocus();
    expect(input).toHaveValue('Tomo launch night');
    await userEvent.clear(input);
    await userEvent.type(input, '  Tomo night two  {Enter}');
    expect(onSave).toHaveBeenCalledWith('Tomo night two');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByRole('button', { name: /Tomo night two/ })).toHaveFocus();
  });
  it('cancels with Esc, and Esc does not reach the page', async () => {
    const onSave = vi.fn();
    const seen = vi.fn();
    window.addEventListener('keydown', seen);
    render(<Name onSave={onSave} />);
    screen.getByRole('button', { name: /edit workflow name/ }).focus();
    await userEvent.keyboard('{F2}');
    await userEvent.type(screen.getByRole('textbox'), ' extra{Escape}');
    window.removeEventListener('keydown', seen);
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Tomo launch night, edit/ })).toBeInTheDocument();
    expect(seen.mock.calls.filter(([e]) => (e as KeyboardEvent).key === 'Escape')).toHaveLength(0);
  });
  it('saves when focus leaves, and never saves an empty name', async () => {
    const onSave = vi.fn();
    render(<><Name onSave={onSave} /><button type="button">Elsewhere</button></>);
    await userEvent.click(screen.getByRole('button', { name: /edit workflow name/ }));
    await userEvent.type(screen.getByRole('textbox'), ' B');
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(onSave).toHaveBeenCalledWith('Tomo launch night B');
    await userEvent.click(screen.getByRole('button', { name: /edit workflow name/ }));
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.keyboard('{Enter}');
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Tomo launch night B, edit/ })).toBeInTheDocument();
  });
});

describe('ClipCard', () => {
  const CLIP = { id: 'c1', title: 'He did not see that coming', score: 91, seconds: 24, stage: 'review' as const, streamLabel: 'Tomo' };
  it('keeps selecting and opening apart', async () => {
    const onOpen = vi.fn();
    const onSelectedChange = vi.fn();
    render(<ClipCard clip={CLIP} platforms={['tiktok', 'x']} estimate="≈ $15 at 10K views" onOpen={onOpen} onSelectedChange={onSelectedChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select He did not see that coming' }));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(onOpen).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Open clip He did not see that coming' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onSelectedChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Tomo · TikTok, X')).toBeInTheDocument();
    expect(screen.getByText('24 s')).toBeInTheDocument();
    expect(screen.getByText('≈ $15 at 10K views')).toBeInTheDocument();
  });
  it('shows the stage with a word, and a grid is a list', () => {
    render(
      <ClipGrid label="Posted clips">
        <ClipCard clip={{ ...CLIP, id: 'c13', stage: 'submitted' }} />
        <ClipCard clip={{ ...CLIP, id: 'c12', stage: 'past-window' }} />
      </ClipGrid>,
    );
    expect(within(screen.getByRole('list', { name: 'Posted clips' })).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Past window')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});

describe('BulkBar', () => {
  function Bar({ count, onClear, onKeep = () => {} }: { count: number; onClear: () => void; onKeep?: () => void }) {
    return (
      <BulkBar count={count} onClear={onClear} inline>
        <BulkAction onClick={onKeep}>Keep</BulkAction>
        <BulkAction danger>Delete</BulkAction>
      </BulkBar>
    );
  }
  it('says how many are selected and is not there at zero', () => {
    const { rerender } = render(<Bar count={3} onClear={() => {}} />);
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument();
    expect(screen.getByText('3 clips selected')).toBeInTheDocument();
    rerender(<Bar count={1} onClear={() => {}} />);
    expect(screen.getByText('1 clip selected')).toBeInTheDocument();
    rerender(<Bar count={0} onClear={() => {}} />);
    expect(screen.queryByRole('toolbar')).toBeNull();
  });
  it('clears with its button and with Esc, and moves with the arrow keys', async () => {
    const onClear = vi.fn();
    const onKeep = vi.fn();
    const seen = vi.fn();
    window.addEventListener('keydown', seen);
    render(<Bar count={2} onClear={onClear} onKeep={onKeep} />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onClear).toHaveBeenCalledTimes(1);
    screen.getByRole('button', { name: 'Keep' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Clear selection' })).toHaveFocus();
    await userEvent.keyboard('{Home}{Enter}');
    expect(onKeep).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Escape}');
    window.removeEventListener('keydown', seen);
    expect(onClear).toHaveBeenCalledTimes(2);
    expect(seen.mock.calls.filter(([e]) => ['Escape', 'ArrowRight'].includes((e as KeyboardEvent).key))).toHaveLength(0);
  });
});

describe('LogViewer', () => {
  const LINES: LogLine[] = [
    { t: '21:10:11', level: 'info', text: 'Transcribing 3:12:40 of audio.' },
    { t: '21:31:52', level: 'warn', text: 'The audio drops out.' },
    { t: '21:41:47', level: 'error', text: 'ffmpeg exited with code 1' },
  ];
  it('copies and saves the whole log as text', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    mockClipboard(writeText);
    const onSave = vi.fn();
    render(<LogViewer title="Run log" lines={LINES} onSave={onSave} />);
    const text = '21:10:11 Transcribing 3:12:40 of audio.\n21:31:52 WARNING The audio drops out.\n21:41:47 ERROR ffmpeg exited with code 1';
    expect(logText(LINES)).toBe(text);
    expect(screen.getByRole('group', { name: 'Run log' })).toBeInTheDocument();
    expect(screen.getByText('3 lines')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(writeText).toHaveBeenCalledWith(text);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(text);
  });
  it('stops following when scrolled up and jumps back to the latest line', () => {
    render(<LogViewer title="Run log" lines={LINES} />);
    const log = screen.getByRole('log', { name: 'Run log lines' });
    expect(log).toHaveAttribute('tabindex', '0');
    Object.defineProperty(log, 'scrollHeight', { value: 600, configurable: true });
    Object.defineProperty(log, 'clientHeight', { value: 200, configurable: true });
    expect(screen.queryByRole('button', { name: 'Jump to latest' })).toBeNull();
    log.scrollTop = 100;
    fireEvent.scroll(log);
    fireEvent.click(screen.getByRole('button', { name: 'Jump to latest' }));
    expect(log.scrollTop).toBe(600);
    expect(screen.queryByRole('button', { name: 'Jump to latest' })).toBeNull();
  });
  it('has nothing to copy while empty', () => {
    render(<LogViewer lines={[]} />);
    expect(screen.getByText('Nothing logged yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled();
  });
});
