import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelection } from '@/hooks/useSelection';
import { Chip } from '@/ui/Chip';
import { Field } from '@/ui/Field';
import { Select } from '@/ui/Select';
import { nextSort, SelectAllHeader, SelectCell, SortHeader, Table, type SortState } from '@/ui/Table';

const CLIPS = [{ id: 'c1', title: 'He did not see that coming', score: 91 }, { id: 'c2', title: 'The cops gave up', score: 84 }, { id: 'c3', title: 'Chat called it', score: 72 }];
const IDS = CLIPS.map((c) => c.id);

function Clips() {
  const [sort, setSort] = useState<SortState | null>(null);
  const sel = useSelection(IDS);
  const rows = sort ? [...CLIPS].sort((a, b) => (a.score - b.score) * (sort.direction === 'asc' ? 1 : -1)) : CLIPS;
  return (
    <>
      <Table caption="Clips">
        <thead>
          <tr>
            <SelectAllHeader state={sel.state} onChange={sel.toggleAll} label="Select all clips" />
            <th scope="col">Clip</th>
            <SortHeader column="score" sort={sort} onSort={setSort}>Score</SortHeader>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} data-selected={sel.isSelected(c.id) ? '' : undefined}>
              <SelectCell checked={sel.isSelected(c.id)} onChange={(on) => sel.toggle(c.id, on)} label={`Select ${c.title}`} />
              <td>{c.title}</td>
              <td>{c.score}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p>{`${sel.count} selected`}</p>
    </>
  );
}

describe('Table sorting and selection', () => {
  it('starts a new column ascending and flips the same column', () => {
    expect(nextSort(null, 'score')).toEqual({ column: 'score', direction: 'asc' });
    expect(nextSort({ column: 'score', direction: 'asc' }, 'score')).toEqual({ column: 'score', direction: 'desc' });
    expect(nextSort({ column: 'score', direction: 'desc' }, 'title')).toEqual({ column: 'title', direction: 'asc' });
  });

  it('sorts from the header and reports the direction with aria-sort', async () => {
    render(<Clips />);
    const header = screen.getByRole('columnheader', { name: 'Score' });
    expect(header).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(within(header).getByRole('button', { name: 'Score' }));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Chat called it');
    await userEvent.click(within(header).getByRole('button', { name: 'Score' }));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('He did not see that coming');
  });

  it('selects rows one by one and all at once', async () => {
    render(<Clips />);
    const all = screen.getByRole('checkbox', { name: 'Select all clips' });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select The cops gave up' }));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(all).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(all);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
    expect(all).toBeChecked();
    await userEvent.click(all);
    expect(screen.getByText('0 selected')).toBeInTheDocument();
  });
});

describe('Chip', () => {
  it('names its remove button after the chip text', async () => {
    const onRemove = vi.fn();
    render(<Chip onRemove={onRemove}>#gta6</Chip>);
    await userEvent.click(screen.getByRole('button', { name: 'Remove #gta6' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe('Field trailing controls', () => {
  it('keeps trailing controls reachable next to the input', async () => {
    const onClear = vi.fn();
    render(<Field label="Search clips" defaultValue="cops" trailing={<button type="button" onClick={onClear}>Clear</button>} />);
    expect(screen.getByRole('textbox', { name: 'Search clips' })).toHaveValue('cops');
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe('Select with search', () => {
  const ITEMS = [{ value: 'tomo', label: 'Tomo · GTA VI launch night' }, { value: 'lacy', label: 'Lacy · Live 19:40' }, { value: 'dom', label: 'Dom · Heist practice' }];
  it('filters as you type and reports the choice', async () => {
    const onChange = vi.fn();
    render(<Select label="Project" searchable items={ITEMS} defaultValue="tomo" onValueChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox', { name: /Project/ }));
    const search = await screen.findByRole('combobox', { name: 'Search project' });
    await userEvent.type(search, 'heist');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    await userEvent.click(options[0]!);
    expect(onChange).toHaveBeenCalledWith('dom');
  });
});
