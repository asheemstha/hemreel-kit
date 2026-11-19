import type { HTMLAttributes, ReactNode } from 'react';
import './card.css';

export type CardTint = 'none' | 'due' | 'accent';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  tint?: CardTint;
  /** Header row: a SectionHeader or any node. */
  header?: ReactNode;
  /** Children are rows separated by hairlines. */
  divided?: boolean;
  padded?: boolean;
  as?: 'section' | 'div' | 'article';
}

/** Layout: fills the parent's width. With `divided`, give each child its own padding: rows are separated by space, not lines. */
export function Card({ tint = 'none', header, divided, padded = true, as: Tag = 'div', className, children, ...rest }: CardProps) {
  return (
    <Tag className={['hr-card', className].filter(Boolean).join(' ')} data-tint={tint} data-divided={divided || undefined} data-padded={padded || undefined} {...rest}>
      {header ? <div className="hr-card__header">{header}</div> : null}
      <div className="hr-card__body">{children}</div>
    </Tag>
  );
}
