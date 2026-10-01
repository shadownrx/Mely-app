import { describe, expect, it } from 'vitest';
import { getIntention, resolveIntentionSlugs } from './intentions';
import type { InterestRef } from './intentions';

const catalog: InterestRef[] = [
  { id: '1', slug: 'cafe-de-especialidad', name: 'Café de especialidad' },
  { id: '2', slug: 'merienda', name: 'Merienda' },
  { id: '3', slug: 'trekking', name: 'Trekking' },
];

describe('resolveIntentionSlugs', () => {
  it('traduce la intención a slugs reales del catálogo', () => {
    const intention = getIntention('cafe');
    expect(intention).not.toBeNull();
    const slugs = resolveIntentionSlugs(intention!, catalog);
    expect(slugs).toContain('cafe-de-especialidad');
    expect(slugs).toContain('merienda');
    expect(slugs).not.toContain('trekking');
  });

  it('matchea sin importar tildes ni mayúsculas', () => {
    const intention = getIntention('cafe');
    const slugs = resolveIntentionSlugs(intention!, [{ id: '9', slug: 'CAFE', name: 'CAFE' }]);
    expect(slugs).toEqual(['CAFE']);
  });

  it('si nada matchea devuelve vacío (sin filtro) en vez de inventar slugs', () => {
    const intention = getIntention('noche');
    const slugs = resolveIntentionSlugs(intention!, [{ id: '7', slug: 'ajedrez', name: 'Ajedrez' }]);
    expect(slugs).toEqual([]);
  });

  it('nunca devuelve slugs fuera del catálogo', () => {
    for (const intention of [getIntention('cafe')!, getIntention('aire')!, getIntention('charla')!]) {
      const valid = new Set(catalog.map((c) => c.slug));
      for (const slug of resolveIntentionSlugs(intention, catalog)) {
        expect(valid.has(slug)).toBe(true);
      }
    }
  });

  it('getIntention con id raro devuelve null', () => {
    expect(getIntention(null)).toBeNull();
    expect(getIntention('no-existe')).toBeNull();
  });
});
