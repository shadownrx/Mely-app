/**
 * Ritual diario — "Hoy estoy para…".
 *
 * La intención semanal (intentions.ts) es el lente estable; el ánimo diario es
 * el pulso del día: expira solo a la medianoche, vive en localStorage y no
 * toca el backend. Mientras está activo suma una señal explicada a la afinidad
 * ("En tu sintonía de hoy"), nunca filtra ni oculta perfiles.
 */

export interface DailyMood {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  /** Palabras a buscar en slug o nombre de intereses (misma idea que INTENTIONS). */
  keywords: string[];
}

export const DAILY_MOODS: DailyMood[] = [
  {
    id: 'tranqui',
    label: 'Tranqui',
    icon: 'local_cafe',
    blurb: 'Hoy voy de café, caminata y charla sin apuro.',
    keywords: ['cafe', 'café', 'coffee', 'merienda', 'mate', 'caminar', 'caminata', 'parque', 'libro'],
  },
  {
    id: 'risa',
    label: 'Reírme',
    icon: 'celebration',
    blurb: 'Hoy necesito humor y buena onda.',
    keywords: ['humor', 'risa', 'reir', 'reír', 'comedia', 'juegos', 'juego', 'karaoke', 'fiesta'],
  },
  {
    id: 'aire',
    label: 'Moverme',
    icon: 'park',
    blurb: 'Hoy el plan es aire libre y movimiento.',
    keywords: ['running', 'correr', 'bici', 'bicicleta', 'trekking', 'yoga', 'deporte', 'playa', 'picnic', 'naturaleza'],
  },
  {
    id: 'charla',
    label: 'Charla real',
    icon: 'forum',
    blurb: 'Hoy quiero conversación de verdad.',
    keywords: ['charla', 'filosof', 'debate', 'podcast', 'documental', 'psicolo', 'escribir', 'poesía', 'poesia'],
  },
  {
    id: 'cultura',
    label: 'Salir',
    icon: 'palette',
    blurb: 'Hoy salgo: muestra, cine, música o tragos.',
    keywords: ['cine', 'museo', 'arte', 'musica', 'música', 'recital', 'teatro', 'vino', 'tragos', 'bar', 'cocina', 'comer'],
  },
];

const STORAGE_KEY = 'mely-daily-mood';

function todayKey(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getDailyMood(id: string | null): DailyMood | null {
  if (!id) return null;
  return DAILY_MOODS.find((m) => m.id === id) ?? null;
}

/** Lee el ánimo solo si es de hoy; el de ayer expira solo. */
export function loadDailyMood(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { id, day } = parsed as { id?: unknown; day?: unknown };
    if (typeof id !== 'string' || day !== todayKey()) return null;
    return getDailyMood(id)?.id ?? null;
  } catch {
    return null;
  }
}

export function saveDailyMood(id: string | null): void {
  try {
    if (!id) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, day: todayKey() }));
  } catch {
    /* modo privado: el ánimo vive solo la sesión */
  }
}
