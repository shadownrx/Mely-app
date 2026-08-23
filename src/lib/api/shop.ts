import { apiRequest } from '../apiClient';
import type { ShopItem } from '../../types';

export function listShop() {
  return apiRequest<ShopItem[]>('/shop');
}

export type PurchaseInput = {
  itemKey: string;
  targetUserId?: string;
  connectionId?: string;
};

export function purchase(input: PurchaseInput) {
  return apiRequest<{ item: string; result: unknown }>('/shop/purchase', { method: 'POST', body: input });
}
