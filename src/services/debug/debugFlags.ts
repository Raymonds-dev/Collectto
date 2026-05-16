export const isDebugModeEnabled = (): boolean => {
  return process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';
};
