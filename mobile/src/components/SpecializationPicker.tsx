import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DOCTOR_SPECIALTIES } from '../constants/specialties';
import { UI } from '../theme/ui';
import { AppIcon } from './AppIcon';

interface SpecializationPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  tone?: 'default' | 'onSky';
}

export function SpecializationPicker({
  value,
  onChange,
  error,
  label,
  tone = 'default',
}: SpecializationPickerProps) {
  const { t } = useTranslation();
  const labelColor = tone === 'onSky' ? UI.onBackground : '#000000';

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium" style={{ color: labelColor }}>
        {label ?? t('auth.specialization')}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {DOCTOR_SPECIALTIES.map((item) => {
          const selected = value === item.value;
          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.value)}
              className={`flex-row items-center gap-2 rounded-pill px-3.5 py-2 ${
                selected ? 'bg-primary' : 'border border-slate-200 bg-white'
              }`}
            >
              <AppIcon
                name={item.icon}
                size={15}
                color={selected ? '#FFFFFF' : UI.primary}
                strokeWidth={2.25}
              />
              <Text
                className={`text-xs font-semibold ${
                  selected ? 'text-white' : 'text-slate-700'
                }`}
              >
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="mt-1 text-xs text-error">{error}</Text> : null}
    </View>
  );
}
