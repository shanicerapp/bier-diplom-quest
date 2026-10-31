import type { AnswerSpec } from './config';

export type AnswerResult = 'empty' | 'correct' | 'wrong';

/** Lowercases, folds umlauts, drops a leading article and strips everything but letters and digits. */
export function normalizeText(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^(der|die|das|the)\s+/, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Edit distance where swapping two neighbouring letters ("Hopefn") also counts as one typo. */
function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** Longer words tolerate more typos; very short ones must match exactly. */
const allowedTypos = (length: number): number => (length >= 9 ? 2 : length >= 5 ? 1 : 0);

function matchesText(input: string, accepted: string[], rejected: string[] = []): boolean {
  const given = normalizeText(input);
  if (rejected.some((candidate) => normalizeText(candidate) === given)) return false;
  return accepted.some((candidate) => {
    const expected = normalizeText(candidate);
    return given === expected || editDistance(given, expected) <= allowedTypos(expected.length);
  });
}

/** Accepts "4", "4.0", "4,0", "+4" and a trailing unit such as "4 Liter". */
function parseNumber(input: string): number | null {
  const match = input.trim().match(/^([+-]?\d+(?:[.,]\d+)?)\s*[a-zA-ZäöüÄÖÜß.]*$/);
  return match ? Number(match[1].replace(',', '.')) : null;
}

export function checkAnswer(spec: AnswerSpec, input: string): AnswerResult {
  if (input.trim() === '') return 'empty';
  if (spec.kind === 'number') {
    const value = parseNumber(input);
    if (value !== null) return Math.abs(value - spec.value) < 1e-9 ? 'correct' : 'wrong';
    return spec.alsoAccept && matchesText(input, spec.alsoAccept) ? 'correct' : 'wrong';
  }
  return matchesText(input, spec.accepted, spec.rejected) ? 'correct' : 'wrong';
}
