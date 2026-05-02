import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { AnimatedPressable } from '@/components/ui/animated';
import { tokens } from '@/styles/tailwind/tokens.native';
import type { Comment } from '@/types/comments';

type TeaserCommentProps = {
  comment: Comment;
  postId: string;
  onPress?: (postId: string) => void;
};

export const TeaserComment: React.FC<TeaserCommentProps> = ({ comment, postId, onPress }) => {
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Comentário de ${comment.authorName}: ${comment.text}`}
      hitSlop={8}
      onPress={() => onPress?.(postId)}
      className="w-full px-[10px] py-[8px]">
      <View className="rounded-lg border border-surface-border bg-surface-muted px-3 py-2">
        <View className="mb-2 flex-row items-center gap-2">
          {avatarLoadError ? (
            <View className="h-6 w-6 items-center justify-center rounded-full bg-surface-muted">
              <Ionicons name="person-circle" size={23} color={tokens.colors.text.subtle} />
            </View>
          ) : (
            <Image
              source={{ uri: comment.authorAvatar }}
              className="h-6 w-6 rounded-full"
              accessibilityIgnoresInvertColors
              onError={() => setAvatarLoadError(true)}
            />
          )}
          <View className="flex-1 flex-row items-center gap-1">
            <Text style={styles.teaserAuthorName} className="text-text-base">
              {comment.authorName}
            </Text>
            <Text className="font-body text-[8px] text-text-subtle">{comment.publishedLabel}</Text>
          </View>
        </View>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          className="font-body text-[11px] leading-[12px] text-text-base">
          {comment.text}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  teaserAuthorName: {
    fontFamily: tokens.fontFamily.logo[0],
    fontSize: 10,
    fontWeight: '600',
  },
});
