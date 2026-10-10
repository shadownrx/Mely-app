import { apiRequest } from '../apiClient';
import type { PerkStatus, ShopItem } from '../../types';

export function listShop() {
  return apiRequest<ShopItem[]>('/shop');
}

export type PurchaseInput = {
  itemKey: string;
  targetUserId?: string;
  connectionId?: string;
};

export function purchase(input: PurchaseInput) {
  return apiRequest<{ item: string; includedInPlan: boolean; result: unknown }>('/shop/purchase', { method: 'POST', body: input });
}

/** Poderes incluidos en el plan actual y cuántos usos quedan. */
export function getPerks() {
  return apiRequest<PerkStatus>('/shop/perks');
}
