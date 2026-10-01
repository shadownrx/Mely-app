const ACCESS_KEY = 'mely_access_token';
const REFRESH_KEY = 'mely_refresh_token';

export const tokenStore = {
  getAccessToken(): string | null {
    // En navegación privada localStorage.getItem puede lanzar SecurityError —
    // mejor sesión ausente que un crash en el arranque.
    try {
      return localStorage.getItem(ACCESS_KEY);
    } catch {
      return null;
    }
  },
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  setTokens(accessToken: string, refreshToken: string) {
    try {
      localStorage.setItem(ACCESS_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
    } catch {
      /* almacenamiento no disponible: la sesión vive solo en memoria */
    }
  },
  clear() {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* nada que limpiar */
    }
  },
};
