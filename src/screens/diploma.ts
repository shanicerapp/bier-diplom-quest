import { DIPLOMA, GRADES, RECIPIENT_NAME } from '../config';
import { cornerFlourish, crest, icons, signatureScribble, waxSeal } from '../art';
import { launchConfetti } from '../confetti';
import * as game from '../state';
import { esc, prefersReducedMotion } from '../ui';

function issueDate(): string {
  const opened = game.getState().vaultOpenedAt;
  const date = opened ? new Date(opened) : new Date();
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function grade(): string {
  const wrong = game.getState().wrongAttempts;
  return GRADES.find((g) => wrong <= g.maxWrong)?.label ?? GRADES[GRADES.length - 1].label;
}

function diplomaMarkup(variant: 'screen' | 'print'): string {
  const corners = ['tl', 'tr', 'bl', 'br'].map((c) => `<span class="diploma__corner diploma__corner--${c}">${cornerFlourish()}</span>`).join('');
  return `
    <article class="diploma diploma--${variant}" aria-label="Ehrenurkunde">
      <div class="diploma__frame" aria-hidden="true"></div>
      ${corners}
      <div class="diploma__content">
        <p class="diploma__academy">${esc(DIPLOMA.academy)}</p>
        <div class="diploma__crest">${crest(`crest-${variant}`, 'AKADEMIE · DER · HÖHEREN · BIERWISSENSCHAFT', true)}</div>
        <h2 class="diploma__title">${esc(DIPLOMA.title)}</h2>
        <p class="diploma__line">${esc(DIPLOMA.intro)}</p>
        <p class="diploma__name">${esc(RECIPIENT_NAME)}</p>
        <p class="diploma__line">${esc(DIPLOMA.awardText)}</p>
        <p class="diploma__degree">${esc(DIPLOMA.degree)}</p>
        <p class="diploma__line">${esc(DIPLOMA.awarded)}</p>
        <div class="diploma__rule" aria-hidden="true"></div>
        <p class="diploma__quals">${esc(DIPLOMA.qualifications)}</p>
        <p class="diploma__special">${esc(DIPLOMA.special)}</p>
        <p class="diploma__grade">Gesamturteil: <em>${esc(grade())}</em></p>
        <div class="diploma__footer">
          <div class="diploma__field">
            <span class="diploma__value">Ausgestellt zu ${esc(DIPLOMA.place)}<br>am ${esc(issueDate())}</span>
            <span class="diploma__caption">Ort, Datum</span>
          </div>
          <div class="diploma__seal">${waxSeal()}</div>
          <div class="diploma__field">
            <span class="diploma__value diploma__value--signature">${signatureScribble()}</span>
            <span class="diploma__caption">${esc(DIPLOMA.signature)}</span>
          </div>
        </div>
        <p class="diploma__fineprint">${esc(DIPLOMA.finePrint)}</p>
      </div>
    </article>`;
}

export function renderDiploma(root: HTMLElement): () => void {
  root.innerHTML = `
    <div class="screen reveal-screen">
      <header class="topbar">
        <a class="topbar__back" href="#/karte">${icons.back}<span>Zur Karte</span></a>
        <span class="topbar__context">Bestanden</span>
      </header>
      <main class="reveal">
        <div class="reveal__rays" aria-hidden="true"></div>
        <p class="kicker">Die Tore haben sich geöffnet</p>
        <h1 class="reveal__greeting" tabindex="-1">${esc(DIPLOMA.greeting)}</h1>
        ${diplomaMarkup('screen')}
        <aside class="disclaimer" role="note">
          <strong>Hinweis:</strong> ${esc(DIPLOMA.disclaimer)}
        </aside>
        <div class="reveal__actions">
          <a class="btn btn--primary btn--block" href="#/urkunde/druck">${icons.print}Urkunde anzeigen / drucken</a>
          <a class="btn btn--ghost btn--block" href="#/karte">Zurück zur Karte</a>
        </div>
      </main>
    </div>`;
  root.querySelector<HTMLElement>('.reveal__greeting')?.focus({ preventScroll: true });

  // Fade out of the golden light that the vault faded into.
  const flash = document.querySelector<HTMLDivElement>('.flash') ?? document.createElement('div');
  flash.className = 'flash flash--out';
  if (!flash.isConnected) document.body.append(flash);
  const removeFlash = window.setTimeout(() => flash.remove(), prefersReducedMotion() ? 0 : 1600);

  const stopConfetti = launchConfetti({ count: 140, origin: 'top', duration: 4500 });
  return () => {
    window.clearTimeout(removeFlash);
    flash.remove();
    stopConfetti();
  };
}

export function renderPrint(root: HTMLElement): void {
  root.innerHTML = `
    <div class="screen print-screen">
      <div class="print-toolbar">
        <a class="btn btn--ghost" href="#/urkunde">${icons.back}Zurück</a>
        <button type="button" class="btn btn--primary" data-action="print">${icons.print}Drucken</button>
      </div>
      <p class="print-tip">Tipp: Im Druckdialog „Hintergrundgrafiken“ aktivieren und Ränder auf „Keine“ stellen. Auf dem iPhone über „Teilen → Drucken“ auch als PDF speicherbar.</p>
      <div class="print-sheet">${diplomaMarkup('print')}</div>
    </div>`;
  root.querySelector('[data-action="print"]')?.addEventListener('click', () => window.print());
}
