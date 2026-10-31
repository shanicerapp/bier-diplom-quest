import { VAULT_HINT, VAULT_PIN, VAULT_TEXT, VAULT_TITLE, WRONG_PIN_MESSAGES } from '../config';
import { icons, vaultFrameArt, vaultLeafArt } from '../art';
import { navigate } from '../router';
import * as game from '../state';
import { esc, restartAnimation, topbar, wait } from '../ui';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'];

function keyButton(key: string): string {
  if (key === 'clear') return `<button type="button" class="key key--fn" data-key="clear" aria-label="Eingabe leeren">Leeren</button>`;
  if (key === 'delete') return `<button type="button" class="key key--fn" data-key="delete" aria-label="Letzte Ziffer löschen">${icons.backspace}</button>`;
  return `<button type="button" class="key" data-key="${key}">${key}</button>`;
}

export function renderVault(root: HTMLElement): () => void {
  const length = VAULT_PIN.length;
  const hintShown = game.getState().hintsUsed.includes('tor');
  let entry = '';
  let busy = false;
  let wrongCount = 0;
  let flash: HTMLDivElement | null = null;

  root.innerHTML = `
    <div class="screen vault-screen">
      ${topbar('Prüfung V von V')}
      <main class="vault-main">
        <p class="kicker">Das Tor zur höchsten Auszeichnung</p>
        <h1 class="vault-title" tabindex="-1">${esc(VAULT_TITLE)}</h1>
        <p class="vault-text">${esc(VAULT_TEXT)}</p>
        <div class="vault" aria-hidden="true">
          ${vaultFrameArt()}
          <div class="vault__opening">
            <div class="vault__light"></div>
            <div class="vault__seam"></div>
            <div class="vault__leaf vault__leaf--l">${vaultLeafArt()}</div>
            <div class="vault__leaf vault__leaf--r">${vaultLeafArt()}</div>
          </div>
        </div>
        <section class="pin" aria-label="Zugangscode eingeben">
          <div class="pin-dots" role="status" aria-live="polite" aria-label="0 von ${length} Ziffern eingegeben">
            ${'<i></i>'.repeat(length)}
          </div>
          <p class="feedback pin-feedback" aria-live="polite"></p>
          <div class="keypad">${KEYS.map(keyButton).join('')}</div>
          <div class="hint hint--dark">
            <button type="button" class="btn btn--ghost btn--small hint__toggle" aria-expanded="${hintShown}" aria-controls="vault-hint">
              ${icons.lamp}<span>${hintShown ? 'Hinweis ausblenden' : 'Hinweis anzeigen'}</span>
            </button>
            <p id="vault-hint" class="hint__text" ${hintShown ? '' : 'hidden'}>${esc(VAULT_HINT)}</p>
          </div>
        </section>
      </main>
    </div>`;

  const vault = root.querySelector<HTMLElement>('.vault')!;
  const dots = root.querySelector<HTMLElement>('.pin-dots')!;
  const feedback = root.querySelector<HTMLElement>('.pin-feedback')!;
  const pinSection = root.querySelector<HTMLElement>('.pin')!;
  const hintToggle = root.querySelector<HTMLButtonElement>('.hint__toggle')!;
  const hintText = root.querySelector<HTMLElement>('#vault-hint')!;
  root.querySelector<HTMLElement>('.vault-title')?.focus({ preventScroll: true });

  const renderDots = () => {
    dots.querySelectorAll('i').forEach((dot, i) => dot.classList.toggle('is-filled', i < entry.length));
    dots.setAttribute('aria-label', `${entry.length} von ${length} Ziffern eingegeben`);
  };

  const open = async () => {
    busy = true;
    game.openVault();
    feedback.textContent = 'Der Code ist korrekt. Die Riegel geben nach …';
    feedback.className = 'feedback pin-feedback feedback--success';
    dots.classList.add('is-success');
    pinSection.classList.add('is-done');
    vault.scrollIntoView({ block: 'center', behavior: 'smooth' });
    await wait(500);
    vault.classList.add('vault--open');
    await wait(2300);
    flash = document.createElement('div');
    flash.className = 'flash flash--in';
    document.body.append(flash);
    await wait(900);
    navigate({ name: 'diploma' });
  };

  const check = async () => {
    if (entry === VAULT_PIN) {
      await open();
      return;
    }
    busy = true;
    feedback.textContent = WRONG_PIN_MESSAGES[wrongCount++ % WRONG_PIN_MESSAGES.length];
    feedback.className = 'feedback pin-feedback feedback--error';
    restartAnimation(dots, 'is-error');
    restartAnimation(vault, 'is-denied');
    await wait(650);
    entry = '';
    dots.classList.remove('is-error');
    renderDots();
    busy = false;
  };

  const press = (key: string) => {
    if (busy) return;
    if (key === 'clear') entry = '';
    else if (key === 'delete') entry = entry.slice(0, -1);
    else if (/^\d$/.test(key) && entry.length < length) entry += key;
    if (/^\d$/.test(key) || key === 'clear') {
      feedback.textContent = '';
      feedback.className = 'feedback pin-feedback';
    }
    renderDots();
    if (entry.length === length) void check();
  };

  const onClick = (event: Event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-key]');
    if (button) press(button.dataset.key!);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    let key: string | null = null;
    if (/^\d$/.test(event.key)) key = event.key;
    else if (event.key === 'Backspace') key = 'delete';
    else if (event.key === 'Escape' || event.key === 'Delete') key = 'clear';
    if (!key) return;
    event.preventDefault();
    const button = root.querySelector<HTMLElement>(`[data-key="${key}"]`);
    if (button) restartAnimation(button, 'is-pressed');
    press(key);
  };

  hintToggle.addEventListener('click', () => {
    const show = hintText.hidden;
    hintText.hidden = !show;
    hintToggle.setAttribute('aria-expanded', String(show));
    hintToggle.querySelector('span')!.textContent = show ? 'Hinweis ausblenden' : 'Hinweis anzeigen';
    if (show) game.markHintUsed('tor');
  });

  root.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeydown);
  return () => {
    root.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKeydown);
    flash?.remove();
  };
}
