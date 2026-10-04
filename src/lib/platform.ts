import { Capacitor } from '@capacitor/core';

/** true dentro del APK/IPA (WebView de Capacitor), false en el navegador o la PWA instalada. */
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/** App "instalada": nativa, o PWA abierta sin la barra del navegador. */
export const isStandaloneApp = (): boolean =>
  isNativeApp() ||
  (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches === true);
