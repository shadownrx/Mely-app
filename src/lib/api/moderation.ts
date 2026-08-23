import { apiRequest } from '../apiClient';

export type ReportReason =
  | 'FAKE_PROFILE'
  | 'INAPPROPRIATE'
  | 'HARASSMENT'
  | 'UNSOLICITED_SEXUAL'
  | 'POSSIBLE_MINOR'
  | 'SPAM_SCAM'
  | 'OTHER';

export function blockUser(userId: string) {
  return apiRequest<{ ok: true }>(`/users/${userId}/block`, { method: 'POST' });
}

export function unblockUser(userId: string) {
  return apiRequest<{ ok: true }>(`/users/${userId}/block`, { method: 'DELETE' });
}

export function reportUser(userId: string, reason: ReportReason, details?: string) {
  return apiRequest<{ ok: true; id: string }>(`/users/${userId}/report`, { method: 'POST', body: { reason, details } });
}

export function listBlocks() {
  return apiRequest<{ id: string; displayName: string; createdAt: string }[]>('/blocks');
}
