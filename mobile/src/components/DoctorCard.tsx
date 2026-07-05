import { useState } from 'react';
import { I18nManager, Image, Pressable, Text, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon, type AppIconName } from './AppIcon';
import { useTypography } from '../hooks/useTypography';
import { UI, cardShadowStyle } from '../theme/ui';
import { getDoctorDisplayLocation } from '../utils/doctorLocation';
import type { Doctor } from '../types';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
}

const CARD = {
  background: UI.surface,
  border: UI.border,
  title: UI.text.primary,
  muted: UI.text.secondary,
  accent: UI.primary,
  divider: UI.border,
  avatarRing: UI.primaryLight,
  avatarSurface: UI.primaryLight,
  star: '#F59E0B',
  badgeSurface: UI.primaryLight,
} as const;

function DoctorAvatar({ uri }: { uri?: string | null }) {
  const [failed, setFailed] = useState(false);
  const showImage = !!uri && !failed;

  return (
    <View
      className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full"
      style={{ backgroundColor: CARD.avatarSurface, borderWidth: 3, borderColor: CARD.avatarRing }}
    >
      {showImage ? (
        <Image
          source={{ uri: uri as string }}
          style={{ height: '100%', width: '100%' }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <AppIcon name="doctors" size={30} color={CARD.accent} strokeWidth={2.25} />
      )}
    </View>
  );
}

interface StatProps {
  icon: AppIconName;
  label: string;
  value: string;
  isRtl: boolean;
}

function Stat({ icon, label, value, isRtl }: StatProps) {
  return (
    <View className="flex-1 px-1" style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
      <View
        className="flex-row items-center gap-1"
        style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
      >
        <AppIcon name={icon} size={12} color={CARD.muted} strokeWidth={2} />
        <Text className="text-[10px] font-medium" style={{ color: CARD.muted }} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text
        className="mt-1 text-[13px] font-semibold"
        style={{ color: CARD.title, textAlign: isRtl ? 'right' : 'left' }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const { t, i18n } = useTranslation();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';
  const typography = useTypography();

  const displayLocation = getDoctorDisplayLocation(doctor);
  const hasRating = (doctor.rating ?? 0) > 0;
  const ratingValue = (doctor.rating ?? 0).toFixed(1);
  const rowDirection: ViewStyle['flexDirection'] = isRtl ? 'row-reverse' : 'row';

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 overflow-hidden rounded-[24px] active:opacity-90"
      style={{
        backgroundColor: CARD.background,
        borderWidth: 1,
        borderColor: CARD.border,
        ...cardShadowStyle(),
      }}
    >
      <View className="items-end px-4 pt-4" style={{ alignItems: isRtl ? 'flex-start' : 'flex-end' }}>
        <View
          className="items-center gap-1 rounded-full px-3 py-1"
          style={{ flexDirection: rowDirection, backgroundColor: CARD.badgeSurface }}
        >
          <Text className="text-[12px]" style={{ color: CARD.star }}>
            ★
          </Text>
          <Text className="text-[12px] font-bold" style={{ color: CARD.accent }}>
            {hasRating ? ratingValue : t('doctorCard.new')}
          </Text>
        </View>
      </View>

      <View className="px-5 pt-4" style={{ flexDirection: rowDirection, alignItems: 'center' }}>
        <DoctorAvatar uri={doctor.image} />
        <View
          className="flex-1 justify-center rounded-2xl px-3.5 py-2.5"
          style={{
            marginHorizontal: 12,
            backgroundColor: UI.input,
            borderWidth: 1,
            borderColor: CARD.border,
          }}
        >
          <Text
            className="text-[17px]"
            style={{
              color: CARD.title,
              fontFamily: typography.fontFamily,
              fontWeight: typography.headingWeight,
              textAlign: isRtl ? 'right' : 'left',
            }}
            numberOfLines={1}
          >
            {doctor.name}
          </Text>
          <View className="mt-1 items-center gap-1" style={{ flexDirection: rowDirection }}>
            <AppIcon name="doctors" size={12} color={CARD.accent} strokeWidth={2} />
            <Text
              className="flex-1 text-[12px] font-medium"
              style={{ color: CARD.accent, textAlign: isRtl ? 'right' : 'left' }}
              numberOfLines={1}
            >
              {doctor.specialization}
            </Text>
          </View>
        </View>
      </View>

      <View className="mx-5 mt-4 h-px" style={{ backgroundColor: CARD.divider }} />

      <View className="px-4 pb-3 pt-3" style={{ flexDirection: rowDirection }}>
        <Stat icon="clinic" label={t('doctorCard.city')} value={doctor.city} isRtl={isRtl} />
        <View className="w-px self-stretch" style={{ backgroundColor: CARD.divider }} />
        <Stat
          icon="location"
          label={t('doctorCard.location')}
          value={displayLocation ?? '—'}
          isRtl={isRtl}
        />
      </View>

      {doctor.phone ? (
        <View
          className="items-center justify-center gap-2 px-4 py-3"
          style={{
            flexDirection: rowDirection,
            borderTopWidth: 1,
            borderTopColor: CARD.divider,
          }}
        >
          <AppIcon name="phone" size={14} color={CARD.accent} strokeWidth={2.25} />
          <Text
            className="text-[13px] font-semibold"
            style={{ color: CARD.title, letterSpacing: 0.5 }}
          >
            {doctor.phone}
          </Text>
        </View>
      ) : (
        <View className="pb-3" />
      )}
    </Pressable>
  );
}
