import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Barcode } from 'expo-barcode-generator';
import { UI } from '../../theme/ui';

const STRIP_HEIGHT = 88;

function estimateCode128UnitWidth(value: string, targetWidth: number): number {
  const modules = value.length * 11 + 35;
  return Math.max(1.25, Math.min(2.75, (targetWidth - 24) / modules));
}

interface BookingScanBarProps {
  value: string;
}

export function BookingScanBar({ value }: BookingScanBarProps) {
  const { width: screenWidth } = useWindowDimensions();

  const barUnitWidth = useMemo(() => {
    const stripWidth = Math.max(240, screenWidth - 88);
    return estimateCode128UnitWidth(value, stripWidth);
  }, [screenWidth, value]);

  return (
    <View
      className="w-full overflow-hidden rounded-card border bg-white px-3 py-4"
      style={{ borderColor: UI.border }}
    >
      <View className="w-full items-center justify-center" style={{ minHeight: STRIP_HEIGHT }}>
        <Barcode
          value={value}
          options={{
            format: 'CODE128',
            displayValue: false,
            height: STRIP_HEIGHT,
            width: barUnitWidth,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 8,
            marginRight: 8,
            lineColor: UI.text.primary,
            background: '#FFFFFF',
          }}
        />
      </View>

      <View className="mt-3 flex-row items-center gap-2 px-1">
        <View className="h-px flex-1" style={{ backgroundColor: UI.border }} />
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: UI.primary }} />
        <View className="h-px flex-1" style={{ backgroundColor: UI.border }} />
      </View>
    </View>
  );
}
