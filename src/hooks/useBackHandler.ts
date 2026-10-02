import { useEffect, useRef } from 'react';
import { App as NativeApp } from '@capacitor/app';
import { toast } from 'sonner';
import { isNativeApp, isStandaloneApp } from '../lib/platform';

const TRAP = 'melyBackTrap';
const EXIT_WINDOW_MS = 2000;

/**
 * Botón/gesto "atrás" del sistema. La navegación de la app es por estado (no hay
 * rutas), así que sin esto "atrás" en Android cerraba la app desde cualquier
 * pantalla, incluso en medio de un chat.
 *
 * `handler` decide a dónde volver y devuelve true. Si devuelve false (ya estás en
 * la pantalla inicial), avisa y deja salir con un segundo "atrás".
 *
 * - App nativa: evento backButton de Capacitor.
 * - PWA instalada: una entrada extra en el historial que se vuelve a armar al consumirla.
 * - Pestaña del navegador: no se toca, "atrás" tiene que seguir saliendo del sitio.
 */
export function useBackHandler(handler: () => boolean) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!isNativeApp()) return;
    let exitArmedUntil = 0;
    const listener = NativeApp.addListener('backButton', () => {
      if (handlerRef.current()) return;
      if (Date.now() < exitArmedUntil) {
        void NativeApp.minimizeApp();
        return;
      }
      exitArmedUntil = Date.now() + EXIT_WINDOW_MS;
      toast('Tocá atrás otra vez para salir', { duration: EXIT_WINDOW_MS });
    });
    return () => {
      void listener.then((l) => l.remove());
    };
  }, []);

  useEffect(() => {
    if (isNativeApp() || !isStandaloneApp()) return;

    const arm = () => {
      if (window.history.state?.[TRAP]) return;
      window.history.pushState({ [TRAP]: true }, '');
    };
    arm();

    let rearmTimer: number | undefined;
    const onPopState = () => {
      if (handlerRef.current()) {
        arm();
        return;
      }
      toast('Tocá atrás otra vez para salir', { duration: EXIT_WINDOW_MS });
      window.clearTimeout(rearmTimer);
      rearmTimer = window.setTimeout(arm, EXIT_WINDOW_MS);
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.clearTimeout(rearmTimer);
    };
  }, []);
}
