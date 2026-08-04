import { useEffect, useRef, useState } from 'react';

import { I18nManager, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { AppLoader } from '../AppLoader';

import { useTranslation } from 'react-i18next';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AppModal, appModalStyles } from '../AppModal';

import { Button } from '../Button';

import { Input } from '../Input';

import { getApiErrorMessage } from '../../services/api';

import type { DoctorWorkspaceApi } from '../../services/doctorWorkspaceApi';

import { showAlert } from '../../utils/alert';

import {

  WEEK_DAYS,

  createEmptyWeeklyScheduleDraft,

  isValidTimeRange,

  normalizeTimeInput,

  weeklyScheduleDraftFromRecords,

  type WeeklyScheduleDraft,

} from '../../utils/weeklyScheduleHelpers';

import { UI } from '../../theme/ui';

import type { DayOfWeek } from '../../types';



const DEFAULT_DURATION = 30;

const DEFAULT_DAYS_AHEAD = 7;



interface WeeklyScheduleModalProps {

  visible: boolean;

  onClose: () => void;

  workspaceApi: DoctorWorkspaceApi;

  schedulesQueryKey: readonly unknown[];

  onSaved?: () => void;

}



type SaveMutationResult = { kind: 'saved' };



function parseOptionalMinutes(value: string): number | undefined | typeof NaN {

  const trimmed = value.trim();

  if (!trimmed) return undefined;

  const parsed = Number(trimmed);

  if (!Number.isInteger(parsed) || parsed < 5 || parsed > 240) return NaN;

  return parsed;

}



export function WeeklyScheduleModal({

  visible,

  onClose,

  workspaceApi,

  schedulesQueryKey,

  onSaved,

}: WeeklyScheduleModalProps) {

  const { t, i18n } = useTranslation();

  const isRtl = I18nManager.isRTL || i18n.language === 'ar';

  const queryClient = useQueryClient();

  const draftInitializedRef = useRef(false);



  const [draft, setDraft] = useState<WeeklyScheduleDraft>(() => createEmptyWeeklyScheduleDraft());

  const [slotDuration, setSlotDuration] = useState('');

  const [gapMinutes, setGapMinutes] = useState('');

  const [breakStart, setBreakStart] = useState('');

  const [breakEnd, setBreakEnd] = useState('');

  const [daysAhead, setDaysAhead] = useState(String(DEFAULT_DAYS_AHEAD));

  const [submitError, setSubmitError] = useState<string | null>(null);



  const { data: schedules = [], isLoading } = useQuery({

    queryKey: schedulesQueryKey,

    queryFn: () => workspaceApi.listSchedules(),

    enabled: visible,

  });



  useEffect(() => {

    if (!visible) {

      setSubmitError(null);

      draftInitializedRef.current = false;

      return;

    }

    if (!isLoading && !draftInitializedRef.current) {

      setDraft(weeklyScheduleDraftFromRecords(schedules));

      draftInitializedRef.current = true;

    }

  }, [visible, isLoading, schedules]);



  const updateDay = (day: DayOfWeek, patch: Partial<WeeklyScheduleDraft[DayOfWeek]>) => {

    setDraft((prev) => ({

      ...prev,

      [day]: { ...prev[day], ...patch },

    }));

  };



  const validateDraft = (): string | null => {

    const enabledDays = WEEK_DAYS.filter((day) => draft[day].enabled);

    if (enabledDays.length === 0) {

      return t('doctor.weeklyScheduleNoDays');

    }

    for (const day of enabledDays) {

      const row = draft[day];

      if (!isValidTimeRange(row.startTime, row.endTime)) {

        return t('doctor.weeklyScheduleInvalidRange', { day: t(`doctor.days.${day}` as never) });

      }

    }

    return null;

  };



  const buildGenerationPayload = () => {

    const duration = parseOptionalMinutes(slotDuration);

    if (Number.isNaN(duration)) {

      throw new Error(t('doctor.errors.invalidDuration'));

    }

    const gap = gapMinutes.trim() ? Number(gapMinutes.trim()) : 0;

    if (!Number.isInteger(gap) || gap < 0 || gap > 120) {

      throw new Error(t('doctor.errors.invalidGap'));

    }

    const days = Number(daysAhead.trim() || DEFAULT_DAYS_AHEAD);

    if (!Number.isInteger(days) || days < 1 || days > 84) {

      throw new Error(t('doctor.weeklyScheduleInvalidDays'));

    }

    const hasBreakStart = breakStart.trim().length > 0;

    const hasBreakEnd = breakEnd.trim().length > 0;

    if (hasBreakStart !== hasBreakEnd) {

      throw new Error(t('doctor.errors.breakBothRequired'));

    }



    return {

      ...(duration !== undefined ? { slotDurationMinutes: duration } : {}),

      ...(gap > 0 ? { gapMinutes: gap } : {}),

      daysAhead: days,

      ...(hasBreakStart && hasBreakEnd

        ? { breakStart: normalizeTimeInput(breakStart), breakEnd: normalizeTimeInput(breakEnd) }

        : {}),

    };

  };



  const buildSyncPayload = () => ({

    days: WEEK_DAYS.filter((day) => draft[day].enabled).map((day) => ({

      dayOfWeek: day,

      startTime: normalizeTimeInput(draft[day].startTime),

      endTime: normalizeTimeInput(draft[day].endTime),

    })),

  });



  const saveMutation = useMutation({

    mutationFn: async (): Promise<SaveMutationResult> => {

      const validationError = validateDraft();

      if (validationError) throw new Error(validationError);



      await workspaceApi.syncWeeklySchedules(buildSyncPayload());

      return { kind: 'saved' };

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: schedulesQueryKey });

      onSaved?.();

      onClose();

      showAlert(t('common.success'), t('doctor.weeklyScheduleSaved'));

    },

    onError: (error) => setSubmitError(getApiErrorMessage(error)),

  });



  const generateMutation = useMutation({

    mutationFn: async () => {

      const validationError = validateDraft();

      if (validationError) throw new Error(validationError);

      await workspaceApi.syncWeeklySchedules(buildSyncPayload());

      const payload = buildGenerationPayload();

      return workspaceApi.generateFromWeeklySchedule(payload);

    },

    onSuccess: (result) => {

      void queryClient.invalidateQueries({ queryKey: schedulesQueryKey });

      onSaved?.();

      showAlert(

        t('common.success'),

        (result.createdCount ?? 0) > 0

          ? t('doctor.slotsGenerated', { count: result.createdCount ?? 0, skipped: result.skippedCount ?? 0 })

          : t('doctor.slotsNoneCreated', { skipped: result.skippedCount ?? 0 }),

      );

    },

    onError: (error) => setSubmitError(getApiErrorMessage(error)),

  });



  return (

    <AppModal visible={visible} onRequestClose={onClose} onBackdropPress={onClose}>

      <View style={appModalStyles.body} className="px-6 pt-6">

        <View

          className="mb-4 items-center justify-between"

          style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}

        >

          <View className="flex-1 pr-3">

            <Text className="text-xl font-bold text-slate-900" style={{ textAlign: isRtl ? 'right' : 'left' }}>

              {t('doctor.manageWeeklySchedule')}

            </Text>

            <Text className="mt-1 text-sm text-slate-500" style={{ textAlign: isRtl ? 'right' : 'left' }}>

              {t('doctor.manageWeeklyScheduleHint')}

            </Text>

          </View>

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

          {isLoading ? (

            <AppLoader className="my-6" />

          ) : (

            <>

              <Text

                className="mb-3 text-sm font-semibold text-slate-700"

                style={{ textAlign: isRtl ? 'right' : 'left' }}

              >

                {t('doctor.weeklyScheduleDays')}

              </Text>



              <View className="mb-4 gap-3">

                {WEEK_DAYS.map((day) => {

                  const row = draft[day];

                  return (

                    <View

                      key={day}

                      className="rounded-card border bg-white p-4"

                      style={{ borderColor: row.enabled ? UI.primary : UI.border }}

                    >

                      <View

                        className="items-center justify-between"

                        style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}

                      >

                        <Text className="text-base font-semibold text-slate-900">

                          {t(`doctor.days.${day}` as never)}

                        </Text>

                        <Switch

                          value={row.enabled}

                          onValueChange={(enabled) => updateDay(day, { enabled })}

                          trackColor={{ false: '#CBD5E1', true: UI.primary }}

                          thumbColor="#FFFFFF"

                        />

                      </View>



                      {row.enabled ? (

                        <View className="mt-3 flex-row gap-3">

                          <View className="flex-1">

                            <Input

                              label={t('doctor.workStart')}

                              value={row.startTime}

                              onChangeText={(startTime) => updateDay(day, { startTime })}

                              placeholder="09:00"

                            />

                          </View>

                          <View className="flex-1">

                            <Input

                              label={t('doctor.workEnd')}

                              value={row.endTime}

                              onChangeText={(endTime) => updateDay(day, { endTime })}

                              placeholder="17:00"

                            />

                          </View>

                        </View>

                      ) : null}

                    </View>

                  );

                })}

              </View>



              <Text

                className="mb-3 text-sm font-semibold text-slate-700"

                style={{ textAlign: isRtl ? 'right' : 'left' }}

              >

                {t('doctor.weeklyScheduleGeneration')}

              </Text>



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



              <Input

                label={t('doctor.daysAheadOptional')}

                value={daysAhead}

                onChangeText={setDaysAhead}

                keyboardType="number-pad"

                placeholder={String(DEFAULT_DAYS_AHEAD)}

              />

              <Text className="mb-3 -mt-2 text-xs text-slate-500">{t('doctor.daysAheadHint')}</Text>



              <Text className="mb-2 mt-1 text-sm font-medium text-slate-700">{t('doctor.breakOptional')}</Text>

              <View className="mb-4 flex-row gap-3">

                <View className="flex-1">

                  <Input label={t('doctor.breakStart')} value={breakStart} onChangeText={setBreakStart} placeholder="12:00" />

                </View>

                <View className="flex-1">

                  <Input label={t('doctor.breakEnd')} value={breakEnd} onChangeText={setBreakEnd} placeholder="13:00" />

                </View>

              </View>



              {submitError ? (

                <Text className="mb-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-error">{submitError}</Text>

              ) : null}

            </>

          )}

        </ScrollView>



        {!isLoading ? (

          <View className="pb-6 pt-2">

            <Button

              title={t('doctor.saveWeeklySchedule')}

              loading={saveMutation.isPending}

              onPress={() => {

                setSubmitError(null);

                saveMutation.mutate();

              }}

              className="mb-3"

            />



            <Button

              title={t('doctor.generateFromWeeklySchedule')}

              variant="outline"

              loading={generateMutation.isPending}

              onPress={() => {

                setSubmitError(null);

                generateMutation.mutate();

              }}

            />

          </View>

        ) : null}

      </View>

    </AppModal>

  );

}

