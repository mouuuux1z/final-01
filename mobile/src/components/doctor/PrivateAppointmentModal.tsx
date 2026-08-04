import { useEffect, useState } from 'react';
import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native';
import { AppLoader } from '../AppLoader';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { AppModal, appModalStyles } from '../AppModal';
import { Button } from '../Button';
import { Input } from '../Input';
import { getApiErrorMessage } from '../../services/api';
import { confirmAlert } from '../../utils/alert';
import { getAppointmentDateKey, toDateInputValue } from '../../utils/appointmentHelpers';
import { UI } from '../../theme/ui';
import type { Appointment } from '../../types';

interface PrivateAppointmentPatient {
  id: string;
  name: string;
  phone: string;
}

interface PrivateAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  loadPatients?: () => Promise<PrivateAppointmentPatient[]>;
  onSubmit: (payload: {
    patientName?: string;
    patientPhone?: string;
    patientId?: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  loading?: boolean;
  deleteLoading?: boolean;
}

export function PrivateAppointmentModal({
  visible,
  onClose,
  appointment,
  loadPatients,
  onSubmit,
  onDelete,
  loading = false,
  deleteLoading = false,
}: PrivateAppointmentModalProps) {
  const { t, i18n } = useTranslation();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';

  const [date, setDate] = useState(toDateInputValue());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['doctor', 'private-appointment-patients'],
    queryFn: () => (loadPatients ? loadPatients() : Promise.resolve([])),
    enabled: visible && Boolean(loadPatients),
  });

  useEffect(() => {
    if (!visible) {
      setSubmitError(null);
      return;
    }

    if (appointment) {
      setDate(getAppointmentDateKey(appointment.date));
      setStartTime(appointment.time || '09:00');
      setEndTime(appointment.endTime || '10:00');
      setPatientName(appointment.patientName || appointment.patient?.name || '');
      setPatientPhone(appointment.patientPhone || appointment.patient?.phone || '');
      setSelectedPatientId(appointment.patientId ?? null);
      setNotes(appointment.notes || '');
    } else {
      setDate(toDateInputValue());
      setStartTime('09:00');
      setEndTime('10:00');
      setPatientName('');
      setPatientPhone('');
      setSelectedPatientId(null);
      setNotes('');
    }
    setSubmitError(null);
  }, [visible, appointment]);

  const handleSelectPatient = (patient: PrivateAppointmentPatient) => {
    if (selectedPatientId === patient.id) {
      setSelectedPatientId(null);
      setPatientName('');
      setPatientPhone('');
      return;
    }
    setSelectedPatientId(patient.id);
    setPatientName(patient.name);
    setPatientPhone(patient.phone);
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!date.trim()) {
      setSubmitError(t('common.required'));
      return;
    }
    if (!startTime.trim() || !endTime.trim()) {
      setSubmitError(t('common.required'));
      return;
    }

    try {
      await onSubmit({
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        patientId: selectedPatientId ?? undefined,
        patientName: patientName.trim() || undefined,
        patientPhone: patientPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!appointment || !onDelete) return;

    const confirmed = await confirmAlert(
      t('doctor.privateAppointment'),
      t('doctor.deletePrivateAppointmentConfirm'),
      t('common.delete'),
      t('common.cancel'),
    );
    if (!confirmed) return;

    try {
      await onDelete(appointment.id);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  const isEditing = Boolean(appointment);

  return (
    <AppModal visible={visible} onRequestClose={onClose} onBackdropPress={onClose}>
      <View style={appModalStyles.body} className="px-6 pt-6">
        <View
          className="mb-3 items-center justify-between"
          style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
        >
          <View className="flex-1">
            <Text
              className="text-xl font-bold text-purple-900"
              style={{ textAlign: isRtl ? 'right' : 'left' }}
            >
              {isEditing
                ? t('doctor.editPrivateAppointmentTitle')
                : t('doctor.createPrivateAppointmentTitle')}
            </Text>
          </View>
          <Pressable onPress={onClose} className="rounded-full bg-slate-100 px-3 py-1">
            <Text className="text-sm font-medium text-slate-600">{t('common.cancel')}</Text>
          </Pressable>
        </View>

        <View className="mb-4 rounded-card border border-purple-200 bg-purple-50 p-3">
          <Text
            className="text-xs font-semibold text-purple-800"
            style={{ textAlign: isRtl ? 'right' : 'left' }}
          >
            🔒 {t('doctor.privateAppointmentNotice')}
          </Text>
        </View>

        <ScrollView
          style={appModalStyles.scroll}
          contentContainerStyle={appModalStyles.scrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <Input
            label={t('common.date')}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label={t('doctor.startTime')}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
              />
            </View>
            <View className="flex-1">
              <Input
                label={t('doctor.endTime')}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="10:00"
              />
            </View>
          </View>

          {loadPatients ? (
            <View className="mb-4">
              <Text
                className="mb-2 text-sm font-medium text-heading"
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              >
                {t('doctor.selectFromPatientList')}
              </Text>
              {patientsLoading ? (
                <AppLoader className="py-2" />
              ) : patients.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {patients.map((patient) => {
                    const selected = selectedPatientId === patient.id;
                    return (
                      <Pressable
                        key={patient.id}
                        onPress={() => handleSelectPatient(patient)}
                        className={`rounded-btn border px-3 py-2 active:opacity-80 ${
                          selected ? 'border-purple-500 bg-purple-100' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${selected ? 'text-purple-900' : 'text-body'}`}
                        >
                          {patient.name}
                        </Text>
                        {patient.phone ? (
                          <Text className={`text-xs ${selected ? 'text-purple-700' : 'text-on-sky-muted'}`}>
                            {patient.phone}
                          </Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <Text className="text-xs text-on-sky-muted" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {t('doctor.noPatientsYet')}
                </Text>
              )}
            </View>
          ) : null}

          <View className="mb-4 rounded-card border border-slate-100 bg-slate-50/80 p-4">
            <Text
              className="mb-3 text-sm font-semibold text-heading"
              style={{ textAlign: isRtl ? 'right' : 'left' }}
            >
              {t('doctor.patientInfoSection')}
            </Text>
            <Input
              label={t('auth.name')}
              value={patientName}
              onChangeText={(value) => {
                setPatientName(value);
                if (selectedPatientId) setSelectedPatientId(null);
              }}
              placeholder={t('doctor.patientNameOptional')}
            />
            <Input
              label={t('auth.phone')}
              value={patientPhone}
              onChangeText={(value) => {
                setPatientPhone(value);
                if (selectedPatientId) setSelectedPatientId(null);
              }}
              placeholder="05xxxxxxxx"
              keyboardType="phone-pad"
            />
          </View>

          <Input
            label={t('appointments.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            className="min-h-[70px]"
          />

          {submitError ? (
            <Text className="mb-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-error">
              {submitError}
            </Text>
          ) : null}

          <View className="gap-3 pt-2">
            <Button
              title={t('doctor.savePrivateAppointment')}
              loading={loading}
              onPress={() => void handleSubmit()}
            />
            {isEditing && onDelete ? (
              <Button
                title={t('common.delete')}
                variant="outline"
                loading={deleteLoading}
                onPress={() => void handleDelete()}
              />
            ) : null}
          </View>
        </ScrollView>
      </View>
    </AppModal>
  );
}
