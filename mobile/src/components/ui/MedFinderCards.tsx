import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon, type AppIconName } from '../AppIcon';
import { UI, solidCardStyle, subtleSurfaceStyle } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';
import { formatDoctorRatingLabel } from '../../utils/doctorRating';
import type { Doctor } from '../../types';

interface DoctorHorizontalCardProps {
  doctor: Doctor;
  onPress: () => void;
  onBook: () => void;
}

export function DoctorHorizontalCard({ doctor, onPress, onBook }: DoctorHorizontalCardProps) {
  const { t } = useTranslation();
  const typography = useTypography();
  const ratingLabel = formatDoctorRatingLabel(doctor.rating);

  return (
    <Pressable
      onPress={onPress}
      className="mr-4 w-48 rounded-card p-4 active:opacity-90"
      style={solidCardStyle()}
    >
      <View className="mb-2 flex-row items-center justify-end">
        <Text className="text-sm font-bold text-amber-500">{ratingLabel}</Text>
      </View>

      <Text
        className="text-sm text-heading"
        style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
        numberOfLines={1}
      >
        {doctor.name}
      </Text>
      <Text className="mt-1 text-xs text-body" numberOfLines={2}>
        {doctor.specialization}
      </Text>

      <View className="mt-4">
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onBook();
          }}
          className="self-start rounded-pill px-4 py-2 active:opacity-80"
          style={[{ backgroundColor: UI.primary }, solidCardStyle()]}
        >
          <Text className="text-xs font-bold text-white">{t('home.bookShort')}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

interface CategoryChipProps {
  label: string;
  icon: AppIconName;
  active?: boolean;
  onPress: () => void;
}

export function CategoryChip({ label, icon, active, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-2 shrink-0 flex-row items-center gap-2 rounded-pill px-4 active:opacity-90"
      style={{
        height: 40,
        backgroundColor: active ? UI.primary : UI.backgrounds.cardPure,
        ...(active ? solidCardStyle() : subtleSurfaceStyle()),
      }}
    >
      <AppIcon name={icon} size={15} color={active ? '#FFFFFF' : UI.primary} strokeWidth={2.25} />
      <Text
        className="text-xs font-semibold"
        numberOfLines={1}
        style={{ color: active ? '#FFFFFF' : UI.text.primary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface CategoryChipRowProps {
  children: ReactNode;
  className?: string;
}

export function CategoryChipRow({ children, className }: CategoryChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      className={className}
      style={{ flexGrow: 0, flexShrink: 0, maxHeight: 44 }}
      contentContainerStyle={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'nowrap',
        paddingVertical: 2,
        paddingHorizontal: 2,
      }}
    >
      {children}
    </ScrollView>
  );
}
