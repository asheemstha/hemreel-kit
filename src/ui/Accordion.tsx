import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import './accordion.css';

export interface AccordionSection {
  id: string;
  title: string;
  /** Quiet text at the right while the section is closed, for example "Facecam on top". */
  summary?: ReactNode;
  /** An 18 px lucide-react icon before the title. */
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionSection[];
  /** Several sections may be open at once. Set false for one at a time. */
  multiple?: boolean;
  /** Ids of the sections open at first. */
  defaultOpen?: string[];
  /** Controlled: ids of the open sections. */
  open?: string[];
  onOpenChange?: (open: string[]) => void;
  /** Heading level of each section title, for document order. */
  level?: 2 | 3 | 4;
}

/**
 * Sections that open and close: the steps of a workflow, a "More" block. Each section is a soft card; the chevron turns and the panel slides.
 * Layout: fills the parent's width.
 */
export function Accordion({ items, multiple = true, defaultOpen, open, onOpenChange, level = 3 }: AccordionProps) {
  const H = level === 2 ? 'h2' : level === 4 ? 'h4' : 'h3';
  return (
    <BaseAccordion.Root
      className="hr-accordion"
      multiple={multiple}
      value={open}
      defaultValue={open === undefined ? defaultOpen : undefined}
      onValueChange={(v) => onOpenChange?.(v.map(String))}
    >
      {items.map((item) => (
        <BaseAccordion.Item key={item.id} value={item.id} disabled={item.disabled} className="hr-accordion__item">
          <BaseAccordion.Header className="hr-accordion__header" render={<H />}>
            <BaseAccordion.Trigger className="hr-accordion__trigger">
              {item.icon ? <span className="hr-accordion__icon" aria-hidden="true">{item.icon}</span> : null}
              <span className="hr-accordion__title">{item.title}</span>
              {item.summary ? <span className="hr-accordion__summary">{item.summary}</span> : null}
              <ChevronDown className="hr-accordion__chevron" aria-hidden="true" />
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel className="hr-accordion__panel">
            <div className="hr-accordion__body">{item.children}</div>
          </BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  );
}
