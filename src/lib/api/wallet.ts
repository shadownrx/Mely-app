import { apiRequest } from '../apiClient';
import type { CoinPack, LedgerEntry } from '../../types';

export function getWallet() {
  return apiRequest<{ balance: number; dailyBonusAvailable: boolean }>('/wallet');
}

export function claimDailyBonus() {
  return apiRequest<{ granted: boolean; amount: number; balance: number }>('/wallet/daily-bonus', {
    method: 'POST',
  });
}

export function getLedger(cursor?: string) {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiRequest<{ entries: LedgerEntry[] }>(`/wallet/history${qs}`);
}

export function listCoinPacks() {
  return apiRequest<CoinPack[]>('/wallet/packs');
}

/** Sin cobro real — ver docs/08-produccion.md del backend. */
export function recharge(packKey: string) {
  return apiRequest<{ amount: number; balance: number }>('/wallet/recharge', {
    method: 'POST',
    body: { packKey },
  });
}

export function redeemCode(code: string) {
  return apiRequest<{ amount: number; balance: number }>('/wallet/redeem', { method: 'POST', body: { code } });
}
