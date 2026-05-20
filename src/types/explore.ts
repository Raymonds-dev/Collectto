import type { ImageSourcePropType } from 'react-native';

export type ExploreCategory = {
  id: string;
  label: string;
};

export type ExploreSpotlightType = 'collection' | 'item';

export interface ExploreAuthorSummary {
  id: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
}

// Payload vindo da API quando já temos URLs remotas.
export interface ExploreSpotlightResponse {
  id: string;
  postType: ExploreSpotlightType;
  title: string;
  subtitle?: string;
  caption?: string;
  postedBy: ExploreAuthorSummary | string;
  postedAt: string;
  images: string[];
  tags: string[];
  categoryId: string;
  collectionId?: string;
  itemId?: string;
  height?: number;
}

// Modelo usado na tela Explore. Aceita imagens remotas ou locais.
export interface ExploreSpotlight {
  id: string;
  postType: ExploreSpotlightType;
  title: string;
  subtitle?: string;
  caption?: string;
  postedBy: string;
  postedById?: string;
  postedAt: string;
  images: ImageSourcePropType[];
  tags: string[];
  categoryId: string;
  collectionId?: string;
  itemId?: string;
  height?: number;
}

export interface ExploreSpotlightsPageResponse {
  items: ExploreSpotlightResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface ExploreFeedQuery {
  q?: string;
  categoryId?: string;
  postType?: ExploreSpotlightType;
  page?: number;
  size?: number;
}

export type ExploreCategoriesResponse = ExploreCategory[];

export const REQUIRED_SPOTLIGHT_FIELDS = ['id', 'title', 'postType', 'images', 'categoryId'];
