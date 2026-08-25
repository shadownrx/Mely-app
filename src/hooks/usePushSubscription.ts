import { useCallback, useEffect, useState } from 'react';
import * as notificationsApi from '../lib/api/notifications';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export type PushState = 'unsupported' | 'checking' | 'denied' | 'subscribed' | 'unsubscribed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

const isPushCapable = () =>
  'serviceWorker' in navigator && 'PushManager' in window && Boolean(VAPID_PUBLIC_KEY);

/**
 * Notificaciones push del navegador con la app cerrada. No se activan solas: hay que
 * llamar a subscribe() desde una acción explícita del usuario (un switch en Ajustes),
 * porque dispara el permiso nativo del navegador.
 */
export function usePushSubscription() {
  const [state, setState] = useState<PushState>('checking');

  const refresh = useCallback(async () => {
    if (!isPushCapable()) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setState(existing ? 'subscribed' : 'unsubscribed');
    } catch {
      setState('unsubscribed');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const subscribe = useCallback(async () => {
    if (!VAPID_PUBLIC_KEY) throw new Error('Las notificaciones push no están configuradas.');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setState('denied');
      throw new Error('Activá el permiso de notificaciones en tu navegador para poder recibirlas.');
    }
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    await notificationsApi.saveWebPushSubscription(subscription.toJSON() as PushSubscriptionJSON);
    setState('subscribed');
  }, []);

  const unsubscribe = useCallback(async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await notificationsApi.deleteWebPushSubscription(subscription.endpoint).catch(() => undefined);
      await subscription.unsubscribe();
    }
    setState('unsubscribed');
  }, []);

  return { state, subscribe, unsubscribe };
}
