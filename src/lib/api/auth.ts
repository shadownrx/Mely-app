import { apiRequest } from '../apiClient';
import { tokenStore } from '../tokenStore';

export type Session = {
  tokenType: 'Bearer';
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  dateOfBirth: string; // ISO yyyy-mm-dd
  acceptTerms: true;
  acceptPrivacy: true;
  phone?: string;
};

async function storeSession(session: Session) {
  tokenStore.setTokens(session.accessToken, session.refreshToken);
}

export async function register(input: RegisterInput) {
  const session = await apiRequest<Session>('/auth/register', {
    method: 'POST',
    body: input,
    skipAuthRetry: true,
  });
  await storeSession(session);
  return session;
}

export async function login(email: string, password: string) {
  const session = await apiRequest<Session>('/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuthRetry: true,
  });
  await storeSession(session);
  return session;
}

export async function logout() {
  const refreshToken = tokenStore.getRefreshToken();
  tokenStore.clear();
  if (!refreshToken) return;
  await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken }, skipAuthRetry: true }).catch(
    () => undefined,
  );
}

export function verifyEmail(email: string, code: string) {
  return apiRequest<{ ok: true }>('/auth/verify-email', { method: 'POST', body: { email, code }, skipAuthRetry: true });
}

export function resendVerification(email: string) {
  return apiRequest<{ ok: true }>('/auth/resend-verification', {
    method: 'POST',
    body: { email },
    skipAuthRetry: true,
  });
}

export function forgotPassword(email: string) {
  return apiRequest<{ ok: true }>('/auth/forgot-password', { method: 'POST', body: { email }, skipAuthRetry: true });
}

export function resetPassword(email: string, code: string, password: string) {
  return apiRequest<{ ok: true }>('/auth/reset-password', {
    method: 'POST',
    body: { email, code, password },
    skipAuthRetry: true,
  });
}

export function hasSession(): boolean {
  return Boolean(tokenStore.getRefreshToken());
}
