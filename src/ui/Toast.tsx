import { CircleAlert, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { TIMING } from '@/styles/timing';
import { Kbd } from './Kbd';
import { Meter } from './Meter';
import './toast.css';

export interface ToastProps {
  message: string;            // "Skipped."
  actionLabel?: string;       // "Undo"
  actionShortcut?: string;    // "⌘Z"
  onAction?: () => void;
  onDismiss: () => void;
  /** Auto dismiss delay. The timer pauses while the toast is hovered or holds focus. */
  durationMs?: number;
  /** Render in the flow instead of fixed at the bottom centre. Used by the gallery to show several toasts at once. */
  inline?: boolean;
  /** Never dismiss on its own. */
  persistent?: boolean;
  /** 'error': an alert icon, announced at once, and it stays until dismissed or acted on ("Try again"). */
  tone?: 'default' | 'error';
  /** 0 to 100: shows a small meter and the percent, and keeps the toast up until it reaches 100 ("Rendering 3 of 10 clips"). */
  progress?: number;
}

/**
 * The ink pill at the bottom centre: a result with Undo, a failure with "Try again", or a job with its progress.
 * Layout: fixed to the bottom centre of the window. Use `inline` to place it in normal flow (gallery).
 */
export function Toast({ message, actionLabel, actionShortcut, onAction, onDismiss, durationMs = TIMING.toast, inline = false, persistent = false, tone = 'default', progress }: ToastProps) {
  const paused = useRef(false);
  const remaining = useRef(durationMs);
  const working = progress !== undefined && progress < 100;
  const error = tone === 'error';
  const sticky = persistent || error || working;

  useEffect(() => {
    if (sticky) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      if (!paused.current) remaining.current -= now - last;
      last = now;
      if (remaining.current <= 0) onDismiss();
    }, 100);
    return () => window.clearInterval(id);
  }, [onDismiss, sticky]);

  // Pause while hovered or while focus is inside. Listeners are attached directly so the status region stays a plain live region.
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const on = () => { paused.current = true; };
    const off = () => { paused.current = false; };
    el.addEventListener('mouseenter', on);
    el.addEventListener('mouseleave', off);
    el.addEventListener('focusin', on);
    el.addEventListener('focusout', off);
    return () => {
      el.removeEventListener('mouseenter', on);
      el.removeEventListener('mouseleave', off);
      el.removeEventListener('focusin', on);
      el.removeEventListener('focusout', off);
    };
  }, []);

  return (
    <div ref={box} className="hr-toast" data-inline={inline || undefined} data-tone={tone} role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'}>
      {error ? <CircleAlert className="hr-toast__icon" aria-hidden="true" /> : null}
      <span>{message}</span>
      {progress !== undefined ? (
        <span className="hr-toast__progress">
          <Meter value={progress} label={message} valueText={`${Math.round(progress)} percent`} variant="stage" height={5} />
          <span className="hr-toast__pct hr-tnum" aria-hidden="true">{`${Math.round(progress)}%`}</span>
        </span>
      ) : null}
      {actionLabel && onAction ? (
        <button type="button" className="hr-toast__action" onClick={onAction} aria-keyshortcuts={actionShortcut === '⌘Z' ? 'Meta+Z' : undefined}>
          {actionLabel}
          {actionShortcut ? <Kbd tone="ink" decorative>{actionShortcut}</Kbd> : null}
        </button>
      ) : null}
      {error ? (
        <button type="button" className="hr-toast__close" aria-label="Dismiss" onClick={onDismiss}>
          <X aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/* ---- host: one toast at a time, the newest replaces the one on screen ---- */

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  actionShortcut?: string;
  onAction?: () => void;
  durationMs?: number;
  tone?: 'default' | 'error';
  progress?: number;
  persistent?: boolean;
}

interface ToastApi {
  show: (t: ToastOptions) => void;
  /** Change the toast on screen in place (a job's progress and message) without replaying its entrance. */
  update: (patch: Partial<ToastOptions>) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Provides `useToast()`. Renders at most one toast: a new toast replaces the current one and restarts its timer. */
export function ToastHost({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<(ToastOptions & { key: number }) | null>(null);
  const seq = useRef(0);
  const dismiss = useCallback(() => setCurrent(null), []);
  const show = useCallback((t: ToastOptions) => {
    seq.current += 1;
    setCurrent({ ...t, key: seq.current });
  }, []);
  const update = useCallback((patch: Partial<ToastOptions>) => setCurrent((c) => (c ? { ...c, ...patch } : c)), []);
  const api = useMemo(() => ({ show, update, dismiss }), [show, update, dismiss]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      {current ? (
        <Toast
          key={current.key}
          message={current.message}
          actionLabel={current.actionLabel}
          actionShortcut={current.actionShortcut}
          durationMs={current.durationMs}
          tone={current.tone}
          progress={current.progress}
          persistent={current.persistent}
          onAction={current.onAction ? () => { current.onAction?.(); dismiss(); } : undefined}
          onDismiss={dismiss}
        />
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastHost>');
  return api;
}
