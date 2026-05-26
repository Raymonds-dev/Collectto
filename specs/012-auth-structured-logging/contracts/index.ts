export type LogSeverity = 'info' | 'warn' | 'error';
export type LogStatus = 'pending' | 'success' | 'failed';

/**
 * Represents a structured log entry for authentication events.
 */
export interface AuthLog {
  id: string; // Unique ID (UUID v4)
  timestamp: string; // ISO 8601 string
  module: string; // Module/service name (e.g. 'AuthProvider')
  action: string; // Action name (e.g. 'signIn')
  status: LogStatus; // Status of the operation
  errorType: string | null; // Classification of the error (e.g. 'network_timeout')
  duration: number | null; // Duration in milliseconds
  retryCount: number | null; // Retry attempt index (if applicable)
  severity: LogSeverity; // Severity level
  sanitizedError: string | null; // Sanitized error text/stack
}

/**
 * Parameter interface for starting/logging an operation.
 */
export interface LogOperationParams {
  module: string;
  action: string;
  retryCount?: number;
}

/**
 * Parameter interface for logging operation completion.
 */
export interface CompleteOperationParams {
  id: string;
  status: 'success' | 'failed';
  errorType?: string;
  error?: unknown;
}

/**
 * AuthLogger Singleton utility contract.
 */
export interface AuthLoggerContract {
  /**
   * Starts timing and logs a pending operation.
   * Returns the unique log ID to be used when completing the operation.
   */
  startOperation(params: LogOperationParams): string;

  /**
   * Completes an active timed operation, computes its duration,
   * performs redaction, and stores the final result.
   */
  completeOperation(params: CompleteOperationParams): void;

  /**
   * Helper method to run a synchronous or asynchronous function with automatic timing and logging.
   */
  track<T>(
    params: LogOperationParams,
    operation: () => T | Promise<T>
  ): Promise<T>;

  /**
   * Retrieves the current list of logs from the buffer (in chronological order).
   */
  getLogs(): AuthLog[];

  /**
   * Clears all log entries from the in-memory buffer.
   */
  clearLogs(): void;
}

/**
 * Redaction utility function contract.
 */
export interface SanitizerContract {
  /**
   * Scans a target string for sensitive data (tokens, PII, etc.)
   * and replaces them with standard redaction tokens.
   */
  redactText(text: string): string;

  /**
   * Recursively clones and redacts sensitive keys and values inside an object or array.
   */
  redactObject(obj: unknown): unknown;
}
