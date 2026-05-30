export type ErrorContext = 'login' | 'signup' | 'profile_update' | 'generic';

export type ErrorCategory =
  | 'VALIDATION'
  | 'AUTH'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'SERVER'
  | 'UNKNOWN';

export interface MappedError {
  /** User-friendly Brazilian Portuguese error message */
  message: string;

  /** Category of the error for programmatic handling in UI */
  category: ErrorCategory;

  /** Field-level errors mapping field names to specific messages (for form validation) */
  fieldErrors?: Record<string, string>;

  /** Flag showing if user can retry the operation */
  retryable: boolean;

  /** Duration in seconds to wait before retrying (parsed from Retry-After header) */
  retryAfter?: number;

  /** A unique diagnostic code for support tracking */
  code: string;
}

export interface ApiErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  field?: string;
  details?: {
    field: string;
    message: string;
  }[];
}
