import { apiRequest } from '../apiClient';
import type { CancelReason, DateMeet, DateProposal, PlanType } from '../../types';

export function getDatesMeta() {
  return apiRequest<{ key: string; label: string; planTypes: { value: PlanType; label: string }[] }>('/dates/meta');
}

export function listProposals(connectionId: string) {
  return apiRequest<DateProposal[]>(`/dates/connections/${connectionId}/proposals`);
}

export function getCurrentDateMeet(connectionId: string) {
  return apiRequest<DateMeet | null>(`/dates/connections/${connectionId}/current`);
}

export function proposeDate(
  connectionId: string,
  input: { scheduledAt?: string; zone: string; planType?: PlanType; note?: string },
) {
  return apiRequest<DateProposal>(`/dates/connections/${connectionId}/proposals`, { method: 'POST', body: input });
}

export function acceptProposal(proposalId: string) {
  return apiRequest<DateMeet>(`/dates/proposals/${proposalId}/accept`, { method: 'POST' });
}

export function counterProposal(proposalId: string, input: { scheduledAt: string; zone?: string }) {
  return apiRequest<DateProposal>(`/dates/proposals/${proposalId}/counter`, { method: 'POST', body: input });
}

export function declineProposal(proposalId: string) {
  return apiRequest<{ ok: true }>(`/dates/proposals/${proposalId}/decline`, { method: 'POST' });
}

export function cancelDate(dateId: string, input?: { reason?: CancelReason; note?: string }) {
  return apiRequest<{ ok: true }>(`/dates/${dateId}/cancel`, { method: 'POST', body: input ?? {} });
}

export function generateCheckInQr(dateId: string, coords: { latitude: number; longitude: number }) {
  return apiRequest<{ code: string; expiresAt: string; ttlSeconds: number; payload: string }>(
    `/dates/${dateId}/check-in/qr`,
    { method: 'POST', body: coords },
  );
}

export function scanCheckIn(dateId: string, code: string, coords: { latitude: number; longitude: number }) {
  return apiRequest<{ checkIn: true }>(`/dates/${dateId}/check-in/scan`, {
    method: 'POST',
    body: { code, ...coords },
  });
}

export function confirmDate(dateId: string, sawEachOther: boolean) {
  return apiRequest<{ verified: boolean; waiting: boolean; status?: string; coinsEarned: number }>(
    `/dates/${dateId}/confirm`,
    { method: 'POST', body: { sawEachOther } },
  );
}

export function reportNoShow(dateId: string, appeared: boolean) {
  return apiRequest<{ ok: true }>(`/dates/${dateId}/no-show`, { method: 'POST', body: { appeared } });
}
