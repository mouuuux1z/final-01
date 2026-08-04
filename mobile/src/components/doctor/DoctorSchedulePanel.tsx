import { useMemo, useState } from 'react';
import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native';
import { AppLoader } from '../AppLoader';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScheduleActionCard } from './ScheduleActionCard';
import { GenerateSlotsModal } from './GenerateSlotsModal';
import { WeeklyScheduleModal } from './WeeklyScheduleModal';
import { ManualBookingModal } from './ManualBookingModal';
import { PrivateAppointmentModal } from './PrivateAppointmentModal';
import { BookedAppointmentDetailModal } from './BookedAppointmentDetailModal';
import { BookedAppointmentListItem } from './BookedAppointmentListItem';
import { DaySectionHeader } from './DaySectionHeader';
import { getApiErrorMessage } from '../../services/api';
import { confirmAlert, showAlert } from '../../utils/alert';
import { getAppointmentDateKey, getAppointmentDateTime, isAppointmentEnded, toDateInputValue } from '../../utils/appointmentHelpers';
import { useTypography } from '../../hooks/useTypography';
import type { Appointment, DoctorAvailabilitySlot, DoctorSchedule } from '../../types';
import type { DoctorWorkspaceApi } from '../../services/doctorWorkspaceApi';
import { UI, cardShadowStyle } from '../../theme/ui';

interface DoctorSchedulePanelProps {
  workspaceApi: DoctorWorkspaceApi;
  queryKeyPrefix: readonly unknown[];
}

const DAYS_AHEAD = 7;

function groupSlotsByDate(slots: DoctorAvailabilitySlot[]) {
  const grouped = new Map<string, DoctorAvailabilitySlot[]>();

  for (const slot of slots) {
    const dateKey = getAppointmentDateKey(slot.date);
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
}

function groupAppointmentsByDate(appointments: Appointment[], sortDays: 'asc' | 'desc') {
  const grouped = new Map<string, Appointment[]>();

  for (const appointment of appointments) {
    const dateKey = getAppointmentDateKey(appointment.date);
    const existing = grouped.get(dateKey) ?? [];
    existing.push(appointment);
    grouped.set(dateKey, existing);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => (sortDays === 'desc' ? right.localeCompare(left) : left.localeCompare(right)))
    .map(([date, dayAppointments]) => ({
      date,
      appointments: dayAppointments.sort((a, b) => a.time.localeCompare(b.time)),
    }));
}

function isPastBookedAppointment(appointment: Appointment): boolean {
  if (['CANCELLED', 'REJECTED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status)) {
    return true;
  }
  return isAppointmentEnded(appointment);
}

export function DoctorSchedulePanel({ workspaceApi, queryKeyPrefix }: DoctorSchedulePanelProps) {
  const { t, i18n } = useTranslation();
  const typography = useTypography();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';
  const queryClient = useQueryClient();
  const [generateVisible, setGenerateVisible] = useState(false);
  const [weeklyScheduleVisible, setWeeklyScheduleVisible] = useState(false);
  const [manualBookingVisible, setManualBookingVisible] = useState(false);
  const [privateModalVisible, setPrivateModalVisible] = useState(false);
  const [editingPrivateAppt, setEditingPrivateAppt] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const availabilityRange = useMemo(() => {
    const from = toDateInputValue();
    const end = new Date();
    end.setDate(end.getDate() + DAYS_AHEAD);
    return { from, to: toDateInputValue(end) };
  }, []);

  const availabilityKey = [
    ...queryKeyPrefix,
    'availability',
    'schedule',
    availabilityRange.from,
    availabilityRange.to,
  ];
  const schedulesKey = [...queryKeyPrefix, 'schedules'];

  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: schedulesKey,
    queryFn: () => workspaceApi.listSchedules(),
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: availabilityKey,
    queryFn: () =>
      workspaceApi.listAvailability({
        from: availabilityRange.from,
        to: availabilityRange.to,
      }),
  });

  const appointmentsKey = [...queryKeyPrefix, 'appointments', 'schedule', 'all'];

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: appointmentsKey,
    queryFn: () => workspaceApi.listAllAppointments({ sort: 'desc' }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [...queryKeyPrefix, 'availability'] });
    void queryClient.invalidateQueries({ queryKey: schedulesKey });
    void queryClient.invalidateQueries({ queryKey: [...queryKeyPrefix, 'appointments'] });
  };

  const deleteMutation = useMutation({
    mutationFn: (slotId: string) => workspaceApi.deleteAvailabilitySlot(slotId),
    onSuccess: invalidate,
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const deleteDayMutation = useMutation({
    mutationFn: async (slotIds: string[]) => {
      await Promise.all(slotIds.map((slotId) => workspaceApi.deleteAvailabilitySlot(slotId)));
    },
    onSuccess: invalidate,
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const generateMutation = useMutation({
    mutationFn: async (payload: {
      dates: string[];
      startTime: string;
      endTime: string;
      slotDurationMinutes?: number;
      gapMinutes?: number;
      breakStart?: string;
      breakEnd?: string;
    }) => {
      const { dates, ...settings } = payload;
      let createdCount = 0;
      let skippedCount = 0;

      for (const date of dates) {
        const result = await workspaceApi.generateAvailability({ date, ...settings });
        createdCount += result.createdCount ?? 0;
        skippedCount += result.skippedCount ?? 0;
      }

      return { createdCount, skippedCount, daysProcessed: dates.length };
    },
    onSuccess: (result) => {
      setGenerateVisible(false);
      invalidate();
      showAlert(
        t('common.success'),
        result.createdCount > 0
          ? t('doctor.slotsGenerated', { count: result.createdCount, skipped: result.skippedCount })
          : t('doctor.slotsNoneCreated', { skipped: result.skippedCount }),
      );
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const manualBookMutation = useMutation({
    mutationFn: (payload: Parameters<DoctorWorkspaceApi['manualBook']>[0]) => workspaceApi.manualBook(payload),
    onSuccess: () => {
      setManualBookingVisible(false);
      invalidate();
      showAlert(t('common.success'), t('doctor.manualBookingSuccess'));
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const createPrivateMutation = useMutation({
    mutationFn: (payload: Parameters<DoctorWorkspaceApi['createPrivateAppointment']>[0]) =>
      workspaceApi.createPrivateAppointment(payload),
    onSuccess: () => {
      setPrivateModalVisible(false);
      setEditingPrivateAppt(null);
      invalidate();
      showAlert(t('common.success'), t('doctor.privateAppointmentCreated'));
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const updatePrivateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<DoctorWorkspaceApi['updatePrivateAppointment']>[1];
    }) => workspaceApi.updatePrivateAppointment(id, payload),
    onSuccess: () => {
      setPrivateModalVisible(false);
      setEditingPrivateAppt(null);
      invalidate();
      showAlert(t('common.success'), t('doctor.privateAppointmentUpdated'));
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const deletePrivateMutation = useMutation({
    mutationFn: (id: string) => workspaceApi.deletePrivateAppointment(id),
    onSuccess: () => {
      setPrivateModalVisible(false);
      setEditingPrivateAppt(null);
      invalidate();
      showAlert(t('common.success'), t('doctor.privateAppointmentDeleted'));
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const { data: manualBookingSlots = [], isLoading: manualSlotsLoading } = useQuery({
    queryKey: [
      ...queryKeyPrefix,
      'availability',
      'manual-booking',
      availabilityRange.from,
      availabilityRange.to,
    ],
    queryFn: () =>
      workspaceApi.listAvailability({
        from: availabilityRange.from,
        to: availabilityRange.to,
        availableOnly: true,
      }),
    enabled: manualBookingVisible,
  });

  const bookableSlots = useMemo(() => {
    const now = new Date();
    return (manualBookingSlots as DoctorAvailabilitySlot[]).filter(
      (slot) => !slot.isBooked && getAppointmentDateTime(slot.date, slot.time) > now,
    );
  }, [manualBookingSlots]);

  const slotsByDate = useMemo(() => groupSlotsByDate((slots ?? []) as DoctorAvailabilitySlot[]), [slots]);

  const availableDays = useMemo(() => {
    const now = new Date();
    return slotsByDate
      .map((day) => ({
        ...day,
        availableSlots: day.slots.filter(
          (slot) => !slot.isBooked && getAppointmentDateTime(slot.date, slot.time) > now,
        ),
        bookedSlots: day.slots.filter((slot) => slot.isBooked),
      }))
      .filter((day) => day.availableSlots.length > 0 || day.bookedSlots.length > 0);
  }, [slotsByDate]);

  const { upcomingBookedByDate, pastBookedByDate, bookedCount } = useMemo(() => {
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    for (const appointment of (appointments ?? []) as Appointment[]) {
      if (isPastBookedAppointment(appointment)) {
        past.push(appointment);
      } else {
        upcoming.push(appointment);
      }
    }

    const upcomingBookedByDate = groupAppointmentsByDate(upcoming, 'asc');
    const pastBookedByDate = groupAppointmentsByDate(past, 'desc');

    return {
      upcomingBookedByDate,
      pastBookedByDate,
      bookedCount: upcoming.length + past.length,
    };
  }, [appointments]);

  const renderBookedDayGroups = (days: ReturnType<typeof groupAppointmentsByDate>) =>
    days.map((day) => (
      <View key={day.date} className="mb-4">
        <DaySectionHeader dateKey={day.date} />
        <View className="gap-2">
          {day.appointments.map((appointment) => {
            const patientName =
              appointment.patient?.name ??
              appointment.patientName ??
              (appointment.isPrivate ? t('doctor.privateAppointment') : t('doctor.unknownPatient'));
            const patientPhone = appointment.patient?.phone ?? appointment.patientPhone ?? null;
            return (
              <BookedAppointmentListItem
                key={appointment.id}
                appointment={appointment}
                patientName={patientName}
                patientPhone={patientPhone}
                onPress={() => {
                  if (appointment.isPrivate) {
                    setEditingPrivateAppt(appointment);
                    setPrivateModalVisible(true);
                  } else {
                    setSelectedAppointment(appointment);
                  }
                }}
              />
            );
          })}
        </View>
      </View>
    ));

  const handleDeleteDay = async (day: (typeof availableDays)[number]) => {
    if (!day.availableSlots.length) return;

    const confirmed = await confirmAlert(
      t('doctor.deleteDay'),
      t('doctor.deleteDayConfirm'),
      t('common.delete'),
      t('common.cancel'),
    );
    if (!confirmed) return;

    try {
      await deleteDayMutation.mutateAsync(day.availableSlots.map((slot) => slot.id));
      showAlert(
        t('common.success'),
        day.bookedSlots.length > 0 ? t('doctor.deleteDayPartial') : t('doctor.deleteDayDone'),
      );
    } catch {
      // handled in mutation onError
    }
  };

  return (
    <>
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-10">
      <View className="mb-4 gap-3">
        <ScheduleActionCard
          title={t('doctor.generateSlots')}
          subtitle={t('doctor.generateSlotsHint')}
          icon="calendar"
          onPress={() => setGenerateVisible(true)}
        />
        <ScheduleActionCard
          title={t('doctor.manageWeeklySchedule')}
          subtitle={t('doctor.manageWeeklyScheduleCardHint')}
          icon="schedule"
          iconBackground="#EFF6FF"
          iconColor="#2563EB"
          onPress={() => setWeeklyScheduleVisible(true)}
        />
        <ScheduleActionCard
          title={t('doctor.addManualBooking')}
          subtitle={t('doctor.addManualBookingHint')}
          icon="plus"
          iconBackground="#ECFDF5"
          iconColor="#059669"
          onPress={() => setManualBookingVisible(true)}
        />
        <ScheduleActionCard
          title={t('doctor.privateAppointment')}
          subtitle={t('doctor.addPrivateAppointmentHint')}
          icon="shield"
          iconBackground="#F5F3FF"
          iconColor="#7C3AED"
          onPress={() => {
            setEditingPrivateAppt(null);
            setPrivateModalVisible(true);
          }}
        />
      </View>

      {schedulesLoading ? (
        <AppLoader className="my-4" />
      ) : schedules?.length ? (
        <View className="mb-4 rounded-card border border-slate-100 bg-white p-4">
          <Text className="mb-2 text-sm font-semibold text-slate-900">{t('doctor.weeklySchedule')}</Text>
          {(schedules as DoctorSchedule[]).map((schedule) => (
            <Text key={schedule.id} className="text-sm text-slate-600">
              {t(`doctor.days.${schedule.dayOfWeek}` as never)} · {schedule.startTime} - {schedule.endTime}
            </Text>
          ))}
        </View>
      ) : null}

      {slotsLoading ? (
        <AppLoader className="my-6" />
      ) : (
        <>
          <View
            className="mb-4 overflow-hidden rounded-card border bg-white p-4"
            style={{ borderColor: UI.border, ...cardShadowStyle() }}
          >
            <Text className="mb-3 text-sm font-semibold text-heading">
              {t('doctor.availableSlots')}
            </Text>
            {availableDays.some((day) => day.availableSlots.length > 0) ? (
              availableDays.map((day) => {
                if (!day.availableSlots.length) return null;
                return (
                  <View key={day.date} className="mb-3">
                    <DaySectionHeader
                      dateKey={day.date}
                      onDelete={() => void handleDeleteDay(day)}
                      deleteLabel={t('doctor.deleteDay')}
                      deletePending={deleteDayMutation.isPending}
                    />
                    <View className="flex-row flex-wrap gap-2">
                      {day.availableSlots.map((slot) => (
                        <Pressable
                          key={slot.id}
                          onLongPress={() => deleteMutation.mutate(slot.id)}
                          className="rounded-btn border border-green-200 bg-green-50 px-3 py-2"
                        >
                          <Text className="text-sm font-medium text-green-700">{slot.time}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text className="text-sm text-body">{t('doctor.noAvailableSlots')}</Text>
            )}
          </View>
        </>
      )}

      <View
        className="mt-4 overflow-hidden rounded-card border bg-white"
        style={{ borderColor: UI.border, ...cardShadowStyle() }}
      >
        <View
          className="border-b px-4 py-3"
          style={{ borderColor: UI.border, backgroundColor: UI.primaryLight }}
        >
          <Text
            className="text-base text-heading"
            style={{
              fontFamily: typography.fontFamily,
              fontWeight: typography.headingWeight,
              color: UI.primary,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            {t('doctor.bookedAppointmentsList')}
            {bookedCount > 0 ? ` (${bookedCount})` : ''}
          </Text>
        </View>

        <View className="p-4">
          {appointmentsLoading ? (
            <AppLoader className="my-4" />
          ) : bookedCount > 0 ? (
            <>
              {upcomingBookedByDate.length > 0 ? (
                <View className="mb-5">
                  <Text
                    className="mb-3 text-sm font-semibold text-heading"
                    style={{
                      fontFamily: typography.fontFamily,
                      fontWeight: typography.headingWeight,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {t('doctor.upcomingBookedAppointments')}
                  </Text>
                  {renderBookedDayGroups(upcomingBookedByDate)}
                </View>
              ) : null}

              {pastBookedByDate.length > 0 ? (
                <View>
                  <Text
                    className="mb-3 text-sm font-semibold text-heading"
                    style={{
                      fontFamily: typography.fontFamily,
                      fontWeight: typography.headingWeight,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {t('doctor.pastBookedAppointments')}
                  </Text>
                  {renderBookedDayGroups(pastBookedByDate)}
                </View>
              ) : null}
            </>
          ) : (
            <Text
              className="text-sm text-slate-500"
              style={{ textAlign: isRtl ? 'right' : 'left' }}
            >
              {t('doctor.noBookedAppointments')}
            </Text>
          )}
        </View>
      </View>

      </ScrollView>

      <GenerateSlotsModal
        visible={generateVisible}
        onClose={() => setGenerateVisible(false)}
        schedules={(schedules ?? []) as DoctorSchedule[]}
        loading={generateMutation.isPending}
        onSubmit={async (payload) => {
          await generateMutation.mutateAsync(payload);
        }}
      />

      <WeeklyScheduleModal
        visible={weeklyScheduleVisible}
        onClose={() => setWeeklyScheduleVisible(false)}
        workspaceApi={workspaceApi}
        schedulesQueryKey={schedulesKey}
        onSaved={invalidate}
      />

      <BookedAppointmentDetailModal
        visible={selectedAppointment != null}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />

      <ManualBookingModal
        visible={manualBookingVisible}
        onClose={() => setManualBookingVisible(false)}
        slots={bookableSlots}
        slotsLoading={manualSlotsLoading}
        loading={manualBookMutation.isPending}
        onSubmit={async (payload) => {
          await manualBookMutation.mutateAsync(payload);
        }}
      />

      <PrivateAppointmentModal
        visible={privateModalVisible}
        appointment={editingPrivateAppt}
        loadPatients={() => workspaceApi.listPatients()}
        onClose={() => {
          setPrivateModalVisible(false);
          setEditingPrivateAppt(null);
        }}
        loading={createPrivateMutation.isPending || updatePrivateMutation.isPending}
        deleteLoading={deletePrivateMutation.isPending}
        onSubmit={async (payload) => {
          if (editingPrivateAppt) {
            await updatePrivateMutation.mutateAsync({ id: editingPrivateAppt.id, payload });
          } else {
            await createPrivateMutation.mutateAsync(payload);
          }
        }}
        onDelete={async (id) => {
          await deletePrivateMutation.mutateAsync(id);
        }}
      />
    </>
  );
}
