/**
 * Pestaña "Enviados" sin backend: el historial de likes vive en el teléfono.
 * El backend no expone a quién le di like (solo matches y quién me dio like),
 * así que se guarda un snapshot mínimo en cada like/superlike. Cap 50,
 * ordenado del más reciente al más viejo.
 */

export interface SentLike {
  profileId: string;
  displayName: string;
  age: number;
  photoUrl: string | null;
  at: number;
}

const STORAGE_KEY = 'mely-sent-likes';
const MAX = 50;

export function recordSentLike(input: Omit<SentLike, 'at'>): void {
  try {
    const prev = readSentLikes();
    const next = [{ ...input, at: Date.now() }, ...prev.filter((s) => s.profileId !== input.profileId)].slice(0, MAX);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* modo privado: sin historial */
  }
}

export function readSentLikes(): SentLike[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SentLike[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
