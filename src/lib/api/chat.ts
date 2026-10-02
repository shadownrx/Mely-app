import { apiRequest } from '../apiClient';
import { uploadImage } from './upload';
import type { Message } from '../../types';

export function listMessages(connectionId: string, cursor?: string) {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiRequest<{ messages: Message[] }>(`/chat/${connectionId}/messages${qs}`);
}

export function sendMessage(connectionId: string, body: string, replyToId?: string) {
  return apiRequest<Message>(`/chat/${connectionId}/messages`, { method: 'POST', body: { body, replyToId } });
}

export function sendPhoto(connectionId: string, file: File): Promise<Message> {
  return uploadImage<Message>(`/chat/${connectionId}/messages/photo`, file);
}

export function markRead(connectionId: string) {
  return apiRequest<{ ok: true }>(`/chat/${connectionId}/read`, { method: 'POST' });
}

export function sendTyping(connectionId: string) {
  return apiRequest<{ ok: true }>(`/chat/${connectionId}/typing`, { method: 'POST' });
}
