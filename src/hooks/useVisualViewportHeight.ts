import { useEffect } from 'react';

/**
 * Fija `--vvh` (visual viewport height) en `:root` mientras está activo.
 *
 * Por qué existe: en iOS el teclado virtual NO achica el layout viewport,
 * así que `100dvh` sigue midiendo la pantalla completa y el composer del
 * chat queda tapado por el teclado. `window.visualViewport.height` sí se
 * achica, y en Android con `resize` también acompaña. Los contenedores que
 * deben seguir al teclado usan `calc(var(--vvh, 100dvh) - ...)` con fallback
 * al comportamiento anterior donde no hay soporte.
 *
 * Solo frontend, sin backend: puro layout.
 */
export function useVisualViewportHeight(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty('--vvh', `${Math.round(vv.height)}px`);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      root.style.removeProperty('--vvh');
    };
  }, [enabled]);
}
