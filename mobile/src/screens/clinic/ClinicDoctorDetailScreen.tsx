import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon';
import { Button } from '../../components/Button';
import { DoctorAppointmentsPanel } from '../../components/doctor/DoctorAppointmentsPanel';
import { DoctorSchedulePanel } from '../../components/doctor/DoctorSchedulePanel';
import { DoctorMessagesPanel } from '../../components/doctor/DoctorMessagesPanel';
import { api, getApiErrorMessage } from '../../services/api';
import { createDoctorWorkspaceApi } from '../../services/doctorWorkspaceApi';
import { confirmAlert, showAlert } from '../../utils/alert';
import type { ApiResponse, ClinicProfile, DoctorUser } from '../../types';
import type { ClinicStackParamList } from '../../navigation/ClinicStack';
import { UI } from '../../theme/ui';

type Props = NativeStackScreenProps<ClinicStackParamList, 'DoctorDetail'>;
type WorkspaceTab = 'appointments' | 'schedule' | 'messages';

const STATUS_LABELS: Record<DoctorUser['status'], string> = {
  ACTIVE: 'clinic.active',
  PENDING: 'common.pending',
  SUSPENDED: 'common.cancelled',
  DISABLED: 'clinic.disabled',
  INACTIVE: 'clinic.disabled',
};

export function ClinicDoctorDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { doctorId } = route.params;
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('appointments');

  const { data: clinic, isLoading } = useQuery({
    queryKey: ['clinic', 'me'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ClinicProfile>>('/clinics/me');
      return data.data;
    },
  });

  const doctor = clinic?.doctors?.find((item) => item.id === doctorId);
  const doctorIndex = clinic?.doctors?.findIndex((item) => item.id === doctorId) ?? -1;

  const workspaceApi = useMemo(
    () => createDoctorWorkspaceApi('clinic', doctorId),
    [doctorId],
  );
  const queryKeyPrefix = useMemo(() => ['clinic', 'doctor', doctorId] as const, [doctorId]);

  const statusMutation = useMutation({
    mutationFn: (status: 'ACTIVE' | 'DISABLED') =>
      api.patch(`/clinics/me/doctors/${doctorId}/status`, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clinic'] });
      showAlert(t('common.success'), t('clinic.doctorStatusUpdated'));
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const handleDisable = async () => {
    const confirmed = await confirmAlert(
      t('clinic.disableDoctor'),
      t('clinic.disableDoctorConfirm'),
      t('clinic.disableDoctor'),
      t('common.cancel'),
    );
    if (confirmed) statusMutation.mutate('DISABLED');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={UI.primary} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-slate-500">{t('clinic.doctorNotFound')}</Text>
        <Button title={t('common.back')} variant="outline" onPress={() => navigation.goBack()} className="mt-4" />
      </View>
    );
  }

  const isActive = doctor.status === 'ACTIVE';

  return (
    <View className="flex-1">
      <View
        className="mx-4 mt-3 bg-primary px-6 pb-6 pt-12"
        style={{
          borderRadius: UI.radius.card,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.25)',
          overflow: 'hidden',
        }}
      >
        <Pressable onPress={() => navigation.goBack()} className="mb-4 self-start">
          <Text className="text-sm font-medium text-white">{t('common.back')}</Text>
        </Pressable>

        <View className="flex-row items-start">
          <View className="mr-3 h-14 w-14 items-center justify-center rounded-card bg-white/20">
            <AppIcon name="doctors" size={28} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View className="flex-1">
            {doctorIndex >= 0 ? (
              <Text className="text-xs font-medium text-blue-100">
                {t('clinic.doctorNumber', { number: doctorIndex + 1 })}
              </Text>
            ) : null}
            <Text className="text-xl font-bold text-white">{doctor.name}</Text>
            <Text className="text-sm text-blue-100">{doctor.specialization}</Text>

            <View className="mt-2 flex-row flex-wrap items-center gap-2">
              <View className={`rounded-full px-3 py-1 ${isActive ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                <Text className={`text-xs font-semibold ${isActive ? 'text-green-100' : 'text-red-100'}`}>
                  {t(STATUS_LABELS[doctor.status] as never)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {!isActive ? (
          <Button
            title={t('clinic.enableDoctor')}
            onPress={() => statusMutation.mutate('ACTIVE')}
            loading={statusMutation.isPending}
            className="mt-4"
          />
        ) : null}
      </View>

      <View
        className="mx-4 mt-3 flex-row overflow-hidden bg-white px-2"
        style={{
          borderRadius: UI.radius.card,
          borderWidth: 1,
          borderColor: UI.border,
        }}
      >
        {(['appointments', 'schedule', 'messages'] as WorkspaceTab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 border-b-2 py-3 ${activeTab === tab ? 'border-primary' : 'border-transparent'}`}
          >
            <Text className={`text-center text-sm font-semibold ${activeTab === tab ? 'text-primary' : 'text-slate-500'}`}>
              {tab === 'appointments'
                ? t('doctor.appointments')
                : tab === 'schedule'
                  ? t('doctor.schedule')
                  : t('chat.messages')}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-1 pt-4">
        {activeTab === 'appointments' ? (
          <DoctorAppointmentsPanel
            workspaceApi={workspaceApi}
            queryKeyPrefix={queryKeyPrefix}
            onOpenChat={(patient) =>
              navigation.navigate('Chat', {
                doctorId,
                patientId: patient.id,
                patientName: patient.name,
                chatMode: 'clinic',
              })
            }
          />
        ) : activeTab === 'schedule' ? (
          <DoctorSchedulePanel workspaceApi={workspaceApi} queryKeyPrefix={queryKeyPrefix} />
        ) : (
          <DoctorMessagesPanel
            workspaceApi={workspaceApi}
            queryKeyPrefix={queryKeyPrefix}
            onOpenChat={(patient) =>
              navigation.navigate('Chat', {
                doctorId,
                patientId: patient.id,
                patientName: patient.name,
                chatMode: 'clinic',
              })
            }
          />
        )}
      </View>

      {isActive ? (
        <View className="items-center border-t border-slate-100 bg-white px-6 py-3">
          <Pressable
            onPress={() => void handleDisable()}
            disabled={statusMutation.isPending}
            className="rounded-btn border border-red-200 bg-red-50 px-4 py-2 active:opacity-80"
            style={statusMutation.isPending ? { opacity: 0.5 } : undefined}
          >
            {statusMutation.isPending ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Text className="text-xs font-semibold text-red-600">{t('clinic.disableDoctor')}</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
