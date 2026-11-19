import { describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ClockProvider, T0 } from '@/hooks/clock';
import { HomeScreen } from '@/screens/Home';
import { clipStore } from '@/state/clips';
import { TooltipProvider } from '@/ui/Tooltip';

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/home']}>
      <ClockProvider frozen>
        <TooltipProvider>
          <Routes>
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/review" element={<p>Review screen</p>} />
            <Route path="/clips" element={<p>Clips screen</p>} />
            <Route path="/history" element={<p>History screen</p>} />
          </Routes>
        </TooltipProvider>
      </ClockProvider>
    </MemoryRouter>,
  );
}
// direct children only: the review row holds a list of thumbs of its own
const jobs = () => Array.from(screen.getByRole('list', { name: 'Needs you' }).children) as HTMLElement[];

describe('Home reads the clip store', () => {
  it('shows the designed night: four jobs, most urgent first', () => {
    renderHome();
    expect(screen.getByText('4 jobs, most urgent first')).toBeInTheDocument();
    const rows = jobs();
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveTextContent('Ran out of road');
    expect(rows[0]).toHaveTextContent('Posted to TikTok 17 min ago');
    expect(within(rows[0] as HTMLElement).getByRole('button', { name: /Paste post link/ })).toBeInTheDocument();
    expect(rows[1]).toHaveTextContent('The long way round');
    expect(rows[1]).toHaveTextContent('Window closed 11 min ago');
    expect(rows[2]).toHaveTextContent('2 kept clips, ready to post');
    expect(rows[2]).toHaveTextContent('≈ $25 at 10K views each');
    expect(rows[3]).toHaveTextContent('8 clips to review. 4 strong.');
    expect(screen.getByText('4 strong · 3 maybe · 1 weak')).toBeInTheDocument();
    expect(screen.getByText('≈ $60')).toBeInTheDocument();
    expect(screen.getByText('2 links submitted')).toBeInTheDocument();
    expect(screen.getByText('In time')).toBeInTheDocument();
  });

  it('a submitted link leaves the list, clears the Link due card and the top bar chip, and is counted', () => {
    renderHome();
    expect(screen.getByRole('link', { name: /1 link due/ })).toBeInTheDocument();
    act(() => clipStore.submit('c11', T0));
    expect(jobs()).toHaveLength(3);
    expect(screen.queryByText('Ran out of road')).not.toBeInTheDocument();
    expect(screen.getByText('No link is waiting')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /link due/ })).not.toBeInTheDocument();
    expect(screen.getByText('3 links submitted')).toBeInTheDocument();
  });

  it('a late submit is counted as late, never as in time', () => {
    renderHome();
    act(() => clipStore.submit('c12', T0));
    expect(screen.getByText('3 links submitted')).toBeInTheDocument();
    expect(screen.getByText('1 late')).toBeInTheDocument();
    expect(screen.queryByText('In time')).not.toBeInTheDocument();
  });

  it('a dismissed clip leaves the list', () => {
    renderHome();
    act(() => clipStore.dismiss('c12'));
    expect(jobs()).toHaveLength(3);
    expect(screen.queryByText('The long way round')).not.toBeInTheDocument();
  });

  it('a link that is already known asks to be submitted, not pasted', () => {
    renderHome();
    act(() => clipStore.addLink('c11', 'tiktok', 'https://www.tiktok.com/@a/video/1', T0));
    expect(within(jobs()[0] as HTMLElement).getByRole('button', { name: /Submit link/ })).toBeInTheDocument();
  });

  it('uploads show under Running without you; a failed one becomes a job with Try again', async () => {
    renderHome();
    act(() => clipStore.startPost(['c9', 'c10'], ['tiktok'], { tiktok: 'TikTok did not answer. Nothing was posted.' }));
    expect(screen.getByText('Posting 2 clips')).toBeInTheDocument();
    // the kept clips are on their way, so the Post job is gone
    expect(screen.queryByText(/ready to post/)).not.toBeInTheDocument();
    act(() => { clipStore.tickUploads(100, T0); });
    expect(screen.queryByText('Posting 2 clips')).not.toBeInTheDocument();
    const failed = jobs().filter((r) => r.textContent?.includes('Did not post'));
    expect(failed).toHaveLength(2);
    expect(failed[0]).toHaveTextContent('TikTok did not answer. Nothing was posted.');
    await userEvent.click(within(failed[0] as HTMLElement).getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Posting 1 clip')).toBeInTheDocument();
    act(() => { clipStore.tickUploads(100, T0); });
    // posted through hemreel, so its link is known and the job is to submit it
    const submit = jobs().find((r) => r.textContent?.includes('Missed the jump'));
    expect(submit).toHaveTextContent('Posted to TikTok just now');
    expect(within(submit as HTMLElement).getByRole('button', { name: /Submit link/ })).toBeInTheDocument();
  });

  it('says so when nothing needs the person', () => {
    renderHome();
    act(() => clipStore.reset('empty'));
    expect(screen.getByText(/Nothing needs you right now/)).toBeInTheDocument();
    expect(screen.getByText('Nothing right now')).toBeInTheDocument();
  });

  it('Start review goes to Review', async () => {
    renderHome();
    await userEvent.click(screen.getByRole('button', { name: 'Start review' }));
    expect(screen.getByText('Review screen')).toBeInTheDocument();
  });

  it('has Clips and History in the sidebar, and ⌘5 and ⌘6 go there', async () => {
    const first = renderHome();
    expect(screen.getByRole('link', { name: /Clips/ })).toHaveAttribute('href', '/clips');
    expect(screen.getByRole('link', { name: /History/ })).toHaveAttribute('href', '/history');
    await userEvent.keyboard('{Meta>}5{/Meta}');
    expect(screen.getByText('Clips screen')).toBeInTheDocument();
    first.unmount();
    renderHome();
    await userEvent.keyboard('{Meta>}6{/Meta}');
    expect(screen.getByText('History screen')).toBeInTheDocument();
  });

  it('opens a dialog for posting, for the due link (also with Enter) and for dismissing', async () => {
    renderHome();
    await userEvent.click(screen.getByRole('button', { name: 'Post 2 clips' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => screen.queryByRole('dialog')).toBeNull();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
  });
});
