import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as shopApi from '../lib/api/shop';

export function useShop() {
  return useQuery({ queryKey: ['shop'], queryFn: shopApi.listShop, staleTime: Infinity });
}

export function usePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shopApi.purchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['walletHistory'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['discoverQuota'] });
    },
  });
}
