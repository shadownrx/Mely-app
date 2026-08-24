import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationsApi from '../lib/api/notifications';

export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.listNotifications });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
