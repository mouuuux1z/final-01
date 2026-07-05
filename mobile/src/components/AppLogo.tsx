import { Image, type ImageStyle, type StyleProp } from 'react-native';

const logoSource = require('../../assets/logo.png');

interface AppLogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function AppLogo({ size = 44, style }: AppLogoProps) {
  return (
    <Image
      source={logoSource}
      accessibilityLabel="MYDoc"
      resizeMode="contain"
      style={[{ width: size, height: size, borderRadius: size * 0.2 }, style]}
    />
  );
}
