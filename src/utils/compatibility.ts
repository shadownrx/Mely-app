import type { Profile } from '../types';

export interface AffinitySignal {
  /** Etiqueta corta lista para UI, ej. "Café de especialidad en común". */
  label: string;
  /** Icono Material Symbols a mostrar junto a la señal. */
  icon: string;
}

export interface Affinity {
  /** 0-99, determinista y explicable. No es un score de ML: es aritmética visible. */
  score: number;
  signals: AffinitySignal[];
}

/**
 * Explicador de afinidad client-side.
 *
 * Intencionalmente determinista: cada punto viene de un dato real del perfil
 * (intereses, verificación, distancia, audio/prompts) y cada señal explica su
 * origen. No inventa compatibilidad ni llama a ningún backend nuevo.
 */
export function computeAffinity(profile: Profile, myInterestIds: string[] = []): Affinity {
  const signals: AffinitySignal[] = [];
  let score = 38; // base: toda persona del mazo ya pasó los filtros duros.

  const mine = new Set(myInterestIds);
  const shared = profile.interests.filter((i) => mine.has(i.id));
  if (shared.length > 0) {
    score += Math.min(30, shared.length * 12);
    const names = shared
      .slice(0, 2)
      .map((i) => i.name.toLowerCase())
      .join(' y ');
    signals.push({ label: `${names} en común`, icon: 'favorite' });
  }

  if (profile.badges.verified) {
    score += 10;
    signals.push({ label: profile.badges.verificationLabel || 'Identidad verificada', icon: 'verified' });
  } else if (profile.badges.trusted) {
    score += 8;
    signals.push({ label: 'Citas verificadas', icon: 'verified' });
  }

  if (profile.audioBio) {
    score += 6;
    signals.push({ label: 'Con voz, no solo fotos', icon: 'mic' });
  }

  if (profile.prompts.length >= 2) {
    score += 5;
    signals.push({ label: 'Cuaderno con historia', icon: 'auto_stories' });
  }

  // Distancia ya viene formateada ("a 2 km"); premiamos cercanía explícita.
  if (profile.distance && /2\s?km|1\s?km|500\s?m|cerca/i.test(profile.distance)) {
    score += 4;
    signals.push({ label: 'Cerquita tuyo', icon: 'location_on' });
  }

  return { score: Math.max(0, Math.min(99, Math.round(score))), signals: signals.slice(0, 3) };
}
