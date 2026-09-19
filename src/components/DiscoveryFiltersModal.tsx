import React, { useEffect, useState } from 'react';
import { DiscoveryFilters } from '../types';
import { DEFAULT_DISCOVERY_FILTERS } from '../data/mockData';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { listInterests } from '../lib/api/profile';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';

interface DiscoveryFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DiscoveryFilters;
  onApplyFilters: (filters: DiscoveryFilters) => void;
}

export const DiscoveryFiltersModal: React.FC<DiscoveryFiltersModalProps> = ({
  isOpen,
  onClose,
  filters: initialFilters,
  onApplyFilters,
}) => {
  const { isLight } = useTheme();
  const [localFilters, setLocalFilters] = useState<DiscoveryFilters>(initialFilters);
  const [interests, setInterests] = useState<{ id: string; slug: string; name: string }[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setLocalFilters(initialFilters);
    listInterests()
      .then(setInterests)
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const toggleInterest = (slug: string) => {
    sounds.playClick();
    setLocalFilters((prev) => {
      const exists = prev.selectedInterests.includes(slug);
      return {
        ...prev,
        selectedInterests: exists
          ? prev.selectedInterests.filter((t) => t !== slug)
          : [...prev.selectedInterests, slug],
      };
    });
  };

  const handleReset = () => {
    sounds.playClick();
    setLocalFilters(DEFAULT_DISCOVERY_FILTERS);
  };

  const handleApply = () => {
    sounds.playCoins();
    onApplyFilters(localFilters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-[420px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader
          className={`p-4 sm:p-5 border-b flex-row justify-between items-center shrink-0 space-y-0 ${
            isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#131f36] border-[#f16b48]/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f16b48] flex items-center justify-center text-white shadow-elevation-md shadow-[#f16b48]/20">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </div>
            <div>
              <span className="font-label-caps text-[9px] uppercase tracking-widest text-[#f16b48] font-bold block">
                RADAR EDITORIAL
              </span>
              <h3 className={`font-headline-md text-[18px] font-bold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                Filtros de Descubrimiento
              </h3>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 no-scrollbar">
          {/* Distance Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Distancia Máxima</Label>
              <span className="font-mono text-[11px] font-bold text-[#f16b48]">
                {localFilters.maxDistanceKm} km
              </span>
            </div>
            <Slider
              min={1}
              max={50}
              step={1}
              value={[localFilters.maxDistanceKm]}
              onValueChange={([v]) => setLocalFilters((prev) => ({ ...prev, maxDistanceKm: v }))}
            />
            <div className={`flex justify-between text-[9px] ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/70'} mt-1.5 font-mono`}>
              <span>1 km (Mismo barrio)</span>
              <span>50 km (Metropolitano)</span>
            </div>
          </div>

          {/* Age Range */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <Label>Rango de Edad</Label>
              <span className="font-mono text-[11px] font-bold text-[#f16b48]">
                {localFilters.minAge} - {localFilters.maxAge} años
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className={`text-[9px] ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/70'} block mb-0.5 font-label-caps`}>Mínimo</span>
                <Input
                  type="number"
                  min={18}
                  max={localFilters.maxAge}
                  value={localFilters.minAge}
                  onChange={(e) => setLocalFilters((prev) => ({ ...prev, minAge: Number(e.target.value) }))}
                  className="text-center font-mono text-[12px] font-bold"
                />
              </div>
              <div>
                <span className={`text-[9px] ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/70'} block mb-0.5 font-label-caps`}>Máximo</span>
                <Input
                  type="number"
                  min={localFilters.minAge}
                  max={65}
                  value={localFilters.maxAge}
                  onChange={(e) => setLocalFilters((prev) => ({ ...prev, maxAge: Number(e.target.value) }))}
                  className="text-center font-mono text-[12px] font-bold"
                />
              </div>
            </div>
          </div>

          {/* Verified Only Toggle */}
          <div
            className={`p-3.5 rounded-[var(--radius-md)] border flex items-center justify-between transition-colors ${
              isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#131f36] border-[#f16b48]/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-[#f16b48]">verified</span>
              <div>
                <span className={`font-label-caps text-[10px] uppercase font-bold block ${isLight ? 'text-[#16223b]' : 'text-white'}`}>
                  Citas Verificadas en Pasaporte
                </span>
                <span className={`text-[10px] ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/70'}`}>
                  Solo miembros con al menos 1 encuentro real comprobado.
                </span>
              </div>
            </div>
            <Switch
              checked={localFilters.onlyVerifiedMembers}
              onCheckedChange={(checked) => {
                sounds.playClick();
                setLocalFilters((prev) => ({ ...prev, onlyVerifiedMembers: checked }));
              }}
            />
          </div>

          {/* Audio Bio Toggle */}
          <div
            className={`p-3.5 rounded-[var(--radius-md)] border flex items-center justify-between transition-colors ${
              isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#131f36] border-[#f16b48]/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-amber-500">mic</span>
              <div>
                <span className={`font-label-caps text-[10px] uppercase font-bold block ${isLight ? 'text-[#16223b]' : 'text-white'}`}>
                  Audio-Bio Activa 🎙️
                </span>
                <span className={`text-[10px] ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/70'}`}>
                  Perfiles que tienen una nota de voz grabada.
                </span>
              </div>
            </div>
            <Switch
              checked={localFilters.withAudioBioOnly}
              onCheckedChange={(checked) => {
                sounds.playClick();
                setLocalFilters((prev) => ({ ...prev, withAudioBioOnly: checked }));
              }}
            />
          </div>

          {/* Interests Pills */}
          <div>
            <Label className="block mb-2">
              Intereses & Pasiones Específicas ({localFilters.selectedInterests.length})
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest) => {
                const isSelected = localFilters.selectedInterests.includes(interest.slug);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.slug)}
                    className={`px-2.5 py-1 rounded-[var(--radius-pill)] text-[11px] font-body-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#f16b48] text-white font-bold shadow-elevation-sm'
                        : isLight
                        ? 'bg-white border border-[#ffe3d3] text-[#2e5570] hover:bg-[#fcf9f2]'
                        : 'bg-[#131f36] border border-[#f16b48]/20 text-[#ffb295]/70 hover:border-[#f16b48]/50'
                    }`}
                  >
                    {interest.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 border-t flex justify-between items-center gap-3 shrink-0 ${
            isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#131f36] border-[#f16b48]/30'
          }`}
        >
          <Button variant="ghost" onClick={handleReset} className="text-[10px] tracking-wider">
            Limpiar Filtros
          </Button>

          <Button variant="cherry" onClick={handleApply} className="px-5 py-2">
            APLICAR AL RADAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
