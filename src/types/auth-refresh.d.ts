export interface AuthenticationSession {
  accessToken: string;
  expirationTimestamp: number;
  issuedAt: number;
  refreshTimerId: NodeJS.Timeout | null;
}

export interface RefreshAttempt {
  timestamp: string;
  status: 'success' | 'failed' | 'cancelled';
  nextExpirationTime: number | null;
  errorReason: string | null;
}
