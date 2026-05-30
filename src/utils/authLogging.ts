// Pure TypeScript UUID v4 generator to avoid Jest CommonJS/ESM module resolution issues with external packages
const generateUuidV4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
  track<T>(params: LogOperationParams, operation: () => T | Promise<T>): Promise<T>;

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

// Redaction Patterns (from research.md)
const JWT_PATTERN = /(?:Bearer\s+)?eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const BASE64_PATTERN = /(?:Basic\s+)?[A-Za-z0-9+/=]{20,}/gi;
const PASSWORD_PATTERN =
  /(password(?:s)?(?:\s+|[:=]\s*))([a-zA-Z0-9_!@#$%^&*()_+=-{}|[\]\\:";'<>?,./~`]+)/gi;

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'email',
  'authorization',
]);

const USER_ID_KEYS = new Set(['userid', 'user_id', 'uid', 'sub']);

// Simple JavaScript FNV-1a hashing function for user IDs (no native crypto dependency)
const hashUserId = (userId: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < userId.length; i++) {
    hash ^= userId.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
};

/**
 * Implementation of the Sanitizer utility
 */
export const authSanitizer: SanitizerContract = {
  redactText: (text: string): string => {
    if (!text) return text;
    let redacted = text;
    redacted = redacted.replace(JWT_PATTERN, '[REDACTED_JWT]');
    redacted = redacted.replace(EMAIL_PATTERN, '[REDACTED_EMAIL]');
    redacted = redacted.replace(BASE64_PATTERN, '[REDACTED_CREDENTIALS]');
    redacted = redacted.replace(PASSWORD_PATTERN, '$1[REDACTED]');
    return redacted;
  },

  redactObject: (obj: unknown): unknown => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return authSanitizer.redactText(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => authSanitizer.redactObject(item));
    }

    if (typeof obj === 'object') {
      const redactedObj: Record<string, unknown> = {};
      const record = obj as Record<string, unknown>;
      for (const key of Object.keys(record)) {
        const lowerKey = key.toLowerCase();
        const val = record[key];

        if (SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(lowerKey)) {
          redactedObj[key] = '[REDACTED]';
        } else if (USER_ID_KEYS.has(lowerKey)) {
          redactedObj[key] =
            typeof val === 'string' || typeof val === 'number'
              ? `hashed_${hashUserId(String(val))}`
              : authSanitizer.redactObject(val);
        } else {
          redactedObj[key] = authSanitizer.redactObject(val);
        }
      }
      return redactedObj;
    }

    return obj;
  },
};

/**
 * Extract and sanitize errors
 */
const extractSanitizedError = (error: unknown): string | null => {
  if (!error) return null;

  if (error instanceof Error) {
    const redactedMessage = authSanitizer.redactText(error.message);
    const redactedStack = error.stack ? authSanitizer.redactText(error.stack) : '';
    return redactedStack ? `${redactedMessage}\n${redactedStack}` : redactedMessage;
  }

  if (typeof error === 'object') {
    try {
      const redactedObj = authSanitizer.redactObject(error);
      return JSON.stringify(redactedObj, null, 2);
    } catch {
      return authSanitizer.redactText(String(error));
    }
  }

  return authSanitizer.redactText(String(error));
};

/**
 * In-memory buffer representing a FIFO queue
 */
class LogBuffer {
  private buffer: AuthLog[] = [];
  private readonly maxCapacity = 100;

  add(log: AuthLog): void {
    if (this.buffer.length >= this.maxCapacity) {
      this.buffer.shift(); // Evict oldest
    }
    this.buffer.push(log);
  }

  getLogs(): AuthLog[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }

  find(id: string): AuthLog | undefined {
    return this.buffer.find((log) => log.id === id);
  }
}

/**
 * Central AuthLogger implementation
 */
class AuthLogger implements AuthLoggerContract {
  private buffer = new LogBuffer();
  private activeOperations = new Map<string, number>();

  startOperation(params: LogOperationParams): string {
    const id = generateUuidV4();
    const newLog: AuthLog = {
      id,
      timestamp: new Date().toISOString(),
      module: params.module,
      action: params.action,
      status: 'pending',
      errorType: null,
      duration: null,
      retryCount: params.retryCount ?? null,
      severity: 'info',
      sanitizedError: null,
    };

    // Store start time
    this.activeOperations.set(id, Date.now());

    // Store in circular buffer
    this.buffer.add(newLog);

    return id;
  }

  completeOperation(params: CompleteOperationParams): void {
    const startTime = this.activeOperations.get(params.id);
    if (startTime === undefined) {
      // Operation not found or already completed
      return;
    }

    // Clean up active operation
    this.activeOperations.delete(params.id);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Find the log entry in our buffer to update it
    const log = this.buffer.find(params.id);
    if (!log) {
      return;
    }

    log.status = params.status;
    log.duration = duration;

    if (params.status === 'success') {
      log.severity = duration >= 1000 ? 'warn' : 'info';
    } else {
      log.severity = 'error';
      log.errorType = params.errorType ?? 'unknown_error';
      log.sanitizedError = extractSanitizedError(params.error);
    }
  }

  async track<T>(params: LogOperationParams, operation: () => T | Promise<T>): Promise<T> {
    const id = this.startOperation(params);
    try {
      const result = await operation();
      this.completeOperation({
        id,
        status: 'success',
      });
      return result;
    } catch (error) {
      this.completeOperation({
        id,
        status: 'failed',
        errorType: error instanceof Error ? error.name : 'unknown_error',
        error,
      });
      throw error;
    }
  }

  getLogs(): AuthLog[] {
    return this.buffer.getLogs();
  }

  clearLogs(): void {
    this.buffer.clear();
    this.activeOperations.clear();
  }
}

// Export singleton instance
export const authLogger: AuthLoggerContract = new AuthLogger();
