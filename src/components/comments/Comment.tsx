/**
 * Comment.tsx
 * Pure display component for a single comment
 * No state, no interaction logic - only presentation
 */

import React from 'react';
import { Image, Text, View } from 'react-native';

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
  return (
    <View className="flex-row gap-3 px-4 py-3">
      {/* Author avatar */}
      <Image
        source={{ uri: comment.authorAvatar }}
        className="h-10 w-10 rounded-full"
        accessibilityLabel={`Avatar de ${comment.authorName}`}
      />

      {/* Comment content */}
      <View className="flex-1">
        {/* Author name and timestamp */}
        <Text
          className="text-text-primary text-sm font-semibold"
          onPress={() => onPressAuthor?.(comment.authorId)}
          accessibilityRole="link"
          accessibilityLabel={`Perfil de ${comment.authorName}`}>
          {comment.authorName}
          <Text className="text-text-secondary ml-2 text-xs font-normal">
            {comment.publishedLabel}
          </Text>
        </Text>

        {/* Comment text */}
        <Text className="text-text-primary mt-1 text-sm" numberOfLines={0}>
          {comment.text}
        </Text>
      </View>
    </View>
  );
};

Comment.displayName = 'Comment';
