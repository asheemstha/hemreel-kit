import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';
import { ButtonLink } from './Button';
import './breadcrumb.css';

export interface Crumb {
  label: string;
  /** Where the crumb goes. The last crumb is the current page and never links. */
  href?: string;
}

export interface BreadcrumbProps {
  items: Crumb[];
  /** Called before the browser follows a crumb. Call event.preventDefault() to route in the app instead. */
  onNavigate?: (item: Crumb, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Name of the landmark. Give each breadcrumb on a page its own name. */
  label?: string;
}

/**
 * Where this page sits: Projects, then the project, then the clip. The last item is the current page.
 * Layout: hugs its crumbs and wraps onto a second line when they do not fit.
 */
export function Breadcrumb({ items, onNavigate, label = 'Breadcrumb' }: BreadcrumbProps) {
  return (
    <nav className="hr-crumbs" aria-label={label}>
      <ol className="hr-crumbs__list">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${i}-${item.label}`} className="hr-crumbs__item">
              {i > 0 ? <ChevronRight className="hr-crumbs__sep" aria-hidden="true" /> : null}
              {last || !item.href ? (
                <span className="hr-crumbs__text" data-current={last || undefined} aria-current={last ? 'page' : undefined}>{item.label}</span>
              ) : (
                <a className="hr-crumbs__link" href={item.href} onClick={(e) => onNavigate?.(item, e)}>{item.label}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface BackLinkProps {
  href: string;
  /** "Back to projects". */
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * One step back, for pages where a full breadcrumb is too much.
 * Layout: hugs its text.
 */
export function BackLink({ href, children, onClick }: BackLinkProps) {
  return (
    <ButtonLink kind="ghost" size="sm" icon={<ArrowLeft />} href={href} onClick={onClick}>
      {children}
    </ButtonLink>
  );
}
