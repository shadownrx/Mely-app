import type { Profile, VerifiedSpot } from '../types';
import { VERIFIED_SPOTS } from '../data/mockData';

export interface PlanSuggestion {
  spot: VerifiedSpot;
  /** Motivo visible y honesto: cita el interés real que hizo match. */
  reason: string;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * Pilar 2 — "El plan es el perfil".
 *
 * Cada persona carga una hipótesis concreta de primera cita: un rincón
 * verificado REAL (del directorio estático) conectado con un interés REAL del
 * perfil. Si nada matchea, no hay sugerencia — nunca se inventa un plan.
 * El feed de planes abiertos ("voy a X el sábado, sumate") queda como
 * backend futuro: GET /plans/open + join.
 */
export function suggestPlanSpot(
  profile: Profile,
  spots: VerifiedSpot[] = VERIFIED_SPOTS,
): PlanSuggestion | null {
  const haystacks = profile.interests.map((i) => ({ text: `${norm(i.slug)} ${norm(i.name)}`, name: i.name }));
  // La "cita ideal" declarada en modo cita a ciegas también cuenta.
  if (profile.blindPrompt?.idealDate) {
    haystacks.push({ text: norm(profile.blindPrompt.idealDate), name: 'tu cita ideal' });
  }

  let best: { spot: VerifiedSpot; reason: string; hits: number } | null = null;
  for (const spot of spots) {
    const keywords = spotKeywords(spot.category);
    let hits = 0;
    let reasonName: string | null = null;
    for (const h of haystacks) {
      const matched = keywords.some((k) => h.text.includes(k));
      if (matched) {
        hits += 1;
        reasonName ??= h.name;
      }
    }
    if (hits > 0 && (!best || hits > best.hits)) {
      best = { spot, reason: reasonName ?? spot.category, hits };
    }
  }

  if (!best) return null;
  return {
    spot: best.spot,
    reason:
      best.reason === 'tu cita ideal'
        ? 'va con tu cita ideal declarada'
        : `por su interés en ${best.reason.toLowerCase()}`,
  };
}

function spotKeywords(category: VerifiedSpot['category']): string[] {
  switch (category) {
    case 'cafe':
      return ['cafe', 'coffee', 'merienda', 'mate', 'brunch', 'pasteler', 'torta', 'te', 'desayuno'];
    case 'wine':
      return ['vino', 'wine', 'vermu', 'birra', 'cerveza', 'vinos'];
    case 'cocktail':
      return ['cocktail', 'coctel', 'tragos', 'bar', 'noche', 'fiesta', 'boliche', 'salir', 'cerveza'];
    case 'books':
      return ['libro', 'lectura', 'leer', 'librer', 'biblioteca', 'escribir'];
    case 'park':
      return ['trekking', 'senderismo', 'naturaleza', 'aire', 'bici', 'running', 'playa', 'monta', 'camping', 'picnic', 'deporte', 'parque', 'plaza'];
    case 'culture':
      return ['cine', 'pelicula', 'teatro', 'museo', 'arte', 'recital', 'musica', 'show', 'vinilo', 'foto', 'danza'];
  }
}
