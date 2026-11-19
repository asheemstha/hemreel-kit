import type { ReactNode } from 'react';
import './gallery.css';

/** One component on the Components page: a heading, an optional note, then its labelled states. */
export function GallerySection({ id, title, note, children, level = 3 }: { id: string; title: string; note?: ReactNode; children: ReactNode; level?: 2 | 3 }) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <section className="g-section" id={id} aria-labelledby={`${id}-title`}>
      <header className="g-section__head">
        <H className="g-section__title" id={`${id}-title`}>{title}</H>
        {note ? <p className="g-section__note">{note}</p> : null}
      </header>
      <div className="g-section__grid">{children}</div>
    </section>
  );
}

/** One labelled state. `surface` sets the backdrop; `wide` spans the full row. */
export function Specimen({ label, children, surface = 'surface', wide, tall, center }: {
  label: string;
  children: ReactNode;
  surface?: 'surface' | 'bg' | 'side' | 'stage' | 'ink';
  wide?: boolean;
  tall?: boolean;
  center?: boolean;
}) {
  return (
    <figure className="g-specimen" data-wide={wide || undefined}>
      <div className="g-specimen__stage" data-surface={surface === 'stage' ? 'stage' : undefined} data-bg={surface} data-tall={tall || undefined} data-center={center || undefined}>
        {children}
      </div>
      <figcaption className="g-specimen__label">{label}</figcaption>
    </figure>
  );
}

/** A group heading on the Components page (Primitives, Form controls, ...). */
export function GalleryGroup({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="g-group" id={id} aria-labelledby={`${id}-title`}>
      <h2 className="g-group__title" id={`${id}-title`}>{title}</h2>
      {children}
    </section>
  );
}

/** Lays children out in a row with a gap, for showing several variants in one specimen. */
export function Row({ children, gap = 12, wrap = true, align = 'center' }: { children: ReactNode; gap?: 8 | 12 | 16 | 24; wrap?: boolean; align?: 'center' | 'start' | 'end' }) {
  return <div className="g-row" data-gap={gap} data-wrap={wrap || undefined} data-align={align}>{children}</div>;
}

export function Stack({ children, gap = 12 }: { children: ReactNode; gap?: 8 | 12 | 16 | 24 }) {
  return <div className="g-stack" data-gap={gap}>{children}</div>;
}
