import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { ClockProvider } from '@/hooks/clock';
import { TooltipProvider } from '@/ui/Tooltip';
import { ReviewScreen } from '@/screens/Review';

function renderReview() {
  return render(
    <MemoryRouter initialEntries={['/review']}>
      <ClockProvider frozen>
        <TooltipProvider>
          <ReviewScreen />
        </TooltipProvider>
      </ClockProvider>
    </MemoryRouter>,
  );
}
const current = () => screen.getAllByRole('option').find((o) => o.getAttribute('aria-selected') === 'true');

describe('Review flow', () => {
  it('keeps with P, skips with X, moves with J and K, undoes with ⌘Z', async () => {
    renderReview();
    expect(current()).toHaveTextContent('He did not see that coming');

    await userEvent.keyboard('p');
    await screen.findByText('Kept.');
    expect(current()).toHaveTextContent('The cops gave up');
    await waitFor(() => expect(current()).toHaveFocus());
    expect(screen.getByText('1 kept · 0 skipped')).toBeInTheDocument();

    await userEvent.keyboard('x');
    await screen.findByText('Skipped.');
    expect(current()).toHaveTextContent('Chat called it');
    expect(screen.getByText('1 kept · 1 skipped')).toBeInTheDocument();

    await userEvent.keyboard('j');
    expect(current()).toHaveTextContent('Wait for it');
    await userEvent.keyboard('k');
    expect(current()).toHaveTextContent('Chat called it');

    await userEvent.keyboard('{Meta>}z{/Meta}');
    expect(current()).toHaveTextContent('The cops gave up');
    expect(screen.getByText('1 kept · 0 skipped')).toBeInTheDocument();
  });

  it('plays with Space and cycles the safe zone with Z', async () => {
    renderReview();
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Safe zone: off/ })).toBeInTheDocument();
    await userEvent.keyboard('z');
    expect(screen.getByRole('button', { name: /Safe zone: TikTok/ })).toBeInTheDocument();
    await userEvent.keyboard('z');
    expect(screen.getByRole('button', { name: /Safe zone: Reels/ })).toBeInTheDocument();
  });

  it('ignores letter keys while typing in a field, and E focuses the hook', async () => {
    renderReview();
    await userEvent.keyboard('e');
    const hook = screen.getByRole('textbox', { name: /Hook/ });
    expect(hook).toHaveFocus();
    await userEvent.keyboard('{End} pxjk');
    expect(current()).toHaveTextContent('He did not see that coming');
    expect(within(screen.getByRole('listbox')).queryByText('Kept')).not.toBeInTheDocument();
    expect((hook as HTMLInputElement).value.endsWith(' pxjk')).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(hook).not.toHaveFocus();
    await userEvent.keyboard('p');
    await screen.findByText('Kept.');
  });
});
