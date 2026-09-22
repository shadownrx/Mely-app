/**
 * Pilar 3 — "El contexto viaja".
 *
 * El fragmento que disparó el like (un interés, una respuesta) no puede morir
 * en Discover: viaja en memoria hacia el match, la celebración y la nota del
 * plan. Es un singleton de sesión a propósito — el contexto pertenece al
 * momento del descubrimiento, no se persiste (eso requeriría backend futuro:
 * `fragment` en POST /discover/like/:id).
 */

const store = new Map<string, string>();

export function rememberFragment(profileId: string, label: string): void {
  store.set(profileId, label);
}

/** Lee sin consumir (para previsualizar). */
export function peekFragment(profileId: string): string | null {
  return store.get(profileId) ?? null;
}

/** Lee y consume: el contexto se usa una vez (celebración o nota del plan). */
export function consumeFragment(profileId: string): string | null {
  const label = store.get(profileId) ?? null;
  if (label) store.delete(profileId);
  return label;
}

export function forgetFragment(profileId: string): void {
  store.delete(profileId);
}
