import { API_BASE_URL } from '../apiClient';

export type AppMeta = {
  name: string;
  slogan: string;
  proposeDateAction: { key: string; label: string };
  realtime: { provider: 'ably' | 'none'; tokenUrl: string };
  uploads: 'cloudinary' | 's3' | 'local';
  mail: 'resend' | 'smtp' | 'console';
};

export async function getMeta(): Promise<AppMeta> {
  const res = await fetch(`${API_BASE_URL}/api/v1/meta`);
  if (!res.ok) throw new Error('No se pudo leer /meta');
  return res.json();
}
