import { LEVELS, type LevelId } from './config';

export type Route =
  | { name: 'start' }
  | { name: 'map' }
  | { name: 'level'; id: LevelId }
  | { name: 'vault' }
  | { name: 'diploma' }
  | { name: 'print' };

const isLevelId = (value: string | undefined): value is LevelId => LEVELS.some((level) => level.id === value);

export function parseRoute(hash: string): Route {
  const [section, sub] = hash.replace(/^#\/?/, '').split('/');
  if (section === 'karte') return { name: 'map' };
  if (section === 'pruefung' && isLevelId(sub)) return { name: 'level', id: sub };
  if (section === 'tor') return { name: 'vault' };
  if (section === 'urkunde') return sub === 'druck' ? { name: 'print' } : { name: 'diploma' };
  return { name: 'start' };
}

export function routeHash(route: Route): string {
  switch (route.name) {
    case 'start':
      return '#/';
    case 'map':
      return '#/karte';
    case 'level':
      return `#/pruefung/${route.id}`;
    case 'vault':
      return '#/tor';
    case 'diploma':
      return '#/urkunde';
    case 'print':
      return '#/urkunde/druck';
  }
}

export function navigate(route: Route): void {
  const hash = routeHash(route);
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}
