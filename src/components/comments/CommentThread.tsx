/**
 * CommentThread.tsx
 * Manages comment thread state and visualization
 * Displays list of comments + input for creating new ones
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';

import { Comment } from './Comment';
import { CommentInput } from './CommentInput';
import { usePostService } from '@/providers/PostContextProvider';
import { useAuth } from '@/hooks/useAuth';
import { tokens } from '@/styles/tailwind/tokens.native';
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
  const postService = usePostService();
  const { user } = useAuth();

  // Initialize state
  const [state, setState] = useState<CommentThreadState>({
    postId,
    comments: [],
    isLoading: true,
    error: undefined,
    inputText: '',
    isSubmitting: false,
  });

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Load comments
  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const comments = await postService.getComments(postId);
        if (isMounted) {
          setState((prev) => ({ ...prev, comments, isLoading: false }));
        }
      } catch {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Erro ao carregar comentários',
          }));
        }
      }
    };
    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [postId, postService]);

  // Handle comment text input
  const handleChangeText = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      inputText: text,
      error: undefined, // Clear error on new input
    }));
  }, []);

  // Handle comment submission
  const handleSubmit = useCallback(async () => {
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

    // Create a temporary local comment for instant visual response
    const tempComment: CommentType = {
      id: `temp-${Date.now()}`,
      postId,
      authorId: user?.id || 'current-user',
      text: trimmedText,
      createdAt: Date.now(),
      authorName: user?.username || 'Você',
      authorAvatar: user?.profilePictureUrl || 'https://via.placeholder.com/44?text=VOCÊ',
      publishedLabel: 'agora',
      isAuthor: true,
    };

    // Update state with optimistic update and clear input
    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      comments: [tempComment, ...prev.comments],
      inputText: '',
    }));

    try {
      const realComment = await postService.createComment(postId, trimmedText);
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        comments: prev.comments.map((c) => (c.id === tempComment.id ? realComment : c)),
      }));
    } catch (err) {
      console.error('Failed to post comment, reverting:', err);
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        comments: prev.comments.filter((c) => c.id !== tempComment.id),
        inputText: trimmedText, // Restore typed text
        error: 'Erro ao enviar comentário. Tente novamente.',
      }));
    }
  }, [state.inputText, postId, postService, user]);

  // Handle comment deletion with confirmation
  const handleDeleteComment = useCallback(
    (commentId: string) => {
      Alert.alert(
        'Excluir Comentário',
        'Tem certeza que deseja excluir seu comentário?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              const originalComments = [...state.comments];

              // Optimistic deletion
              setState((prev) => ({
                ...prev,
                comments: prev.comments.filter((c) => c.id !== commentId),
              }));

              try {
                await postService.deleteComment(postId, commentId);
              } catch (err) {
                console.error('Failed to delete comment, reverting:', err);
                setState((prev) => ({
                  ...prev,
                  comments: originalComments,
                  error: 'Erro ao excluir comentário. Tente novamente.',
                }));
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [postId, postService, state.comments]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 0}
      style={{ flex: 1 }}>
      <View className="bg-surface-primary flex-1">
        {/* Loading state */}
        {state.isLoading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={tokens.colors.brand.primary} />
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
            renderItem={({ item }) => (
              <Comment
                comment={item}
                onPressAuthor={onPressAuthor}
                onDelete={handleDeleteComment}
              />
            )}
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
    </KeyboardAvoidingView>
  );
};

CommentThread.displayName = 'CommentThread';
