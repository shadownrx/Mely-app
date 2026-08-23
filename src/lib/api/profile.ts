import { apiRequest, API_BASE_URL } from '../apiClient';
import { tokenStore } from '../tokenStore';
import type { Gender, LookingFor, MeProfile, Photo, Prompt, Stamp } from '../../types';

export function getMe() {
  return apiRequest<MeProfile>('/me');
}

export type ProfileInput = {
  displayName: string;
  gender: Gender;
  seeking: Gender[];
  lookingFor: LookingFor;
  bio?: string | null;
  city?: string | null;
  zone?: string | null;
  maxDistanceKm?: number;
  minAge?: number;
  maxAge?: number;
  job?: string | null;
  studies?: string | null;
  interestIds?: string[];
  blindPromptTeaser?: string | null;
  blindPromptPhilosophy?: string | null;
  blindPromptIdealDate?: string | null;
};

export function updateProfile(input: ProfileInput) {
  return apiRequest<MeProfile>('/me/profile', { method: 'PUT', body: input });
}

export function updateLocation(input: { latitude: number; longitude: number; city?: string; zone?: string }) {
  return apiRequest<{ ok: true; hasLocation: true }>('/me/location', { method: 'PUT', body: input });
}

export function replacePrompts(prompts: { question: string; answer: string }[]) {
  return apiRequest<Prompt[]>('/me/prompts', { method: 'PUT', body: { prompts } });
}

/** multipart/form-data: sube directo con fetch, no pasa por apiRequest (necesita FormData). */
async function uploadMultipart<T>(path: string, formData: FormData): Promise<T> {
  const token = tokenStore.getAccessToken();
  const res = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data?.error;
    throw new Error(err?.message ?? res.statusText);
  }
  return data as T;
}

export function uploadPhoto(file: File) {
  const formData = new FormData();
  formData.append('photo', file);
  return uploadMultipart<Photo>('/me/photos', formData);
}

export function deletePhoto(photoId: string) {
  return apiRequest<{ ok: true }>(`/me/photos/${photoId}`, { method: 'DELETE' });
}

export function reorderPhotos(photoIds: string[]) {
  return apiRequest<Photo[]>('/me/photos/reorder', { method: 'PUT', body: { photoIds } });
}

export function uploadAudioBio(file: File) {
  const formData = new FormData();
  formData.append('audio', file);
  return uploadMultipart<{ ok: true; audioBio: { url: string; durationSec: number | null } }>(
    '/me/audio-bio',
    formData,
  );
}

export function updateNotificationPrefs(prefs: Record<string, boolean>) {
  return apiRequest<Record<string, boolean>>('/me/notifications', { method: 'PATCH', body: prefs });
}

export function savePushToken(token: string, platform: string) {
  return apiRequest<{ ok: true }>('/me/push-token', { method: 'POST', body: { token, platform } });
}

export function deleteAccount() {
  return apiRequest<{ ok: true }>('/me', { method: 'DELETE' });
}

export function listInterests() {
  return apiRequest<{ id: string; slug: string; name: string }[]>('/interests');
}

export function getMyStamps() {
  return apiRequest<Stamp[]>('/me/stamps');
}
