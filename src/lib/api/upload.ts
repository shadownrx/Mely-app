import { ApiError, apiRequest } from '../apiClient';
import { prepareImageForUpload, UPLOAD_HARD_LIMIT_BYTES } from '../imagePrep';

const TOO_LARGE = 'El archivo es demasiado pesado. Probá con uno más liviano.';
const NETWORK = 'No pudimos subir el archivo. Revisá tu conexión e intentá de nuevo.';

/**
 * Sube un archivo como multipart pasando por apiRequest, así un access token
 * vencido se refresca y se reintenta igual que en el resto de la API (antes los
 * uploads iban con fetch directo y fallaban con "No autenticado" a los 15 min).
 */
export async function uploadFile<T>(path: string, field: string, file: File): Promise<T> {
  if (file.size > UPLOAD_HARD_LIMIT_BYTES) throw new Error(TOO_LARGE);
  const formData = new FormData();
  formData.append(field, file, file.name);
  try {
    return await apiRequest<T>(path, { method: 'POST', formData });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 413) throw new Error(TOO_LARGE);
      throw err;
    }
    // fetch tira TypeError sin conexión (o si el hosting corta el request sin CORS).
    if (err instanceof TypeError) throw new Error(NETWORK);
    throw err;
  }
}

/** Igual que uploadFile, pero antes achica/recomprime la foto en el dispositivo. */
export async function uploadImage<T>(path: string, file: File): Promise<T> {
  return uploadFile<T>(path, 'photo', await prepareImageForUpload(file));
}
