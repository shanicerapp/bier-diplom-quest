import './style.css';
import { GAME_TITLE, LEVELS, LOCKED_MESSAGE } from './config';
import { parseRoute, routeHash, type Route } from './router';
import * as game from './state';
import { showToast } from './ui';
import { renderStart } from './screens/start';
import { renderMap } from './screens/map';
import { renderLevel } from './screens/level';
import { renderVault } from './screens/vault';
import { renderDiploma, renderPrint } from './screens/diploma';

const app = document.querySelector<HTMLDivElement>('#app')!;
let cleanup: (() => void) | void;

/** Redirects to the furthest screen the current progress allows. */
function guard(route: Route): Route {
  const state = game.getState();
  if (route.name !== 'start' && !state.started) return { name: 'start' };
  switch (route.name) {
    case 'level':
      if (!game.isLevelUnlocked(route.id)) {
        showToast(LOCKED_MESSAGE);
        return { name: 'map' };
      }
      return route;
    case 'vault':
      if (!game.allLevelsCompleted()) return { name: 'map' };
      return game.isVaultOpen() ? { name: 'diploma' } : route;
    case 'diploma':
    case 'print':
      if (!game.isVaultOpen()) return { name: game.allLevelsCompleted() ? 'vault' : 'map' };
      return route;
    default:
      return route;
  }
}

const TITLES: Record<Route['name'], string> = {
  start: GAME_TITLE,
  map: 'Prüfungsgelände',
  level: 'Prüfung',
  vault: 'Das letzte Hindernis',
  diploma: 'Ehrenurkunde',
  print: 'Ehrenurkunde – Druckansicht',
};

function render(): void {
  cleanup?.();
  cleanup = undefined;

  const requested = parseRoute(location.hash);
  const route = guard(requested);
  if (routeHash(route) !== routeHash(requested)) history.replaceState(null, '', routeHash(route));

  app.replaceChildren();
  window.scrollTo(0, 0);
  document.title =
    route.name === 'level'
      ? `${LEVELS.find((l) => l.id === route.id)!.title} · ${GAME_TITLE}`
      : route.name === 'start'
        ? GAME_TITLE
        : `${TITLES[route.name]} · ${GAME_TITLE}`;

  switch (route.name) {
    case 'start':
      return renderStart(app);
    case 'map':
      cleanup = renderMap(app);
      return;
    case 'level':
      cleanup = renderLevel(app, route.id);
      return;
    case 'vault':
      cleanup = renderVault(app);
      return;
    case 'diploma':
      cleanup = renderDiploma(app);
      return;
    case 'print':
      return renderPrint(app);
  }
}

window.addEventListener('hashchange', render);
render();

// Offline support for the production build (service workers need https or localhost).
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
