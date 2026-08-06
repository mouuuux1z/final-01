/** Tracks whether Madika Arabic files registered successfully at runtime (APK). */
let arabicFontsLoaded = false;

export function setArabicFontsLoaded(loaded: boolean): void {
  arabicFontsLoaded = loaded;
}

export function areArabicFontsLoaded(): boolean {
  return arabicFontsLoaded;
}
