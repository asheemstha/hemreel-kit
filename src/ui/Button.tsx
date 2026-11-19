import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Kbd, type KbdTone } from './Kbd';
import './button.css';

export type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger' | 'stage';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
  size?: ButtonSize;
  /** A lucide-react icon element, already sized by CSS. */
  icon?: ReactNode;
  /** Keycap shown after the label, for example "P" or "⌘N". */
  shortcut?: string;
  /** Machine form of the shortcut for assistive tech, for example "P" or "Meta+N". */
  ariaKeyShortcuts?: string;
  loading?: boolean;
  /** Fill the parent's width. Buttons hug their content otherwise. */
  block?: boolean;
}

const KBD_TONE: Record<ButtonKind, KbdTone> = { primary: 'accent', secondary: 'light', ghost: 'light', dark: 'ink', danger: 'light', stage: 'stage' };

/** Layout: hugs its content and never grows wider than the parent. Pass `block` to fill the width. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { kind = 'secondary', size = 'md', icon, shortcut, ariaKeyShortcuts, loading = false, block = false, disabled, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={['hr-btn', className].filter(Boolean).join(' ')}
      data-kind={kind}
      data-size={size}
      data-loading={loading || undefined}
      data-block={block || undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-keyshortcuts={ariaKeyShortcuts ?? shortcut}
      {...rest}
    >
      {icon ? <span className="hr-btn__icon" aria-hidden="true">{icon}</span> : null}
      <span className="hr-btn__label">{children}</span>
      {shortcut ? <Kbd tone={KBD_TONE[kind]} decorative>{shortcut}</Kbd> : null}
    </button>
  );
});

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  kind?: ButtonKind;
  size?: ButtonSize;
  icon?: ReactNode;
  shortcut?: string;
  ariaKeyShortcuts?: string;
}

/**
 * The same button, rendered as a real link for navigation.
 * Layout: hugs its content, like Button.
 */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { kind = 'secondary', size = 'md', icon, shortcut, ariaKeyShortcuts, className, children, href, ...rest },
  ref,
) {
  // Site-relative links ("/new") follow the base path, so the kit also works when hosted under a sub-path.
  const to = href?.startsWith('/') ? import.meta.env.BASE_URL.replace(/\/$/, '') + href : href;
  return (
    <a ref={ref} href={to} className={['hr-btn', className].filter(Boolean).join(' ')} data-kind={kind} data-size={size} aria-keyshortcuts={ariaKeyShortcuts ?? shortcut} {...rest}>
      {icon ? <span className="hr-btn__icon" aria-hidden="true">{icon}</span> : null}
      <span className="hr-btn__label">{children}</span>
      {shortcut ? <Kbd tone={KBD_TONE[kind]} decorative>{shortcut}</Kbd> : null}
    </a>
  );
});
