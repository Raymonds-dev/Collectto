import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { tokens } from '@/styles/tailwind/tokens.native';

type ProfileInfoProps = {
  isOwner: boolean;
  profileImage: string | null;
  name: string;
  username: string;
  bio: string;
  followersCount?: number;
  followingCount?: number;
  hasLink?: boolean;
  showActions?: boolean;
  showStats?: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
};

type ActionButtonProps = {
  label?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  isCircular?: boolean;
  onPress?: () => void;
};

const brandJourney = tokens.gradients.brandJourney as string[];
const avatarGradient: readonly [string, string, string, string] = [
  brandJourney[0] ?? tokens.colors.brand.primary,
  brandJourney[1] ?? tokens.colors.feedback.success,
  brandJourney[2] ?? tokens.colors.feedback.error,
  brandJourney[3] ?? tokens.colors.feedback.warning,
];

function formatCount(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function ActionButton({ label, iconName, isCircular = false, onPress }: ActionButtonProps) {
  const baseClass = isCircular ? 'p-2 rounded-full' : 'h-10 min-w-[88px] rounded-full px-4';

  return (
    <LinearGradient
      colors={avatarGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.buttonGradient}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={`flex-row items-center justify-center border border-surface-borderStrong bg-surface-base active:opacity-75 ${baseClass}`}>
        {iconName ? <Ionicons name={iconName} size={18} color={tokens.colors.text.base} /> : null}
        {label ? <Text className="ml-2 text-sm font-semibold text-text-base">{label}</Text> : null}
      </Pressable>
    </LinearGradient>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <Pressable accessibilityRole="button" className="items-center justify-center rounded-md px-4">
      <Text className="text-lg font-semibold text-text-base">{formatCount(value)}</Text>
      <Text className="text-md text-text-muted">{label}</Text>
    </Pressable>
  );
}

export function ProfileInfo({
  isOwner,
  profileImage,
  name,
  username,
  bio,
  followersCount = 0,
  followingCount = 0,
  hasLink = false,
  showActions = true,
  showStats = true,
  isFollowing: isFollowingProp,
  onFollowToggle,
}: ProfileInfoProps) {
  const [isFollowingLocal, setIsFollowingLocal] = useState(false);
  const isFollowing = isFollowingProp !== undefined ? isFollowingProp : isFollowingLocal;
  const shouldShowActionsRow = showActions || showStats;

  return (
    <View className="px-[10px] pt-[5px]">
      {/* Profile Image + User Info */}
      <View className="flex-row gap-5">
        <View className="h-[93px] w-[93px]">
          {/* expo-linear-gradient tem suporte parcial a NativeWind; usar style nativo evita inconsistencias */}
          <LinearGradient
            colors={avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}>
            <View className="h-full w-full items-center justify-center rounded-full bg-surface-base">
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="h-full w-full rounded-full" />
              ) : (
                <Ionicons name="person" size={36} color={tokens.colors.text.muted} />
              )}
            </View>
          </LinearGradient>
        </View>

        <View className="flex-1">
          <Text className="text-2xl font-bold text-text-base">{name}</Text>
          <Text className="mt-1 text-sm text-text-muted">@{username}</Text>
          <Text className="mt-2 w-full text-sm leading-5 text-text-base" numberOfLines={2}>
            {bio}
          </Text>
        </View>
      </View>
      {/* Action Buttons */}
      {shouldShowActionsRow ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
          contentContainerClassName="pr-2">
          <View className="flex-row items-center gap-3">
            {showStats ? <StatChip label="Seguidores" value={followersCount} /> : null}
            {showStats ? <StatChip label="Seguindo" value={followingCount} /> : null}

            {showActions ? (
              isOwner ? (
                <>
                  {hasLink ? <ActionButton label="Links" iconName="link-outline" /> : null}
                  <ActionButton isCircular iconName="share-social-outline" />
                </>
              ) : (
                <>
                  <ActionButton
                    label={isFollowing ? 'Seguindo' : 'Seguir'}
                    iconName={isFollowing ? 'checkmark' : 'add'}
                    onPress={() => {
                      if (onFollowToggle) {
                        onFollowToggle();
                      } else {
                        setIsFollowingLocal((current) => !current);
                      }
                    }}
                  />
                  {hasLink ? <ActionButton isCircular iconName="link-outline" /> : null}
                  <ActionButton iconName="notifications-outline" isCircular />
                </>
              )
            ) : null}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarGradient: {
    alignItems: 'center',
    borderRadius: 9999,
    height: 93,
    justifyContent: 'center',
    padding: 1.5,
    width: 93,
  },
  buttonGradient: {
    borderRadius: 9999,
    padding: 0.5,
  },
});
