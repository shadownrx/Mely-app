import { useQuery } from '@tanstack/react-query';
import * as profileApi from '../lib/api/profile';

export function useStamps() {
  return useQuery({ queryKey: ['stamps'], queryFn: profileApi.getMyStamps });
}
