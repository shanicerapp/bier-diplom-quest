import { icons } from './art';

export const esc = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Resolves after `ms`, or immediately when the player prefers reduced motion. */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, prefersReducedMotion() ? 0 : ms));

/** Re-triggers a CSS animation class even if it is already present. */
export function restartAnimation(element: Element, className: string): void {
  element.classList.remove(className);
  void (element as HTMLElement).offsetWidth;
  element.classList.add(className);
}

/** Short-lived flags that let one screen tell the next what just happened. */
export const session = {
  justCompleted: null as number | null,
  justUnlocked: null as number | null,
};

export function topbar(context: string): string {
  return `
    <header class="topbar">
      <a class="topbar__back" href="#/karte">${icons.back}<span>Zur Karte</span></a>
      <span class="topbar__context">${esc(context)}</span>
    </header>`;
}

let toastTimer: number | undefined;

export function showToast(message: string): void {
  let toast = document.querySelector<HTMLDivElement>('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }
  toast.textContent = message;
  restartAnimation(toast, 'is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast?.classList.remove('is-visible'), 2800);
}

interface ConfirmOptions {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
}

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  const dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') {
    return Promise.resolve(window.confirm(`${options.title}\n\n${options.body}`));
  }
  dialog.className = 'dialog';
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  dialog.innerHTML = `
    <form method="dialog" class="dialog__card">
      <h2 id="dialog-title">${esc(options.title)}</h2>
      <p>${esc(options.body)}</p>
      <div class="dialog__actions">
        <button class="btn btn--ink" value="cancel" autofocus>${esc(options.cancelLabel)}</button>
        <button class="btn btn--danger" value="confirm">${esc(options.confirmLabel)}</button>
      </div>
    </form>`;
  document.body.append(dialog);
  dialog.showModal();
  return new Promise((resolve) => {
    dialog.addEventListener('close', () => {
      resolve(dialog.returnValue === 'confirm');
      dialog.remove();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close('cancel');
    });
  });
}
