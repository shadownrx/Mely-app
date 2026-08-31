import React, { useState } from 'react';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import {
  useNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '../hooks/useNotifications';
import type { AppNotification } from '../lib/api/notifications';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Dialog, DialogContent } from './ui/dialog';

const CATEGORY_ICONS: Record<string, string> = {
  match: 'favorite',
  date_proposal: 'event',
  date_accepted: 'event_available',
  date_reminder: 'alarm',
  check_in: 'qr_code_2',
  coins: 'monetization_on',
  person_of_the_day: 'star',
  stamps: 'workspace_premium',
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24) return `Hace ${hs} h`;
  const days = Math.floor(hs / 24);
  if (days < 7) return `Hace ${days} d`;
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

interface NotificationBellProps {
  onNavigate: (category?: string, data?: Record<string, unknown>) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const { isLight } = useTheme();
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteOne = useDeleteNotification();
  const deleteAll = useDeleteAllNotifications();
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleItemClick = (n: AppNotification) => {
    if (!n.readAt) markRead.mutate(n.id);
    setOpen(false);
    onNavigate(n.category, n.data);
  };

  return (
    <>
      <Button
        id="top-notifications-btn"
        variant="outline"
        size="icon"
        onClick={() => {
          sounds.playClick();
          setOpen(true);
        }}
        className={`relative h-8 w-8 rounded-2xl active:scale-95 transition-all duration-200 shadow-elevation-sm hover:shadow-elevation-md ${
          isLight
            ? 'bg-white text-[#0f172a] border-[#fecdd3] hover:border-[#e11d48]'
            : 'bg-[#1c0b11] text-[#fda4af] hover:text-[#fb7185] border-[#e11d48]/30'
        }`}
        aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
      >
        <span className="material-symbols-outlined text-[18px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white text-[9px] font-bold flex items-center justify-center shadow-elevation-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col gap-0 p-0">
          <SheetHeader
            // pr-12 en vez de p-4 parejo: el botón "X" para cerrar del Sheet se dibuja
            // absoluto en la esquina (right-4 top-4, ~28px de ancho) — sin este padding
            // extra, "Marcar todo leído" quedaba flush a la derecha y se superponía con la X.
            className={`p-4 pr-12 border-b flex-row items-center justify-between space-y-0 shrink-0 ${
              isLight ? 'border-slate-100' : 'border-white/10'
            }`}
          >
            <SheetTitle>Notificaciones</SheetTitle>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    markAllRead.mutate();
                  }}
                  className="text-[12.5px] font-bold text-[#e11d48] hover:underline cursor-pointer"
                >
                  Marcar todo leído
                </button>
              )}
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setShowDeleteAllConfirm(true);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-1 ${
                    isLight ? 'text-slate-400 hover:text-[#e11d48] hover:bg-slate-50' : 'text-white/40 hover:text-[#fb7185] hover:bg-white/5'
                  }`}
                  aria-label="Eliminar todas las notificaciones"
                  title="Eliminar todas las notificaciones"
                >
                  <span className="material-symbols-outlined text-[17px]">delete</span>
                </button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
                <span className={`material-symbols-outlined text-[36px] ${isLight ? 'text-gray-300' : 'text-white/20'}`}>
                  notifications_none
                </span>
                <p className={`text-[13px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                  Todavía no tenés notificaciones.
                </p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`group relative w-full flex items-start gap-3 p-4 border-b transition-colors ${
                    isLight ? 'border-slate-100 hover:bg-slate-50' : 'border-white/8 hover:bg-white/5'
                  }`}
                >
                  {!n.readAt && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#e11d48]" />}
                  <button type="button" onClick={() => handleItemClick(n)} className="flex-1 min-w-0 flex items-start gap-3 text-left cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-[18px]">
                        {CATEGORY_ICONS[n.category] ?? 'notifications'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[13.5px] font-bold truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                          {n.title}
                        </span>
                        {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] shrink-0" />}
                      </div>
                      <p className={`text-[12.5px] mt-0.5 leading-snug ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                        {n.body}
                      </p>
                      <span className={`text-[11px] mt-1 block ${isLight ? 'text-gray-400' : 'text-white/35'}`}>
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      deleteOne.mutate(n.id);
                    }}
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      isLight ? 'text-slate-300 hover:text-[#e11d48] hover:bg-slate-100' : 'text-white/25 hover:text-[#fb7185] hover:bg-white/10'
                    }`}
                    aria-label="Eliminar notificación"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[360px] p-6 text-center">
          <h3 className="font-headline-md text-[18px] font-bold text-red-500">¿Eliminar todas las notificaciones?</h3>
          <p className={`text-[12px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
            No se puede deshacer.
          </p>
          <div className="flex gap-2.5">
            <Button type="button" variant="secondary" onClick={() => setShowDeleteAllConfirm(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                deleteAll.mutate();
                setShowDeleteAllConfirm(false);
              }}
              disabled={deleteAll.isPending}
              className="flex-1"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
