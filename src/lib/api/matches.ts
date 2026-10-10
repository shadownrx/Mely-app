import { apiRequest } from '../apiClient';
import type { DateMeet, Match, Profile } from '../../types';

export function listMatches() {
  return apiRequest<Match[]>('/matches');
}

export function getMatch(connectionId: string) {
  return apiRequest<
    Match & {
      conversationStartedAt: string | null;
      latestDate: DateMeet | null;
      actions: { proposeDate: { key: string; label: string } };
    }
  >(`/matches/${connectionId}`);
}

/** Matches que se enfriaron (sin mensajes a tiempo) — se pueden reactivar. */
export function listInactiveMatches() {
  return apiRequest<Match[]>('/matches/inactive');
}

export function reactivateMatch(connectionId: string) {
  return apiRequest<{ id: string; status: string; label: string; includedInPlan: boolean }>(`/matches/${connectionId}/reactivate`, {
    method: 'POST',
  });
}

export function getPublicProfile(userId: string) {
  return apiRequest<Profile>(`/users/${userId}`);
}
