import { ACADEMY_NAME, GAME_TITLE, START_INTRO, START_NOTE, START_SALUTATION } from '../config';
import { crest } from '../art';
import { navigate } from '../router';
import * as game from '../state';
import { esc } from '../ui';

function fireflies(count: number): string {
  return Array.from({ length: count }, (_, i) => {
    const x = (i * 37 + 11) % 100;
    const y = (i * 53 + 7) % 100;
    const delay = ((i * 0.73) % 6).toFixed(2);
    const duration = (7 + ((i * 1.3) % 5)).toFixed(2);
    return `<i style="left:${x}%;top:${y}%;animation-delay:-${delay}s;animation-duration:${duration}s"></i>`;
  }).join('');
}

export function renderStart(root: HTMLElement): void {
  const { started } = game.getState();
  root.innerHTML = `
    <div class="screen start">
      <div class="fireflies" aria-hidden="true">${fireflies(14)}</div>
      <main class="start__inner">
        <div class="start__crest">${crest('crest-start', 'AKADEMIE · DER · HÖHEREN · WISSENSCHAFT')}</div>
        <h1 class="start__title">${esc(GAME_TITLE).replace('Geburtstags', 'Geburtstags&shy;')}</h1>
        <p class="start__subtitle">${esc(ACADEMY_NAME)}</p>
        <div class="letter">
          <p class="letter__salutation">${esc(START_SALUTATION)}</p>
          <p>${esc(START_INTRO)}</p>
          <p class="letter__sign">Die Prüfungskommission</p>
        </div>
        <button type="button" class="btn btn--primary btn--large" data-action="begin">
          ${started ? 'Prüfung fortsetzen' : 'Prüfung beginnen'}
        </button>
        <p class="start__note">${esc(START_NOTE)}</p>
      </main>
    </div>`;

  root.querySelector('[data-action="begin"]')!.addEventListener('click', () => {
    game.startGame();
    navigate({ name: 'map' });
  });
}
