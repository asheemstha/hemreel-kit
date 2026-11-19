import type { ReactNode } from 'react';
import './divider.css';

/** A hairline. With a label it reads like "or" between two choices. */
export function Divider({ label, vertical }: { label?: ReactNode; vertical?: boolean }) {
  if (label) {
    return (
      <div className="hr-divider" data-labelled="" role="separator">
        <span>{label}</span>
      </div>
    );
  }
  return <hr className="hr-divider" data-vertical={vertical || undefined} aria-orientation={vertical ? 'vertical' : undefined} />;
}

export interface SectionHeaderProps {
  title: ReactNode;
  note?: ReactNode;
  action?: ReactNode;
  /** Heading level for document order. */
  level?: 2 | 3;
  id?: string;
}

/** 14 px / 600 title with an optional 13 px note on the same baseline, and an optional trailing action. */
export function SectionHeader({ title, note, action, level = 2, id }: SectionHeaderProps) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <div className="hr-section-header">
      <H className="hr-section-header__title" id={id}>{title}</H>
      {note ? <span className="hr-section-header__note">{note}</span> : null}
      {action ? <span className="hr-section-header__action">{action}</span> : null}
    </div>
  );
}
