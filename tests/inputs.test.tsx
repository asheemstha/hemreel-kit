import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileField, formatFileSize, type PickedFile } from '@/ui/FileField';
import { NumberField } from '@/ui/NumberField';
import { SearchField } from '@/ui/SearchField';
import { SecretField, type SecretStatus } from '@/ui/SecretField';
import { Slider, snapToMark } from '@/ui/Slider';
import { readTimecode, TimecodeField } from '@/ui/TimecodeField';
import { TIMING } from '@/styles/timing';

afterEach(() => {
  vi.useRealTimers();
});

describe('Slider', () => {
  // jsdom has no layout, so Base UI cannot place the thumb and keeps it hidden. `hidden: true` still finds the slider inside it,
  // but a hidden element computes no name, so the label is checked through aria-labelledby.
  const sliderNamed = (name: string) => {
    const slider = screen.getByRole('slider', { hidden: true });
    expect(document.getElementById(slider.getAttribute('aria-labelledby') ?? '')).toHaveTextContent(name);
    return slider;
  };
  it('steps with the arrow keys, jumps with Home and End, and reads its value in words', async () => {
    const onChange = vi.fn();
    render(<Slider label="Clip length" defaultValue={24} min={8} max={60} format={(v) => `${v} s`} onValueChange={onChange} />);
    const slider = sliderNamed('Clip length');
    expect(slider).toHaveAttribute('aria-valuetext', '24 s');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(25);
    expect(slider).toHaveAttribute('aria-valuetext', '25 s');
    expect(screen.getByText('25 s')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith(23);
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(8);
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(60);
    expect(screen.getByText('60 s')).toBeInTheDocument();
  });
  it('follows a controlled value and does nothing when disabled', () => {
    const onChange = vi.fn();
    render(<Slider label="Caption size" value={56} min={24} max={96} onValueChange={onChange} disabled />);
    const slider = sliderNamed('Caption size');
    expect(slider).toBeDisabled();
    expect(slider).toHaveAttribute('aria-valuenow', '56');
    expect(onChange).not.toHaveBeenCalled();
  });
  it('snaps to a mark only when the value is close to it', () => {
    expect(snapToMark(1, [0], 2)).toBe(0);
    expect(snapToMark(-2, [0], 2)).toBe(0);
    expect(snapToMark(5, [0], 2)).toBe(5);
    expect(snapToMark(26, [0, 25, 50], 2)).toBe(25);
    expect(snapToMark(26, [], 2)).toBe(26);
  });
});

describe('NumberField', () => {
  it('steps with the arrow keys, by 10 with Shift, and with the buttons', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Clip length" defaultValue={24} min={8} max={60} unit="s" unitLabel="seconds" onValueChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Clip length' });
    expect(input).toHaveValue('24');
    expect(input).toHaveAccessibleDescription('seconds'); // the unit in full, not the short "s"
    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('25');
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    expect(input).toHaveValue('35');
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveValue('34');
    await userEvent.click(screen.getByRole('button', { name: 'Increase clip length' }));
    expect(input).toHaveValue('35');
    await userEvent.click(screen.getByRole('button', { name: 'Decrease clip length' }));
    expect(input).toHaveValue('34');
    expect(onChange).toHaveBeenLastCalledWith(34);
  });
  it('lets you type, clamps to the limits on blur and turns the button off there', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Clips to find" defaultValue={10} min={1} max={30} unit="clips" onValueChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Clips to find' });
    await userEvent.clear(input);
    await userEvent.type(input, '99');
    await userEvent.tab();
    expect(input).toHaveValue('30');
    expect(onChange).toHaveBeenLastCalledWith(30);
    expect(screen.getByRole('button', { name: 'Increase clips to find' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease clips to find' })).toBeEnabled();
  });
  it('shows an error and marks the input invalid', () => {
    render(<NumberField label="Clip length" defaultValue={12} unit="s" error="The Tomo campaign needs clips of 15 s or longer." />);
    const input = screen.getByRole('textbox', { name: 'Clip length' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/15 s or longer/);
  });
});

describe('TimecodeField', () => {
  function Live({ initial = 0, min, max, onChange }: { initial?: number; min?: number; max?: number; onChange?: (v: number) => void }) {
    const [v, setV] = useState(initial);
    return <TimecodeField label="Scan from" value={v} min={min} max={max} onChange={(n) => { setV(n); onChange?.(n); }} />;
  }
  it('reads h:mm:ss, m:ss and plain seconds, and refuses anything else', () => {
    expect(readTimecode('1:27:09.2')).toBe(5229.2);
    expect(readTimecode('87:09')).toBe(5229);
    expect(readTimecode('5229.2')).toBe(5229.2);
    expect(readTimecode(' 0:05 ')).toBe(5);
    expect(readTimecode('1:75:00')).toBeNull();
    expect(readTimecode('0:61')).toBeNull();
    expect(readTimecode('soon')).toBeNull();
    expect(readTimecode('')).toBeNull();
  });
  it('commits a typed time on Enter and on blur', async () => {
    const onChange = vi.fn();
    render(<Live onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Scan from' });
    expect(input).toHaveValue('0:00.0');
    await userEvent.clear(input);
    await userEvent.type(input, '87:09{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(5229);
    expect(input).toHaveValue('1:27:09.0');
    await userEvent.clear(input);
    await userEvent.type(input, '5229.2');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(5229.2);
    expect(input).toHaveValue('1:27:09.2');
  });
  it('keeps a bad entry, shows the error and does not change the value', async () => {
    const onChange = vi.fn();
    render(<Live initial={30} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Scan from' });
    await userEvent.clear(input);
    await userEvent.type(input, 'soon{Enter}');
    expect(input).toHaveValue('soon');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Use h:mm:ss, for example 1:27:09')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    // Esc puts the old time back and clears the error
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('0:30.0');
    expect(screen.queryByText('Use h:mm:ss, for example 1:27:09')).not.toBeInTheDocument();
  });
  it('moves a time past the limit back to it and says so', async () => {
    const onChange = vi.fn();
    render(<Live initial={60} max={11560} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Scan from' });
    await userEvent.clear(input);
    await userEvent.type(input, '4:00:00{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(11560);
    expect(input).toHaveValue('3:12:40.0');
    expect(screen.getByText('Moved to the latest time allowed, 3:12:40.0.')).toBeInTheDocument();
  });
  it('changes by 1 s with Up and Down, 10 s with Shift and 0.1 s with Alt, inside the limits', async () => {
    const onChange = vi.fn();
    render(<Live initial={5229.2} min={0} max={5241} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Scan from' });
    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(5230.2);
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    expect(onChange).toHaveBeenLastCalledWith(5240.2);
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(onChange).toHaveBeenLastCalledWith(5240.1);
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    expect(onChange).toHaveBeenLastCalledWith(5241);
    expect(input).toHaveValue('1:27:21.0');
  });
  it('keeps arrow keys away from page hotkeys', async () => {
    const seen = vi.fn();
    window.addEventListener('keydown', seen);
    render(<Live initial={10} />);
    screen.getByRole('textbox', { name: 'Scan from' }).focus();
    await userEvent.keyboard('{ArrowUp}');
    window.removeEventListener('keydown', seen);
    expect(seen.mock.calls.filter(([e]) => (e as KeyboardEvent).key === 'ArrowUp')).toHaveLength(0);
  });
});

describe('SecretField', () => {
  function Live({ status = 'saved', onTest, onRemove }: { status?: SecretStatus; onTest?: () => void; onRemove?: () => void }) {
    const [key, setKey] = useState('sk-ant-EXAMPLE-0000');
    return <SecretField label="Claude API key" value={key} onValueChange={setKey} status={status} onTest={onTest} onRemove={() => { setKey(''); onRemove?.(); }} />;
  }
  it('masks the key until Show key is pressed', async () => {
    render(<Live />);
    const input = screen.getByLabelText('Claude API key');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'off');
    const show = screen.getByRole('button', { name: 'Show key' });
    expect(show).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(show);
    expect(input).toHaveAttribute('type', 'text');
    const hide = screen.getByRole('button', { name: 'Hide key' });
    expect(hide).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(hide);
    expect(input).toHaveAttribute('type', 'password');
  });
  it('tests and removes the key, and hides both buttons once there is no key', async () => {
    const onTest = vi.fn();
    const onRemove = vi.fn();
    render(<Live onTest={onTest} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Test key' }));
    expect(onTest).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Claude API key')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Test key' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show key' })).not.toBeInTheDocument();
  });
  it('says what the test found', () => {
    const { rerender } = render(<SecretField label="Claude API key" value="sk-ant-EXAMPLE-0000" onValueChange={() => {}} status="testing" onTest={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('Checking the key');
    expect(screen.getByRole('button', { name: 'Test key' })).toBeDisabled();
    rerender(<SecretField label="Claude API key" value="sk-ant-EXAMPLE-0000" onValueChange={() => {}} status="ok" onTest={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('Key works');
    rerender(<SecretField label="Claude API key" value="sk-ant-EXAMPLE-0000" onValueChange={() => {}} status="failed" statusText="The key was rejected. Copy it again from the Claude console." onTest={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('The key was rejected. Copy it again from the Claude console.');
    const input = screen.getByLabelText('Claude API key');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/The key was rejected/);
    rerender(<SecretField label="Claude API key" value="sk-ant-EXAMPLE-0000" onValueChange={() => {}} status="saved" onTest={() => {}} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('never writes the key anywhere but the input value', () => {
    const { container } = render(<SecretField label="Claude API key" value="sk-ant-EXAMPLE-0000" onValueChange={() => {}} status="ok" onTest={() => {}} onRemove={() => {}} />);
    const input = screen.getByLabelText('Claude API key');
    input.removeAttribute('value'); // React mirrors the value into this one attribute; nothing else may hold the key
    expect(container.innerHTML).not.toContain('sk-ant-EXAMPLE-0000');
    expect(container.textContent).not.toContain('sk-ant-EXAMPLE-0000');
  });
});

describe('SearchField', () => {
  function Live({ onSearch, onSubmit, count }: { onSearch?: (v: string) => void; onSubmit?: (v: string) => void; count?: string }) {
    const [text, setText] = useState('');
    return <SearchField label="Search clips" value={text} onValueChange={setText} onSearch={onSearch} onSubmit={onSubmit} count={count} />;
  }
  it('shows a clear button once there is text; pressing it empties the field and keeps focus', async () => {
    render(<Live />);
    const box = screen.getByRole('searchbox', { name: 'Search clips' });
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
    await userEvent.type(box, 'tomo');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(box).toHaveValue('');
    expect(box).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });
  it('clears on the first Esc and leaves the field on the second, without the page seeing either', async () => {
    const seen = vi.fn();
    window.addEventListener('keydown', seen);
    render(<Live />);
    const box = screen.getByRole('searchbox', { name: 'Search clips' });
    await userEvent.type(box, 'chat');
    await userEvent.keyboard('{Escape}');
    expect(box).toHaveValue('');
    expect(box).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(box).not.toHaveFocus();
    window.removeEventListener('keydown', seen);
    expect(seen.mock.calls.filter(([e]) => (e as KeyboardEvent).key === 'Escape')).toHaveLength(0);
  });
  it('reports the text after a pause in typing, and at once on Enter', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const onSubmit = vi.fn();
    render(<Live onSearch={onSearch} onSubmit={onSubmit} />);
    const box = screen.getByRole('searchbox', { name: 'Search clips' });
    fireEvent.change(box, { target: { value: 'to' } });
    fireEvent.change(box, { target: { value: 'tomo' } });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(TIMING.searchDebounce + 5); });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenLastCalledWith('tomo');
    fireEvent.change(box, { target: { value: 'tomo l' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onSearch).toHaveBeenLastCalledWith('tomo l');
    expect(onSubmit).toHaveBeenCalledWith('tomo l');
    act(() => { vi.advanceTimersByTime(TIMING.searchDebounce + 5); });
    expect(onSearch).toHaveBeenCalledTimes(2);
  });
  it('gives the result count to assistive tech', () => {
    render(<Live count="12 clips" />);
    expect(screen.getByRole('status')).toHaveTextContent('12 clips');
  });
});

describe('FileField', () => {
  const png = () => new File(['x'], 'tomo-overlay.png', { type: 'image/png' });
  const txt = () => new File(['x'], 'clip-notes.txt', { type: 'text/plain' });
  function Live({ onPick, onRemove }: { onPick?: (f: File) => void; onRemove?: () => void }) {
    const [file, setFile] = useState<PickedFile | null>(null);
    return (
      <FileField
        label="Campaign overlay image"
        kind="image"
        file={file}
        onPick={(f) => { setFile({ name: f.name, size: formatFileSize(f.size) }); onPick?.(f); }}
        onRemove={() => { setFile(null); onRemove?.(); }}
      />
    );
  }
  const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;

  it('takes a picked image, shows its name and moves focus to Replace', () => {
    const onPick = vi.fn();
    const { container } = render(<Live onPick={onPick} />);
    expect(screen.getByRole('group', { name: 'Campaign overlay image' })).toBeInTheDocument();
    expect(screen.getByText('Drop an image or choose one')).toBeInTheDocument();
    fireEvent.change(fileInput(container), { target: { files: [png()] } });
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('tomo-overlay.png')).toBeInTheDocument();
    expect(screen.getByText('1 B')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replace' })).toHaveFocus();
  });
  it('refuses the wrong type and says which types work', () => {
    const onPick = vi.fn();
    const { container } = render(<Live onPick={onPick} />);
    fireEvent.change(fileInput(container), { target: { files: [txt()] } });
    expect(onPick).not.toHaveBeenCalled();
    expect(screen.getByText("clip-notes.txt isn't an image. Use PNG, JPG or WebP.")).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Error: clip-notes.txt');
    // a good file clears the error
    fireEvent.change(fileInput(container), { target: { files: [png()] } });
    expect(screen.queryByText(/isn't an image/)).not.toBeInTheDocument();
  });
  it('takes a dropped file', () => {
    const onPick = vi.fn();
    const { container } = render(<Live onPick={onPick} />);
    const target = container.querySelector('.hr-file-drop') as HTMLElement;
    fireEvent.dragEnter(target, { dataTransfer: { files: [] } });
    expect(screen.getByText('Drop to use this file')).toBeInTheDocument();
    fireEvent.drop(target, { dataTransfer: { files: [png()] } });
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('tomo-overlay.png')).toBeInTheDocument();
  });
  it('removes the file and hands focus back to Choose', async () => {
    const onRemove = vi.fn();
    const { container } = render(<Live onRemove={onRemove} />);
    fireEvent.change(fileInput(container), { target: { files: [png()] } });
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('tomo-overlay.png')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose' })).toHaveFocus();
  });
  it('writes sizes in words', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(248_000)).toBe('248 KB');
    expect(formatFileSize(18_400_000)).toBe('18.4 MB');
    expect(formatFileSize(3_200_000_000)).toBe('3.2 GB');
  });
});
