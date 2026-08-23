import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../lib/api/auth';
import * as profileApi from '../lib/api/profile';
import { disconnectRealtime } from '../lib/realtime';
import type { MeProfile } from '../types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: MeProfile | null;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: authApi.RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<MeProfile | null>(null);

  const refreshUser = useCallback(async () => {
    const me = await profileApi.getMe();
    setUser(me);
    setStatus('authenticated');
  }, []);

  useEffect(() => {
    if (!authApi.hasSession()) {
      setStatus('unauthenticated');
      return;
    }
    refreshUser().catch(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      await authApi.login(email, password);
      await refreshUser();
    },
    [refreshUser],
  );

  const register = useCallback(async (input: authApi.RegisterInput) => {
    // No refreshUser() here on purpose: RegisterView still has to create the
    // Profile (PUT /me/profile) and upload the photo/prompts after this call
    // resolves. Flipping status to "authenticated" before that finishes would
    // mount the main app with an incomplete user (no photos/profile yet).
    // RegisterView calls refreshUser() itself once that follow-up work is done.
    await authApi.register(input);
  }, []);

  const logout = useCallback(async () => {
    disconnectRealtime();
    await authApi.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, refreshUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
