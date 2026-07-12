import { ActivityIndicator, FlatList, Linking, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon';
import { Button } from '../../components/Button';
import { API_URL } from '../../constants/config';
import { api, getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import type { ApiResponse, Doctor, PaginatedResponse } from '../../types';
import type { AdminStackParamList } from '../../navigation/AdminStack';
import { UI } from '../../theme/ui';

type Props = NativeStackScreenProps<AdminStackParamList, 'PendingDoctors'>;

function resolveCertificateUrl(certificate?: string | null): string | null {
  if (!certificate) return null;
  if (certificate.startsWith('http')) return certificate;
  const base = API_URL.replace(/\/api$/, '');
  return `${base}${certificate}`;
}

export function AdminPendingDoctorsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin', 'pending-doctors'],
    queryFn: async () => {
      const { data: response } = await api.get<ApiResponse<PaginatedResponse<Doctor>>>(
        '/admin/doctors/pending',
        { params: { limit: 50 } },
      );
      return response.data?.items ?? [];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
      api.patch(`/admin/doctors/${id}/verify`, { status }),
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
        <Text className="text-2xl font-bold text-slate-900">{t('admin.pendingDoctors')}</Text>
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
          ListEmptyComponent={
            <View className="mt-16 items-center">
              <AppIcon name="pending" size={40} color="#94A3B8" />
              <Text className="mt-4 text-slate-500">{t('admin.noPendingDoctors')}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const certificateUrl = resolveCertificateUrl(item.certificate);
            return (
              <View className="mb-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <View className="mb-3 flex-row items-start">
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-card bg-primary-light">
                    <AppIcon name="doctors" size={22} color={UI.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-slate-900">{item.name}</Text>
                    <Text className="text-sm text-primary">{item.specialization}</Text>
                    <Text className="mt-1 text-xs text-slate-500">{item.email}</Text>
                    <Text className="text-xs text-slate-500">{item.phone} · {item.city}</Text>
                  </View>
                </View>

                {certificateUrl ? (
                  <Pressable
                    onPress={() => void Linking.openURL(certificateUrl)}
                    className="mb-3 rounded-btn bg-primary-light px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-primary">{t('admin.viewCertificate')}</Text>
                  </Pressable>
                ) : (
                  <Text className="mb-3 text-sm text-amber-600">{t('admin.noCertificate')}</Text>
                )}

                <View className="flex-row gap-2">
                  <Button
                    title={t('admin.approve')}
                    loading={verifyMutation.isPending}
                    onPress={() => verifyMutation.mutate({ id: item.id, status: 'ACTIVE' })}
                    className="flex-1"
                  />
                  <Button
                    title={t('admin.reject')}
                    variant="outline"
                    loading={verifyMutation.isPending}
                    onPress={() => verifyMutation.mutate({ id: item.id, status: 'SUSPENDED' })}
                    className="flex-1"
                  />
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
