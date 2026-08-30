import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import { useUpdateLocation } from '../hooks/useProfile';
import { getCurrentCoords } from '../lib/geolocation';

/**
 * Sin esto, el filtro de distancia del backend queda inactivo (si a alguno de los dos
 * perfiles le falta latitud/longitud, la comparación se salta directamente — ver
 * discovery/service.ts matchesFilters) y Descubrir termina mostrando gente de
 * cualquier ciudad del país, no solo la cercana.
 */
export const LocationPrompt: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const updateLocation = useUpdateLocation();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.hasLocation || dismissed) return null;

  const handleActivate = async () => {
    sounds.playClick();
    try {
      const coords = await getCurrentCoords();
      await updateLocation.mutateAsync(coords);
      await refreshUser();
      sounds.playStamp();
      toast.success('Ubicación activada. Ahora vas a ver gente cerca tuyo.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No pudimos activar tu ubicación.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl p-3.5 border border-slate-100 dark:border-white/10 bg-white dark:bg-[#150f11] flex items-center gap-3 mb-1"
      >
        <div className="w-10 h-10 rounded-full bg-[#fff1f3] dark:bg-[#e11d48]/15 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[19px] text-[#e11d48]">location_on</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-[13px] font-bold">Activá tu ubicación</span>
          <span className="block text-[11px] text-slate-500 dark:text-[#a89a9e]">Así te mostramos gente cerca tuyo, no de cualquier ciudad</span>
        </div>
        <button
          type="button"
          onClick={handleActivate}
          disabled={updateLocation.isPending}
          className="shrink-0 h-9 px-3.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white text-[12.5px] font-bold disabled:opacity-60"
        >
          {updateLocation.isPending ? '...' : 'Activar'}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 dark:text-white/30"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
