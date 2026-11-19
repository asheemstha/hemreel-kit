import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Countdown } from '@/ui/Countdown';
import { JobList, JobRow } from '@/ui/JobRow';
import { ShortcutSheet } from '@/ui/ShortcutSheet';
import { KEYMAP } from '@/data/keymap';

describe('Countdown', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ticks every second and calls onExpire once at zero', () => {
    const onExpire = vi.fn();
    const deadline = Date.now() + 3000;
    render(<Countdown deadline={deadline} onExpire={onExpire} />);
    expect(screen.getAllByText('00:03').length).toBeGreaterThan(0);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getAllByText('00:02').length).toBeGreaterThan(0);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('flips a submit row to past submit window when it expires', () => {
    render(<JobList><JobRow kind="submit" title="Ran out of road" deadline={Date.now() + 1500} clipIds={['c11']} /></JobList>);
    expect(screen.getByText('Submit link')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText('Past submit window')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit late/ })).toBeInTheDocument();
  });
});

describe('ShortcutSheet', () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Shortcuts</button>
        <ShortcutSheet open={open} onOpenChange={setOpen} />
      </>
    );
  }
  // The Tab loop itself is checked in a real browser (tests/a11y.spec.ts); jsdom cannot run Base UI's focus guards.
  it('lists every key, moves focus inside, closes with Esc and returns focus', async () => {
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Shortcuts' });
    await userEvent.click(opener);
    const dialog = await screen.findByRole('dialog', { name: 'Keyboard shortcuts' });
    for (const k of KEYMAP) expect(dialog).toHaveTextContent(k.label);
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
