export interface DecodedJwtClaims {
  sub?: string;
  userId?: string;
  uid?: string;
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  username?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  iat?: number;
  exp: number;
}

export const isValidJwtFormat = (token: string): boolean => {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.trim().length > 0);
};

export const isTokenExpired = (exp: number): boolean => {
  return Date.now() >= exp * 1000;
};

export const decodeBase64Url = (value: string): string | null => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(paddingLength);

    if (typeof globalThis.atob !== 'function') {
      return null;
    }

    return globalThis.atob(padded);
  } catch {
    return null;
  }
};

export const decodeJwtPayload = (token: string): DecodedJwtClaims | null => {
  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  const decodedPayload = decodeBase64Url(parts[1]);

  if (!decodedPayload) {
    return null;
  }

  try {
    const claims = JSON.parse(decodedPayload);
    if (!claims || typeof claims !== 'object' || typeof claims.exp !== 'number') {
      return null;
    }
    return claims as DecodedJwtClaims;
  } catch {
    return null;
  }
};

export const resolveUserIdFromToken = (token: string): string | null => {
  const claims = decodeJwtPayload(token);

  if (!claims) {
    return null;
  }

  const isUuid = (val: string): boolean =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

  if (typeof claims.userId === 'string' && claims.userId.length > 0 && isUuid(claims.userId)) {
    return claims.userId;
  }

  if (typeof claims.uid === 'string' && claims.uid.length > 0 && isUuid(claims.uid)) {
    return claims.uid;
  }

  if (typeof claims.id === 'string' && claims.id.length > 0 && isUuid(claims.id)) {
    return claims.id;
  }

  if (typeof claims.sub === 'string' && claims.sub.length > 0 && isUuid(claims.sub)) {
    return claims.sub;
  }

  return null;
};
