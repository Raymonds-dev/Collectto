import React, { createContext, useContext, useMemo } from 'react';
import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockPostService } from '@/services/debug/mockPostService';
import { apiPostService } from '@/services/api/postService';
import type { PostService } from '@/types/posts';

interface PostContextValue {
  postService: PostService;
}

const PostContext = createContext<PostContextValue | undefined>(undefined);

interface PostContextProviderProps {
  children: React.ReactNode;
}

export const PostContextProvider = ({ children }: PostContextProviderProps) => {
  const value = useMemo<PostContextValue>(
    () => ({
      postService: isDebugModeEnabled() ? mockPostService : apiPostService,
    }),
    []
  );

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

export const usePostService = (): PostService => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostService must be used within PostContextProvider');
  }
  return context.postService;
};
