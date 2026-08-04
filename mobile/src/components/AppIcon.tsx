import type { LucideIcon } from 'lucide-react-native';
import {
  Baby,
  BarChart3,
  Bell,
  Bone,
  Brain,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CheckCheck,
  ChevronLeft,
  Clock,
  Dna,
  Droplet,
  Ear,
  Eye,
  Heart,
  HeartHandshake,
  HeartPulse,
  House,
  Info,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Menu,
  MessageCircle,
  Paperclip,
  Phone,
  Plus,
  Radiation,
  Ribbon,
  Scissors,
  Search,
  Shield,
  Siren,
  SlidersHorizontal,
  Smile,
  Soup,
  Sparkles,
  Stethoscope,
  UserRound,
  UserRoundCog,
  Users,
  Venus,
} from 'lucide-react-native';

export type AppIconName =
  | 'home'
  | 'search'
  | 'calendar'
  | 'profile'
  | 'menu'
  | 'filters'
  | 'settings'
  | 'clinic'
  | 'dashboard'
  | 'schedule'
  | 'patients'
  | 'doctors'
  | 'reports'
  | 'users'
  | 'pending'
  | 'clock'
  | 'hospital'
  | 'messages'
  | 'attach'
  | 'readReceipt'
  | 'plus'
  | 'bell'
  | 'grid'
  | 'heart'
  | 'brain'
  | 'baby'
  | 'sparkles'
  | 'location'
  | 'phone'
  | 'check'
  | 'back'
  | 'shield'
  | 'info'
  | 'tooth'
  | 'psychiatry'
  | 'cardiology'
  | 'nuclear'
  | 'general'
  | 'emergency'
  | 'eye'
  | 'gastro'
  | 'gynecology'
  | 'urology'
  | 'bone'
  | 'oncology'
  | 'plastic'
  | 'endocrine'
  | 'ent';

const ICONS: Record<AppIconName, LucideIcon> = {
  home: House,
  search: Search,
  calendar: Calendar,
  profile: UserRound,
  menu: Menu,
  filters: SlidersHorizontal,
  settings: UserRoundCog,
  clinic: Building2,
  dashboard: LayoutDashboard,
  schedule: CalendarDays,
  patients: Users,
  doctors: Stethoscope,
  reports: BarChart3,
  users: Users,
  pending: Clock,
  clock: Clock,
  hospital: Building2,
  messages: MessageCircle,
  attach: Paperclip,
  readReceipt: CheckCheck,
  plus: Plus,
  bell: Bell,
  grid: LayoutGrid,
  heart: Heart,
  brain: Brain,
  baby: Baby,
  sparkles: Sparkles,
  location: MapPin,
  phone: Phone,
  check: CheckCircle2,
  back: ChevronLeft,
  shield: Shield,
  info: Info,
  tooth: Smile,
  psychiatry: HeartHandshake,
  cardiology: HeartPulse,
  nuclear: Radiation,
  general: Stethoscope,
  emergency: Siren,
  eye: Eye,
  gastro: Soup,
  gynecology: Venus,
  urology: Droplet,
  bone: Bone,
  oncology: Ribbon,
  plastic: Scissors,
  endocrine: Dna,
  ent: Ear,
};

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

export function AppIcon({
  name,
  size = 24,
  color = '#334155',
  strokeWidth = 2,
  style,
}: AppIconProps) {
  const Icon = ICONS[name];
  return <Icon size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}

export const TAB_ACTIVE_COLOR = '#0066ff';
export const TAB_INACTIVE_COLOR = '#a2aab8';
