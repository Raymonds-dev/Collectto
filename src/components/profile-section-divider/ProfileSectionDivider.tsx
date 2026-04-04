import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { tokens } from '@/styles/tailwind/tokens.native';

const brandJourney = tokens.gradients.brandJourney as string[];
const topBorderGradient: readonly [string, string, string, string] = [
  brandJourney[0] ?? tokens.colors.brand.primary,
  brandJourney[1] ?? tokens.colors.feedback.success,
  brandJourney[2] ?? tokens.colors.feedback.warning,
  brandJourney[3] ?? tokens.colors.feedback.info,
];

export function ProfileSectionDivider() {
  return (
    <View className="mt-4 ">
      {/* expo-linear-gradient tem suporte parcial a NativeWind; style pontual evita inconsistencias */}
      <LinearGradient
        colors={topBorderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBorderShell}>
        <View className="mt-[4px] h-[12px] w-full rounded-t-full bg-surface-base" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  topBorderShell: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 12,
    overflow: 'hidden',
    width: '100%',
  },
});
