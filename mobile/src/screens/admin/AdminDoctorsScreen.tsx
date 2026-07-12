import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon';
import { Button } from '../../components/Button';
import { api, getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import type { ApiResponse, Doctor, EntityStatus, PaginatedResponse } from '../../types';
import type { AdminStackParamList } from '../../navigation/AdminStack';
import { UI } from '../../theme/ui';

type Props = NativeStackScreenProps<AdminStackParamList, 'AllDoctors'>;

const STATUS_COLORS: Record<EntityStatus, string> = {
  ACTIVE: 'text-success',
  PENDING: 'text-amber-600',
  SUSPENDED: 'text-error',
  DISABLED: 'text-error',
  INACTIVE: 'text-slate-500',
};

export function AdminDoctorsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin', 'all-doctors'],
    queryFn: async () => {
      const { data: response } = await api.get<ApiResponse<PaginatedResponse<Doctor>>>(
        '/admin/doctors',
        { params: { limit: 100 } },
      );
      return response.data?.items ?? [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EntityStatus }) =>
      api.patch(`/admin/doctors/${id}/verify`, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void refetch();
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/doctors/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void refetch();
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  return (
    <View className="flex-1 pt-14">
      <View className="mb-4 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-2 self-start">
          <Text className="text-base font-medium text-primary">{t('common.back')}</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-slate-900">{t('admin.allDoctors')}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={UI.primary} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerClassName="px-6 pb-10"
          ListEmptyComponent={<Text className="mt-10 text-center text-slate-500">{t('common.noResults')}</Text>}
          renderItem={({ item }) => (
            <View className="mb-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1 flex-row">
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-card bg-primary-light">
                    <AppIcon name="doctors" size={22} color={UI.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-900">{item.name}</Text>
                    <Text className="text-sm text-primary">{item.specialization}</Text>
                    <Text className="text-xs text-slate-500">{item.email}</Text>
                  </View>
                </View>
                <Text className={`text-xs font-semibold uppercase ${STATUS_COLORS[item.status]}`}>
                  {item.status}
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {item.status !== 'ACTIVE' ? (
                  <Button
                    title={t('admin.approve')}
                    loading={updateMutation.isPending}
                    onPress={() => updateMutation.mutate({ id: item.id, status: 'ACTIVE' })}
                    className="min-w-[45%] flex-1"
                  />
                ) : null}
                {item.status === 'ACTIVE' ? (
                  <Button
                    title={t('admin.disable')}
                    variant="outline"
                    loading={updateMutation.isPending}
                    onPress={() => updateMutation.mutate({ id: item.id, status: 'DISABLED' })}
                    className="min-w-[45%] flex-1"
                  />
                ) : null}
                <Button
                  title={t('admin.delete')}
                  variant="danger"
                  loading={deleteMutation.isPending}
                  onPress={() => deleteMutation.mutate(item.id)}
                  className="min-w-[45%] flex-1"
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
