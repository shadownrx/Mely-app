import { useQuery } from '@tanstack/react-query';
import * as matchesApi from '../lib/api/matches';

export function useMatches() {
  return useQuery({ queryKey: ['matches'], queryFn: matchesApi.listMatches });
}
