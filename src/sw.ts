/// <reference lib="webworker" />
// Service worker propio: hace lo mismo que el que generaba Workbox (precachear el
// build + servir index.html como fallback de navegación, saltando /api/) y además
// escucha "push"/"notificationclick" para las notificaciones con la app cerrada.
// No se type-checkea con el resto de la app (ver tsconfig.json "exclude").

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(({ url }) => url.pathname.startsWith('/api/'), new NetworkOnly());

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/api\//],
  }),
);

type PushPayload = { title?: string; body?: string; data?: Record<string, unknown> };

self.addEventListener('push', (event: PushEvent) => {
  let payload: PushPayload = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { title: 'MELY', body: event.data?.text() ?? '' };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'MELY', {
      body: payload.body || '',
      icon: '/icon-192.png',
      badge: '/icon-32.png',
      data: payload.data ?? {},
    }),
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('/');
    }),
  );
});
