import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Font from 'expo-font';
import {
  ARABIC_FONT_SOURCES,
  CORE_FONT_SOURCES,
} from '../theme/fonts';
import { setArabicFontsLoaded } from '../theme/fontAvailability';

export function useAppFonts(): {
  fontsReady: boolean;
  fontError: Error | null;
  arabicFontsLoaded: boolean;
} {
  const [fontsReady, setFontsReady] = useState(Platform.OS === 'web');
  const [fontError, setFontError] = useState<Error | null>(null);
  const [arabicFontsLoaded, setArabicFontsLoadedState] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelled = false;

    async function loadFonts() {
      try {
        await Font.loadAsync(CORE_FONT_SOURCES);

        try {
          await Font.loadAsync(ARABIC_FONT_SOURCES);
          if (!cancelled) {
            setArabicFontsLoaded(true);
            setArabicFontsLoadedState(true);
          }
        } catch (arabicError) {
          console.warn('[fonts] Arabic fonts failed to load; falling back to Inter:', arabicError);
          if (!cancelled) {
            setArabicFontsLoaded(false);
            setArabicFontsLoadedState(false);
          }
        }

        if (!cancelled) setFontsReady(true);
      } catch (error) {
        console.warn('[fonts] Core fonts failed to load:', error);
        if (!cancelled) {
          setArabicFontsLoaded(false);
          setArabicFontsLoadedState(false);
          setFontError(error instanceof Error ? error : new Error(String(error)));
          setFontsReady(true);
        }
      }
    }

    void loadFonts();

    return () => {
      cancelled = true;
    };
  }, []);

  return { fontsReady, fontError, arabicFontsLoaded };
}
