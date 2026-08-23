import { useMutation, useQuery } from '@tanstack/react-query';
import * as profileApi from '../lib/api/profile';

export function useInterests() {
  return useQuery({ queryKey: ['interests'], queryFn: profileApi.listInterests, staleTime: Infinity });
}

export function useUpdateProfile() {
  return useMutation({ mutationFn: profileApi.updateProfile });
}

export function useReplacePrompts() {
  return useMutation({ mutationFn: profileApi.replacePrompts });
}

export function useUploadPhoto() {
  return useMutation({ mutationFn: profileApi.uploadPhoto });
}

export function useDeletePhoto() {
  return useMutation({ mutationFn: profileApi.deletePhoto });
}

export function useReorderPhotos() {
  return useMutation({ mutationFn: profileApi.reorderPhotos });
}

export function useUploadAudioBio() {
  return useMutation({ mutationFn: profileApi.uploadAudioBio });
}

export function useUpdateNotificationPrefs() {
  return useMutation({ mutationFn: profileApi.updateNotificationPrefs });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: profileApi.deleteAccount });
}
