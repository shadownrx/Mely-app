import { apiRequest } from '../apiClient';
import { uploadFile, uploadImage } from './upload';
import type { Gender, LookingFor, MeProfile, Photo, Prompt, Stamp, VerificationLevel } from '../../types';

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

export function uploadPhoto(file: File) {
  return uploadImage<Photo>('/me/photos', file);
}

export function submitVerificationSelfie(file: File) {
  return uploadImage<{ ok: true; verification: VerificationLevel }>('/me/verify-photo', file);
}

export function deletePhoto(photoId: string) {
  return apiRequest<{ ok: true }>(`/me/photos/${photoId}`, { method: 'DELETE' });
}

export function reorderPhotos(photoIds: string[]) {
  return apiRequest<Photo[]>('/me/photos/reorder', { method: 'PUT', body: { photoIds } });
}

export function uploadAudioBio(file: File) {
  return uploadFile<{ ok: true; audioBio: { url: string; durationSec: number | null } }>(
    '/me/audio-bio',
    'audio',
    file,
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
