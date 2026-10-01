import React, { useEffect, useState } from 'react';

interface ProfilePhotoProps {
  url?: string | null;
  name: string;
  /** Clases de la caja (tamaño + redondeo + borde): se aplican tanto a la foto como al fallback. */
  className?: string;
  /** Clases extra solo para el <img> (ej: transiciones de hover). */
  imageClassName?: string;
  /** Tamaño de las iniciales del fallback. */
  fallbackClassName?: string;
  /** La foto principal del modal carga eager; el resto lazy. */
  eager?: boolean;
}

/**
 * Foto de perfil que nunca muestra el icono de imagen rota: sin URL o con error
 * de carga, renderiza iniciales sobre el fondo del sistema. Los perfiles sin
 * foto existen (el paso de foto en el registro es opcional).
 */
export const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  url,
  name,
  className = '',
  imageClassName = '',
  fallbackClassName = 'text-lg',
  eager = false,
}) => {
  const [failed, setFailed] = useState(false);
  // La misma celda se recicla entre perfiles/fotos (lista, galería): reintentar con la nueva URL.
  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url || failed) {
    const initials =
      name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?';
    return (
      <div
        role="img"
        aria-label={`Sin foto: ${name}`}
        className={`flex items-center justify-center bg-[#17233d] text-[#ffa3c4] font-bold select-none ${className}`}
      >
        <span className={fallbackClassName}>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => setFailed(true)}
      className={`object-cover ${imageClassName} ${className}`}
    />
  );
};
