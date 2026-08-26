import React, { lazy, Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_DISCOVERY_FILTERS } from './data/mockData';
import { TabType, DiscoveryFilters, Profile, Match } from './types';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DiscoverView } from './components/DiscoverView';
import type { GooglePrefill } from './components/LoginView';
import { VerifiedSpotsModal } from './components/VerifiedSpotsModal';
import { DiscoveryFiltersModal } from './components/DiscoveryFiltersModal';
import { ProposeDateModal, StampModal, MenuDrawer } from './components/Modals';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { sounds } from './utils/audio';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { useDiscover, useSwipe } from './hooks/useDiscover';
import { useMatches } from './hooks/useMatches';
import { useWallet } from './hooks/useWallet';
import { useAllDateProposals } from './hooks/useDates';
import { useSendMessage } from './hooks/useChat';
import { subscribeUserNotifications } from './lib/realtime';
import { resolveNotificationTarget } from './lib/notificationRouting';
import { useQueryClient } from '@tanstack/react-query';
import type { Stamp } from './types';

// Todo lo que no hace falta en el primer paint (pantallas fuera de Descubrir, y los
// modales que solo se abren con una acción explícita) se carga bajo demanda: reduce
// bastante el bundle inicial, sobre todo DateQRModal (arrastra qr-scanner + qrcode).
const MatchesView = lazy(() => import('./components/MatchesView').then((m) => ({ default: m.MatchesView })));
const MessagesView = lazy(() => import('./components/MessagesView').then((m) => ({ default: m.MessagesView })));
const StoreView = lazy(() => import('./components/StoreView').then((m) => ({ default: m.StoreView })));
const DatesView = lazy(() => import('./components/DatesView').then((m) => ({ default: m.DatesView })));
const ProfileView = lazy(() => import('./components/ProfileView').then((m) => ({ default: m.ProfileView })));
const SettingsView = lazy(() => import('./components/SettingsView').then((m) => ({ default: m.SettingsView })));
const LoginView = lazy(() => import('./components/LoginView').then((m) => ({ default: m.LoginView })));
const RegisterView = lazy(() => import('./components/RegisterView').then((m) => ({ default: m.RegisterView })));
const IcebreakerWheelModal = lazy(() =>
  import('./components/IcebreakerWheelModal').then((m) => ({ default: m.IcebreakerWheelModal })),
);
const DateQRModal = lazy(() => import('./components/DateQRModal').then((m) => ({ default: m.DateQRModal })));

const TabFallback: React.FC = () => (
  <div className="w-full flex-1 flex items-center justify-center py-20">
    <span className="material-symbols-outlined text-[32px] text-[#e11d48] animate-pulse">favorite</span>
  </div>
);

type ProposeModalState = { connectionId: string; partnerName: string } | null;
type DateQRModalState = { connectionId: string; partnerName: string; partnerAvatar: string } | null;
type IcebreakerState = { connectionId: string; partnerName: string } | null;

function AppContent() {
  const { isLight } = useTheme();
  const { status, user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [googlePrefill, setGooglePrefill] = useState<GooglePrefill | null>(null);

  const [currentTab, setCurrentTab] = useState<TabType>('descubrir');
  const [previousTab, setPreviousTab] = useState<TabType>('descubrir');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [proposeModal, setProposeModal] = useState<ProposeModalState>(null);
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [dateQRModal, setDateQRModal] = useState<DateQRModalState>(null);
  const [icebreaker, setIcebreaker] = useState<IcebreakerState>(null);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);

  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilters>(DEFAULT_DISCOVERY_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isVerifiedSpotsOpen, setIsVerifiedSpotsOpen] = useState(false);

  // Seed discovery filters from the user's persisted preferences once loaded.
  useEffect(() => {
    if (!user) return;
    setDiscoveryFilters((prev) => ({
      ...prev,
      minAge: user.minAge,
      maxAge: user.maxAge,
      maxDistanceKm: user.maxDistanceKm,
    }));
  }, [user?.minAge, user?.maxAge, user?.maxDistanceKm]);

  const discoverQuery = useDiscover(discoveryFilters);
  const swipe = useSwipe();
  const matchesQuery = useMatches();
  const walletQuery = useWallet();
  const { items: dateItems } = useAllDateProposals();
  const icebreakerSendMessage = useSendMessage(icebreaker?.connectionId ?? '');

  const matches: Match[] = matchesQuery.data ?? [];
  const walletBalance = walletQuery.data?.balance ?? 0;
  const unreadMessagesCount = matches.reduce((sum, m) => sum + m.unread, 0);
  const pendingDatesCount = dateItems.filter(
    (it) => it.dateMeet.status === 'AGREED' || it.dateMeet.status === 'CHECKED_IN',
  ).length;

  const activeFiltersCount =
    (discoveryFilters.onlyVerifiedMembers ? 1 : 0) +
    (discoveryFilters.withAudioBioOnly ? 1 : 0) +
    (discoveryFilters.selectedInterests.length > 0 ? 1 : 0) +
    (discoveryFilters.minAge > 20 || discoveryFilters.maxAge < 40 ? 1 : 0) +
    (discoveryFilters.maxDistanceKm < 50 ? 1 : 0);

  const handleTabChange = (tab: TabType) => {
    // Si un input queda enfocado cuando su vista se desmonta, el teclado del celular
    // puede quedar "pegado" en pantalla flotando sobre la pestaña nueva.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (currentTab !== 'ajustes') setPreviousTab(currentTab);
    setCurrentTab(tab);
  };

  // A qué pantalla te lleva tocar una notificación (toast, campanita, o push del SO).
  const handleNotificationNavigate = (category?: string, data?: Record<string, unknown>) => {
    const target = resolveNotificationTarget(category, data);
    if (!target) return;
    if (target.connectionId) setActiveConnectionId(target.connectionId);
    handleTabChange(target.tab);
  };

  // Si el push llegó con la app cerrada, el Service Worker abre una URL con estos
  // query params (no tiene acceso al estado de React) — los leemos una sola vez al
  // arrancar y limpiamos la URL para que no se re-dispare en un refresh.
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as TabType | null;
    if (!tab) return;
    const connectionId = params.get('connectionId');
    if (connectionId) setActiveConnectionId(connectionId);
    handleTabChange(tab);
    window.history.replaceState({}, '', window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Si el push llegó con una pestaña ya abierta, el Service Worker la enfoca y le
  // manda un postMessage en vez de navegar por URL (focus() no cambia la URL).
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'notification-navigate') return;
      const target = event.data.target as { tab: TabType; connectionId?: string } | undefined;
      if (!target) return;
      if (target.connectionId) setActiveConnectionId(target.connectionId);
      handleTabChange(target.tab);
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global realtime: refresh matches/dates y avisa con un toast + la campanita cuando
  // llega una notificación (nuevo match, propuesta, check-in, monedas, sello, etc).
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeUserNotifications(user.id, (raw) => {
      const payload = raw as
        | { category?: string; title?: string; body?: string; data?: Record<string, unknown> }
        | null;
      if (payload?.title) {
        const target = resolveNotificationTarget(payload.category, payload.data);
        toast(payload.title, {
          description: payload.body,
          action: target
            ? { label: 'Ver', onClick: () => handleNotificationNavigate(payload.category, payload.data) }
            : undefined,
        });
      }
      if (payload?.category !== 'message') {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dateMeet'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['stamps'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, queryClient]);

  const handleLike = (profile: Profile) => {
    sounds.playStamp();
    swipe.like.mutate(profile.id, {
      onSuccess: (res) => {
        if (res.match) sounds.playHeart();
      },
    });
  };

  const handlePass = (profile: Profile) => {
    swipe.pass.mutate(profile.id);
  };

  const handleSuperLike = (profile: Profile) => {
    sounds.playCoins();
    swipe.superLike.mutate(profile.id, {
      onSuccess: (res) => {
        if (res.match) sounds.playHeart();
      },
    });
  };

  const handleOpenChat = (connectionId: string) => {
    setActiveConnectionId(connectionId);
    handleTabChange('mensajes');
  };

  const handleProposeDate = (match: Match) => {
    setProposeModal({ connectionId: match.id, partnerName: match.other.displayName });
  };

  const handleSignOut = () => {
    logout();
  };

  // --- AUTH SCREENS ---
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-[36px] text-[#e11d48] animate-pulse">favorite</span>
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <div className={`min-h-screen bg-transparent ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'} antialiased flex flex-col items-center justify-center selection:bg-[#e11d48] selection:text-white p-2`}>
        <Suspense fallback={<TabFallback />}>
          {authScreen === 'login' ? (
            <LoginView
              onGoToRegister={() => setAuthScreen('register')}
              onGoogleNeedsProfile={(data) => {
                setGooglePrefill(data);
                setAuthScreen('register');
              }}
            />
          ) : (
            <RegisterView
              onGoToLogin={() => {
                setGooglePrefill(null);
                setAuthScreen('login');
              }}
              googlePrefill={googlePrefill}
            />
          )}
        </Suspense>
      </div>
    );
  }

  // --- MAIN APPLICATION ---
  // Igual que WhatsApp/Telegram: adentro de una conversación puntual, el chrome de
  // navegación de la app (header + tab bar) se saca por completo — el chat ya tiene su
  // propio header con botón de volver, y así aprovecha toda la altura de la pantalla.
  const isChatDetail = currentTab === 'mensajes' && Boolean(activeConnectionId);

  return (
    <div className={`min-h-screen bg-transparent ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'} antialiased flex flex-col items-center justify-start selection:bg-[#e11d48] selection:text-white`}>
      {!isChatDetail && (
        <TopAppBar
          currentTab={currentTab}
          walletBalance={walletBalance}
          onTabChange={handleTabChange}
          onNavigateNotification={handleNotificationNavigate}
          onOpenMenu={() => setIsMenuOpen(true)}
          showBackButton={currentTab === 'ajustes'}
          onBack={() => setCurrentTab(previousTab)}
          customTitle={
            currentTab === 'ajustes' ? 'AJUSTES' : currentTab === 'tienda' ? 'TIENDA' : currentTab === 'mensajes' ? 'MELY CHAT' : 'MELY'
          }
          customSubtitle={
            currentTab === 'ajustes'
              ? 'CONFIGURACIÓN DE PASAPORTE'
              : currentTab === 'tienda'
              ? 'BENEFICIOS & PERKS'
              : currentTab === 'mensajes'
              ? 'CONEXIONES & CITAS'
              : undefined
          }
        />
      )}

      <main
        style={{
          paddingTop: isChatDetail ? 'env(safe-area-inset-top)' : `calc(${currentTab === 'mensajes' ? '4rem' : '5rem'} + env(safe-area-inset-top))`,
          // +0.75rem: el nav ahora flota con margen respecto al borde inferior en vez de
          // quedar pegado (ver BottomNavBar), así el contenido no queda tapado por ese hueco.
          paddingBottom: isChatDetail ? 'env(safe-area-inset-bottom)' : `calc(${currentTab === 'mensajes' ? '4.75rem' : '5.75rem'} + env(safe-area-inset-bottom))`,
        }}
        className={`w-full max-w-[440px] mx-auto ${currentTab === 'mensajes' ? 'px-2 sm:px-3' : 'px-4'} flex-1 flex flex-col min-h-0`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex-1 flex flex-col min-h-0"
          >
            <Suspense fallback={<TabFallback />}>
            {currentTab === 'descubrir' && (
              <DiscoverView
                profiles={discoverQuery.data?.profiles ?? []}
                isLoading={discoverQuery.isLoading || discoverQuery.isFetching}
                onLike={handleLike}
                onPass={handlePass}
                onSuperLike={handleSuperLike}
                onOpenFilters={() => setIsFiltersOpen(true)}
                activeFiltersCount={activeFiltersCount}
                onOpenVerifiedSpots={() => setIsVerifiedSpotsOpen(true)}
                onReload={() => discoverQuery.refetch()}
              />
            )}

            {currentTab === 'matches' && (
              <MatchesView
                matches={matches}
                isLoading={matchesQuery.isLoading}
                onOpenChat={handleOpenChat}
                onProposeDate={handleProposeDate}
                onExploreMore={() => handleTabChange('descubrir')}
              />
            )}

            {currentTab === 'mensajes' && (
              <MessagesView
                activeConnectionId={activeConnectionId}
                onSelectConnection={setActiveConnectionId}
                onOpenProposeModal={(connectionId) => {
                  const match = matches.find((m) => m.id === connectionId);
                  setProposeModal({ connectionId, partnerName: match?.other.displayName ?? '' });
                }}
                onOpenIcebreaker={(partnerName) => {
                  if (!activeConnectionId) return;
                  setIcebreaker({ connectionId: activeConnectionId, partnerName });
                }}
                onOpenDateQR={(connectionId, partnerName, partnerAvatar) => {
                  setDateQRModal({ connectionId, partnerName, partnerAvatar });
                }}
              />
            )}

            {currentTab === 'tienda' && <StoreView />}

            {currentTab === 'citas' && (
              <DatesView
                onOpenChat={handleOpenChat}
                onOpenDateQR={(connectionId, partnerName, partnerAvatar) => {
                  setDateQRModal({ connectionId, partnerName, partnerAvatar });
                }}
              />
            )}

            {currentTab === 'perfil' && (
              <ProfileView
                onSelectStamp={(stamp) => setSelectedStamp(stamp)}
                onOpenFullSettings={() => handleTabChange('ajustes')}
                onOpenStore={() => handleTabChange('tienda')}
                onSignOut={handleSignOut}
              />
            )}

            {currentTab === 'ajustes' && (
              <SettingsView onSignOut={handleSignOut} />
            )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {currentTab !== 'ajustes' && !isChatDetail && (
        <BottomNavBar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          unreadMessagesCount={unreadMessagesCount}
          pendingDatesCount={pendingDatesCount}
          userAvatar={user.photos[0]?.url}
        />
      )}

      {/* Modals */}
      {proposeModal && (
        <ProposeDateModal
          isOpen={Boolean(proposeModal)}
          onClose={() => setProposeModal(null)}
          connectionId={proposeModal.connectionId}
          partnerName={proposeModal.partnerName}
        />
      )}

      <StampModal stamp={selectedStamp} onClose={() => setSelectedStamp(null)} />

      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleTabChange}
        onSignOut={handleSignOut}
        user={user}
      />

      <DiscoveryFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={discoveryFilters}
        onApplyFilters={(newFilters) => {
          setDiscoveryFilters(newFilters);
          setIsFiltersOpen(false);
        }}
      />

      <VerifiedSpotsModal isOpen={isVerifiedSpotsOpen} onClose={() => setIsVerifiedSpotsOpen(false)} />

      {icebreaker && (
        <Suspense fallback={null}>
          <IcebreakerWheelModal
            isOpen={Boolean(icebreaker)}
            onClose={() => setIcebreaker(null)}
            partnerName={icebreaker.partnerName}
            onSendIcebreakerToChat={(qText) => {
              icebreakerSendMessage.mutate({ body: qText });
              setIcebreaker(null);
            }}
          />
        </Suspense>
      )}

      {dateQRModal && (
        <Suspense fallback={null}>
          <DateQRModal
            isOpen={Boolean(dateQRModal)}
            onClose={() => setDateQRModal(null)}
            connectionId={dateQRModal.connectionId}
            partnerName={dateQRModal.partnerName}
            partnerAvatar={dateQRModal.partnerAvatar}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppContent />
        <Toaster />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
