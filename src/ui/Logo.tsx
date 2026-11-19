import './logo.css';

export interface LogoProps {
  /** Show the "hemreel" wordmark next to the mark. */
  wordmark?: boolean;
  /** Wordmark size in px. The mark is scaled to match. */
  size?: 21 | 32;
  /** Draw on a dark ink surface. */
  onInk?: boolean;
  /** Mark height in px when shown alone. */
  markHeight?: number;
}

/** The Notch mark: a sheet with its top-right corner folded down over the accent. */
export function Mark({ height = 24, onInk = false, label = 'hemreel' }: { height?: number; onInk?: boolean; label?: string | null }) {
  return (
    <svg className="hr-mark" data-on-ink={onInk || undefined} viewBox="0 0 20 30" height={height} width={(height * 20) / 30}
      role={label ? 'img' : undefined} aria-label={label ?? undefined} aria-hidden={label ? undefined : true}>
      <path d="M13 0h7v7z" className="hr-mark__accent" />
      <path d="M2.5 0H13l7 7v20.5A2.5 2.5 0 0 1 17.5 30h-15A2.5 2.5 0 0 1 0 27.5v-25A2.5 2.5 0 0 1 2.5 0z" className="hr-mark__sheet" />
      <path d="M13 0v5a2 2 0 0 0 2 2h5z" className="hr-mark__fold" />
    </svg>
  );
}

export function Logo({ wordmark = true, size = 21, onInk = false, markHeight }: LogoProps) {
  if (!wordmark) return <Mark height={markHeight ?? 24} onInk={onInk} />;
  return (
    <span className="hr-logo" data-size={size} data-on-ink={onInk || undefined}>
      <Mark height={Math.round(size * 1.15)} onInk={onInk} label={null} />
      <span className="hr-logo__word">hemreel</span>
    </span>
  );
}
