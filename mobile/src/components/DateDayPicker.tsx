import { useCallback, useEffect, useRef } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getDayChipLabels } from '../utils/appointmentHelpers';

const CHIP_GAP = 8;

type DateDayPickerTone = 'default' | 'onSky';

interface DateDayPickerBaseProps {
  dates: string[];
  className?: string;
  tone?: DateDayPickerTone;
}

interface SingleSelectProps extends DateDayPickerBaseProps {
  multiSelect?: false;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  selectedDates?: never;
  onToggleDate?: never;
}

interface MultiSelectProps extends DateDayPickerBaseProps {
  multiSelect: true;
  selectedDates: string[];
  onToggleDate: (date: string) => void;
  selectedDate?: never;
  onSelectDate?: never;
}

export type DateDayPickerProps = SingleSelectProps | MultiSelectProps;

export function DateDayPicker(props: DateDayPickerProps) {
  const { dates, className, tone = 'default' } = props;
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const chipOffsetsRef = useRef<Map<string, number>>(new Map());

  const isSelected = useCallback(
    (date: string) => {
      if (props.multiSelect) {
        return props.selectedDates.includes(date);
      }
      return props.selectedDate === date;
    },
    [props],
  );

  const scrollToDate = useCallback((date: string) => {
    const offset = chipOffsetsRef.current.get(date);
    if (offset === undefined) return;
    scrollRef.current?.scrollTo({ x: Math.max(0, offset - 16), animated: true });
  }, []);

  useEffect(() => {
    if (!props.multiSelect && props.selectedDate) {
      scrollToDate(props.selectedDate);
    }
  }, [props.multiSelect, props.multiSelect ? undefined : props.selectedDate, scrollToDate]);

  const chipSelectedClass =
    tone === 'onSky' ? 'bg-primary border-primary' : 'border-primary bg-primary';
  const chipDefaultClass =
    tone === 'onSky' ? 'border-white/30 bg-white/90' : 'border-slate-200 bg-white';

  return (
    <View className={className}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === 'web'}
        nestedScrollEnabled
        directionalLockEnabled
        keyboardShouldPersistTaps="always"
        scrollEventThrottle={16}
        bounces={false}
        alwaysBounceHorizontal={false}
        contentContainerStyle={{ gap: CHIP_GAP, paddingVertical: 2, paddingHorizontal: 2 }}
        style={Platform.OS === 'web' ? ({ overflowX: 'auto', overflowY: 'hidden' } as never) : undefined}
      >
        {dates.map((dateKey) => {
          const selected = isSelected(dateKey);
          const labels = getDayChipLabels(dateKey, t, i18n.language);

          return (
            <Pressable
              key={dateKey}
              onLayout={(event) => {
                chipOffsetsRef.current.set(dateKey, event.nativeEvent.layout.x);
              }}
              onPress={() => {
                if (props.multiSelect) {
                  props.onToggleDate(dateKey);
                } else {
                  props.onSelectDate(dateKey);
                }
              }}
              className={`min-w-[76px] rounded-card border px-3 py-2.5 ${selected ? chipSelectedClass : chipDefaultClass}`}
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
      </ScrollView>
    </View>
  );
}
