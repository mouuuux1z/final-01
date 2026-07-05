import { DefaultTheme, type Theme } from '@react-navigation/native';

/** Keeps stack/tab scenes transparent so the mesh sky shows through */
export const appNavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};
