import { apiRequest, API_BASE_URL } from '../apiClient';
import { tokenStore } from '../tokenStore';
import type { Message } from '../../types';

export function listMessages(connectionId: string, cursor?: string) {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiRequest<{ messages: Message[] }>(`/chat/${connectionId}/messages${qs}`);
}

export function sendMessage(connectionId: string, body: string, replyToId?: string) {
  return apiRequest<Message>(`/chat/${connectionId}/messages`, { method: 'POST', body: { body, replyToId } });
}

export async function sendPhoto(connectionId: string, file: File): Promise<Message> {
  const formData = new FormData();
  formData.append('photo', file);
  const token = tokenStore.getAccessToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/chat/${connectionId}/messages/photo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message ?? res.statusText);
  return data as Message;
}

export function markRead(connectionId: string) {
  return apiRequest<{ ok: true }>(`/chat/${connectionId}/read`, { method: 'POST' });
}

export function sendTyping(connectionId: string) {
  return apiRequest<{ ok: true }>(`/chat/${connectionId}/typing`, { method: 'POST' });
}
