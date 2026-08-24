import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import * as datesApi from '../lib/api/dates';
import { useMatches } from './useMatches';
import type { ConnectionStatus } from '../types';

const DATE_ACTIVE_STATUSES: ConnectionStatus[] = ['PROPOSAL', 'DATE_AGREED', 'DATE_VERIFIED', 'SECOND_DATE'];

/** No hay un GET /dates global: se arma listando matches con un ciclo de cita activo y trayendo su cita vigente. */
export function useAllDateProposals() {
  const matchesQuery = useMatches();
  const relevantMatches = (matchesQuery.data ?? []).filter((m) => DATE_ACTIVE_STATUSES.includes(m.status));

  const dateMeetQueries = useQueries({
    queries: relevantMatches.map((m) => ({
      queryKey: ['dateMeet', m.id],
      queryFn: () => datesApi.getCurrentDateMeet(m.id),
      enabled: matchesQuery.isSuccess,
    })),
  });

  const items = relevantMatches
    .map((match, i) => ({ match, dateMeet: dateMeetQueries[i]?.data ?? null }))
    .filter((it): it is { match: (typeof relevantMatches)[number]; dateMeet: NonNullable<typeof it.dateMeet> } =>
      Boolean(it.dateMeet),
    );

  return {
    items,
    isLoading: matchesQuery.isLoading || dateMeetQueries.some((q) => q.isLoading),
  };
}

export function useDatesMeta() {
  return useQuery({ queryKey: ['datesMeta'], queryFn: datesApi.getDatesMeta, staleTime: Infinity });
}

export function useProposals(connectionId: string | null) {
  return useQuery({
    queryKey: ['proposals', connectionId],
    queryFn: () => datesApi.listProposals(connectionId as string),
    enabled: Boolean(connectionId),
  });
}

export function useCurrentDateMeet(connectionId: string | null) {
  return useQuery({
    queryKey: ['dateMeet', connectionId],
    queryFn: () => datesApi.getCurrentDateMeet(connectionId as string),
    enabled: Boolean(connectionId),
  });
}

function useInvalidateDates(connectionId?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['proposals'] });
    queryClient.invalidateQueries({ queryKey: ['matches'] });
    queryClient.invalidateQueries({ queryKey: ['dateMeet'] });
    if (connectionId) queryClient.invalidateQueries({ queryKey: ['dateMeet', connectionId] });
  };
}

export function useProposeDate(connectionId: string) {
  const invalidate = useInvalidateDates(connectionId);
  return useMutation({
    mutationFn: (input: Parameters<typeof datesApi.proposeDate>[1]) => datesApi.proposeDate(connectionId, input),
    onSuccess: invalidate,
  });
}

export function useAcceptProposal() {
  const invalidate = useInvalidateDates();
  return useMutation({ mutationFn: datesApi.acceptProposal, onSuccess: invalidate });
}

export function useCounterProposal() {
  const invalidate = useInvalidateDates();
  return useMutation({
    mutationFn: ({ proposalId, input }: { proposalId: string; input: Parameters<typeof datesApi.counterProposal>[1] }) =>
      datesApi.counterProposal(proposalId, input),
    onSuccess: invalidate,
  });
}

export function useDeclineProposal() {
  const invalidate = useInvalidateDates();
  return useMutation({ mutationFn: datesApi.declineProposal, onSuccess: invalidate });
}

export function useCancelDate() {
  const invalidate = useInvalidateDates();
  return useMutation({
    mutationFn: ({ dateId, input }: { dateId: string; input?: Parameters<typeof datesApi.cancelDate>[1] }) =>
      datesApi.cancelDate(dateId, input),
    onSuccess: invalidate,
  });
}

type Coords = { latitude: number; longitude: number };

export function useGenerateQr() {
  return useMutation({
    mutationFn: ({ dateId, coords }: { dateId: string; coords: Coords }) =>
      datesApi.generateCheckInQr(dateId, coords),
  });
}

export function useScanCheckIn() {
  const invalidate = useInvalidateDates();
  return useMutation({
    mutationFn: ({ dateId, code, coords }: { dateId: string; code: string; coords: Coords }) =>
      datesApi.scanCheckIn(dateId, code, coords),
    onSuccess: invalidate,
  });
}

export function useConfirmDate() {
  const invalidate = useInvalidateDates();
  return useMutation({
    mutationFn: ({ dateId, sawEachOther }: { dateId: string; sawEachOther: boolean }) =>
      datesApi.confirmDate(dateId, sawEachOther),
    onSuccess: invalidate,
  });
}

export function useReportNoShow() {
  const invalidate = useInvalidateDates();
  return useMutation({
    mutationFn: ({ dateId, appeared }: { dateId: string; appeared: boolean }) =>
      datesApi.reportNoShow(dateId, appeared),
    onSuccess: invalidate,
  });
}
