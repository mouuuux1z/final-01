import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'mydoc_onboarding_completed';

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}
