import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useHotkeys } from '@/hooks/useHotkeys';
import { Drawer } from '@/ui/Drawer';

function Screen({ onKeep, onPalette, children }: { onKeep: () => void; onPalette?: () => void; children?: React.ReactNode }) {
  useHotkeys('review', { 'review.keep': onKeep, 'global.palette': onPalette });
  return <div>{children}</div>;
}

describe('page hotkeys and overlays', () => {
  it('stops single keys while a modal dialog is open', async () => {
    const onKeep = vi.fn();
    render(<Screen onKeep={onKeep}><div role="dialog" aria-label="Edit clip" /></Screen>);
    await userEvent.keyboard('p');
    expect(onKeep).not.toHaveBeenCalled();
  });

  it('keeps single keys working next to a non-modal drawer', async () => {
    const onKeep = vi.fn();
    render(
      <Screen onKeep={onKeep}>
        <Drawer open onOpenChange={() => {}} title="Clip details" modal={false}>Details</Drawer>
      </Screen>,
    );
    expect(document.querySelector('[role="dialog"][data-nonmodal]')).not.toBeNull();
    document.body.focus();
    await userEvent.keyboard('p');
    expect(onKeep).toHaveBeenCalledTimes(1);
  });

  it('opens the palette with ⌘K, even while typing in a field', async () => {
    const onPalette = vi.fn();
    render(<Screen onKeep={() => {}} onPalette={onPalette}><input aria-label="Hook text" /></Screen>);
    await userEvent.click(document.querySelector('input')!);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    expect(onPalette).toHaveBeenCalledTimes(1);
  });
});
