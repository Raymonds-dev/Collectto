/**
 * Session Storage and Restoration Contract
 * 
 * This contract defines the interface and structure for storing,
 * retrieving, and validating JWT authentication tokens.
 * 
 * @see src/services/storage/authSession.ts (Storage implementation)
 * @see src/providers/AuthProvider.tsx (Context and validation implementation)
 */

/**
 * Expected structure of JWT claims decoded from the token payload.
 */
export interface DecodedJwtClaims {
  /** The subject or user identifier */
  sub?: string;
  /** Custom user identifier claim, mapped to user.id */
  userId?: string;
  /** Custom user identifier alias, mapped to user.id */
  uid?: string;
  /** Custom user identifier alias, mapped to user.id */
  id?: string;
  /** User's email, mapped to user.email */
  email?: string;
  /** User's display name, mapped to user.name */
  name?: string;
  /** User's full name, mapped to user.name */
  fullName?: string;
  /** User's handle, mapped to user.username */
  username?: string;
  /** Issued-at time (seconds since UNIX epoch) */
  iat?: number;
  /** Expiration time (seconds since UNIX epoch). Mandatory for expiration validation. */
  exp: number;
}

/**
 * Secure Storage Utility Interface.
 * Encapsulates platform-native secure storage operations using expo-secure-store.
 * All implementations MUST handle platform storage unavailability or hardware
 * enclave errors gracefully by returning null or throwing safe, caught exceptions.
 */
export interface SessionStorageContract {
  /**
   * Retrieves the raw JWT token from secure storage.
   * @returns Promise resolving to the token string if found, or null.
   * @throws Never (must catch internally and return null on platform failure)
   */
  getSessionToken(): Promise<string | null>;

  /**
   * Encrypts and persists the raw JWT token in secure storage.
   * @param token - The raw JWT string.
   * @returns Promise resolving when write completes.
   * @throws Never (must catch internally and degrade to memory-only on platform failure)
   */
  setSessionToken(token: string): Promise<void>;

  /**
   * Removes the JWT token from secure storage.
   * @returns Promise resolving when deletion completes.
   * @throws Never (must catch internally on platform failure)
   */
  clearSessionToken(): Promise<void>;
}

/**
 * Token Validation Functions.
 */
export interface TokenValidationContract {
  /**
   * Validates if the token string matches the standard JWT format:
   * "header.payload.signature" (three base64-encoded segments separated by dots).
   */
  isValidJwtFormat(token: string): boolean;

  /**
   * Decodes the payload segment of a JWT token and returns its JSON claims.
   * @returns The parsed claims, or null if the payload is missing or invalid base64/JSON.
   */
  decodeJwtPayload(token: string): DecodedJwtClaims | null;

  /**
   * Evaluates whether the token is currently expired.
   * @param exp - The UNIX epoch expiration timestamp in seconds.
   * @returns True if current system time is equal to or greater than exp * 1000.
   */
  isTokenExpired(exp: number): boolean;
}
