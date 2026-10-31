import { EMPTY_ANSWER_MESSAGE, EXAM_RULE, LEVELS, WRONG_ANSWER_MESSAGES, type LevelConfig, type LevelId } from '../config';
import { buildingArt, icons, successStamp } from '../art';
import { checkAnswer } from '../answers';
import { launchConfetti } from '../confetti';
import * as game from '../state';
import { esc, restartAnimation, session, topbar } from '../ui';

function successMarkup(level: LevelConfig, isNew: boolean): string {
  return `
    <div class="success${isNew ? ' success--new' : ''}" tabindex="-1">
      <div class="success__stamp">${successStamp()}</div>
      <p class="success__verdict">${isNew ? 'Bestanden!' : 'Bereits bestanden'}</p>
      <p class="success__answer">Lösung: <strong>${esc(level.solution)}</strong></p>
      <p class="success__text">${esc(level.success)}</p>
      <a class="btn btn--primary btn--block" href="#/karte">${icons.back}Zurück zur Karte</a>
    </div>`;
}

function formMarkup(level: LevelConfig): string {
  const numeric = level.answer.kind === 'number';
  const hintShown = game.getState().hintsUsed.includes(level.id);
  return `
    <form class="answer" novalidate autocomplete="off">
      <label for="answer-input" class="answer__label">Deine Antwort</label>
      <input id="answer-input" class="answer__input" name="answer" type="text"
        inputmode="${numeric ? 'decimal' : 'text'}" autocomplete="off" autocorrect="off" autocapitalize="off"
        spellcheck="false" enterkeyhint="send" maxlength="60" placeholder="${numeric ? 'Zahl eingeben' : 'Antwort eingeben'}"
        aria-describedby="answer-feedback" />
      <button type="submit" class="btn btn--primary btn--block">Antwort einreichen</button>
      <p id="answer-feedback" class="feedback" role="status" aria-live="polite"></p>
    </form>
    <div class="hint">
      <button type="button" class="btn btn--ink btn--small hint__toggle" aria-expanded="${hintShown}" aria-controls="hint-text">
        ${icons.lamp}<span>${hintShown ? 'Hinweis ausblenden' : 'Hinweis anzeigen'}</span>
      </button>
      <p id="hint-text" class="hint__text" ${hintShown ? '' : 'hidden'}><strong>Hinweis der Kommission:</strong> ${esc(level.hint)}</p>
    </div>`;
}

export function renderLevel(root: HTMLElement, id: LevelId): () => void {
  const index = game.levelIndex(id);
  const level = LEVELS[index];
  const solved = game.isLevelCompleted(id);
  let stopConfetti: () => void = () => {};

  root.innerHTML = `
    <div class="screen level-screen">
      ${topbar(`Prüfung ${level.numeral} von ${LEVELS[LEVELS.length - 1].numeral}`)}
      <main class="level">
        <div class="level__hero">
          <div class="level__art">${buildingArt(level.building, 'is-open')}</div>
          <p class="kicker">${esc(level.faculty)}</p>
          <h1 class="level__title" tabindex="-1">${esc(level.title)}</h1>
        </div>
        <p class="level__story">${esc(level.story)}</p>
        <section class="task" aria-labelledby="task-heading">
          <h2 id="task-heading" class="task__heading">Aufgabe</h2>
          <p class="task__question">${esc(level.question)}</p>
          <div class="task__body">${solved ? successMarkup(level, false) : formMarkup(level)}</div>
        </section>
        <p class="rule">${esc(EXAM_RULE)}</p>
      </main>
    </div>`;

  root.querySelector<HTMLElement>('.level__title')?.focus({ preventScroll: true });
  if (solved) return () => stopConfetti();

  const form = root.querySelector<HTMLFormElement>('.answer')!;
  const input = form.querySelector<HTMLInputElement>('input')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const feedback = form.querySelector<HTMLParagraphElement>('.feedback')!;
  const hintToggle = root.querySelector<HTMLButtonElement>('.hint__toggle')!;
  const hintText = root.querySelector<HTMLParagraphElement>('.hint__text')!;
  let finished = false;

  const say = (message: string, tone: 'error' | 'warn') => {
    feedback.textContent = message;
    feedback.className = `feedback feedback--${tone}`;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (finished) return;
    const result = checkAnswer(level.answer, input.value);

    if (result === 'empty') {
      say(EMPTY_ANSWER_MESSAGE, 'warn');
      restartAnimation(form, 'is-shaking');
      input.focus();
      return;
    }
    if (result === 'wrong') {
      const attempts = game.recordWrongAttempt();
      say(WRONG_ANSWER_MESSAGES[(attempts - 1) % WRONG_ANSWER_MESSAGES.length], 'error');
      restartAnimation(form, 'is-shaking');
      input.select();
      return;
    }

    finished = true;
    submit.disabled = true;
    input.readOnly = true;
    input.blur();
    game.completeLevel(id);
    session.justCompleted = index;
    session.justUnlocked = index + 1;

    const body = root.querySelector<HTMLElement>('.task__body')!;
    body.innerHTML = successMarkup(level, true);
    root.querySelector('.level__art')?.classList.add('is-celebrating');
    const success = body.querySelector<HTMLElement>('.success')!;
    success.focus({ preventScroll: true });
    success.scrollIntoView({ block: 'center', behavior: 'smooth' });
    stopConfetti = launchConfetti({ count: 70, origin: 'center' });
  });

  input.addEventListener('input', () => {
    if (feedback.textContent) {
      feedback.textContent = '';
      feedback.className = 'feedback';
    }
  });

  hintToggle.addEventListener('click', () => {
    const show = hintText.hidden;
    hintText.hidden = !show;
    hintToggle.setAttribute('aria-expanded', String(show));
    hintToggle.querySelector('span')!.textContent = show ? 'Hinweis ausblenden' : 'Hinweis anzeigen';
    if (show) game.markHintUsed(id);
  });

  return () => stopConfetti();
}
