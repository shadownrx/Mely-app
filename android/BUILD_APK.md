# Generar el APK de MELY

Este proyecto Android ya está armado con [Capacitor](https://capacitorjs.com/) —
envuelve el build web (`dist/`) en un WebView nativo. No se pudo compilar el
`.apk` desde el entorno de Claude porque no tiene instalado el Android SDK ni
acceso de red a los repositorios de Google (`dl.google.com`), que Gradle
necesita para bajar el Android Gradle Plugin y las plataformas. Compilar acá
sí es posible, con Android Studio o el SDK de línea de comandos.

## Prerrequisitos

- [Android Studio](https://developer.android.com/studio) (más fácil), o el
  Android SDK command-line tools + JDK 17+.
- Node/Bun instalados (ya los usás para el resto del proyecto).

## Pasos

1. Instalar dependencias y generar el build web + sincronizar con Android:

   ```bash
   bun install
   bun run android:sync   # = vite build && cap sync android
   ```

2. Abrir el proyecto en Android Studio:

   ```bash
   bun run android:open
   # o directamente: abrir la carpeta android/ desde Android Studio
   ```

3. Desde Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
   El SDK/Gradle se resuelven solos la primera vez (Android Studio te pide
   instalar lo que falte). El `.apk` de debug queda en
   `android/app/build/outputs/apk/debug/app-debug.apk`.

   Alternativa por línea de comandos (con el SDK ya instalado y
   `ANDROID_HOME` seteado):

   ```bash
   cd android
   ./gradlew assembleDebug
   ```

## Cada vez que cambiés el frontend

Repetí el paso 1 (`bun run android:sync`) antes de recompilar — Capacitor no
mira `src/` directamente, solo copia lo que hay en `dist/`.

## Ícono y nombre

- Nombre / App ID: `app.mely.pasaporte` (`capacitor.config.ts`,
  `android/app/src/main/res/values/strings.xml`).
- Ícono: generado a partir del mismo sello de corazón que usa el login
  (gradiente `#e11d48`→`#ff4d67`), en `android/app/src/main/res/mipmap-*/`.
  Para cambiarlo, reemplazá esos PNG (o el color de fondo en
  `values/ic_launcher_background.xml`) y volvé a sincronizar.

## Firma para distribuir (Play Store / fuera del debug)

El `assembleDebug` de arriba genera un APK firmado con la clave de debug —
sirve para instalar y probar, no para publicar. Para un release firmado,
seguí la guía oficial de Capacitor:
https://capacitorjs.com/docs/android/deploying-to-google-play

## App instalable sin compilar nada (mientras tanto)

`mely-app` ya es una PWA instalable: abrí el sitio desde Chrome en Android y
usá "Agregar a pantalla de inicio" — da un ícono y una ventana standalone
igual que una app nativa, sin necesitar el SDK de Android.
