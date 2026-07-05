import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon';
import { BackButton } from '../../components/BackButton';
import { DoctorCard } from '../../components/DoctorCard';
import { Input } from '../../components/Input';
import { CategoryChip, CategoryChipRow } from '../../components/ui/MedFinderCards';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { SPECIALTY_CATEGORIES, getSpecializationFilter, UI } from '../../theme/ui';
import { api } from '../../services/api';
import type { ApiResponse, Doctor, PaginatedResponse } from '../../types';
import type { PatientStackParamList } from '../../navigation/PatientTabs';

type Props = NativeStackScreenProps<PatientStackParamList, 'Search'>;

export function SearchDoctorsScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const initialCategory = route.params?.initialCategory ?? 'all';
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [category, setCategory] = useState(initialCategory);

  const activeCategory = SPECIALTY_CATEGORIES.find((c) => c.id === category) ?? SPECIALTY_CATEGORIES[0];
  const specializationFilter = getSpecializationFilter(activeCategory.id);
  const searchQuery = query.trim() || undefined;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['doctors', searchQuery, category],
    queryFn: async () => {
      const { data: response } = await api.get<ApiResponse<PaginatedResponse<Doctor>>>('/doctors', {
        params: {
          q: searchQuery,
          specialization: specializationFilter,
          limit: 30,
        },
      });
      return response.data;
    },
  });

  const selectCategory = (categoryId: string) => {
    setCategory(categoryId);
    setQuery('');
  };

  return (
    <ScreenShell scroll={false} bottomInset={24}>
      <View className="mb-4 flex-row items-center gap-3">
        <BackButton onPress={() => navigation.goBack()} className="mb-0" />
        <Text className="flex-1 text-xl font-bold" style={{ color: UI.text.primary }}>
          {t('search.title')}
        </Text>
      </View>

      <Input
        placeholder={t('home.searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
        className="mb-3 rounded-card"
      />

      <Text className="mb-2 text-sm font-semibold" style={{ color: UI.text.primary }}>
        {t('search.filterSpecialty')}
      </Text>

      <CategoryChipRow className="mb-3">
        {SPECIALTY_CATEGORIES.map((item) => (
          <CategoryChip
            key={item.id}
            label={t(item.labelKey)}
            icon={item.icon}
            active={category === item.id}
            onPress={() => selectCategory(item.id)}
          />
        ))}
      </CategoryChipRow>

      <Text className="mb-3 text-sm" style={{ color: UI.text.secondary }}>
        {t('search.results', { count: data?.items.length ?? 0 })}
      </Text>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={UI.primary} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-6"
          ListEmptyComponent={
            <View className="mt-10 items-center">
              <Text style={{ color: UI.text.secondary }}>{t('common.noResults')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <DoctorCard
              doctor={item}
              onPress={() => navigation.navigate('DoctorProfile', { doctorId: item.id })}
            />
          )}
        />
      )}
    </ScreenShell>
  );
}
