import { apiRequest } from '../apiClient';

export type AppNotification = {
  id: string;
  category: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export function listNotifications() {
  return apiRequest<{ items: AppNotification[]; unreadCount: number }>('/me/notifications');
}

export function markNotificationRead(id: string) {
  return apiRequest<{ ok: true }>(`/me/notifications/${id}/read`, { method: 'POST' });
}

export function markAllNotificationsRead() {
  return apiRequest<{ ok: true }>('/me/notifications/read-all', { method: 'POST' });
}

export function deleteNotification(id: string) {
  return apiRequest<{ ok: true }>(`/me/notifications/${id}`, { method: 'DELETE' });
}

export function deleteAllNotifications() {
  return apiRequest<{ ok: true }>('/me/notifications', { method: 'DELETE' });
}

export function saveWebPushSubscription(subscription: PushSubscriptionJSON) {
  return apiRequest<{ ok: true }>('/me/web-push-subscription', { method: 'POST', body: subscription });
}

export function deleteWebPushSubscription(endpoint: string) {
  return apiRequest<{ ok: true }>('/me/web-push-subscription', { method: 'DELETE', body: { endpoint } });
}
