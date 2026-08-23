import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as walletApi from '../lib/api/wallet';

export function useWallet() {
  return useQuery({ queryKey: ['wallet'], queryFn: walletApi.getWallet });
}

export function useWalletHistory() {
  return useQuery({ queryKey: ['walletHistory'], queryFn: () => walletApi.getLedger() });
}

export function useCoinPacks() {
  return useQuery({ queryKey: ['coinPacks'], queryFn: walletApi.listCoinPacks, staleTime: Infinity });
}

function useInvalidateWallet() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    queryClient.invalidateQueries({ queryKey: ['walletHistory'] });
  };
}

export function useRecharge() {
  const invalidate = useInvalidateWallet();
  return useMutation({ mutationFn: walletApi.recharge, onSuccess: invalidate });
}

export function useRedeemCode() {
  const invalidate = useInvalidateWallet();
  return useMutation({ mutationFn: walletApi.redeemCode, onSuccess: invalidate });
}
