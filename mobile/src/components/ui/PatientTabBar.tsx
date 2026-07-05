import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useChatStore } from '../../store/chatStore';
import { GlassBottomTabBar, type TabBarRouteConfig } from './GlassBottomTabBar';

const PATIENT_TAB_ROUTES: Record<string, TabBarRouteConfig> = {
  Home: { icon: 'home', labelKey: 'tabs.home' },
  Appointments: { icon: 'calendar', labelKey: 'tabs.appointments' },
  Messages: { icon: 'messages', labelKey: 'tabs.notifications' },
  Profile: { icon: 'profile', labelKey: 'tabs.myAccount' },
};

export function PatientTabBar(props: BottomTabBarProps) {
  const unreadCounts = useChatStore((s) => s.unreadCounts);
  const hasUnread = Object.values(unreadCounts).some((count) => count > 0);

  return (
    <GlassBottomTabBar
      {...props}
      routes={PATIENT_TAB_ROUTES}
      showBadgeForRoute={(route) => route === 'Messages' && hasUnread}
    />
  );
}
