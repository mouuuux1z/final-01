import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppModal, appModalStyles } from '../AppModal';
import { Button } from '../Button';
import { Input } from '../Input';
import { getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import { getDayChipLabels, getNextLocalDays } from '../../utils/appointmentHelpers';

const DAYS_AHEAD = 7;
const DEFAULT_DURATION = 30;

interface GenerateSlotsModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    dates: string[];
    startTime: string;
    endTime: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
  }) => Promise<void>;
  loading?: boolean;
}

function normalizeTimeInput(time: string): string {
  const trimmed = time.trim();
  const parts = trimmed.split(':');
  if (parts.length !== 2) return trimmed;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return trimmed;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function parseOptionalMinutes(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 5 || parsed > 240) return NaN;
  return parsed;
}

export function GenerateSlotsModal({ visible, onClose, onSubmit, loading }: GenerateSlotsModalProps) {
  const { t, i18n } = useTranslation();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [slotDuration, setSlotDuration] = useState('');
  const [gapMinutes, setGapMinutes] = useState('');
  const [breakStart, setBreakStart] = useState('');
  const [breakEnd, setBreakEnd] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const upcomingDates = useMemo(() => getNextLocalDays(DAYS_AHEAD, 0), []);

  useEffect(() => {
    if (!visible) {
      setSelectedDates([]);
      setSubmitError(null);
    }
  }, [visible]);

  const toggleDate = (dateKey: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateKey) ? prev.filter((d) => d !== dateKey) : [...prev, dateKey].sort(),
    );
  };

  const selectedDateLabels = useMemo(
    () =>
      selectedDates.map((dateKey) => {
        const labels = getDayChipLabels(dateKey, t, i18n.language);
        return `${labels.weekday} ${labels.dayNumber} ${labels.month}`;
      }),
    [selectedDates, t, i18n.language],
  );

  const handleSubmit = async () => {
    setSubmitError(null);

    if (selectedDates.length === 0) {
      showAlert(t('common.error'), t('doctor.selectGenerateDates'));
      return;
    }

    const duration = parseOptionalMinutes(slotDuration);
    if (Number.isNaN(duration)) {
      showAlert(t('common.error'), t('doctor.errors.invalidDuration'));
      return;
    }

    const gap = gapMinutes.trim() ? Number(gapMinutes.trim()) : 0;
    if (!Number.isInteger(gap) || gap < 0 || gap > 120) {
      showAlert(t('common.error'), t('doctor.errors.invalidGap'));
      return;
    }

    const hasBreakStart = breakStart.trim().length > 0;
    const hasBreakEnd = breakEnd.trim().length > 0;
    if (hasBreakStart !== hasBreakEnd) {
      showAlert(t('common.error'), t('doctor.errors.breakBothRequired'));
      return;
    }

    try {
      await onSubmit({
        dates: selectedDates,
        startTime: normalizeTimeInput(startTime),
        endTime: normalizeTimeInput(endTime),
        ...(duration !== undefined ? { slotDurationMinutes: duration } : {}),
        ...(gap > 0 ? { gapMinutes: gap } : {}),
        ...(hasBreakStart && hasBreakEnd
          ? { breakStart: normalizeTimeInput(breakStart), breakEnd: normalizeTimeInput(breakEnd) }
          : {}),
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  return (
    <AppModal visible={visible} onRequestClose={onClose} onBackdropPress={onClose}>
      <View style={appModalStyles.body} className="px-6 pt-6">
        <View
          className="mb-4 items-center justify-between"
          style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
        >
          <Text
            className="text-xl font-bold text-slate-900"
            style={{ textAlign: isRtl ? 'right' : 'left' }}
          >
            {t('doctor.generateSlotsTitle')}
          </Text>
          <Pressable onPress={onClose} className="rounded-full bg-slate-100 px-3 py-1">
            <Text className="text-sm font-medium text-slate-600">{t('common.cancel')}</Text>
          </Pressable>
        </View>

        <ScrollView
          style={appModalStyles.scroll}
          contentContainerStyle={appModalStyles.scrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <Text
            className="mb-3 text-sm font-semibold text-slate-700"
            style={{ textAlign: isRtl ? 'right' : 'left' }}
          >
            {t('doctor.selectGenerateDates')}
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {upcomingDates.map((dateKey) => {
              const selected = selectedDates.includes(dateKey);
              const labels = getDayChipLabels(dateKey, t, i18n.language);
              return (
                <Pressable
                  key={dateKey}
                  onPress={() => toggleDate(dateKey)}
                  className={`min-w-[88px] rounded-card border px-3 py-2.5 ${selected ? 'border-primary bg-primary' : 'border-slate-200 bg-white'}`}
                >
                  <Text
                    className={`text-center text-xs font-semibold ${selected ? 'text-blue-100' : 'text-slate-600'}`}
                  >
                    {labels.weekday}
                  </Text>
                  <Text
                    className={`text-center text-lg font-bold ${selected ? 'text-white' : 'text-slate-900'}`}
                  >
                    {labels.dayNumber}
                  </Text>
                  <Text
                    className={`text-center text-[10px] font-medium ${selected ? 'text-blue-100' : 'text-slate-400'}`}
                  >
                    {labels.month}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label={t('doctor.workStart')} value={startTime} onChangeText={setStartTime} placeholder="08:00" />
            </View>
            <View className="flex-1">
              <Input label={t('doctor.workEnd')} value={endTime} onChangeText={setEndTime} placeholder="16:00" />
            </View>
          </View>

          <Input
            label={t('doctor.slotDurationOptional')}
            value={slotDuration}
            onChangeText={setSlotDuration}
            keyboardType="number-pad"
            placeholder={t('doctor.slotDurationPlaceholder', { minutes: DEFAULT_DURATION })}
          />
          <Text className="mb-3 -mt-2 text-xs text-slate-500">
            {t('doctor.slotDurationDefaultHint', { minutes: DEFAULT_DURATION })}
          </Text>

          <Input
            label={t('doctor.gapMinutesOptional')}
            value={gapMinutes}
            onChangeText={setGapMinutes}
            keyboardType="number-pad"
            placeholder="0"
          />

          <Text className="mb-2 mt-1 text-sm font-medium text-slate-700">{t('doctor.breakOptional')}</Text>
          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <Input
                label={t('doctor.breakStart')}
                value={breakStart}
                onChangeText={setBreakStart}
                placeholder="12:00"
              />
            </View>
            <View className="flex-1">
              <Input
                label={t('doctor.breakEnd')}
                value={breakEnd}
                onChangeText={setBreakEnd}
                placeholder="13:00"
              />
            </View>
          </View>

          {selectedDates.length > 0 ? (
            <Text
              className="mb-4 text-xs text-slate-500"
              style={{ textAlign: isRtl ? 'right' : 'left' }}
            >
              {t('doctor.generateDatesHint', { days: selectedDateLabels.join('، ') })}
            </Text>
          ) : (
            <Text
              className="mb-4 text-xs text-slate-500"
              style={{ textAlign: isRtl ? 'right' : 'left' }}
            >
              {t('doctor.generateDatesHintEmpty')}
            </Text>
          )}

          {submitError ? (
            <Text className="mb-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-error">{submitError}</Text>
          ) : null}

          <Button
            title={t('doctor.generateSlots')}
            loading={loading}
            onPress={() => void handleSubmit()}
            disabled={selectedDates.length === 0}
            className="mt-2"
          />
        </ScrollView>
      </View>
    </AppModal>
  );
}
