export interface BaseResponse<T = any> {
  success?: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends BaseResponse<PaginatedData<T>> {}

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from?: number;
  to?: number;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}

export interface SocialLinks {
  twitter: string | null;
  facebook: string | null;
  instagram: string | null;
}
