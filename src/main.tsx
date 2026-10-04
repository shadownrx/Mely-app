import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {QueryClientProvider} from '@tanstack/react-query';
import {registerSW} from 'virtual:pwa-register';
import {queryClient} from './lib/queryClient';
import {AuthProvider} from './context/AuthContext';
import {isNativeApp} from './lib/platform';
import App from './App.tsx';
import './index.css';

// En el APK los archivos ya vienen dentro de la app: un service worker ahí solo
// puede servir una versión vieja cacheada después de actualizar desde la tienda.
if (isNativeApp()) {
  navigator.serviceWorker?.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => undefined);
} else {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
