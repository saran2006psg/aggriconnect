export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown | null;
}

/** Shared return shape for all service functions. */
export interface ServiceResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: unknown | null;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function createResponse<T = unknown>(
  success: boolean,
  message: string,
  data: T | null = null,
  errors: unknown | null = null
): ApiResponse<T> {
  return { success, message, data, errors };
}

export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  perPage: number,
  total: number,
  message = 'Success'
): ApiResponse<PaginatedData<T>> {
  return {
    success: true,
    message,
    data: {
      items,
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
    errors: null,
  };
}
