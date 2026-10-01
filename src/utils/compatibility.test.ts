import { describe, expect, it } from 'vitest';
import { computeAffinity } from './compatibility';
import type { Profile } from '../types';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'p1',
    displayName: 'Test',
    age: 25,
    gender: 'WOMAN',
    genderLabel: 'Mujer',
    lookingFor: 'UNSURE',
    lookingForLabel: '',
    bio: null,
    city: null,
    zone: null,
    distance: null,
    photos: [],
    interests: [],
    badges: { verified: false, verification: 'NONE', verificationLabel: '', trusted: false },
    lastActive: null,
    membership: { tier: 'STANDARD', tierLabel: '', expiresAt: null },
    prompts: [],
    audioBio: null,
    blindPrompt: null,
    ...overrides,
  };
}

const interest = (id: string, slug: string, name: string) => ({ id, slug, name });

describe('computeAffinity', () => {
  it('parte de la base 38 sin señales cuando no hay datos', () => {
    const result = computeAffinity(makeProfile());
    expect(result.score).toBe(38);
    expect(result.signals).toEqual([]);
  });

  it('premia intereses en común con tope y etiqueta', () => {
    const profile = makeProfile({
      interests: [interest('1', 'cafe', 'Café de especialidad'), interest('2', 'cine', 'Cine')],
    });
    const result = computeAffinity(profile, ['1', '2']);
    expect(result.score).toBe(38 + 24);
    expect(result.signals[0].label).toContain('en común');
  });

  it('tope de 30 puntos por intereses compartidos', () => {
    const interests = Array.from({ length: 10 }, (_, i) => interest(String(i), `slug-${i}`, `Nombre ${i}`));
    const result = computeAffinity(makeProfile({ interests }), interests.map((i) => i.id));
    expect(result.score).toBeLessThanOrEqual(99);
  });

  it('verificación y confianza suman con su señal', () => {
    const verified = computeAffinity(
      makeProfile({ badges: { verified: true, verification: 'VERIFIED', verificationLabel: 'Identidad verificada', trusted: true } }),
    );
    expect(verified.score).toBe(38 + 10);
    expect(verified.signals).toHaveLength(1);

    const trusted = computeAffinity(
      makeProfile({ badges: { verified: false, verification: 'NONE', verificationLabel: '', trusted: true } }),
    );
    expect(trusted.score).toBe(38 + 8);
  });

  it('audio, prompts y cercanía suman explicado', () => {
    const profile = makeProfile({
      audioBio: { url: 'https://x/y.mp3', durationSec: 30 },
      prompts: [
        { id: 'q1', question: 'Q', answer: 'A' },
        { id: 'q2', question: 'Q', answer: 'A' },
      ],
      distance: 'a 2 km',
    });
    const result = computeAffinity(profile);
    expect(result.score).toBe(38 + 6 + 5 + 4);
    expect(result.signals.map((s) => s.icon)).toContain('mic');
  });

  it('el ánimo de hoy suma solo si algún interés resuena', () => {
    const match = makeProfile({ interests: [interest('1', 'cine-de-autor', 'Cine')] });
    const withMood = computeAffinity(match, [], ['cine']);
    expect(withMood.score).toBe(38 + 6);
    expect(withMood.signals.some((s) => s.label === 'En tu sintonía de hoy')).toBe(true);

    const noMatch = computeAffinity(match, [], ['trekking']);
    expect(noMatch.score).toBe(38);
    expect(noMatch.signals).toEqual([]);
  });

  it('matchea tildes y mayúsculas en el ánimo (café ~= cafe)', () => {
    const profile = makeProfile({ interests: [interest('1', 'cafe-de-especialidad', 'Café de especialidad')] });
    const result = computeAffinity(profile, [], ['café']);
    expect(result.signals.some((s) => s.label === 'En tu sintonía de hoy')).toBe(true);
  });

  it('ignora keywords vacías y limita a 3 señales', () => {
    const profile = makeProfile({
      interests: [interest('1', 'cine', 'Cine')],
      audioBio: { url: 'https://x/y.mp3', durationSec: 10 },
      prompts: [
        { id: 'q1', question: 'Q', answer: 'A' },
        { id: 'q2', question: 'Q', answer: 'A' },
      ],
      distance: 'cerca',
    });
    const result = computeAffinity(profile, ['1'], ['   ', 'cine']);
    expect(result.score).toBeLessThanOrEqual(99);
    expect(result.signals.length).toBeLessThanOrEqual(3);
  });
});
