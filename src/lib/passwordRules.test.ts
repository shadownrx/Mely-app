import { describe, expect, it } from 'vitest';
import { checkPasswordRules, isPasswordValid } from './passwordRules';

describe('passwordRules', () => {
  it('una contraseña sana pasa las tres reglas', () => {
    expect(isPasswordValid('Cafecito25', 'ana@mail.com')).toBe(true);
    expect(checkPasswordRules('Cafecito25', 'ana@mail.com').every((r) => r.ok)).toBe(true);
  });

  it('corta, sin números o larguísima no pasa', () => {
    expect(isPasswordValid('Cafe25')).toBe(false);
    expect(isPasswordValid('CafecitoSinNumeros')).toBe(false);
    expect(isPasswordValid('a1'.repeat(40))).toBe(false);
  });

  it('parecida al email no pasa (solo si el local tiene 4+ letras)', () => {
    expect(isPasswordValid('maria12345', 'maria@mail.com')).toBe(false);
    // local corto no cuenta como parecido
    expect(isPasswordValid('ana12345', 'an@mail.com')).toBe(true);
  });

  it('sin email solo evalúa forma', () => {
    expect(isPasswordValid('Cafecito25')).toBe(true);
    expect(isPasswordValid('corto1')).toBe(false);
  });
});
