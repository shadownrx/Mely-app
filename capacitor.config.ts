import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.mely.pasaporte',
  appName: 'MELY',
  webDir: 'dist',
  // Mismo fondo que la app: sin esto el WebView destella blanco al abrir.
  backgroundColor: '#0A1120',
};

export default config;
