import { LEVELS, type LevelId } from './config';

const STORAGE_KEY = 'akademie-bierdiplom:v1';

export interface GameState {
  started: boolean;
  /** Bestandene Prüfungen, immer in Spielreihenfolge. */
  completed: LevelId[];
  wrongAttempts: number;
  hintsUsed: string[];
  vaultOpenedAt: string | null;
}

const freshState = (): GameState => ({
  started: false,
  completed: [],
  wrongAttempts: 0,
  hintsUsed: [],
  vaultOpenedAt: null,
});

let state = load();

/**
 * Reads the saved progress and repairs anything inconsistent: completion must be
 * a contiguous prefix of the level order, and the vault can only be open once
 * every level is done. This keeps unlocking deterministic even if storage was edited.
 */
function load(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const saved = JSON.parse(raw) as Partial<GameState>;
    const savedCompleted = Array.isArray(saved.completed) ? saved.completed : [];
    const completed: LevelId[] = [];
    for (const level of LEVELS) {
      if (!savedCompleted.includes(level.id)) break;
      completed.push(level.id);
    }
    const allDone = completed.length === LEVELS.length;
    return {
      started: saved.started === true || completed.length > 0,
      completed,
      wrongAttempts:
        typeof saved.wrongAttempts === 'number' && saved.wrongAttempts >= 0 ? Math.floor(saved.wrongAttempts) : 0,
      hintsUsed: Array.isArray(saved.hintsUsed) ? saved.hintsUsed.filter((h) => typeof h === 'string') : [],
      vaultOpenedAt: allDone && typeof saved.vaultOpenedAt === 'string' ? saved.vaultOpenedAt : null,
    };
  } catch {
    return freshState();
  }
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or full storage: the game still works, just without persistence.
  }
}

export const getState = (): Readonly<GameState> => state;

export const levelIndex = (id: LevelId): number => LEVELS.findIndex((level) => level.id === id);

export const isLevelCompleted = (id: LevelId): boolean => state.completed.includes(id);

export const isLevelUnlocked = (id: LevelId): boolean => {
  const index = levelIndex(id);
  return index === 0 || (index > 0 && isLevelCompleted(LEVELS[index - 1].id));
};

export const allLevelsCompleted = (): boolean => state.completed.length === LEVELS.length;

export const isVaultOpen = (): boolean => state.vaultOpenedAt !== null;

/** Total stages: the four levels plus the vault. */
export const TOTAL_STAGES = LEVELS.length + 1;

export const completedStages = (): number => state.completed.length + (isVaultOpen() ? 1 : 0);

export function startGame(): void {
  if (state.started) return;
  state.started = true;
  save();
}

export function completeLevel(id: LevelId): void {
  if (!isLevelUnlocked(id) || isLevelCompleted(id)) return;
  state.completed = LEVELS.map((level) => level.id).filter((levelId) => levelId === id || state.completed.includes(levelId));
  save();
}

export function recordWrongAttempt(): number {
  state.wrongAttempts += 1;
  save();
  return state.wrongAttempts;
}

export function markHintUsed(key: string): void {
  if (state.hintsUsed.includes(key)) return;
  state.hintsUsed.push(key);
  save();
}

export function openVault(): void {
  if (!allLevelsCompleted() || isVaultOpen()) return;
  state.vaultOpenedAt = new Date().toISOString();
  save();
}

export function resetGame(): void {
  state = freshState();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
