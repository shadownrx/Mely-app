/**
 * Prepara una foto antes de subirla: la achica y la recomprime a JPEG en el
 * dispositivo. El backend corre en Vercel, que corta cualquier request de más
 * de ~4,5 MB con un 413 sin CORS (el browser lo ve como "Failed to fetch"), y
 * una foto de cámara pesa fácil 5–10 MB. Con esto sale de acá en ~300–900 KB.
 */

/** Tope duro: margen bajo el límite de ~4,5 MB de Vercel (multipart incluido). */
export const UPLOAD_HARD_LIMIT_BYTES = 4 * 1024 * 1024;
/** Peso al que apuntamos: de sobra para verse nítida a pantalla completa en el celu. */
export const UPLOAD_TARGET_BYTES = 1.2 * 1024 * 1024;
/** Lado más largo, en px. */
export const UPLOAD_MAX_DIMENSION = 1600;

/** Lo que el backend acepta tal cual (ver ALLOWED_MIME en storage.ts del backend). */
const PASSTHROUGH_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type EncodeStep = { scale: number; quality: number };

/** De mejor a peor calidad: primero se baja calidad, recién después resolución. */
export const ENCODE_STEPS: EncodeStep[] = [
  { scale: 1, quality: 0.86 },
  { scale: 1, quality: 0.76 },
  { scale: 1, quality: 0.66 },
  { scale: 0.75, quality: 0.72 },
  { scale: 0.5, quality: 0.7 },
];

export class ImagePrepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImagePrepError';
  }
}

/** Escala (sin agrandar nunca) para que el lado más largo no pase de `max`. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const ratio = max / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export function jpegFileName(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, '').trim();
  return `${base || 'foto'}.jpg`;
}

/**
 * Prueba los pasos en orden y devuelve el primero que entra en `targetBytes`.
 * Si ninguno entra, se queda con el más liviano mientras no pase de `hardLimitBytes`.
 */
export async function encodeWithinBudget<T extends { size: number }>(
  encode: (step: EncodeStep) => Promise<T>,
  opts: { targetBytes?: number; hardLimitBytes?: number; steps?: EncodeStep[] } = {},
): Promise<T> {
  const target = opts.targetBytes ?? UPLOAD_TARGET_BYTES;
  const hardLimit = opts.hardLimitBytes ?? UPLOAD_HARD_LIMIT_BYTES;
  let lightest: T | null = null;
  for (const step of opts.steps ?? ENCODE_STEPS) {
    const out = await encode(step);
    if (out.size <= target) return out;
    if (!lightest || out.size < lightest.size) lightest = out;
  }
  if (lightest && lightest.size <= hardLimit) return lightest;
  throw new ImagePrepError('La foto es demasiado pesada incluso comprimida. Probá con otra.');
}

type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

const UNREADABLE = 'No pudimos leer esa imagen. Probá con una foto JPG o PNG.';

async function decode(file: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      // from-image: respeta la rotación EXIF (si no, las fotos verticales salen acostadas).
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      /* Safari viejo o formato que solo decodifica <img> (HEIC): cae al fallback */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new ImagePrepError(UNREADABLE));
      img.src = url;
    });
    if (!img.naturalWidth || !img.naturalHeight) throw new ImagePrepError(UNREADABLE);
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

function renderJpeg(decoded: Decoded, step: EncodeStep, maxDimension: number): Promise<Blob> {
  const { width, height } = fitWithin(decoded.width, decoded.height, Math.round(maxDimension * step.scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImagePrepError(UNREADABLE);
  // JPEG no tiene transparencia: sin fondo, los PNG transparentes salen negros.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(decoded.source, 0, 0, width, height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ImagePrepError(UNREADABLE))),
      'image/jpeg',
      step.quality,
    );
  });
}

/**
 * Devuelve un archivo listo para subir: el original si ya es liviano y de un
 * formato que el backend acepta, o una versión JPEG achicada si no.
 */
export async function prepareImageForUpload(
  file: File,
  opts: { maxDimension?: number; targetBytes?: number } = {},
): Promise<File> {
  const targetBytes = opts.targetBytes ?? UPLOAD_TARGET_BYTES;
  if (PASSTHROUGH_TYPES.has(file.type) && file.size <= targetBytes) return file;

  const decoded = await decode(file);
  try {
    const blob = await encodeWithinBudget(
      (step) => renderJpeg(decoded, step, opts.maxDimension ?? UPLOAD_MAX_DIMENSION),
      { targetBytes },
    );
    return new File([blob], jpegFileName(file.name), { type: 'image/jpeg', lastModified: Date.now() });
  } finally {
    decoded.release();
  }
}
