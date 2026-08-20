import React, { useState, useRef, useEffect } from 'react';
import { ChatThread, Profile, Message, DateProposal } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';

interface MessagesViewProps {
  threads: ChatThread[];
  activeThreadId: string;
  matches?: Profile[];
  onSelectThread: (threadId: string) => void;
  onSendMessage: (threadId: string, messageData: string | Partial<Message>) => void;
  onAcceptDate?: (threadId: string, dateId: string) => void;
  onVerifyDate?: (threadId: string, dateId: string) => void;
  onOpenProposeModal?: (threadId: string) => void;
}

// WhatsApp / MELY Sticker Definition
export interface WhatsAppSticker {
  id: string;
  packId: string;
  title: string;
  emoji: string;
  imageUrl?: string;
  badgeText?: string;
  gradient?: string;
  category: string;
}

// Chat Themes & Customization
export interface ChatThemePreset {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  userBubbleLight: string;
  userBubbleDark: string;
  wallpaperPattern: 'dots' | 'grid' | 'stars' | 'clean' | 'warm';
  previewBadge: string;
}

export const CHAT_THEME_PRESETS: ChatThemePreset[] = [
  {
    id: 'mely-cherry',
    name: 'MELY Carmesí & Cereza',
    description: 'El estilo original y apasionado de MELY',
    accentColor: '#e11d48',
    userBubbleLight: 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white border border-[#fda4af]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#be123c] to-[#e11d48] text-white border border-[#e11d48]/40',
    wallpaperPattern: 'dots',
    previewBadge: '🌹 Cereza',
  },
  {
    id: 'lavender-cyber',
    name: 'Lavanda & Cyber Romance',
    description: 'Tonos violetas, misterio y poesía contemporánea',
    accentColor: '#9333ea',
    userBubbleLight: 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white border border-[#d8b4fe]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#581c87] to-[#7e22ce] text-white border border-[#9333ea]/40',
    wallpaperPattern: 'stars',
    previewBadge: '🔮 Lavanda',
  },
  {
    id: 'emerald-san-telmo',
    name: 'Esmeralda & San Telmo',
    description: 'Frescura botánica y elegancia porteña',
    accentColor: '#059669',
    userBubbleLight: 'bg-gradient-to-r from-[#059669] to-[#10b981] text-white border border-[#a7f3d0]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#064e3b] to-[#047857] text-white border border-[#059669]/40',
    wallpaperPattern: 'grid',
    previewBadge: '🌿 Esmeralda',
  },
  {
    id: 'amber-espresso',
    name: 'Café de Especialidad & Caramelo',
    description: 'Cálido, tostado y perfecto para planear una cita',
    accentColor: '#d97706',
    userBubbleLight: 'bg-gradient-to-r from-[#b45309] to-[#d97706] text-white border border-[#fde68a]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#78350f] to-[#92400e] text-white border border-[#d97706]/40',
    wallpaperPattern: 'warm',
    previewBadge: '☕ Caramelo',
  },
  {
    id: 'sunset-porteno',
    name: 'Atardecer Porteño & Coral',
    description: 'Colores del cielo de Buenos Aires a las 7 PM',
    accentColor: '#ea580c',
    userBubbleLight: 'bg-gradient-to-r from-[#ea580c] to-[#f43f5e] text-white border border-[#fed7aa]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#9a3412] to-[#be123c] text-white border border-[#ea580c]/40',
    wallpaperPattern: 'dots',
    previewBadge: '🌅 Atardecer',
  },
  {
    id: 'midnight-sapphire',
    name: 'Zafiro & Noche de Jazz',
    description: 'Azul profundo, introspección y serenidad',
    accentColor: '#0284c7',
    userBubbleLight: 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white border border-[#bae6fd]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#0c4a6e] to-[#0369a1] text-white border border-[#0284c7]/40',
    wallpaperPattern: 'stars',
    previewBadge: '🌌 Zafiro',
  },
  {
    id: 'malbec-bodegon',
    name: 'Vino Malbec & Bodegón',
    description: 'Rojo borgoña intenso, ideal para cenas íntimas',
    accentColor: '#881337',
    userBubbleLight: 'bg-gradient-to-r from-[#881337] to-[#be123c] text-white border border-[#fecdd3]/30',
    userBubbleDark: 'bg-gradient-to-r from-[#4c0519] to-[#881337] text-white border border-[#9f1239]/40',
    wallpaperPattern: 'warm',
    previewBadge: '🍷 Malbec',
  },
  {
    id: 'minimal-clean',
    name: 'Minimalista & Blanco Puro',
    description: 'Limpio, sobrio y con máxima legibilidad',
    accentColor: '#475569',
    userBubbleLight: 'bg-[#1e293b] text-white border border-gray-300',
    userBubbleDark: 'bg-[#334155] text-white border border-slate-600',
    wallpaperPattern: 'clean',
    previewBadge: '◻️ Minimal',
  },
];

// Curated Sticker Collections (WhatsApp style packs)
const STICKER_PACKS = [
  {
    id: 'pack-romance',
    name: 'MELY Romance & Café',
    icon: '☕',
    description: 'Stickers ilustrados de citas, café de especialidad y amor',
    stickers: [
      { id: 'stk-coffee', packId: 'pack-romance', title: '¿Pinta café?', emoji: '☕', badgeText: 'CAFÉ ☕', gradient: 'from-amber-700 to-amber-900', category: 'romance' },
      { id: 'stk-wine', packId: 'pack-romance', title: 'Brindis Malbec', emoji: '🍷', badgeText: 'VINITO 🍷', gradient: 'from-rose-800 to-red-950', category: 'romance' },
      { id: 'stk-spark', packId: 'pack-romance', title: 'Sparks mutuos', emoji: '✨', badgeText: 'SPARK ✨', gradient: 'from-amber-400 to-rose-500', category: 'romance' },
      { id: 'stk-heart', packId: 'pack-romance', title: 'Flechazo', emoji: '💖', badgeText: 'LOVE 💖', gradient: 'from-rose-500 to-pink-600', category: 'romance' },
      { id: 'stk-fire', packId: 'pack-romance', title: 'Fuego puro', emoji: '🔥', badgeText: 'FUEGO 🔥', gradient: 'from-orange-500 to-red-600', category: 'romance' },
      { id: 'stk-mate', packId: 'pack-romance', title: 'Unos mates', emoji: '🧉', badgeText: 'MATES 🧉', gradient: 'from-emerald-700 to-green-900', category: 'romance' },
      { id: 'stk-croissant', packId: 'pack-romance', title: 'Medialuna', emoji: '🥐', badgeText: 'MEDIALUNA 🥐', gradient: 'from-amber-500 to-yellow-600', category: 'romance' },
      { id: 'stk-rose', packId: 'pack-romance', title: 'Rosa roja', emoji: '🌹', badgeText: 'PARA VOS 🌹', gradient: 'from-red-600 to-rose-900', category: 'romance' },
      { id: 'stk-letter', packId: 'pack-romance', title: 'Carta sellada', emoji: '💌', badgeText: 'SECRETO 💌', gradient: 'from-pink-500 to-rose-700', category: 'romance' },
      { id: 'stk-vinyl', packId: 'pack-romance', title: 'Vinilo sonando', emoji: '🎶', badgeText: 'VINILO 🎶', gradient: 'from-slate-800 to-black', category: 'romance' },
      { id: 'stk-camera', packId: 'pack-romance', title: 'Foto 35mm', emoji: '📸', badgeText: 'ANÁLOGICA 📸', gradient: 'from-stone-700 to-stone-900', category: 'romance' },
      { id: 'stk-star', packId: 'pack-romance', title: 'Estrella VIP', emoji: '⭐', badgeText: 'FACHERO ⭐', gradient: 'from-yellow-400 to-amber-600', category: 'romance' },
    ],
  },
  {
    id: 'pack-cats',
    name: 'Gatitos & Reacciones',
    icon: '🐱',
    description: 'Gatitos tiernos y expresivos para tus charlas',
    stickers: [
      { id: 'cat-love', packId: 'pack-cats', title: 'Gato Enamorado', emoji: '😻', badgeText: 'TE QUIERO 😻', gradient: 'from-pink-400 to-rose-600', category: 'cats' },
      { id: 'cat-coffee', packId: 'pack-cats', title: 'Gato con Café', emoji: '☕🐱', badgeText: 'DESPERTANDO ☕', gradient: 'from-amber-600 to-amber-800', category: 'cats' },
      { id: 'cat-kiss', packId: 'pack-cats', title: 'Besito Gatuno', emoji: '😽', badgeText: 'BESITO 😽', gradient: 'from-rose-400 to-pink-500', category: 'cats' },
      { id: 'cat-laugh', packId: 'pack-cats', title: 'Tentado', emoji: '😹', badgeText: 'JAJAJA 😹', gradient: 'from-yellow-400 to-orange-500', category: 'cats' },
      { id: 'cat-cool', packId: 'pack-cats', title: 'Gato con Fachero', emoji: '😎🐱', badgeText: 'ALTA FACHA 😎', gradient: 'from-blue-600 to-indigo-800', category: 'cats' },
      { id: 'cat-shock', packId: 'pack-cats', title: 'Sorprendido', emoji: '🙀', badgeText: '¿QUÉ? 🙀', gradient: 'from-purple-600 to-indigo-700', category: 'cats' },
      { id: 'cat-pout', packId: 'pack-cats', title: 'Puchero', emoji: '😿', badgeText: 'PUCHERO 😿', gradient: 'from-cyan-600 to-blue-700', category: 'cats' },
      { id: 'cat-paw', packId: 'pack-cats', title: 'Huellitas', emoji: '🐾', badgeText: 'PASO A PASO 🐾', gradient: 'from-teal-600 to-emerald-800', category: 'cats' },
    ],
  },
  {
    id: 'pack-porteno',
    name: 'Frases & Memes Porteños',
    icon: '🇦🇷',
    description: 'Frases clásicas de Buenos Aires y salidas',
    stickers: [
      { id: 'fr-deuna', packId: 'pack-porteno', title: '¡De una!', emoji: '🚀', badgeText: '¡DE UNA! 🚀', gradient: 'from-rose-600 to-red-700', category: 'porteno' },
      { id: 'fr-vamos', packId: 'pack-porteno', title: '¿Vamos?', emoji: '✨', badgeText: 'CHE, ¿VAMOS? ✨', gradient: 'from-fuchsia-600 to-pink-700', category: 'porteno' },
      { id: 'fr-planeta', packId: 'pack-porteno', title: 'De otro planeta', emoji: '🪐', badgeText: 'DE OTRO PLANETA 🪐', gradient: 'from-indigo-600 to-purple-800', category: 'porteno' },
      { id: 'fr-banco', packId: 'pack-porteno', title: 'Banco fuerte', emoji: '💪', badgeText: 'BANCO FUERTE 💪', gradient: 'from-emerald-600 to-teal-800', category: 'porteno' },
      { id: 'fr-vinito', packId: 'pack-porteno', title: 'Un vinito y vemos', emoji: '🍷', badgeText: 'UN VINITO Y VEMOS 🍷', gradient: 'from-purple-900 to-rose-950', category: 'porteno' },
      { id: 'fr-abrazo', packId: 'pack-porteno', title: 'Abrazo de gol', emoji: '⚽', badgeText: 'ABRAZO DE GOL ⚽', gradient: 'from-sky-600 to-blue-800', category: 'porteno' },
      { id: 'fr-camino', packId: 'pack-porteno', title: 'En camino', emoji: '🛵', badgeText: '¡EN CAMINO! 🛵', gradient: 'from-amber-600 to-orange-700', category: 'porteno' },
      { id: 'fr-facha', packId: 'pack-porteno', title: 'Tremenda facha', emoji: '🕶️', badgeText: 'TREMENDA FACHA 🕶️', gradient: 'from-slate-700 to-slate-950', category: 'porteno' },
    ],
  },
  {
    id: 'pack-stamps',
    name: 'Sellos & Pasaporte MELY',
    icon: '🎫',
    description: 'Sellos oficiales del pasaporte físico',
    stickers: [
      { id: 'stk-approved', packId: 'pack-stamps', title: 'Sello Aprobado', emoji: '💮', badgeText: 'VERIFICADO MELY 💮', gradient: 'from-rose-600 to-red-800', category: 'stamps' },
      { id: 'stk-cuervo', packId: 'pack-stamps', title: 'Cuervo Café', emoji: '☕', badgeText: 'CUERVO CAFÉ ☕', gradient: 'from-amber-700 to-amber-950', category: 'stamps' },
      { id: 'stk-malba', packId: 'pack-stamps', title: 'MALBA Cine', emoji: '🏛️', badgeText: 'MALBA CINE 🏛️', gradient: 'from-blue-700 to-slate-900', category: 'stamps' },
      { id: 'stk-goldpass', packId: 'pack-stamps', title: 'Pase de Honor', emoji: '👑', badgeText: 'GOLDEN MATCH 👑', gradient: 'from-amber-500 to-yellow-600', category: 'stamps' },
    ],
  },
];

const EMOJI_CATEGORIES = [
  { name: 'Frecuentes', icon: '🕒', emojis: ['☕', '🍷', '✨', '❤️', '🔥', '😂', '🇦🇷', '🥐', '🎶', '😻', '🚀', '🥐'] },
  { name: 'Caritas & Expresiones', icon: '😊', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😎', '🥳', '🤩'] },
  { name: 'Romance & Amor', icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💖', '💗', '💓', '💞', '💕', '💌', '💍', '💐', '🌹', '🥀', '💋'] },
  { name: 'Café, Vino & Comida', icon: '☕', emojis: ['☕', '🍵', '🧋', '🍷', '🍸', '🍹', '🍺', '🍻', '🥐', '🥯', '🥖', '🥨', '🥞', '🧇', '🍕', '🥪', '🍰', '🍫', '🍓', '🍇'] },
  { name: 'Lugares & Viajes', icon: '🇦🇷', emojis: ['🇦🇷', '✈️', '🛵', '🚕', '🏛️', '🎭', '🎨', '🎬', '🌃', '🌆', '🌅', '🏖️', '⛰️', '🏕️', '🎟️', '🎫', '📷', '📸', '📻', '🎸'] },
];

const QUICK_GIFS = [
  { id: 'gif-1', title: 'Brindis', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=300&q=80', tag: '🍷 Salud' },
  { id: 'gif-2', title: 'Café Filtro', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80', tag: '☕ Café' },
  { id: 'gif-3', title: 'Flores', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=300&q=80', tag: '🌹 Ramo' },
  { id: 'gif-4', title: 'Vinilo', url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=300&q=80', tag: '🎵 Música' },
];

const CONVERSATION_SPARKS = [
  '☕ ¿Te pinta un café de especialidad esta semana?',
  '🍷 ¡De una! Conozco un bodegón hermoso en San Telmo.',
  '🎵 ¿Qué vinilos estás escuchando últimamente?',
  '🎨 ¿Conocés la muestra nueva del MALBA?',
  '🥐 ¿Merienda o vermut al atardecer?',
];

export const MessagesView: React.FC<MessagesViewProps> = ({
  threads,
  activeThreadId,
  matches = [],
  onSelectThread,
  onSendMessage,
  onAcceptDate,
  onVerifyDate,
  onOpenProposeModal,
}) => {
  const { isLight } = useTheme();
  
  // Navigation mode: 'inbox' (WhatsApp chats list) or 'chat' (active chat conversation)
  const [viewMode, setViewMode] = useState<'inbox' | 'chat'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  
  // WhatsApp Bottom Tray Tabs: 'emojis' | 'stickers' | 'gifs' | null
  const [activeMediaTray, setActiveMediaTray] = useState<'emojis' | 'stickers' | 'gifs' | null>(null);
  const [selectedStickerPackId, setSelectedStickerPackId] = useState<string>('pack-romance');
  const [favoriteStickerIds, setFavoriteStickerIds] = useState<string[]>(['stk-coffee', 'stk-spark', 'cat-love', 'fr-deuna']);
  const [customStickerText, setCustomStickerText] = useState('');
  const [customStickerEmoji, setCustomStickerEmoji] = useState('✨');
  
  // Attachment menu toggle
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  
  // Message contextual state
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [activeReactionMenuMsgId, setActiveReactionMenuMsgId] = useState<string | null>(null);
  const [activeOptionsMenuMsgId, setActiveOptionsMenuMsgId] = useState<string | null>(null);
  const [selectedStickerDetail, setSelectedStickerDetail] = useState<WhatsAppSticker | null>(null);
  
  // In-chat search
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [inChatSearchTerm, setInChatSearchTerm] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'dates'>('all');
  
  // Header dropdown menu
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showContactInfoDrawer, setShowContactInfoDrawer] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  
  // Chat Custom Theme & Color state
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
      return (localStorage.getItem('mely_chat_wallpaper_pattern') as any) || 'dots';
    } catch {
      return 'dots';
    }
  });

  const currentTheme = CHAT_THEME_PRESETS.find((t) => t.id === selectedThemeId) || CHAT_THEME_PRESETS[0];

  // Dynamic wallpaper helper
  const getWallpaperStyle = (): React.CSSProperties => {
    const accent = customColor || currentTheme.accentColor;
    switch (customPattern) {
      case 'grid':
        return {
          backgroundImage: isLight
            ? `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, #f8fafc 1px)`
            : `linear-gradient(to right, rgba(225,29,72,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(225,29,72,0.12) 1px, #0a0507 1px)`,
          backgroundSize: '24px 24px',
        };
      case 'stars':
        return {
          backgroundImage: isLight
            ? `radial-gradient(circle at 50% 50%, rgba(147,51,234,0.06) 0%, transparent 60%), radial-gradient(${accent} 0.5px, transparent 0.5px), radial-gradient(#cbd5e1 0.5px, #faf5ff 0.5px)`
            : `radial-gradient(circle at 50% 50%, rgba(147,51,234,0.15) 0%, transparent 70%), radial-gradient(#d8b4fe 0.6px, transparent 0.6px), radial-gradient(#3b0764 0.6px, #07030a 0.6px)`,
          backgroundSize: '100% 100%, 28px 28px, 14px 14px',
        };
      case 'warm':
        return {
          backgroundImage: isLight
            ? `radial-gradient(circle at 20% 20%, rgba(217,119,6,0.08) 0%, transparent 50%), radial-gradient(${accent} 0.5px, #faf6f0 0.5px)`
            : `radial-gradient(circle at 20% 20%, rgba(217,119,6,0.15) 0%, transparent 60%), radial-gradient(#92400e 0.6px, #0d0603 0.6px)`,
          backgroundSize: '100% 100%, 22px 22px',
        };
      case 'clean':
        return {
          backgroundColor: isLight ? '#f8fafc' : '#0a0608',
        };
      case 'dots':
      default:
        return {
          backgroundImage: isLight
            ? `radial-gradient(${accent} 0.45px, transparent 0.45px), radial-gradient(#cbd5e1 0.45px, #fcf8f6 0.45px)`
            : `radial-gradient(${accent} 0.5px, transparent 0.5px), radial-gradient(#26121b 0.5px, #0e070a 0.5px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        };
    }
  };

  const getUserBubbleClass = () => {
    if (customColor) {
      return 'text-white rounded-2xl rounded-tr-sm shadow-md border border-white/20';
    }
    return isLight ? currentTheme.userBubbleLight : currentTheme.userBubbleDark;
  };

  const getPartnerBubbleClass = () => {
    return isLight
      ? 'bg-white text-[#0f172a] rounded-2xl rounded-tl-sm border border-[#fecdd3] shadow-sm'
      : 'bg-[#1a0e15] text-[#fff1f2] rounded-2xl rounded-tl-sm border border-[#e11d48]/25 shadow-sm';
  };

  const handleApplyTheme = (themeId: string) => {
    sounds.playClick();
    setSelectedThemeId(themeId);
    setCustomColor('');
    const matched = CHAT_THEME_PRESETS.find((t) => t.id === themeId);
    if (matched) {
      setCustomPattern(matched.wallpaperPattern);
      try {
        localStorage.setItem('mely_chat_wallpaper_pattern', matched.wallpaperPattern);
      } catch {}
    }
    try {
      localStorage.setItem('mely_chat_theme_id', themeId);
      localStorage.removeItem('mely_chat_custom_color');
    } catch {}
  };

  const handleApplyCustomColor = (colorHex: string) => {
    sounds.playClick();
    setCustomColor(colorHex);
    try {
      localStorage.setItem('mely_chat_custom_color', colorHex);
    } catch {}
  };

  const handleApplyPattern = (pattern: 'dots' | 'grid' | 'stars' | 'clean' | 'warm') => {
    sounds.playClick();
    setCustomPattern(pattern);
    try {
      localStorage.setItem('mely_chat_wallpaper_pattern', pattern);
    } catch {}
  };
  
  // Call Modals Simulation
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  
  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [playbackSpeeds, setPlaybackSpeeds] = useState<Record<string, number>>({});
  
  // Voice Recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  
  // Partner typing simulation
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  
  // Local reactions override
  const [localReactions, setLocalReactions] = useState<Record<string, string>>({});
  
  // Starred messages
  const [starredMsgIds, setStarredMsgIds] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recordTimerRef = useRef<number | null>(null);
  const callTimerRef = useRef<number | null>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || {
    id: 'default',
    partnerId: 'default',
    partnerName: 'VALENTINA',
    partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    partnerOnline: true,
    lastMessage: '',
    lastMessageTime: '',
    unread: false,
    messages: [],
    partnerCity: 'Palermo Soho, CABA',
    partnerOccupation: 'Diseño & Curaduría',
    partnerBio: 'Amante de las buenas charlas, el café de especialidad y la fotografía analógica.',
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (viewMode === 'chat') {
      scrollToBottom('auto');
    }
  }, [viewMode, activeThread.id]);

  useEffect(() => {
    if (viewMode === 'chat') {
      scrollToBottom('smooth');
    }
  }, [activeThread.messages.length, isPartnerTyping, activeMediaTray]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Call timer simulation
  useEffect(() => {
    if (activeCallType) {
      setCallDuration(0);
      callTimerRef.current = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCallType]);

  const handleOpenConversation = (threadId: string) => {
    sounds.playClick();
    onSelectThread(threadId);
    setViewMode('chat');
    setActiveMediaTray(null);
    setShowAttachmentMenu(false);
  };

  // SEND TEXT MESSAGE
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend) return;

    sounds.playClick();
    const messagePayload: Partial<Message> = {
      text: textToSend,
      type: 'text',
      replyTo: replyingToMessage ? {
        id: replyingToMessage.id,
        sender: replyingToMessage.sender === 'user' ? 'Vos' : activeThread.partnerName,
        text: replyingToMessage.text || (replyingToMessage.type === 'sticker' ? '👾 Sticker' : '📷 Foto'),
      } : undefined,
    };

    setInputText('');
    setReplyingToMessage(null);
    setActiveMediaTray(null);
    setShowAttachmentMenu(false);

    onSendMessage(activeThread.id, messagePayload);

    // Partner typing animation simulation
    setTimeout(() => {
      setIsPartnerTyping(true);
      setTimeout(() => {
        setIsPartnerTyping(false);
      }, 1600);
    }, 400);

    inputRef.current?.focus();
  };

  // SEND STICKER
  const handleSendSticker = (sticker: WhatsAppSticker) => {
    sounds.playStamp();
    const messagePayload: Partial<Message> = {
      type: 'sticker',
      stickerUrl: sticker.imageUrl,
      stickerAlt: `${sticker.badgeText || sticker.title}`,
      text: `${sticker.emoji} ${sticker.title}`,
      replyTo: replyingToMessage ? {
        id: replyingToMessage.id,
        sender: replyingToMessage.sender === 'user' ? 'Vos' : activeThread.partnerName,
        text: replyingToMessage.text || 'Mensaje',
      } : undefined,
    };

    setReplyingToMessage(null);
    setActiveMediaTray(null);

    onSendMessage(activeThread.id, messagePayload);

    setTimeout(() => {
      setIsPartnerTyping(true);
      setTimeout(() => {
        setIsPartnerTyping(false);
      }, 1500);
    }, 400);
  };

  // SEND CUSTOM CREATED STICKER
  const handleSendCustomSticker = () => {
    if (!customStickerText.trim()) return;
    sounds.playStamp();
    const customStk: WhatsAppSticker = {
      id: `custom-${Date.now()}`,
      packId: 'custom',
      title: customStickerText.trim(),
      emoji: customStickerEmoji,
      badgeText: `${customStickerText.toUpperCase()} ${customStickerEmoji}`,
      category: 'custom',
    };
    handleSendSticker(customStk);
    setCustomStickerText('');
  };

  // SEND QUICK GIF
  const handleSendGif = (gif: { title: string; url: string; tag: string }) => {
    sounds.playStamp();
    const messagePayload: Partial<Message> = {
      type: 'image',
      imageUrl: gif.url,
      text: `${gif.tag} (GIF)`,
    };
    setActiveMediaTray(null);
    onSendMessage(activeThread.id, messagePayload);
  };

  // SEND VOICE NOTE
  const handleSendVoice = () => {
    setIsRecordingVoice(false);
    sounds.playStamp();
    const durSec = Math.max(recordingSeconds, 3);
    const durationStr = `0:${durSec < 10 ? '0' : ''}${durSec}`;
    
    const messagePayload: Partial<Message> = {
      type: 'voice',
      audioDuration: durationStr,
      text: `Nota de voz (${durationStr})`,
    };

    onSendMessage(activeThread.id, messagePayload);

    setTimeout(() => {
      setIsPartnerTyping(true);
      setTimeout(() => {
        setIsPartnerTyping(false);
      }, 1700);
    }, 500);
  };

  // SEND LOCATION
  const handleSendLocation = () => {
    sounds.playStamp();
    setShowAttachmentMenu(false);
    const messagePayload: Partial<Message> = {
      type: 'location',
      locationName: 'Cuervo Café • Palermo Soho (Gurruchaga 1630)',
      text: '📍 Ubicación compartida: Cuervo Café • Palermo Soho',
    };
    onSendMessage(activeThread.id, messagePayload);
  };

  // SEND SAMPLE PHOTO
  const handleSendSamplePhoto = () => {
    sounds.playStamp();
    setShowAttachmentMenu(false);
    const samplePhotos = [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    ];
    const chosen = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    const messagePayload: Partial<Message> = {
      type: 'image',
      imageUrl: chosen,
      text: '📷 Foto del café de hoy',
    };
    onSendMessage(activeThread.id, messagePayload);
  };

  // TOGGLE REACTION
  const handleToggleReaction = (msgId: string, emoji: string) => {
    sounds.playClick();
    setLocalReactions((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === emoji ? '' : emoji,
    }));
    setActiveReactionMenuMsgId(null);
  };

  // TOGGLE STARRED
  const handleToggleStar = (msgId: string) => {
    sounds.playClick();
    setStarredMsgIds((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
    setActiveOptionsMenuMsgId(null);
  };

  // TOGGLE FAVORITE STICKER
  const handleToggleFavoriteSticker = (stickerId: string) => {
    sounds.playClick();
    setFavoriteStickerIds((prev) =>
      prev.includes(stickerId) ? prev.filter((id) => id !== stickerId) : [...prev, stickerId]
    );
  };

  // AUDIO PLAYBACK & SPEED TOGGLE
  const handlePlayAudio = (msgId: string) => {
    sounds.playClick();
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      const currentSpeed = playbackSpeeds[msgId] || 1;
      const playDuration = Math.round(3500 / currentSpeed);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, playDuration);
    }
  };

  const handleCycleSpeed = (msgId: string) => {
    sounds.playClick();
    const current = playbackSpeeds[msgId] || 1;
    const next = current === 1 ? 1.5 : current === 1.5 ? 2 : 1;
    setPlaybackSpeeds((prev) => ({ ...prev, [msgId]: next }));
  };

  // CALL HANDLERS
  const handleStartCall = (type: 'audio' | 'video') => {
    sounds.playClick();
    setActiveCallType(type);
    setShowHeaderMenu(false);
  };

  const handleEndCall = () => {
    sounds.playClick();
    setActiveCallType(null);
  };

  // Filtered threads for inbox search & filter tabs
  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (inboxFilter === 'unread') return t.unread;
    if (inboxFilter === 'dates') return t.messages.some((m) => m.type === 'date_proposal' || m.type === 'date_card');
    return true;
  });

  // In-chat filtered messages
  const filteredMessages = activeThread.messages.filter((m) => {
    if (!inChatSearchTerm.trim()) return true;
    const query = inChatSearchTerm.toLowerCase();
    return (
      m.text?.toLowerCase().includes(query) ||
      m.stickerAlt?.toLowerCase().includes(query) ||
      m.locationName?.toLowerCase().includes(query)
    );
  });

  // All stickers for search & packs
  const currentPack = STICKER_PACKS.find((p) => p.id === selectedStickerPackId) || STICKER_PACKS[0];
  const allStickersList = STICKER_PACKS.flatMap((p) => p.stickers);
  const favoriteStickers = allStickersList.filter((stk) => favoriteStickerIds.includes(stk.id));

  // =========================================================================
  // VIEW 1: WHATSAPP-STYLE INBOX (CHATS LIST & MATCHES STORIES)
  // =========================================================================
  if (viewMode === 'inbox') {
    return (
      <div
        id="whatsapp-inbox-container"
        className={`flex flex-col w-full h-[calc(100dvh-130px)] min-h-[500px] rounded-3xl border overflow-hidden shadow-2xl animate-fadeIn ${
          isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#0d070a] border-[#e11d48]/25'
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-3 border-b shrink-0 ${
            isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/20'
          }`}
        >
          {/* Brand & Action Header Row */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] text-white flex items-center justify-center shadow-sm shrink-0">
                <span
                  className="material-symbols-outlined text-[19px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  forum
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className={`font-headline-md text-[16px] font-bold tracking-wide truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                    MELY Chat
                  </h2>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border shrink-0"
                    style={{
                      backgroundColor: `${currentTheme.accentColor}15`,
                      color: currentTheme.accentColor,
                      borderColor: `${currentTheme.accentColor}30`,
                    }}
                  >
                    {currentTheme.name.split(' ')[0]}
                  </span>
                </div>
                <p className={`text-[10px] truncate ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                  Citas, Stickers & Cifrado Privado
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Theme Customizer Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sounds.playClick();
                  setShowThemeCustomizer(true);
                }}
                title="Personalizar colores y tema del chat"
                className={`h-8 px-2.5 rounded-2xl flex items-center gap-1.5 text-[11px] font-bold transition-all border shrink-0 ${
                  isLight
                    ? 'bg-white text-[#e11d48] border-[#fecdd3] hover:bg-[#fff1f3]'
                    : 'bg-[#1c0c13] text-[#fda4af] border-[#e11d48]/40 hover:bg-[#28101a]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-[#e11d48]">palette</span>
                <span className="hidden xs:inline">Temas</span>
              </Button>

              {/* New Chat Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  sounds.playClick();
                  if (threads.length > 0) handleOpenConversation(threads[0].id);
                }}
                title="Abrir conversación activa"
                className={`h-8 w-8 rounded-full shrink-0 ${
                  isLight ? 'text-[#e11d48] hover:bg-[#fff1f3]' : 'text-[#fda4af] hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  chat_add_on
                </span>
              </Button>
            </div>
          </div>

          {/* Search bar with Clear button */}
          <div className="relative flex items-center mb-2">
            <span className={`material-symbols-outlined absolute left-3 text-[18px] pointer-events-none ${isLight ? 'text-[#94a3b8]' : 'text-[#fda4af]/50'}`}>
              search
            </span>
            <input
              id="whatsapp-inbox-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar un chat o mensaje..."
              className={`w-full border rounded-2xl pl-9 pr-8 py-1.5 font-body-sm text-[12px] focus:outline-none transition-colors ${
                isLight
                  ? 'bg-white border-[#fecdd3] text-[#0f172a] placeholder:text-gray-400 focus:border-[#e11d48]'
                  : 'bg-[#0b0507] border-[#e11d48]/20 text-[#fff1f2] placeholder:text-[#fda4af]/40 focus:border-[#e11d48]'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-gray-400 hover:text-rose-500 p-0.5"
                title="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}
          </div>

          {/* Inbox Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            {[
              { id: 'all', label: 'Todos', count: threads.length },
              { id: 'unread', label: 'No leídos', count: threads.filter((t) => t.unread).length },
              { id: 'dates', label: 'Con Citas 🎟️', count: threads.filter((t) => t.messages.some((m) => m.type === 'date_proposal' || m.type === 'date_card')).length },
            ].map((chip) => {
              const isSelected = inboxFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    sounds.playClick();
                    setInboxFilter(chip.id as any);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold flex items-center gap-1 whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-[#e11d48] text-white border-[#e11d48] shadow-sm scale-[1.02]'
                      : isLight
                      ? 'bg-white text-[#475569] border-[#fecdd3] hover:bg-[#fff1f3]'
                      : 'bg-white/5 text-[#fda4af]/80 border-[#e11d48]/20 hover:bg-white/10'
                  }`}
                >
                  <span>{chip.label}</span>
                  {chip.count > 0 && (
                    <span
                      className={`px-1 py-0.2 rounded-full text-[9px] ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isLight ? 'bg-gray-100 text-[#475569]' : 'bg-black/30 text-[#fda4af]'
                      }`}
                    >
                      {chip.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Conversations Container */}
        <div className={`flex-1 overflow-y-auto divide-y no-scrollbar ${isLight ? 'divide-gray-100' : 'divide-[#e11d48]/10'}`}>
          {/* Section: Match Stories (WhatsApp Status Style) */}
          <div className={`p-3 ${isLight ? 'bg-[#fff5f6]' : 'bg-[#12080d]'}`}>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className={`font-label-caps text-[9.5px] uppercase tracking-wider font-bold ${isLight ? 'text-[#475569]' : 'text-[#fda4af]/70'}`}>
                ESTADOS & NUEVOS MATCHES
              </span>
              <span className="text-[10px] font-meta-data text-[#e11d48] font-bold">
                {threads.length + matches.length} Sparks
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {threads.map((t) => (
                <button
                  key={`story-${t.id}`}
                  onClick={() => handleOpenConversation(t.id)}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div className="relative w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] group-hover:scale-105 transition-transform shadow-md">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-[#0d070a]">
                      <img
                        src={t.partnerAvatar}
                        alt={t.partnerName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {t.partnerOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-2 border-white rounded-full" />
                    )}
                  </div>
                  <span className={`font-label-caps text-[9.5px] font-bold tracking-wider uppercase max-w-[54px] truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                    {t.partnerName}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Chat Threads List */}
          <div className="p-2 space-y-1">
            <span className={`font-label-caps text-[9.5px] uppercase tracking-wider font-bold px-2 py-1 block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
              TODOS LOS CHATS
            </span>

            {filteredThreads.length === 0 ? (
              <div className={`p-8 text-center font-body-sm text-[13px] ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>
                No se encontraron conversaciones.
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  id={`chat-row-${thread.id}`}
                  onClick={() => handleOpenConversation(thread.id)}
                  className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left group ${
                    thread.unread
                      ? isLight
                        ? 'bg-[#fff1f3] border border-[#fecdd3] shadow-sm'
                        : 'bg-[#1c0c13] border border-[#e11d48]/40 shadow-sm'
                      : isLight
                      ? 'hover:bg-[#fff5f6] border border-transparent'
                      : 'hover:bg-[#160a10] border border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#e11d48]/30 group-hover:border-[#e11d48] transition-colors">
                    <img
                      src={thread.partnerAvatar}
                      alt={thread.partnerName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {thread.partnerOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className={`font-headline-md text-[14px] font-bold truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                          {thread.partnerName}
                        </h3>
                        <span
                          className="material-symbols-outlined text-[13px] text-[#e11d48]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                      </div>
                      <span className={`font-meta-data text-[10px] shrink-0 ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>
                        {thread.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-[12px] truncate flex items-center gap-1 ${
                          thread.unread
                            ? 'font-bold text-[#e11d48]'
                            : isLight ? 'font-body-sm text-[#64748b]' : 'font-body-sm text-[#fda4af]/80'
                        }`}
                      >
                        {thread.messages[thread.messages.length - 1]?.sender === 'user' && (
                          <span className="material-symbols-outlined text-[13px] text-[#53bdeb]">
                            done_all
                          </span>
                        )}
                        <span>{thread.lastMessage || '¡Comenzá la conversación!'}</span>
                      </p>

                      {thread.unread && (
                        <span className="w-2.5 h-2.5 bg-[#e11d48] rounded-full shrink-0 shadow-[0_0_8px_#e11d48]" />
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
  // VIEW 2: WHATSAPP-STYLE ACTIVE CHAT SCREEN WITH STICKERS
  // =========================================================================
  return (
    <div
      id="whatsapp-chat-screen"
      className={`flex flex-col h-[calc(100dvh-130px)] min-h-[480px] w-full rounded-3xl border overflow-hidden shadow-2xl relative animate-fadeIn ${
        isLight ? 'bg-[#f4efe8] border-[#fecdd3]' : 'bg-[#0b090a] border-[#e11d48]/30'
      }`}
    >
      {/* ------------------------------------------------------------------- */}
      {/* 1. CLEAN, ORGANIZED TOP APP BAR                                     */}
      {/* ------------------------------------------------------------------- */}
      <div
        className={`px-3 py-2 border-b flex items-center justify-between shrink-0 relative z-30 shadow-sm min-h-[56px] ${
          isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/25'
        }`}
      >
        {/* Left Side: Back + Avatar + Contact Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
          {/* Back to Inbox */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              sounds.playClick();
              setViewMode('inbox');
              setActiveMediaTray(null);
            }}
            className="h-8 w-8 -ml-1 rounded-full text-[#64748b] hover:text-[#e11d48] shrink-0"
            title="Volver a los chats"
            aria-label="Volver"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </Button>

          {/* Contact Avatar */}
          <div
            className="relative cursor-pointer group shrink-0"
            onClick={() => setShowContactInfoDrawer(true)}
            title="Ver perfil del contacto"
          >
            <Avatar className="w-9 h-9 border border-[#e11d48] group-hover:scale-105 transition-transform">
              <AvatarImage src={activeThread.partnerAvatar} alt={activeThread.partnerName} />
              <AvatarFallback>{activeThread.partnerName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            {activeThread.partnerOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] border-2 border-white rounded-full" />
            )}
          </div>

          {/* Contact Name & Status */}
          <div
            className="flex flex-col cursor-pointer min-w-0 flex-1"
            onClick={() => setShowContactInfoDrawer(true)}
          >
            <div className="flex items-center gap-1 min-w-0">
              <h2 className={`font-headline-md text-[13.5px] font-bold tracking-wide truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                {activeThread.partnerName}
              </h2>
              <span
                className="material-symbols-outlined text-[13px] text-[#e11d48] shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            
            <div className="text-[10.5px] leading-tight truncate">
              {isPartnerTyping ? (
                <span className="text-[#e11d48] font-medium animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#e11d48] rounded-full animate-bounce" />
                  escribiendo...
                </span>
              ) : (
                <span className={`flex items-center gap-1 truncate ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                  {activeThread.partnerOnline ? 'en línea' : 'últ. vez hoy'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Clean Action Toolbar (Never wrapping) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Propose Date Button (Cita / Ticket) */}
          {onOpenProposeModal && (
            <Button
              size="sm"
              onClick={() => {
                sounds.playStamp();
                onOpenProposeModal(activeThread.id);
              }}
              className="h-8 px-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white rounded-full font-label-caps text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm hover:brightness-105 active:scale-95 transition-all shrink-0"
              title="Proponer café o cita MELY"
            >
              <span className="material-symbols-outlined text-[15px]">local_cafe</span>
              <span className="hidden xs:inline">Cita</span>
            </Button>
          )}

          {/* Theme Palette Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              sounds.playClick();
              setShowThemeCustomizer(true);
            }}
            className={`h-8 w-8 rounded-full transition-colors shrink-0 ${
              isLight ? 'text-[#e11d48] hover:bg-[#fff1f3]' : 'text-[#fda4af] hover:bg-white/10'
            }`}
            title="Personalizar tema, colores y fondo"
          >
            <span className="material-symbols-outlined text-[18px]">palette</span>
          </Button>

          {/* Video Call Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleStartCall('video')}
            className={`h-8 w-8 rounded-full transition-colors shrink-0 ${
              isLight ? 'text-[#475569] hover:text-[#e11d48] hover:bg-[#fff1f3]' : 'text-[#fda4af]/80 hover:text-white hover:bg-white/10'
            }`}
            title="Videollamada MELY"
          >
            <span className="material-symbols-outlined text-[19px]">videocam</span>
          </Button>

          {/* 3 Dots Menu */}
          <div className="relative shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              className={`h-8 w-8 rounded-full transition-colors ${
                isLight ? 'text-[#475569] hover:text-[#e11d48] hover:bg-[#fff1f3]' : 'text-[#fda4af]/80 hover:text-white hover:bg-white/10'
              }`}
              title="Más opciones"
            >
              <span className="material-symbols-outlined text-[19px]">more_vert</span>
            </Button>

            {showHeaderMenu && (
              <>
                {/* Backdrop to close click outside */}
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowHeaderMenu(false)}
                />
                <div
                  className={`absolute right-0 top-10 w-56 rounded-2xl shadow-2xl border p-1.5 z-50 animate-scaleUp ${
                    isLight ? 'bg-white border-[#fecdd3] text-[#0f172a]' : 'bg-[#180b12] border-[#e11d48]/40 text-[#fff1f2]'
                  }`}
                >
                  <button
                    onClick={() => {
                      setShowHeaderMenu(false);
                      setShowThemeCustomizer(true);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-[#e11d48] font-bold"
                  >
                    <span className="material-symbols-outlined text-[16px]">palette</span>
                    <span>Personalizar Tema y Fondo</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowHeaderMenu(false);
                      handleStartCall('audio');
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#e11d48]">call</span>
                    <span>Llamada de voz</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowHeaderMenu(false);
                      setShowContactInfoDrawer(true);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#e11d48]">account_circle</span>
                    <span>Ver perfil de {activeThread.partnerName}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowHeaderMenu(false);
                      setInChatSearchOpen(!inChatSearchOpen);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#e11d48]">search</span>
                    <span>Buscar en este chat</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowHeaderMenu(false);
                      setActiveMediaTray('stickers');
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#e11d48]">auto_awesome</span>
                    <span>Panel de Stickers</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowHeaderMenu(false);
                      sounds.playClick();
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-rose-500"
                  >
                    <span className="material-symbols-outlined text-[16px]">notifications_off</span>
                    <span>Silenciar notificaciones</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* In-Chat Search Bar */}
      {inChatSearchOpen && (
        <div
          className={`px-3 py-2 border-b flex items-center gap-2 animate-fadeIn z-20 ${
            isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#160a10] border-[#e11d48]/30'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] text-[#e11d48]">search</span>
          <input
            type="text"
            value={inChatSearchTerm}
            onChange={(e) => setInChatSearchTerm(e.target.value)}
            placeholder="Buscar palabras o stickers en este chat..."
            className={`flex-1 text-[12.5px] bg-transparent border-0 focus:outline-none ${
              isLight ? 'text-[#0f172a] placeholder:text-gray-400' : 'text-white placeholder:text-[#fda4af]/40'
            }`}
            autoFocus
          />
          {inChatSearchTerm && (
            <button onClick={() => setInChatSearchTerm('')} className="text-gray-400 p-1">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInChatSearchOpen(false)}
            className="h-7 px-2 text-[11px]"
          >
            Listo
          </Button>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. CHAT BACKGROUND & MESSAGES LIST                                  */}
      {/* ------------------------------------------------------------------- */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2 relative z-10 no-scrollbar select-text transition-all duration-300"
        style={getWallpaperStyle()}
      >
        {/* MELY End-to-End Encryption Notice */}
        <div className="flex justify-center my-1">
          <div
            className={`max-w-xs px-3 py-1.5 rounded-xl border text-center text-[10px] leading-tight shadow-sm backdrop-blur-md ${
              isLight
                ? 'bg-white/80 border-[#fecdd3] text-[#475569]'
                : 'bg-[#180c13]/80 border-[#e11d48]/30 text-[#fda4af]/80'
            }`}
          >
            <span className="inline-flex items-center gap-1 font-bold text-[#e11d48] mb-0.5">
              <span className="material-symbols-outlined text-[12px]">lock</span>
              Cifrado y Conexión Privada MELY
            </span>
            <p>Los mensajes, notas de voz y stickers están cifrados y sellados.</p>
          </div>
        </div>

        {/* Date Separator */}
        <div className="flex justify-center my-1.5">
          <Badge
            variant="outline"
            className={`px-3 py-0.5 rounded-full font-meta-data text-[9.5px] uppercase tracking-wider shadow-sm backdrop-blur-md ${
              isLight
                ? 'bg-white/90 border-[#fecdd3] text-[#64748b]'
                : 'bg-[#160a10]/90 border-[#e11d48]/30 text-[#fda4af]/70'
            }`}
          >
            HOY
          </Badge>
        </div>

        {/* Messages Loop */}
        {filteredMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          const msgReaction = localReactions[msg.id] || msg.reaction;
          const isSticker = msg.type === 'sticker';
          const isAudio = msg.type === 'voice' || msg.text?.startsWith('🎤 Nota de voz') || msg.text?.startsWith('Nota de voz');
          const isImage = msg.type === 'image';
          const isLocation = msg.type === 'location';
          const isStarred = starredMsgIds.includes(msg.id);
          const currentAudioSpeed = playbackSpeeds[msg.id] || 1;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group relative ${isUser ? 'items-end' : 'items-start'}`}
            >
              {/* Main Bubble / Sticker Container */}
              <div
                className={`max-w-[85%] relative flex items-end gap-1.5 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* STICKER RENDERING */}
                {isSticker ? (
                  <div
                    onClick={() => {
                      sounds.playClick();
                      const matched = allStickersList.find((s) => s.title === msg.text || msg.stickerAlt?.includes(s.title));
                      if (matched) setSelectedStickerDetail(matched);
                    }}
                    className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 group/sticker py-1"
                  >
                    {/* Illustrated Sticker Graphic */}
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#fff1f3] to-white dark:from-[#200d16] dark:to-[#12070c] border-2 border-[#e11d48]/40 shadow-xl flex flex-col items-center justify-center p-3 text-center relative overflow-hidden backdrop-blur-sm">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-[#e11d48]/10 rounded-full blur-lg" />
                      <span className="text-5xl filter drop-shadow-md select-none transform group-hover/sticker:scale-110 transition-transform">
                        {msg.text?.split(' ')[0] || '✨'}
                      </span>
                      <span className="font-label-caps text-[9px] font-bold uppercase tracking-wider text-[#e11d48] mt-2 line-clamp-2 px-1">
                        {msg.stickerAlt || msg.text || 'STICKER MELY'}
                      </span>

                      {/* Small sticker timestamp pill */}
                      <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 bg-black/40 text-white px-1.5 py-0.5 rounded-full text-[8.5px]">
                        <span>{msg.timestamp}</span>
                        {isUser && (
                          <span className="material-symbols-outlined text-[10px] text-[#53bdeb]">
                            done_all
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Starred indicator */}
                    {isStarred && (
                      <span className="absolute -top-1 -right-1 text-amber-400 text-[13px] filter drop-shadow">
                        ⭐
                      </span>
                    )}
                  </div>
                ) : (
                  /* REGULAR CUSTOMIZED MESSAGE BUBBLE */
                  <div
                    style={isUser && customColor ? { backgroundColor: customColor } : undefined}
                    className={`p-2.5 sm:p-3 relative transition-all shadow-md ${
                      isUser ? getUserBubbleClass() : getPartnerBubbleClass()
                    }`}
                  >
                    {/* Quoted Message (Reply Preview) */}
                    {msg.replyTo && (
                      <div
                        className={`mb-2 p-2 rounded-lg border-l-4 text-[11px] ${
                          isUser
                            ? 'bg-black/5 dark:bg-white/10 border-[#e11d48]'
                            : 'bg-black/5 dark:bg-white/5 border-[#e11d48]'
                        }`}
                      >
                        <span className="font-bold text-[#e11d48] block">
                          {msg.replyTo.sender}
                        </span>
                        <p className="truncate opacity-80">{msg.replyTo.text}</p>
                      </div>
                    )}

                    {/* Image Message */}
                    {isImage && msg.imageUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden max-w-[240px] border border-black/10">
                        <img
                          src={msg.imageUrl}
                          alt="Imagen enviada"
                          className="w-full h-auto object-cover max-h-52 rounded-xl hover:scale-105 transition-transform cursor-pointer"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Location Message */}
                    {isLocation && (
                      <div className="mb-2 p-2.5 rounded-xl bg-black/5 dark:bg-white/10 flex items-center gap-2.5 border border-[#e11d48]/30">
                        <div className="w-9 h-9 rounded-full bg-[#e11d48] text-white flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-label-caps text-[9px] text-[#e11d48] font-bold block">
                            PUNTO DE ENCUENTRO
                          </span>
                          <p className="font-headline-md text-[12px] font-bold truncate">
                            {msg.locationName || 'Cafetería de Especialidad'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Date Proposal Card (Ticket) inside Chat */}
                    {msg.dateProposal && (
                      <div
                        className={`p-3.5 rounded-2xl border-2 mb-2 shadow-lg transition-all ${
                          isLight
                            ? 'bg-[#fff5f6] border-[#e11d48]/40 text-[#0f172a]'
                            : 'bg-[#1a0c13] border-[#e11d48]/50 text-[#fff1f2]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] text-white flex items-center justify-center shrink-0 shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">
                              confirmation_number
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span
                              className={`font-label-caps text-[9px] uppercase tracking-widest block font-bold ${
                                isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'
                              }`}
                            >
                              TICKET DE CITA MELY
                            </span>
                            <h4
                              className={`font-headline-md text-[14px] font-bold truncate ${
                                isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                              }`}
                            >
                              {msg.dateProposal.title}
                            </h4>
                          </div>
                        </div>

                        <div
                          className={`p-2.5 rounded-xl border text-[12px] mb-2.5 flex flex-col gap-1.5 ${
                            isLight
                              ? 'bg-white border-[#fecdd3] text-[#1e293b]'
                              : 'bg-[#0e070a] border-[#e11d48]/25 text-[#fce7eb]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[16px] text-[#e11d48] shrink-0">
                              location_on
                            </span>
                            <span className="truncate">{msg.dateProposal.venue}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[16px] text-[#e11d48] shrink-0">
                              schedule
                            </span>
                            <span>{msg.dateProposal.time}</span>
                          </div>
                          {msg.dateProposal.notes && (
                            <p
                              className={`text-[11px] italic pt-1 border-t border-dashed ${
                                isLight
                                  ? 'border-[#fecdd3] text-[#475569]'
                                  : 'border-[#e11d48]/20 text-[#fda4af]/80'
                              }`}
                            >
                              "{msg.dateProposal.notes}"
                            </p>
                          )}
                          {msg.dateProposal.token && (
                            <div className="flex items-center justify-between text-[10px] font-mono mt-0.5 pt-1 border-t border-dashed border-[#e11d48]/20">
                              <span className={isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}>
                                TOKEN VERIFICACIÓN:
                              </span>
                              <strong className="text-[#e11d48] font-bold">
                                {msg.dateProposal.token}
                              </strong>
                            </div>
                          )}
                        </div>

                        {msg.dateProposal.status === 'proposed' && (
                          <Button
                            size="sm"
                            onClick={() => onAcceptDate?.(activeThread.id, msg.dateProposal!.id)}
                            className="w-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white text-[11px] font-bold py-1.5 h-8 rounded-xl shadow-md hover:brightness-105"
                          >
                            Aceptar Ticket y Guardar en Citas
                          </Button>
                        )}
                        {msg.dateProposal.status === 'accepted' && (
                          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-bold">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              CITA CONFIRMADA
                            </span>
                            <span className="font-mono">{msg.dateProposal.token}</span>
                          </div>
                        )}
                        {msg.dateProposal.status === 'verified' && (
                          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#e11d48]/15 border border-[#e11d48]/30 text-[#e11d48] text-[10.5px] font-bold">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                              ENCUENTRO SELLADO & VERIFICADO
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audio Voice Note Player */}
                    {isAudio ? (
                      <div className="flex items-center gap-2.5 min-w-[210px] py-1">
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(msg.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center tactile-btn shadow-md transition-all ${
                            playingAudioId === msg.id
                              ? 'bg-[#e11d48] text-white scale-105'
                              : isUser
                              ? isLight ? 'bg-[#53bdeb] text-white' : 'bg-emerald-500 text-white'
                              : 'bg-[#e11d48] text-white'
                          }`}
                          aria-label="Reproducir audio"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {playingAudioId === msg.id ? 'pause' : 'play_arrow'}
                          </span>
                        </button>

                        {/* WhatsApp Sound Wave & Duration */}
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex items-center gap-0.5 h-6">
                            {[30, 80, 45, 95, 60, 100, 50, 75, 40, 85, 90, 35, 65, 80, 50, 70].map(
                              (height, i) => (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full transition-all duration-200 ${
                                    playingAudioId === msg.id
                                      ? 'bg-[#e11d48] animate-pulse'
                                      : isUser
                                      ? isLight ? 'bg-emerald-700/60' : 'bg-white/70'
                                      : isLight ? 'bg-[#e11d48]/60' : 'bg-[#fda4af]/60'
                                  }`}
                                  style={{ height: `${height}%` }}
                                />
                              )
                            )}
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-mono opacity-80">
                            <span>{playingAudioId === msg.id ? '0:06' : '0:00'}</span>
                            <span>{msg.audioDuration || '0:22'}</span>
                          </div>
                        </div>

                        {/* WhatsApp Playback Speed Button (1x / 1.5x / 2x) */}
                        <button
                          onClick={() => handleCycleSpeed(msg.id)}
                          className={`px-1.5 py-0.5 rounded-full font-mono text-[9px] font-bold border transition-colors ${
                            isLight
                              ? 'bg-white/80 border-black/10 text-[#0f172a]'
                              : 'bg-black/40 border-white/20 text-white'
                          }`}
                          title="Cambiar velocidad"
                        >
                          {currentAudioSpeed}x
                        </button>
                      </div>
                    ) : (
                      !isImage && !msg.dateProposal && !isLocation && (
                        <p className="font-body-sm text-[13px] leading-relaxed break-words">
                          {msg.text}
                        </p>
                      )
                    )}

                    {/* Bubble Bottom Meta: Time, Star & Double Check */}
                    <div className="flex items-center justify-end gap-1 mt-0.5 select-none text-[9.5px] opacity-75">
                      {isStarred && <span>⭐</span>}
                      <span>{msg.timestamp}</span>
                      {isUser && (
                        <span
                          className="material-symbols-outlined text-[13px] text-[#53bdeb]"
                          title="Leído"
                        >
                          done_all
                        </span>
                      )}
                    </div>

                    {/* Active Reaction Pill on bubble */}
                    {msgReaction && (
                      <button
                        onClick={() => handleToggleReaction(msg.id, msgReaction)}
                        className={`absolute -bottom-2 ${
                          isUser ? 'left-2' : 'right-2'
                        } px-1.5 py-0.5 rounded-full text-[11px] shadow-md transform hover:scale-110 transition-transform flex items-center gap-1 ${
                          isLight ? 'bg-white border border-[#fecdd3]' : 'bg-[#180b12] border border-[#e11d48]/40'
                        }`}
                      >
                        <span>{msgReaction}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* WhatsApp Quick Action Button on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveReactionMenuMsgId(activeReactionMenuMsgId === msg.id ? null : msg.id)}
                    className="p-1 rounded-full bg-white dark:bg-[#160a10] border border-[#e11d48]/30 text-[#e11d48] shadow-sm hover:scale-110"
                    title="Reaccionar"
                  >
                    <span className="material-symbols-outlined text-[13px] block">add_reaction</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveOptionsMenuMsgId(activeOptionsMenuMsgId === msg.id ? null : msg.id)}
                    className="p-1 rounded-full bg-white dark:bg-[#160a10] border border-gray-200 dark:border-white/10 text-gray-500 hover:text-black dark:hover:text-white shadow-sm"
                    title="Opciones del mensaje"
                  >
                    <span className="material-symbols-outlined text-[13px] block">expand_more</span>
                  </button>
                </div>
              </div>

              {/* Reaction Popup Tray */}
              {activeReactionMenuMsgId === msg.id && (
                <div
                  className={`mt-1 z-30 p-1.5 rounded-full shadow-2xl flex items-center gap-1 animate-fadeIn border ${
                    isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/40'
                  } ${isUser ? 'self-end mr-2' : 'self-start ml-2'}`}
                >
                  {['👍', '❤️', '😂', '😮', '😢', '🙏', '☕', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleToggleReaction(msg.id, emoji)}
                      className="p-1 text-[15px] hover:scale-125 transition-transform rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveReactionMenuMsgId(null)}
                    className="p-1 text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </div>
              )}

              {/* Context Options Menu (Reply, Star, Copy) */}
              {activeOptionsMenuMsgId === msg.id && (
                <div
                  className={`mt-1 z-30 p-1.5 rounded-2xl shadow-2xl flex flex-col gap-1 animate-fadeIn border text-[11px] font-medium ${
                    isLight ? 'bg-white border-[#fecdd3] text-[#0f172a]' : 'bg-[#140b0f] border-[#e11d48]/40 text-[#fff1f2]'
                  } ${isUser ? 'self-end mr-2' : 'self-start ml-2'}`}
                >
                  <button
                    onClick={() => {
                      setReplyingToMessage(msg);
                      setActiveOptionsMenuMsgId(null);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 text-left rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">reply</span>
                    <span>Responder</span>
                  </button>
                  <button
                    onClick={() => handleToggleStar(msg.id)}
                    className="px-2.5 py-1 text-left rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isStarred ? 'star_half' : 'star'}
                    </span>
                    <span>{isStarred ? 'Quitar estrella' : 'Destacar'}</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(msg.text || '');
                      setActiveOptionsMenuMsgId(null);
                      sounds.playClick();
                    }}
                    className="px-2.5 py-1 text-left rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>Copiar texto</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Partner Typing Bubble */}
        {isPartnerTyping && (
          <div className="flex items-end gap-1.5 self-start animate-fadeIn">
            <Avatar className="w-7 h-7 border border-[#e11d48]/30">
              <AvatarImage src={activeThread.partnerAvatar} alt={activeThread.partnerName} />
              <AvatarFallback>{activeThread.partnerName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div
              className={`px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1 shadow-sm border ${
                isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#202c33] border-[#e11d48]/20'
              }`}
            >
              <span className="w-1.5 h-1.5 bg-[#e11d48] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-[#ff4d67] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#e11d48] rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. QUICK CONVERSATION SPARKS PILLS                                  */}
      {/* ------------------------------------------------------------------- */}
      <div
        className={`px-3 py-1.5 border-t flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 ${
          isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#12080d] border-[#e11d48]/20'
        }`}
      >
        {CONVERSATION_SPARKS.map((spark, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              sounds.playClick();
              onSendMessage(activeThread.id, spark);
            }}
            className={`px-2.5 py-1 border rounded-full text-[11px] font-body-sm whitespace-nowrap shrink-0 transition-colors ${
              isLight
                ? 'bg-white border-[#fecdd3] text-[#475569] hover:text-[#e11d48] hover:border-[#e11d48]'
                : 'bg-[#0b0507] hover:bg-[#1a0c13] border-[#e11d48]/25 text-[#fda4af] hover:text-[#fff1f2]'
            }`}
          >
            {spark}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. ATTACHMENT MENU GRID (WhatsApp Paperclip Menu)                   */}
      {/* ------------------------------------------------------------------- */}
      {showAttachmentMenu && (
        <div
          className={`border-t p-3.5 grid grid-cols-3 gap-3 animate-fadeIn relative z-20 shrink-0 ${
            isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
          }`}
        >
          {/* Cámara */}
          <button
            onClick={handleSendSamplePhoto}
            className="flex flex-col items-center gap-1 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">photo_camera</span>
            </div>
            <span className={`text-[11px] font-medium ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              Cámara
            </span>
          </button>

          {/* Fotos & Galería */}
          <button
            onClick={handleSendSamplePhoto}
            className="flex flex-col items-center gap-1 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">image</span>
            </div>
            <span className={`text-[11px] font-medium ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              Fotos
            </span>
          </button>

          {/* Proponer Cita MELY */}
          <button
            onClick={() => {
              setShowAttachmentMenu(false);
              onOpenProposeModal?.(activeThread.id);
            }}
            className="flex flex-col items-center gap-1 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">local_cafe</span>
            </div>
            <span className={`text-[11px] font-medium ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              Cita MELY
            </span>
          </button>

          {/* Ubicación / Cafetería */}
          <button
            onClick={handleSendLocation}
            className="flex flex-col items-center gap-1 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </div>
            <span className={`text-[11px] font-medium ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              Ubicación
            </span>
          </button>

          {/* Stickers Direct */}
          <button
            onClick={() => {
              setShowAttachmentMenu(false);
              setActiveMediaTray('stickers');
            }}
            className="flex flex-col items-center gap-1 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            </div>
            <span className={`text-[11px] font-medium ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              Stickers
            </span>
          </button>

          {/* Audio / Canción */}
          <button
            onClick={() => {
              setShowAttachmentMenu(false);
              sounds.playStamp();
              onSendMessage(activeThread.id, '🎵 Te comparto esta canción de Spinetta en vinilo.');
            }}
            className="flex flex-col items-center gap-1 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">headphones</span>
            </div>
            <span className={`text-[11px] font-medium ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              Audio
            </span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 5. WHATSAPP MEDIA TRAY (EMOJIS / STICKERS / GIFS TRAY)              */}
      {/* ------------------------------------------------------------------- */}
      {activeMediaTray && (
        <div
          id="whatsapp-sticker-emoji-tray"
          className={`border-t flex flex-col h-64 max-h-[45vh] animate-fadeIn relative z-20 shrink-0 ${
            isLight ? 'bg-[#fffafb] border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
          }`}
        >
          {/* Top Switcher Tabs (Emojis / Stickers / GIFs) */}
          <div
            className={`px-3 py-1.5 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'bg-[#fff1f3]' : 'bg-[#1a0c13]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveMediaTray('emojis')}
                className={`h-7 px-3 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  activeMediaTray === 'emojis'
                    ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white shadow-sm'
                    : isLight ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                <span>😊</span>
                <span>Emojis</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveMediaTray('stickers')}
                className={`h-7 px-3 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  activeMediaTray === 'stickers'
                    ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white shadow-sm'
                    : isLight ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                <span>👾</span>
                <span>Stickers</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveMediaTray('gifs')}
                className={`h-7 px-3 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  activeMediaTray === 'gifs'
                    ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white shadow-sm'
                    : isLight ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                <span>🎬</span>
                <span>GIFs</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveMediaTray(null)}
              className="h-7 w-7 rounded-full text-gray-400 hover:text-black dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </Button>
          </div>

          {/* TRAY CONTENT 1: STICKERS (WhatsApp Pack Browser) */}
          {activeMediaTray === 'stickers' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Pack Selector Row */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar border-b border-black/5 dark:border-white/5 shrink-0">
                {/* Favoritos button */}
                <button
                  onClick={() => setSelectedStickerPackId('favorites')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 border transition-all ${
                    selectedStickerPackId === 'favorites'
                      ? 'bg-[#e11d48] text-white border-[#e11d48]'
                      : isLight ? 'bg-white border-[#fecdd3] text-gray-700' : 'bg-[#1e0b14] border-[#e11d48]/30 text-gray-300'
                  }`}
                >
                  <span>⭐ Favoritos ({favoriteStickers.length})</span>
                </button>

                {STICKER_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedStickerPackId(pack.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 border transition-all ${
                      selectedStickerPackId === pack.id
                        ? 'bg-[#e11d48] text-white border-[#e11d48]'
                        : isLight ? 'bg-white border-[#fecdd3] text-gray-700' : 'bg-[#1e0b14] border-[#e11d48]/30 text-gray-300'
                    }`}
                  >
                    <span>{pack.icon}</span>
                    <span>{pack.name}</span>
                  </button>
                ))}

                {/* Creator Tab */}
                <button
                  onClick={() => setSelectedStickerPackId('creator')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 border transition-all ${
                    selectedStickerPackId === 'creator'
                      ? 'bg-[#e11d48] text-white border-[#e11d48]'
                      : isLight ? 'bg-white border-[#fecdd3] text-gray-700' : 'bg-[#1e0b14] border-[#e11d48]/30 text-gray-300'
                  }`}
                >
                  <span>➕ Crear Sticker</span>
                </button>
              </div>

              {/* Sticker Grid */}
              <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
                {selectedStickerPackId === 'creator' ? (
                  /* Custom Sticker Maker inside WhatsApp */
                  <div className="flex flex-col items-center justify-center p-2 text-center max-w-xs mx-auto">
                    <span className="text-[11px] font-bold text-[#e11d48] uppercase tracking-wider mb-1">
                      CREADOR DE STICKERS INSTANTÁNEO
                    </span>
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex flex-col items-center justify-center p-2 mb-3 shadow-xl border-2 border-white">
                      <span className="text-3xl">{customStickerEmoji}</span>
                      <span className="text-[8px] font-bold uppercase truncate max-w-[80px]">
                        {customStickerText || 'TU TEXTO'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full mb-2">
                      <Input
                        value={customStickerEmoji}
                        onChange={(e) => setCustomStickerEmoji(e.target.value || '✨')}
                        placeholder="Emoji"
                        className="w-16 text-center text-lg h-8"
                        maxLength={2}
                      />
                      <Input
                        value={customStickerText}
                        onChange={(e) => setCustomStickerText(e.target.value)}
                        placeholder="Frase del sticker (ej: ¡Salen mates!)"
                        className="flex-1 text-[12px] h-8"
                        maxLength={25}
                      />
                    </div>

                    <Button
                      onClick={handleSendCustomSticker}
                      disabled={!customStickerText.trim()}
                      className="w-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white text-[11px] font-bold h-8 rounded-full shadow-md"
                    >
                      Enviar Sticker Personalizado
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                    {(selectedStickerPackId === 'favorites' ? favoriteStickers : currentPack.stickers).map((sticker) => (
                      <button
                        key={sticker.id}
                        onClick={() => handleSendSticker(sticker)}
                        className="flex flex-col items-center p-2 rounded-2xl border transition-all hover:scale-110 active:scale-95 group relative shadow-sm"
                        style={{
                          background: isLight ? '#ffffff' : '#1a0c13',
                          borderColor: isLight ? '#fecdd3' : 'rgba(225,29,72,0.25)',
                        }}
                        title={`Enviar ${sticker.title}`}
                      >
                        <span className="text-3xl filter drop-shadow select-none group-hover:scale-110 transition-transform">
                          {sticker.emoji}
                        </span>
                        <span className="text-[9px] font-bold text-[#e11d48] uppercase tracking-wider mt-1 truncate max-w-full">
                          {sticker.badgeText || sticker.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRAY CONTENT 2: EMOJIS */}
          {activeMediaTray === 'emojis' && (
            <div className="flex-1 overflow-y-auto p-3 no-scrollbar space-y-3">
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    {cat.icon} {cat.name}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.emojis.map((emoji, i) => (
                      <button
                        key={`${cat.name}-${i}`}
                        onClick={() => {
                          sounds.playClick();
                          setInputText((prev) => prev + emoji);
                          inputRef.current?.focus();
                        }}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-[18px] hover:scale-125 transition-transform bg-white dark:bg-[#1a0c13] border-[#fecdd3] dark:border-[#e11d48]/20"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TRAY CONTENT 3: GIFS */}
          {activeMediaTray === 'gifs' && (
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 no-scrollbar">
              {QUICK_GIFS.map((gif) => (
                <div
                  key={gif.id}
                  onClick={() => handleSendGif(gif)}
                  className="rounded-2xl overflow-hidden border border-[#fecdd3] dark:border-[#e11d48]/30 cursor-pointer group relative shadow-md"
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-1 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] font-bold truncate text-center">
                    {gif.tag}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 6. WHATSAPP VOICE RECORDING BAR (ACTIVE STATE)                      */}
      {/* ------------------------------------------------------------------- */}
      {isRecordingVoice && (
        <div
          className={`border-t px-3.5 py-2.5 flex items-center justify-between animate-fadeIn relative z-30 shrink-0 ${
            isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 bg-[#e11d48] rounded-full animate-ping" />
            <span className="font-mono text-[13px] text-[#e11d48] font-bold">
              Grabando: 0:{recordingSeconds < 10 ? '0' : ''}
              {recordingSeconds}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sounds.playClick();
                setIsRecordingVoice(false);
              }}
              className="h-8 text-[11px]"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSendVoice}
              className="h-8 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white text-[11px] font-bold flex items-center gap-1 shadow-md"
            >
              <span>Enviar</span>
              <span className="material-symbols-outlined text-[15px]">send</span>
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 7. WHATSAPP MAIN BOTTOM INPUT BAR                                   */}
      {/* ------------------------------------------------------------------- */}
      {!isRecordingVoice && (
        <div
          className={`border-t p-2 relative z-30 shrink-0 ${
            isLight ? 'bg-[#f4efe8] border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/25'
          }`}
        >
          {/* Quoted Reply Preview */}
          {replyingToMessage && (
            <div
              className={`mb-2 p-2 rounded-xl border flex items-center justify-between animate-fadeIn text-[11px] ${
                isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#1e0c15] border-[#e11d48]/30'
              }`}
            >
              <div className="min-w-0">
                <span className="font-bold text-[#e11d48] block">
                  Respondiendo a {replyingToMessage.sender === 'user' ? 'Vos' : activeThread.partnerName}
                </span>
                <p className="truncate opacity-80">
                  {replyingToMessage.text || (replyingToMessage.type === 'sticker' ? '👾 Sticker' : '📷 Foto')}
                </p>
              </div>
              <button
                onClick={() => setReplyingToMessage(null)}
                className="text-gray-400 p-1 hover:text-black dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          <form
            onSubmit={handleSendText}
            className="flex items-center gap-1.5"
            autoComplete="off"
          >
            {/* WhatsApp Input Pill Container */}
            <div
              className={`flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-colors ${
                isLight
                  ? 'bg-white border-[#fecdd3] focus-within:border-[#e11d48]'
                  : 'bg-[#1e0c15] border-[#e11d48]/30 focus-within:border-[#fb7185]'
              }`}
            >
              {/* Emoji / Sticker Toggle Button */}
              <button
                type="button"
                id="btn-whatsapp-emoji-sticker-toggle"
                onClick={() => {
                  sounds.playClick();
                  setActiveMediaTray(activeMediaTray ? null : 'stickers');
                  setShowAttachmentMenu(false);
                }}
                className={`text-[#64748b] hover:text-[#e11d48] transition-colors focus:outline-none ${
                  activeMediaTray ? 'text-[#e11d48]' : ''
                }`}
                title="Stickers y Emojis"
              >
                <span className="material-symbols-outlined text-[21px] block">
                  {activeMediaTray ? 'keyboard' : 'sentiment_satisfied'}
                </span>
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                id="chat-input-text-whatsapp"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => {
                  if (activeMediaTray) setActiveMediaTray(null);
                }}
                placeholder="Mensaje"
                className={`flex-1 bg-transparent text-[13px] font-body-sm focus:outline-none ${
                  isLight ? 'text-[#0f172a] placeholder:text-gray-400' : 'text-[#fff1f2] placeholder:text-[#fda4af]/40'
                }`}
              />

              {/* Attachment Clip Button */}
              <button
                type="button"
                id="btn-whatsapp-attachments"
                onClick={() => {
                  sounds.playClick();
                  setShowAttachmentMenu(!showAttachmentMenu);
                  setActiveMediaTray(null);
                }}
                className={`text-[#64748b] hover:text-[#e11d48] transition-colors focus:outline-none ${
                  showAttachmentMenu ? 'text-[#e11d48]' : ''
                }`}
                title="Adjuntar fotos, citas o ubicación"
              >
                <span className="material-symbols-outlined text-[20px] block">attach_file</span>
              </button>

              {/* Camera Quick Button */}
              {!inputText.trim() && (
                <button
                  type="button"
                  onClick={handleSendSamplePhoto}
                  className="text-[#64748b] hover:text-[#e11d48] transition-colors focus:outline-none"
                  title="Enviar foto rápida"
                >
                  <span className="material-symbols-outlined text-[20px] block">photo_camera</span>
                </button>
              )}
            </div>

            {/* Mic OR Send Button */}
            {inputText.trim() ? (
              <button
                type="submit"
                id="btn-whatsapp-send"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] text-white flex items-center justify-center tactile-btn shadow-md hover:brightness-105 transition-transform active:scale-95 shrink-0"
                title="Enviar mensaje"
              >
                <span
                  className="material-symbols-outlined text-[19px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  send
                </span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-whatsapp-voice-record"
                onClick={() => {
                  sounds.playStamp();
                  setIsRecordingVoice(true);
                  setActiveMediaTray(null);
                  setShowAttachmentMenu(false);
                }}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] text-white flex items-center justify-center tactile-btn shadow-md hover:brightness-105 transition-transform active:scale-95 shrink-0"
                title="Grabar nota de voz"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            )}
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 8. MODAL: STICKER DETAILS & FAVORITES (WhatsApp Popup)              */}
      {/* ------------------------------------------------------------------- */}
      {selectedStickerDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-xs rounded-3xl p-5 border shadow-2xl flex flex-col items-center text-center animate-scaleUp ${
              isLight ? 'bg-white border-[#fecdd3] text-[#0f172a]' : 'bg-[#180b12] border-[#e11d48]/40 text-[#fff1f2]'
            }`}
          >
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#fff1f3] to-white dark:from-[#2a0e1b] dark:to-[#180710] border-2 border-[#e11d48]/40 shadow-xl flex items-center justify-center text-6xl mb-3">
              {selectedStickerDetail.emoji}
            </div>

            <h3 className="font-headline-md text-[16px] font-bold mb-0.5">
              {selectedStickerDetail.title}
            </h3>
            <p className="text-[11px] opacity-75 mb-4">
              Pack: {STICKER_PACKS.find((p) => p.id === selectedStickerDetail.packId)?.name || 'MELY Stickers'}
            </p>

            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={() => {
                  handleSendSticker(selectedStickerDetail);
                  setSelectedStickerDetail(null);
                }}
                className="w-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold h-9 rounded-2xl shadow-md"
              >
                Enviar Sticker al chat
              </Button>

              <Button
                variant="outline"
                onClick={() => handleToggleFavoriteSticker(selectedStickerDetail.id)}
                className="w-full h-9 rounded-2xl flex items-center justify-center gap-1.5 text-[12px]"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-500">
                  {favoriteStickerIds.includes(selectedStickerDetail.id) ? 'star' : 'star_border'}
                </span>
                <span>
                  {favoriteStickerIds.includes(selectedStickerDetail.id)
                    ? 'Quitar de Favoritos'
                    : 'Añadir a Favoritos'}
                </span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => setSelectedStickerDetail(null)}
                className="w-full h-8 text-[12px] opacity-70 hover:opacity-100"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 9. MODAL: CALL SIMULATION (Audio or Video WhatsApp Call)           */}
      {/* ------------------------------------------------------------------- */}
      {activeCallType && (
        <div className="fixed inset-0 z-50 bg-[#0c0709] flex flex-col items-center justify-between p-6 animate-fadeIn">
          {/* Top Call Info */}
          <div className="flex flex-col items-center text-center mt-8">
            <span className="font-label-caps text-[10px] text-[#e11d48] uppercase tracking-widest font-bold mb-1">
              {activeCallType === 'video' ? 'VIDEOLAMADA EN VIVO MELY' : 'LLAMADA DE VOZ MELY'}
            </span>
            <h2 className="font-headline-md text-2xl font-bold text-white mb-1">
              {activeThread.partnerName}
            </h2>
            <p className="text-emerald-400 font-mono text-[13px] animate-pulse">
              Conectado • 0:{callDuration < 10 ? '0' : ''}{callDuration}
            </p>
          </div>

          {/* Center Call Visual */}
          <div className="relative my-auto flex flex-col items-center">
            {activeCallType === 'video' ? (
              <div className="w-56 h-72 rounded-3xl overflow-hidden border-2 border-[#e11d48] shadow-2xl relative bg-black">
                <img
                  src={activeThread.partnerAvatar}
                  alt={activeThread.partnerName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold">
                  HD
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#e11d48] shadow-2xl animate-pulse">
                  <img
                    src={activeThread.partnerAvatar}
                    alt={activeThread.partnerName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-[#e11d48] animate-ping opacity-30 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Bottom Call Controls */}
          <div className="flex items-center gap-5 mb-8">
            {/* Mute */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsCallMuted(!isCallMuted);
              }}
              className={`w-12 h-12 rounded-full border flex items-center justify-center text-white ${
                isCallMuted ? 'bg-red-600 border-red-500' : 'bg-white/10 border-white/20'
              }`}
              title="Silenciar micrófono"
            >
              <span className="material-symbols-outlined text-[22px]">
                {isCallMuted ? 'mic_off' : 'mic'}
              </span>
            </button>

            {/* Speaker */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsSpeakerOn(!isSpeakerOn);
              }}
              className={`w-12 h-12 rounded-full border flex items-center justify-center text-white ${
                isSpeakerOn ? 'bg-[#e11d48] border-[#e11d48]' : 'bg-white/10 border-white/20'
              }`}
              title="Altavoz"
            >
              <span className="material-symbols-outlined text-[22px]">
                {isSpeakerOn ? 'volume_up' : 'volume_down'}
              </span>
            </button>

            {/* End Call (Red Button) */}
            <button
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
              title="Finalizar llamada"
            >
              <span className="material-symbols-outlined text-[28px]">call_end</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 10. DRAWER: WHATSAPP CONTACT INFO VIEW                              */}
      {/* ------------------------------------------------------------------- */}
      {showContactInfoDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div
            className={`w-full max-w-sm h-full overflow-y-auto p-5 border-l flex flex-col justify-between animate-slideLeft ${
              isLight ? 'bg-white border-[#fecdd3] text-[#0f172a]' : 'bg-[#140b0f] border-[#e11d48]/40 text-[#fff1f2]'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-[16px] font-bold">Info. del contacto</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowContactInfoDrawer(false)}
                  className="rounded-full"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </Button>
              </div>

              {/* Avatar & Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="w-24 h-24 border-2 border-[#e11d48] shadow-xl mb-3">
                  <AvatarImage src={activeThread.partnerAvatar} alt={activeThread.partnerName} />
                  <AvatarFallback>{activeThread.partnerName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-headline-md text-xl font-bold">{activeThread.partnerName}</h2>
                  <span className="material-symbols-outlined text-[#e11d48] text-[18px]">verified</span>
                </div>
                <p className="text-[12px] opacity-75">{activeThread.partnerOccupation || 'Curaduría & Artes'}</p>
                <p className="text-[11px] text-[#e11d48] font-bold">{activeThread.partnerCity || 'Buenos Aires'}</p>
              </div>

              {/* Bio / Estado */}
              <div
                className={`p-3 rounded-2xl border mb-4 ${
                  isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#1e0c15] border-[#e11d48]/30'
                }`}
              >
                <span className="font-label-caps text-[9px] text-[#e11d48] font-bold uppercase tracking-wider block mb-1">
                  ESTADO EN MELY
                </span>
                <p className="text-[12.5px] italic">
                  "{activeThread.partnerBio || 'Amante del café de especialidad, los vinilos de rock nacional y las charlas sin apuro.'}"
                </p>
              </div>

              {/* WhatsApp Media & Stickers Count */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-3 rounded-2xl border text-center border-black/10 dark:border-white/10">
                  <span className="text-xl font-bold text-[#e11d48] block">
                    {activeThread.messages.filter((m) => m.type === 'sticker').length}
                  </span>
                  <span className="text-[10px] uppercase font-bold opacity-70">Stickers enviados</span>
                </div>
                <div className="p-3 rounded-2xl border text-center border-black/10 dark:border-white/10">
                  <span className="text-xl font-bold text-emerald-500 block">100%</span>
                  <span className="text-[10px] uppercase font-bold opacity-70">Cifrado de chat</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowContactInfoDrawer(false);
                onOpenProposeModal?.(activeThread.id);
              }}
              className="w-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold h-10 rounded-2xl shadow-lg"
            >
              Proponer Cita a {activeThread.partnerName}
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 11. MODAL: THEME & COLOR CUSTOMIZER (Personalizar Chat)             */}
      {/* ------------------------------------------------------------------- */}
      {showThemeCustomizer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div
            className={`w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 border shadow-2xl flex flex-col justify-between animate-scaleUp no-scrollbar ${
              isLight ? 'bg-white border-[#fecdd3] text-[#0f172a]' : 'bg-[#140a10] border-[#e11d48]/40 text-[#fff1f2]'
            }`}
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[18px]">palette</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[16px] font-bold">Personalizar Chat</h3>
                    <p className="text-[11px] opacity-75">Colores, fondos y temas a tu estilo</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowThemeCustomizer(false)}
                  className="rounded-full h-8 w-8"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </Button>
              </div>

              {/* 1. Live Preview Card */}
              <div className="mb-5">
                <span className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-[#e11d48] block mb-2">
                  VISTA PREVIA EN VIVO
                </span>
                <div
                  className="p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-2.5 shadow-inner"
                  style={getWallpaperStyle()}
                >
                  {/* Partner bubble preview */}
                  <div className="flex justify-start">
                    <div className={`p-2.5 max-w-[80%] ${getPartnerBubbleClass()}`}>
                      <p className="text-[12px] font-medium leading-tight">
                        ¿Qué te parece este color para el chat? ☕
                      </p>
                      <span className="text-[9px] opacity-60 text-right block mt-0.5">17:42</span>
                    </div>
                  </div>

                  {/* User bubble preview */}
                  <div className="flex justify-end">
                    <div
                      style={customColor ? { backgroundColor: customColor } : undefined}
                      className={`p-2.5 max-w-[80%] ${getUserBubbleClass()}`}
                    >
                      <p className="text-[12px] font-medium leading-tight">
                        ¡Me encanta! Queda súper estético y personalizado ✨
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] opacity-80">
                        <span>17:43</span>
                        <span className="material-symbols-outlined text-[11px] text-[#53bdeb]">done_all</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Theme Presets */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-[#e11d48]">
                    PALETAS & TEMAS MELY
                  </span>
                  <span className="text-[10.5px] opacity-70 font-mono">
                    {CHAT_THEME_PRESETS.length} Diseños
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  {CHAT_THEME_PRESETS.map((preset) => {
                    const isSelected = selectedThemeId === preset.id && !customColor;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyTheme(preset.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? isLight
                              ? 'border-[#e11d48] bg-[#fff1f3] ring-2 ring-[#e11d48]/30 shadow-md'
                              : 'border-[#e11d48] bg-[#220d18] ring-2 ring-[#e11d48]/40 shadow-md'
                            : isLight
                            ? 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-[#fecdd3]'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#e11d48]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-bold truncate">
                            {preset.previewBadge}
                          </span>
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm shrink-0"
                            style={{ backgroundColor: preset.accentColor }}
                          />
                        </div>

                        <p className="text-[10px] opacity-75 line-clamp-1">
                          {preset.description}
                        </p>

                        {isSelected && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-[#e11d48]">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            <span>Activo</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Wallpaper Patterns */}
              <div className="mb-5">
                <span className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-[#e11d48] block mb-2">
                  TEXTURA Y PATRÓN DE FONDO
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'dots', label: 'Puntos', icon: 'blur_on' },
                    { id: 'grid', label: 'Cuadrícula', icon: 'grid_view' },
                    { id: 'stars', label: 'Estrellas', icon: 'auto_awesome' },
                    { id: 'warm', label: 'Cálido', icon: 'local_cafe' },
                    { id: 'clean', label: 'Liso', icon: 'crop_square' },
                  ].map((pat) => {
                    const isCurrent = customPattern === pat.id;
                    return (
                      <button
                        key={pat.id}
                        onClick={() => handleApplyPattern(pat.id as any)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all text-center ${
                          isCurrent
                            ? 'border-[#e11d48] bg-[#e11d48]/10 text-[#e11d48] font-bold shadow-sm'
                            : 'border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 hover:border-[#e11d48]/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{pat.icon}</span>
                        <span className="text-[9.5px] truncate">{pat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Custom Bubble Color Palette */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-[#e11d48]">
                    COLOR PERSONALIZADO DE BURBUJAS
                  </span>
                  {customColor && (
                    <button
                      onClick={() => handleApplyTheme(selectedThemeId)}
                      className="text-[10px] text-rose-500 font-bold hover:underline"
                    >
                      Restablecer paleta
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    '#e11d48',
                    '#be123c',
                    '#9333ea',
                    '#7c3aed',
                    '#059669',
                    '#0d9488',
                    '#0284c7',
                    '#d97706',
                    '#ea580c',
                    '#ec4899',
                    '#334155',
                  ].map((hex) => {
                    const isSelected = customColor.toLowerCase() === hex.toLowerCase();
                    return (
                      <button
                        key={hex}
                        onClick={() => handleApplyCustomColor(hex)}
                        className={`w-7 h-7 rounded-full transition-transform border-2 flex items-center justify-center ${
                          isSelected ? 'scale-125 border-white ring-2 ring-[#e11d48]' : 'border-white/30 hover:scale-110'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[14px] text-white">check</span>
                        )}
                      </button>
                    );
                  })}

                  {/* Custom Hex Color Picker */}
                  <label
                    className="relative w-7 h-7 rounded-full border-2 border-dashed border-gray-400 hover:border-[#e11d48] flex items-center justify-center cursor-pointer transition-colors"
                    title="Elegir color exacto"
                  >
                    <span className="material-symbols-outlined text-[14px] opacity-70">colorize</span>
                    <input
                      type="color"
                      value={customColor || currentTheme.accentColor}
                      onChange={(e) => handleApplyCustomColor(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-black/10 dark:border-white/10 mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  sounds.playClick();
                  handleApplyTheme('mely-cherry');
                }}
                className="flex-1 h-9 rounded-2xl text-[11.5px]"
              >
                Por Defecto
              </Button>
              <Button
                onClick={() => {
                  sounds.playStamp();
                  setShowThemeCustomizer(false);
                }}
                className="flex-1 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold h-9 rounded-2xl shadow-md text-[11.5px]"
              >
                Aplicar y Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
