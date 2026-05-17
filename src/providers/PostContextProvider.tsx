import React, { createContext, useContext, useMemo } from 'react';
import { mockPostService, type PostService } from '@/services/debug';

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
      postService: mockPostService,
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
