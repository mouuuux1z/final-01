import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DoctorSchedulePanel } from '../../components/doctor/DoctorSchedulePanel';
import { createDoctorWorkspaceApi } from '../../services/doctorWorkspaceApi';

export function DoctorScheduleScreen() {
  const { t } = useTranslation();
  const workspaceApi = useMemo(() => createDoctorWorkspaceApi('doctor'), []);
  const queryKeyPrefix = useMemo(() => ['doctor', 'workspace'], []);

  return (
    <View className="flex-1 pt-14">
      <View className="px-6">
        <Text className="mb-1 text-3xl font-bold text-slate-900">{t('doctor.schedule')}</Text>
        <Text className="mb-4 text-base text-slate-500">{t('doctor.scheduleManagementHint')}</Text>
      </View>
      <DoctorSchedulePanel workspaceApi={workspaceApi} queryKeyPrefix={queryKeyPrefix} />
    </View>
  );
}
