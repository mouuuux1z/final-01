import { ActivityIndicator, I18nManager, Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppModal, appModalStyles } from '../AppModal';
import { Button } from '../Button';
import { Input } from '../Input';
import { getApiErrorMessage } from '../../services/api';
import { getAppointmentDateKey, getDayChipLabels } from '../../utils/appointmentHelpers';
import type { DoctorAvailabilitySlot } from '../../types';
import { UI } from '../../theme/ui';

interface ManualBookingModalProps {
  visible: boolean;
  onClose: () => void;
  slots: DoctorAvailabilitySlot[];
  slotsLoading?: boolean;
  onSubmit: (payload: {
    patientName: string;
    patientPhone?: string;
    date: string;
    time: string;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
}

function getSlotDateKey(slot: DoctorAvailabilitySlot): string {
  return getAppointmentDateKey(slot.date);
}

export function ManualBookingModal({
  visible,
  onClose,
  slots,
  slotsLoading = false,
  onSubmit,
  loading,
}: ManualBookingModalProps) {
  const { t, i18n } = useTranslation();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';
  const [step, setStep] = useState<1 | 2>(1);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, DoctorAvailabilitySlot[]>();

    for (const slot of slots) {
      const dateKey = getSlotDateKey(slot);
      const existing = grouped.get(dateKey) ?? [];
      existing.push(slot);
      grouped.set(dateKey, existing);
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, daySlots]) => ({
        date,
        slots: daySlots.sort((a, b) => a.time.localeCompare(b.time)),
      }));
  }, [slots]);

  const selectedDaySlots = useMemo(() => {
    if (!selectedDate) return [];
    return slotsByDate.find((day) => day.date === selectedDate)?.slots ?? [];
  }, [selectedDate, slotsByDate]);

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);

  useEffect(() => {
    if (!visible) {
      setStep(1);
      setPatientName('');
      setPatientPhone('');
      setNotes('');
      setSelectedDate(null);
      setSelectedSlotId(null);
      setSubmitError(null);
      return;
    }

    if (slotsByDate.length === 0) {
      setSelectedDate(null);
      setSelectedSlotId(null);
      return;
    }

    setSelectedDate((current) => {
      if (current && slotsByDate.some((day) => day.date === current)) {
        return current;
      }
      return slotsByDate[0].date;
    });
  }, [visible, slotsByDate]);

  useEffect(() => {
    if (!selectedSlotId || !selectedDate) return;

    const slot = slots.find((item) => item.id === selectedSlotId);
    if (slot && getSlotDateKey(slot) !== selectedDate) {
      setSelectedSlotId(null);
    }
  }, [selectedDate, selectedSlotId, slots]);

  const handleSubmit = async () => {
    if (!selectedSlot) return;

    setSubmitError(null);
    try {
      await onSubmit({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim() || undefined,
        date: getSlotDateKey(selectedSlot),
        time: selectedSlot.time,
        notes: notes.trim() || undefined,
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  const goToSlotStep = () => {
    if (!patientName.trim()) {
      setSubmitError(t('doctor.manualBookingNameRequired'));
      return;
    }
    setSubmitError(null);
    setStep(2);
  };

  return (
    <AppModal visible={visible} onRequestClose={onClose} onBackdropPress={onClose}>
      <View style={appModalStyles.body} className="px-6 pt-6">
        <View
          className="mb-4 items-center justify-between"
          style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
        >
          <View className="flex-1">
            <Text
              className="text-xl font-bold text-slate-900"
              style={{ textAlign: isRtl ? 'right' : 'left' }}
            >
              {t('doctor.manualBookingTitle')}
            </Text>
            <Text
              className="mt-1 text-sm text-slate-500"
              style={{ textAlign: isRtl ? 'right' : 'left' }}
            >
              {step === 1 ? t('doctor.manualBookingStepPatient') : t('doctor.manualBookingStepSlot')}
            </Text>
          </View>
          <Pressable onPress={onClose} className="rounded-full bg-slate-100 px-3 py-1">
            <Text className="text-sm font-medium text-slate-600">{t('common.cancel')}</Text>
          </Pressable>
        </View>

        <View className="mb-4 flex-row gap-2">
          {[1, 2].map((value) => (
            <View
              key={value}
              className="h-1.5 flex-1 rounded-full"
              style={{ backgroundColor: step >= value ? UI.primary : UI.border }}
            />
          ))}
        </View>

        <ScrollView
          style={appModalStyles.scroll}
          contentContainerStyle={appModalStyles.scrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {step === 1 ? (
            <>
              <Input label={t('doctor.patientName')} value={patientName} onChangeText={setPatientName} />
              <Input
                label={t('auth.phone')}
                value={patientPhone}
                onChangeText={setPatientPhone}
                keyboardType="phone-pad"
                placeholder={t('auth.phoneHint')}
              />
              <Input
                label={t('appointments.notes')}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                className="min-h-[80px]"
              />
              {submitError ? (
                <Text className="mb-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-error">{submitError}</Text>
              ) : null}
              <Button title={t('doctor.manualBookingNext')} onPress={goToSlotStep} disabled={!patientName.trim()} />
            </>
          ) : (
            <>
              <Text
                className="mb-1 text-sm font-semibold text-slate-700"
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              >
                {t('doctor.manualBookingSelectSlotHint')}
              </Text>
              <Text
                className="mb-4 text-xs text-slate-500"
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              >
                {patientName.trim()}
              </Text>

              {slotsLoading ? (
                <ActivityIndicator color={UI.primary} className="mb-4" />
              ) : slotsByDate.length === 0 ? (
                <Text
                  className="mb-4 text-sm text-slate-500"
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                  {t('doctor.noAvailableSlots')}
                </Text>
              ) : (
                <>
                  <Text
                    className="mb-3 text-sm font-semibold text-slate-700"
                    style={{ textAlign: isRtl ? 'right' : 'left' }}
                  >
                    {t('appointments.selectDate')}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                    className="mb-4"
                    contentContainerClassName="gap-2 pr-2"
                  >
                    {slotsByDate.map((day) => {
                      const selected = selectedDate === day.date;
                      const labels = getDayChipLabels(day.date, t, i18n.language);
                      return (
                        <Pressable
                          key={day.date}
                          onPress={() => {
                            setSelectedDate(day.date);
                            setSelectedSlotId(null);
                          }}
                          className={`min-w-[76px] rounded-card border px-3 py-2.5 ${selected ? 'border-primary bg-primary' : 'border-slate-200 bg-white'}`}
                        >
                          <Text className={`text-center text-lg font-bold ${selected ? 'text-white' : 'text-slate-900'}`}>
                            {labels.dayNumber}
                          </Text>
                          <Text className={`text-center text-xs font-semibold ${selected ? 'text-blue-100' : 'text-slate-600'}`}>
                            {labels.weekday}
                          </Text>
                          <Text className={`text-center text-[10px] ${selected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {labels.month}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <Text
                    className="mb-3 text-sm font-semibold text-slate-700"
                    style={{ textAlign: isRtl ? 'right' : 'left' }}
                  >
                    {t('appointments.selectTime')}
                  </Text>
                  {selectedDaySlots.length === 0 ? (
                    <Text
                      className="mb-4 text-sm text-slate-500"
                      style={{ textAlign: isRtl ? 'right' : 'left' }}
                    >
                      {t('doctor.noAvailableSlots')}
                    </Text>
                  ) : (
                    <View className="mb-4 flex-row flex-wrap gap-2">
                      {selectedDaySlots.map((slot) => {
                        const selected = selectedSlotId === slot.id;
                        const labels = getDayChipLabels(getSlotDateKey(slot), t, i18n.language);
                        return (
                          <Pressable
                            key={slot.id}
                            onPress={() => setSelectedSlotId(slot.id)}
                            className={`min-w-[88px] rounded-btn border px-4 py-2.5 ${selected ? 'border-primary bg-primary' : 'border-slate-200 bg-white'}`}
                          >
                            <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-slate-700'}`}>
                              {slot.time}
                            </Text>
                            <Text className={`mt-0.5 text-[10px] ${selected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {labels.weekday} {labels.dayNumber}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </>
              )}

              {submitError ? (
                <Text className="mb-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-error">{submitError}</Text>
              ) : null}

              <View className="gap-3">
                <Button
                  title={t('doctor.createManualBooking')}
                  loading={loading}
                  disabled={!selectedSlot}
                  onPress={() => void handleSubmit()}
                />
                <Button title={t('common.back')} variant="outline" onPress={() => setStep(1)} />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </AppModal>
  );
}
