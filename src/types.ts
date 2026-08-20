export interface Stamp {
  id: string;
  title: string;
  date: string;
  iconName: string;
  color: 'secondary' | 'primary' | 'tertiary' | 'sage';
  rotation: number;
  unlocked: boolean;
  location?: string;
  partnerName?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number; // positive = credit, negative = debit
  type: 'gift' | 'recharge' | 'vip' | 'reward' | 'date_verification' | 'spend' | 'purchase';
}

export interface DateProposal {
  id: string;
  title: string;
  venue: string;
  time: string;
  status: 'proposed' | 'accepted' | 'verified' | 'declined';
  token: string;
  icon: string;
  notes?: string;
  verifiedAt?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'partner' | 'system';
  text?: string;
  timestamp: string;
  type?: 'text' | 'voice' | 'image' | 'sticker' | 'location';
  audioDuration?: string;
  imageUrl?: string;
  stickerUrl?: string;
  stickerAlt?: string;
  reaction?: string;
  status?: 'sent' | 'delivered' | 'read';
  dateProposal?: DateProposal;
  isVerificationCard?: boolean;
  replyTo?: { id: string; sender: string; text: string };
  starred?: boolean;
  locationName?: string;
}

export interface ChatThread {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: Message[];
  activeDate?: DateProposal;
  partnerBio?: string;
  partnerCity?: string;
  partnerOccupation?: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  city: string;
  distance: string;
  joined: string;
  membership: 'Premium Member' | 'Founding Member' | 'VIP Member';
  bio: string;
  passType: string;
  avatar: string;
  gallery: string[];
  tags: string[];
  prompts: { question: string; answer: string }[];
  verifiedEncounters: number;
  email?: string;
}

export type ThemeMode = 'dark' | 'light';

export interface UserSettings {
  theme?: ThemeMode;
  // Discovery
  discoveryEnabled: boolean;
  ageRange: [number, number];
  maxDistanceKm: number;
  onlyVerifiedMembers: boolean;
  selectedCity: string;
  
  // Security & Privacy
  twoFactorEnabled: boolean;
  incognitoMode: boolean;
  biometricLock: boolean;
  tokenAutoRotation: boolean;
  activeSessions: { id: string; device: string; location: string; lastActive: string; isCurrent: boolean }[];
  
  // Sounds & Keepsake Audio
  stampSoundsEnabled: boolean;
  coinsSoundsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  notifyDateProposals: boolean;
  notifyNewMessages: boolean;
}

export interface StoreItem {
  id: string;
  name: string;
  category: 'coins' | 'boosts' | 'vip' | 'experiences';
  priceCoins?: number;
  priceMoney?: string;
  badge?: string;
  description: string;
  icon: string;
  highlightColor?: string;
  popular?: boolean;
  perks?: string[];
}

export type TabType = 'descubrir' | 'matches' | 'mensajes' | 'tienda' | 'citas' | 'perfil' | 'ajustes';
export type AuthScreenType = 'login' | 'register' | 'forgot_password';

