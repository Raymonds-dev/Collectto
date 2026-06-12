/**
 * Comment.tsx
 * Pure display component for a single comment
 * No state, no interaction logic - only presentation
 */

import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { tokens } from '@/styles/tailwind/tokens.native';
import type { Comment as CommentType } from '@/types/comments';
import { AnimatedPressable } from '@/components/ui/animated';

type CommentProps = {
  comment: CommentType;
  /** Optional callback for tapping author profile */
  onPressAuthor?: (authorId: string) => void;
  /** Callback for deleting comment */
  onDelete?: (commentId: string) => void;
};

/**
 * Displays a single comment with author avatar, name, text, and timestamp
 * Pure presentation component - no state management
 */
export const Comment = ({ comment, onPressAuthor, onDelete }: CommentProps) => {
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  return (
    <View className="flex-row gap-3 px-4 py-3">
      {avatarLoadError ? (
        <View className="h-10 w-10 items-center justify-center rounded-full">
          <Ionicons name="person-circle" size={38} color={tokens.colors.text.subtle} />
        </View>
      ) : (
        <Image
          source={{ uri: comment.authorAvatar }}
          className="h-10 w-10 rounded-full"
          accessibilityLabel={`Avatar de ${comment.authorName}`}
          onError={() => setAvatarLoadError(true)}
        />
      )}

      {/* Comment content */}
      <View className="flex-1">
        {/* Author name and timestamp */}
        <View className="flex-row items-center gap-2">
          <Text
            style={styles.authorName}
            onPress={() => onPressAuthor?.(comment.authorId)}
            accessibilityRole="link"
            accessibilityLabel={`Perfil de ${comment.authorName}`}>
            {comment.authorName}
          </Text>
          <Text className="font-body text-xs text-text-subtle">{comment.publishedLabel}</Text>
        </View>

        {/* Comment text */}
        <Text className="mt-1 font-body text-sm text-text-base" numberOfLines={0}>
          {comment.text}
        </Text>
      </View>

      {comment.isAuthor && (
        <View className="items-center justify-center">
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Excluir comentário"
            onPress={() => onDelete?.(comment.id)}
            className="h-8 w-8 items-center justify-center rounded-full"
            hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={tokens.colors.feedback.error} />
          </AnimatedPressable>
        </View>
      )}
    </View>
  );
};

Comment.displayName = 'Comment';

const styles = StyleSheet.create({
  authorName: {
    color: tokens.colors.text.base,
    fontFamily: tokens.fontFamily.logo[0],
    fontSize: 14,
    fontWeight: '600',
  },
});
