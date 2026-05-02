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

type CommentProps = {
  comment: CommentType;
  /** Optional callback for tapping author profile */
  onPressAuthor?: (authorId: string) => void;
};

/**
 * Displays a single comment with author avatar, name, text, and timestamp
 * Pure presentation component - no state management
 */
export const Comment = ({ comment, onPressAuthor }: CommentProps) => {
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  return (
    <View className="flex-row gap-3 px-4 py-3">
      {avatarLoadError ? (
        <View className="items-center justify-center w-10 h-10 rounded-full">
          <Ionicons name="person-circle" size={38} color={tokens.colors.text.subtle} />
        </View>
      ) : (
        <Image
          source={{ uri: comment.authorAvatar }}
          className="w-10 h-10 rounded-full"
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
          <Text className="text-xs font-body text-text-subtle">{comment.publishedLabel}</Text>
        </View>

        {/* Comment text */}
        <Text className="mt-1 text-sm font-body text-text-base" numberOfLines={0}>
          {comment.text}
        </Text>
      </View>
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
