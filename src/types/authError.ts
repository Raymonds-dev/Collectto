export type AuthErrorType =
  | 'NETWORK' // Offline state or network failures
  | 'TIMEOUT' // Backend request timeout
  | 'STORAGE' // SecureStore read/write/delete failures
  | 'PARSING' // Corrupted/unparseable token payload
  | 'UNKNOWN'; // Any other unhandled error

export interface AuthErrorInfo {
  type: AuthErrorType;
  message: string; // User-friendly localized message
  technicalMessage: string; // Original error message (e.g. error.message)
  stack?: string; // Stack trace (non-sensitive)
  timestamp: string; // ISO string of when error occurred
}

export interface RetryState {
  attemptCount: number; // Current retry attempt (0 to 3)
  isRetrying: boolean; // Loading indicator state during retry
  lastAttemptTime?: string; // ISO string of the last retry attempt
}
