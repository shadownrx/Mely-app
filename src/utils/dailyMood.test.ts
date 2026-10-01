import { beforeEach, describe, expect, it } from 'vitest';
import { DAILY_MOODS, getDailyMood, loadDailyMood, saveDailyMood } from './dailyMood';

function yesterdayKey(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

describe('dailyMood', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sin nada guardado devuelve null', () => {
    expect(loadDailyMood()).toBeNull();
  });

  it('guardar y leer el ánimo del día hace roundtrip', () => {
    saveDailyMood('tranqui');
    expect(loadDailyMood()).toBe('tranqui');
  });

  it('el ánimo de ayer expira solo', () => {
    localStorage.setItem('mely-daily-mood', JSON.stringify({ id: 'risa', day: yesterdayKey() }));
    expect(loadDailyMood()).toBeNull();
  });

  it('storage corrupto o con forma rara devuelve null sin romper', () => {
    localStorage.setItem('mely-daily-mood', 'no-json{{{');
    expect(loadDailyMood()).toBeNull();
    localStorage.setItem('mely-daily-mood', JSON.stringify({ id: 42, day: 'x' }));
    expect(loadDailyMood()).toBeNull();
    localStorage.setItem('mely-daily-mood', JSON.stringify(['tranqui']));
    expect(loadDailyMood()).toBeNull();
  });

  it('ids desconocidos se descartan aunque el día sea hoy', () => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const day = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    localStorage.setItem('mely-daily-mood', JSON.stringify({ id: 'fiesta-inexistente', day }));
    expect(loadDailyMood()).toBeNull();
  });

  it('guardar null limpia el ánimo', () => {
    saveDailyMood('aire');
    saveDailyMood(null);
    expect(loadDailyMood()).toBeNull();
  });

  it('getDailyMood resuelve datos completos', () => {
    expect(getDailyMood(null)).toBeNull();
    expect(getDailyMood('no-existe')).toBeNull();
    const mood = getDailyMood('cultura');
    expect(mood?.keywords.length).toBeGreaterThan(0);
    expect(DAILY_MOODS.length).toBeGreaterThanOrEqual(5);
  });
});
