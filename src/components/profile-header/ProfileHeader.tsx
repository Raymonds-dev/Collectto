import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { tokens } from '@/styles/tailwind/tokens.native';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';

type ProfileHeaderProps = {
  isOwner: boolean;
  bannerImage: string | null;
  onEditPress?: () => void;
  onOptionsPress?: () => void;
};

type HeaderActionProps = {
  isOwner: boolean;
  onEditPress?: () => void;
  onOptionsPress?: () => void;
};

function HeaderAction({ isOwner, onEditPress, onOptionsPress }: HeaderActionProps) {
  const [isPressed, setIsPressed] = useState(false);
  const iconName = isOwner ? 'pencil' : 'ellipsis-horizontal';
  const accessibilityLabel = isOwner ? 'Editar perfil' : 'Abrir acoes do perfil';

  function handlePress() {
    if (isOwner) {
      onEditPress?.();
      return;
    }

    onOptionsPress?.();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      className={`absolute right-3 top-3 z-10 h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-overlay-scrimSoft ${isPressed ? 'opacity-75' : 'opacity-100'}`}>
      <Ionicons name={iconName} size={18} color={tokens.colors.text.inverse} />
    </Pressable>
  );
}

export function ProfileHeader({
  isOwner,
  bannerImage,
  onEditPress,
  onOptionsPress,
}: ProfileHeaderProps) {
  const brandJourney = tokens.gradients.brandJourney as string[];
  const dividerGradient: readonly [string, string, string, string] = [
    brandJourney[0] ?? tokens.colors.brand.primary,
    brandJourney[1] ?? tokens.colors.feedback.success,
    brandJourney[2] ?? tokens.colors.feedback.error,
    brandJourney[3] ?? tokens.colors.feedback.warning,
  ];
  const hasBannerImage = Boolean(bannerImage);

  return (
    <View className="relative h-[120px] w-full overflow-hidden bg-surface-muted">
      {hasBannerImage ? (
        <ImageBackground
          source={{ uri: bannerImage as string }}
          resizeMode="cover"
          className="h-full w-full"
        />
      ) : (
        <View className="h-full w-full bg-surface-muted" />
      )}

      <HeaderAction isOwner={isOwner} onEditPress={onEditPress} onOptionsPress={onOptionsPress} />

      {/* expo-linear-gradient tem suporte parcial a NativeWind; usar style nativo evita inconsistencias */}
      <LinearGradient
        colors={dividerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomGradientLine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomGradientLine: {
    bottom: 0,
    height: 1.5,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
