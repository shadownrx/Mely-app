import { describe, expect, it } from 'vitest';
import {
  ENCODE_STEPS,
  ImagePrepError,
  encodeWithinBudget,
  fitWithin,
  jpegFileName,
  prepareImageForUpload,
  type EncodeStep,
} from './imagePrep';

describe('fitWithin', () => {
  it('no agranda imágenes chicas', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it('achica manteniendo proporción, en horizontal y vertical', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it('nunca devuelve un lado en 0', () => {
    expect(fitWithin(10000, 2, 1600)).toEqual({ width: 1600, height: 1 });
  });
});

describe('jpegFileName', () => {
  it('reemplaza la extensión por .jpg', () => {
    expect(jpegFileName('IMG_0012.HEIC')).toBe('IMG_0012.jpg');
    expect(jpegFileName('vacaciones.en.cordoba.png')).toBe('vacaciones.en.cordoba.jpg');
  });

  it('tolera nombres sin extensión o vacíos', () => {
    expect(jpegFileName('captura')).toBe('captura.jpg');
    expect(jpegFileName('.png')).toBe('foto.jpg');
    expect(jpegFileName('')).toBe('foto.jpg');
  });
});

describe('encodeWithinBudget', () => {
  const run = (sizes: number[], opts = { targetBytes: 100, hardLimitBytes: 400 }) => {
    const seen: EncodeStep[] = [];
    const result = encodeWithinBudget(async (step) => {
      seen.push(step);
      return { size: sizes[seen.length - 1] };
    }, opts);
    return { result, seen };
  };

  it('corta en el primer paso que entra en el objetivo', async () => {
    const { result, seen } = run([500, 90, 10, 10, 10]);
    await expect(result).resolves.toEqual({ size: 90 });
    expect(seen).toEqual(ENCODE_STEPS.slice(0, 2));
  });

  it('si ninguno llega al objetivo, usa el más liviano bajo el tope duro', async () => {
    const { result, seen } = run([900, 700, 500, 300, 350]);
    await expect(result).resolves.toEqual({ size: 300 });
    expect(seen).toHaveLength(ENCODE_STEPS.length);
  });

  it('falla si ni el más liviano entra en el tope duro', async () => {
    const { result } = run([900, 800, 700, 600, 500]);
    await expect(result).rejects.toBeInstanceOf(ImagePrepError);
  });
});

describe('prepareImageForUpload', () => {
  it('deja pasar sin tocar una foto liviana de formato aceptado', async () => {
    const file = new File([new Uint8Array(1024)], 'chica.png', { type: 'image/png' });
    await expect(prepareImageForUpload(file)).resolves.toBe(file);
  });
});
