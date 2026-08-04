import { I18nManager, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppLogo } from '../AppLogo';
import { useTypography } from '../../hooks/useTypography';
import { UI } from '../../theme/ui';

const TAGLINE_BLUE = UI.primary;
const TAGLINE_CYAN = '#00C8E8';
const LOGO_SIZE = 76;

interface ColoredPart {
  text: string;
  color: 'blue' | 'cyan';
}

function ColoredLine({
  parts,
  fontSize,
  fontFamily,
  textAlign,
}: {
  parts: ColoredPart[];
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'right' | 'center';
}) {
  return (
    <Text
      style={{
        fontSize,
        lineHeight: fontSize * 1.35,
        fontFamily,
        fontWeight: '700',
        textAlign,
      }}
    >
      {parts.map((part, index) => (
        <Text
          key={`${part.text}-${index}`}
          style={{ color: part.color === 'blue' ? TAGLINE_BLUE : TAGLINE_CYAN }}
        >
          {part.text}
        </Text>
      ))}
    </Text>
  );
}

export function LoginHeroTagline() {
  const { i18n } = useTranslation();
  const typography = useTypography();
  const isArabic = i18n.language?.startsWith('ar');
  const isRtl = I18nManager.isRTL || isArabic;

  const textBlock = isArabic ? (
    <View className="justify-center">
      <Text
        style={{
          color: TAGLINE_BLUE,
          fontSize: 30,
          lineHeight: 40,
          fontFamily: typography.fontFamily,
          fontWeight: typography.headingWeight,
          textAlign: 'center',
        }}
      >
        احجز موعدك الطبي
      </Text>
      <View className="mt-1">
        <ColoredLine
          fontSize={26}
          fontFamily={typography.fontFamily}
          textAlign="center"
          parts={[
            { text: 'في اي ', color: 'blue' },
            { text: 'وقت ', color: 'cyan' },
            { text: 'واي ', color: 'blue' },
            { text: 'مكان .', color: 'cyan' },
          ]}
        />
      </View>
    </View>
  ) : (
    <View className="justify-center">
      <Text
        style={{
          color: TAGLINE_BLUE,
          fontSize: 28,
          lineHeight: 36,
          fontFamily: typography.fontFamily,
          fontWeight: typography.headingWeight,
          textAlign: 'center',
        }}
      >
        Book your medical appointment
      </Text>
      <View className="mt-1">
        <ColoredLine
          fontSize={24}
          fontFamily={typography.fontFamily}
          textAlign="center"
          parts={[
            { text: 'Any ', color: 'blue' },
            { text: 'time, ', color: 'cyan' },
            { text: 'any ', color: 'blue' },
            { text: 'place.', color: 'cyan' },
          ]}
        />
      </View>
    </View>
  );

  return (
    <View className="w-full items-center px-1">
      <View
        style={{
          flexDirection: isRtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <View className="shrink-0">
          <AppLogo size={LOGO_SIZE} />
        </View>
        {textBlock}
      </View>
    </View>
  );
}
