import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as moderationApi from '../lib/api/moderation';

export function useBlockedUsers() {
  return useQuery({ queryKey: ['blockedUsers'], queryFn: moderationApi.listBlocks });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moderationApi.blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['discover'] });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moderationApi.unblockUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blockedUsers'] }),
  });
}

export function useReportUser() {
  return useMutation({
    mutationFn: ({ userId, reason, details }: { userId: string; reason: moderationApi.ReportReason; details?: string }) =>
      moderationApi.reportUser(userId, reason, details),
  });
}
