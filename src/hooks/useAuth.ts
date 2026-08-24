import { useMutation } from '@tanstack/react-query';
import * as authApi from '../lib/api/auth';

export function useRequestPhoneCode() {
  return useMutation({ mutationFn: authApi.requestPhoneCode });
}

export function useVerifyPhone() {
  return useMutation({ mutationFn: authApi.verifyPhone });
}
