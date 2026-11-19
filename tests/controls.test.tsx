import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '@/ui/Checkbox';
import { RadioCard, RadioCardGroup } from '@/ui/RadioCard';
import { Segmented } from '@/ui/Segmented';
import { Stepper } from '@/ui/Stepper';
import { Toggle } from '@/ui/Toggle';
import { TIMING } from '@/styles/timing';

describe('Segmented', () => {
  function Filter({ onChange }: { onChange?: (v: string) => void }) {
    const [v, setV] = useState('all');
    return (
      <Segmented
        label="Show clips"
        value={v}
        onValueChange={(n) => { setV(n); onChange?.(n); }}
        items={[{ value: 'all', label: 'All', count: 8 }, { value: 'strong', label: 'Strong', count: 4 }, { value: 'maybe', label: 'Maybe', count: 3 }, { value: 'weak', label: 'Weak', count: 1 }]}
      />
    );
  }
  it('moves with arrow keys and jumps with Home and End', async () => {
    const onChange = vi.fn();
    render(<Filter onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    await userEvent.click(radios[0]!);
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: /Strong/ })).toBeChecked();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('radio', { name: /Weak/ })).toBeChecked();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: /All/ })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('weak');
  });
  it('keeps arrow keys away from page hotkeys', async () => {
    const seen = vi.fn();
    window.addEventListener('keydown', seen);
    render(<Filter />);
    await userEvent.click(screen.getAllByRole('radio')[0]!);
    await userEvent.keyboard('{ArrowRight}');
    window.removeEventListener('keydown', seen);
    expect(seen.mock.calls.filter(([e]) => (e as KeyboardEvent).key === 'ArrowRight')).toHaveLength(0);
  });
});

describe('Toggle', () => {
  it('switches with click and Space, and reports the state', async () => {
    const onChange = vi.fn();
    render(<Toggle label="Score clips with AI" onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Score clips with AI' });
    expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    expect(sw).toBeChecked();
    sw.focus();
    await userEvent.keyboard(' ');
    expect(sw).not.toBeChecked();
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
  });
  it('does nothing when disabled', async () => {
    render(<Toggle label="Off" disabled />);
    const sw = screen.getByRole('switch', { name: 'Off' });
    await userEvent.click(sw);
    expect(sw).not.toBeChecked();
  });
});

describe('Checkbox', () => {
  it('toggles by click on its label and by Space', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Chat called it" onCheckedChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Chat called it' });
    await userEvent.click(screen.getByText('Chat called it'));
    expect(box).toBeChecked();
    box.focus();
    await userEvent.keyboard(' ');
    expect(box).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });
  it('shows the mixed state', () => {
    render(<Checkbox aria-label="All moments" indeterminate />);
    expect(screen.getByRole('checkbox', { name: 'All moments' })).toHaveAttribute('aria-checked', 'mixed');
  });
});

describe('RadioCard group', () => {
  it('selects one card and moves with arrows', async () => {
    const onChange = vi.fn();
    render(
      <RadioCardGroup label="Workflow" defaultValue="dom" onValueChange={onChange}>
        <RadioCard value="tomo" title="Tomo launch night" />
        <RadioCard value="lacy" title="Lacy pool" />
        <RadioCard value="dom" title="Dom heist practice" />
      </RadioCardGroup>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Workflow' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dom heist practice' })).toBeChecked();
    await userEvent.click(screen.getByText('Tomo launch night'));
    expect(screen.getByRole('radio', { name: 'Tomo launch night' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Dom heist practice' })).not.toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Lacy pool' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('lacy');
  });
});

describe('Stepper', () => {
  function Live({ initial, min, max }: { initial: number; min: number; max: number }) {
    const [v, setV] = useState(initial);
    return <Stepper label="Start" value={v} onChange={setV} min={min} max={max} step={0.1} format={(n) => n.toFixed(1)} />;
  }
  it('steps once per keyboard press and disables at the limit', async () => {
    render(<Live initial={9.9} min={9.8} max={10} />);
    const more = screen.getByRole('button', { name: 'Start later' });
    more.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('10.0')).toBeInTheDocument();
    expect(more).toBeDisabled();
    const less = screen.getByRole('button', { name: 'Start earlier' });
    less.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('9.8')).toBeInTheDocument();
    expect(less).toBeDisabled();
  });
  it('repeats while held and stops on release', () => {
    vi.useFakeTimers();
    render(<Live initial={5} min={0} max={10} />);
    const more = screen.getByRole('button', { name: 'Start later' });
    fireEvent.pointerDown(more, { button: 0 });
    expect(screen.getByText('5.1')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(TIMING.repeatWait + TIMING.repeatEvery * 3 + 5); });
    expect(screen.getByText('5.4')).toBeInTheDocument();
    fireEvent.pointerUp(more);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText('5.4')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
