import { describe, expect, it } from 'vitest';
import { resolveNotificationTarget } from './notificationRouting';

describe('resolveNotificationTarget', () => {
  it('match, mensaje y citas van al chat cuando hay conexión', () => {
    for (const category of ['match', 'message', 'date_proposal', 'date_accepted', 'check_in']) {
      expect(resolveNotificationTarget(category, { connectionId: 'c1' })).toEqual({
        tab: 'mensajes',
        connectionId: 'c1',
      });
    }
  });

  it('sin conexión caen a citas en vez de romper', () => {
    expect(resolveNotificationTarget('match', undefined)).toEqual({ tab: 'citas' });
    expect(resolveNotificationTarget('message', null)).toEqual({ tab: 'citas' });
    expect(resolveNotificationTarget('date_accepted', {})).toEqual({ tab: 'citas' });
  });

  it('connectionId no-string se ignora', () => {
    expect(resolveNotificationTarget('message', { connectionId: 42 })).toEqual({ tab: 'citas' });
  });

  it('monedas y sellos van a su pantalla', () => {
    expect(resolveNotificationTarget('coins', {})).toEqual({ tab: 'tienda' });
    expect(resolveNotificationTarget('stamps', {})).toEqual({ tab: 'perfil' });
  });

  it('categoría desconocida o ausente devuelve null', () => {
    expect(resolveNotificationTarget('otra-cosa', {})).toBeNull();
    expect(resolveNotificationTarget(undefined, {})).toBeNull();
  });
});
