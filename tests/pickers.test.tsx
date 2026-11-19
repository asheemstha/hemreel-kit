import { useState, type ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CAPTION_FONTS, CAPTION_SWATCHES, DEFAULT_CAPTION_TEMPLATE, TEMPLATE_VARIABLES, captionFontStack } from '@/data/captionStyle';
import { ColorField, normalizeHex } from '@/ui/ColorField';
import { addDays, addMonths, Calendar, DatePicker, daysInRange, formatDate, formatDateRange, isISODate, monthWeeks, type DateRange } from '@/ui/DatePicker';
import { FontPicker } from '@/ui/FontPicker';
import { parseTags, TagInput } from '@/ui/TagInput';
import { renderTemplate, TemplateField, unknownTokens } from '@/ui/TemplateField';

const WHITE = CAPTION_SWATCHES[0] ?? '';
const YELLOW = CAPTION_SWATCHES[2] ?? '';
const ORANGE_RED = CAPTION_SWATCHES[3] ?? '';

describe('ColorField', () => {
  function Live({ onChange }: { onChange?: (v: string) => void }) {
    const [v, setV] = useState(WHITE);
    return <ColorField label="Caption text" value={v} onValueChange={(n) => { setV(n); onChange?.(n); }} />;
  }
  it('normalises hex text', () => {
    expect(normalizeHex('ffe100')).toBe(YELLOW);
    expect(normalizeHex('#fe1')).toBe('#FFEE11'); // check-tokens: allow
    expect(normalizeHex(' #FF4500 ')).toBe(ORANGE_RED);
    expect(normalizeHex('#ff45')).toBeNull();
    expect(normalizeHex('yellow')).toBeNull();
  });
  it('names the button with its label and value, and picks a swatch', async () => {
    const onChange = vi.fn();
    render(<Live onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: `Caption text ${WHITE}` });
    await userEvent.click(trigger);
    expect(screen.getAllByRole('radio')).toHaveLength(12);
    expect(screen.getByRole('radio', { name: `White, ${WHITE}` })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: `Yellow, ${YELLOW}` }));
    expect(onChange).toHaveBeenLastCalledWith(YELLOW);
    expect(screen.getByRole('radio', { name: `Yellow, ${YELLOW}` })).toBeChecked();
    expect(screen.getByRole('button', { name: `Caption text ${YELLOW}` })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Caption text hex' })).toHaveValue(YELLOW);
  });
  it('moves through the palette with the arrow keys', async () => {
    const onChange = vi.fn();
    render(<Live onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Caption text/ }));
    screen.getByRole('radio', { name: /White/ }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: /^Black/ })).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: /Purple/ })).toBeChecked();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: /White/ })).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(3);
  });
  it('accepts a typed hex with or without the hash and flags a bad one', async () => {
    const onChange = vi.fn();
    render(<Live onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Caption text/ }));
    const hex = screen.getByRole('textbox', { name: 'Caption text hex' });
    await userEvent.clear(hex);
    await userEvent.type(hex, 'ff4500');
    expect(onChange).toHaveBeenLastCalledWith(ORANGE_RED);
    await userEvent.clear(hex);
    await userEvent.type(hex, '#zz{Enter}');
    expect(screen.getByText(/Use 6 letters and numbers/)).toBeInTheDocument();
    expect(hex).toHaveAttribute('aria-invalid', 'true');
    expect(onChange).toHaveBeenLastCalledWith(ORANGE_RED);
    await userEvent.clear(hex);
    await userEvent.type(hex, 'fe1{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('#FFEE11'); // check-tokens: allow
    expect(screen.queryByText(/Use 6 letters and numbers/)).not.toBeInTheDocument();
  });
});

describe('FontPicker', () => {
  it('draws the chosen font in itself and reports a change', async () => {
    const onChange = vi.fn();
    render(<FontPicker label="Caption font" defaultValue="Impact" onValueChange={onChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Caption font' });
    expect(trigger).toHaveTextContent('Impact');
    expect(screen.getByText('Impact')).toHaveStyle({ fontFamily: captionFontStack('Impact') });
    await userEvent.click(trigger);
    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(CAPTION_FONTS.length);
    const georgia = screen.getByRole('option', { name: 'Georgia' });
    expect(georgia.querySelector('.hr-font__name')).toHaveStyle({ fontFamily: captionFontStack('Georgia') });
    await userEvent.click(georgia);
    expect(onChange).toHaveBeenCalledWith('Georgia');
  });
});

describe('TagInput', () => {
  function Live({ initial = ['#ad', '#gta6'], onChange, ...rest }: { initial?: string[]; onChange?: (t: string[]) => void } & Partial<ComponentProps<typeof TagInput>>) {
    const [tags, setTags] = useState(initial);
    return <TagInput label="Hashtags" prefix="#" locked={['#ad']} {...rest} value={tags} onChange={(t) => { setTags(t); onChange?.(t); }} />;
  }
  it('splits text into tags and adds the prefix once', () => {
    expect(parseTags('gta6, #tomo  ##fyp', '#')).toEqual(['#gta6', '#tomo', '#fyp']);
    expect(parseTags(' # , ', '#')).toEqual([]);
    expect(parseTags('launch night')).toEqual(['launch', 'night']);
  });
  it('adds with Enter, comma and space, and when the field is left', async () => {
    const onChange = vi.fn();
    render(<Live onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Hashtags' });
    await userEvent.type(input, 'tomo{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['#ad', '#gta6', '#tomo']);
    await userEvent.type(input, '#fyp,');
    expect(onChange).toHaveBeenLastCalledWith(['#ad', '#gta6', '#tomo', '#fyp']);
    await userEvent.type(input, 'viral ');
    expect(onChange).toHaveBeenLastCalledWith(['#ad', '#gta6', '#tomo', '#fyp', '#viral']);
    await userEvent.type(input, 'clips');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(['#ad', '#gta6', '#tomo', '#fyp', '#viral', '#clips']);
    expect(input).toHaveValue('');
  });
  it('ignores a duplicate and says so', async () => {
    const onChange = vi.fn();
    render(<Live onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Hashtags' }), 'GTA6{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('#GTA6 is already added.');
  });
  it('stops at the limit and shows the count', async () => {
    const onChange = vi.fn();
    render(<Live max={3} onChange={onChange} />);
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: 'Hashtags' });
    await userEvent.type(input, 'tomo{Enter}fyp{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
    expect(screen.getByText('3 is the most you can add. Remove one first.')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
  it('removes the last tag with Backspace but never a locked one', async () => {
    const onChange = vi.fn();
    render(<Live onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Hashtags' });
    expect(screen.queryByRole('button', { name: 'Remove #ad' })).not.toBeInTheDocument();
    await userEvent.click(input);
    await userEvent.keyboard('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith(['#ad']);
    await userEvent.keyboard('{Backspace}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText('#ad')).toBeInTheDocument();
  });
  it('removes a tag with its button and walks the buttons with the arrow keys', async () => {
    const onChange = vi.fn();
    render(<Live initial={['#ad', '#gta6', '#tomo']} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Hashtags' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Remove #tomo' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Remove #gta6' })).toHaveFocus();
    await userEvent.keyboard('{Delete}');
    expect(onChange).toHaveBeenLastCalledWith(['#ad', '#tomo']);
    expect(input).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Remove #tomo' }));
    expect(onChange).toHaveBeenLastCalledWith(['#ad']);
  });
  it('adds every tag in a pasted list', async () => {
    const onChange = vi.fn();
    render(<Live onChange={onChange} />);
    await userEvent.click(screen.getByRole('textbox', { name: 'Hashtags' }));
    await userEvent.paste('tomo, #fyp gta6\n#launchnight');
    expect(onChange).toHaveBeenLastCalledWith(['#ad', '#gta6', '#tomo', '#fyp', '#launchnight']);
  });
  it('refuses a tag the validator rejects and keeps it in the box', async () => {
    const onChange = vi.fn();
    render(<Live onChange={onChange} validate={(t) => (/^#\w+$/.test(t) ? null : 'Use letters, numbers and underscores only.')} />);
    const input = screen.getByRole('textbox', { name: 'Hashtags' });
    await userEvent.type(input, 'gta-6{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Use letters, numbers and underscores only.')).toBeInTheDocument();
    expect(input).toHaveValue('gta-6');
    await userEvent.type(input, '{Backspace}{Backspace}');
    expect(screen.queryByText('Use letters, numbers and underscores only.')).not.toBeInTheDocument();
  });
});

describe('TemplateField', () => {
  function Live({ initial, onChange }: { initial: string; onChange?: (v: string) => void }) {
    const [v, setV] = useState(initial);
    return <TemplateField label="Caption template" value={v} onChange={(n) => { setV(n); onChange?.(n); }} variables={TEMPLATE_VARIABLES} />;
  }
  it('fills variables with samples and lists unknown ones', () => {
    expect(renderTemplate(DEFAULT_CAPTION_TEMPLATE, TEMPLATE_VARIABLES)).toBe('He did not see that coming\n\nTomo in GTA 6\n#ad #gta6 #tomo #fyp');
    expect(renderTemplate('{hook}\n\n\n\n{game}', TEMPLATE_VARIABLES)).toBe('He did not see that coming\n\n{game}');
    expect(unknownTokens('{hook} {game} {clip} {game}', TEMPLATE_VARIABLES)).toEqual(['game', 'clip']);
  });
  it('shows the preview and updates it while typing', async () => {
    render(<Live initial="{streamer}: {hook}" />);
    const preview = screen.getByRole('group', { name: 'Preview' });
    expect(preview).toHaveTextContent('Tomo: He did not see that coming');
    const area = screen.getByRole('textbox', { name: 'Caption template' });
    await userEvent.clear(area);
    expect(preview).toHaveTextContent('Nothing to show yet.');
  });
  it('inserts a variable at the caret and puts the caret after it', async () => {
    const onChange = vi.fn();
    render(<Live initial="AB" onChange={onChange} />);
    const area = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Caption template' });
    await userEvent.click(area);
    area.setSelectionRange(1, 1);
    await userEvent.click(screen.getByRole('button', { name: 'Insert Hook' }));
    expect(onChange).toHaveBeenLastCalledWith('A{hook}B');
    expect(area).toHaveFocus();
    expect(area.selectionStart).toBe(7);
    await userEvent.keyboard('!');
    expect(onChange).toHaveBeenLastCalledWith('A{hook}!B');
  });
  it('adds a variable at the end before the box has been used', async () => {
    const onChange = vi.fn();
    render(<Live initial="{hook}" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Insert Hashtags' }));
    expect(onChange).toHaveBeenLastCalledWith('{hook}{hashtags}');
  });
  it('names an unknown variable in the error line', () => {
    render(<Live initial="{hook} {game}" />);
    expect(screen.getByText('{game} is not a variable.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Caption template' })).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('date helpers', () => {
  it('adds days and months across month and year ends', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2026-11-18', 2)).toBe('2027-01-18');
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-15');
  });
  it('lays a month out in weeks from Monday', () => {
    const weeks = monthWeeks(2026, 11);
    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2026-11-01']);
    expect(weeks[5]).toEqual(['2026-11-30', null, null, null, null, null, null]);
    expect(monthWeeks(2027, 2)).toHaveLength(4); // February 2027 starts on a Monday
  });
  it('formats dates and ranges and checks real days', () => {
    expect(formatDate('2026-11-08')).toBe('8 Nov 2026');
    expect(formatDateRange('2026-11-12', '2026-11-18')).toBe('12 Nov to 18 Nov 2026');
    expect(formatDateRange('2026-12-28', '2027-01-03')).toBe('28 Dec 2026 to 3 Jan 2027');
    expect(formatDateRange('2026-11-18', '2026-11-18')).toBe('18 Nov 2026');
    expect(daysInRange('2026-11-12', '2026-11-18')).toBe(7);
    expect(isISODate('2026-02-28')).toBe(true);
    expect(isISODate('2026-02-30')).toBe(false);
    expect(isISODate('18 Nov 2026')).toBe(false);
  });
});

describe('Calendar', () => {
  const TODAY = '2026-11-18';
  const day = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}`) });
  it('picks a day and marks today', async () => {
    const onChange = vi.fn();
    render(<Calendar value={null} onChange={onChange} today={TODAY} />);
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(day('Wednesday 18 November 2026')).toHaveAttribute('aria-current', 'date');
    await userEvent.click(day('Friday 20 November 2026'));
    expect(onChange).toHaveBeenCalledWith('2026-11-20');
  });
  it('moves by day, week and month from the keyboard and keeps one day in the tab order', async () => {
    render(<Calendar value={TODAY} onChange={() => {}} today={TODAY} />);
    day('Wednesday 18 November 2026').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(day('Thursday 19 November 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(day('Thursday 26 November 2026')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(day('Monday 23 November 2026')).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(day('Sunday 29 November 2026')).toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeInTheDocument();
    expect(day('Tuesday 29 December 2026')).toHaveFocus();
    expect(screen.getAllByRole('button').filter((b) => b.getAttribute('tabindex') === '0' && b.hasAttribute('data-date'))).toHaveLength(1);
    await userEvent.keyboard('{Enter}');
  });
  it('changes month with the buttons', async () => {
    render(<Calendar value={TODAY} onChange={() => {}} today={TODAY} />);
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
  });
  it('disables days outside min and max and never moves onto them', async () => {
    const onChange = vi.fn();
    render(<Calendar value={TODAY} onChange={onChange} today={TODAY} min="2026-11-18" max="2026-11-20" />);
    expect(day('Tuesday 17 November 2026')).toBeDisabled();
    expect(day('Saturday 21 November 2026')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
    day('Wednesday 18 November 2026').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(day('Wednesday 18 November 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(day('Friday 20 November 2026')).toHaveFocus();
  });
  it('builds a range from two picks and swaps them when the second is earlier', async () => {
    const seen: DateRange[] = [];
    function Live() {
      const [v, setV] = useState<DateRange>({ from: null, to: null });
      return <Calendar mode="range" value={v} onChange={(n) => { setV(n); seen.push(n); }} today={TODAY} />;
    }
    render(<Live />);
    await userEvent.click(day('Wednesday 18 November 2026'));
    await userEvent.click(day('Thursday 12 November 2026'));
    expect(seen).toEqual([{ from: '2026-11-18', to: null }, { from: '2026-11-12', to: '2026-11-18' }]);
    expect(screen.getAllByRole('gridcell', { selected: true })).toHaveLength(2);
    await userEvent.click(day('Monday 2 November 2026'));
    expect(seen[2]).toEqual({ from: '2026-11-02', to: null });
  });
});

describe('DatePicker', () => {
  it('shows the value, opens the calendar and closes when a day is picked', async () => {
    const onChange = vi.fn();
    function Live() {
      const [v, setV] = useState<string | null>('2026-11-18');
      return <DatePicker label="Post on" value={v} onChange={(n) => { setV(n); onChange(n); }} />;
    }
    render(<Live />);
    await userEvent.click(screen.getByRole('button', { name: 'Post on 18 Nov 2026' }));
    await userEvent.click(await screen.findByRole('button', { name: /^Friday 20 November 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-11-20');
    expect(screen.getByRole('button', { name: 'Post on 20 Nov 2026' })).toBeInTheDocument();
  });
  it('shows a placeholder when empty and a range as one line', () => {
    render(
      <>
        <DatePicker label="Post on" value={null} onChange={() => {}} />
        <DatePicker mode="range" label="Earnings period" value={{ from: '2026-11-12', to: '2026-11-18' }} onChange={() => {}} />
        <DatePicker mode="range" label="Posted between" value={{ from: '2026-11-15', to: null }} onChange={() => {}} />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Post on Choose a date' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Earnings period 12 Nov to 18 Nov 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Posted between From 15 Nov 2026' })).toBeInTheDocument();
  });
  it('sets a quick range', async () => {
    const onChange = vi.fn();
    function Live() {
      const [v, setV] = useState<DateRange>({ from: null, to: null });
      return <DatePicker mode="range" label="Earnings period" value={v} onChange={(n) => { setV(n); onChange(n); }} />;
    }
    render(<Live />);
    await userEvent.click(screen.getByRole('button', { name: 'Earnings period Choose dates' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Last 7 days' }));
    const range = onChange.mock.calls[0]?.[0] as DateRange;
    expect(range.from && range.to ? daysInRange(range.from, range.to) : 0).toBe(7);
    expect(screen.getByRole('button', { name: 'Last 7 days' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('7 days')).toBeInTheDocument();
  });
  it('is not affected by clicks while disabled', () => {
    render(<DatePicker label="Post on" value="2026-11-20" onChange={() => {}} disabled />);
    const trigger = screen.getByRole('button', { name: 'Post on 20 Nov 2026' });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});
