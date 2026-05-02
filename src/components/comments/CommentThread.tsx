/**
 * CommentThread.tsx
 * Manages comment thread state and visualization
 * Displays list of comments + input for creating new ones
 */

import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { generateRandomId } from '@/utils/generateRandomId';
import { extractBasePostId } from '@/utils/extractBasePostId';
import { Comment } from './Comment';
import { CommentInput } from './CommentInput';
import { addCommentToPost, getCommentsByPostId } from '@/mocks/comments';
import type { CommentThreadState, Comment as CommentType } from '@/types/comments';

type CommentThreadProps = {
  /** Post ID to fetch comments for */
  postId: string;
  /** Called when user taps author profile */
  onPressAuthor?: (authorId: string) => void;
  /** Called when thread state changes (for animations/callbacks) */
  onStateChange?: (state: CommentThreadState) => void;
};

/**
 * Displays comment thread for a specific feed item
 * Manages comments list, input state, and submission logic
 */
export const CommentThread: React.FC<CommentThreadProps> = ({
  postId,
  onPressAuthor,
  onStateChange,
}) => {
  // Extract base post ID for mock lookups (feed posts have transformed IDs)
  const basePostId = extractBasePostId(postId);

  // Initialize state with mock comments
  const [state, setState] = useState<CommentThreadState>({
    postId,
    comments: getCommentsByPostId(basePostId),
    isLoading: false,
    error: undefined,
    inputText: '',
    isSubmitting: false,
  });

  // Notify parent of state changes
  React.useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Handle comment text input
  const handleChangeText = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      inputText: text,
      error: undefined, // Clear error on new input
    }));
  }, []);

  // Handle comment submission
  const handleSubmit = useCallback(() => {
    const trimmedText = state.inputText.trim();

    // Validation
    if (!trimmedText) {
      setState((prev) => ({
        ...prev,
        error: 'Comentário não pode estar vazio',
      }));
      return;
    }

    if (trimmedText.length > 500) {
      setState((prev) => ({
        ...prev,
        error: 'Comentário muito longo (máximo 500 caracteres)',
      }));
      return;
    }

    // Create new comment (mock)
    const newComment: CommentType = {
      id: generateRandomId(),
      postId,
      authorId: 'current-user', // TODO(auth): Get from auth context
      text: trimmedText,
      createdAt: Date.now(),
      authorName: 'Você', // TODO(auth): Get from auth context
      authorAvatar: 'https://via.placeholder.com/44?text=VOCÊ', // TODO(auth): Get from auth context
      publishedLabel: 'agora',
      isAuthor: true,
    };

    // Update state with optimistic update
    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      comments: [newComment, ...prev.comments], // Add to top
      inputText: '', // Clear input
    }));

    // Simulate network delay
    setTimeout(() => {
      // Add to mock data (use base post ID for mock lookups)
      addCommentToPost(basePostId, newComment);

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }, 300);
  }, [state.inputText, postId, basePostId]);

  return (
    <View className="bg-surface-primary flex-1">
      {/* Loading state */}
      {state.isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="brand-primary" />
        </View>
      )}

      {/* Error state */}
      {state.error && (
        <View className="bg-feedback-error/10 px-4 py-2">
          <Text className="text-sm text-feedback-error">{state.error}</Text>
        </View>
      )}

      {/* Comments list */}
      {!state.isLoading && (
        <FlatList
          data={state.comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Comment comment={item} onPressAuthor={onPressAuthor} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-text-secondary text-center">
                Nenhum comentário ainda.{'\n'}Seja o primeiro a comentar!
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View className="h-2" />}
          scrollEnabled
          nestedScrollEnabled
          accessibilityLabel="Lista de comentários"
        />
      )}

      {/* Comment input */}
      <CommentInput
        value={state.inputText}
        onChangeText={handleChangeText}
        onSubmit={handleSubmit}
        isSubmitting={state.isSubmitting}
        error={state.error}
        placeholder="Escreva um comentário..."
      />
    </View>
  );
};

CommentThread.displayName = 'CommentThread';
