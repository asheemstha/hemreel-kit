import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/ui/Button';

describe('Button', () => {
  it('fires once per click and exposes aria-keyshortcuts', async () => {
    const onClick = vi.fn();
    render(<Button kind="primary" shortcut="P" onClick={onClick}>Keep</Button>);
    const btn = screen.getByRole('button', { name: 'Keep' });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(btn).toHaveAttribute('aria-keyshortcuts', 'P');
  });
  it('uses the machine form when given', () => {
    render(<Button shortcut="⌘N" ariaKeyShortcuts="Meta+N">New clips</Button>);
    expect(screen.getByRole('button', { name: 'New clips' })).toHaveAttribute('aria-keyshortcuts', 'Meta+N');
  });
  it('hides the keycap from assistive tech and blocks clicks while loading', async () => {
    const onClick = vi.fn();
    render(<Button loading shortcut="P" onClick={onClick}>Keep</Button>);
    const btn = screen.getByRole('button', { name: 'Keep' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn.querySelector('kbd')).toHaveAttribute('aria-hidden', 'true');
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
  it('is reachable with the keyboard and fires on Enter and Space', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Skip</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Skip' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
