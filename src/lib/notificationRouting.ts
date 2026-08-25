import type { TabType } from '../types';

export type NotificationTarget = { tab: TabType; connectionId?: string };

/**
 * A qué pantalla lleva cada tipo de notificación. Función pura sin dependencias de
 * React/DOM a propósito: la usan tanto App.tsx (contexto normal) como sw.ts (contexto
 * de Service Worker, donde no hay React ni window disponibles).
 */
export function resolveNotificationTarget(
  category: string | undefined,
  data: Record<string, unknown> | undefined | null,
): NotificationTarget | null {
  const connectionId = typeof data?.connectionId === 'string' ? data.connectionId : undefined;

  switch (category) {
    case 'match':
    case 'message':
    case 'date_proposal':
    case 'date_accepted':
    case 'check_in':
      return connectionId ? { tab: 'mensajes', connectionId } : { tab: 'citas' };
    case 'coins':
      return { tab: 'tienda' };
    case 'stamps':
      return { tab: 'perfil' };
    default:
      return null;
  }
}
