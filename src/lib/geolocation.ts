export type Coords = { latitude: number; longitude: number };

/** Mismo patrón que ya usa DateQRModal para el check-in de citas, pero compartido
 *  para no duplicarlo en cada lugar que necesita pedir la ubicación real del usuario. */
export function getCurrentCoords(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tu navegador no soporta geolocalización.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('Activá el permiso de ubicación en tu navegador para ver gente cerca tuyo.'));
        } else if (err.code === err.TIMEOUT) {
          reject(new Error('No pudimos obtener tu ubicación a tiempo. Probá de nuevo.'));
        } else {
          reject(new Error('No pudimos obtener tu ubicación. Probá de nuevo.'));
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
