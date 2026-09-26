import { Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { ItemCollection } from '@/components/item-collection/ItemCollection';
import { ProfileActionsBar } from '@/components/profile-actions-bar/ProfileActionsBar';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { ProfileSectionDivider } from '@/components/profile-section-divider/ProfileSectionDivider';

type ItemCharacteristic = {
  label: string;
  value: string;
};

type CollectionItemDetail = {
  title: string;
  images: string[];
  acquiredDate: string;
  lastUsedDate: string;
  description: string;
  characteristics: ItemCharacteristic[];
};

type CollectionItemDetailProfile = {
  name: string;
  username: string;
  bio: string;
  profileImage: string | null;
};

type CollectionItemDetailViewProps = {
  isOwner: boolean;
  profile: CollectionItemDetailProfile;
  isFollowing: boolean;
  isNotificationsEnabled: boolean;
  item: CollectionItemDetail;
  onFollowToggle: () => void;
  onShare: () => void;
  onNotificationPress: () => void;
  onPressProfile?: () => void;
  contentContainerClassName?: string;
};

export const CollectionItemDetailView = ({
  isOwner,
  profile,
  isFollowing,
  isNotificationsEnabled,
  item,
  onFollowToggle,
  onShare,
  onNotificationPress,
  onPressProfile,
  contentContainerClassName = 'pb-8',
}: CollectionItemDetailViewProps) => {
  const { height } = useWindowDimensions();
  const scrollY = useSharedValue(0);
  const collapseDistance = Math.max(height * 0.3, 180);

  const collapseScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerMotionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, collapseDistance * 0.45, collapseDistance],
      [1, 0.45, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, collapseDistance],
      [0, -28],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const itemMotionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, collapseDistance],
      [0.92, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, collapseDistance],
      [20, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [0, collapseDistance],
      [0.986, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <Animated.ScrollView
      className="flex-1"
      contentContainerClassName={contentContainerClassName}
      onScroll={collapseScrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}>
      <Animated.View style={headerMotionStyle}>
        <Pressable
          onPress={onPressProfile}
          accessibilityRole="link"
          accessibilityLabel={`Ir para perfil de ${profile.name}`}>
          <ProfileInfo
            isOwner={isOwner}
            profileImage={profile.profileImage}
            name={profile.name}
            username={profile.username}
            bio={profile.bio}
            showActions={false}
            showStats={false}
          />
        </Pressable>

        <ProfileActionsBar
          isOwner={isOwner}
          isFollowing={isFollowing}
          isNotificationsEnabled={isNotificationsEnabled}
          onFollowToggle={onFollowToggle}
          onShare={onShare}
          onNotificationPress={onNotificationPress}
        />
      </Animated.View>

      <ProfileSectionDivider />

      <Animated.View style={itemMotionStyle}>
        <Animated.View className="rounded-t-full bg-surface-base">
          <ItemCollection
            title={item.title}
            images={item.images}
            acquiredDate={item.acquiredDate}
            lastUsedDate={item.lastUsedDate}
            description={item.description}
            characteristics={item.characteristics}
          />
        </Animated.View>
      </Animated.View>
    </Animated.ScrollView>
  );
};
