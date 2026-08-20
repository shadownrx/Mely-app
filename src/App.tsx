import React, { useState } from 'react';
import {
  CURRENT_USER,
  INITIAL_STAMPS,
  INITIAL_TRANSACTIONS,
  INITIAL_CHATS,
  PROFILES_DISCOVER,
  DEFAULT_USER_SETTINGS,
} from './data/mockData';
import { TabType, Profile, Stamp, Transaction, ChatThread, DateProposal, UserSettings, AuthScreenType, StoreItem, Message } from './types';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { ProfileView } from './components/ProfileView';
import { MessagesView } from './components/MessagesView';
import { DiscoverView } from './components/DiscoverView';
import { MatchesView } from './components/MatchesView';
import { DatesView } from './components/DatesView';
import { StoreView } from './components/StoreView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { SettingsView } from './components/SettingsView';
import {
  ProposeDateModal,
  StampModal,
  RechargeModal,
  SettingsModal,
  MenuDrawer,
} from './components/Modals';
import { sounds } from './utils/audio';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  const { isLight } = useTheme();
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authScreen, setAuthScreen] = useState<AuthScreenType>('login');

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('perfil'); // Start on Perfil/Passport as in keepsake design
  const [previousTab, setPreviousTab] = useState<TabType>('perfil');

  // User & Settings State
  const [user, setUser] = useState<Profile>(CURRENT_USER);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [walletBalance, setWalletBalance] = useState<number>(4250);
  const [stamps, setStamps] = useState<Stamp[]>(INITIAL_STAMPS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_CHATS);
  const [activeThreadId, setActiveThreadId] = useState<string>('chat-alexa');
  const [profiles, setProfiles] = useState<Profile[]>(PROFILES_DISCOVER);
  const [matches, setMatches] = useState<Profile[]>([
    PROFILES_DISCOVER[0],
    PROFILES_DISCOVER[1],
    PROFILES_DISCOVER[2],
  ]);

  // Modals state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState<boolean>(false);
  const [proposePartnerName, setProposePartnerName] = useState<string>('Alexa');
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [rechargePack, setRechargePack] = useState<{ pts: number; price: string; name: string } | null>(null);
  const [settingsType, setSettingsType] = useState<'personal' | 'security' | 'preferences' | null>(null);

  // Calculated unread & pending badges
  const unreadMessagesCount = threads.filter((t) => t.unread).length;
  const allProposals = threads
    .filter((t) => t.activeDate)
    .map((t) => ({
      proposal: t.activeDate!,
      partnerName: t.partnerName,
      partnerAvatar: t.partnerAvatar,
      threadId: t.id,
    }));
  const pendingDatesCount = allProposals.filter((d) => d.proposal.status === 'proposed' || d.proposal.status === 'accepted').length;

  // Handlers
  const handleTabChange = (tab: TabType) => {
    if (currentTab !== 'ajustes') {
      setPreviousTab(currentTab);
    }
    setCurrentTab(tab);
  };

  const handleLike = (profile: Profile) => {
    if (!matches.some((m) => m.id === profile.id)) {
      setMatches((prev) => [profile, ...prev]);
    }
  };

  const handlePass = (_profile: Profile) => {
    // Handled in discover
  };

  const handleSuperLike = (profile: Profile) => {
    handleLike(profile);
  };

  const handleProposeDateDirect = (profile: Profile) => {
    let thread = threads.find((t) => t.partnerId === profile.id);
    if (!thread) {
      const newThread: ChatThread = {
        id: `chat-${profile.id}`,
        partnerId: profile.id,
        partnerName: profile.name.toUpperCase(),
        partnerAvatar: profile.avatar,
        partnerOnline: true,
        lastMessage: 'Nueva conexión',
        lastMessageTime: 'Ahora',
        unread: false,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'partner',
            text: `¡Hola ${user.name.split(' ')[0]}! Me encantó tu pasaporte de conexiones. ¿Qué tipo de café te gusta?`,
            timestamp: 'Ahora',
          },
        ],
      };
      setThreads((prev) => [newThread, ...prev]);
      thread = newThread;
    }
    setActiveThreadId(thread.id);
    setProposePartnerName(profile.name);
    setIsProposeModalOpen(true);
    setCurrentTab('mensajes');
  };

  const handleOpenChat = (partnerIdOrThreadId: string) => {
    const thread =
      threads.find((t) => t.id === partnerIdOrThreadId) ||
      threads.find((t) => t.partnerId === partnerIdOrThreadId);
    if (thread) {
      setActiveThreadId(thread.id);
      setThreads((prev) =>
        prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t))
      );
    }
    setCurrentTab('mensajes');
  };

  const handleSendMessage = (threadId: string, messageData: string | Partial<Message>) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    
    let userMsg: Message;
    let previewText: string;

    if (typeof messageData === 'string') {
      previewText = messageData;
      userMsg = {
        id: `msg-u-${Date.now()}`,
        sender: 'user' as const,
        text: messageData,
        timestamp: timeStr,
        status: 'read' as const,
      };
    } else {
      previewText = messageData.type === 'sticker'
        ? (messageData.stickerAlt || '👾 Sticker')
        : messageData.text || (messageData.type === 'voice' ? '🎤 Nota de voz' : '📷 Foto');
      userMsg = {
        id: `msg-u-${Date.now()}`,
        sender: 'user' as const,
        timestamp: timeStr,
        status: 'read' as const,
        ...messageData,
      };
    }

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            lastMessage: previewText,
            lastMessageTime: timeStr,
            messages: [...t.messages, userMsg],
          };
        }
        return t;
      })
    );

    // Auto partner reply for interactive delight
    setTimeout(() => {
      let replyText = '¡Me parece una idea maravillosa! Me fascina ese lugar.';
      let replySticker: string | undefined = undefined;

      if (typeof messageData !== 'string' && messageData.type === 'sticker') {
        const partnerStickerResponses = [
          'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=300&q=80',
          'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=300&q=80',
        ];
        const randomSticker = partnerStickerResponses[Math.floor(Math.random() * partnerStickerResponses.length)];
        replySticker = randomSticker;
        replyText = '😻 ¡Qué buen sticker! Me encantó.';
      } else {
        const partnerReplies = [
          '¡Me parece una idea maravillosa! Me fascina ese plan.',
          'Totalmente de acuerdo. La luz a esa hora es perfecta para una buena charla.',
          '¡De una! Llevaré mi libreta y cámara también.',
          'Excelente selección. Tienen un café filtrado memorable.',
          '¡Jajaja me hiciste reír! Sos genial.',
        ];
        replyText = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];
      }

      const partnerMsg: Message = {
        id: `msg-p-${Date.now()}`,
        sender: 'partner' as const,
        text: replyText,
        timestamp: timeStr,
        type: replySticker ? 'sticker' : 'text',
        stickerUrl: replySticker,
        stickerAlt: '😻 Gatito feliz',
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === threadId) {
            return {
              ...t,
              lastMessage: replyText,
              lastMessageTime: timeStr,
              messages: [...t.messages, partnerMsg],
            };
          }
          return t;
        })
      );
    }, 1200);
  };

  const handleAcceptDate = (threadId: string, dateId: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId && t.activeDate?.id === dateId) {
          const updatedDate: DateProposal = { ...t.activeDate, status: 'accepted' };
          return {
            ...t,
            activeDate: updatedDate,
            messages: t.messages.map((m) =>
              m.dateProposal?.id === dateId ? { ...m, dateProposal: updatedDate } : m
            ),
          };
        }
        return t;
      })
    );
  };

  const handleVerifyDate = (threadId: string, dateId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread || !thread.activeDate) return;

    const updatedDate: DateProposal = {
      ...thread.activeDate,
      status: 'verified',
      verifiedAt: 'Hoy',
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            activeDate: updatedDate,
            messages: t.messages.map((m) =>
              m.dateProposal?.id === dateId ? { ...m, dateProposal: updatedDate } : m
            ),
          };
        }
        return t;
      })
    );

    // Reward with +250 PTS in Wallet & Transaction Receipt
    setWalletBalance((prev) => prev + 250);
    const now = new Date();
    const dateStr = `${now.getDate()} ${['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][now.getMonth()]} ${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newTx: Transaction = {
      id: `tx-reward-${Date.now()}`,
      description: `Bono Encuentro Verificado (${thread.partnerName})`,
      date: dateStr,
      amount: 250,
      type: 'reward',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Unlock next stamp in Pasaporte de Conexiones
    setStamps((prev) => {
      let foundFirstLocked = false;
      return prev.map((s) => {
        if (!s.unlocked && !foundFirstLocked) {
          foundFirstLocked = true;
          return {
            ...s,
            unlocked: true,
            date: 'Hoy',
            partnerName: thread.partnerName,
            location: thread.activeDate?.venue || 'The Roastery',
            notes: `Encuentro presencial verificado con ${thread.partnerName}.`,
          };
        }
        return s;
      });
    });
  };

  const handleBuyPack = (pts: number, price: string, name: string) => {
    setRechargePack({ pts, price, name });
  };

  const handleBuyStoreItem = (item: StoreItem, paymentMethod: 'coins' | 'money') => {
    const now = new Date();
    const dateStr = `${now.getDate()} ${['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][now.getMonth()]} ${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (item.category === 'coins') {
      // User is purchasing a coin pack
      const pts = item.id.includes('300') ? 300 : item.id.includes('800') ? 800 : item.id.includes('2000') ? 2000 : 4500;
      setWalletBalance((prev) => prev + pts);
      const newTx: Transaction = {
        id: `tx-store-${Date.now()}`,
        description: `Compra Tienda: ${item.name}`,
        date: dateStr,
        amount: pts,
        type: 'recharge',
      };
      setTransactions((prev) => [newTx, ...prev]);
    } else {
      // User is purchasing boost / membership / experience
      if (paymentMethod === 'coins' && item.priceCoins) {
        setWalletBalance((prev) => Math.max(0, prev - item.priceCoins!));
        const newTx: Transaction = {
          id: `tx-store-${Date.now()}`,
          description: `Canje Tienda: ${item.name}`,
          date: dateStr,
          amount: -item.priceCoins,
          type: 'spend',
        };
        setTransactions((prev) => [newTx, ...prev]);
      } else {
        const newTx: Transaction = {
          id: `tx-store-${Date.now()}`,
          description: `Compra Digital (${item.priceMoney || 'Tarjeta'}): ${item.name}`,
          date: dateStr,
          amount: item.priceCoins || 0,
          type: 'recharge',
        };
        setTransactions((prev) => [newTx, ...prev]);
      }

      // If purchased VIP membership, upgrade user profile badge
      if (item.category === 'vip') {
        setUser((prev) => ({
          ...prev,
          membership: item.id.includes('founder') ? 'Black Cherry Founder' : 'Rose VIP',
        }));
      }
    }
  };

  const handleConfirmRecharge = () => {
    if (!rechargePack) return;
    sounds.playCoins();
    setWalletBalance((prev) => prev + rechargePack.pts);

    const now = new Date();
    const dateStr = `${now.getDate()} ${['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][now.getMonth()]} ${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newTx: Transaction = {
      id: `tx-recharge-${Date.now()}`,
      description: `Recarga (${rechargePack.name})`,
      date: dateStr,
      amount: rechargePack.pts,
      type: 'recharge',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleProposeDateSubmit = (title: string, venue: string, time: string, notes: string) => {
    const dateId = `date-custom-${Date.now()}`;
    const token = `AX-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    
    const newProposal: DateProposal = {
      id: dateId,
      title,
      venue,
      time,
      status: 'proposed',
      token,
      icon: 'local_cafe',
      notes,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            activeDate: newProposal,
            lastMessage: `🎟️ Ticket de Cita: ${title}`,
            lastMessageTime: timeStr,
            messages: [
              ...t.messages,
              {
                id: `msg-date-${Date.now()}`,
                sender: 'user',
                text: `🎟️ Invitación Ticket: ${title}`,
                timestamp: timeStr,
                dateProposal: newProposal,
              },
            ],
          };
        }
        return t;
      })
    );
  };

  // Login handler
  const handleLoginSuccess = (loggedInUser: Profile, walletAmount?: number) => {
    setUser(loggedInUser);
    if (walletAmount !== undefined) {
      setWalletBalance(walletAmount);
    }
    setIsAuthenticated(true);
    setCurrentTab('perfil');
  };

  // Register handler
  const handleRegisterSuccess = (newUser: Profile, welcomePts: number) => {
    setUser(newUser);
    setWalletBalance((prev) => prev + welcomePts);
    const now = new Date();
    const dateStr = `${now.getDate()} ${['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][now.getMonth()]} ${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const welcomeTx: Transaction = {
      id: `tx-welcome-${Date.now()}`,
      description: 'Bono Bienvenida Pasaporte MELY',
      date: dateStr,
      amount: welcomePts,
      type: 'reward',
    };
    setTransactions((prev) => [welcomeTx, ...prev]);
    setIsAuthenticated(true);
    setCurrentTab('perfil');
  };

  // Sign out handler
  const handleSignOut = () => {
    setIsAuthenticated(false);
    setAuthScreen('login');
  };

  // Coupon redemption handler in Settings
  const handleRedeemCoupon = (code: string): boolean => {
    if (code === 'MELY2026' || code === 'PASAPORTE1000' || code === 'WELCOME') {
      const bonus = 1000;
      setWalletBalance((prev) => prev + bonus);
      const now = new Date();
      const dateStr = `${now.getDate()} ${['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][now.getMonth()]} ${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      const couponTx: Transaction = {
        id: `tx-coupon-${Date.now()}`,
        description: `Canje Cupón Promocional (${code})`,
        date: dateStr,
        amount: bonus,
        type: 'reward',
      };
      setTransactions((prev) => [couponTx, ...prev]);
      return true;
    }
    return false;
  };

  const handleResetDemo = () => {
    setUser(CURRENT_USER);
    setUserSettings(DEFAULT_USER_SETTINGS);
    setStamps(INITIAL_STAMPS);
    setTransactions(INITIAL_TRANSACTIONS);
    setWalletBalance(4250);
    setThreads(INITIAL_CHATS);
    setProfiles(PROFILES_DISCOVER);
    setMatches([PROFILES_DISCOVER[0], PROFILES_DISCOVER[1], PROFILES_DISCOVER[2]]);
  };

  // --- RENDER AUTH SCREENS IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-transparent ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'} antialiased flex flex-col items-center justify-center selection:bg-[#e11d48] selection:text-white p-2`}>
        {authScreen === 'login' ? (
          <LoginView
            onLogin={handleLoginSuccess}
            onGoToRegister={() => setAuthScreen('register')}
          />
        ) : (
          <RegisterView
            onRegister={handleRegisterSuccess}
            onGoToLogin={() => setAuthScreen('login')}
          />
        )}
      </div>
    );
  }

  // --- RENDER MAIN APPLICATION ---
  return (
    <div className={`min-h-screen bg-transparent ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'} antialiased flex flex-col items-center justify-start selection:bg-[#e11d48] selection:text-white`}>
      {/* Top App Bar */}
      <TopAppBar
        currentTab={currentTab}
        walletBalance={walletBalance}
        onTabChange={handleTabChange}
        onOpenMenu={() => setIsMenuOpen(true)}
        showBackButton={currentTab === 'ajustes'}
        onBack={() => setCurrentTab(previousTab)}
        customTitle={
          currentTab === 'ajustes'
            ? 'AJUSTES'
            : currentTab === 'tienda'
            ? 'TIENDA'
            : currentTab === 'mensajes'
            ? 'MELY CHAT'
            : 'MELY'
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

      {/* Main Container constrained to Mobile 440px hand-held viewport */}
      <main className={`w-full max-w-[440px] mx-auto ${currentTab === 'mensajes' ? 'pt-16 pb-16 px-2 sm:px-3' : 'pt-20 pb-20 px-4'} flex-1 flex flex-col min-h-0`}>
        {currentTab === 'descubrir' && (
          <DiscoverView
            profiles={profiles}
            onLike={handleLike}
            onPass={handlePass}
            onSuperLike={handleSuperLike}
            onProposeDateDirect={handleProposeDateDirect}
          />
        )}

        {currentTab === 'matches' && (
          <MatchesView
            matches={matches}
            onOpenChat={handleOpenChat}
            onProposeDate={handleProposeDateDirect}
            onExploreMore={() => handleTabChange('descubrir')}
          />
        )}

        {currentTab === 'mensajes' && (
          <MessagesView
            threads={threads}
            matches={matches}
            activeThreadId={activeThreadId}
            onSelectThread={setActiveThreadId}
            onSendMessage={handleSendMessage}
            onAcceptDate={handleAcceptDate}
            onVerifyDate={handleVerifyDate}
            onOpenProposeModal={(threadId) => {
              const t = threads.find((th) => th.id === threadId);
              setProposePartnerName(t?.partnerName || 'Valentina');
              setIsProposeModalOpen(true);
            }}
          />
        )}

        {currentTab === 'tienda' && (
          <StoreView
            walletBalance={walletBalance}
            user={user}
            onBuyItem={handleBuyStoreItem}
            onQuickRecharge={handleBuyPack}
          />
        )}

        {currentTab === 'citas' && (
          <DatesView
            dates={allProposals}
            onOpenChat={handleOpenChat}
            onVerifyDate={handleVerifyDate}
          />
        )}

        {currentTab === 'perfil' && (
          <ProfileView
            user={user}
            stamps={stamps}
            transactions={transactions}
            walletBalance={walletBalance}
            onBuyPack={handleBuyPack}
            onSelectStamp={(stamp) => setSelectedStamp(stamp)}
            onOpenSettings={(type) => setSettingsType(type)}
            onOpenFullSettings={() => handleTabChange('ajustes')}
            onOpenStore={() => handleTabChange('tienda')}
            onToggleDiscovery={(val) => setUserSettings((s) => ({ ...s, discoveryEnabled: val }))}
            discoveryEnabled={userSettings.discoveryEnabled}
            onSignOut={handleSignOut}
          />
        )}

        {currentTab === 'ajustes' && (
          <SettingsView
            user={user}
            settings={userSettings}
            walletBalance={walletBalance}
            onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            onUpdateSettings={(updated) => setUserSettings((prev) => ({ ...prev, ...updated }))}
            onRedeemCoupon={handleRedeemCoupon}
            onSignOut={handleSignOut}
            onResetDemo={handleResetDemo}
            onClose={() => setCurrentTab(previousTab)}
          />
        )}
      </main>

      {/* Bottom Nav Bar */}
      {currentTab !== 'ajustes' && (
        <BottomNavBar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          unreadMessagesCount={unreadMessagesCount}
          pendingDatesCount={pendingDatesCount}
          userAvatar={user.avatar}
        />
      )}

      {/* Modals */}
      <ProposeDateModal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        partnerName={proposePartnerName}
        onSubmit={handleProposeDateSubmit}
      />

      <StampModal
        stamp={selectedStamp}
        onClose={() => setSelectedStamp(null)}
      />

      <RechargeModal
        pack={rechargePack}
        onClose={() => setRechargePack(null)}
        onConfirm={handleConfirmRecharge}
      />

      <SettingsModal
        type={settingsType}
        onClose={() => setSettingsType(null)}
        user={user}
        onUpdateName={(name, bio) => setUser((prev) => ({ ...prev, name, bio }))}
      />

      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleTabChange}
        onOpenAuth={(screen) => {
          setIsAuthenticated(false);
          setAuthScreen(screen);
        }}
        onSignOut={handleSignOut}
        onResetDemo={handleResetDemo}
        isAuthenticated={isAuthenticated}
        user={user}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

