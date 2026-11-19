import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/ui/Button';
import { CommandPalette, filterCommands, useCommandPaletteHotkey, type CommandGroup } from '@/ui/CommandPalette';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { ContextMenu } from '@/ui/ContextMenu';
import { Dialog, DialogClose } from '@/ui/Dialog';
import { Drawer } from '@/ui/Drawer';
import { Field } from '@/ui/Field';

// Focus traps (the Tab loop) are checked in a real browser; jsdom cannot run Base UI's focus guards.

describe('Dialog', () => {
  function Harness({ dismissible, onOpenChange }: { dismissible?: boolean; onOpenChange?: (open: boolean) => void }) {
    const [open, setOpen] = useState(false);
    const change = (next: boolean) => { setOpen(next); onOpenChange?.(next); };
    return (
      <>
        <button type="button" onClick={() => change(true)}>Paste post link</button>
        <Dialog
          open={open}
          onOpenChange={change}
          dismissible={dismissible}
          title="Paste the post link"
          description="The 30 minute submit window starts when you save."
          footer={<><DialogClose render={<Button>Cancel</Button>} /><Button kind="primary" onClick={() => change(false)}>Save link</Button></>}
        >
          <Field label="Post link" type="url" />
        </Dialog>
      </>
    );
  }

  it('opens with its title and description, and focuses the first field rather than Close', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Paste post link' }));
    const dialog = await screen.findByRole('dialog', { name: 'Paste the post link' });
    expect(dialog).toHaveAccessibleDescription('The 30 minute submit window starts when you save.');
    await waitFor(() => expect(within(dialog).getByRole('textbox', { name: 'Post link' })).toHaveFocus());
  });

  it('closes with Esc, the close button and a footer button, reporting each change', async () => {
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);
    const opener = screen.getByRole('button', { name: 'Paste post link' });

    await userEvent.click(opener);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await userEvent.click(opener);
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await userEvent.click(opener);
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(onOpenChange.mock.calls.map(([v]) => v)).toEqual([true, false, true, false, true, false]);
  });

  it('ignores Esc and has no close button when it is not dismissible', async () => {
    const onOpenChange = vi.fn();
    render(<Harness dismissible={false} onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Paste post link' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save link' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('ConfirmDialog', () => {
  function Harness({ onConfirm, busy }: { onConfirm: () => void | Promise<void>; busy?: boolean }) {
    const [open, setOpen] = useState(true);
    return (
      <ConfirmDialog open={open} onOpenChange={setOpen} title="Delete Tomo · GTA VI launch night?" detail="12 clips · 3.2 GB" confirmLabel="Delete project" onConfirm={onConfirm} busy={busy}>
        This cannot be undone.
      </ConfirmDialog>
    );
  }

  it('is an alert dialog that starts on Cancel and shows what will be lost', async () => {
    render(<Harness onConfirm={() => undefined} />);
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete Tomo · GTA VI launch night?' });
    expect(dialog).toHaveTextContent('12 clips · 3.2 GB');
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus());
  });

  it('runs onConfirm and closes', async () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Delete project' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('cancels without running onConfirm, by button and by Esc', async () => {
    const onConfirm = vi.fn();
    const first = render(<Harness onConfirm={onConfirm} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    first.unmount();
    render(<Harness onConfirm={onConfirm} />);
    await screen.findByRole('alertdialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('stays open and busy while a slow confirm runs, then closes', async () => {
    let finish: () => void = () => undefined;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<Harness onConfirm={onConfirm} />);
    const confirm = await screen.findByRole('button', { name: 'Delete project' });
    await userEvent.click(confirm);
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await act(async () => { finish(); });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('disables both buttons when busy is forced', async () => {
    render(<Harness onConfirm={() => undefined} busy />);
    expect(await screen.findByRole('button', { name: 'Delete project' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});

describe('ContextMenu', () => {
  function Harness({ onDelete, onOpen }: { onDelete: () => void; onOpen: () => void }) {
    return (
      <ContextMenu
        label="Clip actions"
        items={[
          { id: 'open', label: 'Open clip', onSelect: onOpen },
          'separator',
          { id: 'delete', label: 'Delete clip', danger: true, onSelect: onDelete },
        ]}
      >
        <div>
          <span>Ran out of road</span>
          <button type="button">More</button>
        </div>
      </ContextMenu>
    );
  }

  it('opens on right click and runs the picked item', async () => {
    const onDelete = vi.fn();
    const onOpen = vi.fn();
    render(<Harness onDelete={onDelete} onOpen={onOpen} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.contextMenu(screen.getByText('Ran out of road'));
    const menu = await screen.findByRole('menu', { name: 'Clip actions' });
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(2);
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Delete clip' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('opens with Shift+F10 from a focused control inside the target', async () => {
    render(<Harness onDelete={() => undefined} onOpen={() => undefined} />);
    screen.getByRole('button', { name: 'More' }).focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    expect(await screen.findByRole('menu', { name: 'Clip actions' })).toBeInTheDocument();
  });
});

describe('Drawer', () => {
  function Harness({ modal }: { modal?: boolean }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Show run log</button>
        <Drawer open={open} onOpenChange={setOpen} modal={modal} title="Run log" description="Dom · Heist practice">
          <p>19:52:40 Stopped. Nothing was rendered.</p>
        </Drawer>
      </>
    );
  }

  it('opens as a named dialog and closes with its button and with Esc', async () => {
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Show run log' });
    await userEvent.click(opener);
    const drawer = await screen.findByRole('dialog', { name: 'Run log' });
    expect(drawer).toHaveTextContent('Nothing was rendered');
    expect(drawer).not.toHaveAttribute('data-nonmodal');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await userEvent.click(opener);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('marks itself when it is not modal and stays open when the page is clicked', async () => {
    render(<Harness modal={false} />);
    const opener = screen.getByRole('button', { name: 'Show run log' });
    await userEvent.click(opener);
    const drawer = await screen.findByRole('dialog', { name: 'Run log' });
    expect(drawer).toHaveAttribute('data-nonmodal');
    await userEvent.click(opener);
    expect(screen.getByRole('dialog', { name: 'Run log' })).toBeInTheDocument();
  });
});

describe('CommandPalette', () => {
  const makeGroups = (run: (id: string) => void): CommandGroup[] => [
    { heading: 'Go to', items: [
      { id: 'home', label: 'Home', onSelect: () => run('home') },
      { id: 'review', label: 'Review', onSelect: () => run('review') },
      { id: 'settings', label: 'Settings', keywords: ['preferences'], onSelect: () => run('settings') },
    ] },
    { heading: 'Projects', items: [
      { id: 'tomo', label: 'Tomo · GTA VI launch night', note: '3:12:40', onSelect: () => run('tomo') },
      { id: 'dom', label: 'Dom · Heist practice', note: '2:04:11', onSelect: () => run('dom') },
    ] },
  ];

  function Harness({ run }: { run: (id: string) => void }) {
    const [open, setOpen] = useState(false);
    useCommandPaletteHotkey(() => setOpen(true));
    return <CommandPalette open={open} onOpenChange={setOpen} groups={makeGroups(run)} />;
  }

  const active = () => screen.getAllByRole('option').find((o) => o.getAttribute('aria-selected') === 'true');

  it('filters on every word across label, note and keywords', () => {
    const groups = makeGroups(() => undefined);
    expect(filterCommands(groups, '').flatMap((g) => g.items)).toHaveLength(5);
    expect(filterCommands(groups, 'heist dom').flatMap((g) => g.items.map((i) => i.id))).toEqual(['dom']);
    expect(filterCommands(groups, 'PREFER').flatMap((g) => g.items.map((i) => i.id))).toEqual(['settings']);
    expect(filterCommands(groups, '3:12').map((g) => g.heading)).toEqual(['Projects']);
    expect(filterCommands(groups, 'nothing here')).toEqual([]);
  });

  it('opens on Meta+K with the first result active, moves with the arrows and wraps', async () => {
    render(<Harness run={() => undefined} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.keyboard('{Meta>}k{/Meta}');
    const input = await screen.findByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    expect(screen.getAllByRole('option')).toHaveLength(5);
    expect(active()).toHaveTextContent('Home');
    expect(input).toHaveAttribute('aria-activedescendant', active()?.id);
    await userEvent.keyboard('{ArrowDown}');
    expect(active()).toHaveTextContent('Review');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(active()).toHaveTextContent('Dom · Heist practice');
    expect(input).toHaveFocus();
  });

  it('filters while typing, and Enter runs the active item and closes', async () => {
    const run = vi.fn();
    render(<Harness run={run} />);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    await userEvent.type(await screen.findByRole('combobox'), 'tomo');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.queryByText('Go to')).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    expect(run).toHaveBeenCalledWith('tomo');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('runs an item on click', async () => {
    const run = vi.fn();
    render(<Harness run={run} />);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    await userEvent.click(await screen.findByRole('option', { name: /Review/ }));
    expect(run).toHaveBeenCalledWith('review');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('says so when nothing matches, and Enter does nothing', async () => {
    const run = vi.fn();
    render(<Harness run={run} />);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    await userEvent.type(await screen.findByRole('combobox'), 'zzz');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent('No matches for “zzz”');
    await userEvent.keyboard('{Enter}');
    expect(run).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('forgets what was typed once it has closed', async () => {
    render(<Harness run={() => undefined} />);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    await userEvent.type(await screen.findByRole('combobox'), 'dom');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await userEvent.keyboard('{Meta>}k{/Meta}');
    expect(await screen.findByRole('combobox')).toHaveValue('');
  });
});
