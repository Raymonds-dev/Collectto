import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { tokens } from '@/styles/tailwind/tokens.native';

const SKELETON_ACTION_KEYS = ['like', 'comment', 'save', 'share'] as const;
const brandJourney = tokens.gradients.brandJourney as string[];
const skeletonActionButtonGradient: readonly [string, string, string, string] = [
  brandJourney[0] ?? tokens.colors.brand.primary,
  brandJourney[1] ?? tokens.colors.feedback.success,
  brandJourney[2] ?? tokens.colors.feedback.error,
  brandJourney[3] ?? tokens.colors.feedback.warning,
];

export const PostSkeleton = () => {
  return (
    <View className="w-full rounded-2xl bg-surface-base p-[10px]">
      <View className="w-full flex-row items-start gap-[10px] p-[10px]">
        <View className="h-10 w-10 rounded-full border border-surface-border bg-surface-muted" />
        <View className="min-w-0 flex-1 gap-2">
          <View className="h-2.5 w-[55%] rounded-md bg-surface-muted" />
          <View className="h-2.5 w-full rounded-md bg-surface-muted" />
          <View className="h-2.5 w-[85%] rounded-md bg-surface-muted" />
        </View>
      </View>

      <View className="w-full px-[2px] pb-[4px] pt-[8px]">
        <View className="relative h-[375px] w-full">
          <View className="absolute left-0 right-0 top-0 h-[357px] rounded-[12px] bg-surface-border" />
          <View className="absolute left-0 right-0 top-[8px] h-[357px] rounded-[12px] bg-surface-muted" />
          <View className="absolute left-0 right-0 top-[16px] h-[357px] rounded-[12px] bg-surface-muted" />
        </View>
      </View>

      <View className="w-full flex-row items-center justify-center gap-4 px-[10px] py-[6px]">
        {SKELETON_ACTION_KEYS.map((actionKey) => (
          <LinearGradient
            key={`skeleton-action-${actionKey}`}
            colors={skeletonActionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.skeletonActionButtonGradient}>
            <View
              className="border border-surface-borderStrong bg-surface-base"
              style={styles.skeletonActionButtonInner}
            />
          </LinearGradient>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonActionButtonGradient: {
    borderRadius: 6,
    overflow: 'hidden',
    padding: 0.5,
  },
  skeletonActionButtonInner: {
    borderRadius: 6,
    height: 28,
    width: 62,
  },
});
