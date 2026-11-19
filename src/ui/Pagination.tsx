import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from './Button';
import { IconButton } from './IconButton';
import './pagination.css';

export type PageSlot = number | 'gap-start' | 'gap-end';

/**
 * The page numbers to draw: always the first and last page and the pages around the current one, in seven slots at most.
 * A gap never hides a single page.
 */
export function pageSlots(page: number, pageCount: number): PageSlot[] {
  if (pageCount <= 0) return [];
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const start = Math.max(2, Math.min(page - 1, pageCount - 4));
  const end = Math.min(pageCount - 1, Math.max(page + 1, 5));
  const out: PageSlot[] = [1];
  if (start > 2) out.push(start === 3 ? 2 : 'gap-start');
  for (let p = start; p <= end; p += 1) out.push(p);
  if (end < pageCount - 1) out.push(end === pageCount - 2 ? pageCount - 1 : 'gap-end');
  out.push(pageCount);
  return out;
}

export interface PaginationProps {
  /** The current page, from 1. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Name of the landmark. Give each pager on a page its own name. */
  label?: string;
}

/**
 * Previous, page numbers, next. For lists someone jumps around in (projects, history).
 * Layout: hugs its buttons.
 */
export function Pagination({ page, pageCount, onPageChange, label = 'Pages' }: PaginationProps) {
  if (pageCount <= 1) return null;
  const go = (p: number) => {
    const next = Math.min(pageCount, Math.max(1, p));
    if (next !== page) onPageChange(next);
  };
  return (
    <nav className="hr-pager" aria-label={label}>
      <IconButton aria-label="Previous page" icon={<ChevronLeft />} size={32} tooltip={false} disabled={page <= 1} onClick={() => go(page - 1)} />
      <ol className="hr-pager__list">
        {pageSlots(page, pageCount).map((slot) => (
          <li key={slot}>
            {typeof slot === 'number' ? (
              <button type="button" className="hr-pager__page hr-tnum" aria-label={`Page ${slot}`} aria-current={slot === page ? 'page' : undefined} onClick={() => go(slot)}>
                {slot}
              </button>
            ) : (
              <span className="hr-pager__gap" aria-hidden="true">…</span>
            )}
          </li>
        ))}
      </ol>
      <IconButton aria-label="Next page" icon={<ChevronRight />} size={32} tooltip={false} disabled={page >= pageCount} onClick={() => go(page + 1)} />
    </nav>
  );
}

export interface LoadMoreProps {
  /** How many are on screen now. */
  shown: number;
  total: number;
  onLoadMore: () => void;
  loading?: boolean;
  /** Plural noun for what is listed: "clips", "projects". */
  noun?: string;
  /** How many the next press adds. Capped at what is left. */
  step?: number;
}

const n = (v: number) => v.toLocaleString('en-US');

/**
 * "Show 24 more" under a long grid, with how many are shown. For lists someone reads top to bottom (clips).
 * Layout: fills the parent's width and centres its content.
 */
export function LoadMore({ shown, total, onLoadMore, loading = false, noun = 'clips', step = 24 }: LoadMoreProps) {
  const left = Math.max(0, total - shown);
  const next = Math.min(step, left);
  return (
    <div className="hr-loadmore">
      {left > 0 ? (
        <Button onClick={onLoadMore} loading={loading} icon={loading ? <LoaderCircle /> : undefined}>
          {loading ? `Loading ${n(next)} more` : `Show ${n(next)} more`}
        </Button>
      ) : null}
      <p className="hr-loadmore__status hr-tnum" role="status">
        {left > 0 ? `Showing ${n(shown)} of ${n(total)} ${noun}` : `All ${n(total)} ${noun} shown`}
      </p>
    </div>
  );
}
