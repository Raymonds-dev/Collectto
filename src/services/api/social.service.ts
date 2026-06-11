import api from './api';

export interface ExploreCard {
  id: string;
  context: string;
  imageUrls: string[];
  tags: string[];
}

export interface ExploreResponse {
  content: ExploreCard[];
  size: number;
  currentPage: number;
  hasNext: boolean;
}

export const socialService = {
  getExplore: async (page: number, size: number): Promise<ExploreResponse> => {
    return api.get<ExploreResponse>('social/explore', {
      params: { page, size },
    });
  },
};
