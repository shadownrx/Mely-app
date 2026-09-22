import type { VerifiedSpot } from '../types';

/**
 * Pilar 1 — "La intención manda".
 *
 * El deseo es temporal ("esta semana estoy para café tranqui"), los filtros
 * son estáticos (edad/distancia). La intención semanal es el lente primario
 * del descubrimiento: se declara en un tap, se muestra como banner, expira
 * sola y se traduce a slugs de intereses REALES (intersección en runtime
 * contra el catálogo de `/interests`, nunca slugs inventados).
 */

export interface Intention {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  /** Palabras a buscar en slug o nombre del catálogo real de intereses. */
  keywords: string[];
  /** Categorías de VerifiedSpot afines (para el plan sugerido del pilar 2). */
  spotCategories: VerifiedSpot['category'][];
}

export const INTENTIONS: Intention[] = [
  {
    id: 'cafe',
    label: 'Café tranqui',
    icon: 'local_cafe',
    blurb: 'Charla sin apuro, merienda, caminar después',
    keywords: ['cafe', 'café', 'coffee', 'merienda', 'mate', 'brunch', 'pasteler', 'torta', 'te '],
    spotCategories: ['cafe'],
  },
  {
    id: 'noche',
    label: 'Salir de noche',
    icon: 'local_bar',
    blurb: 'Vermú, vino o tragos en un rincón verificado',
    keywords: ['vino', 'wine', 'vermu', 'vermú', 'birra', 'cerveza', 'cocktail', 'coctel', 'tragos', 'bar', 'noche', 'fiesta', 'boliche', 'salir'],
    spotCategories: ['wine', 'cocktail'],
  },
  {
    id: 'aire',
    label: 'Aire libre',
    icon: 'park',
    blurb: 'Parque, río, picnic o caminata al atardecer',
    keywords: ['trekking', 'senderismo', 'naturaleza', 'aire', 'bici', 'bicicleta', 'running', 'correr', 'playa', 'monta', 'camping', 'picnic', 'deporte', 'yoga', 'escalada'],
    spotCategories: ['park'],
  },
  {
    id: 'cultura',
    label: 'Cultura',
    icon: 'book',
    blurb: 'Libros, cine, museos o música en vivo',
    keywords: ['libro', 'lectura', 'leer', 'librer', 'biblioteca', 'cine', 'pelicula', 'película', 'teatro', 'museo', 'arte', 'recital', 'musica', 'música', 'show', 'vinilo', 'foto', 'escribir'],
    spotCategories: ['books', 'culture'],
  },
  {
    id: 'charla',
    label: 'Charla profunda',
    icon: 'forum',
    blurb: 'Conversación real antes que la foto',
    keywords: ['charla', 'filosof', 'viajes', 'viajar', 'espiritual', 'psicolo', 'debate', 'podcast', 'documental', 'historia', 'política', 'politica'],
    spotCategories: ['cafe', 'books'],
  },
];

export interface InterestRef {
  id: string;
  slug: string;
  name: string;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

function catalogMatches(keyword: string, item: InterestRef): boolean {
  const k = norm(keyword).trim();
  if (!k) return false;
  return norm(item.slug).includes(k) || norm(item.name).includes(k);
}

/**
 * Traduce una intención a slugs del catálogo REAL. Si el backend no tiene
 * intereses que matcheen, devuelve [] (sin filtro) en vez de inventar slugs
 * que el backend ignoraría o, peor, que filtrarían todo.
 */
export function resolveIntentionSlugs(intention: Intention, catalog: InterestRef[]): string[] {
  const slugs = new Set<string>();
  for (const item of catalog) {
    if (intention.keywords.some((k) => catalogMatches(k, item))) slugs.add(item.slug);
  }
  return [...slugs];
}

export function getIntention(id: string | null): Intention | null {
  if (!id) return null;
  return INTENTIONS.find((i) => i.id === id) ?? null;
}

const STORAGE_KEY = 'mely-weekly-intention';

export function loadIntention(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveIntention(id: string | null): void {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* modo privado: la intención vive solo en memoria de la sesión */
  }
}
