import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConnectionStatus, Match, Message } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMarkRead, useMessages, useSendMessage, useSendPhoto, useTypingIndicator, useTypingPing } from '../hooks/useChat';
import { useAcceptProposal, useCounterProposal, useProposals } from '../hooks/useDates';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';

interface MessagesViewProps {
  matches: Match[];
  isLoadingMatches?: boolean;
  activeConnectionId: string | null;
  onSelectConnection: (connectionId: string | null) => void;
  onOpenProposeModal?: (connectionId: string) => void;
  onOpenIcebreaker?: (partnerName: string) => void;
  onOpenDateQR?: (connectionId: string, partnerName: string, partnerAvatar: string) => void;
}

interface WhatsAppSticker {
  id: string;
  packId: string;
  title: string;
  emoji: string;
  badgeText?: string;
  category: string;
}

interface ChatThemePreset {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  userBubbleLight: string;
  userBubbleDark: string;
  wallpaperPattern: 'dots' | 'grid' | 'stars' | 'clean' | 'warm';
  previewBadge: string;
}

const CHAT_THEME_PRESETS: ChatThemePreset[] = [
  {
    id: 'mely-cherry',
    name: 'MELY Carmesí & Cereza',
    description: 'El estilo original y apasionado de MELY',
    accentColor: '#f16b48',
    userBubbleLight: 'bg-gradient-to-r from-[#f16b48] to-[#ff8a65] text-white border border-[#ffb295]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#d4552f] to-[#f16b48] text-white border border-[#f16b48]/40',
    wallpaperPattern: 'dots',
    previewBadge: '🌹 Cereza',
  },
  {
    id: 'lavender-cyber',
    name: 'Lavanda & Cyber Romance',
    description: 'Tonos violetas, misterio y poesía contemporánea',
    accentColor: '#b98fd1',
    userBubbleLight: 'bg-gradient-to-r from-[#b98fd1] to-[#b98fd1] text-white border border-[#f1e4f7]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#5b3b75] to-[#b98fd1] text-white border border-[#b98fd1]/40',
    wallpaperPattern: 'stars',
    previewBadge: '🔮 Lavanda',
  },
  {
    id: 'emerald-san-telmo',
    name: 'Esmeralda & San Telmo',
    description: 'Frescura botánica y elegancia porteña',
    accentColor: '#3f7a5c',
    userBubbleLight: 'bg-gradient-to-r from-[#3f7a5c] to-[#3f7a5c] text-white border border-[#dcf0e4]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#3f7a5c] to-[#3f7a5c] text-white border border-[#3f7a5c]/40',
    wallpaperPattern: 'grid',
    previewBadge: '🌿 Esmeralda',
  },
  {
    id: 'amber-espresso',
    name: 'Café de Especialidad & Caramelo',
    description: 'Cálido, tostado y perfecto para planear una cita',
    accentColor: '#e3b873',
    userBubbleLight: 'bg-gradient-to-r from-[#8a5a28] to-[#e3b873] text-white border border-[#f3e4be]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#8a5a28] to-[#8a5a28] text-white border border-[#e3b873]/40',
    wallpaperPattern: 'warm',
    previewBadge: '☕ Caramelo',
  },
  {
    id: 'midnight-sapphire',
    name: 'Zafiro & Noche de Jazz',
    description: 'Azul profundo, introspección y serenidad',
    accentColor: '#2e5570',
    userBubbleLight: 'bg-gradient-to-r from-[#2e5570] to-[#6fa8c9] text-white border border-[#d8ecf5]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#2e5570] to-[#2e5570] text-white border border-[#2e5570]/40',
    wallpaperPattern: 'stars',
    previewBadge: '🌌 Zafiro',
  },
  {
    id: 'minimal-clean',
    name: 'Minimalista & Blanco Puro',
    description: 'Limpio, sobrio y con máxima legibilidad',
    accentColor: '#2e5570',
    userBubbleLight: 'bg-slate-800 text-white',
    userBubbleDark: 'bg-slate-200 text-slate-900',
    wallpaperPattern: 'clean',
    previewBadge: '◻️ Minimal',
  },
];

const STICKER_PACKS: { id: string; name: string; icon: string; stickers: WhatsAppSticker[] }[] = [
  {
    id: 'pack-romance',
    name: 'MELY Romance & Café',
    icon: '☕',
    stickers: [
      { id: 'stk-coffee', packId: 'pack-romance', title: '¿Pinta café?', emoji: '☕', badgeText: 'CAFÉ ☕', category: 'romance' },
      { id: 'stk-wine', packId: 'pack-romance', title: 'Brindis Malbec', emoji: '🍷', badgeText: 'VINITO 🍷', category: 'romance' },
      { id: 'stk-spark', packId: 'pack-romance', title: 'Sparks mutuos', emoji: '✨', badgeText: 'SPARK ✨', category: 'romance' },
      { id: 'stk-heart', packId: 'pack-romance', title: 'Flechazo', emoji: '💖', badgeText: 'LOVE 💖', category: 'romance' },
      { id: 'stk-fire', packId: 'pack-romance', title: 'Fuego puro', emoji: '🔥', badgeText: 'FUEGO 🔥', category: 'romance' },
      { id: 'stk-mate', packId: 'pack-romance', title: 'Unos mates', emoji: '🧉', badgeText: 'MATES 🧉', category: 'romance' },
      { id: 'stk-croissant', packId: 'pack-romance', title: 'Medialuna', emoji: '🥐', badgeText: 'MEDIALUNA 🥐', category: 'romance' },
      { id: 'stk-rose', packId: 'pack-romance', title: 'Rosa roja', emoji: '🌹', badgeText: 'PARA VOS 🌹', category: 'romance' },
    ],
  },
  {
    id: 'pack-cats',
    name: 'Gatitos & Reacciones',
    icon: '🐱',
    stickers: [
      { id: 'cat-love', packId: 'pack-cats', title: 'Gato Enamorado', emoji: '😻', badgeText: 'TE QUIERO 😻', category: 'cats' },
      { id: 'cat-coffee', packId: 'pack-cats', title: 'Gato con Café', emoji: '☕🐱', badgeText: 'DESPERTANDO ☕', category: 'cats' },
      { id: 'cat-kiss', packId: 'pack-cats', title: 'Besito Gatuno', emoji: '😽', badgeText: 'BESITO 😽', category: 'cats' },
      { id: 'cat-laugh', packId: 'pack-cats', title: 'Tentado', emoji: '😹', badgeText: 'JAJAJA 😹', category: 'cats' },
      { id: 'cat-cool', packId: 'pack-cats', title: 'Alta facha', emoji: '😎🐱', badgeText: 'ALTA FACHA 😎', category: 'cats' },
      { id: 'cat-shock', packId: 'pack-cats', title: 'Sorprendido', emoji: '🙀', badgeText: '¿QUÉ? 🙀', category: 'cats' },
    ],
  },
  {
    id: 'pack-porteno',
    name: 'Frases Porteñas',
    icon: '🇦🇷',
    stickers: [
      { id: 'fr-deuna', packId: 'pack-porteno', title: '¡De una!', emoji: '🚀', badgeText: '¡DE UNA! 🚀', category: 'porteno' },
      { id: 'fr-vamos', packId: 'pack-porteno', title: '¿Vamos?', emoji: '✨', badgeText: 'CHE, ¿VAMOS? ✨', category: 'porteno' },
      { id: 'fr-banco', packId: 'pack-porteno', title: 'Banco fuerte', emoji: '💪', badgeText: 'BANCO FUERTE 💪', category: 'porteno' },
      { id: 'fr-vinito', packId: 'pack-porteno', title: 'Un vinito y vemos', emoji: '🍷', badgeText: 'UN VINITO Y VEMOS 🍷', category: 'porteno' },
      { id: 'fr-camino', packId: 'pack-porteno', title: 'En camino', emoji: '🛵', badgeText: '¡EN CAMINO! 🛵', category: 'porteno' },
      { id: 'fr-facha', packId: 'pack-porteno', title: 'Tremenda facha', emoji: '🕶️', badgeText: 'TREMENDA FACHA 🕶️', category: 'porteno' },
    ],
  },
];
const ALL_STICKERS = STICKER_PACKS.flatMap((p) => p.stickers);

const QUICK_GIFS = [
  { id: 'gif-1', title: 'Brindis', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=300&q=80', tag: '🍷 Salud' },
  { id: 'gif-2', title: 'Café Filtro', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80', tag: '☕ Café' },
  { id: 'gif-3', title: 'Flores', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=300&q=80', tag: '🌹 Ramo' },
  { id: 'gif-4', title: 'Vinilo', url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=300&q=80', tag: '🎵 Música' },
];

const DEFAULT_FREQUENT_EMOJIS = ['☕', '🍷', '✨', '❤️', '🔥', '😂', '🇦🇷', '🥐', '🎶', '😻', '🚀'];

const EMOJI_CATEGORIES = [
  { name: 'Caritas', icon: '😊', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😎', '🥳', '🤩'] },
  { name: 'Romance', icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💗', '💌', '💍', '💐', '🌹', '💋'] },
  { name: 'Café & Vino', icon: '☕', emojis: ['☕', '🍵', '🧋', '🍷', '🍸', '🍹', '🥐', '🥖', '🥞', '🍕', '🍰', '🍓'] },
  { name: 'Lugares', icon: '🇦🇷', emojis: ['🇦🇷', '✈️', '🛵', '🚕', '🏛️', '🎭', '🎨', '🎬', '🌃', '🌅', '📷', '📸'] },
];

const CONVERSATION_SPARKS = [
  '☕ ¿Te pinta un café de especialidad esta semana?',
  '🍷 ¡De una! Conozco un bodegón hermoso en San Telmo.',
  '🎵 ¿Qué vinilos estás escuchando últimamente?',
  '🎨 ¿Conocés la muestra nueva del MALBA?',
];

// Progreso de la conexión — del diseño Premium aprobado (Conversation.dc.html): una
// barra de 6 etapas que le muestra a la pareja en qué punto está la conexión, del
// primer match a la segunda cita. No existía en el chat implementado; se agrega acá
// sin tocar el resto de la lógica.
const CONNECTION_STAGE_ORDER: ConnectionStatus[] = ['MATCH', 'TALKING', 'PROPOSAL', 'DATE_AGREED', 'DATE_VERIFIED', 'SECOND_DATE'];
const CONNECTION_STAGE_NAMES: Record<ConnectionStatus, string> = {
  MATCH: 'Match',
  TALKING: 'Hablando',
  PROPOSAL: 'Propuesta',
  DATE_AGREED: 'Cita acordada',
  DATE_VERIFIED: 'Cita verificada',
  SECOND_DATE: 'Segunda cita',
  INACTIVE: 'Inactiva',
};

const SAFETY_TIPS = [
  { icon: 'groups', text: 'Elegí siempre un lugar público para la primera cita — nunca tu casa ni la de tu match.' },
  { icon: 'share_location', text: 'Contale a un amigo o familiar dónde y con quién vas a estar.' },
  { icon: 'videocam', text: 'Hacé una videollamada antes de encontrarte en persona, para confirmar que es quien dice ser.' },
  { icon: 'qr_code_2', text: 'Usá el check-in con QR de MELY al llegar: así verificamos que la cita fue real y segura.' },
  { icon: 'payments', text: 'Nunca envíes dinero ni datos bancarios a alguien que conociste en la app.' },
  { icon: 'favorite', text: 'Si algo no te cierra, confiá en tu instinto — podés terminar la charla o la cita cuando quieras.' },
];

const STICKER_MARK = '::sticker::';
const GIF_MARK = '::gif::';

function parseSticker(body: string): WhatsAppSticker | null {
  if (!body.startsWith(STICKER_MARK)) return null;
  return ALL_STICKERS.find((s) => s.id === body.slice(STICKER_MARK.length)) ?? null;
}

function parseGif(body: string): (typeof QUICK_GIFS)[number] | null {
  if (!body.startsWith(GIF_MARK)) return null;
  return QUICK_GIFS.find((g) => g.id === body.slice(GIF_MARK.length)) ?? null;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-AR', { hour: 'numeric', minute: '2-digit' });
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  matches,
  isLoadingMatches = false,
  activeConnectionId,
  onSelectConnection,
  onOpenProposeModal,
  onOpenIcebreaker,
  onOpenDateQR,
}) => {
  const { isLight } = useTheme();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'inbox' | 'chat'>(activeConnectionId ? 'chat' : 'inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');

  const [activeMediaTray, setActiveMediaTray] = useState<'sparks' | 'emojis' | 'stickers' | 'gifs' | null>(null);
  const [selectedStickerPackId, setSelectedStickerPackId] = useState<string>('pack-romance');
  const [favoriteStickerIds, setFavoriteStickerIds] = useState<string[]>(['stk-coffee', 'stk-spark']);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [activeReactionMenuMsgId, setActiveReactionMenuMsgId] = useState<string | null>(null);
  const [activeOptionsMenuMsgId, setActiveOptionsMenuMsgId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedStickerDetail, setSelectedStickerDetail] = useState<WhatsAppSticker | null>(null);

  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [inChatSearchTerm, setInChatSearchTerm] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'dates'>('all');

  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showContactInfoDrawer, setShowContactInfoDrawer] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);

  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem('mely_chat_theme_id') || 'mely-cherry';
    } catch {
      return 'mely-cherry';
    }
  });
  const [customColor, setCustomColor] = useState<string>(() => {
    try {
      return localStorage.getItem('mely_chat_custom_color') || '';
    } catch {
      return '';
    }
  });
  const [customPattern, setCustomPattern] = useState<'dots' | 'grid' | 'stars' | 'clean' | 'warm'>(() => {
    try {
      return (localStorage.getItem('mely_chat_wallpaper_pattern') as 'dots' | 'grid' | 'stars' | 'clean' | 'warm') || 'dots';
    } catch {
      return 'dots';
    }
  });

  const [localReactions, setLocalReactions] = useState<Record<string, string>>({});
  const [starredMsgIds, setStarredMsgIds] = useState<string[]>([]);
  // Quién no quiere ver la tarjeta de "próxima cita" la puede ocultar; queda oculta
  // (por id de propuesta, no de conexión) hasta que haya una propuesta nueva.
  const [hiddenProposalIds, setHiddenProposalIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mely_hidden_proposals') ?? '[]');
    } catch {
      return [];
    }
  });
  const dismissProposalCard = (id: string) => {
    sounds.playClick();
    setHiddenProposalIds((prev) => {
      const next = [...new Set([...prev, id])];
      localStorage.setItem('mely_hidden_proposals', JSON.stringify(next));
      return next;
    });
  };
  const restoreProposalCard = (id: string) => {
    sounds.playClick();
    setHiddenProposalIds((prev) => {
      const next = prev.filter((pid) => pid !== id);
      localStorage.setItem('mely_hidden_proposals', JSON.stringify(next));
      return next;
    });
  };
  // Emojis usados de verdad (no una lista fija) — como en el "Frecuentes" real de WhatsApp.
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mely_recent_emojis') ?? '[]');
    } catch {
      return [];
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Mantenía dos botones (reaccionar + opciones) siempre visibles al lado de CADA mensaje
  // — mucho ruido comparado con WhatsApp/Telegram, que no muestran nada hasta que mantenés
  // presionado. Acá se reemplaza por un long-press real que abre las dos cosas juntas.
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);
  const startLongPress = (msgId: string) => {
    longPressFiredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      sounds.playClick();
      setActiveReactionMenuMsgId(msgId);
      setActiveOptionsMenuMsgId(msgId);
    }, 420);
  };
  const cancelLongPress = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const activeMatch: Match | null = matches.find((m) => m.id === activeConnectionId) ?? null;

  const { data: messagesData } = useMessages(activeConnectionId);
  const messages = useMemo(() => messagesData?.messages ?? [], [messagesData]);
  const { data: proposals = [] } = useProposals(activeConnectionId);
  const activeProposal = useMemo(
    () => [...proposals].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).find((p) => p.status !== 'DECLINED' && p.status !== 'EXPIRED'),
    [proposals],
  );

  const sendMessage = useSendMessage(activeConnectionId ?? '');
  const sendPhoto = useSendPhoto(activeConnectionId ?? '');
  const markRead = useMarkRead(activeConnectionId);
  const acceptProposal = useAcceptProposal();
  const counterProposal = useCounterProposal();
  const [counterFormOpen, setCounterFormOpen] = useState(false);
  const [counterAt, setCounterAt] = useState('');
  const isPartnerTyping = useTypingIndicator(activeConnectionId);
  const pingTyping = useTypingPing(activeConnectionId);

  const currentTheme = CHAT_THEME_PRESETS.find((t) => t.id === selectedThemeId) || CHAT_THEME_PRESETS[0];

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (viewMode === 'chat') scrollToBottom('auto');
  }, [viewMode, activeConnectionId]);

  useEffect(() => {
    setCounterFormOpen(false);
    setCounterAt('');
  }, [activeConnectionId, activeProposal?.id]);

  useEffect(() => {
    if (viewMode === 'chat') scrollToBottom('smooth');
  }, [messages.length, isPartnerTyping, activeMediaTray, viewMode]);

  useEffect(() => {
    if (viewMode === 'chat' && activeConnectionId && messages.some((m) => m.senderId !== user?.id && !m.readAt)) {
      markRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeConnectionId, messages.length]);

  const getWallpaperStyle = (): React.CSSProperties => {
    const accent = customColor || currentTheme.accentColor;
    switch (customPattern) {
      case 'grid':
        return {
          backgroundImage: isLight
            ? `linear-gradient(to right, #efe7d8 1px, transparent 1px), linear-gradient(to bottom, #efe7d8 1px, #fcf9f2 1px)`
            : `linear-gradient(to right, rgba(225,29,72,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(225,29,72,0.12) 1px, #0a1120 1px)`,
          backgroundSize: '24px 24px',
        };
      case 'stars':
        return {
          backgroundImage: isLight
            ? `radial-gradient(${accent} 0.5px, transparent 0.5px), radial-gradient(#d8ecf5 0.5px, #fcf9f2 0.5px)`
            : `radial-gradient(#f1e4f7 0.6px, transparent 0.6px), radial-gradient(#5b3b75 0.6px, #0a1120 0.6px)`,
          backgroundSize: '28px 28px, 14px 14px',
        };
      case 'warm':
        return {
          backgroundImage: isLight
            ? `radial-gradient(${accent} 0.5px, #efe7d8 0.5px)`
            : `radial-gradient(#8a5a28 0.6px, #0a1120 0.6px)`,
          backgroundSize: '22px 22px',
        };
      case 'clean':
        return { backgroundColor: isLight ? '#fcf9f2' : '#0a1120' };
      case 'dots':
      default:
        return {
          backgroundImage: isLight
            ? `radial-gradient(${accent} 0.45px, transparent 0.45px), radial-gradient(#d8ecf5 0.45px, #fcf9f2 0.45px)`
            : `radial-gradient(${accent} 0.5px, transparent 0.5px), radial-gradient(#17233d 0.5px, #0a1120 0.5px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        };
    }
  };

  // El redondeo (rounded-[20px]) se aplica una sola vez en el wrapper de la burbuja —
  // antes cada rama lo repetía con una asimetría "cola" (rounded-tr/tl-sm) distinta al
  // estilo iMessage/Telegram que se busca, y el caso de tema preseteado (sin customColor)
  // ni siquiera la incluía, dejando esa burbuja sin bordes redondeados.
  const getUserBubbleClass = () =>
    customColor ? 'text-white shadow-elevation-md border border-white/20' : isLight ? currentTheme.userBubbleLight : currentTheme.userBubbleDark;
  const getPartnerBubbleClass = () =>
    isLight
      ? 'bg-white text-[#16223b] border border-[#ffe3d3] shadow-elevation-sm'
      : 'bg-[#131f36] text-[#f5f1e8] border border-[#f16b48]/25 shadow-elevation-sm';

  const handleApplyTheme = (themeId: string) => {
    sounds.playClick();
    setSelectedThemeId(themeId);
    setCustomColor('');
    const matched = CHAT_THEME_PRESETS.find((t) => t.id === themeId);
    try {
      localStorage.setItem('mely_chat_theme_id', themeId);
      localStorage.removeItem('mely_chat_custom_color');
      if (matched) {
        setCustomPattern(matched.wallpaperPattern);
        localStorage.setItem('mely_chat_wallpaper_pattern', matched.wallpaperPattern);
      }
    } catch {
      /* localStorage no disponible */
    }
  };
  const handleApplyCustomColor = (hex: string) => {
    sounds.playClick();
    setCustomColor(hex);
    try {
      localStorage.setItem('mely_chat_custom_color', hex);
    } catch {
      /* localStorage no disponible */
    }
  };
  const handleApplyPattern = (pattern: 'dots' | 'grid' | 'stars' | 'clean' | 'warm') => {
    sounds.playClick();
    setCustomPattern(pattern);
    try {
      localStorage.setItem('mely_chat_wallpaper_pattern', pattern);
    } catch {
      /* localStorage no disponible */
    }
  };

  const handleOpenConversation = (connectionId: string) => {
    sounds.playClick();
    onSelectConnection(connectionId);
    setViewMode('chat');
    setActiveMediaTray(null);
    setShowAttachmentMenu(false);
    setReplyingTo(null);
  };

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeConnectionId) return;
    sounds.playClick();
    setInputText('');
    setActiveMediaTray(null);
    setShowAttachmentMenu(false);
    sendMessage.mutate({ body: text, replyToId: replyingTo?.id });
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const handleSendSticker = (sticker: WhatsAppSticker) => {
    if (!activeConnectionId) return;
    sounds.playStamp();
    setActiveMediaTray(null);
    sendMessage.mutate({ body: `${STICKER_MARK}${sticker.id}` });
  };

  const handleSendGif = (gif: (typeof QUICK_GIFS)[number]) => {
    if (!activeConnectionId) return;
    sounds.playStamp();
    setActiveMediaTray(null);
    sendMessage.mutate({ body: `${GIF_MARK}${gif.id}` });
  };

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeConnectionId) return;
    sounds.playStamp();
    setShowAttachmentMenu(false);
    sendPhoto.mutate(file);
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    sounds.playClick();
    setLocalReactions((prev) => ({ ...prev, [msgId]: prev[msgId] === emoji ? '' : emoji }));
    setActiveReactionMenuMsgId(null);
  };
  const handleToggleStar = (msgId: string) => {
    sounds.playClick();
    setStarredMsgIds((prev) => (prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]));
    setActiveOptionsMenuMsgId(null);
  };
  const handleToggleFavoriteSticker = (stickerId: string) => {
    sounds.playClick();
    setFavoriteStickerIds((prev) => (prev.includes(stickerId) ? prev.filter((id) => id !== stickerId) : [...prev, stickerId]));
  };
  const handleInsertEmoji = (emoji: string) => {
    sounds.playClick();
    setInputText((prev) => prev + emoji);
    setRecentEmojis((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 24);
      localStorage.setItem('mely_recent_emojis', JSON.stringify(next));
      return next;
    });
    inputRef.current?.focus();
  };
  const handleBackspaceEmoji = () => {
    sounds.playClick();
    // Borra el último "carácter" completo (un emoji puede ocupar más de un code unit).
    setInputText((prev) => (prev ? [...prev].slice(0, -1).join('') : prev));
    inputRef.current?.focus();
  };

  const filteredMatches = matches.filter((m) => {
    const q = searchQuery.toLowerCase();
    if (q && !m.other.displayName.toLowerCase().includes(q)) return false;
    if (inboxFilter === 'unread') return m.unread > 0;
    if (inboxFilter === 'dates') return m.status === 'PROPOSAL' || m.status === 'DATE_AGREED' || m.status === 'DATE_VERIFIED' || m.status === 'SECOND_DATE';
    return true;
  });

  const filteredMessages = messages.filter((m) => {
    if (!inChatSearchTerm.trim()) return true;
    const q = inChatSearchTerm.toLowerCase();
    return m.body.toLowerCase().includes(q);
  });

  const currentPack = STICKER_PACKS.find((p) => p.id === selectedStickerPackId) || STICKER_PACKS[0];
  const favoriteStickers = ALL_STICKERS.filter((s) => favoriteStickerIds.includes(s.id));

  // =========================================================================
  // VIEW: INBOX
  // =========================================================================
  if (viewMode === 'inbox' || !activeMatch) {
    return (
      <div className="flex flex-col w-full h-[calc(100dvh-130px)] min-h-[500px] animate-fadeIn">
        {/* Búsqueda y filtros quedan pegados arriba mientras se scrollea la lista — sin
            repetir el título "MELY Chat" que ya muestra el TopAppBar de la app. */}
        <div className="shrink-0 pb-3">
          <div className="relative flex items-center mb-2.5">
            <span className={`material-symbols-outlined absolute left-3.5 text-[18px] pointer-events-none ${isLight ? 'text-[#6fa8c9]' : 'text-[#ffb295]/50'}`}>search</span>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar un chat..."
              className="pl-10 h-11 text-[13px] rounded-2xl"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Todos', count: matches.length },
              { id: 'unread', label: 'No leídos', count: matches.filter((m) => m.unread > 0).length },
              { id: 'dates', label: 'Con Citas 🎟️', count: matches.filter((m) => m.status === 'PROPOSAL' || m.status === 'DATE_AGREED').length },
            ].map((chip) => {
              const isSelected = inboxFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    sounds.playClick();
                    setInboxFilter(chip.id as 'all' | 'unread' | 'dates');
                  }}
                  className={`px-2.5 py-1.5 rounded-full text-[10.5px] font-bold flex items-center gap-1 whitespace-nowrap transition-all border shadow-elevation-sm ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#f16b48] to-[#ff8a65] text-white border-transparent'
                      : isLight
                      ? 'bg-white text-[#2e5570] border-[#ffe3d3]'
                      : 'bg-white/5 text-[#ffb295]/80 border-[#f16b48]/20'
                  }`}
                >
                  <span>{chip.label}</span>
                  {chip.count > 0 && <span className={`px-1 rounded-full text-[9px] ${isSelected ? 'bg-white/20 text-white' : isLight ? 'bg-gray-100' : 'bg-black/30'}`}>{chip.count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="space-y-0.5 pb-2">
            {isLoadingMatches && matches.length === 0 ? (
              <div className="space-y-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full py-3 flex items-center gap-3">
                    <Skeleton className="w-13 h-13 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className={`p-8 text-center font-body-sm text-[13px] ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/70'}`}>
                {matches.length === 0
                  ? 'Todavía no tenés matches. Andá a Descubrir para empezar a conectar.'
                  : 'No se encontraron conversaciones con ese filtro.'}
              </div>
            ) : (
              filteredMatches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => handleOpenConversation(match.id)}
                  className={`relative w-full pl-4 pr-2.5 py-3 rounded-2xl flex items-center gap-3 transition-colors text-left group ${
                    isLight ? 'hover:bg-[#fcf9f2]' : 'hover:bg-[#0f1a2e]'
                  }`}
                >
                  {/* Barra de acento en vez de una caja entera resaltada: menos "chip
                      dentro de chip", el color hace todo el trabajo de indicar no leído. */}
                  {match.unread > 0 && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-full bg-gradient-to-b from-[#f16b48] to-[#ff8a65]" />
                  )}
                  <div className="relative w-13 h-13 rounded-full overflow-hidden shrink-0 shadow-elevation-sm">
                    <img src={match.other.photos[0]?.url} alt={match.other.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {match.other.lastActive === 'En línea' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#3f7a5c] border-2 border-white rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className={`font-headline-md text-[14.5px] font-bold truncate ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>{match.other.displayName}</h3>
                        {match.other.badges.trusted && <span className="material-symbols-outlined text-[13px] text-[#f16b48] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }} title="Citas verificadas">verified</span>}
                        {match.other.badges.verified && <span className="material-symbols-outlined text-[13px] text-sky-400 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }} title="Identidad verificada">verified</span>}
                      </div>
                      {match.lastMessageAt && <span className={`font-meta-data text-[10px] shrink-0 ${isLight ? 'text-gray-400' : 'text-[#ffb295]/60'}`}>{formatTime(match.lastMessageAt)}</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[12.5px] truncate ${match.unread > 0 ? 'font-semibold text-[#f16b48]' : isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/80'}`}>
                        {match.status === 'MATCH' ? '¡Comenzá la conversación!' : match.label}
                      </p>
                      {match.unread > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#f16b48] to-[#ff8a65] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-elevation-sm">
                          {match.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: ACTIVE CHAT
  // =========================================================================
  const partner = activeMatch.other;
  const connectionStageIndex = Math.max(0, CONNECTION_STAGE_ORDER.indexOf(activeMatch.status));
  const conversationSparkChips = CONVERSATION_SPARKS.slice(0, 2);

  return (
    // Sin rounded/border/shadow acá: en isChatDetail (App.tsx) se saca la topbar/navbar y el
    // padding del <main> para que el chat sea de borde a borde, como cualquier chat nativo
    // (WhatsApp/Telegram/iMessage) — quedaba flotando como una tarjeta si se lo bordeaba.
    <div
      className={`flex flex-col h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full overflow-hidden relative animate-fadeIn ${
        isLight ? 'bg-[#efe7d8]' : 'bg-[#0a1120]'
      }`}
    >
      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoSelected} />

      {/* Header */}
      <div className={`px-3 py-2 border-b flex items-center justify-between shrink-0 relative z-30 shadow-elevation-sm liquid-glass min-h-[56px] ${isLight ? 'bg-white/60 border-[#ffe3d3]/60' : 'bg-[#0f1a2e]/60 border-[#f16b48]/25'}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
          <Button variant="ghost" size="icon" onClick={() => { sounds.playClick(); setViewMode('inbox'); setActiveMediaTray(null); onSelectConnection(null); }} className="h-8 w-8 -ml-1 rounded-full text-[#5b6478] hover:text-[#f16b48] shrink-0" title="Volver">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </Button>

          <div className="relative cursor-pointer group shrink-0" onClick={() => setShowContactInfoDrawer(true)}>
            <Avatar className="w-9 h-9 border border-[#f16b48] group-hover:scale-105 transition-transform">
              <AvatarImage src={partner.photos[0]?.url} alt={partner.displayName} />
              <AvatarFallback>{partner.displayName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            {partner.lastActive === 'En línea' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#3f7a5c] border-2 border-white rounded-full" />}
          </div>

          <div className="flex flex-col cursor-pointer min-w-0 flex-1" onClick={() => setShowContactInfoDrawer(true)}>
            <div className="flex items-center gap-1 min-w-0">
              <h2 className={`font-headline-md text-[13.5px] font-bold tracking-wide truncate ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>{partner.displayName}</h2>
              {partner.badges.trusted && <span className="material-symbols-outlined text-[13px] text-[#f16b48] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }} title="Citas verificadas">verified</span>}
              {partner.badges.verified && <span className="material-symbols-outlined text-[13px] text-sky-400 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }} title="Identidad verificada">verified</span>}
            </div>
            <div className="text-[10.5px] leading-tight truncate">
              {isPartnerTyping ? (
                <span className="text-[#f16b48] font-medium animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#f16b48] rounded-full animate-bounce" />escribiendo...
                </span>
              ) : (
                <span className={`truncate ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/80'}`}>{partner.lastActive === 'En línea' ? 'en línea' : partner.lastActive}</span>
              )}
            </div>
          </div>
        </div>

        {/* Solo las 2 acciones más contextuales quedan siempre visibles (proponer cita y
            estado de verificación) — Ruleta y Personalizar tema se mudan al menú "⋮" de
            abajo. Antes, con las 4 juntas + badge + menú, el nombre/estado de la izquierda
            se comprimía a 0px de ancho en pantallas angostas y quedaba pegado al avatar. */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Consejos de seguridad — del diseño Premium aprobado: un botón siempre visible
              en el header del chat (antes esta info de confianza no existía en ningún lado
              de la conversación). */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { sounds.playClick(); setShowSafetyTips(true); }}
            className={`h-8 w-8 rounded-full ${isLight ? 'text-[#2e5570]' : 'text-[#ffb295]/80'}`}
            title="Consejos de seguridad"
            aria-label="Consejos de seguridad"
          >
            <span className="material-symbols-outlined text-[18px]">shield</span>
          </Button>
          {onOpenProposeModal && (
            <Button size="sm" onClick={() => { sounds.playStamp(); onOpenProposeModal(activeMatch.id); }} className="h-8 px-2.5 rounded-full text-[11px] flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[15px]">local_cafe</span>
              <span>Cita</span>
            </Button>
          )}
          {onOpenDateQR && (activeMatch.status === 'DATE_AGREED' || activeMatch.status === 'DATE_VERIFIED' || activeMatch.status === 'SECOND_DATE') && (
            <button
              onClick={() => { sounds.playScanBeep(); onOpenDateQR(activeMatch.id, partner.displayName, partner.photos[0]?.url ?? ''); }}
              className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 border transition-all shrink-0 ${
                activeMatch.status === 'DATE_VERIFIED' || activeMatch.status === 'SECOND_DATE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-[#f16b48]/10 text-[#f16b48] border-[#f16b48]/30 animate-pulse'
              }`}
              title="Ver Pase QR"
            >
              <span className="material-symbols-outlined text-[13px]">{activeMatch.status === 'DATE_VERIFIED' || activeMatch.status === 'SECOND_DATE' ? 'verified' : 'qr_code_2'}</span>
              <span>{activeMatch.status === 'DATE_VERIFIED' || activeMatch.status === 'SECOND_DATE' ? 'Verificada' : 'Pase QR'}</span>
            </button>
          )}
          <div className="relative shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setShowHeaderMenu(!showHeaderMenu)} className={`h-8 w-8 rounded-full ${isLight ? 'text-[#2e5570]' : 'text-[#ffb295]/80'}`} title="Más opciones">
              <span className="material-symbols-outlined text-[19px]">more_vert</span>
            </Button>
            {showHeaderMenu && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowHeaderMenu(false)} />
                <div className={`absolute right-0 top-10 w-56 rounded-2xl shadow-2xl border p-1.5 z-50 animate-scaleUp ${isLight ? 'bg-white border-[#ffe3d3] text-[#16223b]' : 'bg-[#0f1a2e] border-[#f16b48]/40 text-[#f5f1e8]'}`}>
                  <button onClick={() => { setShowHeaderMenu(false); setShowContactInfoDrawer(true); }} className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#f16b48]">account_circle</span>
                    <span>Ver perfil de {partner.displayName}</span>
                  </button>
                  <button onClick={() => { setShowHeaderMenu(false); setInChatSearchOpen(!inChatSearchOpen); }} className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#f16b48]">search</span>
                    <span>Buscar en este chat</span>
                  </button>
                  <button onClick={() => { setShowHeaderMenu(false); setActiveMediaTray('stickers'); }} className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#f16b48]">auto_awesome</span>
                    <span>Panel de Stickers</span>
                  </button>
                  {onOpenIcebreaker && (
                    <button onClick={() => { setShowHeaderMenu(false); onOpenIcebreaker(partner.displayName); }} className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>casino</span>
                      <span>Ruleta de Preguntas</span>
                    </button>
                  )}
                  <button onClick={() => { setShowHeaderMenu(false); setShowThemeCustomizer(true); }} className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#f16b48]">palette</span>
                    <span>Personalizar tema</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progreso de la conexión — barra de 6 etapas del diseño Premium aprobado. */}
      <div className={`px-3.5 pt-2 pb-1.5 shrink-0 flex flex-col gap-1.5 relative z-20 ${isLight ? 'bg-[#efe7d8]' : 'bg-[#0a1120]'}`}>
        <div className="flex gap-1">
          {CONNECTION_STAGE_ORDER.map((stage, i) => (
            <span
              key={stage}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{ background: i <= connectionStageIndex ? 'var(--coral-500)' : isLight ? 'rgba(22,34,59,0.12)' : 'var(--midnight-700)' }}
            />
          ))}
        </div>
        <span className={`text-[10.5px] font-bold ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/60'}`}>
          {CONNECTION_STAGE_NAMES[activeMatch.status]} · paso {connectionStageIndex + 1} de {CONNECTION_STAGE_ORDER.length}
        </span>
      </div>

      {inChatSearchOpen && (
        <div className={`px-3 py-2 border-b flex items-center gap-2 animate-fadeIn z-20 ${isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#0f1a2e] border-[#f16b48]/30'}`}>
          <span className="material-symbols-outlined text-[18px] text-[#f16b48]">search</span>
          <input
            type="text"
            value={inChatSearchTerm}
            onChange={(e) => setInChatSearchTerm(e.target.value)}
            placeholder="Buscar en este chat..."
            className={`flex-1 text-[12.5px] bg-transparent border-0 focus:outline-none ${isLight ? 'text-[#16223b] placeholder:text-gray-400' : 'text-white placeholder:text-[#ffb295]/40'}`}
            autoFocus
          />
          <Button variant="ghost" size="sm" onClick={() => setInChatSearchOpen(false)} className="h-7 px-2 text-[11px]">Listo</Button>
        </div>
      )}

      {/* Active proposal sticky card */}
      {activeProposal && hiddenProposalIds.includes(activeProposal.id) && (
        <div className={`px-3 pt-2 shrink-0 ${isLight ? 'bg-[#efe7d8]' : 'bg-[#0a1120]'}`}>
          <button
            type="button"
            onClick={() => restoreProposalCard(activeProposal.id)}
            className={`w-full flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-colors ${
              isLight ? 'bg-white border-[#ffe3d3] text-[#f16b48] hover:border-[#f16b48]' : 'bg-[#131f36] border-[#f16b48]/30 text-[#ffb295] hover:border-[#f16b48]/60'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">event</span>
            Próxima cita
            <span className="material-symbols-outlined text-[14px] ml-auto">expand_more</span>
          </button>
        </div>
      )}
      {activeProposal && !hiddenProposalIds.includes(activeProposal.id) && (
        <div className={`px-3 pt-2 shrink-0 ${isLight ? 'bg-[#efe7d8]' : 'bg-[#0a1120]'}`}>
          <div className={`p-3 rounded-2xl border-2 flex flex-col gap-2 ${isLight ? 'bg-[#fcf9f2] border-[#f16b48]/40' : 'bg-[#131f36] border-[#f16b48]/50'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wide block font-bold text-[#f16b48]">Próxima cita</span>
                <p className={`text-[12px] truncate ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                  {activeProposal.scheduledAt
                    ? new Date(activeProposal.scheduledAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
                    : 'A coordinar por chat'}{' '}
                  · {activeProposal.zone}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {activeProposal.status === 'PENDING' && activeProposal.proposerId !== user?.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCounterFormOpen((prev) => !prev)}
                      className="h-8 px-2.5 text-[11px] font-bold rounded-xl"
                    >
                      {activeProposal.scheduledAt ? 'Cambiar hora' : 'Proponer hora'}
                    </Button>
                    <Button size="sm" onClick={() => acceptProposal.mutate(activeProposal.id)} className="h-8 px-3 text-[11px] rounded-xl">
                      Aceptar
                    </Button>
                  </>
                ) : (
                  <Badge className="shrink-0 text-[10px] bg-[#f16b48]/15 text-[#f16b48] border border-[#f16b48]/30">
                    {activeProposal.status === 'PENDING' ? 'Esperando' : activeProposal.status === 'ACCEPTED' ? 'Aceptada' : 'Contrapropuesta'}
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => dismissProposalCard(activeProposal.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isLight ? 'text-gray-400 hover:text-[#f16b48] hover:bg-black/5' : 'text-white/40 hover:text-[#ffb295] hover:bg-white/10'
                  }`}
                  aria-label="Ocultar tarjeta de próxima cita"
                  title="Ocultar"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
            </div>

            {/* Acción de check-in — del diseño Premium aprobado: una vez que la cita está
                acordada, el atajo para verificar con QR aparece directo en la tarjeta,
                además del badge "Pase QR" que ya vive en el header. */}
            {activeProposal.status === 'ACCEPTED' && onOpenDateQR && (
              <button
                type="button"
                onClick={() => { sounds.playScanBeep(); onOpenDateQR(activeMatch.id, partner.displayName, partner.photos[0]?.url ?? ''); }}
                className={`flex items-center justify-center gap-1.5 h-8 rounded-xl border text-[11px] font-bold transition-colors ${
                  isLight ? 'border-[#f16b48]/30 text-[#f16b48] hover:bg-[#f16b48]/5' : 'border-[#f16b48]/30 text-[#ffb295] hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
                Ya estamos ahí · Verificar con QR
              </button>
            )}

            {counterFormOpen && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!counterAt) return;
                  counterProposal.mutate(
                    { proposalId: activeProposal.id, input: { scheduledAt: new Date(counterAt).toISOString() } },
                    { onSuccess: () => setCounterFormOpen(false) },
                  );
                }}
                className="flex items-center gap-1.5 pt-1 border-t border-[#f16b48]/20"
              >
                <input
                  type="datetime-local"
                  value={counterAt}
                  onChange={(e) => setCounterAt(e.target.value)}
                  required
                  className={`flex-1 min-w-0 border rounded-xl px-2.5 py-1.5 text-[12px] focus:outline-none ${
                    isLight ? 'bg-white border-[#ffe3d3] text-[#16223b]' : 'bg-[#0a1120] border-[#f16b48]/25 text-[#f5f1e8]'
                  }`}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={counterProposal.isPending}
                  className="h-8 px-3 text-[11px] rounded-xl shrink-0"
                >
                  Enviar
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {/* mt-auto en el primer hijo (no justify-end en el contenedor) para pegar los
          mensajes abajo cuando hay pocos: justify-end en un flex column con
          overflow-y-auto tiene un bug conocido de Chromium donde scrollHeight queda
          igual a clientHeight apenas el contenido desborda — se veía "scrolleable"
          pero nunca se movía ni un píxel. */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2 relative z-10 no-scrollbar select-text transition-all duration-300" style={getWallpaperStyle()}>
        <div className="flex justify-center mb-1 mt-auto">
          <div className={`max-w-xs px-3 py-1.5 rounded-xl border text-center text-[10px] leading-tight shadow-elevation-sm backdrop-blur-md ${isLight ? 'bg-white/80 border-[#ffe3d3] text-[#2e5570]' : 'bg-[#131f36]/80 border-[#f16b48]/30 text-[#ffb295]/80'}`}>
            <span className="inline-flex items-center gap-1 font-bold text-[#f16b48] mb-0.5">
              <span className="material-symbols-outlined text-[12px]">lock</span>Conexión Privada MELY
            </span>
          </div>
        </div>

        {filteredMessages.map((msg: Message) => {
          const isUser = msg.senderId === user?.id;
          const sticker = msg.type === 'TEXT' ? parseSticker(msg.body) : null;
          const gif = msg.type === 'TEXT' ? parseGif(msg.body) : null;
          const isImage = msg.type === 'IMAGE' && !!msg.imageUrl;
          const msgReaction = localReactions[msg.id];
          const isStarred = starredMsgIds.includes(msg.id);

          return (
            <div key={msg.id} className={`flex flex-col group relative ${isUser ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] relative flex items-end gap-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {sticker ? (
                  <div
                    onClick={() => {
                      if (longPressFiredRef.current) return;
                      sounds.playClick();
                      setSelectedStickerDetail(sticker);
                    }}
                    onTouchStart={() => startLongPress(msg.id)}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                    onMouseDown={() => startLongPress(msg.id)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 py-1"
                  >
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#fcf9f2] to-white dark:from-[#131f36] dark:to-[#0f1a2e] border-2 border-[#f16b48]/40 shadow-xl flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
                      <span className="text-5xl select-none">{sticker.emoji}</span>
                      <span className="font-label-caps text-[9px] font-bold uppercase tracking-wider text-[#f16b48] mt-2 line-clamp-2 px-1">{sticker.badgeText || sticker.title}</span>
                      <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 bg-black/40 text-white px-1.5 py-0.5 rounded-full text-[8.5px]">
                        <span>{formatTime(msg.createdAt)}</span>
                        {isUser && msg.readAt && <span className="material-symbols-outlined text-[10px] text-[#6fa8c9]">done_all</span>}
                      </div>
                    </div>
                    {isStarred && <span className="absolute -top-1 -right-1 text-amber-400 text-[13px]">⭐</span>}
                  </div>
                ) : (
                  <div
                    style={isUser && customColor ? { backgroundColor: customColor } : undefined}
                    onTouchStart={() => startLongPress(msg.id)}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                    onMouseDown={() => startLongPress(msg.id)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    className={`p-2.5 sm:p-3 relative transition-all shadow-elevation-md rounded-[20px] select-none ${isUser ? getUserBubbleClass() : getPartnerBubbleClass()}`}
                  >
                    {msg.replyTo && (
                      <div className={`mb-1.5 pl-2 pr-1 py-1 rounded-lg border-l-2 max-w-[220px] ${
                        isUser ? 'border-l-white/50 bg-black/10' : isLight ? 'border-l-[#f16b48] bg-black/[0.03]' : 'border-l-[#f16b48] bg-white/5'
                      }`}>
                        <span className={`block text-[9.5px] font-bold ${isUser ? 'text-white/80' : 'text-[#f16b48]'}`}>
                          {msg.replyTo.senderId === msg.senderId ? 'Se respondió a sí mismo' : msg.replyTo.senderId === user?.id ? 'Vos' : partner.displayName}
                        </span>
                        <span className={`block text-[11px] truncate ${isUser ? 'text-white/70' : isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/70'}`}>
                          {msg.replyTo.type === 'IMAGE' ? '📷 Foto' : msg.replyTo.body}
                        </span>
                      </div>
                    )}
                    {gif && (
                      <div className="mb-2 rounded-xl overflow-hidden max-w-[220px] border border-black/10">
                        <img src={gif.url} alt={gif.title} className="w-full h-auto object-cover max-h-52 rounded-xl" referrerPolicy="no-referrer" />
                        <span className="block text-[10px] font-bold px-1.5 py-1">{gif.tag}</span>
                      </div>
                    )}
                    {isImage && (
                      <div className="mb-2 rounded-xl overflow-hidden max-w-[240px] border border-black/10">
                        <img src={msg.imageUrl ?? undefined} alt="Foto enviada" className="w-full h-auto object-cover max-h-52 rounded-xl cursor-pointer" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    {!gif && !isImage && (
                      <p className="font-body-sm text-[13px] leading-relaxed break-words">{msg.body}</p>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-0.5 select-none text-[9.5px] opacity-75">
                      {isStarred && <span>⭐</span>}
                      <span>{formatTime(msg.createdAt)}</span>
                      {isUser && msg.readAt && <span className="material-symbols-outlined text-[13px] text-[#6fa8c9]" title="Leído">done_all</span>}
                    </div>
                    {msgReaction && (
                      <button onClick={() => handleToggleReaction(msg.id, msgReaction)} className={`absolute -bottom-2 ${isUser ? 'left-2' : 'right-2'} px-1.5 py-0.5 rounded-full text-[11px] shadow-elevation-md flex items-center gap-1 ${isLight ? 'bg-white border border-[#ffe3d3]' : 'bg-[#0f1a2e] border border-[#f16b48]/40'}`}>
                        <span>{msgReaction}</span>
                      </button>
                    )}
                  </div>
                )}

              </div>

              {activeReactionMenuMsgId === msg.id && (
                <div className={`mt-1 z-30 p-1.5 rounded-full shadow-2xl flex items-center gap-1 animate-fadeIn border ${isLight ? 'bg-white border-[#ffe3d3]' : 'bg-[#0f1a2e] border-[#f16b48]/40'} ${isUser ? 'self-end mr-2' : 'self-start ml-2'}`}>
                  {['👍', '❤️', '😂', '😮', '😢', '🙏', '☕', '🔥'].map((emoji) => (
                    <button key={emoji} onClick={() => handleToggleReaction(msg.id, emoji)} className="p-1 text-[15px] hover:scale-125 transition-transform rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {activeOptionsMenuMsgId === msg.id && (
                <div className={`mt-1 z-30 p-1.5 rounded-2xl shadow-2xl flex flex-col gap-1 animate-fadeIn border text-[11px] font-medium ${isLight ? 'bg-white border-[#ffe3d3] text-[#16223b]' : 'bg-[#0f1a2e] border-[#f16b48]/40 text-[#f5f1e8]'} ${isUser ? 'self-end mr-2' : 'self-start ml-2'}`}>
                  <button
                    onClick={() => { setReplyingTo(msg); setActiveOptionsMenuMsgId(null); sounds.playClick(); inputRef.current?.focus(); }}
                    className="px-2.5 py-1 text-left rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">reply</span>
                    <span>Responder</span>
                  </button>
                  <button onClick={() => handleToggleStar(msg.id)} className="px-2.5 py-1 text-left rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">{isStarred ? 'star_half' : 'star'}</span>
                    <span>{isStarred ? 'Quitar estrella' : 'Destacar'}</span>
                  </button>
                  {!sticker && !gif && !isImage && (
                    <button onClick={() => { navigator.clipboard.writeText(msg.body); setActiveOptionsMenuMsgId(null); sounds.playClick(); }} className="px-2.5 py-1 text-left rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      <span>Copiar texto</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {(activeReactionMenuMsgId || activeOptionsMenuMsgId) && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => {
              setActiveReactionMenuMsgId(null);
              setActiveOptionsMenuMsgId(null);
            }}
          />
        )}

        {isPartnerTyping && (
          <div className="flex items-end gap-1.5 self-start animate-fadeIn">
            <Avatar className="w-7 h-7 border border-[#f16b48]/30">
              <AvatarImage src={partner.photos[0]?.url} alt={partner.displayName} />
              <AvatarFallback>{partner.displayName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className={`px-3 py-2 rounded-[20px] flex items-center gap-1 shadow-elevation-sm border ${isLight ? 'bg-white border-[#ffe3d3]' : 'bg-[#2e5570] border-[#f16b48]/20'}`}>
              <span className="w-1.5 h-1.5 bg-[#f16b48] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-[#ff8a65] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#f16b48] rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment menu */}
      {showAttachmentMenu && (
        <div className={`border-t p-3.5 grid grid-cols-3 gap-3 animate-fadeIn relative z-20 shrink-0 ${isLight ? 'bg-white border-[#ffe3d3]' : 'bg-[#0f1a2e] border-[#f16b48]/30'}`}>
          <button onClick={() => photoInputRef.current?.click()} className="flex flex-col items-center gap-1 text-center group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-elevation-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">image</span>
            </div>
            <span className={`text-[11px] font-medium ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>Fotos</span>
          </button>
          <button onClick={() => { setShowAttachmentMenu(false); onOpenProposeModal?.(activeMatch.id); }} className="flex flex-col items-center gap-1 text-center group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f16b48] to-[#ff8a65] text-white flex items-center justify-center shadow-elevation-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">local_cafe</span>
            </div>
            <span className={`text-[11px] font-medium ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>Cita MELY</span>
          </button>
          {onOpenIcebreaker && (
            <button onClick={() => { setShowAttachmentMenu(false); onOpenIcebreaker(partner.displayName); }} className="flex flex-col items-center gap-1 text-center group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-elevation-md group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">casino</span>
              </div>
              <span className={`text-[11px] font-medium ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>Ruleta 🎲</span>
            </button>
          )}
          <button onClick={() => { setShowAttachmentMenu(false); setActiveMediaTray('stickers'); }} className="flex flex-col items-center gap-1 text-center group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-elevation-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            </div>
            <span className={`text-[11px] font-medium ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>Stickers</span>
          </button>
        </div>
      )}

      {/* Media tray */}
      {activeMediaTray && (
        <div className={`border-t flex flex-col h-64 max-h-[45vh] animate-fadeIn relative z-20 shrink-0 ${isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#0f1a2e] border-[#f16b48]/30'}`}>
          <div className={`px-3 py-1.5 border-b flex items-center justify-between shrink-0 ${isLight ? 'bg-[#fcf9f2]' : 'bg-[#131f36]'}`}>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {(['sparks', 'emojis', 'stickers', 'gifs'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveMediaTray(tab)}
                  className={`h-7 px-3 rounded-full text-[11px] font-bold flex items-center gap-1 shrink-0 ${activeMediaTray === tab ? 'bg-gradient-to-r from-[#f16b48] to-[#ff8a65] text-white shadow-elevation-sm' : isLight ? 'text-gray-600' : 'text-gray-300'}`}
                >
                  <span>{tab === 'sparks' ? '💡' : tab === 'emojis' ? '😊' : tab === 'stickers' ? '👾' : '🎬'}</span>
                  <span>{tab === 'sparks' ? 'Ideas' : tab === 'emojis' ? 'Emojis' : tab === 'stickers' ? 'Stickers' : 'GIFs'}</span>
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {activeMediaTray === 'emojis' && (
                <Button variant="ghost" size="icon" onClick={handleBackspaceEmoji} className="h-8 w-8 rounded-full text-gray-400" aria-label="Borrar último carácter">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">backspace</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setActiveMediaTray(null)} className="h-8 w-8 rounded-full text-gray-400" aria-label="Cerrar">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
              </Button>
            </div>
          </div>

          {activeMediaTray === 'sparks' && (
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 no-scrollbar">
              {CONVERSATION_SPARKS.map((spark, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { sounds.playClick(); sendMessage.mutate({ body: spark }); setActiveMediaTray(null); }}
                  className={`px-3 py-2 border rounded-2xl text-[12.5px] font-body-sm text-left transition-colors ${
                    isLight ? 'bg-white border-[#ffe3d3] text-[#2e5570] hover:border-[#f16b48] hover:text-[#f16b48]' : 'bg-[#0a1120] border-[#f16b48]/25 text-[#ffb295] hover:border-[#f16b48]/60'
                  }`}
                >
                  {spark}
                </button>
              ))}
            </div>
          )}

          {activeMediaTray === 'stickers' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar border-b border-black/5 dark:border-white/5 shrink-0">
                <button
                  onClick={() => setSelectedStickerPackId('favorites')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border transition-all ${selectedStickerPackId === 'favorites' ? 'bg-[#f16b48] text-white border-[#f16b48]' : isLight ? 'bg-white border-[#ffe3d3] text-gray-700' : 'bg-[#131f36] border-[#f16b48]/30 text-gray-300'}`}
                >
                  ⭐ Favoritos ({favoriteStickers.length})
                </button>
                {STICKER_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedStickerPackId(pack.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border transition-all ${selectedStickerPackId === pack.id ? 'bg-[#f16b48] text-white border-[#f16b48]' : isLight ? 'bg-white border-[#ffe3d3] text-gray-700' : 'bg-[#131f36] border-[#f16b48]/30 text-gray-300'}`}
                  >
                    {pack.icon} {pack.name}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                  {(selectedStickerPackId === 'favorites' ? favoriteStickers : currentPack.stickers).map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => handleSendSticker(sticker)}
                      className="flex flex-col items-center p-2 rounded-2xl border transition-all hover:scale-110 active:scale-95 group relative shadow-elevation-sm"
                      style={{ background: isLight ? '#ffffff' : '#131f36', borderColor: isLight ? '#ffe3d3' : 'rgba(225,29,72,0.25)' }}
                      title={`Enviar ${sticker.title}`}
                    >
                      <span className="text-3xl select-none group-hover:scale-110 transition-transform">{sticker.emoji}</span>
                      <span className="text-[9px] font-bold text-[#f16b48] uppercase tracking-wider mt-1 truncate max-w-full">{sticker.badgeText || sticker.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMediaTray === 'emojis' && (
            <div className="flex-1 overflow-y-auto p-3 no-scrollbar space-y-3">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>🕒 Recientes</span>
                <div className="flex flex-wrap gap-1.5">
                  {(recentEmojis.length > 0 ? recentEmojis : DEFAULT_FREQUENT_EMOJIS).map((emoji, i) => (
                    <button
                      key={`recent-${i}`}
                      onClick={() => handleInsertEmoji(emoji)}
                      className="w-8 h-8 rounded-xl border flex items-center justify-center text-[18px] hover:scale-125 transition-transform bg-white dark:bg-[#131f36] border-[#ffe3d3] dark:border-[#f16b48]/20"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{cat.icon} {cat.name}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.emojis.map((emoji, i) => (
                      <button
                        key={`${cat.name}-${i}`}
                        onClick={() => handleInsertEmoji(emoji)}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-[18px] hover:scale-125 transition-transform bg-white dark:bg-[#131f36] border-[#ffe3d3] dark:border-[#f16b48]/20"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeMediaTray === 'gifs' && (
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 no-scrollbar">
              {QUICK_GIFS.map((gif) => (
                <div key={gif.id} onClick={() => handleSendGif(gif)} className="rounded-2xl overflow-hidden border border-[#ffe3d3] dark:border-[#f16b48]/30 cursor-pointer group relative shadow-elevation-md">
                  <img src={gif.url} alt={gif.title} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 inset-x-0 p-1 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] font-bold truncate text-center">{gif.tag}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Proponer cita + icebreakers — del diseño Premium aprobado: en vez de esconder
          "proponer cita" solo en el header/menú de adjuntos, y las ideas de conversación
          solo en la bandeja "Ideas", se muestra un atajo persistente arriba del input
          (igual que Conversation.dc.html), sin sacar los accesos que ya existían. */}
      {!activeMediaTray && !showAttachmentMenu && !inChatSearchOpen && (
        <div className="shrink-0 flex flex-col gap-2 px-3 pt-2 relative z-10">
          {onOpenProposeModal && (
            <button
              type="button"
              onClick={() => { sounds.playStamp(); onOpenProposeModal(activeMatch.id); }}
              className={`flex items-center justify-center gap-1.5 h-9 rounded-full border-[1.5px] text-[12.5px] font-bold transition-colors ${
                isLight ? 'border-[#f16b48] text-[#f16b48] hover:bg-[#f16b48]/5' : 'border-[#f16b48] text-[#ffb295] hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">local_cafe</span>
              Proponer cita
            </button>
          )}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {conversationSparkChips.map((spark, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { sounds.playClick(); setInputText(spark); inputRef.current?.focus(); }}
                className={`shrink-0 h-[30px] px-3 rounded-full border text-[11.5px] font-semibold whitespace-nowrap transition-colors ${
                  isLight ? 'bg-white border-[#ffe3d3] text-[#f16b48]' : 'bg-[#131f36] border-[#f16b48]/25 text-[#ffb295]'
                }`}
              >
                {spark}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className={`border-t p-2 relative z-30 shrink-0 liquid-glass ${isLight ? 'bg-white/55 border-[#ffe3d3]/60' : 'bg-[#0f1a2e]/55 border-[#f16b48]/20'}`}>
        {replyingTo && (
          <div className={`flex items-center gap-2 mb-1.5 pl-3 pr-1.5 py-1.5 rounded-2xl border-l-4 border animate-fadeIn ${
            isLight ? 'bg-white border-l-[#f16b48] border-[#ffe3d3]' : 'bg-[#131f36] border-l-[#f16b48] border-[#f16b48]/25'
          }`}>
            <div className="flex-1 min-w-0">
              <span className="block text-[10.5px] font-bold text-[#f16b48]">
                Respondiendo a {replyingTo.senderId === user?.id ? 'vos' : partner.displayName}
              </span>
              <span className={`block text-[12px] truncate ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/80'}`}>
                {replyingTo.type === 'IMAGE' ? '📷 Foto' : replyingTo.body}
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setReplyingTo(null); sounds.playClick(); }}
              className={`h-7 w-7 shrink-0 flex items-center justify-center rounded-full ${isLight ? 'text-gray-400 hover:text-[#f16b48] hover:bg-[#fcf9f2]' : 'text-[#ffb295]/60 hover:text-[#ffb295] hover:bg-white/5'}`}
              aria-label="Cancelar respuesta"
              title="Cancelar respuesta"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}
        <form onSubmit={handleSendText} className="flex items-center gap-1.5" autoComplete="off">
          <div className={`flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-elevation-sm transition-colors ${isLight ? 'bg-white border-[#ffe3d3] focus-within:border-[#f16b48]' : 'bg-[#131f36] border-[#f16b48]/30 focus-within:border-[#ffb295]'}`}>
            <button
              type="button"
              onClick={() => { sounds.playClick(); setActiveMediaTray(activeMediaTray ? null : 'stickers'); setShowAttachmentMenu(false); }}
              className={`text-[#5b6478] hover:text-[#f16b48] transition-colors focus:outline-none ${activeMediaTray ? 'text-[#f16b48]' : ''}`}
              title="Stickers y Emojis"
            >
              <span className="material-symbols-outlined text-[21px] block">{activeMediaTray ? 'keyboard' : 'sentiment_satisfied'}</span>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); pingTyping(); }}
              onFocus={() => { if (activeMediaTray) setActiveMediaTray(null); }}
              placeholder="Mensaje"
              className={`flex-1 bg-transparent text-[13px] font-body-sm focus:outline-none ${isLight ? 'text-[#16223b] placeholder:text-gray-400' : 'text-[#f5f1e8] placeholder:text-[#ffb295]/40'}`}
            />
            <button
              type="button"
              onClick={() => { sounds.playClick(); setShowAttachmentMenu(!showAttachmentMenu); setActiveMediaTray(null); }}
              className={`text-[#5b6478] hover:text-[#f16b48] transition-colors focus:outline-none ${showAttachmentMenu ? 'text-[#f16b48]' : ''}`}
              title="Adjuntar"
            >
              <span className="material-symbols-outlined text-[20px] block">attach_file</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f16b48] to-[#ff8a65] text-white flex items-center justify-center tactile-btn shadow-elevation-md hover:brightness-105 transition-transform active:scale-95 shrink-0 disabled:opacity-40"
            title="Enviar mensaje"
          >
            <span className="material-symbols-outlined text-[19px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </form>
      </div>

      {/* Sticker detail modal */}
      {selectedStickerDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-xs rounded-3xl p-5 border shadow-2xl flex flex-col items-center text-center animate-scaleUp ${isLight ? 'bg-white border-[#ffe3d3] text-[#16223b]' : 'bg-[#0f1a2e] border-[#f16b48]/40 text-[#f5f1e8]'}`}>
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#fcf9f2] to-white dark:from-[#17233d] dark:to-[#0f1a2e] border-2 border-[#f16b48]/40 shadow-xl flex items-center justify-center text-6xl mb-3">
              {selectedStickerDetail.emoji}
            </div>
            <h3 className="font-headline-md text-[16px] font-bold mb-3">{selectedStickerDetail.title}</h3>
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={() => { handleSendSticker(selectedStickerDetail); setSelectedStickerDetail(null); }} className="w-full bg-gradient-to-r from-[#f16b48] to-[#ff8a65] text-white font-bold h-9 rounded-2xl shadow-elevation-md">
                Enviar Sticker al chat
              </Button>
              <Button variant="outline" onClick={() => handleToggleFavoriteSticker(selectedStickerDetail.id)} className="w-full h-9 rounded-2xl flex items-center justify-center gap-1.5 text-[12px]">
                <span className="material-symbols-outlined text-[16px] text-amber-500">{favoriteStickerIds.includes(selectedStickerDetail.id) ? 'star' : 'star_border'}</span>
                <span>{favoriteStickerIds.includes(selectedStickerDetail.id) ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}</span>
              </Button>
              <Button variant="ghost" onClick={() => setSelectedStickerDetail(null)} className="w-full h-8 text-[12px] opacity-70">Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact info drawer */}
      {showContactInfoDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className={`w-full max-w-sm h-full overflow-y-auto p-5 border-l flex flex-col justify-between animate-slideLeft ${isLight ? 'bg-white border-[#ffe3d3] text-[#16223b]' : 'bg-[#0f1a2e] border-[#f16b48]/40 text-[#f5f1e8]'}`}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-[16px] font-bold">Info. del contacto</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowContactInfoDrawer(false)} className="rounded-full" aria-label="Cerrar">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
                </Button>
              </div>
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="w-24 h-24 border-2 border-[#f16b48] shadow-xl mb-3">
                  <AvatarImage src={partner.photos[0]?.url} alt={partner.displayName} />
                  <AvatarFallback>{partner.displayName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-headline-md text-xl font-bold">{partner.displayName}, {partner.age}</h2>
                  {partner.badges.trusted && <span className="material-symbols-outlined text-[#f16b48] text-[18px]" title="Citas verificadas">verified</span>}
                  {partner.badges.verified && <span className="material-symbols-outlined text-sky-400 text-[18px]" title="Identidad verificada">verified</span>}
                </div>
                <p className="text-[11px] text-[#f16b48] font-bold">{partner.city}</p>
              </div>
              <div className={`p-3 rounded-2xl border mb-4 ${isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#131f36] border-[#f16b48]/30'}`}>
                <span className="font-label-caps text-[9px] text-[#f16b48] font-bold uppercase tracking-wider block mb-1">ESTADO EN MELY</span>
                <p className="text-[12.5px] italic">"{partner.bio || 'Sin bio todavía.'}"</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-3 rounded-2xl border text-center border-black/10 dark:border-white/10">
                  <span className="text-xl font-bold text-[#f16b48] block">{partner.membership.tierLabel}</span>
                  <span className="text-[10px] uppercase font-bold opacity-70">Membresía</span>
                </div>
                <div className="p-3 rounded-2xl border text-center border-black/10 dark:border-white/10">
                  <span className="text-xl font-bold text-emerald-500 block">{activeMatch.verifiedDateCount}</span>
                  <span className="text-[10px] uppercase font-bold opacity-70">Citas verificadas</span>
                </div>
              </div>
            </div>
            <Button onClick={() => { setShowContactInfoDrawer(false); onOpenProposeModal?.(activeMatch.id); }} className="w-full bg-gradient-to-r from-[#f16b48] to-[#ff8a65] text-white font-bold h-10 rounded-2xl shadow-elevation-md">
              Proponer Cita a {partner.displayName}
            </Button>
          </div>
        </div>
      )}

      {/* Theme customizer */}
      {showThemeCustomizer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className={`w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 border shadow-2xl flex flex-col justify-between animate-scaleUp no-scrollbar ${isLight ? 'bg-white border-[#ffe3d3] text-[#16223b]' : 'bg-[#0f1a2e] border-[#f16b48]/40 text-[#f5f1e8]'}`}>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
                <h3 className="font-headline-md text-[16px] font-bold">Personalizar Chat</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowThemeCustomizer(false)} className="rounded-full h-8 w-8" aria-label="Cerrar">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
                </Button>
              </div>

              <div className="mb-5">
                <span className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-[#f16b48] block mb-2">VISTA PREVIA EN VIVO</span>
                <div className="p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-2.5 shadow-inner" style={getWallpaperStyle()}>
                  <div className="flex justify-start">
                    <div className={`p-2.5 max-w-[80%] rounded-[20px] ${getPartnerBubbleClass()}`}>
                      <p className="text-[12px] font-medium leading-tight">¿Qué te parece este color para el chat? ☕</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div style={customColor ? { backgroundColor: customColor } : undefined} className={`p-2.5 max-w-[80%] rounded-[20px] ${getUserBubbleClass()}`}>
                      <p className="text-[12px] font-medium leading-tight">¡Me encanta! Queda súper estético ✨</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <span className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-[#f16b48] block mb-2">PALETAS & TEMAS MELY</span>
                <div className="grid grid-cols-2 gap-2">
                  {CHAT_THEME_PRESETS.map((preset) => {
                    const isSelected = selectedThemeId === preset.id && !customColor;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyTheme(preset.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-1.5 ${
                          isSelected ? isLight ? 'border-[#f16b48] bg-[#fcf9f2] ring-2 ring-[#f16b48]/30' : 'border-[#f16b48] bg-[#17233d] ring-2 ring-[#f16b48]/40' : isLight ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-bold truncate">{preset.previewBadge}</span>
                          <span className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-elevation-sm shrink-0" style={{ backgroundColor: preset.accentColor }} />
                        </div>
                        <p className="text-[10px] opacity-75 line-clamp-1">{preset.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-5">
                <span className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-[#f16b48] block mb-2">TEXTURA Y PATRÓN DE FONDO</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'dots', label: 'Puntos', icon: 'blur_on' },
                    { id: 'grid', label: 'Cuadrícula', icon: 'grid_view' },
                    { id: 'stars', label: 'Estrellas', icon: 'auto_awesome' },
                    { id: 'warm', label: 'Cálido', icon: 'local_cafe' },
                    { id: 'clean', label: 'Liso', icon: 'crop_square' },
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() => handleApplyPattern(pat.id as 'dots' | 'grid' | 'stars' | 'clean' | 'warm')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all text-center ${
                        customPattern === pat.id ? 'border-[#f16b48] bg-[#f16b48]/10 text-[#f16b48] font-bold' : 'border-black/10 dark:border-white/10 opacity-70'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{pat.icon}</span>
                      <span className="text-[9.5px] truncate">{pat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <span className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-[#f16b48] block mb-2">COLOR PERSONALIZADO DE BURBUJAS</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {['#f16b48', '#d4552f', '#b98fd1', '#b98fd1', '#3f7a5c', '#2e5570', '#2e5570', '#e3b873', '#e3b873', '#ff8a65', '#2e5570'].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => handleApplyCustomColor(hex)}
                      className={`w-7 h-7 rounded-full transition-transform border-2 flex items-center justify-center ${customColor.toLowerCase() === hex.toLowerCase() ? 'scale-125 border-white ring-2 ring-[#f16b48]' : 'border-white/30'}`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                  <label className="relative w-7 h-7 rounded-full border-2 border-dashed border-gray-400 hover:border-[#f16b48] flex items-center justify-center cursor-pointer" title="Elegir color exacto">
                    <span className="material-symbols-outlined text-[14px] opacity-70">colorize</span>
                    <input type="color" value={customColor || currentTheme.accentColor} onChange={(e) => handleApplyCustomColor(e.target.value)} className="sr-only" />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-black/10 dark:border-white/10 mt-3">
              <Button variant="outline" onClick={() => { sounds.playClick(); handleApplyTheme('mely-cherry'); }} className="flex-1 h-9 rounded-2xl text-[11.5px]">Por Defecto</Button>
              <Button onClick={() => { sounds.playStamp(); setShowThemeCustomizer(false); }} className="flex-1 bg-gradient-to-r from-[#f16b48] to-[#ff8a65] text-white font-bold h-9 rounded-2xl shadow-elevation-md text-[11.5px]">Aplicar y Guardar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Consejos de seguridad — del diseño Premium aprobado. */}
      {showSafetyTips && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className={`w-full max-w-sm max-h-[85dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 border shadow-2xl animate-scaleUp no-scrollbar ${isLight ? 'bg-white border-[#ffe3d3] text-[#16223b]' : 'bg-[#0f1a2e] border-[#f16b48]/40 text-[#f5f1e8]'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#f16b48]">shield</span>
                <h3 className="font-headline-md text-[16px] font-bold">Consejos de seguridad</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowSafetyTips(false)} className="rounded-full h-8 w-8" aria-label="Cerrar">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
              </Button>
            </div>
            <p className={`text-[12px] mb-4 ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/70'}`}>
              Antes de encontrarte con {partner.displayName}, tené en cuenta estas recomendaciones de MELY.
            </p>
            <div className="flex flex-col gap-3 mb-2">
              {SAFETY_TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isLight ? 'bg-[#fcf9f2]' : 'bg-[#131f36]'}`}>
                    <span className="material-symbols-outlined text-[16px] text-[#f16b48]">{tip.icon}</span>
                  </span>
                  <p className="text-[12.5px] leading-relaxed pt-1.5">{tip.text}</p>
                </div>
              ))}
            </div>
            <Button onClick={() => setShowSafetyTips(false)} className="w-full mt-2 bg-gradient-to-r from-[#f16b48] to-[#ff8a65] text-white font-bold h-10 rounded-2xl shadow-elevation-md">
              Entendido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
