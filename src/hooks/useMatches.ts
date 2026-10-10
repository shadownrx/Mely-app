import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as matchesApi from '../lib/api/matches';

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: matchesApi.listMatches,
    refetchOnMount: 'always',
  });
}

export function useInactiveMatches() {
  return useQuery({ queryKey: ['matches', 'inactive'], queryFn: matchesApi.listInactiveMatches });
}

export function useReactivateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: matchesApi.reactivateMatch,
    onSuccess: () => {
      // ['matches'] también invalida ['matches', 'inactive'].
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['walletHistory'] });
      queryClient.invalidateQueries({ queryKey: ['perks'] });
    },
  });
}
