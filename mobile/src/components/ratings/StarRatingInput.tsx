import { Pressable, Text, View } from 'react-native';
import { UI } from '../../theme/ui';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

export function StarRatingInput({ value, onChange, size = 36 }: StarRatingInputProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <Pressable
            key={star}
            onPress={() => onChange(star)}
            className="active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel={`${star}`}
          >
            <Text
              style={{
                fontSize: size,
                color: filled ? '#F59E0B' : UI.border,
              }}
            >
              ★
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface DoctorRatingDisplayProps {
  rating?: number;
  label?: string;
  size?: 'sm' | 'md';
}

export function DoctorRatingDisplay({ rating = 0, label, size = 'sm' }: DoctorRatingDisplayProps) {
  const textSize = size === 'md' ? 'text-base' : 'text-sm';

  return (
    <View>
      <Text className={`${textSize} font-bold text-amber-500`}>★ {rating.toFixed(1)}</Text>
      {label ? (
        <Text className="mt-0.5 text-xs" style={{ color: UI.text.muted }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
