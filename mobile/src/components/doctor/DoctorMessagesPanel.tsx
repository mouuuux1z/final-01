import { FlatList, Pressable, Text, View } from 'react-native';
import { AppLoader } from '../AppLoader';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { AppIcon } from '../AppIcon';
import { Card } from '../Card';
import type { Appointment, PatientUser } from '../../types';
import type { DoctorWorkspaceApi } from '../../services/doctorWorkspaceApi';
import { UI } from '../../theme/ui';

interface DoctorMessagesPanelProps {
  workspaceApi: DoctorWorkspaceApi;
  queryKeyPrefix: readonly unknown[];
  onOpenChat: (patient: Pick<PatientUser, 'id' | 'name'>) => void;
}

function collectPatients(appointments: Appointment[]): PatientUser[] {
  const seen = new Map<string, PatientUser>();

  for (const appointment of appointments) {
    if (appointment.patient && !seen.has(appointment.patient.id)) {
      seen.set(appointment.patient.id, {
        id: appointment.patient.id,
        name: appointment.patient.name,
        phone: appointment.patient.phone,
        email: appointment.patient.email ?? '',
        status: 'ACTIVE',
        attendancePoints: appointment.patient.attendancePoints,
      });
      continue;
    }

    if (appointment.patientName && appointment.patientPhone) {
      const manualKey = `manual:${appointment.patientPhone}`;
      if (!seen.has(manualKey)) {
        seen.set(manualKey, {
          id: manualKey,
          name: appointment.patientName,
          phone: appointment.patientPhone,
          email: '',
          status: 'ACTIVE',
        });
      }
    }
  }

  return Array.from(seen.values()).filter((patient) => !patient.id.startsWith('manual:'));
}

export function DoctorMessagesPanel({
  workspaceApi,
  queryKeyPrefix,
  onOpenChat,
}: DoctorMessagesPanelProps) {
  const { t } = useTranslation();

  const { data: appointments, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKeyPrefix, 'appointments', 'messages'],
    queryFn: () => workspaceApi.listAppointments({ limit: 100 }),
    retry: 1,
  });

  const patients = useMemo(() => collectPatients(appointments ?? []), [appointments]);

  if (isLoading) {
    return <AppLoader className="my-10" color={UI.primary} />;
  }

  if (isError) {
    return (
      <View className="mt-10 items-center px-6">
        <Text className="mb-3 text-slate-500">{t('common.error')}</Text>
        <Pressable onPress={() => void refetch()} className="rounded-pill px-4 py-2" style={{ backgroundColor: UI.primary }}>
          <Text className="text-sm font-semibold text-white">{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      data={patients}
      keyExtractor={(item) => item.id}
      contentContainerClassName="px-6 pb-10"
      ListEmptyComponent={
        <View className="mt-10 items-center">
          <AppIcon name="messages" size={40} color="#CBD5E1" strokeWidth={1.75} />
          <Text className="mt-3 text-center text-slate-500">{t('doctor.noPatients')}</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <Card className="mb-3">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 min-w-[40px] items-center justify-center rounded-card bg-primary px-2">
              <Text className="text-sm font-bold text-white">{index + 1}</Text>
            </View>
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary-light">
              <AppIcon name="profile" size={22} color={UI.primary} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-slate-900">{item.name}</Text>
              <Text className="text-sm text-slate-500">{item.phone}</Text>
            </View>
            <Pressable
              onPress={() => onOpenChat({ id: item.id, name: item.name })}
              className="rounded-btn bg-primary px-3 py-2"
            >
              <Text className="text-xs font-semibold text-white">{t('chat.message')}</Text>
            </Pressable>
          </View>
        </Card>
      )}
    />
  );
}
