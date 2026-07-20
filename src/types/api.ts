export interface PaginatedResponse<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number;
  pageable?: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
  };
}
