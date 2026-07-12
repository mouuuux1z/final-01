import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoryChip, CategoryChipRow } from '../../components/ui/MedFinderCards';
import { CommitmentBalanceCard } from '../../components/ui/CommitmentBalanceCard';
import { PatientHeader, SearchHero, SectionHeader } from '../../components/ui/PatientHeader';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { DoctorCard } from '../../components/DoctorCard';
import { SPECIALTY_CATEGORIES, UI } from '../../theme/ui';
import { api } from '../../services/api';
import type { ApiResponse, Doctor, PaginatedResponse } from '../../types';
import type { PatientStackParamList, PatientTabParamList } from '../../navigation/PatientTabs';

type Props = CompositeScreenProps<
  BottomTabScreenProps<PatientTabParamList, 'Home'>,
  NativeStackScreenProps<PatientStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', 'home'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Doctor>>>('/doctors', {
        params: { limit: 20 },
      });
      return (data.data?.items ?? []).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    },
    staleTime: 120_000,
    retry: 1,
  });

  const topDoctors = doctors ?? [];

  const openCategory = (categoryId: string) => {
    navigation.navigate('Search', {
      initialCategory: categoryId !== 'all' ? categoryId : undefined,
    });
  };

  return (
    <ScreenShell contentContainerClassName="pb-4">
      <PatientHeader />

      <CommitmentBalanceCard />

      <SearchHero onPress={() => navigation.navigate('Search')} />

      <CategoryChipRow className="mb-4">
        {SPECIALTY_CATEGORIES.map((item) => (
          <CategoryChip
            key={item.id}
            label={t(item.labelKey)}
            icon={item.icon}
            onPress={() => openCategory(item.id)}
          />
        ))}
      </CategoryChipRow>

      <SectionHeader
        title={t('home.availableDoctors')}
        actionLabel={t('home.more')}
        onAction={() => navigation.navigate('Search')}
      />

      {isLoading ? (
        <ActivityIndicator color={UI.primary} className="my-8" />
      ) : topDoctors.length === 0 ? (
        <Pressable
          onPress={() => navigation.navigate('Search')}
          className="my-6 items-center rounded-card border bg-white px-6 py-8 active:opacity-90"
          style={{ borderColor: UI.border }}
        >
          <Text className="text-center text-sm" style={{ color: UI.text.secondary }}>
            {t('home.noDoctors')}
          </Text>
        </Pressable>
      ) : (
        <View className="mb-2">
          {topDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onPress={() => navigation.navigate('DoctorProfile', { doctorId: doctor.id })}
            />
          ))}
        </View>
      )}

    </ScreenShell>
  );
}
