import { useEffect, useRef } from 'react';
import { KEYMAP, isTypingTarget, type KeyBinding, type KeyScope } from '@/data/keymap';

export type HotkeyHandler = (event: KeyboardEvent, binding: KeyBinding, combo: string) => void;
export type HotkeyHandlers = Partial<Record<string, HotkeyHandler>>;

/** Turns a keyboard event into the aria-keyshortcuts form used by the keymap: "P", "Space", "Meta+Z", "Shift+Slash". */
export function comboOf(e: KeyboardEvent): string {
  const mods: string[] = [];
  if (e.metaKey || e.ctrlKey) mods.push('Meta');
  if (e.altKey) mods.push('Alt');
  let key = e.key;
  if (key === ' ' || key === 'Spacebar') key = 'Space';
  else if (key === ',') key = 'Comma';
  else if (key === '?' || (key === '/' && e.shiftKey)) return [...mods, 'Shift', 'Slash'].join('+');
  else if (key === '/') key = 'Slash';
  else if (key === 'Esc') key = 'Escape';
  else if (key.length === 1) key = key.toUpperCase();
  if (e.shiftKey && key.length > 1 && key.startsWith('Arrow')) mods.push('Shift');
  return [...mods, key].join('+');
}

/** A binding's aria string lists alternatives separated by spaces ("ArrowLeft ArrowRight"). Shift+Arrow also matches an arrow binding. */
function matches(binding: KeyBinding, combo: string): boolean {
  return binding.aria.split(' ').some((alt) => alt === combo || (alt.startsWith('Arrow') && combo === `Shift+${alt}`));
}

const isSingleKey = (combo: string) => !combo.includes('+') && (combo.length === 1 || combo === 'Space' || combo === 'Backspace' || combo.startsWith('Arrow') || combo === 'Enter');

/**
 * True while a modal dialog is open. A dialog that is animating closed no longer counts, so a key pressed right after Esc still works.
 * A side panel that leaves the page usable (Drawer with modal={false}, marked data-nonmodal) does not count either.
 */
function dialogOpen(): boolean {
  return Boolean(document.querySelector('[role="dialog"]:not([data-ending-style]):not([data-closed]):not([data-nonmodal]), [role="alertdialog"]:not([data-ending-style]):not([data-closed])'));
}

/**
 * One listener on window, scoped to the current screen plus the global keys.
 * Single keys never fire while typing, while a dialog is open, or with a modifier held.
 * Esc inside a field blurs it first; a second Esc runs "global.back".
 */
/** `handlers` may be a function so a screen can merge handlers that change between renders. */
export function useHotkeys(scope: KeyScope | null, handlers: HotkeyHandlers | (() => HotkeyHandlers), enabled = true): void {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const combo = comboOf(e);
      const target = e.target;

      if (combo === 'Escape') {
        if (isTypingTarget(target) && target instanceof HTMLElement) {
          target.blur();
          e.preventDefault();
          return;
        }
        if (dialogOpen()) return; // the dialog closes itself
      }

      if (isSingleKey(combo)) {
        if (isTypingTarget(target) || dialogOpen()) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        // Enter and Space on a focused control belong to that control
        if ((combo === 'Enter' || combo === 'Space') && target instanceof HTMLElement && target.closest('button, a, [role="button"], [role="slider"], [role="checkbox"], [role="switch"], [role="radio"], [role="tab"], summary, select')) return;
      } else if (combo === 'Shift+Slash') {
        if (isTypingTarget(target) || dialogOpen()) return;
      } else if (dialogOpen() && combo !== 'Escape') {
        return;
      }

      for (const binding of KEYMAP) {
        if (binding.scope !== 'global' && binding.scope !== scope) continue;
        if (!matches(binding, combo)) continue;
        const all = typeof ref.current === 'function' ? ref.current() : ref.current;
        const handler = all[binding.id];
        if (!handler) continue;
        e.preventDefault();
        handler(e, binding, combo);
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scope, enabled]);
}
