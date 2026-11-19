import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Toast } from '@/ui/Toast';

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('dismisses itself after the duration', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Skipped." onDismiss={onDismiss} durationMs={5000} />);
    expect(screen.getByRole('status')).toHaveTextContent('Skipped.');
    act(() => { vi.advanceTimersByTime(4900); });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(300); });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('pauses while hovered', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Kept." onDismiss={onDismiss} durationMs={1000} />);
    fireEvent.mouseEnter(screen.getByRole('status'));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.mouseLeave(screen.getByRole('status'));
    act(() => { vi.advanceTimersByTime(1200); });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('runs Undo and exposes its shortcut', () => {
    const onAction = vi.fn();
    render(<Toast message="Skipped." actionLabel="Undo" actionShortcut="⌘Z" onAction={onAction} onDismiss={() => {}} />);
    const undo = screen.getByRole('button', { name: 'Undo' });
    expect(undo).toHaveAttribute('aria-keyshortcuts', 'Meta+Z');
    fireEvent.click(undo);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

describe('Toast variants', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('keeps an error on screen until it is dismissed', () => {
    const onDismiss = vi.fn();
    render(<Toast tone="error" message="Couldn't post to TikTok." onDismiss={onDismiss} durationMs={1000} />);
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't post to TikTok.");
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('stays up while a job runs and leaves once it reaches 100', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Toast message="Rendering 4 of 10 clips" progress={41} onDismiss={onDismiss} durationMs={1000} />);
    expect(screen.getByRole('progressbar', { name: 'Rendering 4 of 10 clips' })).toHaveAttribute('aria-valuenow', '41');
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(onDismiss).not.toHaveBeenCalled();
    rerender(<Toast message="10 clips rendered." progress={100} onDismiss={onDismiss} durationMs={1000} />);
    act(() => { vi.advanceTimersByTime(1200); });
    expect(onDismiss).toHaveBeenCalled();
  });
});
