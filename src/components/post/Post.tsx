import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

import { TeaserComment } from '@/components/comments/TeaserComment';
import { AnimatedPressable, MotionView } from '@/components/ui/animated';
import { ItemCover } from '@/components/ui/ItemCover';
import { buildTeaser } from '@/mocks/comments';
import { extractBasePostId } from '@/utils/extractBasePostId';
import { tokens } from '@/styles/tailwind/tokens.native';
import { useState } from 'react';

export type PostItemPreview = {
  id: string;
  collectionId: string;
  title: string;
  imageUri: string;
};

export type PostAuthor = {
  id: string;
  name: string;
  username: string;
  avatarUri: string;
};

export type PostProps = {
  id: string;
  author: PostAuthor;
  content: string;
  publishedLabel: string;
  item: PostItemPreview;
  isLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  savesCount?: number;
  sharesCount?: number;
  entranceDelay?: number;
  onPressItem: (item: PostItemPreview, postId: string) => void;
  onPressLike?: (postId: string) => void;
  onPressComment?: (postId: string) => void;
  onPressOpenCollection?: (postId: string) => void;
  onPressShare?: (postId: string) => void;
  onPressProfile?: (authorId: string) => void;
};

const brandJourney = tokens.gradients.brandJourney as string[];
const actionButtonGradient: readonly [string, string, string, string] = [
  brandJourney[0] ?? tokens.colors.brand.primary,
  brandJourney[1] ?? tokens.colors.feedback.success,
  brandJourney[2] ?? tokens.colors.feedback.error,
  brandJourney[3] ?? tokens.colors.feedback.warning,
];

type PostActionButtonProps = {
  accessibilityLabel: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  count?: number;
  onPress?: () => void;
};

const PostActionButton = ({ accessibilityLabel, icon, count, onPress }: PostActionButtonProps) => {
  const iconColor = tokens.colors.text.base;

  return (
    <LinearGradient
      colors={actionButtonGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.actionButtonGradient}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        onPress={onPress}
        className="h-[28px] w-[62px] flex-row items-center justify-center gap-1 rounded-md border border-surface-borderStrong bg-surface-base active:opacity-75">
        <Ionicons name={icon} size={16} color={iconColor} />
        {typeof count === 'number' ? (
          <Text className="font-body text-[10px] text-text-base">{count}</Text>
        ) : null}
      </AnimatedPressable>
    </LinearGradient>
  );
};

export const Post = ({
  id,
  author,
  content,
  publishedLabel,
  item,
  isLiked = false,
  likesCount,
  commentsCount,
  sharesCount,
  entranceDelay,
  onPressItem,
  onPressLike,
  onPressComment,
  onPressOpenCollection,
  onPressShare,
  onPressProfile,
}: PostProps) => {
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  return (
    <MotionView visible presets={['slideUp', 'fade']} delay={entranceDelay} className="w-full">
      <View className="w-full rounded-2xl bg-surface-base p-1">
        <AnimatedPressable
          accessibilityRole="link"
          accessibilityLabel={`Ir para perfil de ${author.name}`}
          onPress={() => onPressProfile?.(author.id)}
          className="w-full flex-row items-start gap-2 p-1">
          {avatarLoading ? (
            <View className="h-10 w-10 rounded-full border border-surface-border bg-surface-muted" />
          ) : null}
          {!avatarError ? (
            <Image
              source={{ uri: author.avatarUri }}
              className="h-10 w-10 rounded-full border border-surface-border"
              accessibilityIgnoresInvertColors
              onLoadEnd={() => setAvatarLoading(false)}
              onError={() => {
                setAvatarError(true);
                setAvatarLoading(false);
              }}
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-muted">
              <Ionicons name="person-circle" size={24} color={tokens.colors.text.subtle} />
            </View>
          )}

          <View className="flex-1">
            <View className="w-full flex-row items-center gap-1">
              <Text className="font-poetsenone text-[10px] text-text-base">{author.name}</Text>
              <Text className="font-body text-[8px] font-extralight text-text-subtle">
                @{author.username}
              </Text>
              <Text className="font-poetsenone text-[8px] text-text-subtle">
                - {publishedLabel}
              </Text>
            </View>

            <Text className="font-body text-[11px] leading-[16px] text-text-base">{content}</Text>
          </View>
        </AnimatedPressable>

        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir item ${item.title}`}
          hitSlop={8}
          onPress={() => onPressItem(item, id)}
          className="w-full">
          <View className="h-[357px] w-full">
            <ItemCover images={[item.imageUri]} roundedClass="rounded-[12px]" stackOffset={8} />
          </View>
        </AnimatedPressable>

        {/* Teaser comment section */}
        {(() => {
          const basePostId = extractBasePostId(id);
          const teaserComment = buildTeaser(basePostId);
          if (!teaserComment) return null;

          return <TeaserComment comment={teaserComment} postId={id} onPress={onPressComment} />;
        })()}

        <View className="w-full flex-row items-center justify-center gap-4 px-[10px] py-[6px]">
          <PostActionButton
            accessibilityLabel={isLiked ? 'Descurtir publicacao' : 'Curtir publicacao'}
            icon={isLiked ? 'heart' : 'heart-outline'}
            count={likesCount}
            onPress={() => onPressLike?.(id)}
          />

          <PostActionButton
            accessibilityLabel="Ver comentarios"
            icon="chatbubble-outline"
            count={commentsCount}
            onPress={() => onPressComment?.(id)}
          />

          <PostActionButton
            accessibilityLabel="Ir para o coleção do post"
            icon="document-text-outline"
            onPress={() => onPressOpenCollection?.(id)}
          />

          <PostActionButton
            accessibilityLabel="Compartilhar publicacao"
            icon="share-social-outline"
            count={sharesCount}
            onPress={() => onPressShare?.(id)}
          />
        </View>
      </View>
    </MotionView>
  );
};

const styles = StyleSheet.create({
  actionButtonGradient: {
    borderRadius: 6,
    padding: 0.5,
  },
});
