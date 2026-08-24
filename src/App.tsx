import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_DISCOVERY_FILTERS } from './data/mockData';
import { TabType, DiscoveryFilters, Profile, Match } from './types';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { ProfileView } from './components/ProfileView';
import { MessagesView } from './components/MessagesView';
import { DiscoverView } from './components/DiscoverView';
import { MatchesView } from './components/MatchesView';
import { DatesView } from './components/DatesView';
import { StoreView } from './components/StoreView';
import { LoginView, type GooglePrefill } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { SettingsView } from './components/SettingsView';
import { VerifiedSpotsModal } from './components/VerifiedSpotsModal';
import { DateQRModal } from './components/DateQRModal';
import { DiscoveryFiltersModal } from './components/DiscoveryFiltersModal';
import { IcebreakerWheelModal } from './components/IcebreakerWheelModal';
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
import { useQueryClient } from '@tanstack/react-query';
import type { Stamp } from './types';

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

  // Global realtime: refresh matches/dates y avisa con un toast + la campanita cuando
  // llega una notificación (nuevo match, propuesta, check-in, monedas, sello, etc).
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeUserNotifications(user.id, (raw) => {
      const payload = raw as { category?: string; title?: string; body?: string } | null;
      if (payload?.title) {
        toast(payload.title, { description: payload.body });
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
  }, [user?.id, queryClient]);

  const handleTabChange = (tab: TabType) => {
    // Si un input queda enfocado cuando su vista se desmonta, el teclado del celular
    // puede quedar "pegado" en pantalla flotando sobre la pestaña nueva.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (currentTab !== 'ajustes') setPreviousTab(currentTab);
    setCurrentTab(tab);
  };

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
      </div>
    );
  }

  // --- MAIN APPLICATION ---
  return (
    <div className={`min-h-screen bg-transparent ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'} antialiased flex flex-col items-center justify-start selection:bg-[#e11d48] selection:text-white`}>
      <TopAppBar
        currentTab={currentTab}
        walletBalance={walletBalance}
        onTabChange={handleTabChange}
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

      <main
        style={{
          paddingTop: `calc(${currentTab === 'mensajes' ? '4rem' : '5rem'} + env(safe-area-inset-top))`,
          paddingBottom: `calc(${currentTab === 'mensajes' ? '4rem' : '5rem'} + env(safe-area-inset-bottom))`,
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
          </motion.div>
        </AnimatePresence>
      </main>

      {currentTab !== 'ajustes' && (
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
        <IcebreakerWheelModal
          isOpen={Boolean(icebreaker)}
          onClose={() => setIcebreaker(null)}
          partnerName={icebreaker.partnerName}
          onSendIcebreakerToChat={(qText) => {
            icebreakerSendMessage.mutate(qText);
            setIcebreaker(null);
          }}
        />
      )}

      {dateQRModal && (
        <DateQRModal
          isOpen={Boolean(dateQRModal)}
          onClose={() => setDateQRModal(null)}
          connectionId={dateQRModal.connectionId}
          partnerName={dateQRModal.partnerName}
          partnerAvatar={dateQRModal.partnerAvatar}
        />
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
